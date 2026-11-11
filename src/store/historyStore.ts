import type { DesignDocument } from '../document/types'

const HISTORY_LIMIT = 50

export interface HistoryState {
  past: DesignDocument[]
  future: DesignDocument[]
}

export function createEmptyHistory(): HistoryState {
  return { past: [], future: [] }
}

export function pushHistory(
  history: HistoryState,
  previousDocument: DesignDocument,
): HistoryState {
  const past = [...history.past, structuredClone(previousDocument)]
  if (past.length > HISTORY_LIMIT) {
    past.shift()
  }
  return { past, future: [] }
}

export function undoHistory(
  history: HistoryState,
  current: DesignDocument,
): { history: HistoryState; document: DesignDocument } | null {
  if (history.past.length === 0) {
    return null
  }
  const past = [...history.past]
  const previous = past.pop()
  if (!previous) {
    return null
  }
  return {
    document: previous,
    history: {
      past,
      future: [structuredClone(current), ...history.future],
    },
  }
}

export function redoHistory(
  history: HistoryState,
  current: DesignDocument,
): { history: HistoryState; document: DesignDocument } | null {
  if (history.future.length === 0) {
    return null
  }
  const [next, ...future] = history.future
  return {
    document: next,
    history: {
      past: [...history.past, structuredClone(current)],
      future,
    },
  }
}
