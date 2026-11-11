import { useEffect, useState } from 'react'
import { Image as KonvaImage } from 'react-konva'
import type { ImageElement } from '../../document/types'

interface ImageElementViewProps {
  element: ImageElement
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
      flipX?: boolean
      flipY?: boolean
    },
  ) => void
}

export function ImageElementView({
  element,
  draggable,
  onSelect,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}: ImageElementViewProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const flipX = Boolean(element.flipX)
  const flipY = Boolean(element.flipY)

  useEffect(() => {
    const img = new window.Image()
    img.onload = () => setImage(img)
    img.src = element.src
  }, [element.src])

  return (
    <KonvaImage
      id={element.id}
      name="design-element"
      image={image ?? undefined}
      x={flipX ? element.x + element.width : element.x}
      y={flipY ? element.y + element.height : element.y}
      width={element.width}
      height={element.height}
      scaleX={flipX ? -1 : 1}
      scaleY={flipY ? -1 : 1}
      rotation={element.rotation}
      opacity={element.opacity}
      crop={element.crop ?? undefined}
      draggable={draggable}
      onClick={(event) => onSelect(element.id, event.evt.shiftKey)}
      onTap={(event) => onSelect(element.id, event.evt.shiftKey)}
      onDragMove={(event) => {
        if (!onDragMove) {
          return
        }
        const node = event.target
        const topLeftX = flipX ? node.x() - element.width : node.x()
        const topLeftY = flipY ? node.y() - element.height : node.y()
        const snapped = onDragMove(element.id, topLeftX, topLeftY)
        node.position({
          x: flipX ? snapped.x + element.width : snapped.x,
          y: flipY ? snapped.y + element.height : snapped.y,
        })
      }}
      onDragEnd={(event) => {
        const node = event.target
        const topLeftX = flipX ? node.x() - element.width : node.x()
        const topLeftY = flipY ? node.y() - element.height : node.y()
        onDragEnd(element.id, topLeftX, topLeftY)
      }}
      onTransformEnd={(event) => {
        const node = event.target
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        const nextFlipX = scaleX < 0
        const nextFlipY = scaleY < 0
        const width = Math.max(8, Math.abs(node.width() * scaleX))
        const height = Math.max(8, Math.abs(node.height() * scaleY))
        node.scaleX(nextFlipX ? -1 : 1)
        node.scaleY(nextFlipY ? -1 : 1)
        node.width(width)
        node.height(height)

        const topLeftX = nextFlipX ? node.x() - width : node.x()
        const topLeftY = nextFlipY ? node.y() - height : node.y()

        onTransformEnd(element.id, {
          x: topLeftX,
          y: topLeftY,
          width,
          height,
          rotation: node.rotation(),
          flipX: nextFlipX,
          flipY: nextFlipY,
        })
      }}
    />
  )
}
