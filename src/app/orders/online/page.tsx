'use client';

import { useState, useEffect } from 'react';
import { menuItems } from '@/lib/mockData';
import { OrderItem } from '@/types';

interface OnlineOrder {
  id: string;
  platform: 'website' | 'phone' | 'uber_eats' | 'doordash' | 'grubhub';
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  tax: number;
  deliveryFee?: number;
  discount?: number;
  status: 'new' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: Date;
  acceptedAt?: Date;
  preparingAt?: Date;
  readyAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  estimatedTime: number;
  actualTime?: number;
  specialInstructions?: string;
  driverName?: string;
  driverPhone?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: 'online' | 'cod' | 'card';
  transactionId?: string;
  orderUpdates: { time: Date; message: string; type: 'system' | 'staff' | 'customer' }[];
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
    customerEmail: 'alex.t@email.com',
    customerAddress: '456 Oak Street, Apt 3B',
    items: [
      { menuItemId: '1', name: 'Truffle Risotto', quantity: 1, price: 28.00 },
      { menuItemId: '8', name: 'Craft Lemonade', quantity: 2, price: 6.00 }
    ],
    subtotal: 40.00,
    tax: 3.60,
    deliveryFee: 4.99,
    total: 48.59,
    status: 'new',
    createdAt: new Date(now.getTime() - 3 * 60000),
    estimatedTime: 25,
    paymentStatus: 'paid',
    paymentMethod: 'online',
    transactionId: 'TXN-Uber-001',
    orderUpdates: [
      { time: new Date(now.getTime() - 3 * 60000), message: 'Order received', type: 'system' }
    ]
  },
  {
    id: 'ONL-002',
    platform: 'website',
    customerName: 'Maria Garcia',
    customerPhone: '(555) 333-4444',
    customerEmail: 'maria.g@email.com',
    customerAddress: '789 Pine Avenue',
    items: [
      { menuItemId: '4', name: 'Wagyu Burger', quantity: 2, price: 26.00 },
      { menuItemId: '3', name: 'Caesar Salad', quantity: 1, price: 14.00 }
    ],
    subtotal: 66.00,
    tax: 5.94,
    total: 71.94,
    status: 'preparing',
    createdAt: new Date(now.getTime() - 12 * 60000),
    acceptedAt: new Date(now.getTime() - 10 * 60000),
    preparingAt: new Date(now.getTime() - 8 * 60000),
    estimatedTime: 20,
    actualTime: 18,
    specialInstructions: 'No onions on burger, extra cheese on salad',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    transactionId: 'TXN-Web-002',
    orderUpdates: [
      { time: new Date(now.getTime() - 12 * 60000), message: 'Order placed', type: 'customer' },
      { time: new Date(now.getTime() - 10 * 60000), message: 'Order accepted by kitchen', type: 'staff' },
      { time: new Date(now.getTime() - 8 * 60000), message: 'Preparation started', type: 'system' }
    ]
  },
  {
    id: 'ONL-003',
    platform: 'doordash',
    customerName: 'David Kim',
    customerPhone: '(555) 555-6666',
    customerAddress: '321 Elm Street, Suite 5',
    items: [
      { menuItemId: '6', name: 'Spicy Ramen', quantity: 2, price: 22.00 },
      { menuItemId: '7', name: 'Bruschetta', quantity: 1, price: 10.00 }
    ],
    subtotal: 54.00,
    tax: 4.86,
    deliveryFee: 5.99,
    total: 64.85,
    status: 'ready',
    createdAt: new Date(now.getTime() - 25 * 60000),
    acceptedAt: new Date(now.getTime() - 23 * 60000),
    preparingAt: new Date(now.getTime() - 20 * 60000),
    readyAt: new Date(now.getTime() - 5 * 60000),
    estimatedTime: 15,
    driverName: 'John D.',
    driverPhone: '(555) 999-0000',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    transactionId: 'TXN-DD-003',
    orderUpdates: [
      { time: new Date(now.getTime() - 25 * 60000), message: 'Order received via DoorDash', type: 'system' },
      { time: new Date(now.getTime() - 5 * 60000), message: 'Ready for pickup', type: 'system' }
    ]
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
    subtotal: 56.00,
    tax: 5.04,
    total: 61.04,
    status: 'accepted',
    createdAt: new Date(now.getTime() - 5 * 60000),
    acceptedAt: new Date(now.getTime() - 3 * 60000),
    estimatedTime: 25,
    specialInstructions: 'Please call when arriving',
    paymentStatus: 'pending',
    paymentMethod: 'cod',
    orderUpdates: [
      { time: new Date(now.getTime() - 5 * 60000), message: 'Order received by phone', type: 'system' },
      { time: new Date(now.getTime() - 3 * 60000), message: 'Order confirmed', type: 'staff' }
    ]
  },
  {
    id: 'ONL-005',
    platform: 'grubhub',
    customerName: 'Robert Chen',
    customerPhone: '(555) 888-9999',
    customerAddress: '555 Maple Drive',
    items: [
      { menuItemId: '9', name: 'Vegan Buddha Bowl', quantity: 1, price: 19.00 },
      { menuItemId: '8', name: 'Craft Lemonade', quantity: 1, price: 6.00 }
    ],
    subtotal: 25.00,
    tax: 2.25,
    deliveryFee: 3.99,
    total: 31.24,
    status: 'delivered',
    createdAt: new Date(now.getTime() - 90 * 60000),
    acceptedAt: new Date(now.getTime() - 88 * 60000),
    preparingAt: new Date(now.getTime() - 85 * 60000),
    readyAt: new Date(now.getTime() - 70 * 60000),
    pickedUpAt: new Date(now.getTime() - 65 * 60000),
    deliveredAt: new Date(now.getTime() - 45 * 60000),
    estimatedTime: 20,
    actualTime: 45,
    paymentStatus: 'paid',
    paymentMethod: 'online',
    transactionId: 'TXN-GH-005',
    orderUpdates: [
      { time: new Date(now.getTime() - 90 * 60000), message: 'Order received via Grubhub', type: 'system' },
      { time: new Date(now.getTime() - 45 * 60000), message: 'Delivered', type: 'system' }
    ]
  },
];

