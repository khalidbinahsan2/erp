'use client';

import { useState } from 'react';
import { orders as initialOrders, tables, menuItems } from '@/lib/mockData';
import { Order, OrderItem } from '@/types';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const mockCustomers: Customer[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@email.com', phone: '(555) 123-4567' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '(555) 234-5678' },
  { id: '3', name: 'Michael Brown', email: 'mbrown@email.com', phone: '(555) 345-6789' },
  { id: '4', name: 'Emily Davis', email: 'emily.davis@email.com', phone: '(555) 456-7890' },
  { id: '5', name: 'Robert Wilson', email: 'rwilson@email.com', phone: '(555) 567-8901' },
  { id: '6', name: 'Jennifer Lee', email: 'jlee@email.com', phone: '(555) 678-9012' },
];

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [instructions, setInstructions] = useState('');

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const addItemToOrder = (menuItem: typeof menuItems[0]) => {
    const existing = orderItems.find(i => i.menuItemId === menuItem.id);
    if (existing) {
      setOrderItems(orderItems.map(i => 
        i.menuItemId === menuItem.id 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setOrderItems([...orderItems, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: 1,
        price: menuItem.price
      }]);
    }
  };

  const removeItem = (menuItemId: string) => {
    const existing = orderItems.find(i => i.menuItemId === menuItemId);
    if (existing && existing.quantity > 1) {
      setOrderItems(orderItems.map(i =>
        i.menuItemId === menuItemId
          ? { ...i, quantity: i.quantity - 1 }
          : i
      ));
    } else {
      setOrderItems(orderItems.filter(i => i.menuItemId !== menuItemId));
    }
  };

  const orderTotal = orderItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  const createOrder = () => {
    if (!selectedTable || orderItems.length === 0) return;
    const table = tables.find(t => t.id === selectedTable);
    const customer = selectedCustomer ? mockCustomers.find(c => c.id === selectedCustomer) : null;
    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      tableId: selectedTable,
      tableNumber: table?.number || 0,
      items: orderItems,
      total: orderTotal,
      status: 'pending',
      createdAt: new Date(),
      specialInstructions: instructions,
      customerId: customer?.id,
      customerName: customer?.name
    };
    setOrders([newOrder, ...orders]);
    setShowModal(false);
    setSelectedTable('');
    setSelectedCustomer('');
    setOrderItems([]);
    setInstructions('');
  };

  const updateStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Order
        </button>
      </div>

      <div className="filter-bar">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
        <button className={`filter-btn ${filter === 'in_progress' ? 'active' : ''}`} onClick={() => setFilter('in_progress')}>In Progress</button>
        <button className={`filter-btn ${filter === 'ready' ? 'active' : ''}`} onClick={() => setFilter('ready')}>Ready</button>
        <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
        <button className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>Cancelled</button>
      </div>

      <div className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Table</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="mono">{order.id}</td>
                <td>Table {order.tableNumber}</td>
                <td>
                  {order.customerName ? (
                    <span className="badge badge-in_progress">{order.customerName}</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                  )}
                </td>
                <td>
                  {order.items.map((item, idx) => (
                    <span key={idx}>{item.quantity}x {item.name}{idx < order.items.length - 1 ? ', ' : ''}</span>
                  ))}
                </td>
                <td className="mono">{formatCurrency(order.total)}</td>
                <td>
                  <span className={`badge badge-${order.status}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </td>
                <td>{formatTime(order.createdAt)}</td>
                <td>
                  {order.status === 'pending' && (
                    <button className="action-btn" onClick={() => updateStatus(order.id, 'in_progress')}>Start</button>
                  )}
                  {order.status === 'in_progress' && (
                    <button className="action-btn" onClick={() => updateStatus(order.id, 'ready')}>Ready</button>
                  )}
                  {order.status === 'ready' && (
                    <button className="action-btn" onClick={() => updateStatus(order.id, 'completed')}>Complete</button>
                  )}
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <button className="action-btn delete" style={{ marginLeft: '8px' }} onClick={() => updateStatus(order.id, 'cancelled')}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={() => setShowModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
          <div className="modal-header">
            <h2 className="modal-title">New Order</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Select Table</label>
              <select className="form-select" value={selectedTable} onChange={e => setSelectedTable(e.target.value)}>
                <option value="">Choose a table...</option>
                {tables.filter(t => t.status === 'available').map(table => (
                  <option key={table.id} value={table.id}>Table {table.number} (Capacity: {table.capacity})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Customer (Optional)</label>
              <select className="form-select" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
                <option value="">Walk-in Customer</option>
                {mockCustomers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name} - {customer.phone}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Menu Items</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                {menuItems.filter(m => m.available).map(item => (
                  <div key={item.id} style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', cursor: 'pointer' }} onClick={() => addItemToOrder(item)}>
                    <div style={{ fontWeight: '600' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.category}</div>
                    <div style={{ color: 'var(--primary)', fontFamily: 'JetBrains Mono' }}>{formatCurrency(item.price)}</div>
                  </div>
                ))}
              </div>
            </div>
            {orderItems.length > 0 && (
              <div className="form-group">
                <label className="form-label">Order Items</label>
                {orderItems.map(item => (
                  <div key={item.menuItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'var(--bg-elevated)', borderRadius: '6px', marginBottom: '8px' }}>
                    <span>{item.name} x{item.quantity}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="mono">{formatCurrency(item.price * item.quantity)}</span>
                      <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.menuItemId)}>−</button>
                    </div>
                  </div>
                ))}
                <div style={{ textAlign: 'right', fontSize: '18px', fontWeight: '600', marginTop: '12px' }}>
                  Total: <span className="mono">{formatCurrency(orderTotal)}</span>
                </div>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Special Instructions</label>
              <input className="form-input" placeholder="Any special requests..." value={instructions} onChange={e => setInstructions(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={createOrder} disabled={!selectedTable || orderItems.length === 0}>Create Order</button>
          </div>
        </div>
      </div>
    </>
  );
}
