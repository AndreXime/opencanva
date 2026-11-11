import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, RotateCw } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import {
  formatPageSize,
  pagePresetGroups,
  type PagePreset,
} from '../document/pagePresets'
import { btnPrimary, fieldControl, fieldLabel } from './ui'

interface ResizeModalProps {
  open: boolean
  onClose: () => void
}

const MIN_SIZE = 64
const MAX_SIZE = 8192

function clampSize(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_SIZE
  }
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(value)))
}

export function ResizeModal({ open, onClose }: ResizeModalProps) {
  const page = useEditorStore((state) => state.getActivePage())
  const resizePage = useEditorStore((state) => state.resizePage)
  const [width, setWidth] = useState(page.width)
  const [height, setHeight] = useState(page.height)
  const [activeGroupId, setActiveGroupId] = useState(pagePresetGroups[0]?.id ?? '')
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setWidth(page.width)
      setHeight(page.height)
    }
  }

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

  if (!open) {
    return null
  }

  const applySize = (nextWidth: number, nextHeight: number) => {
    const w = clampSize(nextWidth)
    const h = clampSize(nextHeight)
    resizePage(w, h)
    setWidth(w)
    setHeight(h)
    onClose()
  }

  const applyPreset = (preset: PagePreset) => {
    applySize(preset.width, preset.height)
  }

  const swapOrientation = () => {
    setWidth(height)
    setHeight(width)
  }

  const activeGroup =
    pagePresetGroups.find((group) => group.id === activeGroupId) ??
    pagePresetGroups[0]

return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/35 p-4 pt-16">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(720px,calc(100vh-6rem))] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-editor-border bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-editor-border px-4 py-3">
          <button
            type="button"
            className="rounded-lg p-1 text-editor-text hover:bg-editor-muted"
            onClick={onClose}
            aria-label="Voltar"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-base font-bold text-editor-text">
              Redimensionar
            </h2>
            <p className="m-0 text-xs text-editor-subtle">
              Atual: {formatPageSize(page.width, page.height)}
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-editor-text">
              Personalizado
            </span>
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <div className="flex flex-col gap-1.5">
                <label className={fieldLabel} htmlFor="resize-width">
                  Largura
                </label>
                <input
                  id="resize-width"
                  className={fieldControl}
                  type="number"
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  value={width}
                  onChange={(event) => setWidth(Number(event.target.value))}
                />
              </div>
              <button
                type="button"
                className="mb-0.5 flex h-10 w-10 items-center justify-center rounded-lg border border-editor-border bg-editor-muted text-editor-text hover:bg-editor-accent-soft"
                onClick={swapOrientation}
                title="Trocar orientação"
                aria-label="Trocar orientação"
              >
                <RotateCw size={16} />
              </button>
              <div className="flex flex-col gap-1.5">
                <label className={fieldLabel} htmlFor="resize-height">
                  Altura
                </label>
                <input
                  id="resize-height"
                  className={fieldControl}
                  type="number"
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  value={height}
                  onChange={(event) => setHeight(Number(event.target.value))}
                />
              </div>
            </div>
            <button
              type="button"
              className={`${btnPrimary} w-full`}
              onClick={() => applySize(width, height)}
            >
              Aplicar {formatPageSize(clampSize(width), clampSize(height))}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-editor-text">
              Prontos
            </span>
            <div className="flex flex-wrap gap-1.5">
              {pagePresetGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    group.id === activeGroup.id
                      ? 'bg-editor-accent text-white'
                      : 'bg-editor-muted text-editor-text hover:bg-editor-accent-soft'
                  }`}
                  onClick={() => setActiveGroupId(group.id)}
                >
                  {group.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {activeGroup.presets.map((preset) => {
                const selected =
                  page.width === preset.width && page.height === preset.height
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition ${
                      selected
                        ? 'border-editor-accent bg-editor-accent-soft'
                        : 'border-editor-border bg-editor-muted hover:border-editor-accent'
                    }`}
                    onClick={() => applyPreset(preset)}
                  >
                    <span className="text-sm font-semibold text-editor-text">
                      {preset.label}
                    </span>
                    <span className="text-xs text-editor-subtle">
                      {formatPageSize(preset.width, preset.height)}
                      {preset.hint ? ` · ${preset.hint}` : ''}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
