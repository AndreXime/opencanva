import { useEffect, useState } from 'react'
import { Image as KonvaImage } from 'react-konva'
import type { IconElement } from '../../document/types'
import { iconToDataUrl } from '../../icons/iconRender'

interface IconElementViewProps {
  element: IconElement
  draggable: boolean
  onSelect: (id: string, additive: boolean) => void
  onDragMove?: (id: string, x: number, y: number) => { x: number; y: number }
  onDragEnd: (id: string, x: number, y: number) => void
  onTransformEnd: (
    id: string,
    attrs: {
      x: number
      y: number
      width: number
      height: number
      rotation: number
    },
  ) => void
}

export function IconElementView({
  element,
  draggable,
  onSelect,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}: IconElementViewProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const pack = element.iconPack ?? 'lucide'

  useEffect(() => {
    let cancelled = false
    const size = Math.max(element.width, element.height, 24)
    void iconToDataUrl(
      pack,
      element.iconName,
      element.fill,
      size,
      element.strokeWidth,
    ).then((src) => {
      if (cancelled || !src) {
        if (!cancelled) {
          setImage(null)
        }
        return
      }
      const img = new window.Image()
      img.onload = () => {
        if (!cancelled) {
          setImage(img)
        }
      }
      img.src = src
    })
    return () => {
      cancelled = true
    }
  }, [
    pack,
    element.iconName,
    element.fill,
    element.strokeWidth,
    element.width,
    element.height,
  ])

  return (
    <KonvaImage
      id={element.id}
      name="design-element"
      image={image ?? undefined}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      opacity={element.opacity}
      draggable={draggable}
      onClick={(event) => onSelect(element.id, event.evt.shiftKey)}
      onTap={(event) => onSelect(element.id, event.evt.shiftKey)}
      onDragMove={(event) => {
        if (!onDragMove) {
          return
        }
        const snapped = onDragMove(element.id, event.target.x(), event.target.y())
        event.target.position(snapped)
      }}
      onDragEnd={(event) => {
        onDragEnd(element.id, event.target.x(), event.target.y())
      }}
      onTransformEnd={(event) => {
        const node = event.target
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        node.scaleX(1)
        node.scaleY(1)
        onTransformEnd(element.id, {
          x: node.x(),
          y: node.y(),
          width: Math.max(16, node.width() * scaleX),
          height: Math.max(16, node.height() * scaleY),
          rotation: node.rotation(),
        })
      }}
    />
  )
}
