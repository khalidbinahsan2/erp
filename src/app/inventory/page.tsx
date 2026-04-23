'use client';

import { useState, useMemo, useCallback } from 'react';
import { inventoryItems as initialInventory } from '@/lib/mockData';
import { InventoryItem } from '@/types';

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(initialInventory);
  const [view, setView] = useState<'overview' | 'list'>('overview');

  const lowStockItems = useMemo(() => items.filter(i => i.quantity <= i.reorderLevel), [items]);
  const totalValue = useMemo(() => items.reduce((sum, i) => sum + (i.quantity * i.costPerUnit), 0), [items]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Inventory Management</h1>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{items.length}</div>
          <div className="stat-label">Total Items</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--warning)' }}>
          <div className="stat-value">{lowStockItems.length}</div>
          <div className="stat-label">Low Stock Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatCurrency(totalValue)}</div>
          <div className="stat-label">Total Inventory Value</div>
        </div>
      </div>
    </>
  );
}
