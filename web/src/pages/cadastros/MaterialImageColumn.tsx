// packages
import { useState, useRef } from 'react'
import { Add, Camera, DocumentUpload, Trash, CloseCircle } from 'iconsax-react'

// libs
import { cn } from '@/libs/shadcn.utils'

const _loc = '@/pages/cadastros/MaterialImageColumn'
const MAX_IMAGES = 3

type MaterialImageColumnProps = {
  images: string[]
  onAddImages: (files: File[]) => void
  onRemoveImage: (index: number) => void
  mode: 'desktop' | 'mobile'
}

// ═══ DESKTOP: dropzone + 3 thumbnails side by side, fills height ═══
function DesktopImageBar({ images, onAddImages, onRemoveImage, fileRef, dragOver, setDragOver }: {
  images: string[]
  onAddImages: (files: File[]) => void
  onRemoveImage: (index: number) => void
  fileRef: React.RefObject<HTMLInputElement | null>
  dragOver: boolean
  setDragOver: (v: boolean) => void
}) {
  const canAdd = images.length < MAX_IMAGES

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files) {
      const valid = Array.from(files).filter(f => /\.(png|jpe?g)$/i.test(f.name)).slice(0, MAX_IMAGES - images.length)
      if (valid.length > 0) onAddImages(valid)
    }
  }

  return (
    <div className="flex gap-sm h-full">
      {/* Dropzone — fills remaining space */}
      {canAdd && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={cn(
            'flex-1 flex flex-col items-center justify-center gap-sm rounded-md border-2 border-dashed cursor-pointer transition-colors min-w-0',
            dragOver ? 'border-primary bg-primary-8' : 'border-subtle bg-muted/30'
          )}
        >
          <div className="w-[36px] h-[36px] rounded-full bg-primary-8 flex items-center justify-center">
            <Add size={18} color="var(--primary)" />
          </div>
          <span className="text-xxs text-muted-foreground text-center leading-relaxed">
            Arraste, cole<br />(Ctrl+V) ou clique
          </span>
          <div className="flex gap-xs">
            <button
              type="button"
              onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
              className="text-xxs text-primary bg-primary-8 px-sm py-[3px] rounded-xs border-none cursor-pointer flex items-center gap-[3px]"
            >
              <DocumentUpload size={10} color="currentColor" />
              Upload
            </button>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); /* camera */ }}
              className="text-xxs text-primary bg-primary-8 px-sm py-[3px] rounded-xs border-none cursor-pointer flex items-center gap-[3px]"
            >
              <Camera size={10} color="currentColor" />
              Camera
            </button>
          </div>
        </div>
      )}

      {/* 3 thumbnail slots */}
      {Array.from({ length: MAX_IMAGES }).map((_, i) => {
        const src = images[i]
        return (
          <div
            key={i}
            className={cn(
              'relative rounded-sm overflow-hidden border flex-1 min-w-0',
              src ? 'border-subtle' : 'border-dashed border-subtle bg-muted/20'
            )}
          >
            {src ? (
              <>
                <img src={src} alt={`Imagem ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => onRemoveImage(i)}
                  className="absolute top-[4px] right-[4px] w-[20px] h-[20px] rounded-xs bg-destructive/80 flex items-center justify-center border-none cursor-pointer"
                >
                  <Trash size={10} color="white" />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xxs text-fg-ghost">{i + 1}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ═══ MOBILE: horizontal row with dropzone slot first, then 3 image slots. Sheet on click. ═══
function MobileImageBar({ images, onRemoveImage, fileRef }: {
  images: string[]
  onRemoveImage: (index: number) => void
  fileRef: React.RefObject<HTMLInputElement | null>
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const canAdd = images.length < MAX_IMAGES

  return (
    <>
      <div className="flex items-center gap-sm px-md py-sm bg-card border-b border-separator shrink-0">
        {/* Add slot (always first) */}
        <div
          onClick={() => canAdd && setSheetOpen(true)}
          className={cn(
            'w-[50px] h-[50px] rounded-sm border-2 border-dashed shrink-0 flex items-center justify-center',
            canAdd ? 'border-primary/30 cursor-pointer' : 'border-subtle opacity-40'
          )}
        >
          <Add size={18} color="var(--primary)" />
        </div>

        {/* 3 image slots */}
        {Array.from({ length: MAX_IMAGES }).map((_, i) => {
          const src = images[i]
          return src ? (
            <div key={i} className="w-[50px] h-[50px] rounded-sm overflow-hidden border border-subtle relative shrink-0">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveImage(i)}
                className="absolute top-[2px] right-[2px] w-[16px] h-[16px] rounded-xs bg-destructive/80 flex items-center justify-center border-none cursor-pointer"
              >
                <CloseCircle size={10} color="white" variant="Bold" />
              </button>
            </div>
          ) : (
            <div key={i} className="w-[50px] h-[50px] rounded-sm border border-dashed border-subtle shrink-0 flex items-center justify-center">
              <span className="text-xxs text-fg-ghost">{i + 1}</span>
            </div>
          )
        })}

        <span className="text-xxs text-fg-dim ml-auto">{images.length}/{MAX_IMAGES}</span>
      </div>

      {/* Bottom sheet for choosing camera/upload */}
      {sheetOpen && (
        <div className="fixed inset-0 z-backdrop" onClick={() => setSheetOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-lg border-t border-separator p-lg animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-[40px] h-[4px] rounded-pill bg-fg-ghost mx-auto mb-lg" />
            <p className="text-body text-foreground font-semibold mb-md text-center">Adicionar imagem</p>
            <div className="flex flex-col gap-sm">
              <button
                type="button"
                onClick={() => { setSheetOpen(false); /* camera */ }}
                className="flex items-center gap-md px-lg py-md rounded-sm bg-elevated border-none cursor-pointer text-foreground text-body font-medium hover-nav transition-colors"
              >
                <Camera size={20} color="var(--primary)" />
                Tirar foto com a câmera
              </button>
              <button
                type="button"
                onClick={() => { setSheetOpen(false); fileRef.current?.click() }}
                className="flex items-center gap-md px-lg py-md rounded-sm bg-elevated border-none cursor-pointer text-foreground text-body font-medium hover-nav transition-colors"
              >
                <DocumentUpload size={20} color="var(--primary)" />
                Fazer upload de arquivo
              </button>
            </div>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="w-full mt-md py-sm text-center text-caption text-muted-foreground bg-transparent border-none cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ═══ MAIN COMPONENT ═══
function MaterialImageColumn({ images, onAddImages, onRemoveImage, mode }: MaterialImageColumnProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const valid = Array.from(files).filter(f => /\.(png|jpe?g)$/i.test(f.name)).slice(0, MAX_IMAGES - images.length)
    if (valid.length > 0) onAddImages(valid)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    const files: File[] = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile()
        if (file) files.push(file)
      }
    }
    if (files.length > 0) onAddImages(files.slice(0, MAX_IMAGES - images.length))
  }

  return (
    <div onPaste={handlePaste} tabIndex={0} className={mode === 'desktop' ? 'h-full' : ''}>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpg,image/jpeg"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {mode === 'desktop' ? (
        <DesktopImageBar
          images={images}
          onAddImages={onAddImages}
          onRemoveImage={onRemoveImage}
          fileRef={fileRef}
          dragOver={dragOver}
          setDragOver={setDragOver}
        />
      ) : (
        <MobileImageBar
          images={images}
          onRemoveImage={onRemoveImage}
          fileRef={fileRef}
        />
      )}
    </div>
  )
}

export { MaterialImageColumn }
