import { create } from 'zustand'
import {
  createDefaultDocument,
  createEllipseElement,
  createIconElement,
  createShapeElement,
  createImageElement,
  createPage,
  createRectElement,
  createTextElement,
  nextZIndex,
} from '../document/createElement'
import { applyElementUpdate } from '../document/elementUpdate'
import { measureTextBlockHeight } from '../document/measureText'
import type {
  DesignDocument,
  DesignElement,
  ElementUpdate,
  GeometricShape,
  Page,
  SidebarTab,
} from '../document/types'
import {
  createEmptyHistory,
  pushHistory,
  redoHistory,
  undoHistory,
  type HistoryState,
} from './historyStore'
import {
  createDebouncedProjectSaver,
  deleteProject as deleteStoredProject,
  duplicateProject as duplicateStoredProject,
  listProjects,
  loadProject,
  saveProject,
  type ProjectMeta,
} from './persist'
import {
  cloneImportedDocument,
  readProjectFile,
} from '../export/exportProject'
import { getTemplateById } from '../templates/catalog'

const debouncedSave = createDebouncedProjectSaver(500)


function getActivePage(document: DesignDocument): Page {
  const page = document.pages.find((item) => item.id === document.activePageId)
  if (!page) {
    return document.pages[0]
  }
  return page
}

function withActivePage(
  document: DesignDocument,
  updater: (page: Page) => Page,
): DesignDocument {
  return {
    ...document,
    pages: document.pages.map((page) =>
      page.id === document.activePageId ? updater(page) : page,
    ),
  }
}

function sortByZIndex(elements: DesignElement[]): DesignElement[] {
  return [...elements].sort((a, b) => a.zIndex - b.zIndex)
}

function reindexZ(elements: DesignElement[]): DesignElement[] {
  return elements.map((element, index) => ({
    ...element,
    zIndex: index + 1,
  }))
}

function applyZOrderMap(
  elements: DesignElement[],
  ordered: DesignElement[],
): DesignElement[] {
  const zById = new Map(ordered.map((element) => [element.id, element.zIndex]))
  return elements.map((element) => {
    const zIndex = zById.get(element.id)
    return zIndex === undefined ? element : { ...element, zIndex }
  })
}

type ZOrderAction = 'forward' | 'backward' | 'front' | 'back'

function reorderSelectionZ(
  elements: DesignElement[],
  selectedIds: string[],
  action: ZOrderAction,
): DesignElement[] {
  const selected = new Set(selectedIds)
  const ordered = sortByZIndex(elements)
  const picked = ordered.filter((element) => selected.has(element.id))
  if (picked.length === 0) {
    return elements
  }
  const others = ordered.filter((element) => !selected.has(element.id))

  if (action === 'front') {
    return applyZOrderMap(elements, reindexZ([...others, ...picked]))
  }
  if (action === 'back') {
    return applyZOrderMap(elements, reindexZ([...picked, ...others]))
  }

  const items = [...ordered]
  if (action === 'forward') {
    for (let index = items.length - 2; index >= 0; index -= 1) {
      if (
        selected.has(items[index].id) &&
        !selected.has(items[index + 1].id)
      ) {
        const swap = items[index]
        items[index] = items[index + 1]
        items[index + 1] = swap
      }
    }
  } else {
    for (let index = 1; index < items.length; index += 1) {
      if (
        selected.has(items[index].id) &&
        !selected.has(items[index - 1].id)
      ) {
        const swap = items[index]
        items[index] = items[index - 1]
        items[index - 1] = swap
      }
    }
  }
  return applyZOrderMap(elements, reindexZ(items))
}

type AlignEdge = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
type ElementUpdateInput =
  | ElementUpdate
  | ((element: DesignElement) => ElementUpdate)

interface EditorStore {
  view: 'home' | 'editor'
  projects: ProjectMeta[]
  document: DesignDocument
  history: HistoryState
  selectedIds: string[]
  zoom: number
  stagePosition: { x: number; y: number }
  sidebarTab: SidebarTab
  editingTextId: string | null
  editingTextDraft: string | null
  spacePressed: boolean
  isPanning: boolean
  clipboard: DesignElement[]
  saveStatus: 'saved' | 'saving'

