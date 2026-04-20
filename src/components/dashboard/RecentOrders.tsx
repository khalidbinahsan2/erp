import { Order } from '@/types';

interface RecentOrdersProps {
  orders: Order[];
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleDateString();
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const sortedOrders = [...orders]
    .filter(o => o.status !== 'cancelled')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="data-card">
      <div className="data-card-header">
        <h3 className="data-card-title">Recent Orders</h3>
        <a href="/orders" className="btn btn-secondary btn-sm">View All</a>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Table</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((order) => (
            <tr key={order.id}>
              <td className="mono">{order.id}</td>
              <td>Table {order.tableNumber}</td>
              <td>{order.items.length} items</td>
              <td className="mono">{formatCurrency(order.total)}</td>
              <td>
                <span className={`badge badge-${order.status}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </td>
              <td>{formatTime(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
