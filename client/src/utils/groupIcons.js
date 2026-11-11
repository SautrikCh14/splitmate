import { Briefcase, GraduationCap, Heart, House, Plane, ShoppingBag, Users, Utensils } from 'lucide-react';

// The keys match the icons the server accepts. Each key maps to a picture and a label.
export const GROUP_ICONS = {
  users: { Icon: Users, label: 'People' },
  plane: { Icon: Plane, label: 'Trip' },
  home: { Icon: House, label: 'Home' },
  utensils: { Icon: Utensils, label: 'Food' },
  'graduation-cap': { Icon: GraduationCap, label: 'College' },
  heart: { Icon: Heart, label: 'Family' },
  briefcase: { Icon: Briefcase, label: 'Work' },
  'shopping-bag': { Icon: ShoppingBag, label: 'Shopping' },
};

export const GROUP_ICON_KEYS = Object.keys(GROUP_ICONS);