  refreshProjects: () => void
  openProject: (id: string) => boolean
  createAndOpenProject: (name?: string) => void
  createAndOpenFromTemplate: (templateId: string) => boolean
  importAndOpenProject: (file: File) => Promise<boolean>
  duplicateProject: (id: string) => void
  deleteProject: (id: string) => void
  goHome: () => void

  setDesignName: (name: string) => void
  setSidebarTab: (tab: SidebarTab) => void
  setZoom: (zoom: number) => void
  setStagePosition: (position: { x: number; y: number }) => void
  setSpacePressed: (pressed: boolean) => void
  setIsPanning: (panning: boolean) => void
  startEditingText: (id: string) => void
  setEditingTextDraft: (text: string) => void
  finishEditingText: (options?: { discard?: boolean }) => void
  setEditingTextId: (id: string | null) => void
  setSelectedIds: (ids: string[]) => void
  clearSelection: () => void
  selectAll: () => void
  fitToPage: (viewportWidth: number, viewportHeight: number) => void

  commitDocument: (next: DesignDocument, recordHistory?: boolean) => void
  undo: () => void
  redo: () => void

  addRect: (rounded?: boolean) => void
  addEllipse: () => void
  addShape: (shape: GeometricShape) => void
  addText: (preset?: 'heading' | 'subheading' | 'body') => void
  addImage: (src: string, width?: number, height?: number) => void
  addIcon: (
    iconName: string,
    options?: { pack?: 'lucide' | 'simple'; fill?: string },
  ) => void
  updateElements: (ids: string[], update: ElementUpdateInput) => void
  syncTextHeight: (id: string, height: number) => void
  deleteSelected: () => void
  duplicateSelected: () => void
  copySelected: () => void
  pasteClipboard: () => void
  nudgeSelected: (dx: number, dy: number) => void
  alignSelected: (edge: AlignEdge) => void
  bringForward: () => void
  sendBackward: () => void
  bringToFront: () => void
  sendToBack: () => void

  addPage: () => void
  duplicatePage: () => void
  deletePage: (pageId: string) => void
  setActivePage: (pageId: string) => void
  updatePageBackground: (background: string) => void
  resizePage: (width: number, height: number) => void

  getActivePage: () => Page
  getSelectedElements: () => DesignElement[]
}

