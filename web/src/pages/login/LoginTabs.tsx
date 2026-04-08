// types
type LoginTab = 'code' | 'cpf' | 'cme' | 'facial'

type LoginTabsProps = {
  activeTab: LoginTab
  onTabChange: (tab: LoginTab) => void
}

const tabs: { key: LoginTab; label: string }[] = [
  { key: 'code', label: 'Código' },
  { key: 'cpf', label: 'Usuário' },
  { key: 'cme', label: 'CME' },
  { key: 'facial', label: 'Facial' }
]

export function LoginTabs({ activeTab, onTabChange }: LoginTabsProps) {
  return (
    <div
      className="flex w-full rounded-[10px] p-[3px] gap-[2px] bg-muted"
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className="flex-1 py-[8px] px-[6px] rounded-[8px] text-xs font-medium cursor-pointer border-none outline-none"
            style={{
              backgroundColor: isActive ? 'var(--card)' : 'transparent',
              color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
              boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 150ms ease'
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