export default function OnlineOrdersPage() {
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>(initialOnlineOrders);
  const [filter, setFilter] = useState<string>('active');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [showAssignDriverModal, setShowAssignDriverModal] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');

  const [newOrderForm, setNewOrderForm] = useState({
    platform: 'website' as OnlineOrder['platform'],
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    items: [] as OrderItem[],
    specialInstructions: '',
    paymentMethod: 'online' as 'online' | 'cod' | 'card',
    estimatedTime: 25,
    applyDiscount: false,
    discountCode: ''
  });

  const filteredOrders = onlineOrders.filter(o => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && ['new', 'accepted', 'preparing', 'ready'].includes(o.status)) ||
      (filter === 'completed' && ['picked_up', 'delivered'].includes(o.status)) ||
      (filter === 'cancelled' && o.status === 'cancelled') ||
      (filter === o.status);
    const matchesPlatform = platformFilter === 'all' || o.platform === platformFilter;
    const matchesSearch = !searchTerm || 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm);
    return matchesFilter && matchesPlatform && matchesSearch;
  });

  const stats = {
    new: onlineOrders.filter(o => o.status === 'new').length,
    preparing: onlineOrders.filter(o => ['accepted', 'preparing'].includes(o.status)).length,
    ready: onlineOrders.filter(o => o.status === 'ready').length,
    completed: onlineOrders.filter(o => ['picked_up', 'delivered'].includes(o.status)).length,
    revenue: onlineOrders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
    avgTime: onlineOrders.filter(o => o.actualTime).reduce((sum, o, _, arr) => sum + (o.actualTime || 0) / arr.length, 0)
  };

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

  const calculateTotal = () => {
    const subtotal = newOrderForm.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const tax = subtotal * 0.09;
    const deliveryFee = newOrderForm.customerAddress ? 4.99 : 0;
    const discount = newOrderForm.applyDiscount && newOrderForm.discountCode === 'SAVE10' ? subtotal * 0.10 : 0;
    return { subtotal, tax, deliveryFee, discount, total: subtotal + tax + deliveryFee - discount };
  };

  const { subtotal, tax, deliveryFee, discount, total } = calculateTotal();

  const createOnlineOrder = () => {
    if (!newOrderForm.customerName || !newOrderForm.customerPhone || newOrderForm.items.length === 0) return;

    const newOrder: OnlineOrder = {
      id: `ONL-${String(onlineOrders.length + 1).padStart(3, '0')}`,
      platform: newOrderForm.platform,
      customerName: newOrderForm.customerName,
      customerPhone: newOrderForm.customerPhone,
      customerEmail: newOrderForm.customerEmail || undefined,
      customerAddress: newOrderForm.customerAddress || undefined,
      items: newOrderForm.items,
      subtotal,
      tax,
      deliveryFee,
      discount: discount || undefined,
      total,
      status: 'new',
      createdAt: new Date(),
      estimatedTime: newOrderForm.estimatedTime,
      specialInstructions: newOrderForm.specialInstructions || undefined,
      paymentStatus: ['online', 'card'].includes(newOrderForm.paymentMethod) ? 'paid' : 'pending',
      paymentMethod: newOrderForm.paymentMethod,
      orderUpdates: [{ time: new Date(), message: `Order received via ${getPlatformName(newOrderForm.platform)}`, type: 'system' }]
    };

    setOnlineOrders([newOrder, ...onlineOrders]);
    setShowNewOrderModal(false);
    setNewOrderForm({
      platform: 'website',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
      items: [],
      specialInstructions: '',
      paymentMethod: 'online',
      estimatedTime: 25,
      applyDiscount: false,
      discountCode: ''
    });
  };

  const updateStatus = (orderId: string, newStatus: OnlineOrder['status']) => {
    const order = onlineOrders.find(o => o.id === orderId);
    if (!order) return;

    const updates = [...order.orderUpdates];
    let actualTime: number | undefined;

    const nowDate = new Date();

    switch (newStatus) {
      case 'accepted':
        updates.push({ time: nowDate, message: 'Order accepted by kitchen', type: 'staff' });
        break;
      case 'preparing':
        updates.push({ time: nowDate, message: 'Preparation started', type: 'system' });
        break;
      case 'ready':
        updates.push({ time: nowDate, message: 'Ready for pickup/delivery', type: 'system' });
        break;
      case 'picked_up':
        updates.push({ time: nowDate, message: 'Picked up by driver', type: 'system' });
        break;
      case 'delivered':
        updates.push({ time: nowDate, message: 'Order delivered', type: 'system' });
        actualTime = Math.round((nowDate.getTime() - new Date(order.createdAt).getTime()) / 60000);
        break;
      case 'cancelled':
        updates.push({ time: nowDate, message: 'Order cancelled', type: 'staff' });
        break;
    }

    setOnlineOrders(onlineOrders.map(o => o.id === orderId ? {
      ...o,
      status: newStatus,
      ...(newStatus === 'accepted' ? { acceptedAt: nowDate } : {}),
      ...(newStatus === 'preparing' ? { preparingAt: nowDate } : {}),
      ...(newStatus === 'ready' ? { readyAt: nowDate } : {}),
      ...(newStatus === 'picked_up' ? { pickedUpAt: nowDate } : {}),
      ...(newStatus === 'delivered' ? { deliveredAt: nowDate, actualTime } : {}),
      orderUpdates: updates
    } : o));
  };

  const assignDriver = () => {
    if (!selectedOrder || !driverName) return;
    setOnlineOrders(onlineOrders.map(o => o.id === selectedOrder.id ? {
      ...o,
      driverName,
      driverPhone: driverPhone || undefined,
      orderUpdates: [...o.orderUpdates, { time: new Date(), message: `Driver assigned: ${driverName}`, type: 'staff' }]
    } : o));
    setShowAssignDriverModal(false);
    setDriverName('');
    setDriverPhone('');
  };

  const viewOrderDetail = (order: OnlineOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: OnlineOrder['status']) => {
    switch (status) {
      case 'new': return 'badge-warning';
      case 'accepted': return 'badge-in_progress';
      case 'preparing': return 'badge-in_progress';
      case 'ready': return 'badge-available';
      case 'picked_up': return 'badge-primary';
      case 'delivered': return 'badge-success';
      case 'cancelled': return 'badge-cancelled';
      default: return '';
    }
  };

  const getPlatformStats = () => {
    const platforms: Record<string, { count: number; revenue: number }> = {};
    onlineOrders.forEach(o => {
      if (!platforms[o.platform]) platforms[o.platform] = { count: 0, revenue: 0 };
      platforms[o.platform].count++;
      if (o.paymentStatus === 'paid') platforms[o.platform].revenue += o.total;
    });
    return platforms;
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
          <div className="stat-value" style={{ fontSize: '32px' }}>{stats.new}</div>
          <div className="stat-label">New Orders</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--primary)' }}>
          <div className="stat-value" style={{ fontSize: '32px' }}>{stats.preparing}</div>
          <div className="stat-label">Preparing</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--success)' }}>
          <div className="stat-value" style={{ fontSize: '32px' }}>{stats.ready}</div>
          <div className="stat-label">Ready</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--secondary)' }}>
          <div className="stat-value" style={{ fontSize: '32px' }}>{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginBottom: '24px' }}>
        <div className="filter-bar">
          <input 
            className="form-input" 
            style={{ width: '250px' }}
            placeholder="Search orders..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select className="form-select" style={{ width: '140px' }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="active">Active</option>
            <option value="all">All Orders</option>
            <option value="new">New</option>
            <option value="accepted">Accepted</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className="form-select" style={{ width: '140px' }} value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
            <option value="all">All Platforms</option>
            <option value="website">Website</option>
            <option value="phone">Phone</option>
            <option value="uber_eats">Uber Eats</option>
            <option value="doordash">DoorDash</option>
            <option value="grubhub">Grubhub</option>
          </select>
        </div>
        
        <div className="data-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Platform Performance</div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {Object.entries(getPlatformStats()).map(([platform, data]) => (
              <div key={platform} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px' }}>{getPlatformIcon(platform as OnlineOrder['platform'])}</div>
                <div className="mono" style={{ fontSize: '12px' }}>{data.count} orders</div>
              </div>
            ))}
          </div>
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
            {filteredOrders.map((order) => (
              <tr key={order.id} style={{ background: order.status === 'new' ? 'rgba(255, 193, 7, 0.1)' : 'inherit' }}>
                <td className="mono" style={{ fontWeight: '600' }}>{order.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{getPlatformIcon(order.platform)}</span>
                    <span style={{ fontSize: '12px' }}>{getPlatformName(order.platform)}</span>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: '600' }}>{order.customerName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.customerPhone}</div>
                  {order.driverName && (
                    <div style={{ fontSize: '10px', color: 'var(--primary)' }}>🚗 {order.driverName}</div>
                  )}
                </td>
                <td>
                  <div style={{ fontSize: '12px' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx}>{item.quantity}x {item.name}</div>
                    ))}
                  </div>
                </td>
                <td className="mono" style={{ fontWeight: '600' }}>{formatCurrency(order.total)}</td>
                <td className="mono">
                  {order.actualTime ? (
                    <span style={{ color: order.actualTime <= order.estimatedTime ? 'var(--success)' : 'var(--danger)' }}>
                      {order.actualTime}m
                    </span>
                  ) : (
                    <span>{order.estimatedTime}m</span>
                  )}
                </td>
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
                <td className="mono" style={{ fontSize: '12px' }}>{formatTime(order.createdAt)}</td>
                <td>
                  <button className="action-btn" onClick={() => viewOrderDetail(order)}>View</button>
                  {order.status === 'new' && (
                    <>
                      <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '11px', marginLeft: '4px' }} onClick={() => updateStatus(order.id, 'accepted')}>Accept</button>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '11px', marginLeft: '4px' }} onClick={() => updateStatus(order.id, 'preparing')}>Start</button>
                  )}
                  {order.status === 'preparing' && (
                    <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '11px', marginLeft: '4px' }} onClick={() => updateStatus(order.id, 'ready')}>Ready</button>
                  )}
                  {order.status === 'ready' && order.customerAddress && !order.driverName && (
                    <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '11px', marginLeft: '4px' }} onClick={() => { setSelectedOrder(order); setShowAssignDriverModal(true); }}>Assign Driver</button>
                  )}
                  {order.status === 'ready' && (
                    <button className="btn btn-success" style={{ padding: '2px 8px', fontSize: '11px', marginLeft: '4px' }} onClick={() => updateStatus(order.id, order.customerAddress ? 'picked_up' : 'delivered')}>
                      {order.customerAddress ? 'Picked Up' : 'Complete'}
                    </button>
                  )}
                  {order.status === 'picked_up' && (
                    <button className="btn btn-success" style={{ padding: '2px 8px', fontSize: '11px', marginLeft: '4px' }} onClick={() => updateStatus(order.id, 'delivered')}>Delivered</button>
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

      {/* Order Detail Modal */}
      <div className={`modal-overlay ${showDetailModal ? 'active' : ''}`} onClick={() => setShowDetailModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
          <div className="modal-header">
            <h2 className="modal-title">Order Details - {selectedOrder?.id}</h2>
            <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
          </div>
          <div className="modal-body">
            {selectedOrder && (
              <>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Customer</div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>{selectedOrder.customerName}</div>
                    <div style={{ fontSize: '13px' }}>{selectedOrder.customerPhone}</div>
                    {selectedOrder.customerEmail && <div style={{ fontSize: '12px' }}>{selectedOrder.customerEmail}</div>}
                    {selectedOrder.customerAddress && <div style={{ fontSize: '12px', marginTop: '8px' }}>{selectedOrder.customerAddress}</div>}
                  </div>
                  <div style={{ flex: 1, minWidth: '200px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Order Info</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '24px' }}>{getPlatformIcon(selectedOrder.platform)}</span>
                      <span style={{ fontWeight: '600' }}>{getPlatformName(selectedOrder.platform)}</span>
                    </div>
                    <div className={`badge ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status.replace('_', ' ')}</div>
                    {selectedOrder.actualTime && (
                      <div style={{ fontSize: '12px', marginTop: '8px', color: selectedOrder.actualTime <= selectedOrder.estimatedTime ? 'var(--success)' : 'var(--danger)' }}>
                        Actual time: {selectedOrder.actualTime} min (Est: {selectedOrder.estimatedTime} min)
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <div className="data-card-title" style={{ marginBottom: '12px' }}>Order Items</div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.name}</td>
                          <td className="mono">{item.quantity}</td>
                          <td className="mono">{formatCurrency(item.price)}</td>
                          <td className="mono">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr><td colSpan={3} style={{ textAlign: 'right' }}>Subtotal:</td><td className="mono">{formatCurrency(selectedOrder.subtotal)}</td></tr>
                      <tr><td colSpan={3} style={{ textAlign: 'right' }}>Tax:</td><td className="mono">{formatCurrency(selectedOrder.tax)}</td></tr>
                      {selectedOrder.deliveryFee && selectedOrder.deliveryFee > 0 && <tr><td colSpan={3} style={{ textAlign: 'right' }}>Delivery:</td><td className="mono">{formatCurrency(selectedOrder.deliveryFee)}</td></tr>}
                      {selectedOrder.discount && <tr><td colSpan={3} style={{ textAlign: 'right', color: 'var(--success)' }}>Discount:</td><td className="mono" style={{ color: 'var(--success)' }}>-{formatCurrency(selectedOrder.discount)}</td></tr>}
                      <tr><td colSpan={3} style={{ textAlign: 'right', fontWeight: '600' }}>Total:</td><td className="mono" style={{ fontWeight: '700', fontSize: '16px' }}>{formatCurrency(selectedOrder.total)}</td></tr>
                    </tfoot>
                  </table>
                </div>

                {selectedOrder.specialInstructions && (
                  <div style={{ marginBottom: '24px', padding: '12px', background: 'rgba(255, 193, 7, 0.1)', borderRadius: '8px', borderLeft: '3px solid var(--warning)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Special Instructions</div>
                    <div style={{ fontSize: '14px' }}>{selectedOrder.specialInstructions}</div>
                  </div>
                )}

                <div>
                  <div className="data-card-title" style={{ marginBottom: '12px' }}>Order Timeline</div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {selectedOrder.orderUpdates.slice().reverse().map((update, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '80px' }}>{formatTime(update.time)}</span>
                        <span style={{ fontSize: '13px' }}>{update.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Close</button>
          </div>
        </div>
      </div>

      {/* Assign Driver Modal */}
      <div className={`modal-overlay ${showAssignDriverModal ? 'active' : ''}`} onClick={() => setShowAssignDriverModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Assign Driver</h2>
            <button className="modal-close" onClick={() => setShowAssignDriverModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Driver Name</label>
              <input className="form-input" value={driverName} onChange={e => setDriverName(e.target.value)} placeholder="Driver name" />
            </div>
            <div className="form-group">
              <label className="form-label">Driver Phone</label>
              <input className="form-input" value={driverPhone} onChange={e => setDriverPhone(e.target.value)} placeholder="(555) 123-4567" />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowAssignDriverModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={assignDriver} disabled={!driverName}>Assign Driver</button>
          </div>
        </div>
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

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={newOrderForm.customerEmail} onChange={e => setNewOrderForm({ ...newOrderForm, customerEmail: e.target.value })} placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <input className="form-input" value={newOrderForm.customerAddress} onChange={e => setNewOrderForm({ ...newOrderForm, customerAddress: e.target.value })} placeholder="Full address" />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-select" value={newOrderForm.paymentMethod} onChange={e => setNewOrderForm({ ...newOrderForm, paymentMethod: e.target.value as 'online' | 'cod' | 'card' })}>
                  <option value="online">Online Payment</option>
                  <option value="card">Card</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Time (min)</label>
                <input className="form-input" type="number" value={newOrderForm.estimatedTime} onChange={e => setNewOrderForm({ ...newOrderForm, estimatedTime: parseInt(e.target.value) || 25 })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Discount Code</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input className="form-input" style={{ flex: 1 }} value={newOrderForm.discountCode} onChange={e => setNewOrderForm({ ...newOrderForm, discountCode: e.target.value })} placeholder="Enter code" />
                <button className="btn btn-secondary" onClick={() => setNewOrderForm({ ...newOrderForm, applyDiscount: !newOrderForm.applyDiscount })}>
                  {newOrderForm.applyDiscount ? 'Remove' : 'Apply'}
                </button>
              </div>
              {newOrderForm.applyDiscount && newOrderForm.discountCode === 'SAVE10' && (
                <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '4px' }}>✓ 10% discount applied!</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Menu Items</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
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
                <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span>Subtotal:</span><span className="mono">{formatCurrency(subtotal)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span>Tax:</span><span className="mono">{formatCurrency(tax)}</span></div>
                  {deliveryFee > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span>Delivery:</span><span className="mono">{formatCurrency(deliveryFee)}</span></div>}
                  {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--success)' }}><span>Discount:</span><span className="mono">-{formatCurrency(discount)}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}><span>Total:</span><span className="mono">{formatCurrency(total)}</span></div>
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