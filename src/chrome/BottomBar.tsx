import {
  ChevronLeft,
  ChevronRight,
  CopyPlus,
  FilePlus2,
  Minus,
  Plus,
  Scan,
  X,
} from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { btnLight } from './ui'

export function BottomBar() {
  const document = useEditorStore((state) => state.document)
  const zoom = useEditorStore((state) => state.zoom)
  const setZoom = useEditorStore((state) => state.setZoom)
  const fitToPage = useEditorStore((state) => state.fitToPage)
  const setActivePage = useEditorStore((state) => state.setActivePage)
  const addPage = useEditorStore((state) => state.addPage)
  const duplicatePage = useEditorStore((state) => state.duplicatePage)
  const deletePage = useEditorStore((state) => state.deletePage)

  const activeIndex = document.pages.findIndex(
    (page) => page.id === document.activePageId,
  )
  const activePage = document.pages[activeIndex] ?? document.pages[0]

  const goPrev = () => {
    if (activeIndex <= 0) {
      return
    }
    setActivePage(document.pages[activeIndex - 1].id)
  }

  const goNext = () => {
    if (activeIndex >= document.pages.length - 1) {
      return
    }
    setActivePage(document.pages[activeIndex + 1].id)
  }

  return (
    <footer className="flex h-12 shrink-0 items-center gap-3 border-t border-editor-border bg-editor-surface px-3">
      <button type="button" className={btnLight} onClick={addPage}>
        <FilePlus2 size={15} />
        Página
      </button>
      <button type="button" className={btnLight} onClick={duplicatePage}>
        <CopyPlus size={15} />
        Duplicar
      </button>

      <div className="mx-1 h-5 w-px bg-editor-border" />

      <div className="flex items-center gap-1">
        <button
          type="button"
          className={btnLight}
          onClick={goPrev}
          disabled={activeIndex <= 0}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-24 text-center text-[13px] font-semibold text-editor-text">
          {activeIndex + 1} / {document.pages.length}
        </span>
        <button
          type="button"
          className={btnLight}
          onClick={goNext}
          disabled={activeIndex >= document.pages.length - 1}
          aria-label="Próxima página"
        >
          <ChevronRight size={16} />
        </button>
        {document.pages.length > 1 ? (
          <button
            type="button"
            className="rounded-lg p-1.5 text-editor-subtle hover:bg-red-50 hover:text-editor-danger"
            title="Excluir página"
            onClick={() => deletePage(activePage.id)}
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      <div className="flex-1" />

      <button
        type="button"
        className={btnLight}
        onClick={() => {
          const area = window.document.getElementById('design-canvas')
          if (!area) {
            return
          }
          fitToPage(area.clientWidth, area.clientHeight)
        }}
        title="Ajustar à tela"
      >
        <Scan size={15} />
      </button>
      <button
        type="button"
        className={btnLight}
        onClick={() => setZoom(zoom / 1.1)}
        aria-label="Diminuir zoom"
      >
        <Minus size={15} />
      </button>
      <input
        type="range"
        min={10}
        max={200}
        value={Math.round(zoom * 100)}
        onChange={(event) => setZoom(Number(event.target.value) / 100)}
        className="w-28 accent-editor-accent"
        aria-label="Zoom"
      />
      <button
        type="button"
        className={btnLight}
        onClick={() => setZoom(zoom * 1.1)}
        aria-label="Aumentar zoom"
      >
        <Plus size={15} />
      </button>
      <span className="min-w-12 text-center text-[13px] font-semibold text-editor-subtle">
        {Math.round(zoom * 100)}%
      </span>
    </footer>
  )
}
