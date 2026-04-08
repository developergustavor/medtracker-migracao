// packages
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUp2, ArrowDown2, ArrowSwapVertical, DocumentText, Filter as FilterIcon } from 'iconsax-react'

// hooks
import { useIsMobile } from '@/hooks'

// libs
import { cn } from '@/libs/shadcn.utils'

// components
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchInput } from '@/components/domain/SearchInput'

const _loc = '@/components/domain/DataTable'

// types
type ColumnDef<T> = {
  key: string
  header: string
  accessorFn?: (row: T) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  filterType?: 'text' | 'select' | 'number' | 'date'
  filterOptions?: string[]
  width?: string | number
  align?: 'left' | 'center' | 'right'
}

type DataTableProps<T> = {
  columns: ColumnDef<T>[]
  data: T[]
  loading?: boolean
  keyExtractor: (row: T) => string | number
  searchable?: boolean
  searchPlaceholder?: string
  selectable?: boolean
  onSelectionChange?: (selectedKeys: (string | number)[]) => void
  pagination?: boolean
  pageSize?: number
  autoFitRows?: boolean
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  onRowClick?: (row: T) => void
  actions?: (row: T) => React.ReactNode
  headerActions?: React.ReactNode
  className?: string
}

type SortDirection = 'asc' | 'desc' | null

type TooltipCellState = {
  key: string
  rowKey: string | number
  content: string
  rect: DOMRect
} | null

type ActiveFilterState = {
  colKey: string
  header: string
} | null

