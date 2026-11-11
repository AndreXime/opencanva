import type { DesignDocument } from '../document/types'

export interface DesignTemplate {
  id: string
  name: string
  description: string
  thumbnailSrc: string
  width: number
  height: number
  build: () => DesignDocument
}
