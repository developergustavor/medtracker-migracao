// entities
import type { user_role, cme_module } from '@/entities'

export type ContextualActionProps = {
  label: string
  icon: string
  action: string
  variant?: 'primary' | 'default'
  position?: 'start' | 'center' | 'end'
}

export type RouteMetadataProps = {
  name: string
  path: string
  icon?: string
  allowedRoles: user_role[]
  allowedModules: cme_module[]
  showInSidebar: boolean
  showInMobileTab?: boolean
  mobileTabRoles?: user_role[]
  children?: RouteMetadataProps[]
  contextualActions?: ContextualActionProps[]
}
