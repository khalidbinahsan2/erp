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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [instructions, setInstructions] = useState('');

  // Payment state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('cash');
  const [tipAmount, setTipAmount] = useState('');

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
      customerName: customer?.name,
      paymentStatus: 'unpaid'
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

  const openPaymentModal = (order: Order) => {
    setSelectedOrder(order);
    setPaymentAmount(order.total.toString());
    setTipAmount('');
    setPaymentMethod('cash');
    setShowPaymentModal(true);
  };

  const processPayment = () => {
    if (!selectedOrder || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    const tip = tipAmount ? parseFloat(tipAmount) : 0;
    const change = paymentMethod === 'cash' ? Math.max(0, amount - selectedOrder.total - tip) : 0;
    
    setOrders(orders.map(o => o.id === selectedOrder.id ? {
      ...o,
      status: 'completed',
      paymentStatus: 'paid' as const,
      paymentMethod,
      paidAmount: amount,
      changeGiven: change,
      tip: tip > 0 ? tip : undefined,
      paymentDate: new Date().toISOString()
    } : o));
    
    setShowPaymentModal(false);
  };

  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case 'paid': return 'badge-available';
      case 'partial': return 'badge-pending';
      default: return 'badge-cancelled';
    }
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
              <th>Payment</th>
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
                <td className="mono" style={{ fontWeight: '600' }}>{formatCurrency(order.total)}</td>
                <td>
                  {order.status === 'completed' ? (
                    <span className={`badge ${getPaymentStatusBadge(order.paymentStatus)}`}>
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  ) : order.paymentStatus === 'paid' ? (
                    <span className="badge badge-available">Paid</span>
                  ) : (
                    <span className="badge badge-cancelled">Unpaid</span>
                  )}
                </td>
                <td>
                  <span className={`badge badge-${order.status}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </td>
                <td>{formatTime(order.createdAt)}</td>
                <td>
                  {order.status === 'ready' && order.paymentStatus !== 'paid' && (
                    <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => openPaymentModal(order)}>
                      Pay
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <button className="action-btn" onClick={() => updateStatus(order.id, 'in_progress')}>Start</button>
                  )}
                  {order.status === 'in_progress' && (
                    <button className="action-btn" onClick={() => updateStatus(order.id, 'ready')}>Ready</button>
                  )}
                  {order.status === 'ready' && order.paymentStatus === 'paid' && (
                    <button className="action-btn" onClick={() => updateStatus(order.id, 'completed')}>Complete</button>
                  )}
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <button className="action-btn delete" style={{ marginLeft: '8px' }} onClick={() => updateStatus(order.id, 'cancelled')}>Cancel</button>
                  )}
                  {order.status === 'completed' && (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Done</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Order Modal */}
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

      {/* Payment Modal */}
      <div className={`modal-overlay ${showPaymentModal ? 'active' : ''}`} onClick={() => setShowPaymentModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Process Payment - {selectedOrder?.id}</h2>
            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
          </div>
          <div className="modal-body">
            {selectedOrder && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Order Total</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(selectedOrder.total)}</div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Customer</div>
                    <div style={{ fontSize: '20px', fontWeight: '600' }}>{selectedOrder.customerName || 'Walk-in'}</div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {(['cash', 'card', 'online'] as const).map(method => (
                      <button
                        key={method}
                        className={`btn ${paymentMethod === method ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1, textTransform: 'capitalize' }}
                        onClick={() => setPaymentMethod(method)}
                      >
                        {method === 'cash' ? '💵 Cash' : method === 'card' ? '💳 Card' : '📱 Online'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Amount Tendered</label>
                    <input 
                      className="form-input" 
                      type="number" 
                      step="0.01"
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tip (Optional)</label>
                    <input 
                      className="form-input" 
                      type="number" 
                      step="0.01"
                      value={tipAmount}
                      onChange={e => setTipAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {paymentMethod === 'cash' && paymentAmount && (
                  <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Order Total:</span>
                      <span className="mono">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Tip:</span>
                      <span className="mono">{formatCurrency(tipAmount ? parseFloat(tipAmount) : 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '600' }}>
                      <span>Total Due:</span>
                      <span className="mono">{formatCurrency(selectedOrder.total + (tipAmount ? parseFloat(tipAmount) : 0))}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border)', fontWeight: '600', color: 'var(--success)' }}>
                      <span>Change:</span>
                      <span className="mono">{formatCurrency(Math.max(0, parseFloat(paymentAmount || '0') - selectedOrder.total - (tipAmount ? parseFloat(tipAmount) : 0)))}</span>
                    </div>
                  </div>
                )}

                {paymentMethod !== 'cash' && paymentAmount && (
                  <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px', marginTop: '16px', textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>Total to Charge</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>
                      {formatCurrency(selectedOrder.total + (tipAmount ? parseFloat(tipAmount) : 0))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
            <button 
              className="btn btn-primary" 
              onClick={processPayment}
              disabled={!paymentAmount || parseFloat(paymentAmount) < (selectedOrder?.total || 0)}
            >
              Process Payment
            </button>
          </div>
        </div>
      </div>
    </>
  );
}