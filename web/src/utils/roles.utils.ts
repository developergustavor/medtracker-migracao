// entities
import { user_role } from '@/entities'

const _loc = '@/utils/roles.utils'

/**
 * Hierarquia de roles (maior indice = maior nivel de acesso):
 * COLABORADOR < REPRESENTANTE < COLABORADOR_CHEFE < ADMINISTRADOR < DEV
 */
const ROLE_HIERARCHY: Record<user_role, number> = {
  [user_role.COLABORADOR]: 0,
  [user_role.REPRESENTANTE]: 1,
  [user_role.COLABORADOR_CHEFE]: 2,
  [user_role.ADMINISTRADOR]: 3,
  [user_role.DEV]: 4
}

/** Verifica se a role do usuario atinge o nivel minimo exigido */
export function isAllowed(currentRole: user_role | undefined, minimumRole: user_role): boolean {
  if (!currentRole) return false
  return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[minimumRole]
}

/** Verifica se a role do usuario esta incluida em uma lista de roles permitidas */
export function isRoleIn(currentRole: user_role | undefined, allowedRoles: user_role[]): boolean {
  if (!currentRole) return false
  return allowedRoles.includes(currentRole)
}

// --- Atalhos por nivel ---

/** DEV only */
export function isDevOnly(role: user_role | undefined): boolean {
  return role === user_role.DEV
}

/** DEV ou ADMIN */
export function isAdminOrAbove(role: user_role | undefined): boolean {
  return isAllowed(role, user_role.ADMINISTRADOR)
}

/** DEV, ADMIN ou COLABORADOR_CHEFE */
export function isChefeOrAbove(role: user_role | undefined): boolean {
  return isAllowed(role, user_role.COLABORADOR_CHEFE)
}

/** DEV, ADMIN, COLABORADOR_CHEFE ou REPRESENTANTE (todos exceto COLABORADOR) */
export function isNonColab(role: user_role | undefined): boolean {
  return isAllowed(role, user_role.REPRESENTANTE)
}

/** Qualquer role autenticada */
export function isAuthenticated(role: user_role | undefined): boolean {
  return role !== undefined
}

/** Pode toggle theme (DEV ou ADMIN) */
export function canToggleTheme(role: user_role | undefined): boolean {
  return isAdminOrAbove(role)
}

/** Pode acessar features admin (Gerenciamento, etc) */
export function canAccessAdmin(role: user_role | undefined): boolean {
  return isAdminOrAbove(role)
}

/** Pode acessar cadastros, dashboard, configuracoes */
export function canAccessManagement(role: user_role | undefined): boolean {
  return isNonColab(role)
}
