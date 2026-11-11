# OpenCanva

Editor de design no navegador, sem backend. React, Konva e Zustand.

## Stack

- React 19 + TypeScript + Vite
- Konva / react-konva (canvas)
- Zustand (estado + histórico)
- Tailwind CSS 4
- Lucide + Simple Icons
- jsPDF (exportação)

## Rodar

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
npm run typecheck
npm run lint
```

## Deploy (Cloudflare Workers)

Configuração no painel:

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`
- **Node version:** `26` (via `.nvmrc`)

SPA via `wrangler.jsonc` (`assets.not_found_handling`).

## O que tem

- Páginas, camadas, seleção, drag, resize e snap
- Formas geométricas, texto editável e upload de imagem
- Elementos: Formas, Ícones (Lucide e Simple Icons) e Ilustrações locais
- Fontes OFL em `public/fonts`
- Presets de tamanho de página
- Zoom, pan, undo/redo e atalhos
- Exportação PNG e PDF
- Multi-projeto com tela inicial e persistência no `localStorage`

## Pastas úteis

| Caminho | Conteúdo |
| --- | --- |
| `src/canvas` | Stage Konva e views dos elementos |
| `src/chrome` | Shell da UI (barra, painéis, modais) |
| `src/document` | Tipos, formas e presets de página |
| `src/store` | Zustand + persistência |
| `src/icons` | Catálogos Lucide e Simple Icons |
| `src/stock` | Catálogo de ilustrações locais |
| `src/fonts` | Catálogo tipográfico do editor |
| `src/export` | PNG e PDF |
| `public/illustrations` | PNGs das ilustrações |
| `public/fonts` | Faces tipográficas locais |

## Ilustrações e fontes

Novas ilustrações: coloque o PNG em `public/illustrations` e registre em `src/stock/localIllustrations.ts`.

Novas fontes: adicione os arquivos em `public/fonts`, declare em `public/fonts/fonts.css` e no catálogo `src/fonts/catalog.ts`. Detalhes em `public/fonts/README.md`.
