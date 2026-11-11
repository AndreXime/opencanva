import { createElement, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Circle,
  Image as ImageIcon,
  QrCode,
  Search,
  Shapes,
  Square,
  Squircle,
  Sparkles,
  BadgeCheck,
} from 'lucide-react'
import { icons } from 'lucide'
import {
  isBlobShape,
  shapePoints,
  shapePresets,
  shapeSvgPath,
  type GeometricShape,
} from '../document/shapes'
import { useEditorStore } from '../store/editorStore'

type SearchableShape =
  | {
      id: 'rect' | 'rounded' | 'ellipse'
      label: string
      keywords: string[]
      kind: 'basic'
    }
  | {
      id: GeometricShape
      label: string
      keywords: string[]
      kind: 'geometric'
      fill: string
    }

const searchableShapes: SearchableShape[] = [
  {
    id: 'rect',
    label: 'Retângulo',
    keywords: ['retangulo', 'quadrado', 'caixa', 'rect', 'square'],
    kind: 'basic',
  },
  {
    id: 'rounded',
    label: 'Arredondado',
    keywords: ['arredondado', 'cantos', 'rounded', 'squircle'],
    kind: 'basic',
  },
  {
    id: 'ellipse',
    label: 'Elipse',
    keywords: ['elipse', 'circulo', 'círculo', 'oval', 'ellipse', 'circle'],
    kind: 'basic',
  },
  ...shapePresets.map((preset) => ({
    id: preset.id,
    label: preset.label,
    keywords: [
      preset.label.toLowerCase(),
      preset.id,
      preset.id.replaceAll('-', ' '),
      ...(isBlobShape(preset.id)
        ? ['blob', 'globo', 'organico', 'orgânico', 'gota', 'nuvem', 'amoeba']
        : []),
    ],
    kind: 'geometric' as const,
    fill: preset.fill,
  })),
]

function filterShapes(query: string): SearchableShape[] {
  const normalized = query
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
  if (!normalized) {
    return searchableShapes
  }
  return searchableShapes.filter((shape) => {
    const haystack = [shape.label, ...shape.keywords]
      .join(' ')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
    return haystack.includes(normalized)
  })
}
import {
  filterIconNames,
  iconDisplayName,
  iconGroups,
  type IconGroup,
} from '../icons/lucideCatalog'
import type { LucideIconName } from '../icons/lucideSvg'
import {
  buildSimpleIconGroups,
  filterSimpleIcons,
  loadSimpleIconCatalog,
  type SimpleIconEntry,
  type SimpleIconGroup,
} from '../icons/simpleIcons'
import {
  filterLocalIllustrations,
  localIllustrations,
  type LocalIllustration,
} from '../stock/localIllustrations'
import { QrCodeGeneratorPanel } from './QrCodeGeneratorPanel'

type BrowseLevel =
  | { view: 'root' }
  | { view: 'shapes' }
  | { view: 'icons' }
  | { view: 'lucide' }
  | { view: 'lucide-group'; groupId: string }
  | { view: 'simple' }
  | { view: 'simple-group'; groupId: string }
  | { view: 'illustrations' }
  | { view: 'qrcode' }

function ShapePreview({
  points,
  fill,
  path,
}: {
  points?: number[]
  fill: string
  path?: string
}) {
  if (path) {
    return (
      <svg width={28} height={28} viewBox="0 0 28 28" aria-hidden>
        <path d={path} fill={fill} />
      </svg>
    )
  }
  const pairs: string[] = []
  const list = points ?? []
  for (let index = 0; index < list.length; index += 2) {
    pairs.push(`${list[index]},${list[index + 1]}`)
  }
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" aria-hidden>
      <polygon points={pairs.join(' ')} fill={fill} />
    </svg>
  )
}

function LucidePreview({ name }: { name: LucideIconName }) {
  const node = icons[name]
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-editor-text"
      aria-hidden
    >
      {node.map(([tag, attrs], index) =>
        createElement(tag, { key: index, ...attrs }),
      )}
    </svg>
  )
}

function SimplePreview({ icon }: { icon: SimpleIconEntry }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill={`#${icon.hex}`}
      aria-hidden
    >
      <path d={icon.path} />
    </svg>
  )
}

