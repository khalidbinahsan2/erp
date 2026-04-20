interface StatCardProps {
  icon: string;
  iconClass: string;
  value: string;
  label: string;
  trend?: { value: number; direction: 'up' | 'down' };
  cardClass: string;
}

export function StatCard({ icon, iconClass, value, label, trend, cardClass }: StatCardProps) {
  return (
    <div className={`stat-card ${cardClass}`}>
      <div className={`stat-icon ${iconClass}`}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {trend && (
        <div className={`stat-trend ${trend.direction}`}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
        </div>
      )}
    </div>
  );
}
