// packages
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { SearchNormal1, Box1, ArrowRight2 } from 'iconsax-react'

// constants
import { ROUTES } from '@/constants'

// utils
import { getRouteIcon } from '@/utils'

// types
import type { RouteMetadataProps } from '@/types'

const _loc = '@/components/layout/SpotlightSearch'

type SpotlightSearchProps = {
  open: boolean
  onClose: () => void
}

type SearchResult = {
  category: 'Paginas' | 'Materiais'
  label: string
  sublabel?: string
  path?: string
  icon?: string
}

const MOCK_MATERIALS = [
  { name: 'PINCA BACKAUS', type: 'Avulso', qty: 17 },
  { name: 'CX VASCULAR N1', type: 'KIT', qty: 1, submaterials: 11 },
  { name: 'CX VASCULAR N2', type: 'KIT', qty: 1, submaterials: 8 },
  { name: 'CX CESAREA N1', type: 'KIT', qty: 1, submaterials: 5 },
  { name: 'CAPOTE', type: 'Quantidade', qty: 60 },
  { name: 'LAPA', type: 'Quantidade', qty: 48 },
  { name: 'CAMPO SIMPLES', type: 'Quantidade', qty: 77 },
  { name: 'INALATORIOS', type: 'Quantidade', qty: 400 },
  { name: 'CX VASCULAR N10', type: 'KIT', qty: 1, submaterials: 149 },
  { name: 'TESOURA BOYD CURVA', type: 'Avulso', qty: 1 },
]

function flattenRoutes(routes: RouteMetadataProps[], parentName?: string): SearchResult[] {
  const results: SearchResult[] = []
  for (const route of routes) {
    const sublabel = parentName ? `${parentName} > ${route.name}` : route.name
    results.push({
      category: 'Paginas',
      label: route.name,
      sublabel: parentName ? sublabel : undefined,
      path: route.path,
      icon: route.icon
    })
    if (route.children) {
      results.push(...flattenRoutes(route.children, route.name))
    }
  }
  return results
}

function buildMaterialResults(): SearchResult[] {
  return MOCK_MATERIALS.map(m => ({
    category: 'Materiais' as const,
    label: m.name,
    sublabel: `${m.type} - Qtd: ${m.qty}${m.submaterials ? ` (${m.submaterials} sub)` : ''}`,
    path: '/cadastros/materiais'
  }))
}

const ALL_PAGE_RESULTS = flattenRoutes(ROUTES)
const ALL_MATERIAL_RESULTS = buildMaterialResults()

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const idx = lowerText.indexOf(lowerQuery)
  if (idx === -1) return text

  const before = text.slice(0, idx)
  const match = text.slice(idx, idx + query.length)
  const after = text.slice(idx + query.length)

  return (
    <>
      {before}
      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{match}</span>
      {after}
    </>
  )
}

/** Wrapper that conditionally mounts the inner content so state resets on each open */
export function SpotlightSearch({ open, onClose }: SpotlightSearchProps) {
  if (!open) return null
  return <SpotlightSearchContent onClose={onClose} />
}

