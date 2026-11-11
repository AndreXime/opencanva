import type { SimpleIcon } from 'simple-icons'

export interface SimpleIconEntry {
  slug: string
  title: string
  hex: string
  path: string
}

export interface SimpleIconGroup {
  id: string
  label: string
  icons: SimpleIconEntry[]
}

function isSimpleIcon(value: unknown): value is SimpleIcon {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Partial<SimpleIcon>
  return (
    typeof candidate.slug === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.path === 'string' &&
    typeof candidate.hex === 'string'
  )
}

let catalogPromise: Promise<SimpleIconEntry[]> | null = null

export function loadSimpleIconCatalog(): Promise<SimpleIconEntry[]> {
  if (!catalogPromise) {
    catalogPromise = import('simple-icons').then((module) => {
      const entries = Object.values(module)
        .filter(isSimpleIcon)
        .map((icon) => ({
          slug: icon.slug,
          title: icon.title,
          hex: icon.hex,
          path: icon.path,
        }))
        .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
      return entries
    })
  }
  return catalogPromise
}

export function buildSimpleIconGroups(
  icons: SimpleIconEntry[],
): SimpleIconGroup[] {
  const buckets = new Map<string, SimpleIconEntry[]>()
  for (const icon of icons) {
    const letter = icon.title.charAt(0).toUpperCase()
    const key = /[A-Z]/.test(letter) ? letter : '#'
    const list = buckets.get(key) ?? []
    list.push(icon)
    buckets.set(key, list)
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, groupIcons]) => ({
      id,
      label: id === '#' ? 'Outros' : id,
      icons: groupIcons,
    }))
}

export function filterSimpleIcons(
  icons: SimpleIconEntry[],
  query: string,
): SimpleIconEntry[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return icons
  }
  return icons.filter(
    (icon) =>
      icon.title.toLowerCase().includes(normalized) ||
      icon.slug.includes(normalized),
  )
}

export function getSimpleIcon(
  icons: SimpleIconEntry[],
  slug: string,
): SimpleIconEntry | undefined {
  return icons.find((icon) => icon.slug === slug)
}

export function simpleIconToSvg(
  icon: Pick<SimpleIconEntry, 'path' | 'title'>,
  color: string,
  size = 24,
): string {
  const escaped = color
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" role="img" fill="${escaped}"><title>${icon.title.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</title><path d="${icon.path}"/></svg>`
}

export function simpleIconToDataUrl(
  icon: Pick<SimpleIconEntry, 'path' | 'title'>,
  color: string,
  size = 24,
): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(simpleIconToSvg(icon, color, size))}`
}
