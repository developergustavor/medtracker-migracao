const _loc = '@/pages/cadastros/editor/dimensions'

// CSS reference pixel at 96 DPI
// 1 inch = 25.4mm = 96px → 1mm = 3.7795275591px
export const PX_PER_MM = 3.7795275591
export const PX_PER_CM = 37.795275591

export type DimensionUnit = 'px' | 'mm' | 'cm'

export function pxToMm(px: number): number {
  return px / PX_PER_MM
}

export function pxToCm(px: number): number {
  return px / PX_PER_CM
}

export function mmToPx(mm: number): number {
  return mm * PX_PER_MM
}

export function cmToPx(cm: number): number {
  return cm * PX_PER_CM
}

export function convertFromPx(px: number, unit: DimensionUnit): number {
  switch (unit) {
    case 'mm': return pxToMm(px)
    case 'cm': return pxToCm(px)
    default: return px
  }
}

export function convertToPx(value: number, unit: DimensionUnit): number {
  switch (unit) {
    case 'mm': return mmToPx(value)
    case 'cm': return cmToPx(value)
    default: return value
  }
}

export function formatDimension(px: number, unit: DimensionUnit, decimals: number = 1): string {
  const value = convertFromPx(px, unit)
  return `${value.toFixed(decimals)}${unit}`
}

// Common label sizes in mm
export const LABEL_PRESETS = [
  { label: '35 × 90 mm', widthMm: 90, heightMm: 35 },
  { label: '50 × 90 mm', widthMm: 90, heightMm: 50 },
  { label: '40 × 80 mm', widthMm: 80, heightMm: 40 },
  { label: '50 × 100 mm', widthMm: 100, heightMm: 50 },
  { label: 'Personalizado', widthMm: 0, heightMm: 0 }
]
