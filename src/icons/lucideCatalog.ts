import { lucideIconNames, type LucideIconName } from './lucideSvg'

export interface IconGroup {
  id: string
  label: string
  icons: LucideIconName[]
}

const rules: Array<{ id: string; label: string; pattern: RegExp }> = [
  {
    id: 'arrows',
    label: 'Setas e navegação',
    pattern:
      /arrow|chevron|move|corner-down|corner-left|corner-right|corner-up|between|navigation|signpost|milestone|route|compass|map-pin|map$|undo|redo|expand|shrink|maximize|minimize|fullscreen|panel|sidebar|panel-/i,
  },
  {
    id: 'media',
    label: 'Mídia',
    pattern:
      /image|images|video|music|camera|mic|play|pause|volume|film|clapperboard|radio|podcast|headphones|speaker|audio|waveform|aperture|gallery|picture|skip-|rewind|fast-forward|shuffle|repeat|equalizer/i,
  },
  {
    id: 'communication',
    label: 'Comunicação',
    pattern:
      /mail|message|messages|phone|send|chat|bell|inbox|reply|forward|voicemail|megaphone|rss|at-sign|contact|notepad-text|letter|envelope|notification/i,
  },
  {
    id: 'files',
    label: 'Arquivos e pastas',
    pattern:
      /file|folder|download|upload|clipboard|save|archive|book|notebook|scroll|library|database|hard-drive|cloud|copy|paste|trash|bin|paperclip|attachment|package|box$/i,
  },
  {
    id: 'people',
    label: 'Pessoas',
    pattern:
      /user|users|person|people|contact|baby|accessibility|hand|footprints|body|face|smile|frown|laugh|angry|annoyed|meh|kiss|heart|brain|bone|ear|nose|eye$/i,
  },
  {
    id: 'commerce',
    label: 'Comércio e finanças',
    pattern:
      /cart|shopping|store|tag|badge|credit|dollar|euro|pound|yen|wallet|receipt|ticket|gift|percent|piggy|banknote|coins|bitcoin|currency|cash|barcode|qr|scan-line|scan-barcode/i,
  },
  {
    id: 'devices',
    label: 'Dispositivos',
    pattern:
      /monitor|smartphone|tablet|laptop|watch|cpu|server|printer|keyboard|mouse|usb|bluetooth|wifi|battery|plug|router|tv|gamepad|headset|cast|airplay|dock|hard-drive|memory-stick|sd-card|cable|hdmi|ethernet/i,
  },
  {
    id: 'editing',
    label: 'Edição e design',
    pattern:
      /pen|pencil|brush|paint|palette|pipette|crop|scissors|eraser|type|font|bold|italic|underline|align|layout|grid|frame|layers|component|vector|spline|wand|shape|square|circle|triangle|hexagon|octagon|diamond|pentagon|star|blend|contrast|droplet|highlighter|marker|ruler|drafting|canvas|figma|bezier|path/i,
  },
  {
    id: 'status',
    label: 'Status e alertas',
    pattern:
      /check|circle-check|circle-x|x$|alert|info|help|ban|shield|lock|unlock|key|eye|scan|search|filter|settings|sliders|toggle|power|loader|spinner|progress|badge-check|badge-alert|badge-info|circle-alert|octagon-alert|triangle-alert/i,
  },
  {
    id: 'nature',
    label: 'Natureza e tempo',
    pattern:
      /sun|moon|cloud|snow|wind|droplet|flame|leaf|tree|flower|bug|bird|fish|paw|mountain|earth|globe|thermometer|umbrella|weather|rainbow|sprout|cactus|cherry|apple|banana|carrot|wheat|egg|bone|rabbit|cat|dog|turtle|snail|worm|bee|rabbit|sunrise|sunset|eclipse/i,
  },
  {
    id: 'food',
    label: 'Comida e bebida',
    pattern:
      /utensils|fork|knife|spoon|cup|coffee|beer|wine|martini|pizza|burger|sandwich|soup|salad|cake|cookie|ice-cream|popcorn|candy|donut|croissant|bread|milk|bottle|glass|chef|cooking|microwave|refrigerator|oven|anvil/i,
  },
  {
    id: 'transport',
    label: 'Transporte',
    pattern:
      /car|bus|train|plane|rocket|ship|boat|bike|bicycle|scooter|truck|ambulance|tram|cable-car|ferry|anchor|fuel|parking|traffic|gauge|steering|sailboat|helicopter|drone/i,
  },
  {
    id: 'buildings',
    label: 'Lugares e construções',
    pattern:
      /building|home|house|hotel|school|hospital|factory|warehouse|landmark|church|mosque|synagogue|castle|tent|fence|door|window|sofa|bed|lamp|bathtub|shower|toilet|washing|air-vent|fan|heater|fireplace|utility-pole/i,
  },
  {
    id: 'time',
    label: 'Tempo e calendário',
    pattern:
      /calendar|clock|timer|alarm|hourglass|history|watch|schedule|deadline|timezone|date|time/i,
  },
  {
    id: 'science',
    label: 'Ciência e saúde',
    pattern:
      /flask|test-tube|beaker|microscope|atom|dna|pill|syringe|stethoscope|heart-pulse|activity|thermometer|hospital|cross|bandage|capsule|virus|bacteria|radiation|orbit|satellite|telescope|magnet|weight|dumbbell|bike|yoga/i,
  },
  {
    id: 'tools',
    label: 'Ferramentas',
    pattern:
      /wrench|hammer|screwdriver|axe|drill|saw|toolbox|construction|hard-hat|ladder|pickaxe|shovel|anvil|cog|gear|nut|bolt|cable|wire|fuse|circuit/i,
  },
  {
    id: 'charts',
    label: 'Gráficos e dados',
    pattern:
      /chart|graph|pie|bar|line-chart|area-chart|scatter|trending|analytics|kanban|table|columns|rows|list|list-ordered|list-tree|tree-pine|git-|workflow|network|binary|code|terminal|brackets|braces|variable|function|regex|bug|debug/i,
  },
  {
    id: 'sports',
    label: 'Esportes e lazer',
    pattern:
      /trophy|medal|award|flag|target|goal|football|soccer|basketball|volleyball|tennis|golf|swim|ski|snowboard|dumbbell|bike|person-standing|dribbble|gamepad|dice|puzzle|toy|balloon|party|confetti|sparkles|wand/i,
  },
  {
    id: 'weather-extra',
    label: 'Clima',
    pattern:
      /cloudy|fog|haze|tornado|hurricane|lightning|zap|storm|drizzle|rain|snowflake|sun-dim|sun-medium|sun-moon|sunrise|sunset/i,
  },
]

