import { Calendar, Map, Search, User, type LucideIcon } from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  enabled: boolean;
};

export const NEW_MATCH_HREF = '/partidos/nuevo';
export const PROFILE_HREF = '/perfil';

export const NAV_ITEMS: NavItem[] = [
  { href: '/mapa', label: 'Mapa', icon: Map, enabled: false },
  { href: '/buscar', label: 'Descubrir', icon: Search, enabled: false },
  { href: '/mis-partidos', label: 'Partidos', icon: Calendar, enabled: false },
  { href: PROFILE_HREF, label: 'Perfil', icon: User, enabled: true },
];

export function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
