import {
  createImageElement,
  createPage,
  createRectElement,
  createTextElement,
} from '../document/createElement'
import type { DesignDocument } from '../document/types'

const PIX_BLUE = '#3080c9'
const PAGE_WIDTH = 794
const PAGE_HEIGHT = 1123
/** Escala a partir do PNG de referência (723×1024). */
const SCALE = PAGE_WIDTH / 723

const FONT_SANS = 'Montserrat, system-ui, sans-serif'

function sx(value: number): number {
  return Math.round(value * SCALE)
}

export function buildPixPaymentDocument(): DesignDocument {
  const cardX = sx(74)
  const cardY = sx(74)
  const cardW = sx(575)
  const cardH = sx(876)
  const contentW = cardW - sx(48)
  const contentX = cardX + sx(24)

  const qrSize = sx(353)
  const qrX = sx(185)
  const qrY = sx(309)

  const elements = [
    createRectElement({
      x: cardX,
      y: cardY,
      width: cardW,
      height: cardH,
      fill: '#ffffff',
      cornerRadius: sx(14),
      zIndex: 0,
    }),
    createTextElement({
      x: contentX,
      y: sx(115),
      width: contentW,
      height: sx(36),
      text: 'Pague com',
      fontSize: sx(28),
      fontFamily: FONT_SANS,
      fill: PIX_BLUE,
      fontStyle: 'normal',
      align: 'center',
      lineHeight: 1.2,
      zIndex: 1,
    }),
    createTextElement({
      x: contentX,
      y: sx(155),
      width: contentW,
      height: sx(120),
      text: 'PIX',
      fontSize: sx(110),
      fontFamily: FONT_SANS,
      fill: PIX_BLUE,
      fontStyle: 'bold',
      align: 'center',
      letterSpacing: 2,
      lineHeight: 1,
      zIndex: 2,
    }),
    createImageElement('/templates/pix/qr-placeholder.png', {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
      zIndex: 3,
    }),
    createTextElement({
      x: contentX,
      y: sx(710),
      width: contentW,
      height: sx(32),
      text: 'Ou com a chave:',
      fontSize: sx(24),
      fontFamily: FONT_SANS,
      fill: PIX_BLUE,
      fontStyle: 'normal',
      align: 'center',
      lineHeight: 1.2,
      zIndex: 4,
    }),
    createTextElement({
      x: contentX,
      y: sx(752),
      width: contentW,
      height: sx(40),
      text: '23068153/0001-76',
      fontSize: sx(30),
      fontFamily: FONT_SANS,
      fill: PIX_BLUE,
      fontStyle: 'bold',
      align: 'center',
      lineHeight: 1.2,
      zIndex: 5,
    }),
    createTextElement({
      x: contentX,
      y: sx(830),
      width: contentW,
      height: sx(28),
      text: 'Nome',
      fontSize: sx(22),
      fontFamily: FONT_SANS,
      fill: PIX_BLUE,
      fontStyle: 'bold',
      align: 'center',
      lineHeight: 1.2,
      zIndex: 6,
    }),
    createTextElement({
      x: contentX,
      y: sx(862),
      width: contentW,
      height: sx(36),
      text: 'Comercial SuperMax',
      fontSize: sx(26),
      fontFamily: FONT_SANS,
      fill: PIX_BLUE,
      fontStyle: 'normal',
      align: 'center',
      lineHeight: 1.2,
      zIndex: 7,
    }),
  ]

  const page = createPage('Pagamento PIX', {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    background: PIX_BLUE,
    elements,
  })

  return {
    id: crypto.randomUUID(),
    name: 'Pagamento PIX',
    pages: [page],
    activePageId: page.id,
  }
}
