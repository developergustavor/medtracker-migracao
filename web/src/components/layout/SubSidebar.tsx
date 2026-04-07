// packages
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CloseCircle, SearchNormal1 } from 'iconsax-react'

// utils
import { getRouteIcon } from '@/utils'

// types
import type { RouteMetadataProps } from '@/types'

const _loc = '@/components/layout/SubSidebar'

type SubSidebarProps = {
  route: RouteMetadataProps | null
  onClose: () => void
  onNavigate: (path: string) => void
  isOverlay: boolean
}

const FILTER_THRESHOLD = 5

export function SubSidebar({ route, onClose, onNavigate, isOverlay }: SubSidebarProps) {
  const location = useLocation()
  const [filter, setFilter] = useState('')

  // Reset filter when a different route is opened
  const [prevRoutePath, setPrevRoutePath] = useState<string | null>(null)
  if (route?.path !== prevRoutePath) {
    setPrevRoutePath(route?.path ?? null)
    if (filter !== '') setFilter('')
  }

  if (!route || !route.children || route.children.length === 0) return null

  const showFilter = route.children.length > FILTER_THRESHOLD

  const filteredChildren = filter
    ? route.children.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
    : route.children

  const handleNavigate = (path: string) => {
    onNavigate(path)
  }

  const panelWidth = isOverlay ? 220 : 200

  return (
    <>
      {/* Backdrop (overlay mode only) */}
      {isOverlay && (
        <div
          onClick={onClose}
          className="bg-black/[0.04] dark:bg-black/20 animate-fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 15
          }}
        />
      )}

      {/* SubSidebar panel */}
      <div
        key={route.path}
        className="animate-slide-in-left"
        style={{
          width: panelWidth,
          flexShrink: 0,
          ...(isOverlay
            ? {
                position: 'absolute',
                left: 248,
                top: 0,
                bottom: 0,
                zIndex: 20,
                boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
                backgroundColor: 'var(--popover)'
              }
            : {
                backgroundColor: 'var(--card)'
              }),
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0 px-md"
          style={{ height: 48, borderBottom: '1px solid var(--border)' }}
        >
          <span
            className="text-sm font-semibold truncate"
            style={{ color: 'var(--foreground)' }}
          >
            {route.name}
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center shrink-0 cursor-pointer"
            style={{
              width: 24,
              height: 24,
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--muted-foreground)',
              borderRadius: 'var(--radius-sm)',
              transition: 'background-color 150ms ease'
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
            }}

          >
            <CloseCircle size={16} color="currentColor" />
          </button>
        </div>

        {/* Filter input (conditional) */}
        {showFilter && (
          <div className="shrink-0 px-sm py-sm">
            <div
              className="flex items-center gap-xs px-sm"
              style={{
                height: 32,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--input)'
              }}
            >
              <SearchNormal1 size={14} color="currentColor" style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
              <input
                type="text"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Filtrar..."
                className="flex-1 min-w-0"
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--foreground)',
                  padding: 0
                }}
              />
            </div>
          </div>
        )}

        {/* Subroute list */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-sm py-xs" style={{ scrollbarWidth: 'thin' }}>
          {filteredChildren.length === 0 ? (
            <div
              className="flex items-center justify-center py-lg"
              style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}
            >
              Nenhum resultado
            </div>
          ) : (
            filteredChildren.map(child => {
              const isActive = location.pathname === child.path || location.pathname.startsWith(child.path + '/')

              return (
                <button
                  key={child.path}
                  onClick={() => handleNavigate(child.path)}
                  className="flex items-center gap-sm w-full cursor-pointer"
                  style={{
                    padding: '7px 10px',
                    marginBottom: 2,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'var(--primary-8)' : 'transparent',
                    border: 'none',
                    color: isActive ? 'var(--primary)' : 'var(--foreground)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: isActive ? 600 : 400,
                    textAlign: 'left',
                    transition: 'background-color 150ms ease',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)'
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                  }}
                >
                  {child.icon && (
                    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                      {getRouteIcon(child.icon, 16, isActive)}
                    </span>
                  )}
                  {child.name}
                </button>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
