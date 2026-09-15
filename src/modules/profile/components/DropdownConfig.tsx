import { User, Lock, MessageSquare, Shield } from 'react-feather';

export const dropdownConfig = [
  {
    link: '/settings',
    label: 'Налаштування',
    icon: <User size={22} />,
  },
  {
    link: '/feedback',
    label: 'Зворотний зв’язок',
    icon: <MessageSquare size={22} />,
  },
  {
    link: '/privacy',
    label: 'Політика конфіденційності',
    external: true,
    icon: <Lock size={22} />,
  },
  {
    link: '/terms',
    label: 'Умови використання',
    external: true,
    icon: <Shield size={22} />,
  },
];