function toSearchText(name: LucideIconName): string {
  return name.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
}

export function buildIconGroups(): IconGroup[] {
  const remaining = new Set(lucideIconNames)
  const groups: IconGroup[] = []

  for (const rule of rules) {
    const matched = lucideIconNames.filter((name) => {
      if (!remaining.has(name)) {
        return false
      }
      return rule.pattern.test(name) || rule.pattern.test(toSearchText(name))
    })
    if (matched.length === 0) {
      continue
    }
    matched.forEach((name) => remaining.delete(name))
    groups.push({
      id: rule.id,
      label: rule.label,
      icons: matched.sort((a, b) => a.localeCompare(b)),
    })
  }

  const others = [...remaining].sort((a, b) => a.localeCompare(b))
  if (others.length > 0) {
    groups.push({
      id: 'other',
      label: 'Outros',
      icons: others,
    })
  }

  return groups
}

export const iconGroups = buildIconGroups()

export function filterIconNames(query: string): LucideIconName[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return lucideIconNames
  }
  return lucideIconNames.filter((name) => {
    const label = toSearchText(name)
    return label.includes(normalized) || name.toLowerCase().includes(normalized)
  })
}

export function iconDisplayName(name: LucideIconName): string {
  return name.replace(/([a-z])([A-Z])/g, '$1 $2')
}
