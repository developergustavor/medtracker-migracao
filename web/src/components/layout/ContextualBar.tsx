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
}

function ActionButton({ action, isPrimary }: { action: ContextualActionProps; isPrimary: boolean }) {
  const handleClick = () => {
    const fullLoc = `${_loc}.ActionButton.handleClick`
    console.log(`[${fullLoc}] Action triggered: ${action.action}`)
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-xs cursor-pointer shrink-0"
      style={{
        padding: '5px 12px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: isPrimary ? 'var(--primary-8)' : 'transparent',
        border: isPrimary ? '1px solid var(--primary-20)' : '1px solid transparent',
        color: isPrimary ? 'var(--primary)' : 'var(--foreground)',
        fontSize: 'var(--text-xs)',
        fontWeight: isPrimary ? 600 : 400,
        transition: 'background-color 150ms ease',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.backgroundColor = isPrimary ? 'var(--primary-12)' : 'var(--nav-hover-bg)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.backgroundColor = isPrimary ? 'var(--primary-8)' : 'transparent'
      }}
    >
      {action.icon && (
        <span className="flex items-center" style={{ color: isPrimary ? 'var(--primary)' : 'var(--muted-foreground)' }}>
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
        className="flex items-center justify-center cursor-pointer shrink-0"
        style={{
          width: 32,
          height: 32,
          borderRadius: 'var(--radius-sm)',
          backgroundColor: open ? 'var(--elevated)' : 'transparent',
          border: 'none',
          color: 'var(--muted-foreground)',
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
          style={{
            position: 'fixed',
            top: buttonRect.bottom + 4,
            right: window.innerWidth - buttonRect.right,
            zIndex: 200,
            minWidth: 180,
            backgroundColor: 'var(--popover)',
            border: '1px solid var(--popover-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-popover)',
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
              className="flex items-center gap-sm w-full cursor-pointer"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--foreground)',
                fontSize: 'var(--text-xs)',
                fontWeight: 400,
                transition: 'background-color 150ms ease',
                textAlign: 'left',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              {action.icon && (
                <span className="flex items-center" style={{ color: 'var(--muted-foreground)' }}>
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

export function ContextualBar({ actions }: ContextualBarProps) {
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
      className="shrink-0 flex items-center px-xl overflow-hidden"
      style={{
        height: 44,
        borderBottom: '1px solid var(--border-separator)',
        backgroundColor: 'var(--background)'
      }}
    >
      <div
        ref={innerRef}
        className="flex items-center w-full gap-sm"
        style={{ minWidth: 0 }}
      >
        {/* Start group */}
        <div className="flex items-center gap-xs shrink-0">
          {firstStartAction && (
            <ActionButton action={firstStartAction} isPrimary={firstStartAction.variant === 'primary'} />
          )}
          {!overflowing && remainingStartActions.map(action => (
            <ActionButton key={action.action} action={action} isPrimary={false} />
          ))}
        </div>

        {/* Center group */}
        {!overflowing && centerActions.length > 0 && (
          <div className="flex items-center justify-center gap-xs flex-1">
            {centerActions.map(action => (
              <ActionButton key={action.action} action={action} isPrimary={false} />
            ))}
          </div>
        )}

        {/* Spacer when overflowing (push end items to right) */}
        {overflowing && <div className="flex-1" />}

        {/* End group */}
        {!overflowing && endActions.length > 0 && (
          <div className="flex items-center gap-xs shrink-0 ml-auto">
            {endActions.map(action => (
              <ActionButton key={action.action} action={action} isPrimary={false} />
            ))}
          </div>
        )}

        {/* Overflow "..." button */}
        {overflowing && overflowActions.length > 0 && (
          <div className="shrink-0 ml-auto">
            <OverflowMenu actions={overflowActions} />
          </div>
        )}
      </div>
    </div>
  )
}
