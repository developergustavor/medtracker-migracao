// packages
import { useState, useCallback, useRef, useEffect } from 'react'
import { Scissor, DocumentText, Grid5, Grid2 } from 'iconsax-react'

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
import { ElementTree } from './ElementTree'
import { CanvasToolbar } from './CanvasToolbar'
import { ContextMenu } from './ContextMenu'
import { useCommandStack } from './useCommandStack'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import { useElementTree } from './useElementTree'
import { mmToPx, type DimensionUnit } from './dimensions'
// variables

const _loc = '@/pages/cadastros/editor/TemplateEditor'

type TemplateEditorProps = {
  editData?: Record<string, unknown> | null
  onSave: (data: Record<string, unknown>) => void
  onCancel: () => void
}

function TemplateEditor({ editData, onSave, onCancel }: TemplateEditorProps) {
  // -- Template metadata
  const [name, setName] = useState((editData?.name as string) || '')
  const [category, setCategory] = useState((editData?.category as string) || 'ESTERILIZACAO')
  const [type, setType] = useState((editData?.type as string) || 'COM_INDICADOR')
  const [widthMm, setWidthMm] = useState(90)
  const [heightMm, setHeightMm] = useState(35)
  const [unit, setUnit] = useState<DimensionUnit>('mm')
  const [zoom, setZoom] = useState(1.5)

  // -- Template content
  const [templateHtml, setTemplateHtml] = useState((editData?.html as string) || '')
  const [templateCss, setTemplateCss] = useState((editData?.css as string) || '')

  // -- Selection
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null)

  // -- UI state
  const [sidebarTab, setSidebarTab] = useState<'variables' | 'properties' | 'layout'>('variables')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [simulateOpen, setSimulateOpen] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  // -- Refs
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  // -- Hooks
  const commandStack = useCommandStack()
  const elementTree = useElementTree(iframeRef)

  // -- Refresh tree when template changes
  useEffect(() => {
    const timer = setTimeout(() => elementTree.refresh(), 500)
    return () => clearTimeout(timer)
  }, [templateHtml, templateCss]) // eslint-disable-line react-hooks/exhaustive-deps

  // -- Pixel dimensions
  const widthPx = mmToPx(widthMm)
  const heightPx = mmToPx(heightMm)

  // -- Content extraction
  const getLiveContent = useCallback((): { html: string; css: string } => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return { html: templateHtml, css: templateCss }
    return {
      html: iframe.contentDocument.body?.innerHTML || templateHtml,
      css: iframe.contentDocument.querySelector('style')?.textContent || templateCss
    }
  }, [templateHtml, templateCss])

  const getContentContainer = useCallback((): HTMLElement | null => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return null
    return iframe.contentDocument.querySelector('.content-container') || iframe.contentDocument.body
  }, [])

  // -- Save & Preview
  const handleSave = useCallback(() => {
    const { html, css } = getLiveContent()
    onSave({ name, category, type, html, css, settings: { width: `${widthMm}mm`, height: `${heightMm}mm` } })
  }, [name, category, type, widthMm, heightMm, onSave, getLiveContent])

  const handlePreview = useCallback(() => {
    const { html, css } = getLiveContent()
    setTemplateHtml(html)
    setTemplateCss(css)
    setPreviewOpen(true)
  }, [getLiveContent])

  // -- Template loading
  const handleLoadTemplate = useCallback((html: string, css: string, wMm: number, hMm: number, newType: string, newCategory: string) => {
    setTemplateHtml(html); setTemplateCss(css); setWidthMm(wMm); setHeightMm(hMm)
    setType(newType); setCategory(newCategory); setSelectedElement(null)
  }, [])

  // -- Element style changes
  const handleStyleChange = useCallback((prop: string, value: string) => {
    if (!selectedElement) return
    const el = selectedElement
    try { el.style.setProperty(prop, value) }
    catch { if (prop === '-webkit-line-clamp') el.style.setProperty('-webkit-line-clamp', value) }
  }, [selectedElement])

  // -- Insert handlers
  const handleInsertDiv = useCallback(() => {
    const container = getContentContainer()
    if (!container) return
    const div = container.ownerDocument.createElement('div')
    div.className = 'group'
    div.style.cssText = 'display:flex;flex-direction:column;width:100%;min-height:30px;padding:4px;border:1px dashed rgba(0,0,0,0.2);position:relative;'
    container.appendChild(div)
    elementTree.refresh()
  }, [getContentContainer, elementTree])

  const handleInsertRow = useCallback(() => {
    const container = getContentContainer()
    if (!container) return
    const row = container.ownerDocument.createElement('div')
    row.className = 'row'
    row.style.cssText = 'display:flex;flex-direction:row;width:100%;min-height:30px;border-bottom:1px solid #000;padding:2px;'
    container.appendChild(row)
    elementTree.refresh()
  }, [getContentContainer, elementTree])

  const handleInsertColumn = useCallback(() => {
    const target = selectedElement || getContentContainer()
    if (!target) return
    const col = target.ownerDocument.createElement('div')
    col.className = 'column'
    col.style.cssText = 'display:flex;flex-direction:column;flex:1;border-right:1px solid #000;padding:2px;'
    target.appendChild(col)
    elementTree.refresh()
  }, [selectedElement, getContentContainer, elementTree])

  const handleInsertSeparatorH = useCallback(() => {
    const target = selectedElement || getContentContainer()
    if (!target) return
    const sep = target.ownerDocument.createElement('div')
    sep.style.cssText = 'width:100%;height:1px;background:#000;flex-shrink:0;'
    target.appendChild(sep)
    elementTree.refresh()
  }, [selectedElement, getContentContainer, elementTree])

  const handleInsertSeparatorV = useCallback(() => {
    const target = selectedElement || getContentContainer()
    if (!target) return
    const sep = target.ownerDocument.createElement('div')
    sep.style.cssText = 'width:1px;height:100%;background:#000;flex-shrink:0;'
    target.appendChild(sep)
    elementTree.refresh()
  }, [selectedElement, getContentContainer, elementTree])

  const handleInsertImage = useCallback((src: string, width: number, height: number) => {
    const container = getContentContainer()
    if (!container) return
    const img = container.ownerDocument.createElement('img')
    img.src = src; img.style.cssText = `width:${width}px;height:${height}px;object-fit:contain;`
    img.draggable = false; container.appendChild(img); elementTree.refresh()
  }, [getContentContainer, elementTree])

  const handleInsertQrCode = useCallback(() => {
    handleInsertImage('https://bwipjs-api.metafloor.com/?bcid=datamatrixrectangular&text=1234567890&scale=2', 40, 40)
  }, [handleInsertImage])

  const handleInsertLogo = useCallback(() => {
    const container = getContentContainer()
    if (!container) return
    const img = container.ownerDocument.createElement('img')
    img.setAttribute('nome-variavel', '@@tag.cme.logo@@')
    img.className = 'variable'
    img.src = '/icons/logo/logo-icon.svg'
    img.style.cssText = 'width:30px;height:30px;object-fit:contain;'
    container.appendChild(img); elementTree.refresh()
  }, [getContentContainer, elementTree])

  // -- Simulation
  const handleSimulateApply = useCallback((values: Record<string, string>) => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return
    iframe.contentDocument.querySelectorAll('[nome-variavel]').forEach(el => {
      const path = el.getAttribute('nome-variavel')?.replace(/@@/g, '') || ''
      const value = values[path]
      if (value) { el.textContent = value; el.classList.remove('variable'); el.classList.add('variable-value') }
    })
    setIsSimulating(true)
  }, [])

  const handleSimulateClear = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return
    iframe.contentDocument.querySelectorAll('[nome-variavel]').forEach(el => {
      const path = el.getAttribute('nome-variavel')?.replace(/@@/g, '') || ''
      el.textContent = path.split('.').pop()?.charAt(0).toUpperCase() + (path.split('.').pop()?.slice(1) || '')
      el.classList.remove('variable-value'); el.classList.add('variable')
    })
    setIsSimulating(false)
  }, [])

  // -- Delete selected element
  const handleDeleteSelected = useCallback(() => {
    if (!selectedElement) return
    selectedElement.remove(); setSelectedElement(null); elementTree.refresh()
  }, [selectedElement, elementTree])

  // -- Copy/Paste (clipboard as HTML)
  const clipboardRef = useRef<string>('')

  const handleCopy = useCallback(() => {
    if (!selectedElement) return
    clipboardRef.current = selectedElement.outerHTML
  }, [selectedElement])

  const handlePaste = useCallback(() => {
    if (!clipboardRef.current) return
    const container = getContentContainer()
    if (!container) return
    const temp = container.ownerDocument.createElement('div')
    temp.innerHTML = clipboardRef.current
    if (temp.firstElementChild) { container.appendChild(temp.firstElementChild); elementTree.refresh() }
  }, [getContentContainer, elementTree])

  const handleDuplicate = useCallback(() => {
    if (!selectedElement) return
    const clone = selectedElement.cloneNode(true) as HTMLElement
    selectedElement.parentElement?.insertBefore(clone, selectedElement.nextSibling)
    setSelectedElement(clone); elementTree.refresh()
  }, [selectedElement, elementTree])

  // -- Keyboard shortcuts
  useKeyboardShortcuts(canvasContainerRef, {
    onDelete: handleDeleteSelected,
    onCopy: handleCopy,
    onPaste: handlePaste,
    onSelectAll: () => {},
    onUndo: commandStack.undo,
    onRedo: commandStack.redo,
    onDuplicate: handleDuplicate,
    onEscape: () => setSelectedElement(null),
    onGroup: () => { if (selectedElement) elementTree.groupNodes([selectedElement]) },
    onUngroup: () => {
      const node = elementTree.tree.flatMap(function flatten(n): typeof elementTree.tree { return [n, ...n.children.flatMap(flatten)] }).find(n => n.element === selectedElement)
      if (node) elementTree.ungroupNode(node)
    }
  })

  // -- Context menu handler
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  // -- Element selection from tree
  const handleTreeSelect = useCallback((el: HTMLElement) => {
    setSelectedElement(el)
    setSidebarTab('properties')
  }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Top Toolbar */}
      <EditorToolbar
        name={name} onNameChange={setName}
        category={category} onCategoryChange={setCategory}
        type={type} onTypeChange={setType}
        widthMm={widthMm} heightMm={heightMm}
        onDimensionChange={(w, h) => { setWidthMm(w); setHeightMm(h) }}
        unit={unit} onUnitChange={setUnit}
        onCancel={onCancel}
      />

      {/* Main: Tree (left) + Canvas (center) + Sidebar (right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Element Tree (left) */}
        <div className="w-[180px] shrink-0 border-r border-separator bg-card overflow-hidden">
          <ElementTree
            tree={elementTree.tree}
            selectedElement={selectedElement}
            lockedIds={new Set()}
            onSelect={handleTreeSelect}
            onToggleLock={elementTree.toggleLock}
            onToggleCollapse={elementTree.toggleCollapse}
            onDelete={elementTree.deleteNode}
            onDuplicate={elementTree.duplicateNode}
            onRename={elementTree.renameNode}
          />
        </div>

        {/* Canvas */}
        <div
          ref={canvasContainerRef}
          className="flex-1 overflow-auto flex items-center justify-center relative"
          style={{
            backgroundImage: showGrid
              ? `linear-gradient(rgba(75,123,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(75,123,255,0.08) 1px, transparent 1px)`
              : 'radial-gradient(circle, var(--fg-ghost) 1px, transparent 1px)',
            backgroundSize: showGrid ? '10px 10px' : '20px 20px'
          }}
          tabIndex={0}
          onContextMenu={handleContextMenu}
        >
          <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
            <LabelIframe
              ref={iframeRef}
              html={templateHtml} css={templateCss}
              widthPx={widthPx} heightPx={heightPx}
              onElementSelect={(el) => { setSelectedElement(el); if (el) setSidebarTab('properties'); elementTree.refresh() }}
            />
            <SelectionOverlay
              iframeRef={iframeRef} selectedElement={selectedElement}
              zoom={zoom} unit={unit} onElementResize={() => { elementTree.refresh() }}
            />
          </div>

          {/* Floating toolbar: add elements (bottom center) */}
          <div className="absolute bottom-lg left-1/2 -translate-x-1/2" style={{ zIndex: 20 }}>
            <CanvasToolbar
              onInsertDiv={handleInsertDiv}
              onInsertRow={handleInsertRow} onInsertColumn={handleInsertColumn}
              onInsertSeparatorH={handleInsertSeparatorH} onInsertSeparatorV={handleInsertSeparatorV}
              onInsertImage={handleInsertImage} onInsertQrCode={handleInsertQrCode} onInsertLogo={handleInsertLogo}
            />
          </div>

          {/* Floating toolbar: zoom + simulate + grid (bottom right) */}
          <div className="absolute bottom-lg right-lg flex items-center gap-xs bg-card border border-separator rounded-md shadow-popover px-sm py-[5px]" style={{ zIndex: 20 }}>
            <button type="button" onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="w-[28px] h-[28px] rounded-xs border border-subtle flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors text-xs text-foreground">−</button>
            <span className="text-xxs text-muted-foreground w-[38px] text-center">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="w-[28px] h-[28px] rounded-xs border border-subtle flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors text-xs text-foreground">+</button>
            <button type="button" onClick={() => setZoom(1)} className="w-[28px] h-[28px] rounded-xs border border-subtle flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors text-xxs text-muted-foreground" title="1:1">1:1</button>
            <div className="separator-v h-[18px]" />
            <button type="button" onClick={() => setShowGrid(g => !g)} className={cn('w-[28px] h-[28px] rounded-xs border flex items-center justify-center bg-transparent cursor-pointer transition-colors', showGrid ? 'border-primary bg-primary-8 text-primary' : 'border-subtle text-muted-foreground hover-elevated')} title="Grid">
              <Grid2 size={14} color="currentColor" />
            </button>
            <div className="separator-v h-[18px]" />
            {isSimulating ? (
              <>
                <button type="button" onClick={handleSimulateClear} className="h-[28px] px-sm rounded-xs border border-destructive/30 bg-destructive-8 cursor-pointer text-xxs text-destructive">Limpar</button>
                <button type="button" onClick={() => setSimulateOpen(true)} className="h-[28px] px-sm rounded-xs border border-primary-20 bg-primary-8 cursor-pointer text-xxs text-primary">Editar</button>
              </>
            ) : (
              <button type="button" onClick={() => setSimulateOpen(true)} className="h-[28px] px-md rounded-xs border border-primary-20 bg-primary-8 cursor-pointer text-xxs text-primary hover-primary-subtle transition-colors">Simular</button>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[260px] shrink-0 border-l border-separator bg-card flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-separator shrink-0">
            {(['variables', 'properties', 'layout'] as const).map(tab => (
              <button key={tab} type="button" onClick={() => setSidebarTab(tab)}
                className={cn('flex-1 flex items-center justify-center gap-[4px] py-[8px] text-xxs font-medium border-none cursor-pointer transition-colors',
                  sidebarTab === tab ? 'text-primary bg-primary-8' : 'text-muted-foreground bg-transparent hover-nav'
                )}>
                {tab === 'variables' && <DocumentText size={12} color="currentColor" />}
                {tab === 'properties' && <Scissor size={12} color="currentColor" />}
                {tab === 'layout' && <Grid5 size={12} color="currentColor" />}
                {tab === 'variables' ? 'Variáveis' : tab === 'properties' ? 'Props' : 'Layout'}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto">
            {sidebarTab === 'variables' && <VariablesPanel />}
            {sidebarTab === 'properties' && <PropertiesPanel element={selectedElement} onStyleChange={handleStyleChange} />}
            {sidebarTab === 'layout' && (
              <LayoutPanel
                onLoadTemplate={handleLoadTemplate}
                onInsertRow={handleInsertRow} onInsertColumn={handleInsertColumn}
                onInsertSeparatorH={handleInsertSeparatorH} onInsertSeparatorV={handleInsertSeparatorV}
                onInsertImage={handleInsertImage}
              />
            )}
          </div>

          {/* Bottom: Preview + Save */}
          <div className="shrink-0 flex flex-col gap-xs px-sm py-sm border-t border-separator">
            <button type="button" onClick={handlePreview} className="w-full flex items-center justify-center text-xs text-primary bg-primary-8 border border-primary-20 rounded-sm cursor-pointer hover-primary-subtle transition-colors" style={{ height: 32 }}>
              Preview
            </button>
            <button type="button" onClick={handleSave} className="w-full flex items-center justify-center text-xs text-on-solid gradient-primary border-none rounded-sm cursor-pointer" style={{ height: 32 }}>
              Salvar
            </button>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x} y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onCut={() => { handleCopy(); handleDeleteSelected() }}
          onCopy={handleCopy} onPaste={handlePaste}
          onDuplicate={handleDuplicate} onDelete={handleDeleteSelected}
          onGroup={() => { if (selectedElement) elementTree.groupNodes([selectedElement]) }}
          onUngroup={() => {
            const node = elementTree.tree.flatMap(function f(n): typeof elementTree.tree { return [n, ...n.children.flatMap(f)] }).find(n => n.element === selectedElement)
            if (node) elementTree.ungroupNode(node)
          }}
          onLock={() => {}}
          onBringForward={() => { if (selectedElement?.nextElementSibling) selectedElement.parentElement?.insertBefore(selectedElement.nextElementSibling, selectedElement); elementTree.refresh() }}
          onSendBackward={() => { if (selectedElement?.previousElementSibling) selectedElement.parentElement?.insertBefore(selectedElement, selectedElement.previousElementSibling); elementTree.refresh() }}
          isLocked={false} hasSelection={!!selectedElement}
          canUngroup={selectedElement?.classList.contains('group') || false}
        />
      )}

      {/* Dialogs */}
      <SimulateDialog open={simulateOpen} onClose={() => setSimulateOpen(false)} onApply={handleSimulateApply} onClear={handleSimulateClear} isSimulating={isSimulating} />
      <PreviewDialog open={previewOpen} onClose={() => setPreviewOpen(false)} html={templateHtml} css={templateCss} widthMm={widthMm} heightMm={heightMm} />
    </div>
  )
}

export { TemplateEditor }
