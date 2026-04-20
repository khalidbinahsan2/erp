'use client';

import { useState } from 'react';
import { orders, menuItems, staff } from '@/lib/mockData';

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('week');

  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  const totalOrders = completedOrders.length;

  const topItems = menuItems
  .map(item => {
    const sold = orders.reduce((sum, o) => {
      return sum + o.items.filter(i => i.menuItemId === item.id).reduce((s, i) => s + i.quantity, 0);
    }, 0);
    return { ...item, sold };
  })
  .filter(item => item.sold > 0)
  .sort((a, b) => b.sold - a.sold)
  .slice(0, 5);

  const categoryBreakdown = categories.reduce((acc, cat) => {
    const catItems = menuItems.filter(m => m.category === cat);
    const sold = catItems.reduce((sum, item) => {
      const itemSold = orders.reduce((s, o) => {
        return s + o.items.filter(i => i.menuItemId === item.id).reduce((sub, i) => sub + i.quantity, 0);
      }, 0);
      return sum + itemSold;
    }, 0);
    if (sold > 0) acc[cat] = sold;
    return acc;
  }, {} as Record<string, number>);

  const ordersByStatus = {
    completed: orders.filter(o => o.status === 'completed').length,
    pending: orders.filter(o => o.status === 'pending').length,
    in_progress: orders.filter(o => o.status === 'in_progress').length,
    ready: orders.filter(o => o.status === 'ready').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <button className={`filter-btn ${dateRange === 'today' ? 'active' : ''}`} onClick={() => setDateRange('today')}>Today</button>
          <button className={`filter-btn ${dateRange === 'week' ? 'active' : ''}`} onClick={() => setDateRange('week')}>This Week</button>
          <button className={`filter-btn ${dateRange === 'month' ? 'active' : ''}`} onClick={() => setDateRange('month')}>This Month</button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card revenue">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-value">{formatCurrency(totalRevenue)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card orders">
          <div className="stat-icon orders">📋</div>
          <div className="stat-value">{totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orders">📊</div>
          <div className="stat-value">{formatCurrency(avgOrderValue)}</div>
          <div className="stat-label">Avg Order Value</div>
        </div>
        <div className="stat-card tables">
          <div className="stat-icon tables">⏱️</div>
          <div className="stat-value">18 min</div>
          <div className="stat-label">Avg Prep Time</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title">Top Selling Items</h3>
          </div>
          <div style={{ padding: '24px' }}>
            {topItems.map((item, index) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <span style={{ width: '24px', height: '24px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600' }}>
                  {index + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.category}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontWeight: '600' }}>{item.sold}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>sold</div>
                </div>
              </div>
            ))}
            {topItems.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-text">No items sold yet</div>
              </div>
            )}
          </div>
        </div>

        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title"> Orders by Status</h3>
          </div>
          <div style={{ padding: '24px' }}>
            {Object.entries(ordersByStatus).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span className={`badge badge-${status}`}>{status.replace('_', ' ')}</span>
                <div style={{ flex: 1, height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(count / orders.length) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                </div>
                <span className="mono" style={{ fontSize: '14px' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '24px' }}>
        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title">Category Breakdown</h3>
          </div>
          <div style={{ padding: '24px' }}>
            {Object.entries(categoryBreakdown).map(([category, count]) => (
              <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ width: '80px', fontSize: '14px' }}>{category}</span>
                <div style={{ flex: 1, height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(count / Object.values(categoryBreakdown).reduce((a, b) => a + b, 0)) * 100}%`, height: '100%', background: 'var(--secondary)', borderRadius: '4px' }} />
                </div>
                <span className="mono" style={{ fontSize: '14px' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title">Staff Performance</h3>
          </div>
          <div style={{ padding: '24px' }}>
            {staff.filter(s => s.role === 'Server' && s.status === 'active').map(member => (
              <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>{member.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{member.role}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontWeight: '600' }}>
                    {15}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>orders handled</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const categories = ['Appetizers', 'Main Courses', 'Desserts', 'Beverages'];