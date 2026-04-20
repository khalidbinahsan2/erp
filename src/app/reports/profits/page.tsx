'use client';

import { useState } from 'react';
import { orders, menuItems, inventoryItems, menuItemRecipes } from '@/lib/mockData';

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function calculateItemCost(menuItemId: string): number {
  const recipe = menuItemRecipes.find(r => r.menuItemId === menuItemId);
  if (!recipe) return 0;

  return recipe.ingredients.reduce((cost, ing) => {
    const invItem = inventoryItems.find(i => i.id === ing.inventoryItemId);
    return cost + (invItem ? invItem.costPerUnit * ing.quantity : 0);
  }, 0);
}

function calculateOrderCost(order: typeof orders[0]): number {
  return order.items.reduce((cost, item) => {
    const itemCost = calculateItemCost(item.menuItemId);
    return cost + (itemCost * item.quantity);
  }, 0);
}

function filterOrdersByPeriod(period: 'day' | 'month' | 'year') {
  const now = new Date();
  let startDate: Date;

  if (period === 'day') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    startDate = new Date(now.getFullYear(), 0, 1);
  }

  return orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate >= startDate && o.status === 'completed';
  });
}

interface DailyProfit {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  orders: number;
  orderIds: string[];
}

interface DayDetail {
  date: string;
  orders: typeof orders;
  itemsSold: { itemId: string; name: string; quantity: number; revenue: number; cost: number; profit: number }[];
  hourlyData: { hour: number; orders: number; revenue: number; profit: number }[];
}

function getDailyProfits(days: number): DailyProfit[] {
  const profits: Record<string, DailyProfit> = {};
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    profits[dateStr] = { date: dateStr, revenue: 0, cost: 0, profit: 0, orders: 0, orderIds: [] };
  }

  orders.filter(o => o.status === 'completed').forEach(order => {
    const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
    if (profits[dateStr]) {
      const orderCost = calculateOrderCost(order);
      profits[dateStr].revenue += order.total;
      profits[dateStr].cost += orderCost;
      profits[dateStr].profit += (order.total - orderCost);
      profits[dateStr].orders += 1;
      profits[dateStr].orderIds.push(order.id);
    }
  });

  return Object.values(profits).sort((a, b) => a.date.localeCompare(b.date));
}

function getDayDetail(dateStr: string): DayDetail {
  const dayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate.toISOString().split('T')[0] === dateStr && o.status === 'completed';
  });

  const itemsSoldMap: Record<string, { itemId: string; name: string; quantity: number; revenue: number; cost: number; profit: number }> = {};
  
  dayOrders.forEach(order => {
    order.items.forEach(item => {
      if (!itemsSoldMap[item.menuItemId]) {
        const menuItem = menuItems.find(m => m.id === item.menuItemId);
        const itemCost = calculateItemCost(item.menuItemId);
        itemsSoldMap[item.menuItemId] = {
          itemId: item.menuItemId,
          name: item.name,
          quantity: 0,
          revenue: 0,
          cost: 0,
          profit: 0
        };
      }
      itemsSoldMap[item.menuItemId].quantity += item.quantity;
      itemsSoldMap[item.menuItemId].revenue += item.price * item.quantity;
      const itemCost = calculateItemCost(item.menuItemId);
      itemsSoldMap[item.menuItemId].cost += itemCost * item.quantity;
      itemsSoldMap[item.menuItemId].profit += (item.price - itemCost) * item.quantity;
    });
  });

  const hourlyData: Record<number, { hour: number; orders: number; revenue: number; profit: number }> = {};
  for (let h = 0; h < 24; h++) {
    hourlyData[h] = { hour: h, orders: 0, revenue: 0, profit: 0 };
  }
  
  dayOrders.forEach(order => {
    const hour = new Date(order.createdAt).getHours();
    const orderCost = calculateOrderCost(order);
    hourlyData[hour].orders += 1;
    hourlyData[hour].revenue += order.total;
    hourlyData[hour].profit += (order.total - orderCost);
  });

  return {
    date: dateStr,
    orders: dayOrders,
    itemsSold: Object.values(itemsSoldMap).sort((a, b) => b.quantity - a.quantity),
    hourlyData: Object.values(hourlyData).sort((a, b) => a.hour - b.hour)
  };
}

