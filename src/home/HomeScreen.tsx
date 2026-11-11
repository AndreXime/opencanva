import { useEffect, useRef, useState } from 'react'
import {
  Copy,
  FilePlus2,
  FileUp,
  FolderOpen,
  LayoutTemplate,
  Trash2,
} from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import type { ProjectMeta } from '../store/persist'
import { ProjectImportError } from '../export/exportProject'
import { designTemplates } from '../templates/catalog'
import { btnGhost, btnPrimary } from '../chrome/ui'
import { formatPageSize } from '../document/pagePresets'

function formatUpdatedAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function ProjectCard({
  project,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  project: ProjectMeta
  onOpen: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-editor-border bg-white shadow-sm transition hover:border-editor-accent hover:shadow-md">
      <button
        type="button"
        className="flex min-h-[140px] flex-1 cursor-pointer flex-col items-start justify-between bg-gradient-to-br from-[#e6f7f5] via-white to-[#f0faf8] p-4 text-left"
        onClick={onOpen}
      >
        <LayoutTemplate className="text-editor-accent" size={28} />
        <div>
          <h2 className="m-0 line-clamp-2 text-base font-bold text-editor-text">
            {project.name}
          </h2>
          <p className="mt-1 m-0 text-xs text-editor-subtle">
            {project.pageCount} {project.pageCount === 1 ? 'página' : 'páginas'} ·{' '}
            {formatUpdatedAt(project.updatedAt)}
          </p>
        </div>
      </button>
      <div className="flex items-center gap-1 border-t border-editor-border bg-editor-muted/60 px-2 py-1.5">
        <button
          type="button"
          className={`${btnGhost} flex-1 border-0 bg-transparent py-1.5 text-xs`}
          onClick={onOpen}
        >
          <FolderOpen size={14} />
          Abrir
        </button>
        <button
          type="button"
          className={`${btnGhost} border-0 bg-transparent px-2 py-1.5`}
          title="Duplicar"
          onClick={onDuplicate}
        >
          <Copy size={14} />
        </button>
        <button
          type="button"
          className={`${btnGhost} border-0 bg-transparent px-2 py-1.5 text-editor-danger`}
          title="Excluir"
          onClick={onDelete}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  )
}

function NewProjectCard({
  onCreate,
  onImport,
  importing,
}: {
  onCreate: () => void
  onImport: () => void
  importing: boolean
}) {
  return (
    <article className="flex min-h-[198px] flex-col justify-center gap-2 rounded-2xl border border-dashed border-editor-accent/40 bg-editor-accent-soft/40 p-4">
      <button
        type="button"
        className={`${btnPrimary} w-full justify-center py-2 text-xs`}
        onClick={onCreate}
      >
        <FilePlus2 size={14} />
        Criar novo projeto
      </button>
      <button
        type="button"
        className={`${btnGhost} w-full justify-center border-editor-accent/30 bg-white/80 py-2 text-xs text-editor-accent`}
        onClick={onImport}
        disabled={importing}
      >
        <FileUp size={14} />
        {importing ? 'Importando…' : 'Importar projeto'}
      </button>
    </article>
  )
}

