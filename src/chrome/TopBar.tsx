import { useEffect, useState } from 'react'
import {
  Cloud,
  Download,
  FileDown,
  Home,
  Menu,
  Redo2,
  Trash2,
  Undo2,
  Copy,
  X,
} from 'lucide-react'
import { exportProjectFile } from '../export/exportProject'
import { useEditorStore } from '../store/editorStore'
import { DownloadModal } from './DownloadModal'
import { btn, btnPrimary } from './ui'

const MOBILE_QUERY = '(max-width: 767px)'

export function TopBar() {
  const design = useEditorStore((state) => state.document)
  const history = useEditorStore((state) => state.history)
  const saveStatus = useEditorStore((state) => state.saveStatus)
  const selectedIds = useEditorStore((state) => state.selectedIds)
  const setDesignName = useEditorStore((state) => state.setDesignName)
  const goHome = useEditorStore((state) => state.goHome)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const duplicateSelected = useEditorStore((state) => state.duplicateSelected)
  const deleteSelected = useEditorStore((state) => state.deleteSelected)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(MOBILE_QUERY).matches
      : false,
  )

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY)
    const sync = () => {
      setIsMobile(media.matches)
      if (!media.matches) {
        setMenuOpen(false)
      }
    }
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const openDownload = () => {
    setMenuOpen(false)
    setDownloadOpen(true)
  }

  const exportProject = () => {
    setMenuOpen(false)
    exportProjectFile(design)
  }

  const goHomeAndClose = () => {
    setMenuOpen(false)
    goHome()
  }

  return (
    <>
      <header className="z-20 flex h-[52px] shrink-0 items-center gap-1.5 bg-editor-top px-2 pt-[env(safe-area-inset-top)] text-white shadow-md sm:gap-2 sm:px-3">
        {isMobile ? (
          <button
            type="button"
            className={`${btn} touch-manipulation`}
            onClick={() => setMenuOpen(true)}
            title="Menu"
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>
        ) : (
          <button
            type="button"
            className={`${btn} touch-manipulation`}
            onClick={goHome}
            title="Início"
          >
            <Home size={15} />
            Início
          </button>
        )}

        {!isMobile ? (
          <div className="mx-1 h-6 w-px bg-white/20" />
        ) : null}

        <nav className="flex items-center gap-1">
          <button
            type="button"
            className={`${btn} touch-manipulation`}
            onClick={undo}
            disabled={history.past.length === 0}
            title="Desfazer"
          >
            <Undo2 size={15} />
            {!isMobile ? <span>Desfazer</span> : null}
          </button>
          <button
            type="button"
            className={`${btn} touch-manipulation`}
            onClick={redo}
            disabled={history.future.length === 0}
            title="Refazer"
          >
            <Redo2 size={15} />
            {!isMobile ? <span>Refazer</span> : null}
          </button>
        </nav>

        {!isMobile ? (
          <div
            className="ml-0.5 flex items-center gap-1.5 text-xs font-medium text-white/80"
            title={saveStatus === 'saving' ? 'Salvando' : 'Salvo localmente'}
          >
            <Cloud
              size={16}
              className={saveStatus === 'saving' ? 'animate-pulse' : ''}
            />
            <span>{saveStatus === 'saving' ? 'Salvando…' : 'Salvo'}</span>
          </div>
        ) : null}

        {!isMobile ? <div className="mx-2 h-6 w-px bg-white/20" /> : null}

        <input
          className="min-w-0 flex-1 truncate rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm font-semibold text-white outline-none hover:border-white/20 hover:bg-white/10 focus:border-white/30 focus:bg-white/10 sm:px-2 md:max-w-md"
          value={design.name}
          onChange={(event) => setDesignName(event.target.value)}
          aria-label="Nome do design"
        />

        <div className="flex-1" />

        {selectedIds.length > 0 ? (
          <>
            <button
              type="button"
              className={`${btn} touch-manipulation`}
              onClick={duplicateSelected}
              title="Ctrl+D"
            >
              <Copy size={15} />
              {!isMobile ? (
                <span className="hidden lg:inline">Duplicar elemento</span>
              ) : null}
            </button>
            <button
              type="button"
              className={`${btn} touch-manipulation`}
              onClick={deleteSelected}
              title="Delete"
            >
              <Trash2 size={15} />
              {!isMobile ? (
                <span className="hidden lg:inline">Excluir elemento</span>
              ) : null}
            </button>
          </>
        ) : null}

        {!isMobile ? (
          <>
            <button
              type="button"
              className={`${btn} touch-manipulation`}
              onClick={() => exportProjectFile(design)}
              title="Baixar arquivo .opencanva.json do projeto"
            >
              <FileDown size={15} />
              <span className="hidden lg:inline">Exportar</span>
            </button>
            <button
              type="button"
              className={`${btnPrimary} touch-manipulation border-white/0 px-2.5 shadow-sm sm:px-3.5`}
              onClick={() => setDownloadOpen(true)}
            >
              <Download size={15} />
              Baixar
            </button>
          </>
        ) : null}
      </header>

      {menuOpen && isMobile ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative z-10 rounded-t-2xl bg-editor-surface pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
            <div className="flex items-center justify-between border-b border-editor-border px-4 py-3">
              <h2 className="m-0 text-base font-bold text-editor-text">Menu</h2>
              <button
                type="button"
                className="touch-manipulation rounded-lg p-1.5 text-editor-subtle hover:bg-editor-muted hover:text-editor-text"
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-1 p-3">
              <button
                type="button"
                className="flex touch-manipulation items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-editor-text hover:bg-editor-muted"
                onClick={goHomeAndClose}
              >
                <Home size={18} className="text-editor-accent" />
                Início
              </button>
              <button
                type="button"
                className="flex touch-manipulation items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-editor-text hover:bg-editor-muted"
                onClick={exportProject}
              >
                <FileDown size={18} className="text-editor-accent" />
                Exportar projeto
              </button>
              <button
                type="button"
                className="flex touch-manipulation items-center gap-3 rounded-xl bg-editor-accent px-3 py-3 text-left text-sm font-semibold text-white hover:bg-editor-accent-hover"
                onClick={openDownload}
              >
                <Download size={18} />
                Baixar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <DownloadModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
      />
    </>
  )
}