function LucideIconGrid({
  names,
  onPick,
}: {
  names: LucideIconName[]
  onPick: (name: LucideIconName) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-1">
      {names.map((name) => (
        <button
          key={name}
          type="button"
          title={iconDisplayName(name)}
          className="flex aspect-square items-center justify-center rounded-lg border border-editor-border bg-editor-muted hover:border-editor-accent hover:bg-editor-accent-soft"
          onClick={() => onPick(name)}
        >
          <LucidePreview name={name} />
        </button>
      ))}
    </div>
  )
}

function SimpleIconGrid({
  icons,
  onPick,
}: {
  icons: SimpleIconEntry[]
  onPick: (icon: SimpleIconEntry) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-1">
      {icons.map((icon) => (
        <button
          key={icon.slug}
          type="button"
          title={icon.title}
          className="flex aspect-square items-center justify-center rounded-lg border border-editor-border bg-editor-muted hover:border-editor-accent hover:bg-editor-accent-soft"
          onClick={() => onPick(icon)}
        >
          <SimplePreview icon={icon} />
        </button>
      ))}
    </div>
  )
}

function CategoryTile({
  title,
  subtitle,
  icon: Icon,
  onOpen,
}: {
  title: string
  subtitle: string
  icon: typeof Shapes
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      className="flex min-h-[88px] cursor-pointer flex-col items-start justify-center gap-2 rounded-xl border border-editor-border bg-editor-muted px-3 py-3 text-left hover:border-editor-accent hover:bg-editor-accent-soft"
      onClick={onOpen}
    >
      <Icon size={22} className="text-editor-accent" strokeWidth={1.75} />
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-editor-text">
          {title}
        </span>
        <span className="block text-[11px] text-editor-subtle">{subtitle}</span>
      </span>
    </button>
  )
}

function GroupTile({
  label,
  count,
  onOpen,
}: {
  label: string
  count: number
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      className="flex min-h-[72px] cursor-pointer flex-col justify-center gap-1 rounded-xl border border-editor-border bg-editor-muted px-3 py-3 text-left hover:border-editor-accent hover:bg-editor-accent-soft"
      onClick={onOpen}
    >
      <span className="line-clamp-2 text-[12px] font-semibold leading-snug text-editor-text">
        {label}
      </span>
      <span className="text-[11px] text-editor-subtle">{count} ícones</span>
    </button>
  )
}

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="flex items-center gap-2 rounded-full border border-editor-border bg-editor-muted px-3 py-2 text-sm text-editor-subtle">
      <Search size={16} />
      <input
        className="w-full border-0 bg-transparent outline-none placeholder:text-editor-subtle"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 self-start rounded-lg px-1 py-1 text-sm font-semibold text-editor-text hover:bg-editor-muted"
      onClick={onClick}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  )
}

