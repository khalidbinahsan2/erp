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
}

function getDailyProfits(days: number): DailyProfit[] {
  const profits: Record<string, DailyProfit> = {};
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    profits[dateStr] = { date: dateStr, revenue: 0, cost: 0, profit: 0, orders: 0 };
  }

  orders.filter(o => o.status === 'completed').forEach(order => {
    const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
    if (profits[dateStr]) {
      const orderCost = calculateOrderCost(order);
      profits[dateStr].revenue += order.total;
      profits[dateStr].cost += orderCost;
      profits[dateStr].profit += (order.total - orderCost);
      profits[dateStr].orders += 1;
    }
  });

  return Object.values(profits).sort((a, b) => a.date.localeCompare(b.date));
}

export default function ProfitsPage() {
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('day');

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
              </tr>
            </thead>
            <tbody>
              {dailyProfits.map(day => {
                const margin = day.revenue > 0 ? (day.profit / day.revenue) * 100 : 0;
                const displayDate = period === 'year' 
                  ? new Date(day.date).toLocaleDateString('en-US', { month: 'short' })
                  : new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    </>
  );
}