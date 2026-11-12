import { File, Shapes, Type, Upload } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import type { SidebarTab } from '../document/types'

const items: Array<{
  id: Exclude<SidebarTab, null>
  label: string
  icon: typeof Shapes
}> = [
  { id: 'elements', label: 'Elementos', icon: Shapes },
  { id: 'text', label: 'Texto', icon: Type },
  { id: 'uploads', label: 'Uploads', icon: Upload },
  { id: 'page', label: 'Página', icon: File },
]

export function IconRail() {
  const sidebarTab = useEditorStore((state) => state.sidebarTab)
  const setSidebarTab = useEditorStore((state) => state.setSidebarTab)

  return (
    <nav
      className="flex shrink-0 items-stretch gap-1 border-editor-border bg-editor-bg max-md:w-full max-md:flex-row max-md:justify-around max-md:border-t max-md:px-1 max-md:pt-1 max-md:pb-[max(0.35rem,env(safe-area-inset-bottom))] md:w-[88px] md:flex-col md:gap-1.5 md:border-r md:px-2.5 md:py-3"
      aria-label="Ferramentas"
    >
      {items.map((item) => {
        const active = sidebarTab === item.id
        const Icon = item.icon
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setSidebarTab(item.id)}
            className={`flex touch-manipulation flex-col items-center gap-1 rounded-xl text-[10px] font-semibold leading-tight transition-colors duration-200 max-md:min-h-12 max-md:flex-1 max-md:justify-center max-md:px-1 max-md:py-1.5 md:gap-1.5 md:px-2 md:py-3 md:text-[11px] ${
              active
                ? 'bg-editor-accent-soft text-editor-accent'
                : 'text-editor-subtle hover:bg-editor-muted hover:text-editor-text'
            }`}
          >
            <Icon size={22} strokeWidth={1.75} />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
