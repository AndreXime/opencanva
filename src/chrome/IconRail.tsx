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
    <nav className="flex w-[88px] shrink-0 flex-col items-stretch gap-1.5 border-r border-editor-border bg-editor-bg px-2.5 py-3">
      {items.map((item) => {
        const active = sidebarTab === item.id
        const Icon = item.icon
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setSidebarTab(item.id)}
            className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-[11px] font-semibold leading-tight transition-colors duration-200 ${
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
