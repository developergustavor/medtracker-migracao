const _loc = '@/utils/errors.utils'

export function treatError(error: unknown, showDetails = true): string {
  const fullLoc = `${_loc}.treatError`
  try {
    if (error instanceof Error) {
      return showDetails ? error.message : 'Ocorreu um erro na operação.'
    }
    if (typeof error === 'string') return error
    return 'Ocorreu um erro na operação.'
  } catch (err) {
    console.error(`Unhandled rejection at ${fullLoc}. Details:`, err)
    return 'Ocorreu um erro na operação.'
  }
}
