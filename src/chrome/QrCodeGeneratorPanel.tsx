import { useEffect, useMemo, useState } from 'react'
import { Copy, Download, ImagePlus, QrCode } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import {
  buildPixStaticPayload,
  PixPayloadError,
} from '../stock/pixBrCode'
import {
  downloadDataUrl,
  generateQrCodeDataUrl,
  qrErrorCorrectionOptions,
  type QrErrorCorrectionLevel,
} from '../stock/qrCode'
import { ColorField } from './ColorField'
import { btnGhost, btnPrimary, fieldControl, fieldLabel } from './ui'

const SIZE_OPTIONS = [256, 512, 1024] as const
type GeneratorMode = 'text' | 'pix'

export function QrCodeGeneratorPanel() {
  const addImage = useEditorStore((state) => state.addImage)
  const [mode, setMode] = useState<GeneratorMode>('text')
  const [content, setContent] = useState('https://')
  const [pixKey, setPixKey] = useState('')
  const [merchantName, setMerchantName] = useState('')
  const [amountText, setAmountText] = useState('')
  const [description, setDescription] = useState('')
  const [darkColor, setDarkColor] = useState('#111111')
  const [lightColor, setLightColor] = useState('#ffffff')
  const [size, setSize] = useState<(typeof SIZE_OPTIONS)[number]>(512)
  const [errorCorrection, setErrorCorrection] =
    useState<QrErrorCorrectionLevel>('M')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [payload, setPayload] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const selectedCorrection =
    qrErrorCorrectionOptions.find((item) => item.id === errorCorrection) ??
    qrErrorCorrectionOptions[1]

  const encodedText = useMemo(() => {
    if (mode === 'text') {
      return content.trim()
    }
    if (!pixKey.trim() || !merchantName.trim()) {
      return ''
    }
    try {
      const amountRaw = amountText.trim().replace(',', '.')
      const amount = amountRaw === '' ? null : Number(amountRaw)
      if (amountRaw !== '' && !Number.isFinite(amount)) {
        throw new PixPayloadError('Valor inválido.')
      }
      return buildPixStaticPayload({
        key: pixKey,
        merchantName,
        amount,
        description: description.trim() || null,
        txid: '***',
      })
    } catch (err) {
      if (err instanceof PixPayloadError) {
        return { error: err.message }
      }
      return { error: 'Não foi possível montar o Pix.' }
    }
  }, [mode, content, pixKey, merchantName, amountText, description])

  useEffect(() => {
    if (typeof encodedText === 'object') {
      setPreviewUrl(null)
      setPayload(null)
      setError(encodedText.error)
      setBusy(false)
      return
    }

    if (!encodedText) {
      setPreviewUrl(null)
      setPayload(null)
      setError(null)
      setBusy(false)
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      setBusy(true)
      void generateQrCodeDataUrl(encodedText, {
        size,
        darkColor,
        lightColor,
        errorCorrectionLevel: errorCorrection,
      })
        .then((url) => {
          if (cancelled) {
            return
          }
          setPreviewUrl(url)
          setPayload(encodedText)
          setError(null)
        })
        .catch(() => {
          if (cancelled) {
            return
          }
          setPreviewUrl(null)
          setPayload(null)
          setError('Não foi possível gerar este QR Code.')
        })
        .finally(() => {
          if (!cancelled) {
            setBusy(false)
          }
        })
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [encodedText, darkColor, lightColor, size, errorCorrection])

  const canUse = Boolean(previewUrl) && !busy

  const handleAddToPage = () => {
    if (!previewUrl) {
      return
    }
    addImage(previewUrl, size, size)
  }

  const handleDownload = () => {
    if (!previewUrl) {
      return
    }
    downloadDataUrl(
      previewUrl,
      mode === 'pix' ? `pix-qrcode-${size}.png` : `qrcode-${size}.png`,
    )
  }

  const handleCopyPayload = async () => {
    if (!payload) {
      return
    }
    try {
      await navigator.clipboard.writeText(payload)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setError('Não foi possível copiar o Pix Copia e Cola.')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2 rounded-xl border border-editor-border bg-editor-muted px-3 py-2.5">
        <QrCode className="mt-0.5 shrink-0 text-editor-accent" size={18} />
        <p className="m-0 text-xs leading-relaxed text-editor-subtle">
          QR de Pix usa o padrão BR Code do Banco Central (não é só o texto da
          chave). No modo texto, qualquer conteúdo livre continua válido.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
            mode === 'text'
              ? 'bg-editor-accent text-white'
              : 'bg-editor-muted text-editor-text hover:bg-editor-accent-soft'
          }`}
          onClick={() => setMode('text')}
        >
          Texto / URL
        </button>
        <button
          type="button"
          className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
            mode === 'pix'
              ? 'bg-editor-accent text-white'
              : 'bg-editor-muted text-editor-text hover:bg-editor-accent-soft'
          }`}
          onClick={() => setMode('pix')}
        >
          Pix
        </button>
      </div>

      {mode === 'text' ? (
        <div className="flex flex-col gap-1.5">
          <label className={fieldLabel} htmlFor="qr-content">
            Conteúdo
          </label>
          <textarea
            id="qr-content"
            className={`${fieldControl} min-h-[96px] resize-y`}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="https://seusite.com"
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel} htmlFor="pix-key">
              Chave Pix
            </label>
            <input
              id="pix-key"
              className={fieldControl}
              value={pixKey}
              onChange={(event) => setPixKey(event.target.value)}
              placeholder="CPF, CNPJ, e-mail, telefone ou aleatória"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel} htmlFor="pix-name">
              Nome do recebedor
            </label>
            <input
              id="pix-name"
              className={fieldControl}
              value={merchantName}
              onChange={(event) => setMerchantName(event.target.value)}
              placeholder="Até 25 caracteres"
              maxLength={40}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel} htmlFor="pix-amount">
              Valor (opcional)
            </label>
            <input
              id="pix-amount"
              className={fieldControl}
              inputMode="decimal"
              value={amountText}
              onChange={(event) => setAmountText(event.target.value)}
              placeholder="Ex.: 19,90"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel} htmlFor="pix-description">
              Descrição (opcional)
            </label>
            <input
              id="pix-description"
              className={fieldControl}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Aparece no extrato do pagador"
            />
          </div>
        </>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ColorField
          id="qr-dark"
          label="Cor do QR"
          value={darkColor}
          onChange={setDarkColor}
        />
        <ColorField
          id="qr-light"
          label="Fundo"
          value={lightColor}
          onChange={setLightColor}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={fieldLabel}>Tamanho</span>
        <div className="flex flex-wrap gap-1.5">
          {SIZE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                size === option
                  ? 'bg-editor-accent text-white'
                  : 'bg-editor-muted text-editor-text hover:bg-editor-accent-soft'
              }`}
              onClick={() => setSize(option)}
            >
              {option}px
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={fieldLabel}>Correção de erro</span>
        <div className="grid grid-cols-4 gap-1.5">
          {qrErrorCorrectionOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              title={option.hint}
              className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                errorCorrection === option.id
                  ? 'bg-editor-accent text-white'
                  : 'bg-editor-muted text-editor-text hover:bg-editor-accent-soft'
              }`}
              onClick={() => setErrorCorrection(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="m-0 text-[11px] leading-relaxed text-editor-subtle">
          Redundância {selectedCorrection.label}: {selectedCorrection.hint}.
        </p>
      </div>

      <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-editor-border bg-white p-3">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Prévia do QR Code"
            className="max-h-[160px] max-w-full"
          />
        ) : (
          <p className="m-0 text-center text-sm text-editor-subtle">
            {busy
              ? 'Gerando…'
              : mode === 'pix'
                ? 'Preencha chave e nome para ver a prévia.'
                : 'Digite um conteúdo para ver a prévia.'}
          </p>
        )}
      </div>

      {error ? (
        <p className="m-0 text-sm text-editor-danger">{error}</p>
      ) : null}

      {mode === 'pix' && payload ? (
        <div className="flex flex-col gap-1.5">
          <span className={fieldLabel}>Pix Copia e Cola</span>
          <textarea
            className={`${fieldControl} min-h-[72px] resize-y font-mono text-[11px]`}
            readOnly
            value={payload}
          />
          <button
            type="button"
            className={`${btnGhost} w-full`}
            onClick={() => {
              void handleCopyPayload()
            }}
          >
            <Copy size={16} />
            {copied ? 'Copiado!' : 'Copiar payload'}
          </button>
        </div>
      ) : null}

      <button
        type="button"
        className={`${btnPrimary} w-full`}
        disabled={!canUse}
        onClick={handleAddToPage}
      >
        <ImagePlus size={16} />
        Adicionar à página
      </button>
      <button
        type="button"
        className={`${btnGhost} w-full`}
        disabled={!canUse}
        onClick={handleDownload}
      >
        <Download size={16} />
        Baixar PNG
      </button>
    </div>
  )
}
