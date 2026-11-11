import {
  isLucideIconName,
  lucideIconToDataUrl,
  lucideIconToSvg,
} from './lucideSvg'
import {
  loadSimpleIconCatalog,
  simpleIconToDataUrl,
  simpleIconToSvg,
  type SimpleIconEntry,
} from './simpleIcons'
import type { IconPack } from '../document/types'

let simpleBySlug: Map<string, SimpleIconEntry> | null = null

async function ensureSimpleMap(): Promise<Map<string, SimpleIconEntry>> {
  if (simpleBySlug) {
    return simpleBySlug
  }
  const catalog = await loadSimpleIconCatalog()
  simpleBySlug = new Map(catalog.map((icon) => [icon.slug, icon]))
  return simpleBySlug
}

export function iconToDataUrlSync(
  pack: IconPack,
  iconName: string,
  color: string,
  size: number,
  strokeWidth: number,
): string | null {
  if (pack === 'lucide' && isLucideIconName(iconName)) {
    return lucideIconToDataUrl(iconName, color, size, strokeWidth)
  }
  if (pack === 'simple' && simpleBySlug) {
    const icon = simpleBySlug.get(iconName)
    if (!icon) {
      return null
    }
    return simpleIconToDataUrl(icon, color, size)
  }
  return null
}

export async function iconToDataUrl(
  pack: IconPack,
  iconName: string,
  color: string,
  size: number,
  strokeWidth: number,
): Promise<string | null> {
  if (pack === 'simple') {
    await ensureSimpleMap()
  }
  return iconToDataUrlSync(pack, iconName, color, size, strokeWidth)
}

export async function iconToSvgMarkup(
  pack: IconPack,
  iconName: string,
  color: string,
  size: number,
  strokeWidth: number,
): Promise<string | null> {
  if (pack === 'lucide' && isLucideIconName(iconName)) {
    return lucideIconToSvg(iconName, color, size, strokeWidth)
  }
  if (pack === 'simple') {
    const map = await ensureSimpleMap()
    const icon = map.get(iconName)
    if (!icon) {
      return null
    }
    return simpleIconToSvg(icon, color, size)
  }
  return null
}

export function resolveIconLabel(pack: IconPack, iconName: string): string {
  if (pack === 'simple') {
    const cached = simpleBySlug?.get(iconName)
    if (cached) {
      return cached.title
    }
    return iconName
  }
  return iconName.replace(/([a-z])([A-Z])/g, '$1 $2')
}
