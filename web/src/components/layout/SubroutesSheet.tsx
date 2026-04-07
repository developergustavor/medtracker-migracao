// packages
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { SearchNormal1 } from 'iconsax-react'

// utils
import { getRouteIcon } from '@/utils'

// types
import type { RouteMetadataProps } from '@/types'

const _loc = '@/components/layout/SubroutesSheet'

type SubroutesSheetProps = {
  route: RouteMetadataProps | null
  onClose: () => void
  onNavigate: (path: string) => void
}

const backdropStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  animation: 'subroutes-sheet-backdrop-in 200ms ease forwards'
}

const sheetStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  maxHeight: '70vh',
  backgroundColor: 'var(--card)',
  borderTopLeftRadius: 'var(--radius-xl)',
  borderTopRightRadius: 'var(--radius-xl)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  overflowX: 'hidden',
  animation: 'subroutes-sheet-slide-in 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards'
}

export function SubroutesSheet({ route, onClose, onNavigate }: SubroutesSheetProps) {
  const location = useLocation()
  const [filterText, setFilterText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const children = useMemo(() => route?.children || [], [route])
  const showFilter = children.length > 5

  const filteredChildren = useMemo(() => {
    if (!filterText.trim()) return children
    const lower = filterText.toLowerCase()
    return children.filter(c => c.name.toLowerCase().includes(lower))
  }, [children, filterText])

  const handleClose = useCallback(() => {
    setFilterText('')
    onClose()
  }, [onClose])

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (route) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [route])

  // Touch gesture: swipe down or swipe right to close
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current
    if (deltaY > 80) { handleClose(); return }
    if (deltaX > 80 && Math.abs(deltaY) < 40) handleClose()
  }, [handleClose])

  const handleItemClick = useCallback(
    (path: string) => {
      setFilterText('')
      onNavigate(path)
    },
    [onNavigate]
  )

  if (!route) return null

  return createPortal(
    <>
      {/* Keyframe styles */}
      <style>{`
        @keyframes subroutes-sheet-slide-in {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes subroutes-sheet-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, zIndex: 200, touchAction: 'none', overscrollBehavior: 'contain' }}>
        {/* Backdrop */}
        <div onClick={handleClose} style={backdropStyle} />

        {/* Sheet */}
        <div style={sheetStyle}>
          {/* Handle bar */}
          <div
            className="flex items-center justify-center shrink-0"
            style={{ padding: '10px 0 6px' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'var(--muted-foreground)',
                opacity: 0.3
              }}
            />
          </div>

          {/* Title */}
          <div
            className="shrink-0"
            style={{
              padding: '0 16px 10px',
              borderBottom: '1px solid var(--border-separator)'
            }}
          >
            <span style={{ fontSize: 'var(--text-body)', fontWeight: 600, color: 'var(--foreground)' }}>
              {route.name}
            </span>
          </div>

          {/* Filter input */}
          {showFilter && (
            <div className="shrink-0" style={{ padding: '12px 16px 8px' }}>
              <div
                className="flex items-center gap-sm"
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--muted-8)',
                  border: '1px solid var(--border)'
                }}
              >
                <SearchNormal1 size={16} color="var(--muted-foreground)" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Filtrar..."
                  value={filterText}
                  onChange={e => setFilterText(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>
            </div>
          )}

          {/* Subroute list */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 12px 24px', touchAction: 'pan-y' }}>
            {filteredChildren.map(child => {
              const isActive = location.pathname === child.path || location.pathname.startsWith(child.path + '/')

              return (
                <button
                  key={child.path}
                  onClick={() => handleItemClick(child.path)}
                  className="flex items-center gap-md w-full cursor-pointer"
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'var(--primary-8)' : 'transparent',
                    border: 'none',
                    color: isActive ? 'var(--primary)' : 'var(--foreground)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: isActive ? 600 : 400,
                    textAlign: 'left',
                    transition: 'background-color 150ms ease',
                    marginBottom: 2
                  }}
                >
                  {child.icon && getRouteIcon(child.icon, 18, isActive)}
                  <span>{child.name}</span>
                </button>
              )
            })}

            {filteredChildren.length === 0 && filterText.trim() && (
              <div
                className="flex items-center justify-center"
                style={{
                  padding: '20px 0',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-foreground)'
                }}
              >
                Nenhum resultado encontrado
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
