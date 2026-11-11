import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { fieldControl, fieldLabel } from './ui'

export const DEFAULT_COLOR_PRESETS = [
  '#111111',
  '#ffffff',
  '#3080c9',
  '#03989e',
  '#2dbeaf',
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
  '#f59e0b',
  '#22c55e',
  '#0f172a',
  '#fef3c7',
  '#dbeafe',
  '#fce7f3',
]

function normalizeHexInput(value: string): string | null {
  const trimmed = value.trim()
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  if (/^#[0-9a-fA-F]{6}$/.test(withHash)) {
    return withHash.toLowerCase()
  }
  if (/^#[0-9a-fA-F]{3}$/.test(withHash)) {
    const short = withHash.slice(1).toLowerCase()
    return `#${short[0]}${short[0]}${short[1]}${short[1]}${short[2]}${short[2]}`
  }
  return null
}

function toPickerValue(value: string): string {
  return normalizeHexInput(value) ?? '#000000'
}

interface ColorFieldProps {
  id?: string
  label: string
  value: string
  onChange: (color: string) => void
  presets?: string[]
}

export function ColorField({
  id,
  label,
  value,
  onChange,
  presets = DEFAULT_COLOR_PRESETS,
}: ColorFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const hexId = `${fieldId}-hex`
  const swatchRef = useRef<HTMLButtonElement>(null)
  const plusRef = useRef<HTMLButtonElement>(null)
  const anchorRef = useRef<HTMLButtonElement | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  const valueRef = useRef(value)
  const liveColorRef = useRef(toPickerValue(value))
  const [draft, setDraft] = useState(value)
  const [liveColor, setLiveColor] = useState(toPickerValue(value))
  const [pickerOpen, setPickerOpen] = useState(false)
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    valueRef.current = value
    const next = toPickerValue(value)
    liveColorRef.current = next
    setDraft(value)
    setLiveColor(next)
  }, [value])

  const setPreview = (color: string) => {
    const next = toPickerValue(color)
    liveColorRef.current = next
    setLiveColor(next)
    setDraft(next)
  }

  const commitColor = (color: string) => {
    const next = toPickerValue(color)
    liveColorRef.current = next
    setLiveColor(next)
    setDraft(next)
    if (next !== toPickerValue(valueRef.current)) {
      onChangeRef.current(next)
    }
  }

  const flushLiveColor = () => {
    commitColor(liveColorRef.current)
  }

  const openPicker = (anchor: HTMLButtonElement | null) => {
    anchorRef.current = anchor
    setPickerOpen(true)
  }

  const closePicker = () => {
    flushLiveColor()
    setPickerOpen(false)
  }

  const togglePicker = (anchor: HTMLButtonElement | null) => {
    if (pickerOpen && anchorRef.current === anchor) {
      closePicker()
      return
    }
    openPicker(anchor)
  }

  useEffect(() => {
    if (!pickerOpen) {
      return
    }
    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect()
      if (!rect) {
        return
      }
      const width = 220
      const left = Math.min(
        Math.max(8, rect.left),
        window.innerWidth - width - 8,
      )
      const top = Math.min(rect.bottom + 8, window.innerHeight - 280)
      setPopoverPos({ top: Math.max(8, top), left })
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [pickerOpen])

  useEffect(() => {
    if (!pickerOpen) {
      return
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (swatchRef.current?.contains(target)) {
        return
      }
      if (plusRef.current?.contains(target)) {
        return
      }
      if (popoverRef.current?.contains(target)) {
        return
      }
      flushLiveColor()
      setPickerOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        flushLiveColor()
        setPickerOpen(false)
      }
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [pickerOpen])

  const commitDraft = () => {
    const next = normalizeHexInput(draft)
    if (!next) {
      setDraft(liveColor)
      return
    }
    commitColor(next)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className={fieldLabel} htmlFor={hexId}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          ref={swatchRef}
          type="button"
          className={`h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-editor-border ${
            pickerOpen && anchorRef.current === swatchRef.current
              ? 'ring-2 ring-editor-accent/40'
              : ''
          }`}
          style={{ background: liveColor }}
          onClick={() => togglePicker(swatchRef.current)}
          aria-label={`${label}: abrir seletor`}
          aria-expanded={pickerOpen}
          title="Abrir seletor de cor"
        />
        <input
          id={hexId}
          className={`${fieldControl} font-mono uppercase`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur()
            }
          }}
          placeholder="#000000"
          spellCheck={false}
          autoComplete="off"
          aria-label={`${label} (hex)`}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          ref={plusRef}
          type="button"
          className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-dashed border-editor-border bg-editor-muted text-editor-text ${
            pickerOpen && anchorRef.current === plusRef.current
              ? 'border-editor-accent ring-2 ring-editor-accent/30'
              : 'hover:border-editor-accent hover:bg-editor-accent-soft'
          }`}
          onClick={() => togglePicker(plusRef.current)}
          aria-label="Abrir seletor de cor personalizada"
          title="Cor personalizada"
        >
          <Plus size={14} strokeWidth={2.25} />
        </button>
        {presets.map((color) => {
          const active = liveColor === color.toLowerCase()
          return (
            <button
              key={color}
              type="button"
              className={`h-7 w-7 cursor-pointer rounded-lg border p-0 ${
                active
                  ? 'border-editor-accent ring-2 ring-editor-accent/30'
                  : 'border-editor-border'
              }`}
              style={{ background: color }}
              onClick={() => commitColor(color)}
              aria-label={`Cor ${color}`}
              title={color}
            />
          )
        })}
      </div>

      {pickerOpen
        ? createPortal(
            <div
              ref={popoverRef}
              className="fixed z-[80] w-[220px] rounded-2xl border border-editor-border bg-white p-3 shadow-2xl"
              style={{ top: popoverPos.top, left: popoverPos.left }}
            >
              <HexColorPicker
                color={liveColor}
                onChange={setPreview}
                onChangeEnd={(color) => commitColor(color)}
                style={{ width: '100%' }}
              />
              <p className="mt-2 mb-0 text-center font-mono text-[11px] uppercase text-editor-subtle">
                {liveColor}
              </p>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