export function HomeScreen() {
  const projects = useEditorStore((state) => state.projects)
  const refreshProjects = useEditorStore((state) => state.refreshProjects)
  const createAndOpenProject = useEditorStore(
    (state) => state.createAndOpenProject,
  )
  const createAndOpenFromTemplate = useEditorStore(
    (state) => state.createAndOpenFromTemplate,
  )
  const importAndOpenProject = useEditorStore(
    (state) => state.importAndOpenProject,
  )
  const openProject = useEditorStore((state) => state.openProject)
  const duplicateProject = useEditorStore((state) => state.duplicateProject)
  const deleteProject = useEditorStore((state) => state.deleteProject)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    refreshProjects()
  }, [refreshProjects])

  const askDelete = (id: string) => {
    setConfirmId(id)
  }

  const confirmDelete = () => {
    if (!confirmId) {
      return
    }
    deleteProject(confirmId)
    setConfirmId(null)
  }

  const openImportPicker = () => {
    setImportError(null)
    fileInputRef.current?.click()
  }

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }
    setImporting(true)
    setImportError(null)
    try {
      await importAndOpenProject(file)
    } catch (error) {
      const message =
        error instanceof ProjectImportError
          ? error.message
          : 'Não foi possível importar este arquivo.'
      setImportError(message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-editor-bg font-editor text-editor-text">
      <header className="border-b border-editor-border bg-editor-top px-4 py-4 text-white shadow-md sm:px-8">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
          <h1 className="m-0 text-2xl font-bold tracking-tight">OpenCanva</h1>
          <p className="m-0 text-right text-sm text-white/75 sm:text-base">
            Selecione ou crie seu projeto
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-8">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.opencanva.json,application/json"
          className="hidden"
          onChange={(event) => {
            void handleImportFile(event)
          }}
        />

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="m-0 text-lg font-bold">Modelos</h2>
            <p className="mt-1 mb-0 text-sm text-editor-subtle">
              Comece por um layout pronto e edite textos, cores e o QR.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {designTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-editor-border bg-white text-left shadow-sm transition hover:border-editor-accent hover:shadow-md"
                onClick={() => createAndOpenFromTemplate(template.id)}
              >
                <div className="relative flex min-h-[160px] items-center justify-center overflow-hidden bg-[#d9e8f5]">
                  <img
                    src={template.thumbnailSrc}
                    alt=""
                    className="h-[160px] w-auto object-contain shadow-sm transition group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex flex-col gap-1 p-4">
                  <span className="text-sm font-bold text-editor-text">
                    {template.name}
                  </span>
                  <span className="text-xs text-editor-subtle">
                    {template.description}
                  </span>
                  <span className="text-xs text-editor-subtle">
                    {formatPageSize(template.width, template.height)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="m-0 text-lg font-bold">Seus projetos</h2>
            <p className="mt-1 mb-0 text-sm text-editor-subtle">
              Salvos neste navegador.
            </p>
          </div>

          {importError ? (
            <p className="m-0 rounded-xl border border-editor-danger/30 bg-red-50 px-3 py-2 text-sm text-editor-danger">
              {importError}
            </p>
          ) : null}

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-editor-border bg-white/70 px-6 py-12 text-center">
              <LayoutTemplate className="mb-3 text-editor-accent" size={36} />
              <h3 className="m-0 text-base font-bold">Nenhum projeto ainda</h3>
              <p className="mt-2 mb-5 max-w-md text-sm leading-relaxed text-editor-subtle">
                Use um modelo acima, crie um design em branco ou importe um
                arquivo `.opencanva.json`.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className={btnPrimary}
                  onClick={() => createAndOpenProject()}
                >
                  <FilePlus2 size={16} />
                  Criar novo projeto
                </button>
                <button
                  type="button"
                  className={btnGhost}
                  onClick={openImportPicker}
                  disabled={importing}
                >
                  <FileUp size={16} />
                  {importing ? 'Importando…' : 'Importar projeto'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <NewProjectCard
                onCreate={() => createAndOpenProject()}
                onImport={openImportPicker}
                importing={importing}
              />
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={() => openProject(project.id)}
                  onDuplicate={() => duplicateProject(project.id)}
                  onDelete={() => askDelete(project.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {confirmId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Cancelar"
            onClick={() => setConfirmId(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-editor-border bg-white p-5 shadow-2xl">
            <h2 className="m-0 text-lg font-bold">Excluir projeto?</h2>
            <p className="mt-2 mb-5 text-sm leading-relaxed text-editor-subtle">
              Essa ação não pode ser desfeita. O design será removido deste
              navegador.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className={btnGhost}
                onClick={() => setConfirmId(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`${btnPrimary} border-editor-danger bg-editor-danger hover:bg-red-700`}
                onClick={confirmDelete}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
