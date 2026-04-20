import { StatCard } from '@/components/dashboard/StatCard';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { orders, tables } from '@/lib/mockData';

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export default function Dashboard() {
  const todayOrders = orders.filter(o => o.status !== 'cancelled');
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const occupiedTables = tables.filter(t => t.status === 'occupied' || t.status === 'reserved').length;
  const totalItemsSold = todayOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <button className="btn btn-primary">
          + New Order
        </button>
      </div>

      <div className="stat-grid">
        <StatCard
          icon="💰"
          iconClass="revenue"
          value={formatCurrency(todayRevenue)}
          label="Today's Revenue"
          trend={{ value: 12.5, direction: 'up' }}
          cardClass="revenue"
        />
        <StatCard
          icon="📋"
          iconClass="orders"
          value={todayOrders.length.toString()}
          label="Active Orders"
          trend={{ value: 8.3, direction: 'up' }}
          cardClass="orders"
        />
        <StatCard
          icon="🪑"
          iconClass="tables"
          value={`${occupiedTables}/${tables.length}`}
          label="Tables Occupied"
          cardClass="tables"
        />
        <StatCard
          icon="🍽️"
          iconClass="items"
          value={totalItemsSold.toString()}
          label="Items Sold Today"
          trend={{ value: 5.2, direction: 'up' }}
          cardClass="items"
        />
      </div>

      <div className="grid-2">
        <RecentOrders orders={orders} />
        
        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title">Quick Actions</h3>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="/orders" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              📋 Create New Order
            </a>
            <a href="/menu" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              🍽️ Add Menu Item
            </a>
            <a href="/tables" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              🪑 Manage Tables
            </a>
            <a href="/inventory" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              📦 Check Inventory
            </a>
            <a href="/reports" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              📈 View Reports
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
