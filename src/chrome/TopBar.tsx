import { useState } from 'react'
import {
  Cloud,
  Download,
  FileDown,
  Home,
  Redo2,
  Trash2,
  Undo2,
  Copy,
} from 'lucide-react'
import { exportProjectFile } from '../export/exportProject'
import { useEditorStore } from '../store/editorStore'
import { DownloadModal } from './DownloadModal'
import { btn, btnPrimary } from './ui'

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

  return (
    <>
      <header className="z-20 flex h-[52px] shrink-0 items-center gap-2 bg-editor-top px-3 text-white shadow-md">
        <button
          type="button"
          className={btn}
          onClick={goHome}
          title="Início"
        >
          <Home size={15} />
          <span className="hidden sm:inline">Início</span>
        </button>

        <div className="mx-1 h-6 w-px bg-white/20" />

        <nav className="hidden items-center gap-1 md:flex">
          <button
            type="button"
            className={btn}
            onClick={undo}
            disabled={history.past.length === 0}
            title="Desfazer"
          >
            <Undo2 size={15} />
            Desfazer
          </button>
          <button
            type="button"
            className={btn}
            onClick={redo}
            disabled={history.future.length === 0}
            title="Refazer"
          >
            <Redo2 size={15} />
            Refazer
          </button>
        </nav>

        <div
          className="ml-1 flex items-center gap-1.5 text-xs font-medium text-white/80"
          title={saveStatus === 'saving' ? 'Salvando' : 'Salvo localmente'}
        >
          <Cloud
            size={16}
            className={saveStatus === 'saving' ? 'animate-pulse' : ''}
          />
          <span className="hidden sm:inline">
            {saveStatus === 'saving' ? 'Salvando…' : 'Salvo'}
          </span>
        </div>

        <div className="mx-2 h-6 w-px bg-white/20" />

        <input
          className="min-w-0 flex-1 truncate rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-white outline-none hover:border-white/20 hover:bg-white/10 focus:border-white/30 focus:bg-white/10 md:max-w-md"
          value={design.name}
          onChange={(event) => setDesignName(event.target.value)}
          aria-label="Nome do design"
        />

        <div className="flex-1" />

        {selectedIds.length > 0 ? (
          <>
            <button
              type="button"
              className={btn}
              onClick={duplicateSelected}
              title="Ctrl+D"
            >
              <Copy size={15} />
              <span className="hidden lg:inline">Duplicar elemento</span>
            </button>
            <button
              type="button"
              className={btn}
              onClick={deleteSelected}
              title="Delete"
            >
              <Trash2 size={15} />
              <span className="hidden lg:inline">Excluir elemento</span>
            </button>
          </>
        ) : null}
        <button
          type="button"
          className={btn}
          onClick={() => exportProjectFile(design)}
          title="Baixar arquivo .opencanva.json do projeto"
        >
          <FileDown size={15} />
          <span className="hidden lg:inline">Exportar</span>
        </button>
        <button
          type="button"
          className={`${btnPrimary} border-white/0 shadow-sm`}
          onClick={() => setDownloadOpen(true)}
        >
          <Download size={15} />
          Baixar
        </button>
      </header>

      <DownloadModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
      />
    </>
  )
}
