import { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  FileImage,
  FileType,
  Image as ImageIcon,
} from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { stageHost } from '../canvas/stageHost'
import {
  exportDesign,
  type ExportFormat,
  type ExportQuality,
} from '../export/exportDesign'

interface DownloadModalProps {
  open: boolean
  onClose: () => void
}

const formats: Array<{
  id: ExportFormat
  label: string
  icon: typeof ImageIcon
}> = [
  { id: 'png', label: 'PNG', icon: ImageIcon },
  { id: 'jpg', label: 'JPG', icon: ImageIcon },
  { id: 'webp', label: 'WEBP', icon: ImageIcon },
  { id: 'svg', label: 'SVG', icon: FileType },
  { id: 'pdf', label: 'PDF', icon: FileImage },
]

const qualities: Array<{ id: ExportQuality; label: string }> = [
  { id: 'compress', label: 'Compressão' },
  { id: 'high', label: 'Alta' },
  { id: 'max', label: 'Tamanho máximo' },
]

export function DownloadModal({ open, onClose }: DownloadModalProps) {
  const page = useEditorStore((state) => state.getActivePage())
  const designName = useEditorStore((state) => state.document.name)
  const [format, setFormat] = useState<ExportFormat>('png')
  const [scale, setScale] = useState(1)
  const [quality, setQuality] = useState<ExportQuality>('high')
  const [transparentBackground, setTransparentBackground] = useState(false)
  const [formatOpen, setFormatOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const selectedFormat = formats.find((item) => item.id === format) ?? formats[0]
  const FormatIcon = selectedFormat.icon
  const supportsTransparency = format === 'png' || format === 'webp' || format === 'svg'
  const supportsQuality = format === 'jpg' || format === 'webp'
  const useTransparent = supportsTransparency && transparentBackground
  const exportWidth = Math.round(page.width * scale)
  const exportHeight = Math.round(page.height * scale)

  useEffect(() => {
    if (!open) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const dimensionLabel = useMemo(
    () => `${exportWidth.toLocaleString('pt-BR')} px × ${exportHeight.toLocaleString('pt-BR')} px`,
    [exportWidth, exportHeight],
  )

  if (!open) {
    return null
  }

  const handleDownload = async () => {
    const stage = stageHost.current
    if (!stage || busy) {
      return
    }
    setBusy(true)
    try {
      await exportDesign(stage, designName, {
        format,
        scale,
        quality,
        transparentBackground: useTransparent,
      })
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/35 p-4 pt-16 pr-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[360px] overflow-hidden rounded-2xl border border-editor-border bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-editor-border px-4 py-3">
          <button
            type="button"
            className="rounded-lg p-1 text-editor-text hover:bg-editor-muted"
            onClick={onClose}
            aria-label="Voltar"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="m-0 text-base font-bold text-editor-text">Baixar</h2>
        </div>

        <div className="flex flex-col gap-5 p-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-editor-text">
              Formato de arquivo
            </span>
            <div className="relative">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-xl border border-editor-border bg-white px-3 py-3 text-left text-sm font-semibold text-editor-text hover:bg-editor-muted"
                onClick={() => setFormatOpen((value) => !value)}
              >
                <FormatIcon size={18} className="text-editor-subtle" />
                <span className="flex-1">{selectedFormat.label}</span>
                <ChevronDown size={18} className="text-editor-subtle" />
              </button>
              {formatOpen ? (
                <div className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-editor-border bg-white shadow-lg">
                  {formats.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold hover:bg-editor-muted ${
                          item.id === format
                            ? 'bg-editor-accent-soft text-editor-accent'
                            : 'text-editor-text'
                        }`}
                        onClick={() => {
                          setFormat(item.id)
                          setFormatOpen(false)
                        }}
                      >
                        <Icon size={16} />
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-editor-text">
                Tamanho
              </span>
              <span className="text-xs text-editor-subtle">{dimensionLabel}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={3}
                step={0.5}
                value={scale}
                onChange={(event) => setScale(Number(event.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-editor-border accent-editor-accent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:ring-1 [&::-webkit-slider-thumb]:ring-editor-border"
                disabled={format === 'svg'}
              />
              <span className="flex h-8 min-w-10 items-center justify-center rounded-lg border border-editor-border bg-editor-muted px-2 text-sm font-semibold text-editor-text">
                {scale}
              </span>
            </div>
          </div>

          {supportsQuality ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-editor-text">
                Qualidade
              </span>
              <div className="grid grid-cols-3 rounded-xl bg-editor-muted p-1">
                {qualities.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                      quality === item.id
                        ? 'bg-white text-editor-text shadow-sm'
                        : 'text-editor-subtle hover:text-editor-text'
                    }`}
                    onClick={() => setQuality(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {supportsTransparency ? (
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-sm font-semibold text-editor-text">
                Fundo transparente
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={useTransparent}
                className={`relative h-7 w-12 rounded-full transition ${
                  useTransparent ? 'bg-editor-accent' : 'bg-editor-border'
                }`}
                onClick={() => setTransparentBackground((value) => !value)}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                    useTransparent ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          ) : null}

          <button
            type="button"
            className="mt-1 w-full rounded-full bg-editor-accent px-4 py-3 text-sm font-bold text-white transition hover:bg-editor-accent-hover disabled:opacity-60"
            onClick={() => {
              void handleDownload()
            }}
            disabled={busy}
          >
            {busy ? 'Preparando…' : 'Baixar'}
          </button>
        </div>
      </div>
    </div>
  )
}
