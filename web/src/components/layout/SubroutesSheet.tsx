// packages
import { useState, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { SearchNormal1 } from 'iconsax-react'

// components
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

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

export function SubroutesSheet({ route, onClose, onNavigate }: SubroutesSheetProps) {
  const location = useLocation()
  const [filterText, setFilterText] = useState('')

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

  const handleItemClick = useCallback(
    (path: string) => {
      setFilterText('')
      onNavigate(path)
    },
    [onNavigate]
  )

  return (
    <Sheet open={!!route} onOpenChange={val => { if (!val) handleClose() }}>
      <SheetContent side="bottom" className="max-h-[70vh] rounded-t-[16px]">
        <SheetHeader>
          <SheetTitle className="text-body text-foreground" style={{ fontWeight: 600 }}>
            {route?.name}
          </SheetTitle>
        </SheetHeader>

        {/* Filter input */}
        {showFilter && (
          <div className="shrink-0" style={{ padding: '4px 0 8px' }}>
            <div
              className="flex items-center gap-sm rounded-md border border-border"
              style={{
                padding: '8px 12px',
                backgroundColor: 'var(--muted-8)'
              }}
            >
              <SearchNormal1 size={16} color="var(--muted-foreground)" />
              <input
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
        <div className="flex flex-col gap-sm overflow-y-auto py-md" style={{ padding: '8px 0 24px' }}>
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
              style={{ padding: '20px 0' }}
            >
              Nenhum resultado encontrado
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
