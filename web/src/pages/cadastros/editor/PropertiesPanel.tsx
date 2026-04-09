// packages
import { useState, useMemo, useCallback } from 'react'

// components
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const _loc = '@/pages/cadastros/editor/PropertiesPanel'

type PropertiesPanelProps = {
  element: HTMLElement | null
  onStyleChange: (prop: string, value: string) => void
}

const FONT_FAMILIES = [
  'sans-serif', 'serif', 'monospace', 'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'
]

const FONT_WEIGHTS = [
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' }
]

const LINE_CLAMP_OPTIONS = [
  { value: 'none', label: 'Sem limite' },
  { value: '1', label: '1 linha' },
  { value: '2', label: '2 linhas' },
  { value: '3', label: '3 linhas' }
]

function PropertiesPanel({ element, onStyleChange }: PropertiesPanelProps) {
  // Derive props from element computed styles (useMemo, not useEffect)
  const computedProps = useMemo(() => {
    const defaults = {
      fontFamily: 'sans-serif', fontSize: '11', fontWeight: '400',
      color: '#000000', backgroundColor: 'transparent', textAlign: 'left',
      lineHeight: '1', lineClamp: 'none', width: 'auto', height: 'auto',
      paddingTop: '0', paddingRight: '0', paddingBottom: '0', paddingLeft: '0',
      borderWidth: '0', borderColor: '#000000', borderRadius: '0',
      rotate: '0', overflow: 'hidden'
    }
    if (!element) return defaults
    try {
      const cs = window.getComputedStyle(element)
      return {
        fontFamily: cs.fontFamily?.split(',')[0]?.replace(/['"]/g, '').trim() || 'sans-serif',
        fontSize: parseInt(cs.fontSize) ? String(parseInt(cs.fontSize)) : '11',
        fontWeight: cs.fontWeight || '400',
        color: rgbToHex(cs.color) || '#000000',
        backgroundColor: cs.backgroundColor === 'rgba(0, 0, 0, 0)' ? 'transparent' : (rgbToHex(cs.backgroundColor) || 'transparent'),
        textAlign: cs.textAlign || 'left',
        lineHeight: cs.lineHeight === 'normal' ? '1.2' : String(parseFloat(cs.lineHeight) / (parseInt(cs.fontSize) || 11)),
        lineClamp: element.style.webkitLineClamp || 'none',
        width: element.style.width || 'auto', height: element.style.height || 'auto',
        paddingTop: String(parseInt(cs.paddingTop) || 0), paddingRight: String(parseInt(cs.paddingRight) || 0),
        paddingBottom: String(parseInt(cs.paddingBottom) || 0), paddingLeft: String(parseInt(cs.paddingLeft) || 0),
        borderWidth: String(parseInt(cs.borderWidth) || 0), borderColor: rgbToHex(cs.borderColor) || '#000000',
        borderRadius: String(parseInt(cs.borderRadius) || 0),
        rotate: extractRotation(cs.transform) || '0', overflow: cs.overflow || 'hidden'
      }
    } catch { return defaults }
  }, [element])

  // Use computed as base, local overrides on edit
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const props = { ...computedProps, ...overrides }

  // Clear overrides when element changes
  const elementId = element ? (element.getAttribute('nome-variavel') || element.tagName + element.className) : ''
  const prevId = useMemo(() => elementId, [elementId])
  if (prevId !== elementId) setOverrides({})

  const handleChange = useCallback((key: string, value: string) => {
    setOverrides(prev => ({ ...prev, [key]: value }))

    // Map to CSS property
    const cssMap: Record<string, string> = {
      fontFamily: 'font-family',
      fontSize: 'font-size',
      fontWeight: 'font-weight',
      color: 'color',
      backgroundColor: 'background-color',
      textAlign: 'text-align',
      lineHeight: 'line-height',
      width: 'width',
      height: 'height',
      paddingTop: 'padding-top',
      paddingRight: 'padding-right',
      paddingBottom: 'padding-bottom',
      paddingLeft: 'padding-left',
      borderWidth: 'border-width',
      borderColor: 'border-color',
      borderRadius: 'border-radius',
      overflow: 'overflow'
    }

    if (key === 'fontSize') {
      onStyleChange('font-size', `${value}px`)
    } else if (key === 'lineHeight') {
      onStyleChange('line-height', `${value}rem`)
    } else if (key === 'lineClamp') {
      onStyleChange('-webkit-line-clamp', value === 'none' ? 'unset' : value)
    } else if (key === 'rotate') {
      onStyleChange('transform', value === '0' ? 'none' : `rotate(${value}deg)`)
    } else if (['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderWidth', 'borderRadius'].includes(key)) {
      onStyleChange(cssMap[key], `${value}px`)
    } else if (cssMap[key]) {
      onStyleChange(cssMap[key], value)
    }
  }, [onStyleChange])

  if (!element) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-sm text-muted-foreground px-lg text-center">
        <span className="text-body">Nenhum elemento selecionado</span>
        <span className="text-caption text-fg-dim">Clique em um elemento na etiqueta para editar suas propriedades</span>
      </div>
    )
  }

  const tagName = element.tagName.toLowerCase()
  const variableName = element.getAttribute('nome-variavel')

  return (
    <div className="flex flex-col gap-md p-md overflow-y-auto">
      {/* Element info */}
      <div className="bg-elevated rounded-xs p-sm">
        <span className="text-xxs text-muted-foreground uppercase font-semibold">Elemento</span>
        <div className="text-xs text-foreground font-mono mt-[2px]">&lt;{tagName}&gt;</div>
        {variableName && <div className="text-xxs text-primary font-mono mt-[2px]">{variableName}</div>}
      </div>

      {/* Typography */}
      <Section label="Tipografia">
        <Row>
          <Field label="Fonte" span={8}>
            <Select value={props.fontFamily} onValueChange={v => handleChange('fontFamily', v)}>
              <SelectTrigger className="text-xs h-[28px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tamanho" span={4}>
            <Input type="text" inputMode="numeric" value={props.fontSize} onChange={e => handleChange('fontSize', e.target.value.replace(/\D/g, ''))} className="text-xs text-center h-[28px]" />
          </Field>
        </Row>
        <Row>
          <Field label="Peso" span={6}>
            <Select value={props.fontWeight} onValueChange={v => handleChange('fontWeight', v)}>
              <SelectTrigger className="text-xs h-[28px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FONT_WEIGHTS.map(w => <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Alinhamento" span={6}>
            <div className="flex gap-[2px]">
              {['left', 'center', 'right'].map(align => (
                <button key={align} type="button" onClick={() => handleChange('textAlign', align)}
                  className={`flex-1 h-[28px] text-xxs border rounded-xs cursor-pointer transition-colors ${props.textAlign === align ? 'bg-primary-8 text-primary border-primary-20' : 'bg-transparent text-muted-foreground border-subtle'}`}>
                  {align === 'left' ? '⫷' : align === 'center' ? '⫿' : '⫸'}
                </button>
              ))}
            </div>
          </Field>
        </Row>
        <Row>
          <Field label="Line Height" span={6}>
            <Input type="text" value={props.lineHeight} onChange={e => handleChange('lineHeight', e.target.value)} className="text-xs text-center h-[28px]" />
          </Field>
          <Field label="Line Clamp" span={6}>
            <Select value={props.lineClamp} onValueChange={v => handleChange('lineClamp', v)}>
              <SelectTrigger className="text-xs h-[28px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LINE_CLAMP_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </Row>
      </Section>

      {/* Colors */}
      <Section label="Cores">
        <Row>
          <Field label="Texto" span={6}>
            <div className="flex items-center gap-xs">
              <input type="color" value={props.color} onChange={e => handleChange('color', e.target.value)} className="w-[28px] h-[28px] rounded-xs border border-subtle cursor-pointer" />
              <Input value={props.color} onChange={e => handleChange('color', e.target.value)} className="text-xs text-center h-[28px] flex-1 font-mono" />
            </div>
          </Field>
          <Field label="Fundo" span={6}>
            <div className="flex items-center gap-xs">
              <input type="color" value={props.backgroundColor === 'transparent' ? '#ffffff' : props.backgroundColor} onChange={e => handleChange('backgroundColor', e.target.value)} className="w-[28px] h-[28px] rounded-xs border border-subtle cursor-pointer" />
              <Input value={props.backgroundColor} onChange={e => handleChange('backgroundColor', e.target.value)} className="text-xs text-center h-[28px] flex-1 font-mono" />
            </div>
          </Field>
        </Row>
      </Section>

      {/* Dimensions */}
      <Section label="Dimensões">
        <Row>
          <Field label="Largura" span={6}>
            <Input value={props.width} onChange={e => handleChange('width', e.target.value)} className="text-xs text-center h-[28px]" />
          </Field>
          <Field label="Altura" span={6}>
            <Input value={props.height} onChange={e => handleChange('height', e.target.value)} className="text-xs text-center h-[28px]" />
          </Field>
        </Row>
      </Section>

      {/* Padding */}
      <Section label="Padding (px)">
        <div className="grid grid-cols-4 gap-xs">
          <Field label="T"><Input value={props.paddingTop} onChange={e => handleChange('paddingTop', e.target.value.replace(/\D/g, ''))} className="text-xs text-center h-[28px]" /></Field>
          <Field label="R"><Input value={props.paddingRight} onChange={e => handleChange('paddingRight', e.target.value.replace(/\D/g, ''))} className="text-xs text-center h-[28px]" /></Field>
          <Field label="B"><Input value={props.paddingBottom} onChange={e => handleChange('paddingBottom', e.target.value.replace(/\D/g, ''))} className="text-xs text-center h-[28px]" /></Field>
          <Field label="L"><Input value={props.paddingLeft} onChange={e => handleChange('paddingLeft', e.target.value.replace(/\D/g, ''))} className="text-xs text-center h-[28px]" /></Field>
        </div>
      </Section>

      {/* Border */}
      <Section label="Borda">
        <Row>
          <Field label="Largura" span={4}>
            <Input value={props.borderWidth} onChange={e => handleChange('borderWidth', e.target.value.replace(/\D/g, ''))} className="text-xs text-center h-[28px]" />
          </Field>
          <Field label="Cor" span={4}>
            <input type="color" value={props.borderColor} onChange={e => handleChange('borderColor', e.target.value)} className="w-full h-[28px] rounded-xs border border-subtle cursor-pointer" />
          </Field>
          <Field label="Radius" span={4}>
            <Input value={props.borderRadius} onChange={e => handleChange('borderRadius', e.target.value.replace(/\D/g, ''))} className="text-xs text-center h-[28px]" />
          </Field>
        </Row>
      </Section>

      {/* Rotation */}
      <Section label="Rotação">
        <Row>
          <Field label="Ângulo (°)" span={6}>
            <Input type="text" inputMode="numeric" value={props.rotate} onChange={e => handleChange('rotate', e.target.value.replace(/[^0-9-]/g, ''))} className="text-xs text-center h-[28px]" />
          </Field>
          <Field label="Presets" span={6}>
            <div className="flex gap-[2px]">
              {['0', '90', '180', '270'].map(deg => (
                <button key={deg} type="button" onClick={() => handleChange('rotate', deg)}
                  className={`flex-1 h-[28px] text-xxs border rounded-xs cursor-pointer transition-colors ${props.rotate === deg ? 'bg-primary-8 text-primary border-primary-20' : 'bg-transparent text-muted-foreground border-subtle'}`}>
                  {deg}°
                </button>
              ))}
            </div>
          </Field>
        </Row>
      </Section>
    </div>
  )
}

