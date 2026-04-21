'use client';

import { useState } from 'react';
import { orders, menuItems, inventoryItems, menuItemRecipes } from '@/lib/mockData';
import { InventoryItem } from '@/types';

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

interface InventoryUsage {
  itemId: string;
  itemName: string;
  unit: string;
  quantityUsed: number;
  cost: number;
  value: number;
}

interface MonthlyInventory {
  month: string;
  year: number;
  items: InventoryUsage[];
  totalQuantity: number;
  totalCost: number;
  totalValue: number;
}

interface YearlyInventory {
  year: number;
  items: InventoryUsage[];
  totalQuantity: number;
  totalCost: number;
  totalValue: number;
  monthlyBreakdown: { month: string; quantity: number; cost: number }[];
}

function calculateInventoryUsage(orderItems: typeof orders[0]['items']): InventoryUsage[] {
  const itemsMap: Record<string, { itemName: string; unit: string; quantity: number; costPerUnit: number; quantityUsed: number }> = {};

  orderItems.forEach(orderItem => {
    const recipe = menuItemRecipes.find(r => r.menuItemId === orderItem.menuItemId);
    if (!recipe) return;

    recipe.ingredients.forEach(ing => {
      const invItem = inventoryItems.find(i => i.id === ing.inventoryItemId);
      if (!invItem) return;

      if (!itemsMap[ing.inventoryItemId]) {
        itemsMap[ing.inventoryItemId] = {
          itemName: invItem.name,
          unit: invItem.unit,
          costPerUnit: invItem.costPerUnit,
          quantity: 0,
          quantityUsed: 0
        };
      }
      itemsMap[ing.inventoryItemId].quantityUsed += ing.quantity * orderItem.quantity;
      itemsMap[ing.inventoryItemId].quantity = itemsMap[ing.inventoryItemId].quantityUsed;
    });
  });

  return Object.entries(itemsMap).map(([itemId, data]) => ({
    itemId,
    itemName: data.itemName,
    unit: data.unit,
    quantityUsed: data.quantityUsed,
    cost: data.costPerUnit,
    value: data.quantityUsed * data.costPerUnit
  }));
}

function getMonthlyInventory(year: number): MonthlyInventory[] {
  const months: MonthlyInventory[] = [];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  for (let month = 0; month < 12; month++) {
    const monthOrders = orders.filter(o => {
      const date = new Date(o.createdAt);
      return date.getFullYear() === year && date.getMonth() === month && o.status === 'completed';
    });

    const allUsage: InventoryUsage[] = [];
    monthOrders.forEach(order => {
      const usage = calculateInventoryUsage(order.items);
      usage.forEach(u => {
        const existing = allUsage.find(e => e.itemId === u.itemId);
        if (existing) {
          existing.quantityUsed += u.quantityUsed;
          existing.value += u.value;
        } else {
          allUsage.push({ ...u });
        }
      });
    });

    months.push({
      month: monthNames[month],
      year,
      items: allUsage,
      totalQuantity: allUsage.reduce((s, i) => s + i.quantityUsed, 0),
      totalCost: allUsage.reduce((s, i) => s + i.cost, 0),
      totalValue: allUsage.reduce((s, i) => s + i.value, 0)
    });
  }

  return months;
}

function getYearlyInventory(): YearlyInventory[] {
  const years: YearlyInventory[] = [];
  const uniqueYears = [...new Set(orders.map(o => new Date(o.createdAt).getFullYear()))].sort();

  uniqueYears.forEach(year => {
    const yearOrders = orders.filter(o => {
      const date = new Date(o.createdAt);
      return date.getFullYear() === year && o.status === 'completed';
    });

    const itemsMap: Record<string, InventoryUsage> = {};
    const monthlyData: Record<string, { month: string; quantity: number; cost: number }> = {};

    yearOrders.forEach(order => {
      const month = new Date(order.createdAt).getMonth();
      const monthName = new Date(order.createdAt).toLocaleString('en-US', { month: 'short' });

      if (!monthlyData[month]) {
        monthlyData[month] = { month: monthName, quantity: 0, cost: 0 };
      }

      const usage = calculateInventoryUsage(order.items);
      usage.forEach(u => {
        if (!itemsMap[u.itemId]) {
          itemsMap[u.itemId] = { ...u };
        } else {
          itemsMap[u.itemId].quantityUsed += u.quantityUsed;
          itemsMap[u.itemId].value += u.value;
        }
        monthlyData[month].quantity += u.quantityUsed;
      });
    });

    years.push({
      year,
      items: Object.values(itemsMap),
      totalQuantity: Object.values(itemsMap).reduce((s, i) => s + i.quantityUsed, 0),
      totalCost: Object.values(itemsMap).reduce((s, i) => s + i.cost, 0),
      totalValue: Object.values(itemsMap).reduce((s, i) => s + i.value, 0),
      monthlyBreakdown: Object.values(monthlyData)
    });
  });

  return years;
}

