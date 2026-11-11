import type { DesignElement, ElementUpdate } from './types'

const SHARED_KEYS = new Set<keyof ElementUpdate>([
  'x',
  'y',
  'width',
  'height',
  'rotation',
  'opacity',
  'zIndex',
])

const TEXT_KEYS = new Set<keyof ElementUpdate>([
  'text',
  'fontSize',
  'fontFamily',
  'fontStyle',
  'textDecoration',
  'letterSpacing',
  'lineHeight',
  'align',
])

const IMAGE_KEYS = new Set<keyof ElementUpdate>(['src', 'crop', 'flipX', 'flipY'])

const ICON_KEYS = new Set<keyof ElementUpdate>([
  'iconName',
  'iconPack',
  'strokeWidth',
])

function canApplyKey(
  element: DesignElement,
  key: keyof ElementUpdate,
): boolean {
  if (SHARED_KEYS.has(key)) {
    return true
  }
  if (key === 'fill') {
    return 'fill' in element
  }
  if (key === 'cornerRadius') {
    return element.type === 'rect'
  }
  if (key === 'shape') {
    return element.type === 'shape'
  }
  if (TEXT_KEYS.has(key)) {
    return element.type === 'text'
  }
  if (IMAGE_KEYS.has(key)) {
    return element.type === 'image'
  }
  if (ICON_KEYS.has(key)) {
    return element.type === 'icon'
  }
  return false
}

/** Aplica só campos válidos para o tipo do elemento (seguro em multi-seleção). */
export function applyElementUpdate(
  element: DesignElement,
  update: ElementUpdate,
): DesignElement {
  let next: DesignElement = element
  for (const key of Object.keys(update) as Array<keyof ElementUpdate>) {
    const value = update[key]
    if (value === undefined || !canApplyKey(element, key)) {
      continue
    }
    next = { ...next, [key]: value } as DesignElement
  }
  return next
}
