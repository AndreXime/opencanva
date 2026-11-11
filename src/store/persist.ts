import { normalizeImageElement } from '../document/imageStyle'
import { normalizeTextElement } from '../document/textStyle'
import type { DesignDocument, DesignElement } from '../document/types'

const INDEX_KEY = 'opencanva-projects'
const LEGACY_DOCUMENT_KEY = 'canva-mvp-document'
const LEGACY_INDEX_KEY = 'canva-mvp-projects'
const LEGACY_PROJECT_PREFIX = 'canva-mvp-project:'
const projectKey = (id: string) => `opencanva-project:${id}`

function hasLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined'
  } catch {
    return false
  }
}

export interface ProjectMeta {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  pageCount: number
}

function normalizeElement(element: DesignElement): DesignElement {
  if (element.type === 'text') {
    return normalizeTextElement(element)
  }
  if (element.type === 'image') {
    return normalizeImageElement(element)
  }
  return element
}

export function normalizeDocument(document: DesignDocument): DesignDocument {
  return {
    ...document,
    pages: document.pages.map((page) => ({
      ...page,
      elements: page.elements.map(normalizeElement),
    })),
  }
}

function readIndex(): ProjectMeta[] {
  if (!hasLocalStorage()) {
    return []
  }
  try {
    const raw = localStorage.getItem(INDEX_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as { projects?: ProjectMeta[] }
    return Array.isArray(parsed.projects) ? parsed.projects : []
  } catch {
    return []
  }
}

function writeIndex(projects: ProjectMeta[]): void {
  if (!hasLocalStorage()) {
    return
  }
  localStorage.setItem(INDEX_KEY, JSON.stringify({ projects }))
}

function toMeta(document: DesignDocument, createdAt?: string): ProjectMeta {
  const now = new Date().toISOString()
  return {
    id: document.id,
    name: document.name || 'Design sem título',
    createdAt: createdAt ?? now,
    updatedAt: now,
    pageCount: document.pages.length,
  }
}

/** Migra chaves antigas `canva-mvp-*` e o documento único legado. */
export function migrateLegacyDocument(): void {
  if (!hasLocalStorage()) {
    return
  }
  try {
    let index = readIndex()

    const legacyIndexRaw = localStorage.getItem(LEGACY_INDEX_KEY)
    if (legacyIndexRaw) {
      try {
        const parsed = JSON.parse(legacyIndexRaw) as { projects?: ProjectMeta[] }
        const legacyProjects = Array.isArray(parsed.projects)
          ? parsed.projects
          : []
        for (const meta of legacyProjects) {
          const legacyRaw = localStorage.getItem(
            `${LEGACY_PROJECT_PREFIX}${meta.id}`,
          )
          if (!legacyRaw) {
            continue
          }
          const document = normalizeDocument(
            JSON.parse(legacyRaw) as DesignDocument,
          )
          localStorage.setItem(projectKey(document.id), JSON.stringify(document))
          localStorage.removeItem(`${LEGACY_PROJECT_PREFIX}${meta.id}`)
          if (!index.some((item) => item.id === meta.id)) {
            index = [meta, ...index]
          }
        }
      } catch {
        // Ignora índice legado quebrado
      }
      localStorage.removeItem(LEGACY_INDEX_KEY)
      writeIndex(index)
    }

    const legacyRaw = localStorage.getItem(LEGACY_DOCUMENT_KEY)
    if (!legacyRaw) {
      return
    }
    const legacy = normalizeDocument(JSON.parse(legacyRaw) as DesignDocument)
    const already = index.some((item) => item.id === legacy.id)
    if (!already) {
      localStorage.setItem(projectKey(legacy.id), JSON.stringify(legacy))
      writeIndex([toMeta(legacy), ...index])
    }
    localStorage.removeItem(LEGACY_DOCUMENT_KEY)
  } catch {
    // Ignora migração quebrada
  }
}

export function listProjects(): ProjectMeta[] {
  migrateLegacyDocument()
  return [...readIndex()].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  )
}

export function loadProject(id: string): DesignDocument | null {
  if (!hasLocalStorage()) {
    return null
  }
  try {
    const raw = localStorage.getItem(projectKey(id))
    if (!raw) {
      return null
    }
    return normalizeDocument(JSON.parse(raw) as DesignDocument)
  } catch {
    return null
  }
}

export function saveProject(document: DesignDocument): void {
  if (!hasLocalStorage()) {
    return
  }
  try {
    const normalized = normalizeDocument(document)
    localStorage.setItem(projectKey(normalized.id), JSON.stringify(normalized))
    const index = readIndex()
    const existing = index.find((item) => item.id === normalized.id)
    const meta = toMeta(normalized, existing?.createdAt)
    const next = existing
      ? index.map((item) => (item.id === meta.id ? meta : item))
      : [meta, ...index]
    writeIndex(next)
  } catch {
    // Quota or private mode
  }
}

export function deleteProject(id: string): void {
  if (!hasLocalStorage()) {
    return
  }
  try {
    localStorage.removeItem(projectKey(id))
    writeIndex(readIndex().filter((item) => item.id !== id))
  } catch {
    // ignore
  }
}

export function duplicateProject(id: string): DesignDocument | null {
  const source = loadProject(id)
  if (!source) {
    return null
  }
  const cloneId = crypto.randomUUID()
  const clone: DesignDocument = {
    ...structuredClone(source),
    id: cloneId,
    name: `${source.name} cópia`,
  }
  saveProject(clone)
  return clone
}

export function createDebouncedProjectSaver(delayMs: number) {
  let timer: ReturnType<typeof setTimeout> | null = null

  return (document: DesignDocument) => {
    if (timer !== null) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      saveProject(document)
      timer = null
    }, delayMs)
  }
}
