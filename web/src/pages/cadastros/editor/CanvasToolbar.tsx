// packages
import { useRef } from 'react'
import { RowHorizontal, RowVertical, Minus, Grid1, Image, Box1, DocumentCode } from 'iconsax-react'

const _loc = '@/pages/cadastros/editor/CanvasToolbar'

type CanvasToolbarProps = {
  onInsertDiv: () => void
  onInsertRow: () => void
  onInsertColumn: () => void
  onInsertSeparatorH: () => void
  onInsertSeparatorV: () => void
  onInsertImage: (src: string, width: number, height: number) => void
  onInsertQrCode: () => void
  onInsertLogo: () => void
}

function ToolButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-[2px] px-[8px] py-[4px] rounded-xs bg-transparent border-none cursor-pointer hover-nav transition-colors"
      title={label}
    >
      {icon}
      <span className="text-xxs text-muted-foreground leading-none">{label}</span>
    </button>
  )
}

function CanvasToolbar({
  onInsertDiv, onInsertRow, onInsertColumn, onInsertSeparatorH, onInsertSeparatorV,
  onInsertImage, onInsertQrCode, onInsertLogo
}: CanvasToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      const img = new window.Image()
      img.onload = () => {
        const maxW = 60
        const scale = img.width > maxW ? maxW / img.width : 1
        onInsertImage(src, Math.round(img.width * scale), Math.round(img.height * scale))
      }
      img.src = src
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-[2px] bg-card border border-separator rounded-md shadow-popover px-[4px] py-[3px]" style={{ zIndex: 20 }}>
      <ToolButton icon={<Box1 size={16} color="var(--primary)" />} label="Div" onClick={onInsertDiv} />
      <ToolButton icon={<RowHorizontal size={16} color="var(--foreground)" />} label="Linha" onClick={onInsertRow} />
      <ToolButton icon={<RowVertical size={16} color="var(--foreground)" />} label="Coluna" onClick={onInsertColumn} />

      <div className="separator-v h-[24px] mx-[2px]" />

      <ToolButton icon={<Minus size={16} color="var(--foreground)" />} label="Sep H" onClick={onInsertSeparatorH} />
      <ToolButton icon={<Grid1 size={16} color="var(--foreground)" />} label="Sep V" onClick={onInsertSeparatorV} />

      <div className="separator-v h-[24px] mx-[2px]" />

      <ToolButton icon={<Image size={16} color="var(--foreground)" />} label="Imagem" onClick={() => fileRef.current?.click()} />
      <ToolButton icon={<DocumentCode size={16} color="var(--foreground)" />} label="QR" onClick={onInsertQrCode} />
      <ToolButton icon={<Image size={16} color="var(--primary)" />} label="Logo" onClick={onInsertLogo} />

      <input ref={fileRef} type="file" accept="image/png,image/jpg,image/jpeg,image/svg+xml" className="hidden" onChange={handleFileChange} />
    </div>
  )
}

export { CanvasToolbar }
