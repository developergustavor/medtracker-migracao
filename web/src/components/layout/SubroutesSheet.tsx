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

  // Touch gesture: drag sheet, release to close or snap back
  const touchStartY = useRef(0)
  const touchMovedRef = useRef(false)
  const [dragY, setDragY] = useState(0)
  const [activeDrag, setActiveDrag] = useState(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    touchMovedRef.current = false
    setActiveDrag(true)
    setDragY(0)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!activeDrag) return
    touchMovedRef.current = true
    const deltaY = e.touches[0].clientY - touchStartY.current
    setDragY(deltaY > 0 ? deltaY : deltaY * 0.2)
  }, [activeDrag])

  const handleTouchEnd = useCallback(() => {
    if (!activeDrag) return
    setActiveDrag(false)
    if (!touchMovedRef.current) {
      // No movement — it was a click, not a drag. Reset and let onClick handle it.
      setDragY(0)
      return
    }
    if (dragY > 80) {
      setDragY(window.innerHeight)
      setTimeout(() => { handleClose(); setDragY(0) }, 200)
    } else {
      setDragY(0)
    }
  }, [activeDrag, dragY, handleClose])

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

      <div
        style={{ position: 'fixed', inset: 0, zIndex: 200, touchAction: 'none', overscrollBehavior: 'contain' }}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Backdrop */}
        <div
          onTouchStart={handleTouchStart}
          onClick={() => { if (!touchMovedRef.current) handleClose() }}
          style={{
            ...backdropStyle,
            opacity: dragY > 0 ? Math.max(0, 1 - dragY / 300) : undefined
          }}
        />

        {/* Sheet */}
        <div style={{
          ...sheetStyle,
          transform: `translateY(${Math.max(0, dragY)}px)`,
          transition: activeDrag ? 'none' : 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
          animation: dragY === 0 && !activeDrag ? sheetStyle.animation : 'none'
        }}>
          {/* Handle bar */}
          <div
            className="flex items-center justify-center shrink-0"
            style={{ padding: '10px 0 6px' }}
            onTouchStart={handleTouchStart}
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
            <span className="text-body text-foreground" style={{ fontWeight: 600 }}>
              {route.name}
            </span>
          </div>

          {/* Filter input */}
          {showFilter && (
            <div className="shrink-0" style={{ padding: '12px 16px 8px' }}>
              <div
                className="flex items-center gap-sm rounded-md border border-border"
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--muted-8)'
                }}
              >
                <SearchNormal1 size={16} color="var(--muted-foreground)" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Filtrar..."
                  value={filterText}
                  onChange={e => setFilterText(e.target.value)}
                  className="text-sm text-foreground"
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          {/* Subroute list */}
          <div data-scrollable style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 12px 24px', touchAction: 'pan-y' }}>
            {filteredChildren.map(child => {
              const isActive = location.pathname === child.path || location.pathname.startsWith(child.path + '/')

              return (
                <button
                  key={child.path}
                  onClick={() => handleItemClick(child.path)}
                  className="flex items-center gap-md w-full cursor-pointer rounded-sm text-sm"
                  style={{
                    padding: '10px 12px',
                    backgroundColor: isActive ? 'var(--primary-8)' : 'transparent',
                    border: 'none',
                    color: isActive ? 'var(--primary)' : 'var(--foreground)',
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
                className="flex items-center justify-center text-sm text-muted-foreground"
                style={{
                  padding: '20px 0'
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
