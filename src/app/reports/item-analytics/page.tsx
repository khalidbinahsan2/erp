'use client';

import { useState } from 'react';
import { orders, menuItems } from '@/lib/mockData';

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

interface MonthlySales {
  month: string;
  year: number;
  items: { itemId: string; itemName: string; quantity: number; revenue: number }[];
  totalOrders: number;
  totalRevenue: number;
}

interface YearlySales {
  year: number;
  items: { itemId: string; itemName: string; quantity: number; revenue: number }[];
  totalOrders: number;
  totalRevenue: number;
  monthlyBreakdown: { month: string; quantity: number; revenue: number }[];
}

function getMonthlySales(year: number): MonthlySales[] {
  const months: MonthlySales[] = [];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  for (let month = 0; month < 12; month++) {
    const monthOrders = orders.filter(o => {
      const date = new Date(o.createdAt);
      return date.getFullYear() === year && date.getMonth() === month && o.status === 'completed';
    });

    const itemsMap: Record<string, { itemName: string; quantity: number; revenue: number }> = {};

    monthOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemsMap[item.menuItemId]) {
          itemsMap[item.menuItemId] = { itemName: item.name, quantity: 0, revenue: 0 };
        }
        itemsMap[item.menuItemId].quantity += item.quantity;
        itemsMap[item.menuItemId].revenue += item.price * item.quantity;
      });
    });

    months.push({
      month: monthNames[month],
      year,
      items: Object.entries(itemsMap).map(([itemId, data]) => ({ itemId, ...data })),
      totalOrders: monthOrders.length,
      totalRevenue: monthOrders.reduce((sum, o) => sum + o.total, 0)
    });
  }

  return months;
}

function getYearlySales(): YearlySales[] {
  const years: YearlySales[] = [];
  const uniqueYears = [...new Set(orders.map(o => new Date(o.createdAt).getFullYear()))].sort();

  uniqueYears.forEach(year => {
    const yearOrders = orders.filter(o => {
      const date = new Date(o.createdAt);
      return date.getFullYear() === year && o.status === 'completed';
    });

    const itemsMap: Record<string, { itemName: string; quantity: number; revenue: number }> = {};
    const monthlyData: Record<string, { month: string; quantity: number; revenue: number }> = {};

    yearOrders.forEach(order => {
      const month = new Date(order.createdAt).getMonth();
      if (!monthlyData[month]) {
        monthlyData[month] = { month: new Date(order.createdAt).toLocaleString('en-US', { month: 'short' }), quantity: 0, revenue: 0 };
      }

      order.items.forEach(item => {
        if (!itemsMap[item.menuItemId]) {
          itemsMap[item.menuItemId] = { itemName: item.name, quantity: 0, revenue: 0 };
        }
        itemsMap[item.menuItemId].quantity += item.quantity;
        itemsMap[item.menuItemId].revenue += item.price * item.quantity;
        monthlyData[month].quantity += item.quantity;
        monthlyData[month].revenue += item.price * item.quantity;
      });
    });

    years.push({
      year,
      items: Object.entries(itemsMap).map(([itemId, data]) => ({ itemId, ...data })),
      totalOrders: yearOrders.length,
      totalRevenue: yearOrders.reduce((sum, o) => sum + o.total, 0),
      monthlyBreakdown: Object.values(monthlyData)
    });
  });

  return years;
}

