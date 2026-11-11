import { Ellipse } from 'react-konva'
import type { EllipseElement } from '../../document/types'

interface EllipseElementViewProps {
  element: EllipseElement
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

export function EllipseElementView({
  element,
  draggable,
  onSelect,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}: EllipseElementViewProps) {
  return (
    <Ellipse
      id={element.id}
      name="design-element"
      x={element.x + element.width / 2}
      y={element.y + element.height / 2}
      radiusX={element.width / 2}
      radiusY={element.height / 2}
      rotation={element.rotation}
      opacity={element.opacity}
      fill={element.fill}
      draggable={draggable}
      onClick={(event) => onSelect(element.id, event.evt.shiftKey)}
      onTap={(event) => onSelect(element.id, event.evt.shiftKey)}
      onDragMove={(event) => {
        if (!onDragMove) {
          return
        }
        const topLeft = onDragMove(
          element.id,
          event.target.x() - element.width / 2,
          event.target.y() - element.height / 2,
        )
        event.target.position({
          x: topLeft.x + element.width / 2,
          y: topLeft.y + element.height / 2,
        })
      }}
      onDragEnd={(event) => {
        const node = event.target
        onDragEnd(
          element.id,
          node.x() - element.width / 2,
          node.y() - element.height / 2,
        )
      }}
      onTransformEnd={(event) => {
        const node = event.target
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        node.scaleX(1)
        node.scaleY(1)
        const width = Math.max(8, element.width * scaleX)
        const height = Math.max(8, element.height * scaleY)
        onTransformEnd(element.id, {
          x: node.x() - width / 2,
          y: node.y() - height / 2,
          width,
          height,
          rotation: node.rotation(),
        })
      }}
    />
  )
}
