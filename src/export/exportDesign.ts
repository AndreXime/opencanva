import type Konva from 'konva'
import { useEditorStore } from '../store/editorStore'
import { rasterizeImageElement } from '../document/imageStyle'
import type { DesignElement, Page } from '../document/types'
import { buildPdfFromPage } from './pdfFromDocument'
import { iconToSvgMarkup } from '../icons/iconRender'
import { isBlobShape, pointsToSvg, shapePoints, shapeSvgPath } from '../document/shapes'

export type ExportFormat = 'png' | 'jpg' | 'webp' | 'pdf' | 'svg'
export type ExportQuality = 'compress' | 'high' | 'max'

export interface ExportOptions {
  format: ExportFormat
  scale: number
  quality: ExportQuality
  transparentBackground: boolean
}

function qualityValue(quality: ExportQuality): number {
  if (quality === 'compress') {
    return 0.7
  }
  if (quality === 'high') {
    return 0.92
  }
  return 1
}

function safeFileName(name: string): string {
  return name.trim().replace(/[^\w-]+/g, '_') || 'design'
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = fileName
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a')
  link.download = fileName
  link.href = dataUrl
  link.click()
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

async function elementToSvg(element: DesignElement): Promise<string> {
  const common = `opacity="${element.opacity}" transform="rotate(${element.rotation} ${element.x + element.width / 2} ${element.y + element.height / 2})"`

  if (element.type === 'rect') {
    return `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" rx="${element.cornerRadius}" fill="${escapeXml(element.fill)}" ${common} />`
  }
  if (element.type === 'ellipse') {
    return `<ellipse cx="${element.x + element.width / 2}" cy="${element.y + element.height / 2}" rx="${element.width / 2}" ry="${element.height / 2}" fill="${escapeXml(element.fill)}" ${common} />`
  }
  if (element.type === 'shape') {
    if (isBlobShape(element.shape)) {
      const localPath = shapeSvgPath(element.shape, element.width, element.height)
      return `<path d="${localPath}" transform="translate(${element.x} ${element.y})" fill="${escapeXml(element.fill)}" ${common} />`
    }
    const local = shapePoints(element.shape, element.width, element.height)
    const absolute: number[] = []
    for (let index = 0; index < local.length; index += 2) {
      absolute.push(local[index] + element.x, local[index + 1] + element.y)
    }
    return `<polygon points="${pointsToSvg(absolute)}" fill="${escapeXml(element.fill)}" ${common} />`
  }
  if (element.type === 'text') {
    const weight = element.fontStyle.includes('bold') ? '700' : '400'
    const style = element.fontStyle.includes('italic') ? 'italic' : 'normal'
    const decoration =
      element.textDecoration === 'underline' ? 'underline' : 'none'
    const letterSpacing = element.letterSpacing ?? 0
    return `<text x="${element.x}" y="${element.y + element.fontSize}" width="${element.width}" fill="${escapeXml(element.fill)}" font-size="${element.fontSize}" font-family="${escapeXml(element.fontFamily)}" font-weight="${weight}" font-style="${style}" text-decoration="${decoration}" letter-spacing="${letterSpacing}" text-anchor="${element.align === 'center' ? 'middle' : element.align === 'right' ? 'end' : 'start'}" ${common}>${escapeXml(element.text)}</text>`
  }
  if (element.type === 'icon') {
    const pack = element.iconPack ?? 'lucide'
    const svg = await iconToSvgMarkup(
      pack,
      element.iconName,
      element.fill,
      24,
      element.strokeWidth,
    )
    if (!svg) {
      return ''
    }
    const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')
    const cx = element.x + element.width / 2
    const cy = element.y + element.height / 2
    return `<g opacity="${element.opacity}" transform="translate(${cx} ${cy}) rotate(${element.rotation}) translate(${-element.width / 2} ${-element.height / 2}) scale(${element.width / 24} ${element.height / 24})">${inner}</g>`
  }
  if (element.type === 'image') {
    const needsRaster =
      Boolean(element.crop) || Boolean(element.flipX) || Boolean(element.flipY)
    const href = needsRaster
      ? await rasterizeImageElement(element)
      : element.src
    return `<image href="${escapeXml(href)}" x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" ${common} />`
  }
  return ''
}

async function pageToSvg(
  page: Page,
  transparentBackground: boolean,
): Promise<string> {
  const background = transparentBackground
    ? ''
    : `<rect width="${page.width}" height="${page.height}" fill="${escapeXml(page.background)}" />`
  const ordered = [...page.elements].sort((a, b) => a.zIndex - b.zIndex)
  const parts = await Promise.all(ordered.map((element) => elementToSvg(element)))
  const body = parts.join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${page.width}" height="${page.height}" viewBox="0 0 ${page.width} ${page.height}">
${background}
${body}
</svg>`
}

function capturePage(
  stage: Konva.Stage,
  page: Page,
  options: ExportOptions,
): string {
  const oldScale = stage.scaleX()
  const oldPosition = { x: stage.x(), y: stage.y() }
  const backgroundNode = stage.findOne('.page-background') as Konva.Rect | null
  const previousFill = backgroundNode?.fill()

  stage.scale({ x: 1, y: 1 })
  stage.position({ x: 0, y: 0 })

  if (options.transparentBackground && backgroundNode) {
    backgroundNode.fill('rgba(0,0,0,0)')
  }

  const mimeType =
    options.format === 'jpg'
      ? 'image/jpeg'
      : options.format === 'webp'
        ? 'image/webp'
        : 'image/png'

  const dataUrl = stage.toDataURL({
    x: 0,
    y: 0,
    width: page.width,
    height: page.height,
    pixelRatio: options.scale,
    mimeType,
    quality: qualityValue(options.quality),
  })

  if (backgroundNode && previousFill !== undefined) {
    backgroundNode.fill(previousFill)
  }
  stage.scale({ x: oldScale, y: oldScale })
  stage.position(oldPosition)

  return dataUrl
}

export async function exportDesign(
  stage: Konva.Stage,
  designName: string,
  options: ExportOptions,
) {
  const page = useEditorStore.getState().getActivePage()
  const baseName = safeFileName(designName)

  if (options.format === 'svg') {
    const svg = await pageToSvg(page, options.transparentBackground)
    downloadBlob(
      new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
      `${baseName}.svg`,
    )
    return
  }

  if (options.format === 'pdf') {
    const pdf = await buildPdfFromPage(page, {
      scale: options.scale,
      transparentBackground: options.transparentBackground,
    })
    pdf.save(`${baseName}.pdf`)
    return
  }

  const dataUrl = capturePage(stage, page, options)
  const extension = options.format === 'jpg' ? 'jpg' : options.format
  downloadDataUrl(dataUrl, `${baseName}.${extension}`)
}
