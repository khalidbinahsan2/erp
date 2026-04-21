'use client';

import { useState } from 'react';
import { inventoryItems as initialInventory } from '@/lib/mockData';
import { InventoryItem } from '@/types';

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

interface OrderTimelineEvent {
  date: string;
  status: 'pending' | 'ordered' | 'received' | 'used' | 'cancelled';
  notes?: string;
}

interface PurchaseOrder {
  id: string;
  items: { itemId: string; name: string; quantity: number; cost: number }[];
  total: number;
  status: 'pending' | 'ordered' | 'received' | 'used' | 'cancelled';
  supplier: string;
  createdAt: string;
  notes: string;
  timeline?: OrderTimelineEvent[];
}

interface PurchasedItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  cost: number;
  totalCost: number;
}

interface MonthlyPurchase {
  month: string;
  year: number;
  items: PurchasedItem[];
  totalQuantity: number;
  totalCost: number;
}

interface YearlyPurchase {
  year: number;
  items: PurchasedItem[];
  totalQuantity: number;
  totalCost: number;
  monthlyBreakdown: { month: string; quantity: number; cost: number }[];
}

export default function PurchaseOrdersPage() {
  const [items, setItems] = useState<InventoryItem[]>(initialInventory);
  const [view, setView] = useState<'orders' | 'monthly' | 'yearly'>('orders');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    // April 2026
    { id: 'PO-001', items: [{ itemId: '1', name: 'Arborio Rice', quantity: 20, cost: 4.50 }], total: 90, status: 'received', supplier: 'Fresh Foods Co', createdAt: '2026-04-15', notes: 'Weekly order' },
    { id: 'PO-002', items: [{ itemId: '2', name: 'Atlantic Salmon', quantity: 10, cost: 18.00 }], total: 180, status: 'received', supplier: 'Ocean Catch', createdAt: '2026-04-10', notes: '' },
    { id: 'PO-003', items: [{ itemId: '5', name: 'Olive Oil', quantity: 15, cost: 8.00 }], total: 120, status: 'received', supplier: 'Green Valley Farms', createdAt: '2026-04-08', notes: 'Urgent' },
    { id: 'PO-004', items: [{ itemId: '12', name: 'Lettuce', quantity: 8, cost: 2.00 }], total: 16, status: 'received', supplier: 'Fresh Farms', createdAt: '2026-04-05', notes: '' },
    { id: 'PO-005', items: [{ itemId: '13', name: 'Tomatoes', quantity: 10, cost: 3.00 }], total: 30, status: 'received', supplier: 'Fresh Farms', createdAt: '2026-04-05', notes: '' },
    { id: 'PO-006', items: [{ itemId: '6', name: 'Ramen Noodles', quantity: 20, cost: 3.50 }], total: 70, status: 'pending', supplier: 'Asian Supplies Co', createdAt: '2026-04-18', notes: 'Monthly restock' },
    // March 2026
    { id: 'PO-007', items: [{ itemId: '1', name: 'Arborio Rice', quantity: 25, cost: 4.50 }], total: 112.50, status: 'received', supplier: 'Fresh Foods Co', createdAt: '2026-03-20', notes: 'Weekly order' },
    { id: 'PO-008', items: [{ itemId: '4', name: 'Parmesan Cheese', quantity: 5, cost: 22.00 }], total: 110, status: 'received', supplier: 'Italian Imports', createdAt: '2026-03-15', notes: '' },
    { id: 'PO-009', items: [{ itemId: '3', name: 'Wagyu Beef', quantity: 8, cost: 45.00 }], total: 360, status: 'received', supplier: 'Prime Meats', createdAt: '2026-03-12', notes: 'Premium beef' },
    { id: 'PO-010', items: [{ itemId: '14', name: 'Lemon', quantity: 30, cost: 0.40 }], total: 12, status: 'received', supplier: 'Fresh Farms', createdAt: '2026-03-10', notes: '' },
    { id: 'PO-011', items: [{ itemId: '15', name: 'Mint Leaves', quantity: 2, cost: 15.00 }], total: 30, status: 'received', supplier: 'Herb Garden', createdAt: '2026-03-08', notes: '' },
    // February 2026
    { id: 'PO-012', items: [{ itemId: '2', name: 'Atlantic Salmon', quantity: 12, cost: 18.00 }], total: 216, status: 'received', supplier: 'Ocean Catch', createdAt: '2026-02-25', notes: '' },
    { id: 'PO-013', items: [{ itemId: '5', name: 'Olive Oil', quantity: 20, cost: 8.00 }], total: 160, status: 'received', supplier: 'Green Valley Farms', createdAt: '2026-02-18', notes: 'Bulk order' },
    { id: 'PO-014', items: [{ itemId: '7', name: 'Napkins', quantity: 500, cost: 0.10 }], total: 50, status: 'received', supplier: 'Restaurant Supply', createdAt: '2026-02-10', notes: '' },
    { id: 'PO-015', items: [{ itemId: '8', name: 'To-Go Containers', quantity: 200, cost: 0.75 }], total: 150, status: 'received', supplier: 'Restaurant Supply', createdAt: '2026-02-10', notes: '' },
    // January 2026
    { id: 'PO-016', items: [{ itemId: '1', name: 'Arborio Rice', quantity: 30, cost: 4.50 }], total: 135, status: 'received', supplier: 'Fresh Foods Co', createdAt: '2026-01-25', notes: 'Monthly restock' },
    { id: 'PO-017', items: [{ itemId: '6', name: 'Ramen Noodles', quantity: 25, cost: 3.50 }], total: 87.50, status: 'received', supplier: 'Asian Supplies Co', createdAt: '2026-01-20', notes: '' },
    { id: 'PO-018', items: [{ itemId: '11', name: 'Black Truffle', quantity: 1, cost: 200.00 }], total: 200, status: 'received', supplier: 'Italian Imports', createdAt: '2026-01-15', notes: 'Premium ingredient' },
    { id: 'PO-019', items: [{ itemId: '12', name: 'Lettuce', quantity: 10, cost: 2.00 }], total: 20, status: 'received', supplier: 'Fresh Farms', createdAt: '2026-01-10', notes: '' },
    { id: 'PO-020', items: [{ itemId: '13', name: 'Tomatoes', quantity: 15, cost: 3.00 }], total: 45, status: 'received', supplier: 'Fresh Farms', createdAt: '2026-01-10', notes: '' },
    // 2025 orders
    { id: 'PO-021', items: [{ itemId: '1', name: 'Arborio Rice', quantity: 100, cost: 4.50 }], total: 450, status: 'received', supplier: 'Fresh Foods Co', createdAt: '2025-12-20', notes: 'Year end stock' },
    { id: 'PO-022', items: [{ itemId: '2', name: 'Atlantic Salmon', quantity: 50, cost: 18.00 }], total: 900, status: 'received', supplier: 'Ocean Catch', createdAt: '2025-12-15', notes: 'Holiday stock' },
    { id: 'PO-023', items: [{ itemId: '3', name: 'Wagyu Beef', quantity: 30, cost: 45.00 }], total: 1350, status: 'received', supplier: 'Prime Meats', createdAt: '2025-12-10', notes: '' },
    { id: 'PO-024', items: [{ itemId: '4', name: 'Parmesan Cheese', quantity: 20, cost: 22.00 }], total: 440, status: 'received', supplier: 'Italian Imports', createdAt: '2025-11-20', notes: '' },
    { id: 'PO-025', items: [{ itemId: '5', name: 'Olive Oil', quantity: 50, cost: 8.00 }], total: 400, status: 'received', supplier: 'Green Valley Farms', createdAt: '2025-11-15', notes: 'Bulk order' },
    { id: 'PO-026', items: [{ itemId: '6', name: 'Ramen Noodles', quantity: 80, cost: 3.50 }], total: 280, status: 'received', supplier: 'Asian Supplies Co', createdAt: '2025-10-25', notes: '' },
    { id: 'PO-027', items: [{ itemId: '7', name: 'Napkins', quantity: 1000, cost: 0.10 }], total: 100, status: 'received', supplier: 'Restaurant Supply', createdAt: '2025-10-15', notes: 'Quarterly stock' },
    { id: 'PO-028', items: [{ itemId: '8', name: 'To-Go Containers', quantity: 500, cost: 0.75 }], total: 375, status: 'received', supplier: 'Restaurant Supply', createdAt: '2025-10-15', notes: '' },
    { id: 'PO-029', items: [{ itemId: '14', name: 'Lemon', quantity: 100, cost: 0.40 }], total: 40, status: 'received', supplier: 'Fresh Farms', createdAt: '2025-09-20', notes: '' },
    { id: 'PO-030', items: [{ itemId: '15', name: 'Mint Leaves', quantity: 5, cost: 15.00 }], total: 75, status: 'received', supplier: 'Herb Garden', createdAt: '2025-09-15', notes: '' },
  ]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);

  const suppliers = ['Fresh Foods Co', 'Ocean Catch', 'Prime Meats', 'Green Valley Farms', 'Beverage Distributors', 'Asian Supplies Co', 'Italian Imports', 'Fresh Farms', 'Restaurant Supply', 'Herb Garden'];

  const [newOrder, setNewOrder] = useState({
    supplier: '',
    items: [] as { itemId: string; name: string; quantity: number; cost: number }[],
    notes: ''
  });
  const [selectedItem, setSelectedItem] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemCost, setItemCost] = useState(0);

  const addItemToOrder = () => {
    if (!selectedItem || itemQty <= 0) return;
    const invItem = items.find(i => i.id === selectedItem);
    if (!invItem) return;
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { itemId: selectedItem, name: invItem.name, quantity: itemQty, cost: itemCost || invItem.costPerUnit }]
    });
    setSelectedItem('');
    setItemQty(1);
    setItemCost(0);
  };

  const removeItem = (idx: number) => {
    setNewOrder({ ...newOrder, items: newOrder.items.filter((_, i) => i !== idx) });
  };

  const createOrder = () => {
    if (!newOrder.supplier || newOrder.items.length === 0) return;
    const total = newOrder.items.reduce((sum, item) => sum + item.quantity * item.cost, 0);
    const today = new Date().toISOString().split('T')[0];
    const order: PurchaseOrder = {
      id: `PO-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      items: newOrder.items,
      total,
      status: 'pending',
      supplier: newOrder.supplier,
      createdAt: today,
      notes: newOrder.notes,
      timeline: [{ date: today, status: 'pending', notes: newOrder.notes || 'Order created' }]
    };
    setPurchaseOrders([order, ...purchaseOrders]);
    setShowCreateModal(false);
    setNewOrder({ supplier: '', items: [], notes: '' });
  };

  // Calculate monthly purchases
  const getMonthlyPurchases = (year: number): MonthlyPurchase[] => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const result: MonthlyPurchase[] = [];

    for (let month = 0; month < 12; month++) {
      const monthOrders = purchaseOrders.filter(o => {
        const [oYear, oMonth] = o.createdAt.split('-').map(Number);
        return oYear === year && oMonth === month + 1 && o.status === 'received';
      });

      const itemsMap: Record<string, PurchasedItem> = {};
      let totalQty = 0;

      monthOrders.forEach(order => {
        order.items.forEach(item => {
          const invItem = items.find(i => i.id === item.itemId);
          if (!itemsMap[item.itemId]) {
            itemsMap[item.itemId] = {
              itemId: item.itemId,
              itemName: item.name,
              quantity: 0,
              unit: invItem?.unit || 'pieces',
              cost: item.cost,
              totalCost: 0
            };
          }
          itemsMap[item.itemId].quantity += item.quantity;
          itemsMap[item.itemId].totalCost += item.quantity * item.cost;
          totalQty += item.quantity;
        });
      });

      result.push({
        month: months[month],
        year,
        items: Object.values(itemsMap),
        totalQuantity: totalQty,
        totalCost: Object.values(itemsMap).reduce((s, i) => s + i.totalCost, 0)
      });
    }

    return result;
  };

  // Calculate yearly purchases
  const getYearlyPurchases = (): YearlyPurchase[] => {
    const years = [...new Set(purchaseOrders.map(o => parseInt(o.createdAt.split('-')[0])))].sort();
    const result: YearlyPurchase[] = [];

    years.forEach(year => {
      const yearOrders = purchaseOrders.filter(o => {
        const [oYear] = o.createdAt.split('-').map(Number);
        return oYear === year && o.status === 'received';
      });

      const itemsMap: Record<string, PurchasedItem> = {};
      const monthlyData: Record<number, { month: string; quantity: number; cost: number }> = {};

      yearOrders.forEach(order => {
        const month = parseInt(order.createdAt.split('-')[1]) - 1;
        const monthName = new Date(year, month).toLocaleString('en-US', { month: 'short' });
        
        if (!monthlyData[month]) {
          monthlyData[month] = { month: monthName, quantity: 0, cost: 0 };
        }

        order.items.forEach(item => {
          if (!itemsMap[item.itemId]) {
            const invItem = items.find(i => i.id === item.itemId);
            itemsMap[item.itemId] = {
              itemId: item.itemId,
              itemName: item.name,
              quantity: 0,
              unit: invItem?.unit || 'pieces',
              cost: item.cost,
              totalCost: 0
            };
          }
          itemsMap[item.itemId].quantity += item.quantity;
          itemsMap[item.itemId].totalCost += item.quantity * item.cost;
          monthlyData[month].quantity += item.quantity;
          monthlyData[month].cost += item.quantity * item.cost;
        });
      });

      result.push({
        year,
        items: Object.values(itemsMap),
        totalQuantity: Object.values(itemsMap).reduce((s, i) => s + i.quantity, 0),
        totalCost: Object.values(itemsMap).reduce((s, i) => s + i.totalCost, 0),
        monthlyBreakdown: Object.values(monthlyData)
      });
    });

    return result;
  };

  const monthlyData = getMonthlyPurchases(selectedYear);
  const yearlyData = getYearlyPurchases();
  const currentMonthData = monthlyData[selectedMonth];
  const currentYearData = yearlyData.find(y => y.year === selectedYear);

  const topPurchasedMonth = currentMonthData?.items.sort((a, b) => b.quantity - a.quantity).slice(0, 5) || [];
  const topPurchasedYear = currentYearData?.items.sort((a, b) => b.quantity - a.quantity).slice(0, 5) || [];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const filteredOrders = purchaseOrders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSupplier = supplierFilter === 'all' || o.supplier === supplierFilter;
    const matchesSearch = !searchTerm || o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSupplier && matchesSearch;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pendingTotal = purchaseOrders.filter(o => o.status === 'pending').reduce((sum, o) => sum + o.total, 0);
  const orderedTotal = purchaseOrders.filter(o => o.status === 'ordered').reduce((sum, o) => sum + o.total, 0);
  const receivedTotal = purchaseOrders.filter(o => o.status === 'received').reduce((sum, o) => sum + o.total, 0);
  const usedTotal = purchaseOrders.filter(o => o.status === 'used').reduce((sum, o) => sum + o.total, 0);
  const cancelledTotal = purchaseOrders.filter(o => o.status === 'cancelled').reduce((sum, o) => sum + o.total, 0);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Purchase Orders & Analytics</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create Order
        </button>
      </div>

      <div className="filter-bar" style={{ marginBottom: '24px' }}>
        <button className={`filter-btn ${view === 'orders' ? 'active' : ''}`} onClick={() => setView('orders')}>Orders</button>
        <button className={`filter-btn ${view === 'monthly' ? 'active' : ''}`} onClick={() => setView('monthly')}>Monthly</button>
        <button className={`filter-btn ${view === 'yearly' ? 'active' : ''}`} onClick={() => setView('yearly')}>Yearly</button>
      </div>

      {view === 'orders' && (
        <>
            <div className="stat-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(5, 1fr)' }}>
            <div className="stat-card" style={{ background: '#f59e0b' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{purchaseOrders.filter(o => o.status === 'pending').length}</div>
              <div className="stat-label">Pending</div>
              <div className="mono" style={{ fontSize: '14px', marginTop: '8px' }}>{formatCurrency(pendingTotal)}</div>
            </div>
            <div className="stat-card" style={{ background: '#f97316' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{purchaseOrders.filter(o => o.status === 'ordered').length}</div>
              <div className="stat-label">Ordered</div>
              <div className="mono" style={{ fontSize: '14px', marginTop: '8px' }}>{formatCurrency(orderedTotal)}</div>
            </div>
            <div className="stat-card" style={{ background: '#171717', border: '1px solid #444' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{purchaseOrders.filter(o => o.status === 'received').length}</div>
              <div className="stat-label">Received</div>
              <div className="mono" style={{ fontSize: '14px', marginTop: '8px' }}>{formatCurrency(receivedTotal)}</div>
            </div>
            <div className="stat-card" style={{ background: '#f59e0b' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{purchaseOrders.filter(o => o.status === 'used').length}</div>
              <div className="stat-label">Used</div>
              <div className="mono" style={{ fontSize: '14px', marginTop: '8px' }}>{formatCurrency(usedTotal)}</div>
            </div>
            <div className="stat-card" style={{ background: '#ef4444' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{purchaseOrders.filter(o => o.status === 'cancelled').length}</div>
              <div className="stat-label">Cancelled</div>
              <div className="mono" style={{ fontSize: '14px', marginTop: '8px' }}>{formatCurrency(cancelledTotal)}</div>
            </div>
          </div>

          <div className="filter-bar">
            <input className="form-input" style={{ width: '250px' }} placeholder="Search orders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <select className="form-select" style={{ width: '150px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="ordered">Ordered</option>
              <option value="received">Received</option>
              <option value="used">Used</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select className="form-select" style={{ width: '180px' }} value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)}>
              <option value="all">All Suppliers</option>
              {suppliers.map(s => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>

          <div className="data-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td className="mono" style={{ fontWeight: '600' }}>{order.id}</td>
                    <td>{order.createdAt}</td>
                    <td>{order.supplier}</td>
                    <td>
                      <div style={{ fontSize: '12px' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx}>{item.name} x{item.quantity}</div>
                        ))}
                      </div>
                    </td>
                    <td className="mono" style={{ fontWeight: '600' }}>{formatCurrency(order.total)}</td>
                    <td>
                      <span className={`badge ${
                        order.status === 'pending' ? 'badge-pending' :
                        order.status === 'ordered' ? 'badge-in_progress' :
                        order.status === 'received' ? 'badge-available' :
                        order.status === 'used' ? 'badge-warning' : 'badge-cancelled'
                      }`}>{order.status}</span>
                    </td>
                    <td>
<div style={{ display: 'flex', gap: '8px' }}>
                      {order.status === 'pending' && (
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => {
                          const today = new Date().toISOString().split('T')[0];
                          setPurchaseOrders(purchaseOrders.map(o => o.id === order.id ? { 
                            ...o, 
                            status: 'ordered',
                            timeline: [
                              ...(o.timeline || [{ date: o.createdAt, status: 'pending', notes: o.notes }]),
                              { date: today, status: 'ordered', notes: 'Order placed with supplier' }
                            ]
                          } : o));
                        }}>Order</button>
                      )}
                      {order.status === 'ordered' && (
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => {
                          const today = new Date().toISOString().split('T')[0];
                          setPurchaseOrders(purchaseOrders.map(o => o.id === order.id ? { 
                            ...o, 
                            status: 'received',
                            timeline: [
                              ...(o.timeline || [{ date: o.createdAt, status: 'pending', notes: o.notes }]),
                              { date: today, status: 'received', notes: 'Delivery received and checked' }
                            ]
                          } : o));
                        }}>Receive</button>
                      )}
                      {order.status === 'received' && (
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => {
                          const today = new Date().toISOString().split('T')[0];
                          setPurchaseOrders(purchaseOrders.map(o => o.id === order.id ? { 
                            ...o, 
                            status: 'used',
                            timeline: [
                              ...(o.timeline || [{ date: o.createdAt, status: 'pending', notes: o.notes }]),
                              { date: today, status: 'used', notes: 'Inventory items marked as used' }
                            ]
                          } : o));
                        }}>Used</button>
                      )}
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}>History</button>
                      {order.status !== 'received' && order.status !== 'used' && (
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => setPurchaseOrders(purchaseOrders.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o))}>Cancel</button>
                      )}
                    </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'monthly' && (
        <>
          <div className="filter-bar" style={{ marginBottom: '24px' }}>
            <select className="form-select" style={{ width: '150px' }} value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
            <select className="form-select" style={{ width: '180px' }} value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
              {monthNames.map((month, idx) => (<option key={idx} value={idx}>{month} {selectedYear}</option>))}
            </select>
          </div>

          <div className="stat-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card" style={{ background: 'var(--primary)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentMonthData?.items.length || 0}</div>
              <div className="stat-label">Items Purchased</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentMonthData?.totalQuantity.toFixed(1) || 0}</div>
              <div className="stat-label">Total Units</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--danger)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{formatCurrency(currentMonthData?.totalCost || 0)}</div>
              <div className="stat-label">Total Spent</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '32px' }}>{formatCurrency((currentMonthData?.totalCost || 0) / (currentMonthData?.items.length || 1))}</div>
              <div className="stat-label">Avg/Item</div>
            </div>
          </div>

          <div className="grid-2">
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Top Purchased Items</h3>
              </div>
              <div style={{ padding: '24px' }}>
                {topPurchasedMonth.map((item, index) => (
                  <div key={item.itemId} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <span style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'white' }}>{index + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>{item.itemName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatCurrency(item.cost)}/{item.unit}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono" style={{ fontWeight: '600', fontSize: '18px' }}>{item.quantity.toFixed(1)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.unit}</div>
                    </div>
                  </div>
                ))}
                {topPurchasedMonth.length === 0 && <div className="empty-state"><div className="empty-state-text">No purchases</div></div>}
              </div>
            </div>

            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">All Items Purchased</h3>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Item</th><th>Qty</th><th>Unit Cost</th><th>Total</th><th>%</th></tr>
                  </thead>
                  <tbody>
                    {currentMonthData?.items.sort((a, b) => b.quantity - a.quantity).map(item => (
                      <tr key={item.itemId}>
                        <td>{item.itemName}</td>
                        <td className="mono">{item.quantity.toFixed(1)} {item.unit}</td>
                        <td className="mono">{formatCurrency(item.cost)}</td>
                        <td className="mono" style={{ color: 'var(--danger)' }}>{formatCurrency(item.totalCost)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${(item.quantity / (currentMonthData?.totalQuantity || 1)) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                            </div>
                            <span className="mono" style={{ fontSize: '12px' }}>{((item.quantity / (currentMonthData?.totalQuantity || 1)) * 100).toFixed(1)}%</span>
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
                    <div style={{ width: '100%', height: `${Math.max(4, (month.totalCost / Math.max(...monthlyData.map(m => m.totalCost))) * 160)}px`, background: idx === selectedMonth ? 'var(--danger)' : 'var(--bg-elevated)', borderRadius: '4px 4px 0 0', minHeight: '4px', cursor: 'pointer' }} onClick={() => setSelectedMonth(idx)} />
                    <span className="mono" style={{ fontSize: '10px', color: idx === selectedMonth ? 'var(--danger)' : 'var(--text-muted)' }}>{month.month.slice(0, 3)}</span>
                    <span className="mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{month.totalQuantity.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {view === 'yearly' && (
        <>
          <div className="filter-bar" style={{ marginBottom: '24px' }}>
            <select className="form-select" style={{ width: '150px' }} value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
              {yearlyData.map(y => (<option key={y.year} value={y.year}>{y.year}</option>))}
            </select>
          </div>

          <div className="stat-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card" style={{ background: 'var(--primary)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentYearData?.items.length || 0}</div>
              <div className="stat-label">Items Purchased</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentYearData?.totalQuantity.toFixed(0) || 0}</div>
              <div className="stat-label">Total Units</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--danger)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{formatCurrency(currentYearData?.totalCost || 0)}</div>
              <div className="stat-label">Total Spent</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '32px' }}>{formatCurrency((currentYearData?.totalCost || 0) / 12)}</div>
              <div className="stat-label">Avg/Month</div>
            </div>
          </div>

          <div className="grid-2">
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Top Purchased Items - {selectedYear}</h3>
              </div>
              <div style={{ padding: '24px' }}>
                {topPurchasedYear.map((item, index) => (
                  <div key={item.itemId} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <span style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'white' }}>{index + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>{item.itemName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatCurrency(item.cost)}/{item.unit}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono" style={{ fontWeight: '600', fontSize: '18px' }}>{item.quantity.toFixed(0)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.unit}</div>
                    </div>
                  </div>
                ))}
                {topPurchasedYear.length === 0 && <div className="empty-state"><div className="empty-state-text">No purchases</div></div>}
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
                      <div style={{ width: `${(month.cost / (currentYearData?.totalCost || 1)) * 100}%`, height: '100%', background: 'var(--danger)', borderRadius: '4px', display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
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
              <h3 className="data-card-title">All Items Purchased - {selectedYear}</h3>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Item</th><th>Qty Purchased</th><th>Unit Cost</th><th>Total Cost</th><th>%</th><th>Avg/Month</th></tr>
                </thead>
                <tbody>
                  {currentYearData?.items.sort((a, b) => b.quantity - a.quantity).map(item => (
                    <tr key={item.itemId}>
                      <td>{item.itemName}</td>
                      <td className="mono">{item.quantity.toFixed(1)} {item.unit}</td>
                      <td className="mono">{formatCurrency(item.cost)}</td>
                      <td className="mono" style={{ color: 'var(--danger)', fontWeight: '600' }}>{formatCurrency(item.totalCost)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${(item.quantity / (currentYearData?.totalQuantity || 1)) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                          </div>
                          <span className="mono" style={{ fontSize: '12px' }}>{((item.quantity / (currentYearData?.totalQuantity || 1)) * 100).toFixed(1)}%</span>
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

      {/* Create Order Modal */}
      <div className={`modal-overlay ${showCreateModal ? 'active' : ''}`} onClick={() => setShowCreateModal(false)}>
        <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Create Purchase Order</h2>
            <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Supplier</label>
              <select className="form-select" value={newOrder.supplier} onChange={e => setNewOrder({ ...newOrder, supplier: e.target.value })}>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Add Items</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <select className="form-select" style={{ flex: 2 }} value={selectedItem} onChange={e => setSelectedItem(e.target.value)}>
                  <option value="">Select Item</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                <input className="form-input" type="number" min="1" style={{ flex: 1 }} placeholder="Qty" value={itemQty} onChange={e => setItemQty(parseInt(e.target.value) || 1)} />
                <input className="form-input" type="number" step="0.01" style={{ flex: 1 }} placeholder="Cost" value={itemCost} onChange={e => setItemCost(parseFloat(e.target.value) || 0)} />
                <button className="btn btn-secondary" onClick={addItemToOrder}>Add</button>
              </div>

              {newOrder.items.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>Item</th><th>Qty</th><th>Cost</th><th>Total</th><th></th></tr>
                    </thead>
                    <tbody>
                      {newOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.name}</td>
                          <td className="mono">{item.quantity}</td>
                          <td className="mono">{formatCurrency(item.cost)}</td>
                          <td className="mono" style={{ fontWeight: '600' }}>{formatCurrency(item.quantity * item.cost)}</td>
                          <td><button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => removeItem(idx)}>×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ textAlign: 'right', marginTop: '8px', fontWeight: '600' }}>
                    Total: {formatCurrency(newOrder.items.reduce((sum, item) => sum + item.quantity * item.cost, 0))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={2} value={newOrder.notes} onChange={e => setNewOrder({ ...newOrder, notes: e.target.value })} placeholder="Optional notes..." />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={createOrder} disabled={!newOrder.supplier || newOrder.items.length === 0}>Create Order</button>
          </div>
        </div>
      </div>

      {/* Purchase Order Detail / Item History Modal */}
      <div className={`modal-overlay ${showDetailModal ? 'active' : ''}`} onClick={() => setShowDetailModal(false)}>
        <div className="modal" style={{ backgroundColor: '#121212', border: 'none', width: '90%', maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header" style={{ borderBottom: '1px solid #333', paddingBottom: '24px' }}>
            <h2 className="modal-title" style={{ fontSize: '42px', fontWeight: '700' }}>Order History - {selectedOrder?.id}</h2>
            <button className="modal-close" onClick={() => setShowDetailModal(false)} style={{ width: '50px', height: '50px', fontSize: '28px' }}>×</button>
          </div>
          <div className="modal-body" style={{ padding: '32px' }}>
            {selectedOrder && (
              <>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Order Timeline</h3>

                <table className="data-table" style={{ marginBottom: '32px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#222' }}>
                      <th style={{ fontSize: '18px', color: '#888', fontWeight: '500', padding: '12px' }}>Date</th>
                      <th style={{ fontSize: '18px', color: '#888', fontWeight: '500', padding: '12px' }}>Status</th>
                      <th style={{ fontSize: '18px', color: '#888', fontWeight: '500', padding: '12px' }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.timeline && selectedOrder.timeline.length > 0 ? (
                      selectedOrder.timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((event, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                          <td style={{ fontSize: '20px', padding: '16px 12px' }}>{event.date}</td>
                          <td style={{ padding: '16px 12px' }}>
                            <span className={`badge ${
                              event.status === 'pending' ? 'badge-pending' :
                              event.status === 'ordered' ? 'badge-in_progress' :
                              event.status === 'received' ? 'badge-available' :
                              event.status === 'used' ? 'badge-warning' : 'badge-cancelled'
                            }`}>{event.status}</span>
                          </td>
                          <td style={{ fontSize: '20px', padding: '16px 12px' }}>{event.notes || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr style={{ borderBottom: '1px solid #333' }}>
                        <td style={{ fontSize: '20px', padding: '16px 12px' }}>{selectedOrder.createdAt}</td>
                        <td style={{ padding: '16px 12px' }}>
                          <span className={`badge ${
                            selectedOrder.status === 'pending' ? 'badge-pending' :
                            selectedOrder.status === 'ordered' ? 'badge-in_progress' :
                            selectedOrder.status === 'received' ? 'badge-available' :
                            selectedOrder.status === 'used' ? 'badge-warning' : 'badge-cancelled'
                          }`}>{selectedOrder.status}</span>
                        </td>
                        <td style={{ fontSize: '20px', padding: '16px 12px' }}>{selectedOrder.notes || '-'}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '16px', color: '#888', marginBottom: '8px' }}>Supplier: {selectedOrder.supplier}</div>
                  
                  <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>Items in this order</h3>

                  <table className="data-table">
                    <thead>
                      <tr style={{ backgroundColor: '#222' }}>
                        <th style={{ fontSize: '18px', color: '#888', fontWeight: '500', padding: '12px' }}>Item</th>
                        <th style={{ fontSize: '18px', color: '#888', fontWeight: '500', padding: '12px' }}>Quantity</th>
                        <th style={{ fontSize: '18px', color: '#888', fontWeight: '500', padding: '12px' }}>Unit Cost</th>
                        <th style={{ fontSize: '18px', color: '#888', fontWeight: '500', padding: '12px' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                          <td style={{ fontSize: '20px', padding: '16px 12px' }}>{item.name}</td>
                          <td style={{ fontSize: '20px', padding: '16px 12px' }}>{item.quantity}</td>
                          <td style={{ fontSize: '20px', padding: '16px 12px' }}>{formatCurrency(item.cost)}</td>
                          <td style={{ fontSize: '20px', padding: '16px 12px', fontWeight: '600' }}>{formatCurrency(item.quantity * item.cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div style={{ textAlign: 'right', marginTop: '16px', fontSize: '24px', fontWeight: '600' }}>
                    Total: {formatCurrency(selectedOrder.total)}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>Notes</div>
                    <div style={{ fontSize: '18px' }}>{selectedOrder.notes}</div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="modal-footer" style={{ borderTop: 'none', justifyContent: 'flex-end', padding: '24px' }}>
            <button className="btn btn-secondary" style={{ padding: '16px 40px', fontSize: '24px' }} onClick={() => setShowDetailModal(false)}>Close</button>
          </div>
        </div>
      </div>
    </>
  );
}