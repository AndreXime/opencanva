import { icons, type IconNode } from 'lucide'

export type LucideIconName = keyof typeof icons

function escapeAttr(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function nodeToMarkup(node: IconNode): string {
  return node
    .map(([tag, attrs]) => {
      const attributes = Object.entries(attrs)
        .map(([key, value]) => `${key}="${escapeAttr(String(value))}"`)
        .join(' ')
      return `<${tag} ${attributes} />`
    })
    .join('')
}

export function isLucideIconName(name: string): name is LucideIconName {
  return Object.prototype.hasOwnProperty.call(icons, name)
}

export function lucideIconToSvg(
  name: LucideIconName,
  color: string,
  size = 24,
  strokeWidth = 2,
): string {
  const node = icons[name]
  const body = nodeToMarkup(node)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${escapeAttr(color)}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
}

export function lucideIconToDataUrl(
  name: LucideIconName,
  color: string,
  size = 24,
  strokeWidth = 2,
): string {
  const svg = lucideIconToSvg(name, color, size, strokeWidth)
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const lucideIconNames = Object.keys(icons) as LucideIconName[]
