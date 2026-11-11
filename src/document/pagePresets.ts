export interface PagePreset {
  id: string
  label: string
  width: number
  height: number
  hint?: string
}

export interface PagePresetGroup {
  id: string
  label: string
  presets: PagePreset[]
}

/** Tamanhos de papel em px a 96 DPI (1 in = 25.4 mm). */
function mmToPx(mm: number): number {
  return Math.round((mm / 25.4) * 96)
}

function inchToPx(inches: number): number {
  return Math.round(inches * 96)
}

export const pagePresetGroups: PagePresetGroup[] = [
  {
    id: 'social',
    label: 'Redes sociais',
    presets: [
      {
        id: 'x-post',
        label: 'Post X',
        width: 1200,
        height: 675,
        hint: '16:9',
      },
      {
        id: 'x-square',
        label: 'Post X quadrado',
        width: 1080,
        height: 1080,
        hint: '1:1',
      },
      {
        id: 'x-header',
        label: 'Capa do perfil X',
        width: 1500,
        height: 500,
        hint: '3:1',
      },
      {
        id: 'ig-post',
        label: 'Post Instagram',
        width: 1080,
        height: 1080,
        hint: '1:1',
      },
      {
        id: 'ig-portrait',
        label: 'Post Instagram retrato',
        width: 1080,
        height: 1350,
        hint: '4:5',
      },
      {
        id: 'ig-story',
        label: 'Story / Reels',
        width: 1080,
        height: 1920,
        hint: '9:16',
      },
      {
        id: 'fb-post',
        label: 'Post Facebook',
        width: 1200,
        height: 630,
        hint: '1.91:1',
      },
      {
        id: 'linkedin-post',
        label: 'Post LinkedIn',
        width: 1200,
        height: 627,
        hint: '1.91:1',
      },
      {
        id: 'yt-thumb',
        label: 'Thumbnail YouTube',
        width: 1280,
        height: 720,
        hint: '16:9',
      },
    ],
  },
  {
    id: 'paper',
    label: 'Papel',
    presets: [
      {
        id: 'a5',
        label: 'A5',
        width: mmToPx(148),
        height: mmToPx(210),
        hint: '148 × 210 mm',
      },
      {
        id: 'a4',
        label: 'A4',
        width: mmToPx(210),
        height: mmToPx(297),
        hint: '210 × 297 mm',
      },
      {
        id: 'a3',
        label: 'A3',
        width: mmToPx(297),
        height: mmToPx(420),
        hint: '297 × 420 mm',
      },
      {
        id: 'a2',
        label: 'A2',
        width: mmToPx(420),
        height: mmToPx(594),
        hint: '420 × 594 mm',
      },
      {
        id: 'letter',
        label: 'Carta (Letter)',
        width: inchToPx(8.5),
        height: inchToPx(11),
        hint: '8,5 × 11 in',
      },
      {
        id: 'legal',
        label: 'Ofício (Legal)',
        width: inchToPx(8.5),
        height: inchToPx(14),
        hint: '8,5 × 14 in',
      },
      {
        id: 'tabloid',
        label: 'Tabloide',
        width: inchToPx(11),
        height: inchToPx(17),
        hint: '11 × 17 in',
      },
    ],
  },
  {
    id: 'presentation',
    label: 'Apresentação',
    presets: [
      {
        id: 'slide-16-9',
        label: 'Slide 16:9',
        width: 1920,
        height: 1080,
        hint: 'Full HD',
      },
      {
        id: 'slide-4-3',
        label: 'Slide 4:3',
        width: 1024,
        height: 768,
      },
      {
        id: 'slide-square',
        label: 'Slide quadrado',
        width: 1080,
        height: 1080,
      },
    ],
  },
  {
    id: 'web',
    label: 'Web e marketing',
    presets: [
      {
        id: 'square-1080',
        label: 'Quadrado',
        width: 1080,
        height: 1080,
      },
      {
        id: 'banner-web',
        label: 'Banner web',
        width: 1600,
        height: 400,
        hint: '4:1',
      },
      {
        id: 'hero-desktop',
        label: 'Hero desktop',
        width: 1920,
        height: 800,
      },
      {
        id: 'open-graph',
        label: 'Open Graph',
        width: 1200,
        height: 630,
        hint: 'Redes / SEO',
      },
    ],
  },
]

export function formatPageSize(width: number, height: number): string {
  return `${width.toLocaleString('pt-BR')} × ${height.toLocaleString('pt-BR')} px`
}
