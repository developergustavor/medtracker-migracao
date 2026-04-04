// packages
import { useNavigate } from 'react-router-dom'

const _loc = '@/pages/NotFound'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-lg">
      <h1 className="text-display font-bold">404</h1>
      <p className="text-body text-muted-foreground">Pagina nao encontrada</p>
      <button className="px-lg py-sm bg-primary text-primary-foreground rounded-sm text-sm font-medium" onClick={() => navigate('/home')}>
        Voltar ao inicio
      </button>
    </div>
  )
}
