import { useEffect, useLayoutEffect, useRef } from 'react'
import { DEFAULT_TEXT_LINE_HEIGHT } from '../document/measureText'
import { useEditorStore } from '../store/editorStore'
import type { TextElement } from '../document/types'

export function TextEditorOverlay() {
  const editingTextId = useEditorStore((state) => state.editingTextId)
  const editingTextDraft = useEditorStore((state) => state.editingTextDraft)
  const zoom = useEditorStore((state) => state.zoom)
  const stagePosition = useEditorStore((state) => state.stagePosition)
  const document = useEditorStore((state) => state.document)
  const setEditingTextDraft = useEditorStore((state) => state.setEditingTextDraft)
  const finishEditingText = useEditorStore((state) => state.finishEditingText)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const page =
    document.pages.find((item) => item.id === document.activePageId) ??
    document.pages[0]
  const element = page.elements.find(
    (item): item is TextElement =>
      item.id === editingTextId && item.type === 'text',
  )

  const lineHeight = element?.lineHeight || DEFAULT_TEXT_LINE_HEIGHT

  useEffect(() => {
    if (!editingTextId || !textareaRef.current) {
      return
    }
    const node = textareaRef.current
    node.focus()
    node.select()
  }, [editingTextId])

  useLayoutEffect(() => {
    const node = textareaRef.current
    if (!node || !element) {
      return
    }
    node.style.height = '0px'
    node.style.height = `${Math.max(node.scrollHeight, element.fontSize * zoom * lineHeight)}px`
  }, [editingTextDraft, element, lineHeight, zoom])

  if (!element || editingTextDraft === null) {
    return null
  }

  const left = stagePosition.x + element.x * zoom
  const top = stagePosition.y + element.y * zoom
  const width = Math.max(48, element.width * zoom)
  const letterSpacing = (element.letterSpacing ?? 0) * zoom

  return (
    <textarea
      ref={textareaRef}
      aria-label="Editar texto"
      className="absolute z-20 m-0 box-border resize-none overflow-hidden rounded border-2 border-editor-accent bg-white p-1 outline-none shadow-sm"
      value={editingTextDraft}
      style={{
        left,
        top,
        width,
        fontSize: Math.max(12, element.fontSize * zoom),
        fontFamily: element.fontFamily,
        fontStyle: element.fontStyle.includes('italic') ? 'italic' : 'normal',
        fontWeight: element.fontStyle.includes('bold') ? 700 : 400,
        textDecoration:
          element.textDecoration === 'underline' ? 'underline' : 'none',
        letterSpacing: `${letterSpacing}px`,
        color: element.fill,
        textAlign: element.align,
        lineHeight,
      }}
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onChange={(event) => setEditingTextDraft(event.currentTarget.value)}
      onBlur={() => finishEditingText()}
      onKeyDown={(event) => {
        event.stopPropagation()
        if (event.key === 'Escape') {
          event.preventDefault()
          finishEditingText({ discard: true })
          return
        }
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          finishEditingText()
        }
      }}
    />
  )
}
