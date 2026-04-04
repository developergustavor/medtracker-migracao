// packages
import { useNavigate } from 'react-router-dom'

const _loc = '@/pages/Forbidden'

export function Forbidden() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-lg">
      <h1 className="text-display font-bold">403</h1>
      <p className="text-body text-muted-foreground">Acesso negado</p>
      <button className="px-lg py-sm bg-primary text-primary-foreground rounded-sm text-sm font-medium" onClick={() => navigate('/home')}>
        Voltar ao inicio
      </button>
    </div>
  )
}
