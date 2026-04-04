const _loc = '@/pages/ServerError'

export function ServerError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-lg">
      <h1 className="text-display font-bold">500</h1>
      <p className="text-body text-muted-foreground">Erro interno do servidor</p>
      <button className="px-lg py-sm bg-primary text-primary-foreground rounded-sm text-sm font-medium" onClick={() => window.location.reload()}>
        Recarregar
      </button>
    </div>
  )
}
