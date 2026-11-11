export interface DesignFont {
  id: string
  label: string
  family: string
  category: 'sans' | 'serif' | 'display' | 'mono' | 'script'
}

export const designFonts: DesignFont[] = [
  {
    id: 'inter',
    label: 'Inter',
    family: 'Inter, system-ui, sans-serif',
    category: 'sans',
  },
  {
    id: 'poppins',
    label: 'Poppins',
    family: 'Poppins, system-ui, sans-serif',
    category: 'sans',
  },
  {
    id: 'montserrat',
    label: 'Montserrat',
    family: 'Montserrat, system-ui, sans-serif',
    category: 'sans',
  },
  {
    id: 'nunito',
    label: 'Nunito',
    family: 'Nunito, system-ui, sans-serif',
    category: 'sans',
  },
  {
    id: 'space-grotesk',
    label: 'Space Grotesk',
    family: "'Space Grotesk', system-ui, sans-serif",
    category: 'sans',
  },
  {
    id: 'playfair',
    label: 'Playfair Display',
    family: "'Playfair Display', Georgia, serif",
    category: 'serif',
  },
  {
    id: 'lora',
    label: 'Lora',
    family: 'Lora, Georgia, serif',
    category: 'serif',
  },
  {
    id: 'merriweather',
    label: 'Merriweather',
    family: 'Merriweather, Georgia, serif',
    category: 'serif',
  },
  {
    id: 'oswald',
    label: 'Oswald',
    family: 'Oswald, system-ui, sans-serif',
    category: 'display',
  },
  {
    id: 'cormorant-garamond',
    label: 'Cormorant Garamond',
    family: "'Cormorant Garamond', Georgia, serif",
    category: 'serif',
  },
  {
    id: 'libre-baskerville',
    label: 'Libre Baskerville',
    family: "'Libre Baskerville', Georgia, serif",
    category: 'serif',
  },
  {
    id: 'great-vibes',
    label: 'Great Vibes',
    family: "'Great Vibes', cursive",
    category: 'script',
  },
  {
    id: 'dancing-script',
    label: 'Dancing Script',
    family: "'Dancing Script', cursive",
    category: 'script',
  },
  {
    id: 'pacifico',
    label: 'Pacifico',
    family: 'Pacifico, cursive',
    category: 'script',
  },
  {
    id: 'satisfy',
    label: 'Satisfy',
    family: 'Satisfy, cursive',
    category: 'script',
  },
  {
    id: 'allura',
    label: 'Allura',
    family: 'Allura, cursive',
    category: 'script',
  },
  {
    id: 'pinyon-script',
    label: 'Pinyon Script',
    family: "'Pinyon Script', cursive",
    category: 'script',
  },
  {
    id: 'roboto-mono',
    label: 'Roboto Mono',
    family: "'Roboto Mono', ui-monospace, monospace",
    category: 'mono',
  },
  {
    id: 'georgia',
    label: 'Georgia',
    family: 'Georgia, serif',
    category: 'serif',
  },
  {
    id: 'arial',
    label: 'Arial',
    family: 'Arial, Helvetica, sans-serif',
    category: 'sans',
  },
  {
    id: 'courier',
    label: 'Courier New',
    family: "'Courier New', monospace",
    category: 'mono',
  },
]

export const defaultDesignFont = designFonts[0]

export async function waitForDesignFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) {
    return
  }
  try {
    await document.fonts.ready
    await Promise.all(
      designFonts
        .filter((font) => !['georgia', 'arial', 'courier'].includes(font.id))
        .map((font) => document.fonts.load(`400 16px ${font.family.split(',')[0]}`)),
    )
  } catch {
    // Continua com fallback do sistema se alguma fonte falhar.
  }
}
