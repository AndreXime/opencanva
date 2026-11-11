import { Rect } from 'react-konva'
import type { RectElement } from '../../document/types'

interface RectElementViewProps {
  element: RectElement
  isSelected: boolean
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

export function RectElementView({
  element,
  draggable,
  onSelect,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}: RectElementViewProps) {
  return (
    <Rect
      id={element.id}
      name="design-element"
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      opacity={element.opacity}
      fill={element.fill}
      cornerRadius={element.cornerRadius}
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
          width: Math.max(8, node.width() * scaleX),
          height: Math.max(8, node.height() * scaleY),
          rotation: node.rotation(),
        })
      }}
    />
  )
}
