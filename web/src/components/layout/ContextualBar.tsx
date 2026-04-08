// packages
import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { More } from 'iconsax-react'

// utils
import { getRouteIcon } from '@/utils'

// types
import type { ContextualActionProps } from '@/types'

const _loc = '@/components/layout/ContextualBar'

type ContextualBarProps = {
  actions: ContextualActionProps[]
  onAction?: (actionId: string) => void
}

function ActionButton({ action, isPrimary, onAction }: { action: ContextualActionProps; isPrimary: boolean; onAction?: (actionId: string) => void }) {
  const isDisabled = action.disabled === true

  const handleClick = () => {
    if (isDisabled) return
    if (onAction) {
      onAction(action.action)
    } else {
      const fullLoc = `${_loc}.ActionButton.handleClick`
      console.log(`[${fullLoc}] Action triggered: ${action.action}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className="flex items-center gap-xs shrink-0 rounded-sm text-xs"
      style={{
        padding: '5px 12px',
        backgroundColor: isPrimary ? 'var(--primary)' : 'transparent',
        border: isPrimary ? '1px solid var(--primary)' : '1px solid transparent',
        color: isPrimary ? 'var(--primary-fg)' : 'var(--foreground)',
        fontWeight: isPrimary ? 600 : 400,
        transition: 'background-color 150ms ease, opacity 150ms ease',
        whiteSpace: 'nowrap',
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer'
      }}
      onMouseEnter={e => {
        if (isDisabled) return
        ;(e.currentTarget as HTMLElement).style.opacity = isPrimary ? '0.9' : '1'
        ;(e.currentTarget as HTMLElement).style.backgroundColor = isPrimary ? 'var(--primary)' : 'var(--nav-hover-bg)'
      }}
      onMouseLeave={e => {
        if (isDisabled) return
        ;(e.currentTarget as HTMLElement).style.opacity = '1'
        ;(e.currentTarget as HTMLElement).style.backgroundColor = isPrimary ? 'var(--primary)' : 'transparent'
      }}
    >
      {action.icon && (
        <span className="flex items-center" style={{ color: isPrimary ? 'var(--primary-fg)' : 'var(--foreground)' }}>
          {getRouteIcon(action.icon, 16, false)}
        </span>
      )}
      <span>{action.label}</span>
    </button>
  )
}

function OverflowMenu({ actions }: { actions: ContextualActionProps[] }) {
  const [open, setOpen] = useState(false)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect())
    }
    setOpen(prev => !prev)
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center justify-center cursor-pointer shrink-0 rounded-sm text-muted-foreground"
        style={{
          width: 32,
          height: 32,
          backgroundColor: open ? 'var(--elevated)' : 'transparent',
          border: 'none',
          transition: 'background-color 150ms ease'
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
      >
        <More size={18} color="currentColor" />
      </button>

      {open && buttonRect && createPortal(
        <div
          ref={popoverRef}
          className="bg-popover rounded-md shadow-popover"
          style={{
            position: 'fixed',
            top: buttonRect.bottom + 4,
            right: window.innerWidth - buttonRect.right,
            zIndex: 200,
            minWidth: 180,
            border: '1px solid var(--popover-border)',
            padding: 4
          }}
        >
          {actions.map(action => (
            <button
              key={action.action}
              onClick={() => {
                console.log(`[${_loc}.OverflowMenu] Action triggered: ${action.action}`)
                setOpen(false)
              }}
              className="flex items-center gap-sm w-full cursor-pointer rounded-sm text-foreground text-xs"
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                fontWeight: 400,
                transition: 'background-color 150ms ease',
                textAlign: 'left',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              {action.icon && (
                <span className="flex items-center" style={{ color: 'var(--foreground)' }}>
                  {getRouteIcon(action.icon, 16, false)}
                </span>
              )}
              <span>{action.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

export function ContextualBar({ actions, onAction }: ContextualBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [overflowing, setOverflowing] = useState(false)

  const startActions = actions.filter(a => a.position === 'start' || !a.position)
  const centerActions = actions.filter(a => a.position === 'center')
  const endActions = actions.filter(a => a.position === 'end')

  // Track if the first start action has been identified as the primary
  const firstStartAction = startActions[0]
  const remainingStartActions = startActions.slice(1)

  const checkOverflow = useCallback(() => {
    if (containerRef.current && innerRef.current) {
      const isOverflowing = innerRef.current.scrollWidth > containerRef.current.clientWidth
      setOverflowing(isOverflowing)
    }
  }, [])

  useEffect(() => {
    checkOverflow()

    const observer = new ResizeObserver(checkOverflow)
    if (containerRef.current) observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [checkOverflow, actions])

  // All actions for overflow menu (excludes primary action)
  const overflowActions = [...remainingStartActions, ...centerActions, ...endActions]

  return (
    <div
      ref={containerRef}
      className="shrink-0 flex items-center px-xl overflow-hidden bg-background"
      style={{
        height: 44,
        borderBottom: '1px solid var(--border-separator)'
      }}
    >
      <div
        ref={innerRef}
        className="flex items-center justify-between w-full gap-sm"
        style={{ minWidth: 0 }}
      >
        {/* Start group */}
        <div className="flex items-center gap-xs shrink-0">
          {firstStartAction && (
            <ActionButton action={firstStartAction} isPrimary={firstStartAction.variant === 'primary'} onAction={onAction} />
          )}
          {!overflowing && remainingStartActions.map(action => (
            <ActionButton key={action.action} action={action} isPrimary={false} onAction={onAction} />
          ))}
        </div>

        {/* End group (center + end merged) */}
        {!overflowing && (centerActions.length > 0 || endActions.length > 0) && (
          <div className="flex items-center gap-xs shrink-0">
            {centerActions.map(action => (
              <ActionButton key={action.action} action={action} isPrimary={false} onAction={onAction} />
            ))}
            {endActions.map(action => (
              <ActionButton key={action.action} action={action} isPrimary={false} onAction={onAction} />
            ))}
          </div>
        )}

        {/* Overflow "..." button */}
        {overflowing && overflowActions.length > 0 && (
          <div className="shrink-0">
            <OverflowMenu actions={overflowActions} />
          </div>
        )}
      </div>
    </div>
  )
}
