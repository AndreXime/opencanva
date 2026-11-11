import type { GeometricShape } from './shapes'

export type ElementType =
  | 'rect'
  | 'ellipse'
  | 'shape'
  | 'text'
  | 'image'
  | 'icon'

export type IconPack = 'lucide' | 'simple'

export type { GeometricShape }

export type SidebarTab = 'elements' | 'text' | 'uploads' | 'page' | null

interface BaseElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  zIndex: number
}

export interface RectElement extends BaseElement {
  type: 'rect'
  fill: string
  cornerRadius: number
}

export interface EllipseElement extends BaseElement {
  type: 'ellipse'
  fill: string
}

export interface ShapeElement extends BaseElement {
  type: 'shape'
  shape: GeometricShape
  fill: string
}

export type TextFontStyle = 'normal' | 'bold' | 'italic' | 'bold italic'
export type TextDecoration = 'none' | 'underline'

export interface TextElement extends BaseElement {
  type: 'text'
  text: string
  fontSize: number
  fontFamily: string
  fill: string
  fontStyle: TextFontStyle
  textDecoration: TextDecoration
  letterSpacing: number
  lineHeight: number
  align: 'left' | 'center' | 'right'
}

export interface ImageCropRect {
  x: number
  y: number
  width: number
  height: number
}

export interface ImageElement extends BaseElement {
  type: 'image'
  src: string
  /** Recorte em pixels da imagem original. null = imagem inteira. */
  crop: ImageCropRect | null
  flipX: boolean
  flipY: boolean
}

export interface IconElement extends BaseElement {
  type: 'icon'
  iconPack: IconPack
  iconName: string
  fill: string
  strokeWidth: number
}

export type DesignElement =
  | RectElement
  | EllipseElement
  | ShapeElement
  | TextElement
  | ImageElement
  | IconElement

export interface Page {
  id: string
  name: string
  width: number
  height: number
  background: string
  elements: DesignElement[]
}

export interface DesignDocument {
  id: string
  name: string
  pages: Page[]
  activePageId: string
}

export interface EditorUiState {
  selectedIds: string[]
  zoom: number
  stagePosition: { x: number; y: number }
  sidebarTab: SidebarTab
  editingTextId: string | null
  spacePressed: boolean
  isPanning: boolean
}

export type ElementUpdate = {
  x?: number
  y?: number
  width?: number
  height?: number
  rotation?: number
  opacity?: number
  zIndex?: number
  fill?: string
  cornerRadius?: number
  shape?: GeometricShape
  text?: string
  fontSize?: number
  fontFamily?: string
  fontStyle?: TextElement['fontStyle']
  textDecoration?: TextElement['textDecoration']
  letterSpacing?: number
  lineHeight?: number
  align?: TextElement['align']
  src?: string
  crop?: ImageCropRect | null
  flipX?: boolean
  flipY?: boolean
  iconName?: string
  iconPack?: IconPack
  strokeWidth?: number
}