export default function InventoryAnalyticsPage() {
  const [view, setView] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState(3);

  const monthlyData = getMonthlyInventory(selectedYear);
  const yearlyData = getYearlyInventory();

  const currentMonthData = monthlyData[selectedMonth];
  const currentYearData = yearlyData.find(y => y.year === selectedYear);

  const topUsedMonth = currentMonthData?.items.sort((a, b) => b.quantityUsed - a.quantityUsed).slice(0, 5) || [];
  const topUsedYear = currentYearData?.items.sort((a, b) => b.quantityUsed - a.quantityUsed).slice(0, 5) || [];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Inventory Analytics</h1>
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
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentMonthData?.items.length || 0}</div>
              <div className="stat-label">Items Used</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentMonthData?.totalQuantity.toFixed(1) || 0}</div>
              <div className="stat-label">Total Units</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--danger)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{formatCurrency(currentMonthData?.totalValue || 0)}</div>
              <div className="stat-label">Cost Value Used</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '32px' }}>${currentMonthData?.totalCost.toFixed(2) || '0.00'}</div>
              <div className="stat-label">Avg Cost/Unit</div>
            </div>
          </div>

          <div className="grid-2">
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Top Used Items</h3>
              </div>
              <div style={{ padding: '24px' }}>
                {topUsedMonth.map((item, index) => (
                  <div key={item.itemId} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <span style={{ width: '28px', height: '28px', background: 'var(--danger)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'white' }}>
                      {index + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>{item.itemName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cost: {formatCurrency(item.cost)}/{item.unit}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono" style={{ fontWeight: '600', fontSize: '18px' }}>{item.quantityUsed.toFixed(2)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.unit}</div>
                    </div>
                  </div>
                ))}
                {topUsedMonth.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-text">No usage data</div>
                  </div>
                )}
              </div>
            </div>

            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">All Items Used</h3>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty Used</th>
                      <th>Unit Cost</th>
                      <th>Value</th>
                      <th>% Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMonthData?.items.sort((a, b) => b.quantityUsed - a.quantityUsed).map(item => (
                      <tr key={item.itemId}>
                        <td>{item.itemName}</td>
                        <td className="mono">{item.quantityUsed.toFixed(2)} {item.unit}</td>
                        <td className="mono">{formatCurrency(item.cost)}</td>
                        <td className="mono" style={{ color: 'var(--danger)' }}>{formatCurrency(item.value)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${(item.quantityUsed / (currentMonthData?.totalQuantity || 1)) * 100}%`, height: '100%', background: 'var(--danger)', borderRadius: '3px' }} />
                            </div>
                            <span className="mono" style={{ fontSize: '12px' }}>{((item.quantityUsed / (currentMonthData?.totalQuantity || 1)) * 100).toFixed(1)}%</span>
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
              <div style={{ display: 'flex', gap: '8px', height: '180px', alignItems: 'flex-end' }}>
                {monthlyData.map((month, idx) => (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '100%', 
                      height: `${Math.max(4, (month.totalValue / Math.max(...monthlyData.map(m => m.totalValue))) * 160)}px`, 
                      background: idx === selectedMonth ? 'var(--danger)' : 'var(--bg-elevated)',
                      borderRadius: '4px 4px 0 0',
                      minHeight: '4px',
                      cursor: 'pointer'
                    }} 
                    onClick={() => setSelectedMonth(idx)}
                    />
                    <span className="mono" style={{ fontSize: '10px', color: idx === selectedMonth ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {month.month.slice(0, 3)}
                    </span>
                    <span className="mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                      {month.totalQuantity.toFixed(0)}
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
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentYearData?.items.length || 0}</div>
              <div className="stat-label">Items Used</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentYearData?.totalQuantity.toFixed(0) || 0}</div>
              <div className="stat-label">Total Units</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--danger)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{formatCurrency(currentYearData?.totalValue || 0)}</div>
              <div className="stat-label">Cost Value Used</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '32px' }}>{formatCurrency((currentYearData?.totalValue || 0) / 12)}</div>
              <div className="stat-label">Avg/Month</div>
            </div>
          </div>

          <div className="grid-2">
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Top Used Items - {selectedYear}</h3>
              </div>
              <div style={{ padding: '24px' }}>
                {topUsedYear.map((item, index) => (
                  <div key={item.itemId} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <span style={{ width: '28px', height: '28px', background: 'var(--danger)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'white' }}>
                      {index + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>{item.itemName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cost: {formatCurrency(item.cost)}/{item.unit}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono" style={{ fontWeight: '600', fontSize: '18px' }}>{item.quantityUsed.toFixed(1)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.unit}</div>
                    </div>
                  </div>
                ))}
                {topUsedYear.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-text">No usage data</div>
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
                        width: `${(month.cost / (currentYearData?.totalValue || 1)) * 100}%`, 
                        height: '100%', 
                        background: 'var(--danger)', 
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '8px'
                      }}>
                        <span className="mono" style={{ fontSize: '11px', color: 'white' }}>{month.quantity.toFixed(0)} units</span>
                      </div>
                    </div>
                    <span className="mono" style={{ width: '80px', textAlign: 'right', fontSize: '13px', color: 'var(--danger)' }}>{formatCurrency(month.cost)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="data-card" style={{ marginTop: '24px' }}>
            <div className="data-card-header">
              <h3 className="data-card-title">All Items Used - {selectedYear}</h3>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty Used</th>
                    <th>Unit Cost</th>
                    <th>Total Value</th>
                    <th>% Used</th>
                    <th>Avg/Month</th>
                  </tr>
                </thead>
                <tbody>
                  {currentYearData?.items.sort((a, b) => b.quantityUsed - a.quantityUsed).map(item => (
                    <tr key={item.itemId}>
                      <td>{item.itemName}</td>
                      <td className="mono">{item.quantityUsed.toFixed(2)} {item.unit}</td>
                      <td className="mono">{formatCurrency(item.cost)}</td>
                      <td className="mono" style={{ color: 'var(--danger)', fontWeight: '600' }}>{formatCurrency(item.value)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${(item.quantityUsed / (currentYearData?.totalQuantity || 1)) * 100}%`, height: '100%', background: 'var(--danger)', borderRadius: '3px' }} />
                          </div>
                          <span className="mono" style={{ fontSize: '12px' }}>{((item.quantityUsed / (currentYearData?.totalQuantity || 1)) * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="mono">{(item.quantityUsed / 12).toFixed(2)}</td>
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