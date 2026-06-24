import { User, Lock, Shield } from 'react-feather';

export const dropdownConfig = [
  {
    link: '/settings',
    label: 'Налаштування',
    icon: <User size={22} />,
  },
  {
    link: '/privacy',
    label: 'Політика конфіденційності',
    icon: <Lock size={22} />,
  },
  {
    link: '/terms',
    label: 'Умови використання',
    icon: <Shield size={22} />,
  },
];
