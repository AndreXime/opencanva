import { useEffect } from 'react'
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
  const setSidebarTab = useEditorStore((state) => state.setSidebarTab)
  const selectedIds = useEditorStore((state) => state.selectedIds)
  const panelOpen = sidebarTab !== null
  const hasSelection = selectedIds.length > 0

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const closeSidebarOnMobile = () => {
      if (media.matches) {
        setSidebarTab(null)
      }
    }
    closeSidebarOnMobile()
    media.addEventListener('change', closeSidebarOnMobile)
    return () => media.removeEventListener('change', closeSidebarOnMobile)
  }, [setSidebarTab])

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-editor-bg font-editor text-editor-text">
      <TopBar />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="relative flex min-h-0 min-w-0 flex-1">
          <div className="hidden md:flex">
            <IconRail />
          </div>

          <div
            className={`hidden shrink-0 overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:block ${
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

          <div className="hidden md:contents">
            <PropertiesPanel />
          </div>

          {hasSelection && !panelOpen ? (
            <div className="absolute inset-x-0 bottom-0 z-20 flex max-h-[48%] flex-col md:hidden">
              <PropertiesPanel variant="sheet" />
            </div>
          ) : null}
        </div>

        <BottomBar />

        {panelOpen ? (
          <div className="absolute inset-0 z-30 flex flex-col justify-end md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Fechar painel"
              onClick={() => setSidebarTab(null)}
            />
            <div className="relative z-10 flex max-h-[85%] min-h-[55%] flex-col overflow-hidden rounded-t-2xl bg-editor-bg shadow-2xl">
              <LeftPanel onClose={() => setSidebarTab(null)} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative z-40 md:hidden">
        <IconRail />
      </div>
    </div>
  )
}