export default function ItemAnalyticsPage() {
  const [view, setView] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState(3);

  const monthlyData = getMonthlySales(selectedYear);
  const yearlyData = getYearlySales();

  const currentMonthData = monthlyData[selectedMonth];
  const currentYearData = yearlyData.find(y => y.year === selectedYear);

  const topItemsMonth = currentMonthData?.items.sort((a, b) => b.quantity - a.quantity).slice(0, 5) || [];
  const topItemsYear = currentYearData?.items.sort((a, b) => b.quantity - a.quantity).slice(0, 5) || [];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Item Sales Analytics</h1>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <button 
            className={`filter-btn ${view === 'monthly' ? 'active' : ''}`}
            onClick={() => setView('monthly')}
          >
            Monthly
          </button>
          <button 
            className={`filter-btn ${view === 'yearly' ? 'active' : ''}`}
            onClick={() => setView('yearly')}
          >
            Yearly
          </button>
        </div>
      </div>

      {view === 'monthly' ? (
        <>
          <div className="filter-bar" style={{ marginBottom: '24px' }}>
            <select 
              className="form-select" 
              style={{ width: '150px' }}
              value={selectedYear} 
              onChange={e => setSelectedYear(parseInt(e.target.value))}
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
            </select>
            <select 
              className="form-select" 
              style={{ width: '180px' }}
              value={selectedMonth} 
              onChange={e => setSelectedMonth(parseInt(e.target.value))}
            >
              {monthNames.map((month, idx) => (
                <option key={idx} value={idx}>{month} {selectedYear}</option>
              ))}
            </select>
          </div>

          <div className="stat-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card" style={{ background: 'var(--primary)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentMonthData?.totalOrders || 0}</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-card revenue">
              <div className="stat-value" style={{ fontSize: '32px' }}>{formatCurrency(currentMonthData?.totalRevenue || 0)}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentMonthData?.items.reduce((s, i) => s + i.quantity, 0) || 0}</div>
              <div className="stat-label">Items Sold</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentMonthData?.items.length || 0}</div>
              <div className="stat-label">Unique Items</div>
            </div>
          </div>

          <div className="grid-2">
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Top Selling Items</h3>
              </div>
              <div style={{ padding: '24px' }}>
                {topItemsMonth.map((item, index) => (
                  <div key={item.itemId} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <span style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'white' }}>
                      {index + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>{item.itemName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatCurrency(item.revenue)} revenue</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono" style={{ fontWeight: '600', fontSize: '18px' }}>{item.quantity}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>units</div>
                    </div>
                  </div>
                ))}
                {topItemsMonth.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-text">No sales data</div>
                  </div>
                )}
              </div>
            </div>

            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">All Items Sold</h3>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Revenue</th>
                      <th>% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMonthData?.items.sort((a, b) => b.quantity - a.quantity).map(item => (
                      <tr key={item.itemId}>
                        <td>{item.itemName}</td>
                        <td className="mono">{item.quantity}</td>
                        <td className="mono">{formatCurrency(item.revenue)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${(item.quantity / (currentMonthData?.items.reduce((s, i) => s + i.quantity, 0) || 1)) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                            </div>
                            <span className="mono" style={{ fontSize: '12px' }}>{((item.quantity / (currentMonthData?.items.reduce((s, i) => s + i.quantity, 0) || 1)) * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="data-card" style={{ marginTop: '24px' }}>
            <div className="data-card-header">
              <h3 className="data-card-title">Monthly Trend - {selectedYear}</h3>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', height: '200px', alignItems: 'flex-end' }}>
                {monthlyData.map((month, idx) => (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '100%', 
                      height: `${Math.max(4, (month.totalRevenue / Math.max(...monthlyData.map(m => m.totalRevenue))) * 180)}px`, 
                      background: idx === selectedMonth ? 'var(--primary)' : 'var(--bg-elevated)',
                      borderRadius: '4px 4px 0 0',
                      minHeight: '4px',
                      transition: 'background 0.2s',
                      cursor: 'pointer'
                    }} 
                    onClick={() => setSelectedMonth(idx)}
                    />
                    <span className="mono" style={{ fontSize: '10px', color: idx === selectedMonth ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {month.month.slice(0, 3)}
                    </span>
                    <span className="mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                      {month.totalOrders}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="filter-bar" style={{ marginBottom: '24px' }}>
            <select 
              className="form-select" 
              style={{ width: '150px' }}
              value={selectedYear} 
              onChange={e => setSelectedYear(parseInt(e.target.value))}
            >
              {yearlyData.map(y => (
                <option key={y.year} value={y.year}>{y.year}</option>
              ))}
            </select>
          </div>

          <div className="stat-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card" style={{ background: 'var(--primary)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentYearData?.totalOrders || 0}</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-card revenue">
              <div className="stat-value" style={{ fontSize: '32px' }}>{formatCurrency(currentYearData?.totalRevenue || 0)}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentYearData?.items.reduce((s, i) => s + i.quantity, 0) || 0}</div>
              <div className="stat-label">Items Sold</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentYearData?.items.length || 0}</div>
              <div className="stat-label">Unique Items</div>
            </div>
          </div>

          <div className="grid-2">
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Top Selling Items - {selectedYear}</h3>
              </div>
              <div style={{ padding: '24px' }}>
                {topItemsYear.map((item, index) => (
                  <div key={item.itemId} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <span style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'white' }}>
                      {index + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>{item.itemName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatCurrency(item.revenue)} revenue</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono" style={{ fontWeight: '600', fontSize: '18px' }}>{item.quantity}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>units</div>
                    </div>
                  </div>
                ))}
                {topItemsYear.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-text">No sales data</div>
                  </div>
                )}
              </div>
            </div>

            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Monthly Breakdown - {selectedYear}</h3>
              </div>
              <div style={{ padding: '24px' }}>
                {currentYearData?.monthlyBreakdown.map((month, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                    <span style={{ width: '60px', fontSize: '14px' }}>{month.month}</span>
                    <div style={{ flex: 1, height: '24px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ 
                        width: `${(month.revenue / (currentYearData?.totalRevenue || 1)) * 100}%`, 
                        height: '100%', 
                        background: 'var(--primary)', 
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '8px'
                      }}>
                        <span className="mono" style={{ fontSize: '11px', color: 'white' }}>{month.quantity} items</span>
                      </div>
                    </div>
                    <span className="mono" style={{ width: '80px', textAlign: 'right', fontSize: '13px' }}>{formatCurrency(month.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="data-card" style={{ marginTop: '24px' }}>
            <div className="data-card-header">
              <h3 className="data-card-title">All Items Sold - {selectedYear}</h3>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty Sold</th>
                    <th>Revenue</th>
                    <th>% of Total</th>
                    <th>Avg/Month</th>
                  </tr>
                </thead>
                <tbody>
                  {currentYearData?.items.sort((a, b) => b.quantity - a.quantity).map(item => (
                    <tr key={item.itemId}>
                      <td>{item.itemName}</td>
                      <td className="mono">{item.quantity}</td>
                      <td className="mono">{formatCurrency(item.revenue)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${(item.quantity / (currentYearData?.items.reduce((s, i) => s + i.quantity, 0) || 1)) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                          </div>
                          <span className="mono" style={{ fontSize: '12px' }}>{((item.quantity / (currentYearData?.items.reduce((s, i) => s + i.quantity, 0) || 1)) * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="mono">{(item.quantity / 12).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}