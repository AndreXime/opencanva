export type GeometricShape =
  | 'triangle'
  | 'right-triangle'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'octagon'
  | 'star'
  | 'parallelogram'
  | 'trapezoid'
  | 'arrow'
  | 'cross'
  | 'plus'
  | 'blob'
  | 'blob-wave'
  | 'blob-drop'
  | 'blob-cloud'
  | 'blob-stone'

export interface ShapePreset {
  id: GeometricShape
  label: string
  fill: string
}

export const shapePresets: ShapePreset[] = [
  { id: 'triangle', label: 'Triângulo', fill: '#22c55e' },
  { id: 'right-triangle', label: 'Triângulo retângulo', fill: '#84cc16' },
  { id: 'diamond', label: 'Losango', fill: '#06b6d4' },
  { id: 'pentagon', label: 'Pentágono', fill: '#0ea5e9' },
  { id: 'hexagon', label: 'Hexágono', fill: '#6366f1' },
  { id: 'octagon', label: 'Octógono', fill: '#8b5cf6' },
  { id: 'star', label: 'Estrela', fill: '#eab308' },
  { id: 'parallelogram', label: 'Paralelogramo', fill: '#f97316' },
  { id: 'trapezoid', label: 'Trapézio', fill: '#ef4444' },
  { id: 'arrow', label: 'Seta', fill: '#ec4899' },
  { id: 'cross', label: 'Cruz', fill: '#64748b' },
  { id: 'plus', label: 'Mais', fill: '#0f766e' },
  { id: 'blob', label: 'Blob', fill: '#14b8a6' },
  { id: 'blob-wave', label: 'Blob ondulado', fill: '#2dd4bf' },
  { id: 'blob-drop', label: 'Blob gota', fill: '#0d9488' },
  { id: 'blob-cloud', label: 'Blob nuvem', fill: '#5eead4' },
  { id: 'blob-stone', label: 'Blob pedra', fill: '#0f766e' },
]

export const blobShapeIds: GeometricShape[] = [
  'blob',
  'blob-wave',
  'blob-drop',
  'blob-cloud',
  'blob-stone',
]

export function isBlobShape(kind: GeometricShape): boolean {
  return blobShapeIds.includes(kind)
}

export const shapeLabels: Record<GeometricShape, string> = {
  triangle: 'Triângulo',
  'right-triangle': 'Triângulo retângulo',
  diamond: 'Losango',
  pentagon: 'Pentágono',
  hexagon: 'Hexágono',
  octagon: 'Octógono',
  star: 'Estrela',
  parallelogram: 'Paralelogramo',
  trapezoid: 'Trapézio',
  arrow: 'Seta',
  cross: 'Cruz',
  plus: 'Mais',
  blob: 'Blob',
  'blob-wave': 'Blob ondulado',
  'blob-drop': 'Blob gota',
  'blob-cloud': 'Blob nuvem',
  'blob-stone': 'Blob pedra',
}

function regularPolygon(
  sides: number,
  width: number,
  height: number,
): number[] {
  const cx = width / 2
  const cy = height / 2
  const rx = width / 2
  const ry = height / 2
  const points: number[] = []
  for (let index = 0; index < sides; index += 1) {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / sides
    points.push(cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry)
  }
  return points
}

function starPoints(width: number, height: number, spikes = 5): number[] {
  const cx = width / 2
  const cy = height / 2
  const outerX = width / 2
  const outerY = height / 2
  const innerX = width * 0.2
  const innerY = height * 0.2
  const points: number[] = []
  let angle = -Math.PI / 2
  const step = Math.PI / spikes
  for (let index = 0; index < spikes; index += 1) {
    points.push(cx + Math.cos(angle) * outerX, cy + Math.sin(angle) * outerY)
    angle += step
    points.push(cx + Math.cos(angle) * innerX, cy + Math.sin(angle) * innerY)
    angle += step
  }
  return points
}

interface BlobRecipe {
  seed: number
  lobes: number
  irregularity: number
  pointCount: number
  /** Empurra o raio em um ângulo (útil para gota). */
  pullAngle?: number
  pullAmount?: number
}

const blobRecipes: Record<
  'blob' | 'blob-wave' | 'blob-drop' | 'blob-cloud' | 'blob-stone',
  BlobRecipe
