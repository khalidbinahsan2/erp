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

export default function PurchaseOrdersPage() {
  const [items, setItems] = useState<InventoryItem[]>(initialInventory);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    { id: 'PO-001', items: [{ itemId: '1', name: 'Arborio Rice', quantity: 20, cost: 90 }], total: 90, status: 'pending', supplier: 'Fresh Foods Co', createdAt: '2024-04-20', notes: 'Weekly order' },
    { id: 'PO-002', items: [{ itemId: '2', name: 'Atlantic Salmon', quantity: 10, cost: 180 }], total: 180, status: 'received', supplier: 'Ocean Catch', createdAt: '2024-04-18', notes: '' },
    { id: 'PO-003', items: [{ itemId: '3', name: 'Olive Oil', quantity: 15, cost: 75 }], total: 75, status: 'ordered', supplier: 'Green Valley Farms', createdAt: '2024-04-19', notes: 'Urgent' },
    { id: 'PO-004', items: [{ itemId: '4', name: 'Parmesan', quantity: 5, cost: 60 }, { itemId: '5', name: 'Butter', quantity: 10, cost: 30 }], total: 90, status: 'cancelled', supplier: 'Prime Meats', createdAt: '2024-04-17', notes: 'Out of stock' },
  ]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  const suppliers = ['Fresh Foods Co', 'Ocean Catch', 'Prime Meats', 'Green Valley Farms', 'Beverage Distributors'];

  // Form state
  const [formData, setFormData] = useState({
    supplier: suppliers[0],
    notes: ''
  });
  const [orderItems, setOrderItems] = useState<{ itemId: string; name: string; quantity: number; cost: number }[]>([
    { itemId: '', name: '', quantity: 1, cost: 0 }
  ]);

  const getOrdersByStatus = (status: PurchaseOrder['status']) => {
    return purchaseOrders.filter(o => o.status === status);
  };

  const filteredOrders = purchaseOrders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSupplier = supplierFilter === 'all' || o.supplier === supplierFilter;
    const matchesSearch = !searchTerm || o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSupplier && matchesSearch;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pendingTotal = getOrdersByStatus('pending').reduce((sum, o) => sum + o.total, 0);
  const orderedTotal = getOrdersByStatus('ordered').reduce((sum, o) => sum + o.total, 0);
  const receivedTotal = getOrdersByStatus('received').reduce((sum, o) => sum + o.total, 0);

  const updateOrderItem = (index: number, field: string, value: string | number) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'itemId') {
      const item = items.find(i => i.id === value);
      if (item) {
        updated[index].name = item.name;
        updated[index].cost = item.costPerUnit;
      }
    }
    setOrderItems(updated);
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { itemId: '', name: '', quantity: 1, cost: 0 }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const createOrderTotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

  const createOrder = () => {
    const validItems = orderItems.filter(i => i.itemId && i.quantity > 0);
    if (validItems.length === 0) return;

    const newOrder: PurchaseOrder = {
      id: `PO-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      items: validItems,
      total: validItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0),
      status: 'pending',
      supplier: formData.supplier,
      createdAt: new Date().toISOString().split('T')[0],
      notes: formData.notes
    };

    setPurchaseOrders([...purchaseOrders, newOrder]);
    setShowCreateModal(false);
    setFormData({ supplier: suppliers[0], notes: '' });
    setOrderItems([{ itemId: '', name: '', quantity: 1, cost: 0 }]);
  };

  const updateStatus = (orderId: string, status: PurchaseOrder['status']) => {
    setPurchaseOrders(purchaseOrders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const receiveOrder = (orderId: string) => {
    const order = purchaseOrders.find(o => o.id === orderId);
    if (!order) return;
    
    order.items.forEach(orderItem => {
      const item = items.find(i => i.id === orderItem.itemId);
      if (item) {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + orderItem.quantity } : i));
      }
    });
    updateStatus(orderId, 'received');
  };

  const cancelOrder = (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      updateStatus(orderId, 'cancelled');
    }
  };

  const deleteOrder = (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      setPurchaseOrders(purchaseOrders.filter(o => o.id !== orderId));
    }
  };

  const viewOrderDetails = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'ordered': return 'badge-in_progress';
      case 'received': return 'badge-available';
      case 'cancelled': return 'badge-cancelled';
      default: return '';
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Purchase Orders</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create Order
        </button>
      </div>

      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ background: 'var(--warning)' }}>
          <div className="stat-value" style={{ fontSize: '32px' }}>{getOrdersByStatus('pending').length}</div>
          <div className="stat-label">Pending</div>
          <div className="mono" style={{ fontSize: '14px', marginTop: '8px' }}>{formatCurrency(pendingTotal)}</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--primary)' }}>
          <div className="stat-value" style={{ fontSize: '32px' }}>{getOrdersByStatus('ordered').length}</div>
          <div className="stat-label">Ordered</div>
          <div className="mono" style={{ fontSize: '14px', marginTop: '8px' }}>{formatCurrency(orderedTotal)}</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--success)' }}>
          <div className="stat-value" style={{ fontSize: '32px' }}>{getOrdersByStatus('received').length}</div>
          <div className="stat-label">Received</div>
          <div className="mono" style={{ fontSize: '14px', marginTop: '8px' }}>{formatCurrency(receivedTotal)}</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--danger)' }}>
          <div className="stat-value" style={{ fontSize: '32px' }}>{getOrdersByStatus('cancelled').length}</div>
          <div className="stat-label">Cancelled</div>
        </div>
      </div>

      <div className="filter-bar">
        <input 
          className="form-input" 
          style={{ width: '250px' }}
          placeholder="Search orders..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select className="form-select" style={{ width: '150px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="ordered">Ordered</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="form-select" style={{ width: '180px' }} value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)}>
          <option value="all">All Suppliers</option>
          {suppliers.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
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
                  <div style={{ maxWidth: '200px' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {item.name} x{item.quantity}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="mono" style={{ fontWeight: '600' }}>{formatCurrency(order.total)}</td>
                <td>
                  <span className={`badge ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn" onClick={() => viewOrderDetails(order)}>View</button>
                  {order.status === 'pending' && (
                    <>
                      <button className="action-btn edit" onClick={() => updateStatus(order.id, 'ordered')}>Order</button>
                      <button className="action-btn" style={{ marginLeft: '8px', color: 'var(--danger)' }} onClick={() => cancelOrder(order.id)}>Cancel</button>
                    </>
                  )}
                  {order.status === 'ordered' && (
                    <>
                      <button className="btn btn-primary" style={{ padding: '6px 12px' }} onClick={() => receiveOrder(order.id)}>Receive</button>
                      <button className="action-btn" style={{ marginLeft: '8px', color: 'var(--danger)' }} onClick={() => cancelOrder(order.id)}>Cancel</button>
                    </>
                  )}
                  {order.status === 'cancelled' && (
                    <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => deleteOrder(order.id)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-text">No orders found</div>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      <div className={`modal-overlay ${showCreateModal ? 'active' : ''}`} onClick={() => setShowCreateModal(false)}>
        <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Create Purchase Order</h2>
            <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Supplier</label>
                <select className="form-select" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })}>
                  {suppliers.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="form-input" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Order notes" />
              </div>
            </div>

            <div style={{ marginTop: '16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ margin: 0 }}>Order Items</label>
              <button className="btn btn-secondary" style={{ padding: '4px 12px' }} onClick={addOrderItem}>+ Add Item</button>
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
                  {orderItems.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <select className="form-select" value={item.itemId} onChange={e => updateOrderItem(index, 'itemId', e.target.value)}>
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
                          onChange={e => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                        />
                      </td>
                      <td className="mono">{formatCurrency(item.cost)}</td>
                      <td className="mono">{formatCurrency(item.quantity * item.cost)}</td>
                      <td>
                        <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => removeOrderItem(index)}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '600' }}>Order Total:</span>
              <span className="mono" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(createOrderTotal)}</span>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={createOrder}>Create Order</button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <div className={`modal-overlay ${showDetailModal ? 'active' : ''}`} onClick={() => setShowDetailModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Order Details - {selectedOrder?.id}</h2>
            <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
          </div>
          <div className="modal-body">
            {selectedOrder && (
              <>
                <div className="grid-2" style={{ marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Supplier</div>
                    <div style={{ fontWeight: '500' }}>{selectedOrder.supplier}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Date</div>
                    <div>{selectedOrder.createdAt}</div>
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Status</div>
                  <span className={`badge ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
                </div>
                {selectedOrder.notes && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Notes</div>
                    <div>{selectedOrder.notes}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Items</div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Unit Cost</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.name}</td>
                          <td className="mono">{item.quantity}</td>
                          <td className="mono">{formatCurrency(item.cost)}</td>
                          <td className="mono">{formatCurrency(item.quantity * item.cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'right', fontWeight: '600' }}>Total:</td>
                        <td className="mono" style={{ fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(selectedOrder.total)}</td>
                      </tr>
                    </tfoot>
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