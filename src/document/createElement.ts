import type {
  DesignElement,
  EllipseElement,
  GeometricShape,
  IconElement,
  ImageElement,
  Page,
  RectElement,
  ShapeElement,
  TextElement,
} from './types'
import { shapePresets } from './shapes'

function createId(): string {
  return crypto.randomUUID()
}

export function createRectElement(
  overrides: Partial<RectElement> = {},
): RectElement {
  return {
    id: createId(),
    type: 'rect',
    x: 340,
    y: 340,
    width: 400,
    height: 280,
    rotation: 0,
    opacity: 1,
    zIndex: 0,
    fill: '#3b82f6',
    cornerRadius: 0,
    ...overrides,
  }
}

export function createEllipseElement(
  overrides: Partial<EllipseElement> = {},
): EllipseElement {
  return {
    id: createId(),
    type: 'ellipse',
    x: 340,
    y: 340,
    width: 360,
    height: 360,
    rotation: 0,
    opacity: 1,
    zIndex: 0,
    fill: '#f59e0b',
    ...overrides,
  }
}

export function createShapeElement(
  shape: GeometricShape,
  overrides: Partial<Omit<ShapeElement, 'shape'>> = {},
): ShapeElement {
  const preset = shapePresets.find((item) => item.id === shape)
  return {
    id: createId(),
    type: 'shape',
    x: 360,
    y: 360,
    width: 360,
    height: 360,
    rotation: 0,
    opacity: 1,
    zIndex: 0,
    shape,
    fill: preset?.fill ?? '#6366f1',
    ...overrides,
  }
}

export function createTextElement(
  overrides: Partial<TextElement> = {},
): TextElement {
  return {
    id: createId(),
    type: 'text',
    x: 240,
    y: 440,
    width: 600,
    height: 120,
    rotation: 0,
    opacity: 1,
    zIndex: 0,
    text: 'Adicione seu texto',
    fontSize: 48,
    fontFamily: 'Inter, system-ui, sans-serif',
    fill: '#0f172a',
    fontStyle: 'bold',
    textDecoration: 'none',
    letterSpacing: 0,
    lineHeight: 1.3,
    align: 'center',
    ...overrides,
  }
}

export function createImageElement(
  src: string,
  overrides: Partial<Omit<ImageElement, 'src'>> = {},
): ImageElement {
  return {
    id: createId(),
    type: 'image',
    x: 240,
    y: 240,
    width: 600,
    height: 400,
    rotation: 0,
    opacity: 1,
    zIndex: 0,
    src,
    crop: null,
    flipX: false,
    flipY: false,
    ...overrides,
  }
}

export function createIconElement(
  iconName: string,
  overrides: Partial<Omit<IconElement, 'iconName'>> = {},
): IconElement {
  return {
    id: createId(),
    type: 'icon',
    x: 440,
    y: 440,
    width: 160,
    height: 160,
    rotation: 0,
    opacity: 1,
    zIndex: 0,
    iconPack: 'lucide',
    iconName,
    fill: '#0f172a',
    strokeWidth: 2,
    ...overrides,
  }
}

export function createPage(
  name: string,
  overrides: Partial<Page> = {},
): Page {
  return {
    id: createId(),
    name,
    width: 1080,
    height: 1080,
    background: '#ffffff',
    elements: [],
    ...overrides,
  }
}

export function createDefaultDocument() {
  const page = createPage('Página 1')
  return {
    id: createId(),
    name: 'Design sem título',
    pages: [page],
    activePageId: page.id,
  }
}

export function nextZIndex(elements: DesignElement[]): number {
  if (elements.length === 0) {
    return 0
  }
  return Math.max(...elements.map((element) => element.zIndex)) + 1
}
