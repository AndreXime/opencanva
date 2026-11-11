import { useRef, type ChangeEvent } from 'react'
import { ImagePlus, Type } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { btnPrimary } from './ui'
import { ElementsPanel } from './ElementsPanel'
import { PageSettings } from './PageSettings'

export function LeftPanel() {
  const sidebarTab = useEditorStore((state) => state.sidebarTab)
  const addText = useEditorStore((state) => state.addText)
  const addImage = useEditorStore((state) => state.addImage)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const src = typeof reader.result === 'string' ? reader.result : null
      if (!src) {
        return
      }
      const image = new Image()
      image.onload = () => {
        addImage(src, image.naturalWidth, image.naturalHeight)
      }
      image.src = src
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const titles = {
    elements: 'Elementos',
    text: 'Texto',
    uploads: 'Uploads',
    page: 'Página',
  } as const

  const title = sidebarTab ? titles[sidebarTab] : ''

  return (
    <aside className="flex h-full w-[320px] flex-col border-r border-editor-border bg-editor-bg">
      <div className="border-b border-editor-border px-4 py-3">
        <h2 className="m-0 text-base font-bold text-editor-text">{title}</h2>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-4">
        {sidebarTab === 'text' ? (
          <>
            <button
              type="button"
              className={`${btnPrimary} w-full py-3`}
              onClick={() => addText('body')}
            >
              <Type size={16} />
              Adicionar uma caixa de texto
            </button>

            <div className="mt-1 flex flex-col gap-2">
              <p className="m-0 text-xs font-bold uppercase tracking-wide text-editor-subtle">
                Combinações de texto padrão
              </p>
              <button
                type="button"
                className="w-full cursor-pointer rounded-xl border border-editor-border bg-editor-muted px-4 py-3 text-left hover:border-editor-accent"
                onClick={() => addText('heading')}
              >
                <div className="text-[11px] font-bold uppercase tracking-wide text-editor-subtle">
                  Título
                </div>
                <div className="mt-1 text-[28px] font-bold leading-tight text-editor-text">
                  Adicione um título
                </div>
              </button>
              <button
                type="button"
                className="w-full cursor-pointer rounded-xl border border-editor-border bg-editor-muted px-4 py-3 text-left hover:border-editor-accent"
                onClick={() => addText('subheading')}
              >
                <div className="text-[11px] font-bold uppercase tracking-wide text-editor-subtle">
                  Subtítulo
                </div>
                <div className="mt-1 text-lg font-bold text-editor-text">
                  Adicione um subtítulo
                </div>
              </button>
              <button
                type="button"
                className="w-full cursor-pointer rounded-xl border border-editor-border bg-editor-muted px-4 py-3 text-left hover:border-editor-accent"
                onClick={() => addText('body')}
              >
                <div className="text-[11px] font-bold uppercase tracking-wide text-editor-subtle">
                  Corpo de texto
                </div>
                <div className="mt-1 text-sm text-editor-text">
                  Adicione um pouco de texto ao seu design
                </div>
              </button>
            </div>
          </>
        ) : null}

        {sidebarTab === 'elements' ? <ElementsPanel /> : null}

        {sidebarTab === 'uploads' ? (
          <>
            <p className="m-0 text-sm leading-relaxed text-editor-subtle">
              Envie imagens do seu computador para usar no design.
            </p>
            <button
              type="button"
              className={`${btnPrimary} w-full py-3`}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus size={16} />
              Fazer upload de mídia
            </button>
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept="image/*"
              onChange={onFileChange}
            />
          </>
        ) : null}

        {sidebarTab === 'page' ? (
          <PageSettings idPrefix="sidebar-page" showTitle={false} />
        ) : null}
      </div>
    </aside>
  )
}
