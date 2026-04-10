// packages
import { forwardRef, useEffect, useRef, useCallback } from 'react'

const _loc = '@/pages/cadastros/editor/LabelIframe'

type LabelIframeProps = {
  html: string
  css: string
  widthPx: number
  heightPx: number
  onElementSelect: (element: HTMLElement | null) => void
}

const LabelIframe = forwardRef<HTMLIFrameElement, LabelIframeProps>(
  ({ html, css, widthPx, heightPx, onElementSelect }, ref) => {
    const internalRef = useRef<HTMLIFrameElement>(null)
    const iframeRef = (ref as React.RefObject<HTMLIFrameElement | null>) || internalRef

    // Build complete HTML document for iframe srcdoc
    const buildSrcdoc = useCallback(() => {
      const defaultCss = `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { margin: 0; padding: 0; overflow: hidden; background: #fff; }
        .variable {
          font-size: 11px; font-weight: 700; border-radius: 4px;
          padding: 1px 4px; border: 1px solid #006c9e;
          color: #00415f; background-color: #99c4d8;
          text-align: center; width: auto; height: auto;
          max-width: 99%; display: -webkit-box; overflow: hidden;
          -webkit-line-clamp: 1; line-clamp: 1;
          -webkit-box-orient: vertical; text-overflow: ellipsis;
          word-wrap: break-word; word-break: break-all;
          white-space: pre-line; line-height: 0.8rem;
          cursor: pointer;
        }
        .variable:hover { outline: 2px solid #4B7BFF; outline-offset: 1px; }
        .variable-value { font-size: 13px; font-weight: 400; }
        [contenteditable]:focus { outline: 2px solid #4B7BFF; outline-offset: -2px; }
        /* Editor overrides: make everything interactive */
        * { pointer-events: auto !important; cursor: default !important; }
        .variable, span[nome-variavel] { cursor: pointer !important; }
        .container { cursor: default !important; }
      `

      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style type="text/css">${defaultCss}\n${css}</style>
</head>
<body>${html || '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;font-family:sans-serif;">Etiqueta vazia — arraste variáveis ou escolha um template</div>'}</body>
</html>`
    }, [html, css])

    // Update iframe content when html/css change
    useEffect(() => {
      const iframe = iframeRef.current
      if (!iframe) return

      const srcdoc = buildSrcdoc()
      iframe.srcdoc = srcdoc
    }, [buildSrcdoc, iframeRef])

    // Setup click handler inside iframe for element selection
    useEffect(() => {
      const iframe = iframeRef.current
      if (!iframe) return

      const handleLoad = () => {
        const doc = iframe.contentDocument
        if (!doc) return

        // Element selection + internal drag
        let dragState: { el: HTMLElement; startX: number; startY: number; origLeft: string; origTop: string; moved: boolean } | null = null

        doc.addEventListener('mousedown', (e) => {
          const target = e.target as HTMLElement
          if (!target || target === doc.body || target === doc.documentElement) return

          // Start potential drag
          const cs = doc.defaultView?.getComputedStyle(target)
          dragState = {
            el: target,
            startX: e.clientX,
            startY: e.clientY,
            origLeft: target.style.left || cs?.left || '0',
            origTop: target.style.top || cs?.top || '0',
            moved: false
          }
        })

        doc.addEventListener('mousemove', (e) => {
          if (!dragState) return
          const dx = e.clientX - dragState.startX
          const dy = e.clientY - dragState.startY

          // Only start drag if moved more than 3px (to distinguish from click)
          if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return
          dragState.moved = true

          const el = dragState.el
          // Switch to absolute positioning if not already
          if (el.style.position !== 'absolute') {
            el.style.position = 'relative'
          }
          el.style.left = `${(parseFloat(dragState.origLeft) || 0) + dx}px`
          el.style.top = `${(parseFloat(dragState.origTop) || 0) + dy}px`
        })

        doc.addEventListener('mouseup', () => {
          if (dragState && !dragState.moved) {
            // It was a click, not a drag
            onElementSelect(dragState.el)
          }
          dragState = null
        })

        // Click on empty space deselects
        doc.addEventListener('click', (e) => {
          const target = e.target as HTMLElement
          if (target === doc.body || target === doc.documentElement) {
            onElementSelect(null)
          }
        })

        // Handle drop from variables panel
        doc.addEventListener('dragover', (e) => {
          e.preventDefault()
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
        })

        doc.addEventListener('drop', (e) => {
          e.preventDefault()
          const htmlData = e.dataTransfer?.getData('text/html')
          if (htmlData && doc) {
            // Find the content-container or body to drop into
            const contentContainer = doc.querySelector('.content-container') || doc.body
            const temp = doc.createElement('div')
            temp.innerHTML = htmlData
            const newElement = temp.firstElementChild
            if (newElement) {
              contentContainer.appendChild(newElement)
              onElementSelect(newElement as HTMLElement)
            }
          }
        })
      }

      iframe.addEventListener('load', handleLoad)
      return () => iframe.removeEventListener('load', handleLoad)
    }, [iframeRef, onElementSelect])

    return (
      <div
        className="relative"
        style={{
          width: widthPx,
          height: heightPx,
          boxShadow: '0 4px 24px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1)',
          borderRadius: 2
        }}
      >
        <iframe
          ref={iframeRef}
          title="Template Label Editor"
          className="block border-none"
          style={{
            width: widthPx,
            height: heightPx,
            overflow: 'hidden',
            borderRadius: 2
          }}
        />
      </div>
    )
  }
)

LabelIframe.displayName = 'LabelIframe'

export { LabelIframe }
