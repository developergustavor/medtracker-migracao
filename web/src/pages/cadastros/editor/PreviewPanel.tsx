// packages
import { useState } from 'react'
import { Eye, DocumentCode, Copy } from 'iconsax-react'

// components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// libs
import { cn } from '@/libs/shadcn.utils'

// local
import { mmToPx } from './dimensions'

const _loc = '@/pages/cadastros/editor/PreviewPanel'

type PreviewDialogProps = {
  open: boolean
  onClose: () => void
  html: string
  css: string
  widthMm: number
  heightMm: number
}

function PreviewDialog({ open, onClose, html, css, widthMm, heightMm }: PreviewDialogProps) {
  const [tab, setTab] = useState<'preview' | 'html' | 'css'>('preview')
  const widthPx = mmToPx(widthMm)
  const heightPx = mmToPx(heightMm)

  const fullHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style type="text/css">${css}</style></head>
<body style="margin:0;padding:0;">${html}</body>
</html>`

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(fullHtml)
  }

  const handleCopyCss = () => {
    navigator.clipboard.writeText(css)
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[800px] max-h-[90vh] flex flex-col" style={{ width: '90vw' }}>
        <DialogHeader>
          <DialogTitle className="text-heading text-foreground">Preview da Etiqueta</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-[2px] border-b border-separator">
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={cn(
              'flex items-center gap-[4px] px-md py-sm text-xs font-medium border-none cursor-pointer transition-colors',
              tab === 'preview' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground bg-transparent'
            )}
          >
            <Eye size={14} color="currentColor" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => setTab('html')}
            className={cn(
              'flex items-center gap-[4px] px-md py-sm text-xs font-medium border-none cursor-pointer transition-colors',
              tab === 'html' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground bg-transparent'
            )}
          >
            <DocumentCode size={14} color="currentColor" />
            HTML
          </button>
          <button
            type="button"
            onClick={() => setTab('css')}
            className={cn(
              'flex items-center gap-[4px] px-md py-sm text-xs font-medium border-none cursor-pointer transition-colors',
              tab === 'css' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground bg-transparent'
            )}
          >
            <DocumentCode size={14} color="currentColor" />
            CSS
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {tab === 'preview' && (
            <div className="flex items-center justify-center py-xl">
              <div style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
                <iframe
                  title="Preview"
                  srcDoc={fullHtml}
                  style={{ width: widthPx, height: heightPx, border: 'none', display: 'block' }}
                />
              </div>
            </div>
          )}

          {tab === 'html' && (
            <div className="relative">
              <button
                type="button"
                onClick={handleCopyHtml}
                className="absolute top-sm right-sm flex items-center gap-[4px] text-xxs text-primary bg-primary-8 px-sm py-[3px] rounded-xs border-none cursor-pointer z-10"
              >
                <Copy size={10} color="currentColor" />
                Copiar
              </button>
              <pre className="text-xs text-foreground bg-muted p-md rounded-sm overflow-auto font-mono whitespace-pre-wrap" style={{ maxHeight: 400 }}>
                {html || '(vazio)'}
              </pre>
            </div>
          )}

          {tab === 'css' && (
            <div className="relative">
              <button
                type="button"
                onClick={handleCopyCss}
                className="absolute top-sm right-sm flex items-center gap-[4px] text-xxs text-primary bg-primary-8 px-sm py-[3px] rounded-xs border-none cursor-pointer z-10"
              >
                <Copy size={10} color="currentColor" />
                Copiar
              </button>
              <pre className="text-xs text-foreground bg-muted p-md rounded-sm overflow-auto font-mono whitespace-pre-wrap" style={{ maxHeight: 400 }}>
                {css || '(vazio)'}
              </pre>
            </div>
          )}
        </div>

        {/* Dimensions info */}
        <div className="flex items-center justify-between px-md py-sm border-t border-separator text-xs text-muted-foreground">
          <span>{widthMm}mm × {heightMm}mm ({Math.round(widthPx)}px × {Math.round(heightPx)}px)</span>
          <span>HTML: {html.length} chars · CSS: {css.length} chars</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { PreviewDialog }
