export interface LocalIllustration {
  id: string
  fileName: string
  label: string
  src: string
}

function labelFromFileName(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\d{4,}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const fileNames = [
  'brickbard-globe-9676385_1920.png',
  'creativecanvasdesign-autumn-mug-10504640_1920.png',
  'creativecanvasdesign-barber-10551031_1920.png',
  'creativecanvasdesign-cat-10355050_1920.png',
  'creativecanvasdesign-cute-cat-10551036_1920.png',
  'creativecanvasdesign-cute-cat-10554473_1920.png',
  'creativecanvasdesign-laughing-kookaburra-10479738_1920.png',
  'creativecanvasdesign-pink-cosmos-10490083_1920.png',
  'creativecanvasdesign-zebra-10456219_1920.png',
  'dandelion_tea-forget-me-not-6009034_1920.png',
  'edurs34-cat-5377963_1920.png',
  'edurs34-pie-8116621_1920.png',
  'gdj-jesus-2747372_1920.png',
  'leoneil-ai-generated-8668580_1920.png',
  'openclipart-vectors-catholic-2026877_1920.png',
  'padrefilar-rosary-1943866_1920.png',
  'pastelila_id-flower-7875159_1920.png',
  'pheladii-soccer-10365694_1920.png',
  'purepageart-easter-9440439_1920.png',
  'riadbenamar123-brain-7420599_1920.png',
  'roszie-wreath-7355126_1920.png',
  'ruzaindo-coconut-7751862_1920.png',
  'ruzaindo-coconut-7876154_1920.png',
] as const

export const localIllustrations: LocalIllustration[] = fileNames.map(
  (fileName) => ({
    id: fileName,
    fileName,
    label: labelFromFileName(fileName),
    src: `/illustrations/${fileName}`,
  }),
)

export function filterLocalIllustrations(
  query: string,
): LocalIllustration[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return localIllustrations
  }
  return localIllustrations.filter(
    (item) =>
      item.label.toLowerCase().includes(normalized) ||
      item.fileName.toLowerCase().includes(normalized),
  )
}