export default function ProfitsPage() {
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('day');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredOrders = filterOrdersByPeriod(period);
  
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalCost = filteredOrders.reduce((sum, o) => sum + calculateOrderCost(o), 0);
  const totalProfit = totalRevenue - totalCost;
  const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const dailyProfits = getDailyProfits(period === 'day' ? 7 : period === 'month' ? 30 : 12);
  const avgDailyProfit = dailyProfits.length > 0 
    ? dailyProfits.reduce((sum, d) => sum + d.profit, 0) / dailyProfits.filter(d => d.orders > 0).length 
    : 0;

  const topProfitableItems = menuItems
    .map(item => {
      const sold = orders.reduce((sum, o) => {
        return sum + o.items.filter(i => i.menuItemId === item.id && o.status === 'completed').reduce((s, i) => s + i.quantity, 0);
      }, 0);
      const itemCost = calculateItemCost(item.id);
      const revenue = item.price * sold;
      const cost = itemCost * sold;
      return { 
        ...item, 
        sold, 
        revenue, 
        cost, 
        profit: revenue - cost,
        margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0
      };
    })
    .filter(item => item.sold > 0)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  const lowMarginItems = menuItems
    .map(item => {
      const sold = orders.reduce((sum, o) => {
        return sum + o.items.filter(i => i.menuItemId === item.id && o.status === 'completed').reduce((s, i) => s + i.quantity, 0);
      }, 0);
      const itemCost = calculateItemCost(item.id);
      const revenue = item.price * sold;
      const cost = itemCost * sold;
      return { 
        ...item, 
        sold, 
        revenue, 
        cost, 
        profit: revenue - cost,
        margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0
      };
    })
    .filter(item => item.sold > 0 && item.margin < 30)
    .sort((a, b) => a.margin - b.margin)
    .slice(0, 5);

  const viewDayDetail = (dateStr: string) => {
    setSelectedDay(dateStr);
    setShowDetailModal(true);
  };

  const dayDetail = selectedDay ? getDayDetail(selectedDay) : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'badge-available';
      case 'pending': return 'badge-pending';
      case 'in_progress': return 'badge-in_progress';
      case 'ready': return 'badge-warning';
      case 'cancelled': return 'badge-cancelled';
      default: return '';
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Profit Reports</h1>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <button 
            className={`filter-btn ${period === 'day' ? 'active' : ''}`}
            onClick={() => setPeriod('day')}
          >
            Daily
          </button>
          <button 
            className={`filter-btn ${period === 'month' ? 'active' : ''}`}
            onClick={() => setPeriod('month')}
          >
            Monthly
          </button>
          <button 
            className={`filter-btn ${period === 'year' ? 'active' : ''}`}
            onClick={() => setPeriod('year')}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card revenue">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-value">{formatCurrency(totalRevenue)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger)' }}>📉</div>
          <div className="stat-value">{formatCurrency(totalCost)}</div>
          <div className="stat-label">Total Cost</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--success)' }}>
          <div className="stat-icon" style={{ background: 'var(--success)' }}>📈</div>
          <div className="stat-value">{formatCurrency(totalProfit)}</div>
          <div className="stat-label">Total Profit</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{avgProfitMargin.toFixed(1)}%</div>
          <div className="stat-label">Profit Margin</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title">Top Profitable Items</h3>
          </div>
          <div style={{ padding: '24px' }}>
            {topProfitableItems.map((item, index) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <span style={{ width: '24px', height: '24px', background: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600' }}>
                  {index + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.sold} sold</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontWeight: '600', color: 'var(--success)' }}>{formatCurrency(item.profit)}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.margin.toFixed(1)}% margin</div>
                </div>
              </div>
            ))}
            {topProfitableItems.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-text">No data available</div>
              </div>
            )}
          </div>
        </div>

        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title">Items with Low Margin</h3>
          </div>
          <div style={{ padding: '24px' }}>
            {lowMarginItems.length > 0 ? lowMarginItems.map((item, index) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <span style={{ width: '24px', height: '24px', background: 'var(--warning)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600' }}>
                  {index + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.sold} sold</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontWeight: '600', color: 'var(--warning)' }}>{item.margin.toFixed(1)}%</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>margin</div>
                </div>
              </div>
            )) : (
              <div className="empty-state">
                <div className="empty-state-text">All items have healthy margins</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="data-card" style={{ marginTop: '24px' }}>
        <div className="data-card-header">
          <h3 className="data-card-title">
            {period === 'day' ? 'Last 7 Days' : period === 'month' ? 'Last 30 Days' : 'Monthly Trend'}
          </h3>
        </div>
        <div style={{ padding: '24px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{period === 'year' ? 'Month' : 'Date'}</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Cost</th>
                <th>Profit</th>
                <th>Margin</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {dailyProfits.map(day => {
                const margin = day.revenue > 0 ? (day.profit / day.revenue) * 100 : 0;
                const displayDate = period === 'year' 
                  ? new Date(day.date).toLocaleDateString('en-US', { month: 'short' })
                  : new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
                return (
                  <tr key={day.date}>
                    <td className="mono">{displayDate}</td>
                    <td>{day.orders}</td>
                    <td className="mono">{formatCurrency(day.revenue)}</td>
                    <td className="mono" style={{ color: 'var(--danger)' }}>{formatCurrency(day.cost)}</td>
                    <td className="mono" style={{ fontWeight: '600', color: day.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {formatCurrency(day.profit)}
                    </td>
                    <td>
                      <span className={`badge ${margin >= 30 ? 'badge-available' : margin >= 15 ? 'badge-pending' : 'badge-cancelled'}`}>
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      {day.orders > 0 && (
                        <button className="action-btn" onClick={() => viewDayDetail(day.date)}>View</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '24px' }}>
        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title">Profit Summary</h3>
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
                <span>Average Daily Profit</span>
                <span className="mono" style={{ fontWeight: '600', color: 'var(--success)' }}>{formatCurrency(avgDailyProfit || totalProfit)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
                <span>Average Order Value</span>
                <span className="mono" style={{ fontWeight: '600' }}>{formatCurrency(filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
                <span>Average Order Cost</span>
                <span className="mono" style={{ fontWeight: '600', color: 'var(--danger)' }}>{formatCurrency(filteredOrders.length > 0 ? totalCost / filteredOrders.length : 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
                <span>Average Profit per Order</span>
                <span className="mono" style={{ fontWeight: '600', color: 'var(--success)' }}>{formatCurrency(filteredOrders.length > 0 ? totalProfit / filteredOrders.length : 0)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title">Cost Breakdown</h3>
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '100%', height: '24px', background: 'var(--bg-elevated)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ width: `${(totalCost / totalRevenue) * 100 || 0}%`, height: '100%', background: 'var(--danger)', borderRadius: '12px' }} />
              </div>
              <span className="mono" style={{ width: '60px' }}>{((totalCost / totalRevenue) * 100 || 0).toFixed(1)}%</span>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>
              {formatCurrency(totalRevenue)} revenue - {formatCurrency(totalCost)} cost = {formatCurrency(totalProfit)} profit
            </div>
          </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      <div className={`modal-overlay ${showDetailModal ? 'active' : ''}`} onClick={() => setShowDetailModal(false)}>
        <div className="modal" style={{ maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">
              Daily Report - {dayDetail && new Date(dayDetail.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
          </div>
          <div className="modal-body">
            {dayDetail && (
              <>
                <div className="stat-grid" style={{ marginBottom: '24px' }}>
                  <div className="stat-card" style={{ background: 'var(--primary)' }}>
                    <div className="stat-value" style={{ fontSize: '28px' }}>{dayDetail.orders.length}</div>
                    <div className="stat-label">Total Orders</div>
                  </div>
                  <div className="stat-card revenue">
                    <div className="stat-value" style={{ fontSize: '28px' }}>{formatCurrency(dayDetail.orders.reduce((s, o) => s + o.total, 0))}</div>
                    <div className="stat-label">Revenue</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value" style={{ fontSize: '28px', color: 'var(--danger)' }}>{formatCurrency(dayDetail.orders.reduce((s, o) => s + calculateOrderCost(o), 0))}</div>
                    <div className="stat-label">Cost</div>
                  </div>
                  <div className="stat-card" style={{ background: 'var(--success)' }}>
                    <div className="stat-value" style={{ fontSize: '28px' }}>{formatCurrency(dayDetail.orders.reduce((s, o) => s + (o.total - calculateOrderCost(o)), 0))}</div>
                    <div className="stat-label">Profit</div>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 className="data-card-title" style={{ marginBottom: '12px' }}>Items Sold</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty Sold</th>
                        <th>Revenue</th>
                        <th>Cost</th>
                        <th>Profit</th>
                        <th>Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayDetail.itemsSold.map(item => {
                        const margin = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0;
                        return (
                          <tr key={item.itemId}>
                            <td>{item.name}</td>
                            <td className="mono">{item.quantity}</td>
                            <td className="mono">{formatCurrency(item.revenue)}</td>
                            <td className="mono" style={{ color: 'var(--danger)' }}>{formatCurrency(item.cost)}</td>
                            <td className="mono" style={{ fontWeight: '600', color: 'var(--success)' }}>{formatCurrency(item.profit)}</td>
                            <td>
                              <span className={`badge ${margin >= 30 ? 'badge-available' : margin >= 15 ? 'badge-pending' : 'badge-cancelled'}`}>
                                {margin.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 className="data-card-title" style={{ marginBottom: '12px' }}>Hourly Breakdown</h3>
                  <div style={{ display: 'flex', gap: '4px', height: '120px', alignItems: 'flex-end' }}>
                    {dayDetail.hourlyData.filter(h => h.orders > 0).map(h => (
                      <div key={h.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div className="mono" style={{ fontSize: '10px' }}>{formatCurrency(h.profit)}</div>
                        <div style={{ 
                          width: '100%', 
                          height: `${Math.max(20, (h.revenue / Math.max(...dayDetail.hourlyData.filter(d => d.orders > 0).map(d => d.revenue))) * 100)}%`, 
                          background: 'var(--primary)', 
                          borderRadius: '4px 4px 0 0',
                          minHeight: '4px'
                        }} />
                        <div className="mono" style={{ fontSize: '10px' }}>{h.hour}:00</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="data-card-title" style={{ marginBottom: '12px' }}>Order Details</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Time</th>
                        <th>Table</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Cost</th>
                        <th>Profit</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayDetail.orders.map(order => {
                        const orderCost = calculateOrderCost(order);
                        const orderProfit = order.total - orderCost;
                        return (
                          <tr key={order.id}>
                            <td className="mono">{order.id}</td>
                            <td className="mono">{new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>#{order.tableNumber}</td>
                            <td>
                              <div style={{ fontSize: '12px' }}>
                                {order.items.map((item, idx) => (
                                  <div key={idx}>{item.name} x{item.quantity}</div>
                                ))}
                              </div>
                            </td>
                            <td className="mono" style={{ fontWeight: '600' }}>{formatCurrency(order.total)}</td>
                            <td className="mono" style={{ color: 'var(--danger)' }}>{formatCurrency(orderCost)}</td>
                            <td className="mono" style={{ fontWeight: '600', color: 'var(--success)' }}>{formatCurrency(orderProfit)}</td>
                            <td>
                              <span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Close</button>
          </div>
        </div>
      </div>
    </>
  );
}