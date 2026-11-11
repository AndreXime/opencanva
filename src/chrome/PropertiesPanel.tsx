import { useState } from 'react'
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  Bold,
  Crop,
  FlipHorizontal2,
  FlipVertical2,
  Italic,
  Underline,
} from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import type { DesignElement, ImageElement, TextElement } from '../document/types'
import { designFonts } from '../fonts/catalog'
import {
  blobShapeIds,
  isBlobShape,
  shapeLabels,
  shapePresets,
  shapeSvgPath,
  type GeometricShape,
} from '../document/shapes'
import {
  isBold,
  isItalic,
  toggleBold,
  toggleItalic,
  toggleUnderline,
} from '../document/textStyle'
import { ColorField } from './ColorField'
import { CropImageModal } from './CropImageModal'
import { btnGhost, fieldControl, fieldLabel, panelTitle } from './ui'

function isImage(element: DesignElement): element is ImageElement {
  return element.type === 'image'
}

function isText(element: DesignElement): element is TextElement {
  return element.type === 'text'
}

function commonValue<T>(values: T[]): T | null {
  if (values.length === 0) {
    return null
  }
  const first = values[0]
  return values.every((value) => Object.is(value, first)) ? first : null
}

const typeLabels: Record<DesignElement['type'], string> = {
  rect: 'Retângulo',
  ellipse: 'Elipse',
  shape: 'Forma',
  text: 'Texto',
  image: 'Imagem',
  icon: 'Ícone',
}