> = {
  blob: { seed: 11, lobes: 3, irregularity: 0.22, pointCount: 28 },
  'blob-wave': { seed: 42, lobes: 5, irregularity: 0.3, pointCount: 32 },
  'blob-drop': {
    seed: 77,
    lobes: 2,
    irregularity: 0.16,
    pointCount: 28,
    pullAngle: -Math.PI / 2,
    pullAmount: 0.28,
  },
  'blob-cloud': { seed: 103, lobes: 7, irregularity: 0.38, pointCount: 36 },
  'blob-stone': { seed: 19, lobes: 2, irregularity: 0.18, pointCount: 24 },
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function blobPoints(width: number, height: number, recipe: BlobRecipe): number[] {
  const rand = mulberry32(recipe.seed)
  const cx = width / 2
  const cy = height / 2
  const rx = width / 2
  const ry = height / 2
  const harmonics: Array<{ amplitude: number; phase: number }> = []
  for (let lobe = 1; lobe <= recipe.lobes; lobe += 1) {
    harmonics.push({
      amplitude: recipe.irregularity / lobe,
      phase: rand() * Math.PI * 2,
    })
  }

  const points: number[] = []
  for (let index = 0; index < recipe.pointCount; index += 1) {
    const angle = (index / recipe.pointCount) * Math.PI * 2 - Math.PI / 2
    let radius = 0.78
    for (let lobe = 0; lobe < harmonics.length; lobe += 1) {
      const harmonic = harmonics[lobe]
      radius += Math.cos(angle * (lobe + 1) + harmonic.phase) * harmonic.amplitude
    }
    if (recipe.pullAngle !== undefined && recipe.pullAmount) {
      const align = Math.cos(angle - recipe.pullAngle)
      radius += Math.max(0, align) * recipe.pullAmount
    }
    radius = Math.min(1, Math.max(0.34, radius))
    points.push(cx + Math.cos(angle) * rx * radius, cy + Math.sin(angle) * ry * radius)
  }
  return points
}

/** Converte pontos fechados em path SVG suave (Catmull-Rom → cúbicas). */
export function pointsToSmoothPath(points: number[]): string {
  if (points.length < 6) {
    return ''
  }
  const coords: Array<{ x: number; y: number }> = []
  for (let index = 0; index < points.length; index += 2) {
    coords.push({ x: points[index], y: points[index + 1] })
  }
  const count = coords.length
  const tension = 1 / 6
  let path = `M ${coords[0].x} ${coords[0].y}`
  for (let index = 0; index < count; index += 1) {
    const p0 = coords[(index - 1 + count) % count]
    const p1 = coords[index]
    const p2 = coords[(index + 1) % count]
    const p3 = coords[(index + 2) % count]
    const c1x = p1.x + (p2.x - p0.x) * tension
    const c1y = p1.y + (p2.y - p0.y) * tension
    const c2x = p2.x - (p3.x - p1.x) * tension
    const c2y = p2.y - (p3.y - p1.y) * tension
    path += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`
  }
  return `${path} Z`
}

export function shapePoints(
  kind: GeometricShape,
  width: number,
  height: number,
): number[] {
  const w = Math.max(width, 1)
  const h = Math.max(height, 1)

  switch (kind) {
    case 'triangle':
      return [w / 2, 0, w, h, 0, h]
    case 'right-triangle':
      return [0, 0, w, h, 0, h]
    case 'diamond':
      return [w / 2, 0, w, h / 2, w / 2, h, 0, h / 2]
    case 'pentagon':
      return regularPolygon(5, w, h)
    case 'hexagon':
      return regularPolygon(6, w, h)
    case 'octagon':
      return regularPolygon(8, w, h)
    case 'star':
      return starPoints(w, h)
    case 'parallelogram': {
      const skew = w * 0.22
      return [skew, 0, w, 0, w - skew, h, 0, h]
    }
    case 'trapezoid': {
      const inset = w * 0.18
      return [inset, 0, w - inset, 0, w, h, 0, h]
    }
    case 'arrow': {
      const shaftTop = h * 0.3
      const shaftBottom = h * 0.7
      const head = w * 0.55
      return [
        0,
        shaftTop,
        head,
        shaftTop,
        head,
        0,
        w,
        h / 2,
        head,
        h,
        head,
        shaftBottom,
        0,
        shaftBottom,
      ]
    }
    case 'cross': {
      const t = Math.min(w, h) * 0.28
      const cx = w / 2
      const cy = h / 2
      return [
        cx - t / 2,
        0,
        cx + t / 2,
        0,
        cx + t / 2,
        cy - t / 2,
        w,
        cy - t / 2,
        w,
        cy + t / 2,
        cx + t / 2,
        cy + t / 2,
        cx + t / 2,
        h,
        cx - t / 2,
        h,
        cx - t / 2,
        cy + t / 2,
        0,
        cy + t / 2,
        0,
        cy - t / 2,
        cx - t / 2,
        cy - t / 2,
      ]
    }
    case 'plus': {
      const t = Math.min(w, h) * 0.34
      const cx = w / 2
      const cy = h / 2
      return [
        cx - t / 2,
        0,
        cx + t / 2,
        0,
        cx + t / 2,
        cy - t / 2,
        w,
        cy - t / 2,
        w,
        cy + t / 2,
        cx + t / 2,
        cy + t / 2,
        cx + t / 2,
        h,
        cx - t / 2,
        h,
        cx - t / 2,
        cy + t / 2,
        0,
        cy + t / 2,
        0,
        cy - t / 2,
        cx - t / 2,
        cy - t / 2,
      ]
    }
    case 'blob':
    case 'blob-wave':
    case 'blob-drop':
    case 'blob-cloud':
    case 'blob-stone':
      return blobPoints(w, h, blobRecipes[kind])
  }
}

/** Path SVG local (0,0 → width/height). Blobs usam curvas suaves. */
export function shapeSvgPath(
  kind: GeometricShape,
  width: number,
  height: number,
): string {
  const points = shapePoints(kind, width, height)
  if (isBlobShape(kind)) {
    return pointsToSmoothPath(points)
  }
  if (points.length < 2) {
    return ''
  }
  let path = `M ${points[0]} ${points[1]}`
  for (let index = 2; index < points.length; index += 2) {
    path += ` L ${points[index]} ${points[index + 1]}`
  }
  return `${path} Z`
}

export function pointsToSvg(points: number[]): string {
  const pairs: string[] = []
  for (let index = 0; index < points.length; index += 2) {
    pairs.push(`${points[index]},${points[index + 1]}`)
  }
  return pairs.join(' ')
}
