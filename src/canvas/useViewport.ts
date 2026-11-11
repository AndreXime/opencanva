import { useEffect, useRef } from 'react'
import type Konva from 'konva'
import { useEditorStore } from '../store/editorStore'

export function useViewport(containerRef: React.RefObject<HTMLDivElement | null>) {
  const zoom = useEditorStore((state) => state.zoom)
  const stagePosition = useEditorStore((state) => state.stagePosition)
  const setZoom = useEditorStore((state) => state.setZoom)
  const setStagePosition = useEditorStore((state) => state.setStagePosition)
  const setSpacePressed = useEditorStore((state) => state.setSpacePressed)
  const setIsPanning = useEditorStore((state) => state.setIsPanning)
  const spacePressed = useEditorStore((state) => state.spacePressed)
  const panOrigin = useRef<{ x: number; y: number; stageX: number; stageY: number } | null>(
    null,
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat) {
        const target = event.target as HTMLElement | null
        if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
          return
        }
        event.preventDefault()
        setSpacePressed(true)
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setSpacePressed(false)
        setIsPanning(false)
        panOrigin.current = null
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [setIsPanning, setSpacePressed])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const direction = event.deltaY > 0 ? -1 : 1
      const factor = 1 + direction * 0.08
      setZoom(zoom * factor)
    }

    container.addEventListener('wheel', onWheel, { passive: false })
    return () => container.removeEventListener('wheel', onWheel)
  }, [containerRef, setZoom, zoom])

  const onStageMouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
    const isMiddle = event.evt.button === 1
    if (!spacePressed && !isMiddle) {
      return
    }
    event.evt.preventDefault()
    setIsPanning(true)
    panOrigin.current = {
      x: event.evt.clientX,
      y: event.evt.clientY,
      stageX: stagePosition.x,
      stageY: stagePosition.y,
    }
  }

  const onStageMouseMove = (event: Konva.KonvaEventObject<MouseEvent>) => {
    if (!panOrigin.current) {
      return
    }
    const dx = event.evt.clientX - panOrigin.current.x
    const dy = event.evt.clientY - panOrigin.current.y
    setStagePosition({
      x: panOrigin.current.stageX + dx,
      y: panOrigin.current.stageY + dy,
    })
  }

  const onStageMouseUp = () => {
    setIsPanning(false)
    panOrigin.current = null
  }

  return {
    zoom,
    stagePosition,
    spacePressed,
    onStageMouseDown,
    onStageMouseMove,
    onStageMouseUp,
  }
}
