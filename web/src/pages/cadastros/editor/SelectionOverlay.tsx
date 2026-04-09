// packages
import { useState, useEffect, useCallback, useRef } from 'react'

// local
import { formatDimension, type DimensionUnit } from './dimensions'

const _loc = '@/pages/cadastros/editor/SelectionOverlay'

type SelectionOverlayProps = {
  iframeRef: React.RefObject<HTMLIFrameElement | null>
  selectedElement: HTMLElement | null
  zoom: number
  unit: DimensionUnit
  onElementResize: (width: number, height: number) => void
}

type BoundingBox = {
  x: number
  y: number
  width: number
  height: number
}

type HoverInfo = {
  box: BoundingBox
  tagName: string
  className: string
} | null

function SelectionOverlay({ iframeRef, selectedElement, zoom, unit, onElementResize }: SelectionOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>(null)
  const [resizing, setResizing] = useState<{ handle: string; startX: number; startY: number; startW: number; startH: number } | null>(null)

  // Get the iframe's position relative to the overlay container
  const getIframeOffset = useCallback((): { x: number; y: number } => {
    const iframe = iframeRef.current
    const overlay = overlayRef.current
    if (!iframe || !overlay) return { x: 0, y: 0 }
    const iframeRect = iframe.getBoundingClientRect()
    const overlayRect = overlay.getBoundingClientRect()
    return {
      x: iframeRect.left - overlayRect.left,
      y: iframeRect.top - overlayRect.top
    }
  }, [iframeRef])

  // Convert element rect inside iframe to overlay coordinates (accounting for zoom)
  const elementToOverlay = useCallback((rect: DOMRect): BoundingBox => {
    const offset = getIframeOffset()
    return {
      x: offset.x + rect.left * zoom,
      y: offset.y + rect.top * zoom,
      width: rect.width * zoom,
      height: rect.height * zoom
    }
  }, [getIframeOffset, zoom])

  // Selection box — updated when selectedElement changes
  const [selectionBox, setSelectionBox] = useState<BoundingBox | null>(null)

  /* eslint-disable react-hooks/set-state-in-effect -- syncing external DOM measurement */
  useEffect(() => {
    if (!selectedElement) { setSelectionBox(null); return }
    const rect = selectedElement.getBoundingClientRect()
    setSelectionBox(elementToOverlay(rect))
  }, [selectedElement, elementToOverlay, zoom])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Setup hover listener on iframe for measurement tooltips
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleLoad = () => {
      const doc = iframe.contentDocument
      if (!doc) return

      const handleMouseMove = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (!target || target === doc.body || target === doc.documentElement) {
          setHoverInfo(null)
          return
        }

        // Don't show hover if we're hovering the selected element (it has its own box)
        if (target === selectedElement) {
          setHoverInfo(null)
          return
        }

        const rect = target.getBoundingClientRect()
        setHoverInfo({
          box: elementToOverlay(rect),
          tagName: target.tagName.toLowerCase(),
          className: (target.className || '').toString().split(' ')[0] || ''
        })
      }

      const handleMouseLeave = () => setHoverInfo(null)

      doc.addEventListener('mousemove', handleMouseMove)
      doc.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        doc.removeEventListener('mousemove', handleMouseMove)
        doc.removeEventListener('mouseleave', handleMouseLeave)
      }
    }

    iframe.addEventListener('load', handleLoad)
    // Also try immediately in case iframe already loaded
    const cleanup = handleLoad()

    return () => {
      iframe.removeEventListener('load', handleLoad)
      cleanup?.()
    }
  }, [iframeRef, selectedElement, elementToOverlay])

  // Resize handle drag
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!selectedElement || !selectionBox) return

    const rect = selectedElement.getBoundingClientRect()
    setResizing({
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height
    })
  }, [selectedElement, selectionBox])

  useEffect(() => {
    if (!resizing || !selectedElement) return

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - resizing.startX) / zoom
      const dy = (e.clientY - resizing.startY) / zoom
      let newW = resizing.startW
      let newH = resizing.startH

      if (resizing.handle.includes('e')) newW = Math.max(10, resizing.startW + dx)
      if (resizing.handle.includes('w')) newW = Math.max(10, resizing.startW - dx)
      if (resizing.handle.includes('s')) newH = Math.max(10, resizing.startH + dy)
      if (resizing.handle.includes('n')) newH = Math.max(10, resizing.startH - dy)

      selectedElement.style.width = `${newW}px`
      selectedElement.style.height = `${newH}px`

      // Selection box will recalculate on next render
    }

    const handleMouseUp = () => {
      if (selectedElement) {
        const rect = selectedElement.getBoundingClientRect()
        onElementResize(rect.width, rect.height)
      }
      setResizing(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing, selectedElement, zoom, elementToOverlay, onElementResize])

  return (
    <div ref={overlayRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
      {/* Hover highlight (dashed blue) */}
      {hoverInfo && (
        <>
          <div
            className="absolute border border-dashed border-primary/40"
            style={{
              left: hoverInfo.box.x,
              top: hoverInfo.box.y,
              width: hoverInfo.box.width,
              height: hoverInfo.box.height
            }}
          />
          {/* Measurement tooltip */}
          <div
            className="absolute bg-popover text-foreground text-xxs px-[6px] py-[2px] rounded-xs border border-popover shadow-popover whitespace-nowrap"
            style={{
              left: hoverInfo.box.x,
              top: hoverInfo.box.y - 20,
              zIndex: 20
            }}
          >
            {formatDimension(hoverInfo.box.width / zoom, unit)} × {formatDimension(hoverInfo.box.height / zoom, unit)}
            <span className="text-fg-dim ml-[4px]">{hoverInfo.tagName}{hoverInfo.className ? `.${hoverInfo.className}` : ''}</span>
          </div>
        </>
      )}

      {/* Selection box (solid blue) */}
      {selectionBox && (
        <>
          <div
            className="absolute border-2 border-primary"
            style={{
              left: selectionBox.x,
              top: selectionBox.y,
              width: selectionBox.width,
              height: selectionBox.height
            }}
          />

          {/* Dimension label */}
          <div
            className="absolute bg-primary text-on-solid text-xxs font-semibold px-[6px] py-[2px] rounded-xs whitespace-nowrap"
            style={{
              left: selectionBox.x,
              top: selectionBox.y + selectionBox.height + 4,
              zIndex: 20
            }}
          >
            {formatDimension(selectionBox.width / zoom, unit)} × {formatDimension(selectionBox.height / zoom, unit)}
          </div>

          {/* Resize handles */}
          {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map(handle => {
            const size = 8
            const half = size / 2
            let left = selectionBox.x
            let top = selectionBox.y

            if (handle.includes('e')) left = selectionBox.x + selectionBox.width - half
            else if (handle.includes('w')) left = selectionBox.x - half
            else left = selectionBox.x + selectionBox.width / 2 - half

            if (handle.includes('s')) top = selectionBox.y + selectionBox.height - half
            else if (handle.includes('n')) top = selectionBox.y - half
            else top = selectionBox.y + selectionBox.height / 2 - half

            const cursors: Record<string, string> = {
              nw: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize', se: 'nwse-resize',
              n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize'
            }

            return (
              <div
                key={handle}
                className="absolute bg-primary border border-on-solid rounded-[2px] pointer-events-auto"
                style={{
                  left,
                  top,
                  width: size,
                  height: size,
                  cursor: cursors[handle],
                  zIndex: 30
                }}
                onMouseDown={e => handleResizeStart(e, handle)}
              />
            )
          })}
        </>
      )}
    </div>
  )
}

export { SelectionOverlay }
