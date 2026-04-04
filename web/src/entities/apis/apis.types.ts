export type BaseResponseProps<T = unknown[]> = {
  statusCode: number
  statusMessage?: string
  details?: string | unknown
  body: T
  token?: string
  meta?: {
    page: number
    pages: number
    limit: number
    total: number
    order?: string
  }
}
