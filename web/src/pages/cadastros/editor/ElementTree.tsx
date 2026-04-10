// packages
import { ArrowDown2, ArrowRight2, Lock1, Unlock, Trash, Copy } from 'iconsax-react'

// libs
import { cn } from '@/libs/shadcn.utils'

// local
import type { TreeNode } from './useElementTree'

const _loc = '@/pages/cadastros/editor/ElementTree'

type ElementTreeProps = {
  tree: TreeNode[]
  selectedElement: HTMLElement | null
  lockedIds: Set<string>
  onSelect: (element: HTMLElement) => void
  onToggleLock: (nodeId: string) => void
  onToggleCollapse: (nodeId: string) => void
  onDelete: (node: TreeNode) => void
  onDuplicate: (node: TreeNode) => void
  onRename: (nodeId: string, label: string) => void
}

function TreeNodeItem({
  node,
  depth,
  selectedElement,
  lockedIds,
  onSelect,
  onToggleLock,
  onToggleCollapse,
  onDelete,
  onDuplicate
}: {
  node: TreeNode
  depth: number
  selectedElement: HTMLElement | null
  lockedIds: Set<string>
  onSelect: (el: HTMLElement) => void
  onToggleLock: (id: string) => void
  onToggleCollapse: (id: string) => void
  onDelete: (n: TreeNode) => void
  onDuplicate: (n: TreeNode) => void
}) {
  const isSelected = selectedElement === node.element
  const isLocked = lockedIds.has(node.id)
  const hasChildren = node.children.length > 0
  const isVariable = !!node.variablePath

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-[3px] py-[3px] pr-xs cursor-pointer transition-colors group',
          isSelected ? 'bg-primary-8 text-primary' : 'text-foreground hover-nav',
          isLocked && 'opacity-50'
        )}
        style={{ paddingLeft: depth * 14 + 8 }}
        onClick={() => !isLocked && onSelect(node.element)}
      >
        {/* Expand/collapse */}
        {hasChildren ? (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onToggleCollapse(node.id) }}
            className="w-[16px] h-[16px] flex items-center justify-center bg-transparent border-none cursor-pointer shrink-0"
          >
            {node.collapsed
              ? <ArrowRight2 size={10} color="currentColor" />
              : <ArrowDown2 size={10} color="currentColor" />
            }
          </button>
        ) : (
          <div className="w-[16px] shrink-0" />
        )}

        {/* Type indicator */}
        <div className={cn(
          'w-[6px] h-[6px] rounded-full shrink-0',
          isVariable ? 'bg-primary' : node.tagName === 'img' ? 'bg-warning' : 'bg-fg-dim'
        )} />

        {/* Label */}
        <span className="text-xxs truncate flex-1 min-w-0">{node.label}</span>

        {/* Actions (show on hover) */}
        <div className="flex items-center gap-[2px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onToggleLock(node.id) }}
            className="w-[16px] h-[16px] flex items-center justify-center bg-transparent border-none cursor-pointer"
            title={isLocked ? 'Desbloquear' : 'Bloquear'}
          >
            {isLocked
              ? <Lock1 size={10} color="var(--destructive)" />
              : <Unlock size={10} color="var(--fg-dim)" />
            }
          </button>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onDuplicate(node) }}
            className="w-[16px] h-[16px] flex items-center justify-center bg-transparent border-none cursor-pointer"
            title="Duplicar"
          >
            <Copy size={10} color="var(--fg-dim)" />
          </button>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onDelete(node) }}
            className="w-[16px] h-[16px] flex items-center justify-center bg-transparent border-none cursor-pointer"
            title="Excluir"
          >
            <Trash size={10} color="var(--destructive)" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && !node.collapsed && (
        node.children.map(child => (
          <TreeNodeItem
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedElement={selectedElement}
            lockedIds={lockedIds}
            onSelect={onSelect}
            onToggleLock={onToggleLock}
            onToggleCollapse={onToggleCollapse}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        ))
      )}
    </>
  )
}

function ElementTree({
  tree, selectedElement, lockedIds, onSelect, onToggleLock, onToggleCollapse, onDelete, onDuplicate
}: ElementTreeProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-sm py-[6px] border-b border-separator shrink-0">
        <span className="text-xxs text-muted-foreground font-semibold uppercase tracking-wider">Camadas</span>
        <span className="text-xxs text-fg-dim">{tree.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto py-[2px]">
        {tree.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xxs text-fg-dim">
            Nenhum elemento
          </div>
        ) : (
          tree.map(node => (
            <TreeNodeItem
              key={node.id}
              node={node}
              depth={0}
              selectedElement={selectedElement}
              lockedIds={lockedIds}
              onSelect={onSelect}
              onToggleLock={onToggleLock}
              onToggleCollapse={onToggleCollapse}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))
        )}
      </div>
    </div>
  )
}

export { ElementTree }
