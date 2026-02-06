import { LucideIcon, ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: ReactNode;
  onClick?: () => void;
  subtitle?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-orange-600',
  iconBgColor = 'bg-orange-100',
  trend,
  onClick,
  subtitle,
}: StatsCardProps) {
  const content = (
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${iconBgColor}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {onClick && (
        <ChevronRight className="h-5 w-5 text-gray-400" />
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="bg-white rounded-lg shadow-sm p-6 w-full text-left hover:shadow-md hover:bg-gray-50 transition-all"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {content}
    </div>
  );
}
