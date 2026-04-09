// packages
import { useState } from 'react'
import { ArrowDown2, ArrowRight2 } from 'iconsax-react'

// local
import { TEMPLATE_VARIABLES, createVariableHtml, type VariableDefinition } from './variables'

const _loc = '@/pages/cadastros/editor/VariablesPanel'

function VariablesPanel() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['material', 'cycle', 'tag']))

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleDragStart = (e: React.DragEvent, variable: VariableDefinition) => {
    e.dataTransfer.setData('text/html', createVariableHtml(variable))
    e.dataTransfer.setData('text/plain', `@@${variable.path}@@`)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="flex flex-col">
      <div className="px-md py-sm">
        <span className="text-xxs text-muted-foreground uppercase font-semibold tracking-wider">Arraste para inserir</span>
      </div>
      {TEMPLATE_VARIABLES.map(category => {
        const isExpanded = expandedCategories.has(category.key)
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
              <span className="text-xxs text-fg-dim ml-auto">{category.variables.length}</span>
            </button>
            {isExpanded && (
              <div className="flex flex-col pb-xs">
                {category.variables.map(variable => (
                  <div
                    key={variable.key}
                    draggable
                    onDragStart={e => handleDragStart(e, variable)}
                    className="flex items-center gap-sm px-lg py-[5px] cursor-grab active:cursor-grabbing hover-nav transition-colors mx-sm rounded-xs"
                  >
                    <div className="w-[6px] h-[6px] rounded-full bg-primary-20 shrink-0" />
                    <span className="text-xs text-foreground">{variable.label}</span>
                    <span className="text-xxs text-fg-dim ml-auto font-mono">@@{variable.path.split('.').pop()}@@</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export { VariablesPanel }
