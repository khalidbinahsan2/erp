'use client';

import { useState } from 'react';
import { inventoryItems as initialInventory } from '@/lib/mockData';
import { InventoryItem } from '@/types';

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

interface PurchaseOrder {
  id: string;
  items: { itemId: string; name: string; quantity: number; cost: number }[];
  total: number;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  supplier: string;
  createdAt: string;
  notes: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(initialInventory);
  const [view, setView] = useState<'list' | 'low-stock' | 'valuation' | 'orders'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'cost'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Purchase orders state
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    { id: 'PO-001', items: [{ itemId: '1', name: 'Arborio Rice', quantity: 20, cost: 90 }], total: 90, status: 'pending', supplier: 'Fresh Foods Co', createdAt: '2024-04-20', notes: 'Weekly order' },
    { id: 'PO-002', items: [{ itemId: '2', name: 'Atlantic Salmon', quantity: 10, cost: 180 }], total: 180, status: 'received', supplier: 'Ocean Catch', createdAt: '2024-04-18', notes: '' },
  ]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Restock modal state
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockItems, setRestockItems] = useState<{ itemId: string; name: string; quantity: number; costPerUnit: number }[]>([]);
  const [restockSupplier, setRestockSupplier] = useState('');
  const [restockNotes, setRestockNotes] = useState('');

  const suppliers = ['Fresh Foods Co', 'Ocean Catch', 'Prime Meats', 'Green Valley Farms', 'Beverage Distributors'];

  const [formData, setFormData] = useState({
    name: '',
    category: 'Ingredients',
    quantity: '',
    unit: 'pieces',
    reorderLevel: '',
    costPerUnit: ''
  });

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return 'out-of-stock';
    if (item.quantity <= item.reorderLevel) return 'low-stock';
    return 'ok';
  };

  const filteredItems = items
    .filter(i => {
      const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || i.category === categoryFilter;
      
      if (view === 'low-stock') {
        return matchesSearch && matchesCategory && getStockStatus(i) !== 'ok';
      }
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'quantity') comparison = a.quantity - b.quantity;
      else if (sortBy === 'cost') comparison = a.costPerUnit - b.costPerUnit;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const lowStockItems = items.filter(i => getStockStatus(i) !== 'ok');
  const totalValue = items.reduce((sum, i) => sum + (i.quantity * i.costPerUnit), 0);
  const categoryValues = items.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + (i.quantity * i.costPerUnit);
    return acc;
  }, {} as Record<string, number>);

  const usageHistory = [
    { date: '2024-04-20', action: 'Used', quantity: 2, notes: 'Daily prep' },
    { date: '2024-04-19', action: 'Restocked', quantity: 10, notes: 'Weekly delivery' },
    { date: '2024-04-18', action: 'Used', quantity: 5, notes: 'Weekend rush' },
  ];

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ name: '', category: 'Ingredients', quantity: '', unit: 'pieces', reorderLevel: '', costPerUnit: '' });
    setShowModal(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      reorderLevel: item.reorderLevel.toString(),
      costPerUnit: item.costPerUnit.toString()
    });
    setShowModal(true);
  };

  const openHistoryModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowHistoryModal(true);
  };

  const saveItem = () => {
    if (!formData.name || !formData.quantity) return;
    
    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? {
        ...i,
        name: formData.name,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        reorderLevel: parseFloat(formData.reorderLevel) || 0,
        costPerUnit: parseFloat(formData.costPerUnit) || 0
      } : i));
    } else {
      const newItem: InventoryItem = {
        id: String(items.length + 1),
        name: formData.name,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        reorderLevel: parseFloat(formData.reorderLevel) || 0,
        costPerUnit: parseFloat(formData.costPerUnit) || 0
      };
      setItems([...items, newItem]);
    }
    setShowModal(false);
  };

  const adjustQuantity = (itemId: string, adjustment: number) => {
    setItems(items.map(i => i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + adjustment) } : i));
  };

  const deleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(i => i.id !== itemId));
    }
  };

  const toggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(i => i.id));
    }
  };

  const deleteSelectedItems = () => {
    if (confirm(`Delete ${selectedItems.length} selected items?`)) {
      setItems(items.filter(i => !selectedItems.includes(i.id)));
      setSelectedItems([]);
    }
  };

  const exportInventory = () => {
    const headers = ['Name', 'Category', 'Quantity', 'Unit', 'Reorder Level', 'Cost/Unit', 'Total Value'];
    const rows = items.map(i => [i.name, i.category, i.quantity, i.unit, i.reorderLevel, i.costPerUnit, i.quantity * i.costPerUnit]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Restock functions
  const openRestockModal = () => {
    const lowStock = items.filter(i => i.quantity <= i.reorderLevel).map(item => ({
      itemId: item.id,
      name: item.name,
      quantity: item.reorderLevel - item.quantity + 10,
      costPerUnit: item.costPerUnit
    }));
    setRestockItems(lowStock);
    setRestockSupplier(suppliers[0]);
    setRestockNotes('Auto-generated restock order');
    setShowRestockModal(true);
  };

  const addRestockItem = () => {
    setRestockItems([...restockItems, { itemId: '', name: '', quantity: 1, costPerUnit: 0 }]);
  };

  const removeRestockItem = (index: number) => {
    setRestockItems(restockItems.filter((_, i) => i !== index));
  };

  const updateRestockItem = (index: number, field: string, value: string | number) => {
    const updated = [...restockItems];
    updated[index] = { ...updated[index], [field]: value };
    setRestockItems(updated);
  };

  const submitRestockOrder = () => {
    const validItems = restockItems.filter(i => i.itemId && i.quantity > 0);
    if (validItems.length === 0 || !restockSupplier) return;
    
    createPurchaseOrder(
      validItems.map(item => ({
        itemId: item.itemId,
        name: item.name,
        quantity: item.quantity,
        cost: item.quantity * item.costPerUnit
      })),
      restockSupplier,
      restockNotes
    );
    setShowRestockModal(false);
    setView('orders');
  };

  const restockTotal = restockItems.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);

  // Purchase order functions
  const createPurchaseOrder = (orderItems: { itemId: string; name: string; quantity: number; cost: number }[], supplier: string, notes: string) => {
    const newOrder: PurchaseOrder = {
      id: `PO-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      items: orderItems,
      total: orderItems.reduce((sum, item) => sum + item.cost, 0),
      status: 'pending',
      supplier,
      createdAt: new Date().toISOString().split('T')[0],
      notes
    };
    setPurchaseOrders([...purchaseOrders, newOrder]);
  };

  const updateOrderStatus = (orderId: string, status: PurchaseOrder['status']) => {
    setPurchaseOrders(purchaseOrders.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const receiveOrder = (orderId: string) => {
    const order = purchaseOrders.find(o => o.id === orderId);
    if (!order) return;
    
    order.items.forEach(orderItem => {
      const item = items.find(i => i.id === orderItem.itemId);
      if (item) {
        adjustQuantity(item.id, orderItem.quantity);
      }
    });
    updateOrderStatus(orderId, 'received');
  };

  const cancelOrder = (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      updateOrderStatus(orderId, 'cancelled');
    }
  };

  const deleteOrder = (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      setPurchaseOrders(purchaseOrders.filter(o => o.id !== orderId));
    }
  };

  const getOrdersByStatus = (status: PurchaseOrder['status']) => {
    return purchaseOrders.filter(o => o.status === status);
  };

  const pendingTotal = getOrdersByStatus('pending').reduce((sum, o) => sum + o.total, 0);
  const orderedTotal = getOrdersByStatus('ordered').reduce((sum, o) => sum + o.total, 0);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Inventory</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {lowStockItems.length > 0 && (
            <span className="badge badge-pending" style={{ fontSize: '14px' }}>
              {lowStockItems.length} items low on stock
            </span>
          )}
          <button className="btn btn-secondary" onClick={exportInventory}>Export CSV</button>
          <button className="btn btn-secondary" onClick={openRestockModal}>Quick Restock</button>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Item
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>All Items</button>
        <button className={`tab ${view === 'low-stock' ? 'active' : ''}`} onClick={() => setView('low-stock')}>
          Low Stock {lowStockItems.length > 0 && `(${lowStockItems.length})`}
        </button>
        <button className={`tab ${view === 'orders' ? 'active' : ''}`} onClick={() => setView('orders')}>
          Orders {purchaseOrders.filter(o => o.status === 'pending' || o.status === 'ordered').length > 0 && `(${purchaseOrders.filter(o => o.status === 'pending' || o.status === 'ordered').length})`}
        </button>
        <button className={`tab ${view === 'valuation' ? 'active' : ''}`} onClick={() => setView('valuation')}>Valuation</button>
      </div>

      {view === 'list' && (
        <>
          <div className="filter-bar">
            <input 
              className="form-input" 
              style={{ width: '300px' }}
              placeholder="Search items..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select className="form-select" style={{ width: '150px' }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="Ingredients">Ingredients</option>
              <option value="Supplies">Supplies</option>
              <option value="Beverages">Beverages</option>
            </select>
            <select className="form-select" style={{ width: '150px' }} value={sortBy} onChange={e => setSortBy(e.target.value as 'name' | 'quantity' | 'cost')}>
              <option value="name">Sort by Name</option>
              <option value="quantity">Sort by Quantity</option>
              <option value="cost">Sort by Cost</option>
            </select>
            <button className="btn btn-secondary" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
            {selectedItems.length > 0 && (
              <button className="btn btn-secondary" style={{ color: 'var(--danger)' }} onClick={deleteSelectedItems}>
                Delete Selected ({selectedItems.length})
              </button>
            )}
          </div>

          <div className="data-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input type="checkbox" checked={selectedItems.length === filteredItems.length && filteredItems.length > 0} onChange={selectAllItems} />
                  </th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Reorder Level</th>
                  <th>Cost/Unit</th>
                  <th>Total Value</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <tr key={item.id}>
                      <td>
                        <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => toggleSelectItem(item.id)} />
                      </td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td className="mono" style={{ color: stockStatus === 'out-of-stock' ? 'var(--danger)' : stockStatus === 'low-stock' ? 'var(--warning)' : 'inherit' }}>
                        {item.quantity}
                      </td>
                      <td>{item.unit}</td>
                      <td>{item.reorderLevel}</td>
                      <td className="mono">{formatCurrency(item.costPerUnit)}</td>
                      <td className="mono">{formatCurrency(item.quantity * item.costPerUnit)}</td>
                      <td>
                        <span className={`badge ${
                          stockStatus === 'out-of-stock' ? 'badge-cancelled' :
                          stockStatus === 'low-stock' ? 'badge-pending' :
                          'badge-available'
                        }`}>
                          {stockStatus === 'out-of-stock' ? 'Out of Stock' : stockStatus === 'low-stock' ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn edit" onClick={() => openEditModal(item)}>Edit</button>
                        <button className="action-btn" style={{ marginLeft: '8px' }} onClick={() => adjustQuantity(item.id, item.reorderLevel)}>
                          + Add
                        </button>
                        <button className="action-btn" style={{ marginLeft: '8px' }} onClick={() => openHistoryModal(item)}>
                          History
                        </button>
                        <button className="action-btn" style={{ marginLeft: '8px', color: 'var(--danger)' }} onClick={() => deleteItem(item.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
</table>
            {filteredItems.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-text">No items found</div>
              </div>
            )}
          </div>
        </>
      )}

      {view === 'orders' && (
        <>
          <div className="stat-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card" style={{ background: 'var(--warning)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{pendingTotal}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--primary)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{orderedTotal}</div>
              <div className="stat-label">Ordered</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--success)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>
                {purchaseOrders.filter(o => o.status === 'received').length}
              </div>
              <div className="stat-label">Received</div>
            </div>
          </div>

          <div className="filter-bar">
            <select className="form-select" style={{ width: '150px' }} value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}>
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="ordered">Ordered</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
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
                {purchaseOrders
                  .filter(o => orderStatusFilter === 'all' || o.status === orderStatusFilter)
                  .map(order => (
                    <tr key={order.id}>
                      <td className="mono">{order.id}</td>
                      <td>{order.createdAt}</td>
                      <td>{order.supplier}</td>
                      <td>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '14px' }}>
                            {item.name} x{item.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="mono" style={{ fontWeight: '600' }}>{formatCurrency(order.total)}</td>
                      <td>
                        <span className={`badge ${
                          order.status === 'pending' ? 'badge-pending' :
                          order.status === 'ordered' ? 'badge-in_progress' :
                          order.status === 'received' ? 'badge-available' :
                          'badge-cancelled'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {order.status === 'pending' && (
                          <>
                            <button className="action-btn edit" onClick={() => updateOrderStatus(order.id, 'ordered')}>Order</button>
                            <button className="action-btn" style={{ marginLeft: '8px', color: 'var(--danger)' }} onClick={() => cancelOrder(order.id)}>Cancel</button>
                          </>
                        )}
                        {order.status === 'ordered' && (
                          <>
                            <button className="btn btn-primary" onClick={() => receiveOrder(order.id)}>Receive</button>
                            <button className="action-btn" style={{ marginLeft: '8px', color: 'var(--danger)' }} onClick={() => cancelOrder(order.id)}>Cancel</button>
                          </>
                        )}
                        {order.status === 'received' && (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Completed</span>
                        )}
                        {order.status === 'cancelled' && (
                          <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => deleteOrder(order.id)}>Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'low-stock' && (
        <div className="data-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Current Qty</th>
                <th>Reorder Level</th>
                <th>Needed</th>
                <th>Est. Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map(item => {
                const needed = item.reorderLevel - item.quantity + 5;
                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td className="mono" style={{ color: 'var(--danger)' }}>{item.quantity}</td>
                    <td>{item.reorderLevel}</td>
                    <td>{needed}</td>
                    <td className="mono">{formatCurrency(needed * item.costPerUnit)}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => adjustQuantity(item.id, needed)}>
                        Order Now
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {view === 'valuation' && (
        <div className="grid-2">
          <div className="data-card">
            <div className="data-card-header">
              <h3 className="data-card-title">Total Inventory Value</h3>
            </div>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div className="stat-value" style={{ fontSize: '48px', color: 'var(--primary)' }}>
                {formatCurrency(totalValue)}
              </div>
              <div className="stat-label">Total Value</div>
            </div>
          </div>

          <div className="data-card">
            <div className="data-card-header">
              <h3 className="data-card-title">Value by Category</h3>
            </div>
            <div style={{ padding: '24px' }}>
              {Object.entries(categoryValues).map(([category, value]) => {
                const percentage = (value / totalValue) * 100;
                return (
                  <div key={category} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>{category}</span>
                      <span className="mono">{formatCurrency(value)} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="data-card" style={{ gridColumn: 'span 2' }}>
            <div className="data-card-header">
              <h3 className="data-card-title">Item Valuation Details</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Cost/Unit</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {items.sort((a, b) => (b.quantity * b.costPerUnit) - (a.quantity * a.costPerUnit)).map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td className="mono">{item.quantity} {item.unit}</td>
                    <td className="mono">{formatCurrency(item.costPerUnit)}</td>
                    <td className="mono" style={{ fontWeight: '600' }}>{formatCurrency(item.quantity * item.costPerUnit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={() => setShowModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Item Name</label>
              <input className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Item name" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option>Ingredients</option>
                  <option>Supplies</option>
                  <option>Beverages</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select className="form-select" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                  <option>pieces</option>
                  <option>kg</option>
                  <option>liters</option>
                  <option>bottles</option>
                  <option>boxes</option>
                  <option>grams</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Reorder Level</label>
                <input className="form-input" type="number" value={formData.reorderLevel} onChange={e => setFormData({ ...formData, reorderLevel: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Cost per Unit</label>
              <input className="form-input" type="number" step="0.01" value={formData.costPerUnit} onChange={e => setFormData({ ...formData, costPerUnit: e.target.value })} placeholder="0.00" />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveItem}>{editingItem ? 'Save Changes' : 'Add Item'}</button>
          </div>
        </div>
      </div>

      {/* History Modal */}
      <div className={`modal-overlay ${showHistoryModal ? 'active' : ''}`} onClick={() => setShowHistoryModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Usage History - {selectedItem?.name}</h2>
            <button className="modal-close" onClick={() => setShowHistoryModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Quantity</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {usageHistory.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.date}</td>
                    <td>
                      <span className={`badge ${entry.action === 'Restocked' ? 'badge-available' : 'badge-in_progress'}`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="mono">{entry.quantity}</td>
                    <td>{entry.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowHistoryModal(false)}>Close</button>
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      <div className={`modal-overlay ${showRestockModal ? 'active' : ''}`} onClick={() => setShowRestockModal(false)}>
        <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Create Restock Order</h2>
            <button className="modal-close" onClick={() => setShowRestockModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Supplier</label>
              <select className="form-select" value={restockSupplier} onChange={e => setRestockSupplier(e.target.value)}>
                {suppliers.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <input className="form-input" value={restockNotes} onChange={e => setRestockNotes(e.target.value)} placeholder="Order notes" />
            </div>
            
            <div style={{ marginTop: '16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ margin: 0 }}>Items to Order</label>
              <button className="btn btn-secondary" style={{ padding: '4px 12px' }} onClick={addRestockItem}>+ Add Item</button>
            </div>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {restockItems.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <select className="form-select" value={item.itemId} onChange={e => {
                          const selectedItem = items.find(i => i.id === e.target.value);
                          if (selectedItem) {
                            updateRestockItem(index, 'itemId', selectedItem.id);
                            updateRestockItem(index, 'name', selectedItem.name);
                            updateRestockItem(index, 'costPerUnit', selectedItem.costPerUnit);
                          }
                        }}>
                          <option value="">Select item...</option>
                          {items.map(i => (
                            <option key={i.id} value={i.id}>{i.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="form-input" 
                          value={item.quantity} 
                          onChange={e => updateRestockItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                        />
                      </td>
                      <td className="mono">{formatCurrency(item.costPerUnit)}</td>
                      <td className="mono">{formatCurrency(item.quantity * item.costPerUnit)}</td>
                      <td>
                        <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => removeRestockItem(index)}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {restockItems.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No items added. Click &quot;Add Item&quot; to add items.
                </div>
              )}
            </div>

            <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '600' }}>Order Total:</span>
              <span className="mono" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(restockTotal)}</span>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowRestockModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitRestockOrder}>Create Order</button>
          </div>
        </div>
      </div>
    </>
  );
}