// Helper components
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-xxs text-muted-foreground uppercase font-semibold tracking-wider">{label}</span>
      {children}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-xs">{children}</div>
}

function Field({ label, span, children }: { label: string; span?: number; children: React.ReactNode }) {
  return (
    <div className={span ? `flex-[${span}]` : 'flex-1'} style={span ? { flex: span } : undefined}>
      <Label className="text-xxs text-fg-dim mb-[2px] block">{label}</Label>
      {children}
    </div>
  )
}

// Utilities
function rgbToHex(rgb: string): string {
  if (!rgb || rgb === 'transparent' || rgb.startsWith('#')) return rgb || '#000000'
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return '#000000'
  const r = parseInt(match[1]).toString(16).padStart(2, '0')
  const g = parseInt(match[2]).toString(16).padStart(2, '0')
  const b = parseInt(match[3]).toString(16).padStart(2, '0')
  return `#${r}${g}${b}`
}

function extractRotation(transform: string): string {
  if (!transform || transform === 'none') return '0'
  const match = transform.match(/rotate\(([^)]+)\)/)
  if (match) return String(parseFloat(match[1]))
  // Extract from matrix
  const matrixMatch = transform.match(/matrix\(([^)]+)\)/)
  if (matrixMatch) {
    const values = matrixMatch[1].split(',').map(Number)
    const angle = Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI))
    return String(angle)
  }
  return '0'
}

export { PropertiesPanel }
