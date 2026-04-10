// packages
import { useState, useCallback } from 'react'
import { ArrowDown2, ArrowRight2 } from 'iconsax-react'

// local
import { TEMPLATE_VARIABLES, createVariableHtml, type VariableDefinition } from './variables'

const _loc = '@/pages/cadastros/editor/VariablesPanel'

type VariablesPanelProps = {
  addedVariables?: Record<string, number>
}

function VariablesPanel({ addedVariables = {} }: VariablesPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['material', 'cycle', 'tag']))

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const expandAll = useCallback(() => {
    setExpandedCategories(new Set(TEMPLATE_VARIABLES.map(c => c.key)))
  }, [])

  const collapseAll = useCallback(() => {
    setExpandedCategories(new Set())
  }, [])

  const allExpanded = expandedCategories.size === TEMPLATE_VARIABLES.length

  const handleDragStart = (e: React.DragEvent, variable: VariableDefinition) => {
    e.dataTransfer.setData('text/html', createVariableHtml(variable))
    e.dataTransfer.setData('text/plain', `@@${variable.path}@@`)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="flex flex-col">
      {/* Header with expand/collapse toggle */}
      <div className="flex items-center justify-between px-md py-sm">
        <span className="text-xxs text-muted-foreground uppercase font-semibold tracking-wider">Arraste para inserir</span>
        <button type="button" onClick={allExpanded ? collapseAll : expandAll} className="text-xxs text-primary bg-transparent border-none cursor-pointer">
          {allExpanded ? 'Recolher' : 'Expandir'}
        </button>
      </div>

      {TEMPLATE_VARIABLES.map(category => {
        const isExpanded = expandedCategories.has(category.key)
        // Count how many vars from this category are in the canvas
        const categoryAddedCount = category.variables.reduce((sum, v) => sum + (addedVariables[v.path] || 0), 0)

        return (
          <div key={category.key}>
            <button
              type="button"
              onClick={() => toggleCategory(category.key)}
              className="w-full flex items-center gap-sm px-md py-[7px] text-left border-none cursor-pointer bg-transparent hover-nav transition-colors"
            >
              {isExpanded
                ? <ArrowDown2 size={12} color="var(--fg-muted)" />
                : <ArrowRight2 size={12} color="var(--fg-muted)" />
              }
              <span className="text-xs font-semibold text-foreground">{category.label}</span>
              {/* Added count indicator */}
              {categoryAddedCount > 0 ? (
                <span className="ml-auto w-[18px] h-[18px] rounded-full bg-primary flex items-center justify-center text-xxs text-on-solid font-bold">{categoryAddedCount}</span>
              ) : (
                <span className="text-xxs text-fg-dim ml-auto">{category.variables.length}</span>
              )}
            </button>
            {isExpanded && (
              <div className="flex flex-col pb-xs">
                {category.variables.map(variable => {
                  const count = addedVariables[variable.path] || 0
                  return (
                    <div
                      key={variable.key}
                      draggable
                      onDragStart={e => handleDragStart(e, variable)}
                      className="flex items-center gap-sm px-lg py-[5px] cursor-grab active:cursor-grabbing hover-nav transition-colors mx-sm rounded-xs"
                    >
                      <div className={`w-[6px] h-[6px] rounded-full shrink-0 ${count > 0 ? 'bg-primary' : 'bg-primary-20'}`} />
                      <span className="text-xs text-foreground">{variable.label}</span>
                      {count > 0 && (
                        <span className="ml-auto w-[16px] h-[16px] rounded-full bg-primary-8 flex items-center justify-center text-xxs text-primary font-bold">{count}</span>
                      )}
                      {count === 0 && (
                        <span className="text-xxs text-fg-dim ml-auto font-mono">@@{variable.path.split('.').pop()}@@</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export { VariablesPanel }
