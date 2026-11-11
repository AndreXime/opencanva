import { useEffect, useMemo, useRef, useState } from 'react'
import { Layer, Line, Rect, Stage, Transformer } from 'react-konva'
import type Konva from 'konva'
import { useEditorStore } from '../store/editorStore'
import { useViewport } from './useViewport'
import { RectElementView } from './elements/RectElementView'
import { ShapeElementView } from './elements/ShapeElementView'
import { EllipseElementView } from './elements/EllipseElementView'
import { TextElementView } from './elements/TextElementView'
import { ImageElementView } from './elements/ImageElementView'
import { IconElementView } from './elements/IconElementView'
import { TextEditorOverlay } from './TextEditorOverlay'
import { stageHost } from './stageHost'
import { boxesIntersect, snapElementPosition } from './snap'
import { LayoutTemplate } from 'lucide-react'

export function DesignCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [guides, setGuides] = useState<{
    vertical: number | null
    horizontal: number | null
  }>({ vertical: null, horizontal: null })
  const [marquee, setMarquee] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)
  const marqueeOrigin = useRef<{ x: number; y: number } | null>(null)

  const document = useEditorStore((state) => state.document)
  const page =
    document.pages.find((item) => item.id === document.activePageId) ??
    document.pages[0]
  const selectedIds = useEditorStore((state) => state.selectedIds)
  const editingTextId = useEditorStore((state) => state.editingTextId)
  const isPanning = useEditorStore((state) => state.isPanning)
  const setSelectedIds = useEditorStore((state) => state.setSelectedIds)
  const clearSelection = useEditorStore((state) => state.clearSelection)
  const updateElements = useEditorStore((state) => state.updateElements)
  const startEditingText = useEditorStore((state) => state.startEditingText)
  const fitToPage = useEditorStore((state) => state.fitToPage)
  const viewport = useViewport(containerRef)
  const didFitOnEnter = useRef(false)
  const orderedElements = useMemo(
    () => [...page.elements].sort((a, b) => a.zIndex - b.zIndex),
    [page.elements],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const syncSize = () => {
      setSize({
        width: container.clientWidth,
        height: container.clientHeight,
      })
    }

    const observer = new ResizeObserver(syncSize)
    observer.observe(container)
    syncSize()

    let cancelled = false
    const runFit = () => {
      if (cancelled || didFitOnEnter.current) {
        return
      }
      const width = container.clientWidth
      const height = container.clientHeight
      if (width < 32 || height < 32) {
        return
      }
      didFitOnEnter.current = true
      syncSize()
      fitToPage(width, height)
    }

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(runFit)
    })
    const retry = window.setTimeout(runFit, 100)
    const retryLate = window.setTimeout(runFit, 350)

    return () => {
      cancelled = true
      observer.disconnect()
      window.cancelAnimationFrame(frame)
      window.clearTimeout(retry)
      window.clearTimeout(retryLate)
    }
  }, [fitToPage])

  useEffect(() => {
    const transformer = transformerRef.current
    const stage = stageHost.current
    if (!transformer || !stage) {
      return
    }
    if (editingTextId) {
      transformer.nodes([])
      transformer.getLayer()?.batchDraw()
      return
    }
    const nodes = selectedIds
      .map((id) => stage.findOne(`#${id}`))
      .filter((node): node is Konva.Node => Boolean(node))
    transformer.nodes(nodes)
    transformer.getLayer()?.batchDraw()
  }, [selectedIds, orderedElements, editingTextId])

  const pointerToPage = (stage: Konva.Stage) => {
    const pointer = stage.getPointerPosition()
    if (!pointer) {
      return null
    }
    return {
      x: (pointer.x - viewport.stagePosition.x) / viewport.zoom,
      y: (pointer.y - viewport.stagePosition.y) / viewport.zoom,
    }
  }

  const onSelect = (id: string, additive: boolean) => {
    if (viewport.spacePressed || isPanning) {
      return
    }
    if (additive) {
      setSelectedIds(
        selectedIds.includes(id)
          ? selectedIds.filter((item) => item !== id)
          : [...selectedIds, id],
      )
      return
    }
    setSelectedIds([id])
  }

  const handleDragMove = (id: string, x: number, y: number) => {
    const element = page.elements.find((item) => item.id === id)
    if (!element) {
      return { x, y }
    }
    const snapped = snapElementPosition(
      page,
      id,
      x,
      y,
      element.width,
      element.height,
    )
    setGuides({ vertical: snapped.vertical, horizontal: snapped.horizontal })
    return { x: snapped.x, y: snapped.y }
  }

  const handleDragEnd = (id: string, x: number, y: number) => {
    const element = page.elements.find((item) => item.id === id)
    if (!element) {
      return
    }
    const snapped = snapElementPosition(
      page,
      id,
      x,
      y,
      element.width,
      element.height,
    )
    updateElements([id], { x: snapped.x, y: snapped.y })
    setGuides({ vertical: null, horizontal: null })
  }

  return (
    <div
      id="design-canvas"
      ref={containerRef}
      className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-[#e8eaef]"
      style={{ cursor: viewport.spacePressed || isPanning ? 'grab' : 'default' }}
    >
      {page.elements.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center gap-2 p-6 text-center text-editor-subtle">
          <LayoutTemplate className="mb-1 text-editor-accent" size={36} />
          <strong className="text-lg text-editor-text">Comece seu design</strong>
          <span className="max-w-80 text-sm leading-snug">
            Use a barra lateral para adicionar formas, texto ou imagens.
          </span>
        </div>
      ) : null}
      <Stage
        width={size.width}
        height={size.height}
        scaleX={viewport.zoom}
        scaleY={viewport.zoom}
        x={viewport.stagePosition.x}
        y={viewport.stagePosition.y}
        ref={(node) => {
          stageHost.current = node
        }}
        onMouseDown={(event: Konva.KonvaEventObject<MouseEvent>) => {
          viewport.onStageMouseDown(event)
          if (viewport.spacePressed || event.evt.button === 1) {
            return
          }
          const stage = event.target.getStage()
          const clickedEmpty =
            event.target === stage || event.target.name() === 'page-background'
          if (!clickedEmpty || !stage) {
            return
          }
          const point = pointerToPage(stage)
          if (!point) {
            return
          }
          clearSelection()
          marqueeOrigin.current = point
          setMarquee({ x: point.x, y: point.y, width: 0, height: 0 })
        }}
        onMousemove={(event: Konva.KonvaEventObject<MouseEvent>) => {
          viewport.onStageMouseMove(event)
          if (!marqueeOrigin.current) {
            return
          }
          const stage = event.target.getStage()
          if (!stage) {
            return
          }
          const point = pointerToPage(stage)
          if (!point) {
            return
          }
          const origin = marqueeOrigin.current
          setMarquee({
            x: Math.min(origin.x, point.x),
            y: Math.min(origin.y, point.y),
            width: Math.abs(point.x - origin.x),
            height: Math.abs(point.y - origin.y),
          })
        }}
        onMouseup={() => {
          viewport.onStageMouseUp()
          if (marquee && marquee.width > 4 && marquee.height > 4) {
            const hits = page.elements
              .filter((element) => boxesIntersect(marquee, element))
              .map((element) => element.id)
            setSelectedIds(hits)
          }
          marqueeOrigin.current = null
          setMarquee(null)
        }}
        onMouseLeave={() => {
          viewport.onStageMouseUp()
          marqueeOrigin.current = null
          setMarquee(null)
        }}
      >
        <Layer>
          <Rect
            name="page-background"
            x={0}
            y={0}
            width={page.width}
            height={page.height}
            fill={page.background}
            shadowColor="rgba(15,23,42,0.25)"
            shadowBlur={24}
            shadowOffsetY={8}
            shadowOpacity={0.25}
          />

          {orderedElements.map((element) => {
            const draggable = !viewport.spacePressed && editingTextId !== element.id
            if (element.type === 'rect') {
              return (
                <RectElementView
                  key={element.id}
                  element={element}
                  isSelected={selectedIds.includes(element.id)}
                  draggable={draggable}
                  onSelect={onSelect}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onTransformEnd={(id, attrs) => updateElements([id], attrs)}
                />
              )
            }
            if (element.type === 'ellipse') {
              return (
                <EllipseElementView
                  key={element.id}
                  element={element}
                  draggable={draggable}
                  onSelect={onSelect}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onTransformEnd={(id, attrs) => updateElements([id], attrs)}
                />
              )
            }
            if (element.type === 'shape') {
              return (
                <ShapeElementView
                  key={element.id}
                  element={element}
                  draggable={draggable}
                  onSelect={onSelect}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onTransformEnd={(id, attrs) => updateElements([id], attrs)}
                />
              )
            }
            if (element.type === 'text') {
              return (
                <TextElementView
                  key={element.id}
                  element={element}
                  draggable={draggable}
                  isEditing={editingTextId === element.id}
                  isSelected={selectedIds.includes(element.id)}
                  onSelect={onSelect}
                  onEdit={startEditingText}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onTransformEnd={(id, attrs) => updateElements([id], attrs)}
                />
              )
            }
            if (element.type === 'icon') {
              return (
                <IconElementView
                  key={element.id}
                  element={element}
                  draggable={draggable}
                  onSelect={onSelect}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onTransformEnd={(id, attrs) => updateElements([id], attrs)}
                />
              )
            }
            return (
              <ImageElementView
                key={element.id}
                element={element}
                draggable={draggable}
                onSelect={onSelect}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                onTransformEnd={(id, attrs) => updateElements([id], attrs)}
              />
            )
          })}

          {guides.vertical !== null ? (
            <Line
              points={[guides.vertical, -40, guides.vertical, page.height + 40]}
              stroke="#0d9488"
              strokeWidth={1 / viewport.zoom}
              dash={[6, 4]}
            />
          ) : null}
          {guides.horizontal !== null ? (
            <Line
              points={[-40, guides.horizontal, page.width + 40, guides.horizontal]}
              stroke="#0d9488"
              strokeWidth={1 / viewport.zoom}
              dash={[6, 4]}
            />
          ) : null}

          {marquee ? (
            <Rect
              x={marquee.x}
              y={marquee.y}
              width={marquee.width}
              height={marquee.height}
              fill="rgba(13, 148, 136, 0.12)"
              stroke="#0d9488"
              strokeWidth={1 / viewport.zoom}
              dash={[4, 4]}
            />
          ) : null}

          <Transformer
            ref={transformerRef}
            rotateEnabled
            flipEnabled={false}
            borderStroke="#0d9488"
            anchorStroke="#0d9488"
            anchorFill="#ffffff"
            anchorSize={10}
            enabledAnchors={[
              'top-left',
              'top-center',
              'top-right',
              'middle-left',
              'middle-right',
              'bottom-left',
              'bottom-center',
              'bottom-right',
            ]}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 8 || newBox.height < 8) {
                return oldBox
              }
              return newBox
            }}
          />
        </Layer>
      </Stage>
      <TextEditorOverlay />
    </div>
  )
}
