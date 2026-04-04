// packages
import { createContext } from 'react'

export type AuthContextProps = { loading: boolean }

export const AuthContext = createContext<AuthContextProps>({ loading: false })