function DataTable<T>({
  columns,
  data,
  loading = false,
  keyExtractor,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  selectable = false,
  onSelectionChange,
  pagination = true,
  pageSize: initialPageSize = 10,
  autoFitRows = false,
  emptyMessage = 'Nenhum registro encontrado.',
  emptyIcon,
  onRowClick,
  actions,
  headerActions,
  className
}: DataTableProps<T>) {
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSizeOverride, setPageSizeOverride] = useState<number | null>(null)

  // -- Auto fit rows
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLTableSectionElement>(null)
  const paginationRef = useRef<HTMLDivElement>(null)
  const [autoPageSize, setAutoPageSize] = useState<number | null>(null)
  const lastContainerHeight = useRef(0)

  useEffect(() => {
    if (!autoFitRows) return
    const container = containerRef.current
    if (!container) return

    const calculate = () => {
      const totalH = container.clientHeight
      if (totalH < 100) return // not mounted yet

      // Only recalculate if container height changed significantly (layout/resize change, not content)
      if (Math.abs(totalH - lastContainerHeight.current) < 10 && lastContainerHeight.current > 0) return
      lastContainerHeight.current = totalH

      const headerH = 43
      const paginationH = 44
      const rowH = 53
      const available = totalH - headerH - paginationH
      const rows = Math.max(3, Math.floor(available / rowH))
      setAutoPageSize(rows)
    }

    // Initial calculation with double rAF
    const frame = requestAnimationFrame(() => requestAnimationFrame(calculate))

    // Recalculate on container resize (viewport/layout changes)
    const observer = new ResizeObserver(calculate)
    observer.observe(container)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [autoFitRows])

  const effectivePageSize = autoFitRows && autoPageSize ? autoPageSize : (pageSizeOverride ?? initialPageSize)

  // -- Column resize
  const [colWidths, setColWidths] = useState<Record<string, number>>({})
  const resizingCol = useRef<{ key: string; startX: number; startWidth: number } | null>(null)
  const didResizeRef = useRef(false)

  // -- Column filters (per-column dialog approach)
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
  const [activeFilter, setActiveFilter] = useState<ActiveFilterState>(null)
  const [filterInputValue, setFilterInputValue] = useState('')

  // -- Cell tooltip
  const [tooltipCell, setTooltipCell] = useState<TooltipCellState>(null)

  // -- Drag scroll (document-level for reliability)
  const scrollWrapperRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStateRef = useRef({ active: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0, moved: false })

  // Find the actual scrollable element (shadcn Table wraps in a div.overflow-auto)
  useEffect(() => {
    if (!scrollWrapperRef.current) return
    const scrollEl = scrollWrapperRef.current.querySelector('.overflow-auto') || scrollWrapperRef.current
    scrollRef.current = scrollEl as HTMLElement
  }, [columns, data])

  const handleScrollMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button, input, a, [role="checkbox"], [data-resize-handle]')) return
    const el = scrollRef.current
    if (!el) return
    if (el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight) return

    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
      moved: false
    }
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const state = dragStateRef.current
      if (!state.active) return
      const dx = e.clientX - state.startX
      const dy = e.clientY - state.startY
      if (!state.moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        state.moved = true
        setIsDragging(true)
      }
      if (!state.moved) return
      const el = scrollRef.current
      if (!el) return
      el.scrollLeft = state.scrollLeft - dx
      el.scrollTop = state.scrollTop - dy
    }
    const onMouseUp = () => {
      if (dragStateRef.current.active) {
        dragStateRef.current.active = false
        dragStateRef.current.moved = false
        setIsDragging(false)
      }
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  // -- Close tooltip on outside click
  useEffect(() => {
    if (!tooltipCell) return
    const handleClick = () => setTooltipCell(null)
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClick) }
  }, [tooltipCell])

  // -- Search filter
  const searchFilteredData = useMemo(() => {
    if (!search.trim()) return data
    const term = search.toLowerCase()
    return data.filter(row => {
      const record = row as Record<string, unknown>
      return Object.values(record).some(val => {
        if (typeof val === 'string') return val.toLowerCase().includes(term)
        if (typeof val === 'number') return String(val).includes(term)
        return false
      })
    })
  }, [data, search])

  // -- Column filter
  const filteredData = useMemo(() => {
    const activeFilters = Object.entries(columnFilters).filter(([, v]) => v.trim() !== '')
    if (activeFilters.length === 0) return searchFilteredData
    return searchFilteredData.filter(row => {
      const record = row as Record<string, unknown>
      return activeFilters.every(([colKey, filterVal]) => {
        const cellVal = record[colKey]
        const term = filterVal.toLowerCase()
        if (typeof cellVal === 'string') return cellVal.toLowerCase().includes(term)
        if (typeof cellVal === 'number') return String(cellVal).includes(term)
        return false
      })
    })
  }, [searchFilteredData, columnFilters])

  // -- Sorting
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData
    return [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey]
      const bVal = (b as Record<string, unknown>)[sortKey]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      return 0
    })
  }, [filteredData, sortKey, sortDirection])

  // -- Pagination
  const totalItems = sortedData.length
  const totalPages = pagination ? Math.max(1, Math.ceil(totalItems / effectivePageSize)) : 1
  const paginatedData = pagination ? sortedData.slice((currentPage - 1) * effectivePageSize, currentPage * effectivePageSize) : sortedData
  const showingFrom = totalItems === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1
  const showingTo = Math.min(currentPage * effectivePageSize, totalItems)

  // -- Page size options (include current pageSize if not in defaults)
  const pageSizeOptions = useMemo(() => {
    const defaults = [5, 7, 8, 10, 14, 25, 50]
    if (!defaults.includes(effectivePageSize)) defaults.push(effectivePageSize)
    return defaults.sort((a, b) => a - b)
  }, [effectivePageSize])

  // -- Sort handler
  const handleSort = useCallback((key: string) => {
    if (didResizeRef.current) return
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc')
      else if (sortDirection === 'desc') {
        setSortKey(null)
        setSortDirection(null)
      }
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }, [sortKey, sortDirection])

  // -- Selection handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allKeys = new Set(paginatedData.map(keyExtractor))
      setSelectedKeys(allKeys)
      onSelectionChange?.(Array.from(allKeys))
    } else {
      setSelectedKeys(new Set())
      onSelectionChange?.([])
    }
  }, [paginatedData, keyExtractor, onSelectionChange])

  const handleSelectRow = useCallback((key: string | number, checked: boolean) => {
    setSelectedKeys(prev => {
      const next = new Set(prev)
      if (checked) next.add(key)
      else next.delete(key)
      onSelectionChange?.(Array.from(next))
      return next
    })
  }, [onSelectionChange])

  const allSelected = paginatedData.length > 0 && paginatedData.every(row => selectedKeys.has(keyExtractor(row)))
  const someSelected = paginatedData.some(row => selectedKeys.has(keyExtractor(row))) && !allSelected

  // -- Search change resets page
  const handleSearchChange = useCallback((val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }, [])

  // -- Page size change
  const handlePageSizeChange = useCallback((val: string) => {
    setPageSizeOverride(Number(val))
    setCurrentPage(1)
  }, [])

  // -- Page navigation helpers
  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)
    start = Math.max(1, end - maxVisible + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }, [currentPage, totalPages])

  // -- Render sort icon
  const renderSortIcon = (key: string) => {
    if (sortKey !== key || !sortDirection) {
      return <ArrowSwapVertical size={14} color="var(--fg-dim)" />
    }
    if (sortDirection === 'asc') return <ArrowUp2 size={14} color="var(--primary)" />
    return <ArrowDown2 size={14} color="var(--primary)" />
  }

  // -- Cell click handler for tooltip (FIX 6: toggle behavior)
  const handleCellClick = (e: React.MouseEvent<HTMLTableCellElement>, colKey: string, rowKey: string | number) => {
    const cellEl = e.currentTarget
    const textEl = cellEl.querySelector('[data-cell-text]') as HTMLElement | null
    if (!textEl) return
    const content = textEl.textContent || ''
    if (!content.trim()) return
    // Only show tooltip if text is actually truncated
    if (textEl.scrollWidth <= textEl.clientWidth) return
    e.stopPropagation()
    const rect = cellEl.getBoundingClientRect()
    // Toggle: if same cell is clicked, close it
    setTooltipCell(prev => {
      if (prev && prev.key === colKey && prev.rowKey === rowKey) return null
      return { key: colKey, rowKey, content, rect }
    })
  }

  // -- Filter dialog handlers
  const handleOpenFilter = (colKey: string, header: string) => {
    setActiveFilter({ colKey, header })
    setFilterInputValue(columnFilters[colKey] || '')
  }

  const handleApplyFilter = () => {
    if (!activeFilter) return
    setColumnFilters(prev => ({ ...prev, [activeFilter.colKey]: filterInputValue }))
    setCurrentPage(1)
    setActiveFilter(null)
  }

  const handleClearFilter = () => {
    if (!activeFilter) return
    setColumnFilters(prev => {
      const next = { ...prev }
      delete next[activeFilter.colKey]
      return next
    })
    setCurrentPage(1)
    setActiveFilter(null)
  }

  // -- Total visible columns count (for skeleton)
  const totalColCount = (selectable ? 1 : 0) + columns.length + (actions ? 1 : 0)

  // -- Sticky actions styles
  const actionsHeaderStyle: React.CSSProperties = {
    width: 100,
    minWidth: 100,
    padding: 'var(--space-md) var(--space-lg)',
    color: 'var(--fg-muted)',
    fontSize: 'var(--text-caption)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'right',
    position: 'sticky',
    right: 0,
    zIndex: 3,
    backgroundColor: 'var(--overlay-3)'
  }

  const actionsCellStyle: React.CSSProperties = {
    padding: 'var(--space-md) var(--space-lg)',
    textAlign: 'right',
    position: 'sticky',
    right: 0,
    zIndex: 2,
    backgroundColor: 'var(--card)',
    width: 100,
    minWidth: 100,
    boxShadow: '-4px 0 8px rgba(0,0,0,0.04)'
  }

  return (
    <div ref={containerRef} className="flex flex-col w-full h-full min-h-0">
      {/* Header bar: search + actions */}
      {(searchable || headerActions) && (
        <div className="flex items-center justify-between gap-3 flex-wrap shrink-0 p-3">
          {searchable && (
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="w-full max-w-xs"
            />
          )}
          {!searchable && <div />}
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}

      {/* Table scroll container */}
      <div
        ref={scrollWrapperRef}
        className="flex-1 min-h-0 w-full"
        style={{
          cursor: isDragging ? 'grabbing' : 'default',
          userSelect: isDragging ? 'none' : 'auto'
        }}
        onMouseDown={handleScrollMouseDown}
      >
        <Table className='h-full' parentClassName='h-full'>
          <TableHeader ref={headerRef}>
            <TableRow
              className="border-b-0 hover:bg-transparent"
              style={{ backgroundColor: 'var(--overlay-3)', position: 'sticky', top: 0, zIndex: 2 }}
            >
              {selectable && (
                <TableHead
                  style={{ width: 44, padding: 'var(--space-md) var(--space-lg)' }}
                >
                  <Checkbox
                    checked={allSelected}
                    {...(someSelected ? { 'data-state': 'indeterminate' } : {})}
                    onCheckedChange={checked => handleSelectAll(!!checked)}
                  />
                </TableHead>
              )}
              {columns.map(col => {
                const isActions = col.key === 'actions'
                const hasActiveFilter = !!columnFilters[col.key]?.trim()
                return (
                  <TableHead
                    key={col.key}
                    className={cn(
                      col.sortable && !isActions && 'cursor-pointer select-none'
                    )}
                    style={{
                      width: isActions ? 100 : (colWidths[col.key] || col.width || 'auto'),
                      minWidth: isActions ? 100 : undefined,
                      padding: 'var(--space-md) var(--space-lg)',
                      color: 'var(--fg-muted)',
                      fontSize: 'var(--text-caption)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textAlign: col.align || 'left',
                      position: isActions ? 'sticky' : 'relative',
                      right: isActions ? 0 : undefined,
                      zIndex: isActions ? 3 : undefined,
                      backgroundColor: isActions ? 'var(--overlay-3)' : undefined,
                      borderRight: !isActions ? '1px solid var(--border-subtle)' : undefined,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    onClick={col.sortable && !isActions ? () => handleSort(col.key) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && !isActions && renderSortIcon(col.key)}
                      {col.filterable && !isActions && (
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); handleOpenFilter(col.key, col.header) }}
                          className="inline-flex items-center justify-center shrink-0 cursor-pointer border-none outline-none bg-transparent relative"
                          style={{ width: 18, height: 18, borderRadius: 'var(--radius-xs)', padding: 0 }}
                        >
                          <FilterIcon size={12} color={hasActiveFilter ? 'var(--primary)' : 'var(--fg-dim)'} variant="Linear" />
                          {hasActiveFilter && (
                            <span
                              style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: 'var(--primary)'
                              }}
                            />
                          )}
                        </button>
                      )}
                    </span>
                    {/* Resize handle — not for actions column */}
                    {!isActions && (
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: 6,
                          cursor: 'col-resize',
                          userSelect: 'none'
                        }}
                        onMouseDown={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          const th = e.currentTarget.parentElement
                          if (!th) return
                          didResizeRef.current = false
                          resizingCol.current = { key: col.key, startX: e.clientX, startWidth: th.getBoundingClientRect().width }

                          const onMouseMove = (ev: MouseEvent) => {
                            if (!resizingCol.current) return
                            const diff = ev.clientX - resizingCol.current.startX
                            if (Math.abs(diff) > 3) didResizeRef.current = true
                            const newWidth = Math.max(50, resizingCol.current.startWidth + diff)
                            setColWidths(prev => ({ ...prev, [resizingCol.current!.key]: newWidth }))
                          }
                          const onMouseUp = () => {
                            resizingCol.current = null
                            document.removeEventListener('mousemove', onMouseMove)
                            document.removeEventListener('mouseup', onMouseUp)
                            setTimeout(() => { didResizeRef.current = false }, 50)
                          }
                          document.addEventListener('mousemove', onMouseMove)
                          document.addEventListener('mouseup', onMouseUp)
                        }}
                      />
                    )}
                  </TableHead>
                )
              })}
              {actions && (
                <TableHead style={actionsHeaderStyle}>
                  {/* actions column header intentionally empty */}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Loading state (FIX 10: height matches data rows) */}
            {loading &&
              Array.from({ length: effectivePageSize }).map((_, rowIdx) => (
                <TableRow key={`skeleton-${rowIdx}`} className="hover:bg-transparent" style={{ borderBottom: '1px solid var(--border-separator)', height: 53 }}>
                  {selectable && (
                    <TableCell style={{ padding: 'var(--space-md) var(--space-lg)', width: 44 }}>
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                  )}
                  {columns.map((col, colIdx) => (
                    <TableCell key={`skeleton-${rowIdx}-${colIdx}`} style={{ padding: 'var(--space-md) var(--space-lg)', height: 53 }}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell style={{ ...actionsCellStyle, height: 44 }}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            }

            {/* Empty state (FIX 11: dashed border, tab icon, full height) */}
            {!loading && paginatedData.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={totalColCount}
                  style={{ padding: 0 }}
                >
                  <div
                    className="flex flex-col items-center justify-center gap-2"
                    style={{
                      height: autoFitRows ? autoPageSize * 53 : 200,
                      minHeight: 200,
                      color: 'var(--fg-muted)',
                      border: '2px dashed var(--border)',
                      borderRadius: 'var(--radius-md)',
                      margin: 'var(--space-md)'
                    }}
                  >
                    {emptyIcon || <DocumentText size={40} color="var(--fg-dim)" variant="Linear" />}
                    <span style={{ fontSize: 'var(--text-body)' }}>{emptyMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {!loading &&
              paginatedData.map(row => {
                const key = keyExtractor(row)
                const isSelected = selectedKeys.has(key)
                return (
                  <TableRow
                    key={key}
                    data-state={isSelected ? 'selected' : undefined}
                    className={cn(onRowClick && 'cursor-pointer')}
                    style={{
                      borderBottom: '1px solid var(--border-separator)',
                      transition: 'background-color 150ms var(--ease-out)',
                      height: 44
                    }}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable && (
                      <TableCell style={{ width: 44, padding: 'var(--space-md) var(--space-lg)' }}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={checked => handleSelectRow(key, !!checked)}
                          onClick={e => e.stopPropagation()}
                        />
                      </TableCell>
                    )}
                    {columns.map(col => {
                      const isActions = col.key === 'actions'
                      const cellContent = col.accessorFn ? col.accessorFn(row) : String((row as Record<string, unknown>)[col.key] ?? '')
                      if (isActions) {
                        return (
                          <TableCell
                            key={col.key}
                            style={actionsCellStyle}
                            onClick={e => e.stopPropagation()}
                          >
                            {cellContent}
                          </TableCell>
                        )
                      }
                      return (
                        <TableCell
                          key={col.key}
                          style={{
                            padding: 'var(--space-md) var(--space-lg)',
                            fontSize: 'var(--text-body)',
                            color: 'var(--fg)',
                            textAlign: col.align || 'left',
                            maxWidth: 0,
                            cursor: 'pointer'
                          }}
                          onClick={e => handleCellClick(e, col.key, key)}
                        >
                          <div
                            data-cell-text
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {cellContent}
                          </div>
                        </TableCell>
                      )
                    })}
                    {actions && (
                      <TableCell
                        style={actionsCellStyle}
                        onClick={e => e.stopPropagation()}
                      >
                        {actions(row)}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            }

            {/* Fill empty rows to maintain consistent height */}
            {!loading && paginatedData.length < effectivePageSize && paginatedData.length > 0 && (
              Array.from({ length: effectivePageSize - paginatedData.length }).map((_, idx) => (
                <TableRow key={`empty-${idx}`} className="hover:bg-transparent" style={{ height: 53, borderBottom: '1px solid var(--border-separator)' }}>
                  {selectable && (
                    <TableCell key={`empty-${idx}-checkbox`} style={{ padding: 'var(--space-md) var(--space-lg)', width: 44 }}>&nbsp;</TableCell>
                  )}
                  {columns.map(col => (
                    <TableCell key={`empty-${idx}-${col.key}`} style={{ padding: 'var(--space-md) var(--space-lg)' }}>&nbsp;</TableCell>
                  ))}
                  {actions && (
                    <TableCell key={`empty-${idx}-actions`} style={{ ...actionsCellStyle }}>&nbsp;</TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cell tooltip portal (FIX 6: toggle + click-on-tooltip closes) */}
      {tooltipCell && createPortal(
        <div
          onMouseDown={e => {
            e.stopPropagation()
            setTooltipCell(null)
          }}
          style={{
            position: 'fixed',
            top: tooltipCell.rect.bottom + 4,
            left: tooltipCell.rect.left,
            zIndex: 9999,
            maxWidth: 360,
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--popover)',
            border: '1px solid var(--popover-border)',
            boxShadow: 'var(--shadow-popover)',
            backdropFilter: 'blur(8px)',
            color: 'var(--foreground)',
            fontSize: 'var(--text-xs)',
            lineHeight: 1.5,
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            cursor: 'pointer'
          }}
        >
          {tooltipCell.content}
        </div>,
        document.body
      )}

      {/* Column filter dialog portal (FIX 4) */}
      {activeFilter && createPortal(
        <>
          <div
            onClick={() => setActiveFilter(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              backgroundColor: 'rgba(0,0,0,0.1)',
              backdropFilter: 'blur(2px)'
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 101,
              width: 280,
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-popover)',
              padding: 'var(--space-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-md)'
            }}
          >
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--foreground)' }}>
              Filtrar: {activeFilter.header}
            </span>
            <input
              value={filterInputValue}
              onChange={e => setFilterInputValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleApplyFilter() }}
              placeholder="Digite para filtrar..."
              autoFocus
              style={{
                width: '100%',
                height: 36,
                fontSize: 'var(--text-sm)',
                padding: '0 var(--space-md)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--input-border)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--foreground)',
                outline: 'none'
              }}
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={handleClearFilter}
                className="cursor-pointer border-none outline-none"
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--elevated)',
                  color: 'var(--foreground)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500
                }}
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={handleApplyFilter}
                className="cursor-pointer border-none outline-none"
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-fg)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500
                }}
              >
                Aplicar
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Pagination skeleton during loading */}
      {pagination && loading && (
        <div ref={paginationRef} className="flex items-center justify-between shrink-0 gap-2" style={{ padding: 'var(--space-sm) var(--space-lg)', borderTop: '1px solid var(--border-separator)', height: 44 }}>
          <Skeleton className="h-3 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-7 w-7" />
            <Skeleton className="h-7 w-7" />
            <Skeleton className="h-7 w-7" />
          </div>
        </div>
      )}
      {/* Spacer for no-data state to keep height stable */}
      {pagination && !loading && totalItems === 0 && (
        <div ref={paginationRef} className="shrink-0" style={{ height: 44, borderTop: '1px solid var(--border-separator)' }} />
      )}
      {pagination && !loading && totalItems > 0 && (
        <div ref={paginationRef} className="flex items-center justify-between flex-wrap gap-2 shrink-0" style={{ padding: 'var(--space-sm) var(--space-lg)', borderTop: '1px solid var(--border-separator)' }}>
          <span
            style={{
              fontSize: isMobile ? 'var(--text-xs)' : 'var(--text-caption)',
              color: 'var(--fg-muted)'
            }}
          >
            Mostrando {showingFrom}-{showingTo} de {totalItems}
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Page size selector */}
            {!autoFitRows && (
              <Select value={String(effectivePageSize)} onValueChange={handlePageSizeChange}>
                <SelectTrigger
                  className="w-auto gap-1"
                  style={{
                    height: isMobile ? 28 : 34,
                    fontSize: isMobile ? 'var(--text-xs)' : 'var(--text-caption)',
                    borderRadius: 'var(--radius-sm)',
                    borderColor: 'var(--border-subtle)',
                    backgroundColor: 'var(--secondary)',
                    padding: '0 var(--space-md)'
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map(size => (
                    <SelectItem key={size} value={String(size)}>
                      {size} / pág.
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Page buttons */}
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="inline-flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                style={{
                  width: isMobile ? 28 : 34,
                  height: isMobile ? 28 : 34,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--secondary)',
                  fontSize: isMobile ? 'var(--text-xs)' : 'var(--text-caption)',
                  color: 'var(--fg-secondary)'
                }}
              >
                &lt;
              </button>
              {pageNumbers.map(page => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className="inline-flex items-center justify-center transition-colors"
                  style={{
                    width: isMobile ? 28 : 34,
                    height: isMobile ? 28 : 34,
                    borderRadius: 'var(--radius-sm)',
                    border: page === currentPage ? 'none' : '1px solid var(--border-subtle)',
                    backgroundColor: page === currentPage ? 'var(--primary)' : 'var(--secondary)',
                    color: page === currentPage ? 'var(--primary-fg)' : 'var(--fg-secondary)',
                    fontWeight: page === currentPage ? 700 : 400,
                    fontSize: isMobile ? 'var(--text-xs)' : 'var(--text-caption)'
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="inline-flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                style={{
                  width: isMobile ? 28 : 34,
                  height: isMobile ? 28 : 34,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--secondary)',
                  fontSize: isMobile ? 'var(--text-xs)' : 'var(--text-caption)',
                  color: 'var(--fg-secondary)'
                }}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { DataTable }
export type { DataTableProps, ColumnDef }
