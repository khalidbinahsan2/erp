'use client';

import { useState } from 'react';
import { orders as initialOrders, menuItems, tables } from '@/lib/mockData';
import { Order, OrderItem } from '@/types';

interface OnlineOrder {
  id: string;
  platform: 'website' | 'phone' | 'uber_eats' | 'doordash' | 'grubhub';
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: OrderItem[];
  total: number;
  status: 'new' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'cancelled';
  createdAt: Date;
  estimatedTime: number;
  specialInstructions?: string;
  paymentStatus: 'pending' | 'paid';
  paymentMethod: 'online' | 'cod';
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function getPlatformIcon(platform: OnlineOrder['platform']): string {
  switch (platform) {
    case 'website': return '🌐';
    case 'phone': return '📞';
    case 'uber_eats': return '🟢';
    case 'doordash': return '🔴';
    case 'grubhub': return '🟠';
    default: return '📦';
  }
}

function getPlatformName(platform: OnlineOrder['platform']): string {
  switch (platform) {
    case 'website': return 'Website';
    case 'phone': return 'Phone Order';
    case 'uber_eats': return 'Uber Eats';
    case 'doordash': return 'DoorDash';
    case 'grubhub': return 'Grubhub';
    default: return platform;
  }
}

const now = new Date();

const initialOnlineOrders: OnlineOrder[] = [
  {
    id: 'ONL-001',
    platform: 'uber_eats',
    customerName: 'Alex Thompson',
    customerPhone: '(555) 111-2222',
    customerAddress: '456 Oak Street, Apt 3B',
    items: [
      { menuItemId: '1', name: 'Truffle Risotto', quantity: 1, price: 28.00 },
      { menuItemId: '8', name: 'Craft Lemonade', quantity: 2, price: 6.00 }
    ],
    total: 40.00,
    status: 'new',
    createdAt: new Date(now.getTime() - 3 * 60000),
    estimatedTime: 25,
    paymentStatus: 'paid',
    paymentMethod: 'online'
  },
  {
    id: 'ONL-002',
    platform: 'website',
    customerName: 'Maria Garcia',
    customerPhone: '(555) 333-4444',
    customerAddress: '789 Pine Avenue',
    items: [
      { menuItemId: '4', name: 'Wagyu Burger', quantity: 2, price: 26.00 },
      { menuItemId: '3', name: 'Caesar Salad', quantity: 1, price: 14.00 }
    ],
    total: 66.00,
    status: 'preparing',
    createdAt: new Date(now.getTime() - 10 * 60000),
    estimatedTime: 20,
    specialInstructions: 'No onions on burger',
    paymentStatus: 'paid',
    paymentMethod: 'online'
  },
  {
    id: 'ONL-003',
    platform: 'doordash',
    customerName: 'David Kim',
    customerPhone: '(555) 555-6666',
    customerAddress: '321 Elm Street',
    items: [
      { menuItemId: '6', name: 'Spicy Ramen', quantity: 2, price: 22.00 }
    ],
    total: 44.00,
    status: 'ready',
    createdAt: new Date(now.getTime() - 18 * 60000),
    estimatedTime: 15,
    paymentStatus: 'paid',
    paymentMethod: 'online'
  },
  {
    id: 'ONL-004',
    platform: 'phone',
    customerName: 'Jennifer White',
    customerPhone: '(555) 777-8888',
    items: [
      { menuItemId: '2', name: 'Grilled Salmon', quantity: 1, price: 32.00 },
      { menuItemId: '5', name: 'Tiramisu', quantity: 2, price: 12.00 }
    ],
    total: 56.00,
    status: 'accepted',
    createdAt: new Date(now.getTime() - 5 * 60000),
    estimatedTime: 25,
    paymentStatus: 'pending',
    paymentMethod: 'cod'
  },
];

export default function OnlineOrdersPage() {
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>(initialOnlineOrders);

  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
    platform: 'website' as OnlineOrder['platform'],
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    items: [] as OrderItem[],
    specialInstructions: '',
    paymentMethod: 'online' as 'online' | 'cod',
    estimatedTime: 25
  });

  const newOrdersCount = onlineOrders.filter(o => o.status === 'new').length;
  const preparingCount = onlineOrders.filter(o => o.status === 'preparing' || o.status === 'accepted').length;
  const readyCount = onlineOrders.filter(o => o.status === 'ready').length;

  const addItemToOrder = (menuItem: typeof menuItems[0]) => {
    const existing = newOrderForm.items.find(i => i.menuItemId === menuItem.id);
    if (existing) {
      setNewOrderForm({
        ...newOrderForm,
        items: newOrderForm.items.map(i => 
          i.menuItemId === menuItem.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      });
    } else {
      setNewOrderForm({
        ...newOrderForm,
        items: [...newOrderForm.items, {
          menuItemId: menuItem.id,
          name: menuItem.name,
          quantity: 1,
          price: menuItem.price
        }]
      });
    }
  };

  const removeItem = (menuItemId: string) => {
    setNewOrderForm({
      ...newOrderForm,
      items: newOrderForm.items.filter(i => i.menuItemId !== menuItemId)
    });
  };

  const orderTotal = newOrderForm.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  const createOnlineOrder = () => {
    if (!newOrderForm.customerName || !newOrderForm.customerPhone || newOrderForm.items.length === 0) return;

    const newOrder: OnlineOrder = {
      id: `ONL-${String(onlineOrders.length + 1).padStart(3, '0')}`,
      ...newOrderForm,
      total: orderTotal,
      status: 'new',
      createdAt: new Date(),
      paymentStatus: newOrderForm.paymentMethod === 'online' ? 'paid' : 'pending'
    };

    setOnlineOrders([newOrder, ...onlineOrders]);
    setShowNewOrderModal(false);
    setNewOrderForm({
      platform: 'website',
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      items: [],
      specialInstructions: '',
      paymentMethod: 'online',
      estimatedTime: 25
    });
  };

  const updateStatus = (orderId: string, newStatus: OnlineOrder['status']) => {
    setOnlineOrders(onlineOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const getStatusColor = (status: OnlineOrder['status']) => {
    switch (status) {
      case 'new': return 'badge-warning';
      case 'accepted': return 'badge-in_progress';
      case 'preparing': return 'badge-in_progress';
      case 'ready': return 'badge-available';
      case 'picked_up': return 'badge-cancelled';
      case 'cancelled': return 'badge-cancelled';
      default: return '';
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Online Orders</h1>
        <button className="btn btn-primary" onClick={() => setShowNewOrderModal(true)}>
          + New Order
        </button>
      </div>

      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ background: 'var(--warning)' }}>
          <div className="stat-value" style={{ fontSize: '32px' }}>{newOrdersCount}</div>
          <div className="stat-label">New Orders</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--primary)' }}>
          <div className="stat-value" style={{ fontSize: '32px' }}>{preparingCount}</div>
          <div className="stat-label">Preparing</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--success)' }}>
          <div className="stat-value" style={{ fontSize: '32px' }}>{readyCount}</div>
          <div className="stat-label">Ready for Pickup</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '32px' }}>{onlineOrders.length}</div>
          <div className="stat-label">Total Today</div>
        </div>
      </div>

      <div className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Platform</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Est. Time</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {onlineOrders.map((order) => (
              <tr key={order.id} style={{ background: order.status === 'new' ? 'rgba(255, 193, 7, 0.1)' : 'inherit' }}>
                <td className="mono" style={{ fontWeight: '600' }}>{order.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{getPlatformIcon(order.platform)}</span>
                    <span>{getPlatformName(order.platform)}</span>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: '600' }}>{order.customerName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.customerPhone}</div>
                  {order.customerAddress && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.customerAddress}</div>
                  )}
                </td>
                <td>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ fontSize: '13px' }}>
                      {item.quantity}x {item.name}
                    </div>
                  ))}
                </td>
                <td className="mono" style={{ fontWeight: '600' }}>{formatCurrency(order.total)}</td>
                <td className="mono">{order.estimatedTime} min</td>
                <td>
                  <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-available' : 'badge-warning'}`}>
                    {order.paymentStatus === 'paid' ? 'Paid' : 'COD'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="mono">{formatTime(order.createdAt)}</td>
                <td>
                  {order.status === 'new' && (
                    <>
                      <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => updateStatus(order.id, 'accepted')}>
                        Accept
                      </button>
                      <button className="action-btn delete" style={{ marginLeft: '8px' }} onClick={() => updateStatus(order.id, 'cancelled')}>
                        Decline
                      </button>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => updateStatus(order.id, 'preparing')}>
                      Start Prep
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => updateStatus(order.id, 'ready')}>
                      Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button className="btn btn-success" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => updateStatus(order.id, 'picked_up')}>
                      Picked Up
                    </button>
                  )}
                  {order.status === 'picked_up' && (
                    <span style={{ fontSize: '12px', color: 'var(--success)' }}>Completed</span>
                  )}
                  {order.status === 'cancelled' && (
                    <span style={{ fontSize: '12px', color: 'var(--danger)' }}>Declined</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {onlineOrders.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-text">No online orders</div>
          </div>
        )}
      </div>

      {/* New Online Order Modal */}
      <div className={`modal-overlay ${showNewOrderModal ? 'active' : ''}`} onClick={() => setShowNewOrderModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
          <div className="modal-header">
            <h2 className="modal-title">New Online Order</h2>
            <button className="modal-close" onClick={() => setShowNewOrderModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Order Source</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['website', 'phone', 'uber_eats', 'doordash', 'grubhub'] as const).map(platform => (
                  <button
                    key={platform}
                    className={`btn ${newOrderForm.platform === platform ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setNewOrderForm({ ...newOrderForm, platform })}
                  >
                    {getPlatformIcon(platform)} {getPlatformName(platform)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <input className="form-input" value={newOrderForm.customerName} onChange={e => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-input" value={newOrderForm.customerPhone} onChange={e => setNewOrderForm({ ...newOrderForm, customerPhone: e.target.value })} placeholder="(555) 123-4567" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Address (Optional)</label>
              <input className="form-input" value={newOrderForm.customerAddress} onChange={e => setNewOrderForm({ ...newOrderForm, customerAddress: e.target.value })} placeholder="Full address for delivery" />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-select" value={newOrderForm.paymentMethod} onChange={e => setNewOrderForm({ ...newOrderForm, paymentMethod: e.target.value as 'online' | 'cod' })}>
                  <option value="online">Online Payment</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Time (min)</label>
                <input className="form-input" type="number" value={newOrderForm.estimatedTime} onChange={e => setNewOrderForm({ ...newOrderForm, estimatedTime: parseInt(e.target.value) || 25 })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Menu Items</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {menuItems.filter(m => m.available).map(item => (
                  <div key={item.id} style={{ padding: '8px', background: 'var(--bg-elevated)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }} onClick={() => addItemToOrder(item)}>
                    <div style={{ fontWeight: '600' }}>{item.name}</div>
                    <div style={{ color: 'var(--primary)' }}>{formatCurrency(item.price)}</div>
                  </div>
                ))}
              </div>
            </div>

            {newOrderForm.items.length > 0 && (
              <div className="form-group">
                <label className="form-label">Order Items</label>
                {newOrderForm.items.map(item => (
                  <div key={item.menuItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px', background: 'var(--bg-elevated)', borderRadius: '4px', marginBottom: '4px', fontSize: '13px' }}>
                    <span>{item.name} x{item.quantity}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="mono">{formatCurrency(item.price * item.quantity)}</span>
                      <button className="btn btn-danger btn-sm" style={{ padding: '2px 8px' }} onClick={() => removeItem(item.menuItemId)}>×</button>
                    </div>
                  </div>
                ))}
                <div style={{ textAlign: 'right', fontWeight: '600', marginTop: '8px' }}>
                  Total: <span className="mono">{formatCurrency(orderTotal)}</span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Special Instructions</label>
              <textarea className="form-input" rows={2} value={newOrderForm.specialInstructions} onChange={e => setNewOrderForm({ ...newOrderForm, specialInstructions: e.target.value })} placeholder="Any special requests..." />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowNewOrderModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={createOnlineOrder} disabled={!newOrderForm.customerName || !newOrderForm.customerPhone || newOrderForm.items.length === 0}>
              Create Order
            </button>
          </div>
        </div>
      </div>
    </>
  );
}