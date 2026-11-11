import { TopBar } from '../chrome/TopBar'
import { IconRail } from '../chrome/IconRail'
import { LeftPanel } from '../chrome/LeftPanel'
import { PropertiesPanel } from '../chrome/PropertiesPanel'
import { BottomBar } from '../chrome/BottomBar'
import { DesignCanvas } from '../canvas/DesignCanvas'
import { useEditorHotkeys } from './useEditorHotkeys'
import { useEditorStore } from '../store/editorStore'

export function AppShell() {
  useEditorHotkeys()
  const sidebarTab = useEditorStore((state) => state.sidebarTab)
  const panelOpen = sidebarTab !== null

  return (
    <div className="flex h-svh w-full flex-col overflow-hidden bg-editor-bg font-editor text-editor-text">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <IconRail />
        <div
          className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            panelOpen ? 'w-[320px]' : 'w-0'
          }`}
        >
          <div
            className={`h-full w-[320px] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              panelOpen
                ? 'translate-x-0 opacity-100'
                : '-translate-x-3 opacity-0'
            }`}
          >
            <LeftPanel />
          </div>
        </div>
        <DesignCanvas />
        <PropertiesPanel />
      </div>
      <BottomBar />
    </div>
  )
}
