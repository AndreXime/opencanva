import { useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  return (
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
    target.isContentEditable
  )
}

export function useEditorHotkeys() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) {
        return
      }

      const store = useEditorStore.getState()
      const meta = event.metaKey || event.ctrlKey

      if (event.key === 'Escape') {
        store.clearSelection()
        return
      }

      if (
        !meta &&
        event.key === 'Enter' &&
        store.editingTextId === null &&
        store.selectedIds.length === 1
      ) {
        const selected = store
          .getSelectedElements()
          .find((element) => element.id === store.selectedIds[0])
        if (selected?.type === 'text') {
          event.preventDefault()
          store.startEditingText(selected.id)
          return
        }
      }

      if (meta && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) {
          store.redo()
        } else {
          store.undo()
        }
        return
      }

      if (meta && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        store.redo()
        return
      }

      if (meta && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        store.selectAll()
        return
      }

      if (meta && event.key.toLowerCase() === 'c') {
        event.preventDefault()
        store.copySelected()
        return
      }

      if (meta && event.key.toLowerCase() === 'v') {
        event.preventDefault()
        store.pasteClipboard()
        return
      }

      if (meta && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        store.duplicateSelected()
        return
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        store.deleteSelected()
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        store.nudgeSelected(event.shiftKey ? -10 : -1, 0)
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        store.nudgeSelected(event.shiftKey ? 10 : 1, 0)
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        store.nudgeSelected(0, event.shiftKey ? -10 : -1)
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        store.nudgeSelected(0, event.shiftKey ? 10 : 1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
