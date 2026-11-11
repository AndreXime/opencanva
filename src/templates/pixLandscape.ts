import {
  createImageElement,
  createPage,
  createTextElement,
} from '../document/createElement'
import type { DesignDocument } from '../document/types'

const TEAL_PIX = '#03989e'
const INK = '#111111'
const PAGE_WIDTH = 1123
const PAGE_HEIGHT = 794
/** Escala a partir do PNG de referência (1024×723). */
const SCALE = PAGE_WIDTH / 1024
const ASSET = '/templates/pix-landscape'
const FONT_SANS = 'Montserrat, system-ui, sans-serif'

function sx(value: number): number {
  return Math.round(value * SCALE)
}

export function buildPixLandscapeDocument(): DesignDocument {
  const elements = [
    createImageElement(`${ASSET}/dots-tl.png`, {
      x: 0,
      y: 0,
      width: sx(300),
      height: sx(240),
      opacity: 0.9,
      zIndex: 0,
    }),
    createImageElement(`${ASSET}/dots-br.png`, {
      x: sx(684),
      y: sx(443),
      width: sx(340),
      height: sx(280),
      opacity: 0.9,
      zIndex: 1,
    }),
    createImageElement(`${ASSET}/blob-tr.png`, {
      x: sx(574),
      y: sx(-10),
      width: sx(450),
      height: sx(380),
      zIndex: 2,
    }),
    createImageElement(`${ASSET}/blob-bl.png`, {
      x: sx(-20),
      y: sx(343),
      width: sx(450),
      height: sx(380),
      zIndex: 3,
    }),
    createImageElement(`${ASSET}/coin.png`, {
      x: sx(520),
      y: sx(36),
      width: sx(64),
      height: sx(64),
      opacity: 0.4,
      zIndex: 4,
    }),
    createImageElement(`${ASSET}/coin.png`, {
      x: sx(250),
      y: sx(300),
      width: sx(48),
      height: sx(48),
      opacity: 0.32,
      zIndex: 5,
    }),
    createImageElement(`${ASSET}/coin.png`, {
      x: sx(430),
      y: sx(520),
      width: sx(56),
      height: sx(56),
      opacity: 0.36,
      zIndex: 6,
    }),
    createImageElement(`${ASSET}/coin.png`, {
      x: sx(900),
      y: sx(280),
      width: sx(44),
      height: sx(44),
      opacity: 0.28,
      zIndex: 7,
    }),
    createTextElement({
      x: sx(90),
      y: sx(125),
      width: sx(420),
      height: sx(48),
      text: 'PAGUE COM',
      fontSize: sx(36),
      fontFamily: FONT_SANS,
      fill: INK,
      fontStyle: 'bold',
      align: 'left',
      letterSpacing: 1,
      lineHeight: 1.1,
      zIndex: 10,
    }),
    createTextElement({
      x: sx(85),
      y: sx(175),
      width: sx(460),
      height: sx(190),
      text: 'PIX',
      fontSize: sx(150),
      fontFamily: FONT_SANS,
      fill: TEAL_PIX,
      fontStyle: 'bold',
      align: 'left',
      letterSpacing: -2,
      lineHeight: 0.95,
      zIndex: 11,
    }),
    createImageElement(`${ASSET}/burst.png`, {
      x: sx(455),
      y: sx(150),
      width: sx(100),
      height: sx(100),
      opacity: 0.85,
      zIndex: 12,
    }),
    createTextElement({
      x: sx(90),
      y: sx(420),
      width: sx(480),
      height: sx(40),
      text: 'OU USE A CHAVE TELEFONE:',
      fontSize: sx(24),
      fontFamily: FONT_SANS,
      fill: INK,
      fontStyle: 'bold',
      align: 'left',
      lineHeight: 1.2,
      zIndex: 13,
    }),
    createTextElement({
      x: sx(90),
      y: sx(468),
      width: sx(420),
      height: sx(52),
      text: '(12) 3456-7890',
      fontSize: sx(40),
      fontFamily: FONT_SANS,
      fill: INK,
      fontStyle: 'bold',
      align: 'left',
      lineHeight: 1.15,
      zIndex: 14,
    }),
    createImageElement(`${ASSET}/qr-placeholder.png`, {
      x: sx(590),
      y: sx(145),
      width: sx(370),
      height: sx(370),
      zIndex: 15,
    }),
    createTextElement({
      x: sx(590),
      y: sx(530),
      width: sx(370),
      height: sx(36),
      text: '@GRANDESITE',
      fontSize: sx(22),
      fontFamily: FONT_SANS,
      fill: INK,
      fontStyle: 'bold',
      align: 'center',
      letterSpacing: 1,
      lineHeight: 1.2,
      zIndex: 16,
    }),
  ]

  const page = createPage('PIX paisagem', {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    background: '#ffffff',
    elements,
  })

  return {
    id: crypto.randomUUID(),
    name: 'PIX A4 paisagem',
    pages: [page],
    activePageId: page.id,
  }
}
