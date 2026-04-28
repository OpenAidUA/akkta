import { FileText, Calendar, DollarSign, Users } from 'react-feather';
import type { DashboardStats } from '@/modules/dashboard/service';

interface StatCardsProps {
  stats: DashboardStats;
}

export function StatCards({ stats }: StatCardsProps) {
  const cards = [
    {
      label: 'Всього актів',
      value: stats.totalActs,
      icon: FileText,
      color: 'blue',
    },
    {
      label: 'За цей місяць',
      value: stats.actsThisMonth,
      icon: Calendar,
      color: 'green',
    },
    {
      label: 'На суму',
      value: new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH',
        maximumFractionDigits: 0,
      }).format(stats.totalAmount),
      icon: DollarSign,
      color: 'purple',
    },
    {
      label: 'Клієнтів',
      value: stats.totalClients,
      icon: Users,
      color: 'orange',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide">
                {card.label}
              </span>
              <div
                className={`p-2 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}
              >
                <Icon size={18} />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-slate-900 truncate">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
