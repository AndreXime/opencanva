import { useEffect, useMemo, useRef, useState } from 'react'
import { useEditorStore } from '../store/editorStore'
import type { ImageCropRect, ImageElement } from '../document/types'
import {
  clampCropToImage,
  fullImageCrop,
} from '../document/imageStyle'
import { btnGhost, btnPrimary } from './ui'

interface CropImageModalProps {
  element: ImageElement
  onClose: () => void
}

type DragMode =
  | { type: 'move'; startX: number; startY: number; origin: ImageCropRect }
  | {
      type: 'resize'
      handle: 'nw' | 'ne' | 'sw' | 'se'
      startX: number
      startY: number
      origin: ImageCropRect
    }
  | null

const PREVIEW_MAX = 220

export function CropImageModal({ element, onClose }: CropImageModalProps) {
  const updateElements = useEditorStore((state) => state.updateElements)
  const stageRef = useRef<HTMLDivElement>(null)
  const [natural, setNatural] = useState({ width: 0, height: 0 })
  const [crop, setCrop] = useState<ImageCropRect | null>(element.crop)
  const [drag, setDrag] = useState<DragMode>(null)

  const layout = useMemo(() => {
    if (natural.width < 1 || natural.height < 1) {
      return null
    }
    const maxW = 520
    const maxH = 360
    const scale = Math.min(maxW / natural.width, maxH / natural.height, 1)
    return {
      scale,
      width: natural.width * scale,
      height: natural.height * scale,
    }
  }, [natural])

  const activeCrop =
    crop && natural.width > 0
      ? clampCropToImage(crop, natural.width, natural.height)
      : null

  const preview = useMemo(() => {
    if (!activeCrop) {
      return null
    }
    const scale = Math.min(
      PREVIEW_MAX / activeCrop.width,
      PREVIEW_MAX / activeCrop.height,
      1,
    )
    return {
      width: activeCrop.width * scale,
      height: activeCrop.height * scale,
      scale,
    }
  }, [activeCrop])

  useEffect(() => {
    const image = new Image()
    image.onload = () => {
      const size = {
        width: image.naturalWidth,
        height: image.naturalHeight,
      }
      setNatural(size)
      setCrop(
        element.crop
          ? clampCropToImage(element.crop, size.width, size.height)
          : fullImageCrop(size.width, size.height),
      )
    }
    image.src = element.src
  }, [element.id, element.src, element.crop])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    if (!drag || !layout || natural.width < 1) {
      return
    }

    const toImagePoint = (clientX: number, clientY: number) => {
      const stage = stageRef.current
      if (!stage) {
        return { x: 0, y: 0 }
      }
      const rect = stage.getBoundingClientRect()
      return {
        x: (clientX - rect.left) / layout.scale,
        y: (clientY - rect.top) / layout.scale,
      }
    }

    const onMove = (event: PointerEvent) => {
      const point = toImagePoint(event.clientX, event.clientY)
      const dx = point.x - drag.startX
      const dy = point.y - drag.startY
      const origin = drag.origin

      if (drag.type === 'move') {
        setCrop(
          clampCropToImage(
            {
              ...origin,
              x: origin.x + dx,
              y: origin.y + dy,
            },
            natural.width,
            natural.height,
          ),
        )
        return
      }

      const next = { ...origin }
      if (drag.handle.includes('e')) {
        next.width = origin.width + dx
      }
      if (drag.handle.includes('s')) {
        next.height = origin.height + dy
      }
      if (drag.handle.includes('w')) {
        next.x = origin.x + dx
        next.width = origin.width - dx
      }
      if (drag.handle.includes('n')) {
        next.y = origin.y + dy
        next.height = origin.height - dy
      }
      setCrop(clampCropToImage(next, natural.width, natural.height))
    }

    const onUp = () => setDrag(null)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [drag, layout, natural.height, natural.width])

  const toImagePoint = (clientX: number, clientY: number) => {
    const stage = stageRef.current
    if (!stage || !layout) {
      return { x: 0, y: 0 }
    }
    const rect = stage.getBoundingClientRect()
    return {
      x: (clientX - rect.left) / layout.scale,
      y: (clientY - rect.top) / layout.scale,
    }
  }

  const applyCrop = () => {
    if (!activeCrop || natural.width < 1) {
      return
    }
    const isFull =
      activeCrop.x <= 0.5 &&
      activeCrop.y <= 0.5 &&
      Math.abs(activeCrop.width - natural.width) < 1 &&
      Math.abs(activeCrop.height - natural.height) < 1

    const aspect = activeCrop.width / activeCrop.height
    const nextHeight = element.width / aspect

    updateElements([element.id], {
      crop: isFull ? null : activeCrop,
      height: Math.max(8, nextHeight),
    })
    onClose()
  }

  const resetCrop = () => {
    if (natural.width < 1) {
      return
    }
    setCrop(fullImageCrop(natural.width, natural.height))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/35 p-4 pt-14">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div className="relative z-10 flex w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-editor-border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-editor-border px-4 py-3">
          <h2 className="m-0 text-base font-bold text-editor-text">
            Recortar imagem
          </h2>
          <button type="button" className={btnGhost} onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-[1fr_240px]">
          <div className="flex min-h-[280px] items-center justify-center rounded-xl bg-[#e8eaef] p-3">
            {!layout || !activeCrop ? (
              <span className="text-sm text-editor-subtle">Carregando…</span>
            ) : (
              <div
                ref={stageRef}
                className="relative touch-none select-none overflow-hidden bg-white shadow-sm"
                style={{ width: layout.width, height: layout.height }}
              >
                <img
                  src={element.src}
                  alt=""
                  draggable={false}
                  className="pointer-events-none block h-full w-full max-w-none"
                />
                <div
                  className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
                  style={{
                    left: activeCrop.x * layout.scale,
                    top: activeCrop.y * layout.scale,
                    width: activeCrop.width * layout.scale,
                    height: activeCrop.height * layout.scale,
                  }}
                  onPointerDown={(event) => {
                    const point = toImagePoint(event.clientX, event.clientY)
                    setDrag({
                      type: 'move',
                      startX: point.x,
                      startY: point.y,
                      origin: activeCrop,
                    })
                  }}
                >
                  {(['nw', 'ne', 'sw', 'se'] as const).map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      aria-label={`Redimensionar ${handle}`}
                      className={`absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-editor-accent bg-white ${
                        handle === 'nw'
                          ? 'left-0 top-0 cursor-nwse-resize'
                          : handle === 'ne'
                            ? 'left-full top-0 cursor-nesw-resize'
                            : handle === 'sw'
                              ? 'left-0 top-full cursor-nesw-resize'
                              : 'left-full top-full cursor-nwse-resize'
                      }`}
                      onPointerDown={(event) => {
                        event.stopPropagation()
                        const point = toImagePoint(event.clientX, event.clientY)
                        setDrag({
                          type: 'resize',
                          handle,
                          startX: point.x,
                          startY: point.y,
                          origin: activeCrop,
                        })
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wide text-editor-subtle">
                Preview
              </p>
              <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-editor-border bg-editor-muted p-3">
                {activeCrop && preview ? (
                  <div
                    className="overflow-hidden bg-white shadow-sm"
                    style={{
                      width: preview.width,
                      height: preview.height,
                      backgroundImage: `url(${element.src})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: `${natural.width * preview.scale}px ${natural.height * preview.scale}px`,
                      backgroundPosition: `-${activeCrop.x * preview.scale}px -${activeCrop.y * preview.scale}px`,
                      transform: `scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
                    }}
                  />
                ) : (
                  <span className="text-sm text-editor-subtle">—</span>
                )}
              </div>
            </div>
            <p className="m-0 text-xs leading-relaxed text-editor-subtle">
              Arraste a área clara para mover. Use as quinas para redimensionar.
            </p>
            <div className="mt-auto flex flex-col gap-2">
              <button type="button" className={btnGhost} onClick={resetCrop}>
                Resetar recorte
              </button>
              <button type="button" className={btnPrimary} onClick={applyCrop}>
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
