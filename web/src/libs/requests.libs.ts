// packages
import axios, { AxiosError } from 'axios'

// store
import { useAuthStore } from '@/store'

// configs
import { VITE_APP_NAME, VITE_NODE_ENV, VITE_API_URL } from '@/configs'

function setupAPIClient() {
  const { token, logout } = useAuthStore.getState()

  const api = axios.create({
    baseURL: VITE_API_URL
  })

  api.interceptors.request.use(
    config => {
      const storageToken = JSON.parse(localStorage.getItem(`${VITE_APP_NAME}-${VITE_NODE_ENV}-auth-storage`) || '{}')?.state?.token

      if (token || storageToken) {
        config.headers.Authorization = `Bearer ${token || storageToken}`
      }

      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  api.interceptors.response.use(
    response => {
      if ([403, 401].includes(response.data?.statusCode) && !window.location.href.includes('/login')) {
        logout()
      }

      return response
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) logout()
      return Promise.reject(error)
    }
  )

  return api
}

export const api = setupAPIClient()
