import { jsPDF } from 'jspdf'
import { rasterizeImageElement } from '../document/imageStyle'
import type { DesignElement, Page, TextElement } from '../document/types'
import { iconToDataUrl } from '../icons/iconRender'
import { shapePoints } from '../document/shapes'

function mapFont(fontFamily: string): 'helvetica' | 'times' | 'courier' {
  const family = fontFamily.toLowerCase()
  if (family.includes('courier') || family.includes('mono')) {
    return 'courier'
  }
  if (family.includes('georgia') || family.includes('times') || family.includes('serif')) {
    return 'times'
  }
  return 'helvetica'
}

function mapFontStyle(
  fontStyle: TextElement['fontStyle'],
): 'normal' | 'bold' | 'italic' | 'bolditalic' {
  if (fontStyle === 'bold italic') {
    return 'bolditalic'
  }
  if (fontStyle === 'bold') {
    return 'bold'
  }
  if (fontStyle === 'italic') {
    return 'italic'
  }
  return 'normal'
}

function imageFormat(src: string): 'PNG' | 'JPEG' | 'WEBP' {
  if (src.includes('image/jpeg') || src.includes('image/jpg')) {
    return 'JPEG'
  }
  if (src.includes('image/webp')) {
    return 'WEBP'
  }
  return 'PNG'
}

function svgDataUrlToPng(
  svgDataUrl: string,
  width: number,
  height: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(width))
      canvas.height = Math.max(1, Math.round(height))
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('Canvas indisponível'))
        return
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/png'))
    }
    image.onerror = () => reject(new Error('Falha ao rasterizar ícone'))
    image.src = svgDataUrl
  })
}

function withElementTransform(
  pdf: jsPDF,
  element: DesignElement,
  scale: number,
  draw: (originX: number, originY: number) => void | Promise<void>,
): void | Promise<void> {
  const width = element.width * scale
  const height = element.height * scale
  const centerX = (element.x + element.width / 2) * scale
  const centerY = (element.y + element.height / 2) * scale
  const radians = (element.rotation * Math.PI) / 180

  pdf.saveGraphicsState()

  if (element.opacity < 1) {
    const GStateCtor = pdf.GState as unknown as new (params: {
      opacity: number
    }) => unknown
    pdf.setGState(new GStateCtor({ opacity: element.opacity }) as never)
  }

  const run = async () => {
    if (element.rotation !== 0) {
      const cos = Math.cos(radians)
      const sin = Math.sin(radians)
      const MatrixCtor = pdf.Matrix as unknown as new (
        a: number,
        b: number,
        c: number,
        d: number,
        e: number,
        f: number,
      ) => unknown
      pdf.setCurrentTransformationMatrix(
        new MatrixCtor(cos, sin, -sin, cos, centerX, centerY) as never,
      )
      await draw(-width / 2, -height / 2)
    } else {
      await draw(element.x * scale, element.y * scale)
    }
    pdf.restoreGraphicsState()
  }

  return run()
}

async function drawElement(pdf: jsPDF, element: DesignElement, scale: number) {
  await withElementTransform(pdf, element, scale, async (x, y) => {
    const width = element.width * scale
    const height = element.height * scale

    if (element.type === 'rect') {
      const radius = Math.min(element.cornerRadius * scale, width / 2, height / 2)
      pdf.setFillColor(element.fill)
      if (radius > 0) {
        pdf.roundedRect(x, y, width, height, radius, radius, 'F')
      } else {
        pdf.rect(x, y, width, height, 'F')
      }
      return
    }

    if (element.type === 'ellipse') {
      pdf.setFillColor(element.fill)
      pdf.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 'F')
      return
    }

    if (element.type === 'shape') {
      const local = shapePoints(element.shape, element.width, element.height)
      if (local.length < 4) {
        return
      }
      pdf.setFillColor(element.fill)
      const startX = x + local[0] * scale
      const startY = y + local[1] * scale
      const deltas: Array<[number, number]> = []
      let prevX = local[0]
      let prevY = local[1]
      for (let index = 2; index < local.length; index += 2) {
        const nextX = local[index]
        const nextY = local[index + 1]
        deltas.push([(nextX - prevX) * scale, (nextY - prevY) * scale])
        prevX = nextX
        prevY = nextY
      }
      deltas.push([(local[0] - prevX) * scale, (local[1] - prevY) * scale])
      pdf.lines(deltas, startX, startY, [1, 1], 'F', true)
      return
    }

    if (element.type === 'text') {
      const font = mapFont(element.fontFamily)
      const style = mapFontStyle(element.fontStyle)
      pdf.setFont(font, style)
      pdf.setFontSize(element.fontSize * scale)
      pdf.setTextColor(element.fill)

      let textX = x
      if (element.align === 'center') {
        textX = x + width / 2
      } else if (element.align === 'right') {
        textX = x + width
      }

      pdf.text(element.text, textX, y, {
        baseline: 'top',
        align: element.align,
        maxWidth: width,
        lineHeightFactor: element.lineHeight || 1.3,
      })
      return
    }

    if (element.type === 'icon') {
      const size = Math.max(width, height, 24)
      const pack = element.iconPack ?? 'lucide'
      const svgDataUrl = await iconToDataUrl(
        pack,
        element.iconName,
        element.fill,
        size,
        element.strokeWidth,
      )
      if (!svgDataUrl) {
        return
      }
      const pngDataUrl = await svgDataUrlToPng(svgDataUrl, width * 2, height * 2)
      pdf.addImage(pngDataUrl, 'PNG', x, y, width, height, undefined, 'FAST', 0)
      return
    }

    if (element.type === 'image' && element.src) {
      const needsRaster =
        Boolean(element.crop) || Boolean(element.flipX) || Boolean(element.flipY)
      const src = needsRaster
        ? await rasterizeImageElement(element)
        : element.src
      pdf.addImage(
        src,
        needsRaster ? 'PNG' : imageFormat(element.src),
        x,
        y,
        width,
        height,
        undefined,
        'FAST',
        0,
      )
    }
  })
}

export async function buildPdfFromPage(
  page: Page,
  options: { scale: number; transparentBackground: boolean },
): Promise<jsPDF> {
  const scale = Math.max(options.scale, 0.1)
  const width = page.width * scale
  const height = page.height * scale
  const orientation = width >= height ? 'landscape' : 'portrait'

  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [width, height],
    hotfixes: ['px_scaling'],
  })

  if (!options.transparentBackground) {
    pdf.setFillColor(page.background)
    pdf.rect(0, 0, width, height, 'F')
  }

  const ordered = [...page.elements].sort((a, b) => a.zIndex - b.zIndex)
  for (const element of ordered) {
    await drawElement(pdf, element, scale)
  }

  return pdf
}
