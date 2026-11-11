import { Group, Line, Path, Rect } from 'react-konva'
import type { ShapeElement } from '../../document/types'
import {
  isBlobShape,
  shapePoints,
  shapeSvgPath,
} from '../../document/shapes'

interface ShapeElementViewProps {
  element: ShapeElement
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

export function ShapeElementView({
  element,
  draggable,
  onSelect,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}: ShapeElementViewProps) {
  const usePath = isBlobShape(element.shape)
  const points = usePath
    ? null
    : shapePoints(element.shape, element.width, element.height)
  const pathData = usePath
    ? shapeSvgPath(element.shape, element.width, element.height)
    : null

  return (
    <Group
      id={element.id}
      name="design-element"
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
          width: Math.max(8, element.width * scaleX),
          height: Math.max(8, element.height * scaleY),
          rotation: node.rotation(),
        })
      }}
    >
      {pathData ? (
        <Path data={pathData} fill={element.fill} listening={false} />
      ) : (
        <Line points={points ?? []} closed fill={element.fill} listening={false} />
      )}
      <Rect
        width={element.width}
        height={element.height}
        fill="rgba(0,0,0,0)"
      />
    </Group>
  )
}