function resetEditorUi() {
  return {
    history: createEmptyHistory(),
    selectedIds: [] as string[],
    zoom: 0.55,
    stagePosition: { x: 80, y: 40 },
    sidebarTab: 'text' as SidebarTab,
    editingTextId: null as string | null,
    editingTextDraft: null as string | null,
    spacePressed: false,
    isPanning: false,
    clipboard: [] as DesignElement[],
    saveStatus: 'saved' as const,
  }
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  view: 'home',
  projects: listProjects(),
  document: createDefaultDocument(),
  ...resetEditorUi(),

  refreshProjects: () => set({ projects: listProjects() }),

  openProject: (id) => {
    const document = loadProject(id)
    if (!document) {
      get().refreshProjects()
      return false
    }
    set({
      view: 'editor',
      document,
      ...resetEditorUi(),
    })
    return true
  },

  createAndOpenProject: (name) => {
    const document = createDefaultDocument()
    if (name?.trim()) {
      document.name = name.trim()
    }
    saveProject(document)
    set({
      view: 'editor',
      document,
      projects: listProjects(),
      ...resetEditorUi(),
    })
  },

  createAndOpenFromTemplate: (templateId) => {
    const template = getTemplateById(templateId)
    if (!template) {
      return false
    }
    const document = template.build()
    saveProject(document)
    set({
      view: 'editor',
      document,
      projects: listProjects(),
      ...resetEditorUi(),
    })
    return true
  },

  importAndOpenProject: async (file) => {
    const imported = await readProjectFile(file)
    const document = cloneImportedDocument(imported)
    saveProject(document)
    set({
      view: 'editor',
      document,
      projects: listProjects(),
      ...resetEditorUi(),
    })
    return true
  },

  duplicateProject: (id) => {
    const clone = duplicateStoredProject(id)
    if (!clone) {
      return
    }
    set({ projects: listProjects() })
  },

  deleteProject: (id) => {
    const { view, document } = get()
    deleteStoredProject(id)
    if (view === 'editor' && document.id === id) {
      set({
        view: 'home',
        document: createDefaultDocument(),
        projects: listProjects(),
        ...resetEditorUi(),
      })
      return
    }
    set({ projects: listProjects() })
  },

  goHome: () => {
    const { document, view } = get()
    if (view === 'editor') {
      get().finishEditingText()
      saveProject(document)
    }
    set({
      view: 'home',
      document: createDefaultDocument(),
      projects: listProjects(),
      ...resetEditorUi(),
    })
  },

  setDesignName: (name) => {
    const { document, commitDocument } = get()
    commitDocument({ ...document, name })
  },
  setSidebarTab: (sidebarTab) =>
    set((state) => ({
      sidebarTab: state.sidebarTab === sidebarTab ? null : sidebarTab,
    })),
  setZoom: (zoom) => set({ zoom: Math.min(4, Math.max(0.1, zoom)) }),
  setStagePosition: (stagePosition) => set({ stagePosition }),
  setSpacePressed: (spacePressed) => set({ spacePressed }),
  setIsPanning: (isPanning) => set({ isPanning }),
  startEditingText: (id) => {
    const page = getActivePage(get().document)
    const element = page.elements.find((item) => item.id === id)
    if (!element || element.type !== 'text') {
      return
    }
    const selectedIds = get().selectedIds.includes(id)
      ? get().selectedIds
      : [id]
    set({
      editingTextId: id,
      editingTextDraft: element.text,
      selectedIds,
    })
  },
  setEditingTextDraft: (editingTextDraft) => set({ editingTextDraft }),
  finishEditingText: (options) => {
    const { editingTextId, editingTextDraft } = get()
    if (!editingTextId) {
      set({ editingTextDraft: null })
      return
    }
    if (!options?.discard && editingTextDraft !== null) {
      get().updateElements([editingTextId], { text: editingTextDraft })
    }
    set({ editingTextId: null, editingTextDraft: null })
  },
  setEditingTextId: (id) => {
    if (id === null) {
      get().finishEditingText()
      return
    }
    get().startEditingText(id)
  },
  setSelectedIds: (selectedIds) => set({ selectedIds }),
  clearSelection: () => {
    get().finishEditingText()
    set({ selectedIds: [] })
  },
  selectAll: () => {
    const page = getActivePage(get().document)
    set({ selectedIds: page.elements.map((element) => element.id) })
  },
  fitToPage: (viewportWidth, viewportHeight) => {
    const page = getActivePage(get().document)
    const padding = 64
    const zoom = Math.min(
      (viewportWidth - padding) / page.width,
      (viewportHeight - padding) / page.height,
      1.5,
    )
    set({
      zoom: Math.max(0.1, zoom),
      stagePosition: {
        x: (viewportWidth - page.width * zoom) / 2,
        y: (viewportHeight - page.height * zoom) / 2,
      },
    })
  },

  commitDocument: (next, recordHistory = true) => {
    const current = get().document
    const history = recordHistory
      ? pushHistory(get().history, current)
      : get().history
    set({ document: next, history, saveStatus: 'saving' })
    debouncedSave(next)
    window.setTimeout(() => set({ saveStatus: 'saved' }), 600)
  },

  undo: () => {
    const result = undoHistory(get().history, get().document)
    if (!result) {
      return
    }
    set({
      document: result.document,
      history: result.history,
      selectedIds: [],
      editingTextId: null,
      editingTextDraft: null,
      saveStatus: 'saving',
    })
    debouncedSave(result.document)
    window.setTimeout(() => set({ saveStatus: 'saved' }), 600)
  },

  redo: () => {
    const result = redoHistory(get().history, get().document)
    if (!result) {
      return
    }
    set({
      document: result.document,
      history: result.history,
      selectedIds: [],
      editingTextId: null,
      editingTextDraft: null,
      saveStatus: 'saving',
    })
    debouncedSave(result.document)
    window.setTimeout(() => set({ saveStatus: 'saved' }), 600)
  },

  addRect: (rounded = false) => {
    const document = get().document
    const page = getActivePage(document)
    const element = createRectElement({
      zIndex: nextZIndex(page.elements),
      cornerRadius: rounded ? 32 : 0,
      fill: rounded ? '#14b8a6' : '#3b82f6',
    })
    get().commitDocument(
      withActivePage(document, (active) => ({
        ...active,
        elements: [...active.elements, element],
      })),
    )
    set({ selectedIds: [element.id] })
  },

  addEllipse: () => {
    const document = get().document
    const page = getActivePage(document)
    const element = createEllipseElement({
      zIndex: nextZIndex(page.elements),
    })
    get().commitDocument(
      withActivePage(document, (active) => ({
        ...active,
        elements: [...active.elements, element],
      })),
    )
    set({ selectedIds: [element.id] })
  },

  addShape: (shape) => {
    const document = get().document
    const page = getActivePage(document)
    const element = createShapeElement(shape, {
      zIndex: nextZIndex(page.elements),
      x: Math.round((page.width - 360) / 2),
      y: Math.round((page.height - 360) / 2),
    })
    get().commitDocument(
      withActivePage(document, (active) => ({
        ...active,
        elements: [...active.elements, element],
      })),
    )
    set({ selectedIds: [element.id] })
  },

  addText: (preset = 'heading') => {
    const document = get().document
    const page = getActivePage(document)
    const presets = {
      heading: {
        text: 'Adicione um título',
        fontSize: 64,
        fontStyle: 'bold' as const,
      },
      subheading: {
        text: 'Adicione um subtítulo',
        fontSize: 36,
        fontStyle: 'bold' as const,
      },
      body: {
        text: 'Adicione um pouco de texto',
        fontSize: 24,
        fontStyle: 'normal' as const,
      },
    }
    const element = createTextElement({
      ...presets[preset],
      zIndex: nextZIndex(page.elements),
    })
    get().commitDocument(
      withActivePage(document, (active) => ({
        ...active,
        elements: [...active.elements, element],
      })),
    )
    set({ selectedIds: [element.id] })
    get().startEditingText(element.id)
  },

  addImage: (src, width = 600, height = 400) => {
    const document = get().document
    const page = getActivePage(document)
    const maxWidth = page.width * 0.7
    const scale = width > maxWidth ? maxWidth / width : 1
    const element = createImageElement(src, {
      width: Math.round(width * scale),
      height: Math.round(height * scale),
      x: Math.round((page.width - width * scale) / 2),
      y: Math.round((page.height - height * scale) / 2),
      zIndex: nextZIndex(page.elements),
    })
    get().commitDocument(
      withActivePage(document, (active) => ({
        ...active,
        elements: [...active.elements, element],
      })),
    )
    set({ selectedIds: [element.id] })
  },

  addIcon: (iconName, options) => {
    const document = get().document
    const page = getActivePage(document)
    const pack = options?.pack ?? 'lucide'
    const element = createIconElement(iconName, {
      iconPack: pack,
      fill: options?.fill ?? (pack === 'simple' ? '#0f172a' : '#0f172a'),
      strokeWidth: pack === 'simple' ? 0 : 2,
      zIndex: nextZIndex(page.elements),
      x: Math.round((page.width - 160) / 2),
      y: Math.round((page.height - 160) / 2),
    })
    get().commitDocument(
      withActivePage(document, (active) => ({
        ...active,
        elements: [...active.elements, element],
      })),
    )
    set({ selectedIds: [element.id] })
  },

  updateElements: (ids, update) => {
    if (ids.length === 0) {
      return
    }
    const idSet = new Set(ids)
    const resolveUpdate =
      typeof update === 'function'
        ? update
        : (_element: DesignElement) => update

    get().commitDocument(
      withActivePage(get().document, (page) => ({
        ...page,
        elements: page.elements.map((element) => {
          if (!idSet.has(element.id)) {
            return element
          }
          const patch = resolveUpdate(element)
          const next = applyElementUpdate(element, patch)
          if (next.type !== 'text') {
            return next
          }
          const touchesTextLayout =
            patch.text !== undefined ||
            patch.width !== undefined ||
            patch.fontSize !== undefined ||
            patch.fontFamily !== undefined ||
            patch.fontStyle !== undefined ||
            patch.align !== undefined ||
            patch.letterSpacing !== undefined ||
            patch.lineHeight !== undefined ||
            patch.textDecoration !== undefined
          if (!touchesTextLayout) {
            return next
          }
          if (patch.height !== undefined && patch.text === undefined) {
            return next
          }
          return {
            ...next,
            height: measureTextBlockHeight(next, next.text),
          }
        }),
      })),
    )
  },

  syncTextHeight: (id, height) => {
    const page = getActivePage(get().document)
    const element = page.elements.find((item) => item.id === id)
    if (!element || element.type !== 'text') {
      return
    }
    if (Math.abs(element.height - height) <= 1) {
      return
    }
    get().commitDocument(
      withActivePage(get().document, (active) => ({
        ...active,
        elements: active.elements.map((item) =>
          item.id === id && item.type === 'text'
            ? { ...item, height }
            : item,
        ),
      })),
      false,
    )
  },

  deleteSelected: () => {
    const { selectedIds, document, commitDocument } = get()
    if (selectedIds.length === 0) {
      return
    }
    const idSet = new Set(selectedIds)
    commitDocument(
      withActivePage(document, (page) => ({
        ...page,
        elements: page.elements.filter((element) => !idSet.has(element.id)),
      })),
    )
    set({ selectedIds: [], editingTextId: null, editingTextDraft: null })
  },

  duplicateSelected: () => {
    const { selectedIds, document, commitDocument } = get()
    if (selectedIds.length === 0) {
      return
    }
    const page = getActivePage(document)
    const selected = page.elements.filter((element) =>
      selectedIds.includes(element.id),
    )
    let z = nextZIndex(page.elements)
    const clones = selected.map((element) => ({
      ...structuredClone(element),
      id: crypto.randomUUID(),
      x: element.x + 24,
      y: element.y + 24,
      zIndex: z++,
    }))
    commitDocument(
      withActivePage(document, (active) => ({
        ...active,
        elements: [...active.elements, ...clones],
      })),
    )
    set({ selectedIds: clones.map((element) => element.id) })
  },

  copySelected: () => {
    const selected = get().getSelectedElements()
    if (selected.length === 0) {
      return
    }
    set({ clipboard: structuredClone(selected) })
  },

  pasteClipboard: () => {
    const { clipboard, document, commitDocument } = get()
    if (clipboard.length === 0) {
      return
    }
    const page = getActivePage(document)
    let z = nextZIndex(page.elements)
    const clones = clipboard.map((element) => ({
      ...structuredClone(element),
      id: crypto.randomUUID(),
      x: element.x + 32,
      y: element.y + 32,
      zIndex: z++,
    }))
    commitDocument(
      withActivePage(document, (active) => ({
        ...active,
        elements: [...active.elements, ...clones],
      })),
    )
    set({
      selectedIds: clones.map((element) => element.id),
      clipboard: clones,
    })
  },

  nudgeSelected: (dx, dy) => {
    const { selectedIds, document, commitDocument } = get()
    if (selectedIds.length === 0) {
      return
    }
    const idSet = new Set(selectedIds)
    commitDocument(
      withActivePage(document, (page) => ({
        ...page,
        elements: page.elements.map((element) =>
          idSet.has(element.id)
            ? { ...element, x: element.x + dx, y: element.y + dy }
            : element,
        ),
      })),
    )
  },

  alignSelected: (edge) => {
    const { selectedIds, document, commitDocument } = get()
    if (selectedIds.length === 0) {
      return
    }
    const page = getActivePage(document)
    const selected = page.elements.filter((element) =>
      selectedIds.includes(element.id),
    )
    const idSet = new Set(selectedIds)

    if (selected.length === 1) {
      const element = selected[0]
      const update: ElementUpdate = {}
      if (edge === 'left') update.x = 0
      if (edge === 'center') update.x = (page.width - element.width) / 2
      if (edge === 'right') update.x = page.width - element.width
      if (edge === 'top') update.y = 0
      if (edge === 'middle') update.y = (page.height - element.height) / 2
      if (edge === 'bottom') update.y = page.height - element.height
      commitDocument(
        withActivePage(document, (active) => ({
          ...active,
          elements: active.elements.map((item) =>
            item.id === element.id ? ({ ...item, ...update } as DesignElement) : item,
          ),
        })),
      )
      return
    }

    const minX = Math.min(...selected.map((element) => element.x))
    const maxX = Math.max(...selected.map((element) => element.x + element.width))
    const minY = Math.min(...selected.map((element) => element.y))
    const maxY = Math.max(...selected.map((element) => element.y + element.height))
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    commitDocument(
      withActivePage(document, (active) => ({
        ...active,
        elements: active.elements.map((element) => {
          if (!idSet.has(element.id)) {
            return element
          }
          if (edge === 'left') return { ...element, x: minX }
          if (edge === 'center')
            return { ...element, x: centerX - element.width / 2 }
          if (edge === 'right') return { ...element, x: maxX - element.width }
          if (edge === 'top') return { ...element, y: minY }
          if (edge === 'middle')
            return { ...element, y: centerY - element.height / 2 }
          return { ...element, y: maxY - element.height }
        }),
      })),
    )
  },

  bringForward: () => {
    const { selectedIds, document, commitDocument } = get()
    if (selectedIds.length === 0) {
      return
    }
    commitDocument(
      withActivePage(document, (page) => ({
        ...page,
        elements: reorderSelectionZ(page.elements, selectedIds, 'forward'),
      })),
    )
  },

  sendBackward: () => {
    const { selectedIds, document, commitDocument } = get()
    if (selectedIds.length === 0) {
      return
    }
    commitDocument(
      withActivePage(document, (page) => ({
        ...page,
        elements: reorderSelectionZ(page.elements, selectedIds, 'backward'),
      })),
    )
  },

  bringToFront: () => {
    const { selectedIds, document, commitDocument } = get()
    if (selectedIds.length === 0) {
      return
    }
    commitDocument(
      withActivePage(document, (page) => ({
        ...page,
        elements: reorderSelectionZ(page.elements, selectedIds, 'front'),
      })),
    )
  },

  sendToBack: () => {
    const { selectedIds, document, commitDocument } = get()
    if (selectedIds.length === 0) {
      return
    }
    commitDocument(
      withActivePage(document, (page) => ({
        ...page,
        elements: reorderSelectionZ(page.elements, selectedIds, 'back'),
      })),
    )
  },

  addPage: () => {
    const document = get().document
    const page = createPage(`Página ${document.pages.length + 1}`)
    get().commitDocument({
      ...document,
      pages: [...document.pages, page],
      activePageId: page.id,
    })
    get().finishEditingText()
    set({ selectedIds: [] })
  },

  duplicatePage: () => {
    const document = get().document
    const page = getActivePage(document)
    const clone = {
      ...structuredClone(page),
      id: crypto.randomUUID(),
      name: `${page.name} cópia`,
      elements: page.elements.map((element) => ({
        ...structuredClone(element),
        id: crypto.randomUUID(),
      })),
    }
    get().commitDocument({
      ...document,
      pages: [...document.pages, clone],
      activePageId: clone.id,
    })
    get().finishEditingText()
    set({ selectedIds: [] })
  },

  deletePage: (pageId) => {
    const document = get().document
    if (document.pages.length <= 1) {
      return
    }
    const pages = document.pages.filter((page) => page.id !== pageId)
    const activePageId =
      document.activePageId === pageId ? pages[0].id : document.activePageId
    get().commitDocument({ ...document, pages, activePageId })
    get().finishEditingText()
    set({ selectedIds: [] })
  },

  setActivePage: (pageId) => {
    const document = get().document
    if (!document.pages.some((page) => page.id === pageId)) {
      return
    }
    get().finishEditingText()
    get().commitDocument(
      { ...document, activePageId: pageId },
      false,
    )
    set({ selectedIds: [] })
  },

  updatePageBackground: (background) => {
    get().commitDocument(
      withActivePage(get().document, (page) => ({ ...page, background })),
    )
  },

  resizePage: (width, height) => {
    const nextWidth = Math.max(64, Math.min(8192, Math.round(width)))
    const nextHeight = Math.max(64, Math.min(8192, Math.round(height)))
    get().commitDocument(
      withActivePage(get().document, (page) => ({
        ...page,
        width: nextWidth,
        height: nextHeight,
      })),
    )
  },

  getActivePage: () => getActivePage(get().document),
  getSelectedElements: () => {
    const page = getActivePage(get().document)
    const selected = new Set(get().selectedIds)
    return page.elements.filter((element) => selected.has(element.id))
  },
}))