export function PropertiesPanel() {
  const document = useEditorStore((state) => state.document)
  const selectedIds = useEditorStore((state) => state.selectedIds)
  const updateElements = useEditorStore((state) => state.updateElements)
  const bringForward = useEditorStore((state) => state.bringForward)
  const sendBackward = useEditorStore((state) => state.sendBackward)
  const bringToFront = useEditorStore((state) => state.bringToFront)
  const sendToBack = useEditorStore((state) => state.sendToBack)
  const alignSelected = useEditorStore((state) => state.alignSelected)
  const [cropOpen, setCropOpen] = useState(false)
  const page =
    document.pages.find((item) => item.id === document.activePageId) ??
    document.pages[0]
  const selected = page.elements.filter((element) =>
    selectedIds.includes(element.id),
  )

  if (selected.length === 0) {
    return null
  }

  const element = selected[0]
  const ids = selected.map((item) => item.id)
  const multi = selected.length > 1
  const sameType = selected.every((item) => item.type === element.type)
  const allHaveFill = selected.every((item) => 'fill' in item)
  const allText = selected.every(isText)
  const allRect = selected.every((item) => item.type === 'rect')
  const allBlob = selected.every(
    (item) => item.type === 'shape' && isBlobShape(item.shape),
  )
  const allLucideIcon = selected.every(
    (item) =>
      item.type === 'icon' && (item.iconPack ?? 'lucide') === 'lucide',
  )
  const allImage = selected.every(isImage)
  const singleImage = selected.length === 1 && isImage(element)

  const xValue = commonValue(selected.map((item) => Math.round(item.x)))
  const yValue = commonValue(selected.map((item) => Math.round(item.y)))
  const widthValue = commonValue(selected.map((item) => Math.round(item.width)))
  const heightValue = commonValue(
    selected.map((item) => Math.round(item.height)),
  )
  const rotationValue = commonValue(
    selected.map((item) => Math.round(item.rotation)),
  )
  const opacityValue = commonValue(selected.map((item) => item.opacity))
  const fillValue = allHaveFill
    ? commonValue(
        selected.map((item) => ('fill' in item ? item.fill : '')),
      )
    : null

  const title = multi
    ? sameType
      ? `${selected.length} × ${typeLabels[element.type]}`
      : `${selected.length} selecionados`
    : typeLabels[element.type]

  return (
    <>
      <aside className="flex w-[280px] shrink-0 flex-col gap-3 overflow-auto border-l border-editor-border bg-editor-surface p-4">
        <h2 className={panelTitle}>{title}</h2>

        <div className="flex flex-col gap-1.5">
          <span className={fieldLabel}>Alinhar</span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              className={btnGhost}
              onClick={() => alignSelected('left')}
              title="Esquerda"
            >
              <AlignStartVertical size={16} />
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => alignSelected('center')}
              title="Centro"
            >
              <AlignCenterVertical size={16} />
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => alignSelected('right')}
              title="Direita"
            >
              <AlignEndVertical size={16} />
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => alignSelected('top')}
              title="Topo"
            >
              <AlignStartHorizontal size={16} />
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => alignSelected('middle')}
              title="Meio"
            >
              <AlignCenterHorizontal size={16} />
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => alignSelected('bottom')}
              title="Base"
            >
              <AlignEndHorizontal size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel} htmlFor="prop-x">
              X
            </label>
            <input
              id="prop-x"
              className={fieldControl}
              type="number"
              value={xValue ?? ''}
              placeholder="—"
              onChange={(event) =>
                updateElements(ids, { x: Number(event.target.value) })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel} htmlFor="prop-y">
              Y
            </label>
            <input
              id="prop-y"
              className={fieldControl}
              type="number"
              value={yValue ?? ''}
              placeholder="—"
              onChange={(event) =>
                updateElements(ids, { y: Number(event.target.value) })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel} htmlFor="prop-w">
              Largura
            </label>
            <input
              id="prop-w"
              className={fieldControl}
              type="number"
              value={widthValue ?? ''}
              placeholder="—"
              onChange={(event) =>
                updateElements(ids, { width: Number(event.target.value) })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel} htmlFor="prop-h">
              Altura
            </label>
            <input
              id="prop-h"
              className={fieldControl}
              type="number"
              value={heightValue ?? ''}
              placeholder="—"
              onChange={(event) =>
                updateElements(ids, { height: Number(event.target.value) })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel} htmlFor="prop-rotation">
              Rotação
            </label>
            <input
              id="prop-rotation"
              className={fieldControl}
              type="number"
              value={rotationValue ?? ''}
              placeholder="—"
              onChange={(event) =>
                updateElements(ids, { rotation: Number(event.target.value) })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel} htmlFor="prop-opacity">
              Opacidade
            </label>
            <input
              id="prop-opacity"
              className={fieldControl}
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={opacityValue ?? 1}
              onChange={(event) =>
                updateElements(ids, { opacity: Number(event.target.value) })
              }
            />
          </div>
        </div>

        {allBlob ? (
          <div className="flex flex-col gap-1.5">
            <span className={fieldLabel}>Variação do blob</span>
            <div className="grid grid-cols-5 gap-1.5">
              {blobShapeIds.map((blobId) => {
                const preset = shapePresets.find((item) => item.id === blobId)
                const active =
                  commonValue(
                    selected.map((item) =>
                      item.type === 'shape' ? item.shape : null,
                    ),
                  ) === blobId
                const fill =
                  fillValue ??
                  (element.type === 'shape' ? element.fill : '#0d9488')
                return (
                  <button
                    key={blobId}
                    type="button"
                    title={shapeLabels[blobId]}
                    className={`flex h-11 cursor-pointer items-center justify-center rounded-[10px] border p-1 ${
                      active
                        ? 'border-editor-accent bg-editor-accent-soft'
                        : 'border-editor-border bg-editor-muted'
                    }`}
                    onClick={() =>
                      updateElements(ids, {
                        shape: blobId as GeometricShape,
                      })
                    }
                  >
                    <svg width={28} height={28} viewBox="0 0 28 28" aria-hidden>
                      <path
                        d={shapeSvgPath(blobId, 28, 28)}
                        fill={preset?.fill ?? fill}
                      />
                    </svg>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {allHaveFill ? (
          <ColorField
            id="prop-fill"
            label={fillValue === null ? 'Cor (várias)' : 'Cor'}
            value={fillValue ?? '#0d9488'}
            onChange={(color) => updateElements(ids, { fill: color })}
          />
        ) : null}

        {allLucideIcon ? (
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel} htmlFor="prop-stroke">
              Espessura
            </label>
            <input
              id="prop-stroke"
              className={fieldControl}
              type="range"
              min={1}
              max={4}
              step={0.25}
              value={
                commonValue(
                  selected.map((item) =>
                    item.type === 'icon' ? item.strokeWidth : 0,
                  ),
                ) ?? 2
              }
              onChange={(event) =>
                updateElements(ids, {
                  strokeWidth: Number(event.target.value),
                })
              }
            />
          </div>
        ) : null}

        {allRect ? (
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel} htmlFor="prop-radius">
              Cantos
            </label>
            <input
              id="prop-radius"
              className={fieldControl}
              type="range"
              min={0}
              max={200}
              value={
                commonValue(
                  selected.map((item) =>
                    item.type === 'rect' ? item.cornerRadius : 0,
                  ),
                ) ?? 0
              }
              onChange={(event) =>
                updateElements(ids, {
                  cornerRadius: Number(event.target.value),
                })
              }
            />
          </div>
        ) : null}

        {singleImage ? (
          <div className="flex flex-col gap-1.5">
            <span className={fieldLabel}>Imagem</span>
            <button
              type="button"
              className={btnGhost}
              onClick={() => setCropOpen(true)}
            >
              <Crop size={16} />
              Recortar
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`${btnGhost} ${
                  element.flipX
                    ? 'border-editor-accent bg-editor-accent-soft'
                    : ''
                }`}
                aria-pressed={Boolean(element.flipX)}
                onClick={() =>
                  updateElements(ids, (item) =>
                    item.type === 'image' ? { flipX: !item.flipX } : {},
                  )
                }
              >
                <FlipHorizontal2 size={16} />
                Flip H
              </button>
              <button
                type="button"
                className={`${btnGhost} ${
                  element.flipY
                    ? 'border-editor-accent bg-editor-accent-soft'
                    : ''
                }`}
                aria-pressed={Boolean(element.flipY)}
                onClick={() =>
                  updateElements(ids, (item) =>
                    item.type === 'image' ? { flipY: !item.flipY } : {},
                  )
                }
              >
                <FlipVertical2 size={16} />
                Flip V
              </button>
            </div>
            {element.crop ? (
              <button
                type="button"
                className={btnGhost}
                onClick={() => updateElements(ids, { crop: null })}
              >
                Limpar recorte
              </button>
            ) : null}
          </div>
        ) : null}

        {allImage && multi ? (
          <div className="flex flex-col gap-1.5">
            <span className={fieldLabel}>Imagem</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={btnGhost}
                onClick={() =>
                  updateElements(ids, (item) =>
                    item.type === 'image' ? { flipX: !item.flipX } : {},
                  )
                }
              >
                <FlipHorizontal2 size={16} />
                Flip H
              </button>
              <button
                type="button"
                className={btnGhost}
                onClick={() =>
                  updateElements(ids, (item) =>
                    item.type === 'image' ? { flipY: !item.flipY } : {},
                  )
                }
              >
                <FlipVertical2 size={16} />
                Flip V
              </button>
            </div>
          </div>
        ) : null}

        {allText ? (
          <>
            {!multi && isText(element) ? (
              <div className="flex flex-col gap-1.5">
                <label className={fieldLabel} htmlFor="prop-text">
                  Conteúdo
                </label>
                <textarea
                  id="prop-text"
                  className={`${fieldControl} min-h-24 resize-y`}
                  value={element.text}
                  onChange={(event) =>
                    updateElements(ids, { text: event.target.value })
                  }
                />
              </div>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel} htmlFor="prop-font-size">
                Tamanho
              </label>
              <input
                id="prop-font-size"
                className={fieldControl}
                type="number"
                min={8}
                max={400}
                value={
                  commonValue(
                    selected.map((item) =>
                      item.type === 'text' ? item.fontSize : 0,
                    ),
                  ) ?? ''
                }
                placeholder="—"
                onChange={(event) =>
                  updateElements(ids, {
                    fontSize: Number(event.target.value),
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel} htmlFor="prop-font-family">
                Fonte
              </label>
              <select
                id="prop-font-family"
                className={fieldControl}
                value={
                  commonValue(
                    selected.map((item) =>
                      item.type === 'text' ? item.fontFamily : '',
                    ),
                  ) ?? ''
                }
                onChange={(event) =>
                  updateElements(ids, { fontFamily: event.target.value })
                }
                style={{
                  fontFamily:
                    commonValue(
                      selected.map((item) =>
                        item.type === 'text' ? item.fontFamily : '',
                      ),
                    ) ?? undefined,
                }}
              >
                {commonValue(
                  selected.map((item) =>
                    item.type === 'text' ? item.fontFamily : '',
                  ),
                ) === null ? (
                  <option value="" disabled>
                    Várias fontes
                  </option>
                ) : null}
                {designFonts.map((font) => (
                  <option
                    key={font.id}
                    value={font.family}
                    style={{ fontFamily: font.family }}
                  >
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={fieldLabel}>Estilo</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  aria-label="Negrito"
                  aria-pressed={selected.every(
                    (item) => item.type === 'text' && isBold(item.fontStyle),
                  )}
                  className={`${btnGhost} ${
                    selected.every(
                      (item) => item.type === 'text' && isBold(item.fontStyle),
                    )
                      ? 'border-editor-accent bg-editor-accent-soft'
                      : ''
                  }`}
                  onClick={() =>
                    updateElements(ids, (item) =>
                      item.type === 'text'
                        ? { fontStyle: toggleBold(item.fontStyle) }
                        : {},
                    )
                  }
                >
                  <Bold size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Itálico"
                  aria-pressed={selected.every(
                    (item) => item.type === 'text' && isItalic(item.fontStyle),
                  )}
                  className={`${btnGhost} ${
                    selected.every(
                      (item) =>
                        item.type === 'text' && isItalic(item.fontStyle),
                    )
                      ? 'border-editor-accent bg-editor-accent-soft'
                      : ''
                  }`}
                  onClick={() =>
                    updateElements(ids, (item) =>
                      item.type === 'text'
                        ? { fontStyle: toggleItalic(item.fontStyle) }
                        : {},
                    )
                  }
                >
                  <Italic size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Sublinhado"
                  aria-pressed={selected.every(
                    (item) =>
                      item.type === 'text' &&
                      item.textDecoration === 'underline',
                  )}
                  className={`${btnGhost} ${
                    selected.every(
                      (item) =>
                        item.type === 'text' &&
                        item.textDecoration === 'underline',
                    )
                      ? 'border-editor-accent bg-editor-accent-soft'
                      : ''
                  }`}
                  onClick={() =>
                    updateElements(ids, (item) =>
                      item.type === 'text'
                        ? {
                            textDecoration: toggleUnderline(
                              item.textDecoration ?? 'none',
                            ),
                          }
                        : {},
                    )
                  }
                >
                  <Underline size={16} />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel} htmlFor="prop-align">
                Alinhamento
              </label>
              <select
                id="prop-align"
                className={fieldControl}
                value={
                  commonValue(
                    selected.map((item) =>
                      item.type === 'text' ? item.align : '',
                    ),
                  ) ?? ''
                }
                onChange={(event) =>
                  updateElements(ids, {
                    align: event.target.value as TextElement['align'],
                  })
                }
              >
                {commonValue(
                  selected.map((item) =>
                    item.type === 'text' ? item.align : '',
                  ),
                ) === null ? (
                  <option value="" disabled>
                    Vários
                  </option>
                ) : null}
                <option value="left">Esquerda</option>
                <option value="center">Centro</option>
                <option value="right">Direita</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel} htmlFor="prop-letter-spacing">
                Espaço entre letras
              </label>
              <input
                id="prop-letter-spacing"
                className={fieldControl}
                type="range"
                min={-10}
                max={40}
                step={1}
                value={
                  commonValue(
                    selected.map((item) =>
                      item.type === 'text' ? (item.letterSpacing ?? 0) : 0,
                    ),
                  ) ?? 0
                }
                onChange={(event) =>
                  updateElements(ids, {
                    letterSpacing: Number(event.target.value),
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabel} htmlFor="prop-line-height">
                Altura da linha
              </label>
              <input
                id="prop-line-height"
                className={fieldControl}
                type="range"
                min={0.8}
                max={2.4}
                step={0.05}
                value={
                  commonValue(
                    selected.map((item) =>
                      item.type === 'text' ? (item.lineHeight ?? 1.3) : 1.3,
                    ),
                  ) ?? 1.3
                }
                onChange={(event) =>
                  updateElements(ids, {
                    lineHeight: Number(event.target.value),
                  })
                }
              />
            </div>
          </>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <span className={fieldLabel}>Ordem</span>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={btnGhost} onClick={bringForward}>
              <ArrowUp size={16} />
              Frente
            </button>
            <button type="button" className={btnGhost} onClick={sendBackward}>
              <ArrowDown size={16} />
              Trás
            </button>
            <button type="button" className={btnGhost} onClick={bringToFront}>
              <ArrowUpToLine size={16} />
              Topo
            </button>
            <button type="button" className={btnGhost} onClick={sendToBack}>
              <ArrowDownToLine size={16} />
              Fundo
            </button>
          </div>
        </div>
      </aside>
      {cropOpen && singleImage ? (
        <CropImageModal element={element} onClose={() => setCropOpen(false)} />
      ) : null}
    </>
  )
}
