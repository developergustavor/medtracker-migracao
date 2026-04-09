// packages
import { useRef } from 'react'
import { Image, DocumentUpload } from 'iconsax-react'

const _loc = '@/pages/cadastros/editor/ImageTool'

type ImageToolProps = {
  onInsertImage: (src: string, width: number, height: number) => void
}

function ImageTool({ onInsertImage }: ImageToolProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      // Get image dimensions
      const img = new window.Image()
      img.onload = () => {
        // Default insert size: max 60px wide, maintain aspect ratio
        const maxW = 60
        const scale = img.width > maxW ? maxW / img.width : 1
        onInsertImage(src, Math.round(img.width * scale), Math.round(img.height * scale))
      }
      img.src = src
    }
    reader.readAsDataURL(file)

    // Reset input so same file can be selected again
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-xs px-md py-sm">
      <span className="text-xxs text-muted-foreground uppercase font-semibold tracking-wider">Imagens</span>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-sm px-sm py-[8px] text-xs text-foreground bg-transparent border border-subtle rounded-sm cursor-pointer hover-nav transition-colors"
      >
        <DocumentUpload size={16} color="var(--primary)" />
        Upload de imagem
      </button>

      <button
        type="button"
        onClick={() => {
          // Insert QR code placeholder
          onInsertImage('https://bwipjs-api.metafloor.com/?bcid=datamatrixrectangular&text=1234567890&scale=2', 40, 40)
        }}
        className="flex items-center gap-sm px-sm py-[8px] text-xs text-foreground bg-transparent border border-subtle rounded-sm cursor-pointer hover-nav transition-colors"
      >
        <Image size={16} color="var(--primary)" />
        QR Code (placeholder)
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpg,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="text-xxs text-fg-dim mt-xs">
        Imagens inseridas aparecerão na posição do cursor ou no final do template. Use o painel de propriedades para redimensionar.
      </p>
    </div>
  )
}

export { ImageTool }
