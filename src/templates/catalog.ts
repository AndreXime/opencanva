import { buildPixLandscapeDocument } from './pixLandscape'
import { buildPixPaymentDocument } from './pixPayment'
import type { DesignTemplate } from './types'

export const designTemplates: DesignTemplate[] = [
  {
    id: 'pix-payment',
    name: 'Pagamento PIX',
    description: 'Cartaz A4 com QR Code, chave e nome do recebedor.',
    thumbnailSrc: '/templates/pix/thumb.png',
    width: 794,
    height: 1123,
    build: buildPixPaymentDocument,
  },
  {
    id: 'pix-landscape',
    name: 'PIX A4 paisagem',
    description: 'A4 deitado com chave telefone, QR e handle.',
    thumbnailSrc: '/templates/pix-landscape/thumb.png',
    width: 1123,
    height: 794,
    build: buildPixLandscapeDocument,
  },
]

export function getTemplateById(id: string): DesignTemplate | undefined {
  return designTemplates.find((template) => template.id === id)
}