function IllustrationsPanel() {
  const addImage = useEditorStore((state) => state.addImage)
  const [query, setQuery] = useState('')
  const [addingId, setAddingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const items = useMemo(() => filterLocalIllustrations(query), [query])

  const onAdd = async (item: LocalIllustration) => {
    setAddingId(item.id)
    setError(null)
    try {
      const size = await new Promise<{ width: number; height: number }>(
        (resolve, reject) => {
          const image = new Image()
          image.onload = () =>
            resolve({ width: image.naturalWidth, height: image.naturalHeight })
          image.onerror = () => reject(new Error('Não foi possível carregar a ilustração'))
          image.src = item.src
        },
      )
      addImage(item.src, size.width, size.height)
    } catch (addError) {
      setError(
        addError instanceof Error
          ? addError.message
          : 'Não foi possível adicionar a ilustração',
      )
    } finally {
      setAddingId(null)
    }
  }

  return (
    <>
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Buscar ilustrações"
      />
      <p className="m-0 text-xs text-editor-subtle">
        {items.length.toLocaleString('pt-BR')} ilustrações
      </p>
      {error ? (
        <p className="m-0 rounded-lg bg-red-50 px-3 py-2 text-xs text-editor-danger">
          {error}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="group relative overflow-hidden rounded-xl border border-editor-border bg-editor-muted text-left hover:border-editor-accent"
            onClick={() => {
              void onAdd(item)
            }}
            disabled={addingId === item.id}
            title={item.label}
          >
            <img
              src={item.src}
              alt={item.label}
              className="aspect-square w-full object-contain p-2"
              loading="lazy"
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
              {addingId === item.id ? 'Adicionando…' : item.label}
            </span>
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <p className="m-0 text-sm text-editor-subtle">Nenhuma ilustração encontrada.</p>
      ) : null}
    </>
  )
}

export function ElementsPanel() {
  const addRect = useEditorStore((state) => state.addRect)
  const addEllipse = useEditorStore((state) => state.addEllipse)
  const addShape = useEditorStore((state) => state.addShape)
  const addIcon = useEditorStore((state) => state.addIcon)
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<BrowseLevel>({ view: 'root' })
  const [simpleIcons, setSimpleIcons] = useState<SimpleIconEntry[] | null>(null)
  const [simpleLoading, setSimpleLoading] = useState(false)

  const filteredLucide = useMemo(() => filterIconNames(query), [query])
  const filteredShapes = useMemo(() => filterShapes(query), [query])
  const searching = query.trim().length > 0
  const lucideTotal = iconGroups.reduce(
    (total, group) => total + group.icons.length,
    0,
  )

  const addSearchableShape = (shape: SearchableShape) => {
    if (shape.kind === 'basic') {
      if (shape.id === 'rect') {
        addRect(false)
        return
      }
      if (shape.id === 'rounded') {
        addRect(true)
        return
      }
      addEllipse()
      return
    }
    addShape(shape.id)
  }

  const shapeButtonPreview = (shape: SearchableShape) => {
    if (shape.kind === 'basic') {
      if (shape.id === 'rect') {
        return <Square className="text-sky-500" size={24} />
      }
      if (shape.id === 'rounded') {
        return <Squircle className="text-violet-500" size={24} />
      }
      return <Circle className="text-amber-500" size={24} />
    }
    if (isBlobShape(shape.id)) {
      return (
        <ShapePreview path={shapeSvgPath(shape.id, 28, 28)} fill={shape.fill} />
      )
    }
    return (
      <ShapePreview
        points={shapePoints(shape.id, 28, 28)}
        fill={shape.fill}
      />
    )
  }

  const simpleGroups = useMemo(
    () => (simpleIcons ? buildSimpleIconGroups(simpleIcons) : []),
    [simpleIcons],
  )
  const filteredSimple = useMemo(
    () => (simpleIcons ? filterSimpleIcons(simpleIcons, query) : []),
    [simpleIcons, query],
  )

  const activeLucideGroup =
    level.view === 'lucide-group'
      ? iconGroups.find((group) => group.id === level.groupId)
      : undefined
  const activeSimpleGroup =
    level.view === 'simple-group'
      ? simpleGroups.find((group) => group.id === level.groupId)
      : undefined

  const ensureSimpleIcons = () => {
    if (simpleIcons || simpleLoading) {
      return
    }
    setSimpleLoading(true)
    void loadSimpleIconCatalog()
      .then((catalog) => setSimpleIcons(catalog))
      .finally(() => setSimpleLoading(false))
  }

  const pickLucide = (name: LucideIconName) => {
    addIcon(name, { pack: 'lucide' })
  }

  const pickSimple = (icon: SimpleIconEntry) => {
    addIcon(icon.slug, { pack: 'simple', fill: `#${icon.hex}` })
  }

  if (searching && (level.view === 'root' || level.view === 'icons')) {
    return (
      <>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Busque formas e ícones"
        />
        {filteredShapes.length > 0 ? (
          <>
            <p className="m-0 text-xs font-bold uppercase tracking-wide text-editor-subtle">
              Formas ({filteredShapes.length})
            </p>
            <div className="grid grid-cols-3 gap-2">
              {filteredShapes.map((shape) => (
                <button
                  key={shape.id}
                  type="button"
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-editor-border bg-editor-muted px-2 py-3 text-[11px] font-semibold hover:border-editor-accent hover:bg-editor-accent-soft"
                  onClick={() => addSearchableShape(shape)}
                >
                  {shapeButtonPreview(shape)}
                  {shape.label}
                </button>
              ))}
            </div>
          </>
        ) : null}
        <p className="m-0 text-xs font-bold uppercase tracking-wide text-editor-subtle">
          Lucide ({filteredLucide.length})
        </p>
        {filteredLucide.length > 0 ? (
          <LucideIconGrid
            names={filteredLucide.slice(0, 120)}
            onPick={pickLucide}
          />
        ) : (
          <p className="m-0 text-sm text-editor-subtle">Nenhum ícone encontrado.</p>
        )}
      </>
    )
  }

  if (level.view === 'shapes') {
    const shapesToShow = searching ? filteredShapes : searchableShapes

    return (
      <>
        <BackButton
          label="Elementos"
          onClick={() => {
            setQuery('')
            setLevel({ view: 'root' })
          }}
        />
        <div>
          <p className="m-0 text-sm font-bold text-editor-text">Formas</p>
          <p className="m-0 text-xs text-editor-subtle">
            {searchableShapes.length} formas geométricas
          </p>
        </div>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Buscar formas"
        />
        <div className="grid grid-cols-3 gap-2">
          {shapesToShow.map((shape) => (
            <button
              key={shape.id}
              type="button"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-editor-border bg-editor-muted px-2 py-3 text-[11px] font-semibold hover:border-editor-accent hover:bg-editor-accent-soft"
              onClick={() => addSearchableShape(shape)}
            >
              {shapeButtonPreview(shape)}
              {shape.label}
            </button>
          ))}
        </div>
        {searching && shapesToShow.length === 0 ? (
          <p className="m-0 text-sm text-editor-subtle">Nenhuma forma encontrada.</p>
        ) : null}
      </>
    )
  }

  if (level.view === 'lucide-group' && activeLucideGroup) {
    const names = searching
      ? activeLucideGroup.icons.filter((name) =>
          filterIconNames(query).includes(name),
        )
      : activeLucideGroup.icons
    return (
      <>
        <BackButton
          label="Ícones Lucide"
          onClick={() => {
            setQuery('')
            setLevel({ view: 'lucide' })
          }}
        />
        <div>
          <p className="m-0 text-sm font-bold text-editor-text">
            {activeLucideGroup.label}
          </p>
          <p className="m-0 text-xs text-editor-subtle">
            {activeLucideGroup.icons.length} ícones
          </p>
        </div>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={`Buscar em ${activeLucideGroup.label}`}
        />
        <LucideIconGrid names={names} onPick={pickLucide} />
      </>
    )
  }

  if (level.view === 'lucide') {
    return (
      <>
        <BackButton
          label="Ícones"
          onClick={() => {
            setQuery('')
            setLevel({ view: 'icons' })
          }}
        />
        <div>
          <p className="m-0 text-sm font-bold text-editor-text">Ícones Lucide</p>
          <p className="m-0 text-xs text-editor-subtle">
            {lucideTotal.toLocaleString('pt-BR')} ícones em categorias
          </p>
        </div>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Buscar ícones Lucide"
        />
        {searching ? (
          <LucideIconGrid
            names={filteredLucide.slice(0, 300)}
            onPick={pickLucide}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {iconGroups.map((group: IconGroup) => (
              <GroupTile
                key={group.id}
                label={group.label}
                count={group.icons.length}
                onOpen={() =>
                  setLevel({ view: 'lucide-group', groupId: group.id })
                }
              />
            ))}
          </div>
        )}
      </>
    )
  }

  if (level.view === 'simple-group' && activeSimpleGroup) {
    const iconsInGroup = searching
      ? filterSimpleIcons(activeSimpleGroup.icons, query)
      : activeSimpleGroup.icons
    return (
      <>
        <BackButton
          label="Simple Icons"
          onClick={() => {
            setQuery('')
            setLevel({ view: 'simple' })
          }}
        />
        <div>
          <p className="m-0 text-sm font-bold text-editor-text">
            {activeSimpleGroup.label}
          </p>
          <p className="m-0 text-xs text-editor-subtle">
            {activeSimpleGroup.icons.length} marcas
          </p>
        </div>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={`Buscar em ${activeSimpleGroup.label}`}
        />
        <SimpleIconGrid icons={iconsInGroup} onPick={pickSimple} />
      </>
    )
  }

  if (level.view === 'simple') {
    return (
      <>
        <BackButton
          label="Ícones"
          onClick={() => {
            setQuery('')
            setLevel({ view: 'icons' })
          }}
        />
        <div>
          <p className="m-0 text-sm font-bold text-editor-text">Simple Icons</p>
          <p className="m-0 text-xs text-editor-subtle">
            {simpleIcons
              ? `${simpleIcons.length.toLocaleString('pt-BR')} marcas`
              : 'Carregando catálogo…'}
          </p>
        </div>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Buscar marcas"
        />
        {simpleLoading || !simpleIcons ? (
          <p className="m-0 text-sm text-editor-subtle">Carregando ícones…</p>
        ) : searching ? (
          <SimpleIconGrid
            icons={filteredSimple.slice(0, 300)}
            onPick={pickSimple}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {simpleGroups.map((group: SimpleIconGroup) => (
              <GroupTile
                key={group.id}
                label={group.label}
                count={group.icons.length}
                onOpen={() =>
                  setLevel({ view: 'simple-group', groupId: group.id })
                }
              />
            ))}
          </div>
        )}
      </>
    )
  }

  if (level.view === 'icons') {
    return (
      <>
        <BackButton
          label="Elementos"
          onClick={() => setLevel({ view: 'root' })}
        />
        <div>
          <p className="m-0 text-sm font-bold text-editor-text">Ícones</p>
          <p className="m-0 text-xs text-editor-subtle">
            Lucide e Simple Icons
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <CategoryTile
            title="Lucide"
            subtitle={`${lucideTotal.toLocaleString('pt-BR')} ícones`}
            icon={Sparkles}
            onOpen={() => setLevel({ view: 'lucide' })}
          />
          <CategoryTile
            title="Simple Icons"
            subtitle="Marcas e logos"
            icon={BadgeCheck}
            onOpen={() => {
              ensureSimpleIcons()
              setLevel({ view: 'simple' })
            }}
          />
        </div>
      </>
    )
  }

  if (level.view === 'illustrations') {
    return (
      <>
        <BackButton
          label="Elementos"
          onClick={() => setLevel({ view: 'root' })}
        />
        <div>
          <p className="m-0 text-sm font-bold text-editor-text">Ilustrações</p>
          <p className="m-0 text-xs text-editor-subtle">
            {localIllustrations.length} arquivos locais
          </p>
        </div>
        <IllustrationsPanel />
      </>
    )
  }

  if (level.view === 'qrcode') {
    return (
      <>
        <BackButton
          label="Elementos"
          onClick={() => setLevel({ view: 'root' })}
        />
        <div>
          <p className="m-0 text-sm font-bold text-editor-text">
            Gerador de QR Code
          </p>
          <p className="m-0 text-xs text-editor-subtle">
            Gere, baixe ou adicione ao design
          </p>
        </div>
        <QrCodeGeneratorPanel />
      </>
    )
  }

  return (
    <>
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Busque formas e ícones"
      />
      <p className="m-0 text-xs font-bold uppercase tracking-wide text-editor-subtle">
        Categorias
      </p>
      <div className="grid grid-cols-2 gap-2">
        <CategoryTile
          title="Formas"
          subtitle={`${3 + shapePresets.length} formas`}
          icon={Shapes}
          onOpen={() => setLevel({ view: 'shapes' })}
        />
        <CategoryTile
          title="Ícones"
          subtitle="Lucide + Simple Icons"
          icon={Sparkles}
          onOpen={() => setLevel({ view: 'icons' })}
        />
        <CategoryTile
          title="Ilustrações"
          subtitle={`${localIllustrations.length} imagens`}
          icon={ImageIcon}
          onOpen={() => setLevel({ view: 'illustrations' })}
        />
        <CategoryTile
          title="QR Code"
          subtitle="Gerar e baixar"
          icon={QrCode}
          onOpen={() => setLevel({ view: 'qrcode' })}
        />
      </div>
    </>
  )
}
