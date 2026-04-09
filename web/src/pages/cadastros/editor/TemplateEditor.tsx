// packages
import { useState, useCallback, useRef } from 'react'
import { Scissor, DocumentText, Grid5 } from 'iconsax-react'

// libs
import { cn } from '@/libs/shadcn.utils'

// local
import { EditorToolbar } from './EditorToolbar'
import { VariablesPanel } from './VariablesPanel'
import { PropertiesPanel } from './PropertiesPanel'
import { LayoutPanel } from './LayoutPanel'
import { LabelIframe } from './LabelIframe'
import { SelectionOverlay } from './SelectionOverlay'
import { PreviewDialog } from './PreviewPanel'
import { SimulateDialog } from './SimulateDialog'
import { mmToPx, type DimensionUnit } from './dimensions'

const _loc = '@/pages/cadastros/editor/TemplateEditor'

type TemplateEditorProps = {
  editData?: Record<string, unknown> | null
  onSave: (data: Record<string, unknown>) => void
  onCancel: () => void
}

function TemplateEditor({ editData, onSave, onCancel }: TemplateEditorProps) {
  // Template metadata
  const [name, setName] = useState((editData?.name as string) || '')
  const [category, setCategory] = useState((editData?.category as string) || 'ESTERILIZACAO')
  const [type, setType] = useState((editData?.type as string) || 'COM_INDICADOR')

  // Dimensions in mm
  const [widthMm, setWidthMm] = useState(90)
  const [heightMm, setHeightMm] = useState(35)
  const [unit, setUnit] = useState<DimensionUnit>('mm')
  const [zoom, setZoom] = useState(1.5)

  // Template HTML/CSS
  const [templateHtml, setTemplateHtml] = useState((editData?.html as string) || '')
  const [templateCss, setTemplateCss] = useState((editData?.css as string) || '')

  // Selected element in the label
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null)

  // Sidebar tab
  const [sidebarTab, setSidebarTab] = useState<'variables' | 'properties' | 'layout'>('variables')

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [simulateOpen, setSimulateOpen] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)

  const handleDimensionChange = useCallback((w: number, h: number) => {
    setWidthMm(w)
    setHeightMm(h)
  }, [])

  // Extract live HTML/CSS from iframe
  const getLiveContent = useCallback((): { html: string; css: string } => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return { html: templateHtml, css: templateCss }
    const doc = iframe.contentDocument
    const body = doc.body
    const styleEl = doc.querySelector('style')
    return {
      html: body?.innerHTML || templateHtml,
      css: styleEl?.textContent || templateCss
    }
  }, [templateHtml, templateCss])

  const handleSave = useCallback(() => {
    const { html, css } = getLiveContent()
    onSave({
      name,
      category,
      type,
      html,
      css,
      settings: {
        width: `${widthMm}mm`,
        height: `${heightMm}mm`
      }
    })
  }, [name, category, type, widthMm, heightMm, onSave, getLiveContent])

  const handlePreview = useCallback(() => {
    // Sync live content before preview
    const { html, css } = getLiveContent()
    setTemplateHtml(html)
    setTemplateCss(css)
    setPreviewOpen(true)
  }, [getLiveContent])

  // Apply simulation values to iframe variables
  const handleSimulateApply = useCallback((values: Record<string, string>) => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return
    const doc = iframe.contentDocument

    // Replace all variable elements with their values
    const varElements = doc.querySelectorAll('[nome-variavel]')
    varElements.forEach(el => {
      const path = el.getAttribute('nome-variavel')?.replace(/@@/g, '') || ''
      const value = values[path]
      if (value) {
        el.textContent = value
        el.classList.remove('variable')
        el.classList.add('variable-value')
      }
    })
    setIsSimulating(true)
  }, [])

  // Clear simulation — restore original variable placeholders
  const handleSimulateClear = useCallback(() => {
    // Reload the template to reset
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return
    const doc = iframe.contentDocument

    const varElements = doc.querySelectorAll('[nome-variavel]')
    varElements.forEach(el => {
      const path = el.getAttribute('nome-variavel')?.replace(/@@/g, '') || ''
      const varName = path.split('.').pop() || 'Variável'
      // Capitalize first letter
      const placeholder = varName.charAt(0).toUpperCase() + varName.slice(1)
      el.textContent = placeholder
      el.classList.remove('variable-value')
      el.classList.add('variable')
    })
    setIsSimulating(false)
  }, [])

  // Load a template preset into the editor
  const handleLoadTemplate = useCallback((html: string, css: string, wMm: number, hMm: number, newType: string, newCategory: string) => {
    setTemplateHtml(html)
    setTemplateCss(css)
    setWidthMm(wMm)
    setHeightMm(hMm)
    setType(newType)
    setCategory(newCategory)
    setSelectedElement(null)
  }, [])

  // Apply a style change to the selected element inside the iframe
  const handleStyleChange = useCallback((prop: string, value: string) => {
    if (!selectedElement) return
    // selectedElement is a DOM node from the iframe, not React state.
    // Mutating its style is safe (it's an external system).
    const el = selectedElement
    try {
      el.style.setProperty(prop, value)
    } catch {
      // Vendor-prefixed properties
      if (prop === '-webkit-line-clamp') {
        el.style.setProperty('-webkit-line-clamp', value)
      }
    }
  }, [selectedElement])

  // Insert layout elements into the iframe
  const getContentContainer = useCallback((): HTMLElement | null => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return null
    return iframe.contentDocument.querySelector('.content-container') || iframe.contentDocument.body
  }, [])

  const handleInsertRow = useCallback(() => {
    const container = getContentContainer()
    if (!container) return
    const row = container.ownerDocument.createElement('div')
    row.className = 'row'
    row.style.cssText = 'display:flex;flex-direction:row;width:100%;min-height:30px;border-bottom:1px solid #000;padding:2px;'
    container.appendChild(row)
  }, [getContentContainer])

  const handleInsertColumn = useCallback(() => {
    const target = selectedElement || getContentContainer()
    if (!target) return
    const col = target.ownerDocument.createElement('div')
    col.className = 'column'
    col.style.cssText = 'display:flex;flex-direction:column;flex:1;border-right:1px solid #000;padding:2px;'
    target.appendChild(col)
  }, [selectedElement, getContentContainer])

  const handleInsertSeparatorH = useCallback(() => {
    const target = selectedElement || getContentContainer()
    if (!target) return
    const sep = target.ownerDocument.createElement('div')
    sep.style.cssText = 'width:100%;height:1px;background:#000;flex-shrink:0;'
    target.appendChild(sep)
  }, [selectedElement, getContentContainer])

  const handleInsertImage = useCallback((src: string, width: number, height: number) => {
    const container = getContentContainer()
    if (!container) return
    const img = container.ownerDocument.createElement('img')
    img.src = src
    img.style.cssText = `width:${width}px;height:${height}px;object-fit:contain;cursor:pointer;`
    img.draggable = false
    container.appendChild(img)
  }, [getContentContainer])

  const handleInsertSeparatorV = useCallback(() => {
    const target = selectedElement || getContentContainer()
    if (!target) return
    const sep = target.ownerDocument.createElement('div')
    sep.style.cssText = 'width:1px;height:100%;background:#000;flex-shrink:0;'
    target.appendChild(sep)
  }, [selectedElement, getContentContainer])

  // Pixel dimensions for iframe
  const widthPx = mmToPx(widthMm)
  const heightPx = mmToPx(heightMm)

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* Left: Toolbar (full height, vertical) */}
      <div className="w-[240px] shrink-0 border-r border-separator bg-card flex flex-col overflow-hidden">
        <EditorToolbar
          name={name}
          onNameChange={setName}
          category={category}
          onCategoryChange={setCategory}
          type={type}
          onTypeChange={setType}
          widthMm={widthMm}
          heightMm={heightMm}
          onDimensionChange={handleDimensionChange}
          unit={unit}
          onUnitChange={setUnit}
          onCancel={onCancel}
        />
        {/* Bottom actions: Preview + Save (fixed at bottom of toolbar) */}
        <div className="shrink-0 flex flex-col gap-xs px-md py-md border-t border-separator mt-auto">
          <button type="button" onClick={handlePreview} className="w-full flex items-center justify-center gap-[6px] text-xs text-primary bg-primary-8 border border-primary-20 rounded-sm cursor-pointer hover-primary-subtle transition-colors" style={{ height: 34 }}>
            Preview
          </button>
          <button type="button" onClick={handleSave} className="w-full flex items-center justify-center gap-[6px] text-xs text-on-solid gradient-primary border-none rounded-sm cursor-pointer" style={{ height: 34 }}>
            Salvar
          </button>
        </div>
      </div>

      {/* Center + Right */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto flex items-center justify-center bg-background relative" style={{ backgroundImage: 'radial-gradient(circle, var(--fg-ghost) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            {/* Label at zoom scale + selection overlay */}
            <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
              <LabelIframe
                ref={iframeRef}
                html={templateHtml}
                css={templateCss}
                widthPx={widthPx}
                heightPx={heightPx}
                onElementSelect={(el) => {
                  setSelectedElement(el)
                  if (el) setSidebarTab('properties')
                }}
              />
              <SelectionOverlay
                iframeRef={iframeRef}
                selectedElement={selectedElement}
                zoom={1}
                unit={unit}
                onElementResize={() => {}}
              />
            </div>

            {/* Floating canvas toolbar (bottom center) */}
            <div className="absolute bottom-lg left-1/2 -translate-x-1/2 flex items-center gap-xs bg-card border border-separator rounded-md shadow-popover px-sm py-[5px]" style={{ zIndex: 20 }}>
              {/* Zoom controls */}
              <button type="button" onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="w-[30px] h-[30px] rounded-xs border border-subtle flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors text-xs text-foreground">−</button>
              <span className="text-xs text-muted-foreground w-[44px] text-center">{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="w-[30px] h-[30px] rounded-xs border border-subtle flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors text-xs text-foreground">+</button>
              <button type="button" onClick={() => setZoom(1)} className="w-[30px] h-[30px] rounded-xs border border-subtle flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors text-xxs text-muted-foreground" title="Reset">1:1</button>
              <div className="separator-v h-[20px]" />
              {/* Simulate */}
              {isSimulating ? (
                <>
                  <button type="button" onClick={handleSimulateClear} className="h-[30px] px-sm rounded-xs border border-destructive/30 flex items-center gap-[4px] bg-destructive-8 cursor-pointer text-xxs text-destructive transition-colors">
                    Limpar
                  </button>
                  <button type="button" onClick={() => setSimulateOpen(true)} className="h-[30px] px-sm rounded-xs border border-primary-20 flex items-center gap-[4px] bg-primary-8 cursor-pointer text-xxs text-primary transition-colors">
                    Editar
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setSimulateOpen(true)} className="h-[30px] px-md rounded-xs border border-primary-20 flex items-center gap-[4px] bg-primary-8 cursor-pointer text-xxs text-primary hover-primary-subtle transition-colors">
                  Simular
                </button>
              )}
            </div>
          </div>

        {/* Sidebar (right) */}
        <div className="w-[280px] shrink-0 border-l border-separator bg-card flex flex-col overflow-hidden">
          {/* Sidebar tabs */}
          <div className="flex border-b border-separator shrink-0">
            <button
              type="button"
              onClick={() => setSidebarTab('variables')}
              className={cn(
                'flex-1 flex items-center justify-center gap-[4px] py-sm text-xs font-medium border-none cursor-pointer transition-colors',
                sidebarTab === 'variables' ? 'text-primary bg-primary-8' : 'text-muted-foreground bg-transparent hover-nav'
              )}
            >
              <DocumentText size={14} color="currentColor" />
              Variáveis
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab('properties')}
              className={cn(
                'flex-1 flex items-center justify-center gap-[4px] py-sm text-xs font-medium border-none cursor-pointer transition-colors',
                sidebarTab === 'properties' ? 'text-primary bg-primary-8' : 'text-muted-foreground bg-transparent hover-nav'
              )}
            >
              <Scissor size={14} color="currentColor" />
              Propriedades
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab('layout')}
              className={cn(
                'flex-1 flex items-center justify-center gap-[4px] py-sm text-xs font-medium border-none cursor-pointer transition-colors',
                sidebarTab === 'layout' ? 'text-primary bg-primary-8' : 'text-muted-foreground bg-transparent hover-nav'
              )}
            >
              <Grid5 size={14} color="currentColor" />
              Layout
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto">
            {sidebarTab === 'variables' && (
              <VariablesPanel />
            )}
            {sidebarTab === 'properties' && (
              <PropertiesPanel
                element={selectedElement}
                onStyleChange={handleStyleChange}
              />
            )}
            {sidebarTab === 'layout' && (
              <LayoutPanel
                onLoadTemplate={handleLoadTemplate}
                onInsertRow={handleInsertRow}
                onInsertColumn={handleInsertColumn}
                onInsertSeparatorH={handleInsertSeparatorH}
                onInsertSeparatorV={handleInsertSeparatorV}
                onInsertImage={handleInsertImage}
              />
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Simulate dialog */}
      <SimulateDialog
        open={simulateOpen}
        onClose={() => setSimulateOpen(false)}
        onApply={handleSimulateApply}
        onClear={handleSimulateClear}
        isSimulating={isSimulating}
      />

      {/* Preview dialog */}
      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        html={templateHtml}
        css={templateCss}
        widthMm={widthMm}
        heightMm={heightMm}
      />
    </div>
  )
}

export { TemplateEditor }
