import { normalizeDocument } from '../store/persist'
import type { DesignDocument } from '../document/types'

export const PROJECT_FILE_FORMAT = 'opencanva-project'
export const PROJECT_FILE_VERSION = 1

export interface ExportedProjectFile {
  format: typeof PROJECT_FILE_FORMAT
  version: number
  exportedAt: string
  document: DesignDocument
}

export class ProjectImportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProjectImportError'
  }
}

function sanitizeFileName(name: string): string {
  const cleaned = name
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\w\s-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
  return cleaned || 'projeto'
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

export function buildProjectExportPayload(
  document: DesignDocument,
): ExportedProjectFile {
  return {
    format: PROJECT_FILE_FORMAT,
    version: PROJECT_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    document,
  }
}

/** Baixa o projeto atual como arquivo JSON portátil. */
export function exportProjectFile(document: DesignDocument): void {
  const payload = buildProjectExportPayload(document)
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  downloadBlob(blob, `${sanitizeFileName(document.name)}.opencanva.json`)
}

function isDesignDocument(value: unknown): value is DesignDocument {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Partial<DesignDocument>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.activePageId === 'string' &&
    Array.isArray(candidate.pages) &&
    candidate.pages.length > 0
  )
}

/** Aceita envelope OpenCanva ou o DesignDocument puro. */
export function parseProjectFileJson(raw: string): DesignDocument {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw) as unknown
  } catch {
    throw new ProjectImportError('Arquivo JSON inválido.')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new ProjectImportError('Conteúdo do arquivo inválido.')
  }

  const envelope = parsed as Partial<ExportedProjectFile>
  if (envelope.format === PROJECT_FILE_FORMAT) {
    if (!isDesignDocument(envelope.document)) {
      throw new ProjectImportError('Projeto exportado sem documento válido.')
    }
    return normalizeDocument(envelope.document)
  }

  if (isDesignDocument(parsed)) {
    return normalizeDocument(parsed)
  }

  throw new ProjectImportError(
    'Este arquivo não é um projeto OpenCanva reconhecido.',
  )
}

/** Gera novos IDs para o documento importado não colidir com projetos locais. */
export function cloneImportedDocument(source: DesignDocument): DesignDocument {
  const clone = structuredClone(source)
  clone.id = crypto.randomUUID()
  const pageIdMap = new Map<string, string>()
  clone.pages = clone.pages.map((page) => {
    const nextPageId = crypto.randomUUID()
    pageIdMap.set(page.id, nextPageId)
    return {
      ...page,
      id: nextPageId,
      elements: page.elements.map((element) => ({
        ...element,
        id: crypto.randomUUID(),
      })),
    }
  })
  clone.activePageId =
    pageIdMap.get(source.activePageId) ?? clone.pages[0]?.id ?? clone.activePageId
  return normalizeDocument(clone)
}

export async function readProjectFile(file: File): Promise<DesignDocument> {
  const raw = await file.text()
  return parseProjectFileJson(raw)
}
