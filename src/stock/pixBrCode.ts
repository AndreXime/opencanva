/**
 * Monta payload Pix Copia e Cola (BR Code / EMV QRCPS-MPM)
 * conforme Manual de Padrões para Iniciação do Pix (BACEN).
 */

export interface PixStaticPayloadInput {
  key: string
  merchantName: string
  /** Obrigatório no BR Code. Se omitido, usa um padrão genérico. */
  merchantCity?: string | null
  amount?: number | null
  description?: string | null
  txid?: string | null
}

/** Usado quando o usuário não informa cidade (comum em geradores web). */
export const DEFAULT_PIX_MERCHANT_CITY = 'BRASIL'

export class PixPayloadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PixPayloadError'
  }
}

function tlv(id: string, value: string): string {
  const length = String(value.length).padStart(2, '0')
  return `${id}${length}${value}`
}

/** Remove acentos e limita a ASCII imprimível. */
export function toEmvText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\x20-\x7E]/g, '')
    .trim()
}

/** CRC-16/CCITT-FALSE (polinômio 0x1021, init 0xFFFF). */
export function crc16CcittFalse(text: string): string {
  let crc = 0xffff
  for (let index = 0; index < text.length; index += 1) {
    crc ^= text.charCodeAt(index) << 8
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/**
 * Normaliza chave Pix comum:
 * - telefone → +55…
 * - e-mail / EVP → minúsculas
 * - CPF/CNPJ → só dígitos
 */
export function normalizePixKey(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) {
    throw new PixPayloadError('Informe a chave Pix.')
  }

  if (trimmed.includes('@')) {
    return trimmed.toLowerCase()
  }

  const digits = trimmed.replace(/\D/g, '')
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      trimmed,
    )
  ) {
    return trimmed.toLowerCase()
  }

  if (digits.length === 11 && !trimmed.includes('+')) {
    // Pode ser CPF ou telefone nacional sem DDI.
    // Telefone celular costuma começar com DDD + 9.
    const looksLikePhone = /^[1-9]{2}9\d{8}$/.test(digits)
    if (looksLikePhone) {
      return `+55${digits}`
    }
    return digits
  }

  if (digits.length === 14) {
    return digits
  }

  if (digits.length === 12 || digits.length === 13) {
    // 55 + DDD + número
    if (digits.startsWith('55')) {
      return `+${digits}`
    }
  }

  if (trimmed.startsWith('+')) {
    return `+${digits}`
  }

  return trimmed
}

function formatAmount(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new PixPayloadError('Valor inválido. Use um número maior que zero.')
  }
  const formatted = amount.toFixed(2)
  if (formatted.length > 13) {
    throw new PixPayloadError('Valor acima do limite do BR Code.')
  }
  return formatted
}

function normalizeTxid(txid: string | null | undefined): string {
  const value = (txid ?? '***').trim() || '***'
  if (value === '***') {
    return value
  }
  if (!/^[A-Za-z0-9]{1,25}$/.test(value)) {
    throw new PixPayloadError(
      'TxID inválido. Use até 25 letras/números, ou deixe *** .',
    )
  }
  return value
}

/** Gera o payload estático do Pix (reutilizável). */
export function buildPixStaticPayload(input: PixStaticPayloadInput): string {
  const key = normalizePixKey(input.key)
  const merchantName = toEmvText(input.merchantName).slice(0, 25)
  const merchantCity = toEmvText(
    input.merchantCity?.trim() || DEFAULT_PIX_MERCHANT_CITY,
  ).slice(0, 15)
  const description = input.description
    ? toEmvText(input.description)
    : ''
  const txid = normalizeTxid(input.txid)

  if (!merchantName) {
    throw new PixPayloadError('Informe o nome do recebedor.')
  }
  if (!merchantCity) {
    throw new PixPayloadError('Cidade do recebedor inválida.')
  }

  let merchantAccount = tlv('00', 'br.gov.bcb.pix') + tlv('01', key)
  if (description) {
    const maxDescription = 99 - merchantAccount.length - 4
    if (maxDescription < 1) {
      throw new PixPayloadError('Chave Pix muito longa para incluir descrição.')
    }
    merchantAccount += tlv('02', description.slice(0, maxDescription))
  }
  if (merchantAccount.length > 99) {
    throw new PixPayloadError('Dados da conta Pix excedem o limite do BR Code.')
  }

  let payload = ''
  payload += tlv('00', '01')
  payload += tlv('26', merchantAccount)
  payload += tlv('52', '0000')
  payload += tlv('53', '986')
  if (input.amount !== null && input.amount !== undefined && input.amount !== 0) {
    payload += tlv('54', formatAmount(input.amount))
  }
  payload += tlv('58', 'BR')
  payload += tlv('59', merchantName)
  payload += tlv('60', merchantCity)
  payload += tlv('62', tlv('05', txid))
  payload += '6304'
  return payload + crc16CcittFalse(payload)
}
