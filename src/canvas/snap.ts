import { shapeLabels } from '../document/shapes'
import type { DesignElement, Page } from '../document/types'

export interface SnapResult {
  x: number
  y: number
  vertical: number | null
  horizontal: number | null
}

function closest(
  value: number,
  targets: number[],
  threshold: number,
): { value: number; guide: number | null } {
  let best = value
  let guide: number | null = null
  let bestDist = threshold + 1
  for (const target of targets) {
    const dist = Math.abs(value - target)
    if (dist <= threshold && dist < bestDist) {
      bestDist = dist
      best = target
      guide = target
    }
  }
  return { value: best, guide }
}

export function snapElementPosition(
  page: Page,
  elementId: string,
  x: number,
  y: number,
  width: number,
  height: number,
  threshold = 8,
): SnapResult {
  const others = page.elements.filter((element) => element.id !== elementId)

  const xTargets = [
    0,
    page.width / 2 - width / 2,
    page.width - width,
    ...others.flatMap((element) => [
      element.x,
      element.x + element.width / 2 - width / 2,
      element.x + element.width - width,
    ]),
  ]

  const yTargets = [
    0,
    page.height / 2 - height / 2,
    page.height - height,
    ...others.flatMap((element) => [
      element.y,
      element.y + element.height / 2 - height / 2,
      element.y + element.height - height,
    ]),
  ]

  const snappedX = closest(x, xTargets, threshold)
  const snappedY = closest(y, yTargets, threshold)

  const guideXCandidates = [
    snappedX.value,
    snappedX.value + width / 2,
    snappedX.value + width,
  ]
  const guideYCandidates = [
    snappedY.value,
    snappedY.value + height / 2,
    snappedY.value + height,
  ]

  const pageAndOthersX = [
    0,
    page.width / 2,
    page.width,
    ...others.flatMap((element) => [
      element.x,
      element.x + element.width / 2,
      element.x + element.width,
    ]),
  ]
  const pageAndOthersY = [
    0,
    page.height / 2,
    page.height,
    ...others.flatMap((element) => [
      element.y,
      element.y + element.height / 2,
      element.y + element.height,
    ]),
  ]

  let vertical: number | null = null
  let horizontal: number | null = null
  for (const candidate of guideXCandidates) {
    if (pageAndOthersX.some((target) => Math.abs(target - candidate) < 0.5)) {
      vertical = candidate
      break
    }
  }
  for (const candidate of guideYCandidates) {
    if (pageAndOthersY.some((target) => Math.abs(target - candidate) < 0.5)) {
      horizontal = candidate
      break
    }
  }

  return {
    x: snappedX.value,
    y: snappedY.value,
    vertical,
    horizontal,
  }
}

export function elementLabel(element: DesignElement): string {
  if (element.type === 'text') {
    const text = element.text.trim() || 'Texto'
    return text.length > 24 ? `${text.slice(0, 24)}…` : text
  }
  if (element.type === 'rect') {
    return 'Retângulo'
  }
  if (element.type === 'ellipse') {
    return 'Elipse'
  }
  if (element.type === 'shape') {
    return shapeLabels[element.shape] ?? 'Forma'
  }
  if (element.type === 'icon') {
    if (element.iconPack === 'simple') {
      return element.iconName
    }
    return element.iconName.replace(/([a-z])([A-Z])/g, '$1 $2')
  }
  return 'Imagem'
}

export function boxesIntersect(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  )
}