function SpotlightSearchContent({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 150)
    return () => clearTimeout(timer)
  }, [query])

  // Auto-focus input on mount
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [])

  // Filter results
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return []
    const q = debouncedQuery.toLowerCase().trim()

    const pages = ALL_PAGE_RESULTS.filter(r =>
      r.label.toLowerCase().includes(q) || (r.sublabel && r.sublabel.toLowerCase().includes(q))
    )
    const materials = ALL_MATERIAL_RESULTS.filter(r =>
      r.label.toLowerCase().includes(q)
    )

    return [...pages, ...materials]
  }, [debouncedQuery])

  // Scroll selected item into view
  useEffect(() => {
    if (!resultsRef.current) return
    const selected = resultsRef.current.querySelector(`[data-spotlight-index="${selectedIndex}"]`)
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const handleSelect = useCallback((result: SearchResult) => {
    const fullLoc = `${_loc}.handleSelect`
    if (result.path) {
      navigate(result.path)
      onClose()
    } else {
      console.log(`[${fullLoc}] Selected: ${result.label}`)
    }
  }, [navigate, onClose])

  // Handle query change — also reset selection
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    setSelectedIndex(0)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0))
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1))
        return
      }

      if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault()
        handleSelect(results[selectedIndex])
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [results, selectedIndex, handleSelect, onClose])

  const hasQuery = debouncedQuery.trim().length > 0
  const hasResults = results.length > 0

  // Group results by category for rendering
  const pageResults = results.filter(r => r.category === 'Paginas')
  const materialResults = results.filter(r => r.category === 'Materiais')

  return createPortal(
    <>
      <style>{`
        @keyframes spotlight-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spotlight-card-in {
          from { opacity: 0; transform: scale(0.96) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 300,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '15vh',
          overflowX: 'hidden'
        }}
      >
        {/* Backdrop */}
        <div
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'var(--spotlight-backdrop, rgba(0,0,0,0.15))',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            animation: 'spotlight-backdrop-in 150ms ease forwards'
          }}
        />

        {/* Card */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 520,
            margin: '0 16px',
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            boxShadow: 'var(--shadow-popover)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            overflowX: 'hidden',
            maxHeight: '60vh',
            animation: 'spotlight-card-in 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Input row */}
          <div
            className="flex items-center gap-sm"
            style={{
              padding: '12px 16px',
              borderBottom: hasQuery ? '1px solid var(--border-separator)' : 'none'
            }}
          >
            <SearchNormal1 size={18} color="currentColor" style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              placeholder="Buscar..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                color: 'var(--foreground)',
                fontSize: 15,
                fontFamily: 'inherit',
                minWidth: 0
              }}
            />
            <div
              style={{
                flexShrink: 0,
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--muted-8)',
                border: '1px solid var(--border)',
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--muted-foreground)',
                lineHeight: '16px'
              }}
            >
              ESC
            </div>
          </div>

          {/* Results area */}
          {hasQuery && (
            <div
              ref={resultsRef}
              style={{
                overflowY: 'auto',
                overflowX: 'hidden',
                maxHeight: 'calc(60vh - 50px)',
                padding: '4px 6px 6px'
              }}
            >
              {!hasResults && (
                <div
                  className="flex items-center justify-center"
                  style={{
                    padding: '24px 16px',
                    color: 'var(--muted-foreground)',
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  Nenhum resultado para &apos;{debouncedQuery}&apos;
                </div>
              )}

              {pageResults.length > 0 && (
                <>
                  <div
                    style={{
                      padding: '8px 10px 4px',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--muted-foreground)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Paginas
                  </div>
                  {pageResults.map((result, i) => {
                    const flatIndex = results.indexOf(result)
                    const isSelected = flatIndex === selectedIndex
                    return (
                      <button
                        key={`page-${i}`}
                        data-spotlight-index={flatIndex}
                        onClick={() => handleSelect(result)}
                        className="flex items-center gap-sm w-full cursor-pointer"
                        style={{
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected ? 'var(--primary-8)' : 'transparent',
                          border: 'none',
                          color: 'var(--foreground)',
                          fontSize: 'var(--text-sm)',
                          textAlign: 'left',
                          transition: 'background-color 100ms ease',
                          marginBottom: 1
                        }}
                        onMouseEnter={() => setSelectedIndex(flatIndex)}
                      >
                        <span style={{ flexShrink: 0, color: 'var(--muted-foreground)' }}>
                          {result.icon ? getRouteIcon(result.icon, 18, false) : <ArrowRight2 size={18} color="currentColor" />}
                        </span>
                        <div className="flex flex-col min-w-0" style={{ flex: 1 }}>
                          <span className="truncate">{highlightMatch(result.label, debouncedQuery)}</span>
                          {result.sublabel && (
                            <span className="truncate" style={{ fontSize: 'var(--text-xxs)', color: 'var(--muted-foreground)' }}>
                              {result.sublabel}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </>
              )}

              {materialResults.length > 0 && (
                <>
                  <div
                    style={{
                      padding: '8px 10px 4px',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--muted-foreground)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginTop: pageResults.length > 0 ? 4 : 0
                    }}
                  >
                    Materiais
                  </div>
                  {materialResults.map((result, i) => {
                    const flatIndex = results.indexOf(result)
                    const isSelected = flatIndex === selectedIndex
                    return (
                      <button
                        key={`mat-${i}`}
                        data-spotlight-index={flatIndex}
                        onClick={() => handleSelect(result)}
                        className="flex items-center gap-sm w-full cursor-pointer"
                        style={{
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected ? 'var(--primary-8)' : 'transparent',
                          border: 'none',
                          color: 'var(--foreground)',
                          fontSize: 'var(--text-sm)',
                          textAlign: 'left',
                          transition: 'background-color 100ms ease',
                          marginBottom: 1
                        }}
                        onMouseEnter={() => setSelectedIndex(flatIndex)}
                      >
                        <span style={{ flexShrink: 0, color: 'var(--muted-foreground)' }}>
                          <Box1 size={18} variant="Linear" color="currentColor" />
                        </span>
                        <div className="flex flex-col min-w-0" style={{ flex: 1 }}>
                          <span className="truncate">{highlightMatch(result.label, debouncedQuery)}</span>
                          {result.sublabel && (
                            <span className="truncate" style={{ fontSize: 'var(--text-xxs)', color: 'var(--muted-foreground)' }}>
                              {result.sublabel}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </>
              )}
            </div>
          )}

          {/* Empty state when no query */}
          {!hasQuery && (
            <div
              className="flex items-center justify-center"
              style={{
                padding: '20px 16px',
                color: 'var(--muted-foreground)',
                fontSize: 'var(--text-sm)'
              }}
            >
              Busque por materiais, paginas, acoes...
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}
