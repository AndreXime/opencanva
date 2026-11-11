import type { ImageCropRect, ImageElement } from './types'

export function normalizeImageElement(element: ImageElement): ImageElement {
  return {
    ...element,
    crop: normalizeCrop(element.crop),
    flipX: Boolean(element.flipX),
    flipY: Boolean(element.flipY),
  }
}

function normalizeCrop(crop: ImageCropRect | null | undefined): ImageCropRect | null {
  if (!crop) {
    return null
  }
  if (
    !Number.isFinite(crop.x) ||
    !Number.isFinite(crop.y) ||
    !Number.isFinite(crop.width) ||
    !Number.isFinite(crop.height) ||
    crop.width < 1 ||
    crop.height < 1
  ) {
    return null
  }
  return {
    x: Math.max(0, crop.x),
    y: Math.max(0, crop.y),
    width: crop.width,
    height: crop.height,
  }
}

export function fullImageCrop(
  naturalWidth: number,
  naturalHeight: number,
): ImageCropRect {
  return {
    x: 0,
    y: 0,
    width: Math.max(1, naturalWidth),
    height: Math.max(1, naturalHeight),
  }
}

export function clampCropToImage(
  crop: ImageCropRect,
  naturalWidth: number,
  naturalHeight: number,
): ImageCropRect {
  const width = Math.min(Math.max(8, crop.width), naturalWidth)
  const height = Math.min(Math.max(8, crop.height), naturalHeight)
  const x = Math.min(Math.max(0, crop.x), Math.max(0, naturalWidth - width))
  const y = Math.min(Math.max(0, crop.y), Math.max(0, naturalHeight - height))
  return { x, y, width, height }
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Falha ao carregar imagem'))
    image.src = src
  })
}

/** Rasteriza a imagem já com crop e flip aplicados (para export). */
export async function rasterizeImageElement(
  element: ImageElement,
): Promise<string> {
  const image = await loadHtmlImage(element.src)
  const crop = element.crop ?? fullImageCrop(image.naturalWidth, image.naturalHeight)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(crop.width))
  canvas.height = Math.max(1, Math.round(crop.height))
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas indisponível')
  }
  context.translate(element.flipX ? canvas.width : 0, element.flipY ? canvas.height : 0)
  context.scale(element.flipX ? -1 : 1, element.flipY ? -1 : 1)
  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  )
  return canvas.toDataURL('image/png')
}
