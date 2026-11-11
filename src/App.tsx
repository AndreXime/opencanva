import { AppShell } from './app/AppShell'
import { HomeScreen } from './home/HomeScreen'
import { useEditorStore } from './store/editorStore'

export default function App() {
  const view = useEditorStore((state) => state.view)

  if (view === 'home') {
    return <HomeScreen />
  }

  return <AppShell />
}
