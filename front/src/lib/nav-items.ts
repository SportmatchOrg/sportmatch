import { Calendar, Map, Search, User, type LucideIcon } from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  enabled: boolean;
};

export const HOME_HREF = '/mapa';
export const NEW_MATCH_HREF = '/partidos/nuevo';
export const PROFILE_HREF = '/perfil';
export const NOTIFICATIONS_HREF = '/notificaciones';
export const SETTINGS_HREF = '/perfil/ajustes';
export const EDIT_PROFILE_HREF = '/perfil/editar';

export const NAV_ITEMS: NavItem[] = [
  { href: HOME_HREF, label: 'Mapa', icon: Map, enabled: true },
  { href: '/buscar', label: 'Descubrir', icon: Search, enabled: true },
  { href: '/mis-partidos', label: 'Partidos', icon: Calendar, enabled: true },
  { href: PROFILE_HREF, label: 'Perfil', icon: User, enabled: true },
];

export function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
