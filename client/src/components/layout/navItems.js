import {
  LayoutDashboard,
  Users,
  Receipt,
  Scale,
  HandCoins,
  TrendingUp,
} from 'lucide-react';

// `mobile: true` means the item also appears in the bottom bar on small screens.
export const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, mobile: true },
  { to: '/groups', label: 'Groups', icon: Users, mobile: true },
  { to: '/expenses', label: 'Expenses', icon: Receipt, mobile: true },
  { to: '/balances', label: 'Balances', icon: Scale, mobile: true },
  { to: '/settlements', label: 'Settlements', icon: HandCoins, mobile: false },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp, mobile: true },
];