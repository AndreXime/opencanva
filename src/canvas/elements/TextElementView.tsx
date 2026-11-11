import { useLayoutEffect, useRef } from 'react'
import type Konva from 'konva'
import { Text } from 'react-konva'
import {
  DEFAULT_TEXT_LINE_HEIGHT,
  measureTextBlockHeight,
} from '../../document/measureText'
import type { TextElement } from '../../document/types'
import { useEditorStore } from '../../store/editorStore'

interface TextElementViewProps {
  element: TextElement
  draggable: boolean
  isEditing: boolean
  isSelected: boolean
  onSelect: (id: string, additive: boolean) => void
  onEdit: (id: string) => void
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
      fontSize?: number
    },
  ) => void
}

function clearFixedHeight(node: Konva.Text) {
  node.setAttr('height', undefined)
}

export function TextElementView({
  element,
  draggable,
  isEditing,
  isSelected,
  onSelect,
  onEdit,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}: TextElementViewProps) {
  const movedRef = useRef(false)
  const textRef = useRef<Konva.Text>(null)
  const lineHeight = element.lineHeight || DEFAULT_TEXT_LINE_HEIGHT
  const letterSpacing = element.letterSpacing ?? 0
  const textDecoration =
    element.textDecoration === 'underline' ? 'underline' : ''

  useLayoutEffect(() => {
    const node = textRef.current
    if (!node || isEditing) {
      return
    }
    clearFixedHeight(node)
    const nextHeight = Math.ceil(node.height())
    useEditorStore.getState().syncTextHeight(element.id, nextHeight)
  }, [
    element.id,
    element.text,
    element.width,
    element.fontSize,
    element.fontFamily,
    element.fontStyle,
    element.align,
    element.letterSpacing,
    element.lineHeight,
    element.textDecoration,
    isEditing,
  ])

  const handleSelect = (additive: boolean) => {
    if (!additive && isSelected && !movedRef.current) {
      onEdit(element.id)
      return
    }
    onSelect(element.id, additive)
  }

  return (
    <Text
      ref={textRef}
      id={element.id}
      name="design-element"
      x={element.x}
      y={element.y}
      width={element.width}
      rotation={element.rotation}
      opacity={isEditing ? 0 : element.opacity}
      text={element.text}
      fontSize={element.fontSize}
      fontFamily={element.fontFamily}
      fontStyle={element.fontStyle}
      textDecoration={textDecoration}
      letterSpacing={letterSpacing}
      fill={element.fill}
      align={element.align}
      verticalAlign="top"
      wrap="word"
      lineHeight={lineHeight}
      listening={!isEditing}
      draggable={draggable && !isEditing}
      onMouseDown={() => {
        movedRef.current = false
      }}
      onTouchStart={() => {
        movedRef.current = false
      }}
      onClick={(event) => handleSelect(event.evt.shiftKey)}
      onTap={(event) => handleSelect(event.evt.shiftKey)}
      onDblClick={() => onEdit(element.id)}
      onDblTap={() => onEdit(element.id)}
      onDragMove={(event) => {
        movedRef.current = true
        if (!onDragMove) {
          return
        }
        const snapped = onDragMove(element.id, event.target.x(), event.target.y())
        event.target.position(snapped)
      }}
      onDragEnd={(event) => {
        movedRef.current = true
        onDragEnd(element.id, event.target.x(), event.target.y())
      }}
      onTransformEnd={(event) => {
        const node = event.target as Konva.Text
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        node.scaleX(1)
        node.scaleY(1)
        const width = Math.max(20, node.width() * scaleX)
        const fontSize = Math.max(8, element.fontSize * scaleY)
        node.width(width)
        node.fontSize(fontSize)
        clearFixedHeight(node)
        const height = Math.max(
          measureTextBlockHeight({
            ...element,
            width,
            fontSize,
          }),
          Math.ceil(node.height()),
        )
        onTransformEnd(element.id, {
          x: node.x(),
          y: node.y(),
          width,
          height,
          rotation: node.rotation(),
          fontSize,
        })
      }}
    />
  )
}
