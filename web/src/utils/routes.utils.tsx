// packages
import type { ReactNode } from 'react'
import {
  Home2,
  Chart,
  AddSquare,
  Box1,
  Refresh2,
  DirectboxSend,
  DirectboxReceive,
  TaskSquare,
  Tag,
  DocumentText,
  Setting2,
  Setting,
  Scissor,
  People,
  Cpu,
  Danger,
  Health,
  ProfileCircle,
  Building4,
  Profile2User,
  TickSquare,
  Flash,
  Add,
  Filter,
  DocumentDownload
} from 'iconsax-react'

const _loc = '@/utils/routes.utils'

type IconsaxProps = {
  size?: number
  variant?: 'Linear' | 'Bold' | 'Outline' | 'Broken' | 'Bulk' | 'TwoTone'
  color?: string
  style?: React.CSSProperties
}

export const ICON_MAP: Record<string, React.ComponentType<IconsaxProps>> = {
  Home2,
  Chart,
  AddSquare,
  Box1,
  Refresh2,
  DirectboxSend,
  DirectboxReceive,
  TaskSquare,
  Tag,
  DocumentText,
  Setting2,
  Setting,
  Scissor,
  People,
  Cpu,
  Danger,
  Health,
  ProfileCircle,
  Building4,
  Profile2User,
  TickSquare,
  Flash,
  Add,
  Filter,
  DocumentDownload
}

export function getRouteIcon(iconName: string, size: number, active: boolean): ReactNode {
  const IconComponent = ICON_MAP[iconName]
  if (!IconComponent) return null
  return <IconComponent size={size} variant={active ? 'Bold' : 'Linear'} color="currentColor" />
}
