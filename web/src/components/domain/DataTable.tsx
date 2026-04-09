// packages
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUp2, ArrowDown2, ArrowSwapVertical, DocumentText, Filter as FilterIcon, Add } from 'iconsax-react'

// hooks
import { useIsMobile } from '@/hooks'

// libs
import { cn } from '@/libs/shadcn.utils'

// components
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
  onEmptyAction?: () => void
  emptyActionLabel?: string
  onRowClick?: (row: T) => void
  actions?: (row: T) => React.ReactNode
  headerActions?: React.ReactNode
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
  onEmptyAction,
  emptyActionLabel = 'Novo Registro',
  onRowClick,
  actions,
  headerActions,
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

  // -- Smart page numbers: [1, '...', 5, 6, 7, '...', 100]
  const pageSlots = useMemo((): (number | 'ellipsis-start' | 'ellipsis-end')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const slots: (number | 'ellipsis-start' | 'ellipsis-end')[] = []
    slots.push(1)
    if (currentPage > 3) slots.push('ellipsis-start')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) slots.push(i)
    if (currentPage < totalPages - 2) slots.push('ellipsis-end')
    if (totalPages > 1) slots.push(totalPages)
    return slots
  }, [currentPage, totalPages])

  const [ellipsisPopoverOpen, setEllipsisPopoverOpen] = useState<'start' | 'end' | null>(null)
  const [ellipsisSearch, setEllipsisSearch] = useState('')

  const ellipsisFilteredPages = useMemo(() => {
    const all = Array.from({ length: totalPages }, (_, i) => i + 1)
    if (!ellipsisSearch) return all
    return all.filter(p => String(p).includes(ellipsisSearch))
  }, [totalPages, ellipsisSearch])

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
                          className="inline-flex items-center justify-center shrink-0 cursor-pointer border-none outline-none bg-transparent relative rounded-xs p-0"
                          style={{ width: 18, height: 18 }}
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
                    className="flex flex-col items-center justify-center gap-2 rounded-md m-md"
                    style={{
                      height: autoFitRows && autoPageSize ? autoPageSize * 53 : 200,
                      minHeight: 200,
                      color: 'var(--fg-muted)',
                      border: '2px dashed var(--border)'
                    }}
                  >
                    {emptyIcon || <DocumentText size={40} color="var(--fg-dim)" variant="Linear" />}
                    <span style={{ fontSize: 'var(--text-body)' }}>{emptyMessage}</span>
                    {onEmptyAction && (
                      <button
                        type="button"
                        onClick={onEmptyAction}
                        className="flex items-center gap-[6px] rounded-sm text-caption font-semibold text-primary-foreground cursor-pointer border-none gradient-primary hover-opacity transition-opacity duration-150"
                        style={{ padding: '8px 16px', marginTop: 4 }}
                      >
                        <Add size={16} color="currentColor" />
                        {emptyActionLabel}
                      </button>
                    )}
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
          className="fixed z-[9999] rounded-sm bg-popover shadow-popover text-foreground text-xs leading-normal break-words whitespace-pre-wrap cursor-pointer"
          style={{
            top: tooltipCell.rect.bottom + 4,
            left: tooltipCell.rect.left,
            maxWidth: 360,
            padding: '8px 12px',
            border: '1px solid var(--popover-border)',
            backdropFilter: 'blur(8px)'
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] flex flex-col gap-md p-lg bg-card border border-border rounded-md shadow-popover"
            style={{ width: 280 }}
          >
            <span className="text-sm font-semibold text-foreground">
              Filtrar: {activeFilter.header}
            </span>
            <input
              value={filterInputValue}
              onChange={e => setFilterInputValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleApplyFilter() }}
              placeholder="Digite para filtrar..."
              autoFocus
              className="w-full text-sm rounded-sm text-foreground outline-none px-md"
              style={{
                height: 36,
                border: '1px solid var(--input-border)',
                backgroundColor: 'var(--input-bg)'
              }}
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={handleClearFilter}
                className="cursor-pointer border-none outline-none rounded-sm bg-elevated text-foreground text-xs font-medium"
                style={{ padding: '6px 14px' }}
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={handleApplyFilter}
                className="cursor-pointer border-none outline-none rounded-sm bg-primary text-primary-foreground text-xs font-medium"
                style={{ padding: '6px 14px' }}
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

            {/* Page buttons: << < [1] ... [5] [6] [7] ... [100] > >> */}
            <div className="flex items-center gap-1 flex-wrap">
              {/* First page */}
              <PaginationButton
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(1)}
                isMobile={isMobile}
              >
                &laquo;
              </PaginationButton>
              {/* Previous */}
              <PaginationButton
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => p - 1)}
                isMobile={isMobile}
              >
                &lt;
              </PaginationButton>

              {pageSlots.map(slot => {
                if (slot === 'ellipsis-start' || slot === 'ellipsis-end') {
                  return (
                    <Popover
                      key={slot}
                      open={ellipsisPopoverOpen === (slot === 'ellipsis-start' ? 'start' : 'end')}
                      onOpenChange={open => {
                        setEllipsisPopoverOpen(open ? (slot === 'ellipsis-start' ? 'start' : 'end') : null)
                        if (open) setEllipsisSearch('')
                      }}
                    >
                      <PopoverTrigger asChild>
                        <PaginationButton isMobile={isMobile}>
                          &hellip;
                        </PaginationButton>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0 w-[140px]"
                        align="center"
                        side="top"
                        sideOffset={6}
                      >
                        <div className="p-[6px]">
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Página..."
                            value={ellipsisSearch}
                            onChange={e => setEllipsisSearch(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const val = Number(ellipsisSearch)
                                if (val >= 1 && val <= totalPages) {
                                  setCurrentPage(val)
                                  setEllipsisPopoverOpen(null)
                                }
                              }
                            }}
                            className="w-full rounded-xs border border-subtle bg-input text-xs px-[8px] py-[6px] outline-none focus:border-primary"
                            autoFocus
                          />
                        </div>
                        <div className="overflow-y-auto" style={{ maxHeight: 180 }}>
                          {ellipsisFilteredPages.map(page => (
                            <button
                              key={page}
                              type="button"
                              onClick={() => {
                                setCurrentPage(page)
                                setEllipsisPopoverOpen(null)
                              }}
                              className={cn(
                                'w-full text-left text-xs px-[10px] py-[6px] cursor-pointer border-none transition-colors',
                                page === currentPage ? 'bg-primary-8 text-primary font-semibold' : 'bg-transparent text-foreground hover-nav'
                              )}
                            >
                              Página {page}
                            </button>
                          ))}
                          {ellipsisFilteredPages.length === 0 && (
                            <div className="px-[10px] py-[8px] text-xs text-muted-foreground">
                              Nenhuma página
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )
                }

                const page = slot as number
                return (
                  <PaginationButton
                    key={page}
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                    isMobile={isMobile}
                  >
                    {page}
                  </PaginationButton>
                )
              })}

              {/* Next */}
              <PaginationButton
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                isMobile={isMobile}
              >
                &gt;
              </PaginationButton>
              {/* Last page */}
              <PaginationButton
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
                isMobile={isMobile}
              >
                &raquo;
              </PaginationButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PaginationButton({
  children,
  disabled,
  active,
  onClick,
  isMobile
}: {
  children: React.ReactNode
  disabled?: boolean
  active?: boolean
  onClick?: () => void
  isMobile?: boolean
}) {
  const size = isMobile ? 28 : 34
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-sm border transition-colors',
        disabled && 'opacity-30 cursor-not-allowed',
        active ? 'bg-primary text-primary-foreground font-bold border-transparent' : 'bg-secondary text-fg-secondary border-subtle hover:opacity-80',
        !disabled && !active && 'cursor-pointer'
      )}
      style={{
        width: size,
        height: size,
        fontSize: isMobile ? 'var(--text-xs)' : 'var(--text-caption)'
      }}
    >
      {children}
    </button>
  )
}

export { DataTable }
export type { DataTableProps, ColumnDef }
