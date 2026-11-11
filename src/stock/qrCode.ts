import * as QRCode from 'qrcode'

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export interface QrErrorCorrectionOption {
  id: QrErrorCorrectionLevel
  label: string
  hint: string
}

/** Níveis de correção de erro / redundância do QR Code. */
export const qrErrorCorrectionOptions: QrErrorCorrectionOption[] = [
  { id: 'L', label: 'L', hint: '~7% de recuperação' },
  { id: 'M', label: 'M', hint: '~15% de recuperação' },
  { id: 'Q', label: 'Q', hint: '~25% de recuperação' },
  { id: 'H', label: 'H', hint: '~30% de recuperação' },
]

export interface QrCodeRenderOptions {
  size?: number
  margin?: number
  darkColor?: string
  lightColor?: string
  errorCorrectionLevel?: QrErrorCorrectionLevel
}

export async function generateQrCodeDataUrl(
  text: string,
  options: QrCodeRenderOptions = {},
): Promise<string> {
  const content = text.trim()
  if (!content) {
    throw new Error('Informe um texto para gerar o QR Code.')
  }

  return QRCode.toDataURL(content, {
    errorCorrectionLevel: options.errorCorrectionLevel ?? 'M',
    margin: options.margin ?? 2,
    width: options.size ?? 512,
    color: {
      dark: options.darkColor ?? '#111111',
      light: options.lightColor ?? '#ffffff',
    },
  })
}

export function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName
  link.click()
}
