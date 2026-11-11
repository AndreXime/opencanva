import { Layers, Scaling } from 'lucide-react'
import { useState } from 'react'
import { elementLabel } from '../canvas/snap'
import { formatPageSize } from '../document/pagePresets'
import type { DesignElement } from '../document/types'
import { useEditorStore } from '../store/editorStore'
import { ColorField } from './ColorField'
import { ResizeModal } from './ResizeModal'
import { btnGhost, fieldLabel, panelTitle } from './ui'

const typeLabels: Record<DesignElement['type'], string> = {
  rect: 'Retângulo',
  ellipse: 'Elipse',
  shape: 'Forma',
  text: 'Texto',
  image: 'Imagem',
  icon: 'Ícone',
}

interface PageSettingsProps {
  idPrefix?: string
  showTitle?: boolean
  showLayers?: boolean
  showSize?: boolean
}

export function PageSettings({
  idPrefix = 'page',
  showTitle = true,
  showLayers = true,
  showSize = true,
}: PageSettingsProps) {
  const document = useEditorStore((state) => state.document)
  const setSelectedIds = useEditorStore((state) => state.setSelectedIds)
  const updatePageBackground = useEditorStore(
    (state) => state.updatePageBackground,
  )
  const [resizeOpen, setResizeOpen] = useState(false)

  const page =
    document.pages.find((item) => item.id === document.activePageId) ??
    document.pages[0]
  const layers = [...page.elements].sort((a, b) => b.zIndex - a.zIndex)
  const bgInputId = `${idPrefix}-bg`

  return (
    <>
      {showTitle ? <h2 className={panelTitle}>Página</h2> : null}

      {showSize ? (
        <div className="flex flex-col gap-1.5">
          <span className={fieldLabel}>Tamanho</span>
          <p className="m-0 text-sm text-editor-text">
            {formatPageSize(page.width, page.height)}
          </p>
          <button
            type="button"
            className={btnGhost}
            onClick={() => setResizeOpen(true)}
          >
            <Scaling size={16} />
            Redimensionar
          </button>
        </div>
      ) : null}

      <ColorField
        id={bgInputId}
        label="Fundo"
        value={page.background}
        onChange={updatePageBackground}
      />

      {showLayers ? (
        <>
          <h2 className={`${panelTitle} mt-2 flex items-center gap-2`}>
            <Layers size={16} />
            Camadas
          </h2>
          {layers.length === 0 ? (
            <p className="m-0 text-sm leading-relaxed text-editor-subtle">
              Nenhum elemento nesta página.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {layers.map((element) => (
                <button
                  key={element.id}
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] border border-editor-border bg-editor-muted px-3 py-2.5 text-left text-[13px]"
                  onClick={() => setSelectedIds([element.id])}
                >
                  <span>{elementLabel(element)}</span>
                  <span className="text-[11px] font-semibold text-editor-subtle">
                    {typeLabels[element.type]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : null}

      <ResizeModal open={resizeOpen} onClose={() => setResizeOpen(false)} />
    </>
  )
}
