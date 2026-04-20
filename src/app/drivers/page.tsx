'use client';

import { useState } from 'react';
import { menuItems } from '@/lib/mockData';
import { OrderItem } from '@/types';

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  status: 'available' | 'busy' | 'offline';
  currentOrderId?: string;
  totalDeliveries: number;
  rating: number;
  zone: string;
}

interface OnlineOrder {
  id: string;
  platform: 'website' | 'phone' | 'uber_eats' | 'doordash' | 'grubhub';
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: OrderItem[];
  total: number;
  status: 'new' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: Date;
  estimatedTime: number;
  specialInstructions?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  paymentStatus: 'pending' | 'paid';
  paymentMethod: 'online' | 'cod';
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const now = new Date();

const initialDrivers: Driver[] = [
  { id: 'D1', name: 'John Davis', phone: '(555) 111-1111', vehicle: 'Honda Civic - ABC123', status: 'available', totalDeliveries: 245, rating: 4.8, zone: 'Downtown' },
  { id: 'D2', name: 'Mike Wilson', phone: '(555) 222-2222', vehicle: 'Toyota Camry - XYZ789', status: 'busy', currentOrderId: 'ONL-003', totalDeliveries: 189, rating: 4.6, zone: 'West Side' },
  { id: 'D3', name: 'Chris Brown', phone: '(555) 333-3333', vehicle: 'Ford Focus - DEF456', status: 'available', totalDeliveries: 312, rating: 4.9, zone: 'North District' },
  { id: 'D4', name: 'Tom Anderson', phone: '(555) 444-4444', vehicle: 'Hyundai Elantra - GHI012', status: 'offline', totalDeliveries: 156, rating: 4.5, zone: 'East End' },
  { id: 'D5', name: 'Steve Martinez', phone: '(555) 555-5555', vehicle: 'Nissan Altima - JKL345', status: 'available', totalDeliveries: 98, rating: 4.7, zone: 'Downtown' },
];

const initialOrders: OnlineOrder[] = [
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
    total: 48.59,
    status: 'ready',
    createdAt: new Date(now.getTime() - 20 * 60000),
    estimatedTime: 25,
    paymentStatus: 'paid',
    paymentMethod: 'online'
  },
  {
    id: 'ONL-002',
    platform: 'doordash',
    customerName: 'Maria Garcia',
    customerPhone: '(555) 333-4444',
    customerAddress: '789 Pine Avenue',
    items: [
      { menuItemId: '4', name: 'Wagyu Burger', quantity: 2, price: 26.00 },
    ],
    total: 56.00,
    status: 'ready',
    createdAt: new Date(now.getTime() - 15 * 60000),
    estimatedTime: 20,
    paymentStatus: 'paid',
    paymentMethod: 'online'
  },
  {
    id: 'ONL-003',
    platform: 'grubhub',
    customerName: 'David Kim',
    customerPhone: '(555) 555-6666',
    customerAddress: '321 Elm Street, Suite 5',
    items: [
      { menuItemId: '6', name: 'Spicy Ramen', quantity: 1, price: 22.00 }
    ],
    total: 29.99,
    status: 'ready',
    createdAt: new Date(now.getTime() - 10 * 60000),
    estimatedTime: 15,
    paymentStatus: 'paid',
    paymentMethod: 'online'
  },
  {
    id: 'ONL-004',
    platform: 'website',
    customerName: 'Jennifer White',
    customerPhone: '(555) 777-8888',
    customerAddress: '555 Maple Drive',
    items: [
      { menuItemId: '2', name: 'Grilled Salmon', quantity: 1, price: 32.00 },
      { menuItemId: '5', name: 'Tiramisu', quantity: 1, price: 12.00 }
    ],
    total: 48.00,
    status: 'ready',
    createdAt: new Date(now.getTime() - 5 * 60000),
    estimatedTime: 25,
    paymentStatus: 'paid',
    paymentMethod: 'online'
  },
  {
    id: 'ONL-005',
    platform: 'phone',
    customerName: 'Robert Chen',
    customerPhone: '(555) 888-9999',
    customerAddress: '777 Oak Lane',
    items: [
      { menuItemId: '9', name: 'Vegan Buddha Bowl', quantity: 2, price: 19.00 }
    ],
    total: 42.00,
    status: 'preparing',
    createdAt: new Date(now.getTime() - 8 * 60000),
    estimatedTime: 20,
    paymentStatus: 'paid',
    paymentMethod: 'online'
  },
];

const activeOrders = initialOrders.filter(o => o.status === 'ready');
const availableDrivers = initialDrivers.filter(d => d.status === 'available');

export default function AssignDriverPage() {
  const [orders, setOrders] = useState<OnlineOrder[]>(initialOrders);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);

  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    vehicle: '',
    zone: 'Downtown'
  });

  const readyOrders = orders.filter(o => o.status === 'ready');
  const busyDrivers = drivers.filter(d => d.status === 'busy');
  const availableDriverCount = drivers.filter(d => d.status === 'available').length;

  const assignDriver = () => {
    if (!selectedOrder || !selectedDriver) return;

    setOrders(orders.map(o => o.id === selectedOrder.id ? {
      ...o,
      status: 'picked_up' as const,
      driverId: selectedDriver.id,
      driverName: selectedDriver.name,
      driverPhone: selectedDriver.phone
    } : o));

    setDrivers(drivers.map(d => d.id === selectedDriver.id ? {
      ...d,
      status: 'busy' as const,
      currentOrderId: selectedOrder.id
    } : d));

    setShowAssignModal(false);
    setSelectedOrder(null);
    setSelectedDriver(null);
  };

  const completeDelivery = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.driverId) return;

    setOrders(orders.map(o => o.id === orderId ? {
      ...o,
      status: 'delivered' as const
    } : o));

    setDrivers(drivers.map(d => d.id === order.driverId ? {
      ...d,
      status: 'available' as const,
      currentOrderId: undefined,
      totalDeliveries: d.totalDeliveries + 1
    } : d));
  };

  const toggleDriverStatus = (driverId: string) => {
    setDrivers(drivers.map(d => d.id === driverId ? {
      ...d,
      status: d.status === 'available' ? 'offline' : 'available'
    } : d));
  };

  const addDriver = () => {
    if (!newDriver.name || !newDriver.phone || !newDriver.vehicle) return;

    const driver: Driver = {
      id: `D${String(drivers.length + 1)}`,
      ...newDriver,
      status: 'available',
      totalDeliveries: 0,
      rating: 5.0,
      zone: newDriver.zone
    };

    setDrivers([...drivers, driver]);
    setShowAddDriverModal(false);
    setNewDriver({ name: '', phone: '', vehicle: '', zone: 'Downtown' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'badge-available';
      case 'busy': return 'badge-in_progress';
      case 'offline': return 'badge-cancelled';
      default: return '';
    }
  };

  const getPlatformName = (platform: OnlineOrder['platform']) => {
    switch (platform) {
      case 'website': return 'Website';
      case 'phone': return 'Phone';
      case 'uber_eats': return 'Uber Eats';
      case 'doordash': return 'DoorDash';
      case 'grubhub': return 'Grubhub';
      default: return platform;
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Driver Management</h1>
        <button className="btn btn-primary" onClick={() => setShowAddDriverModal(true)}>
          + Add Driver
        </button>
      </div>

      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ background: 'var(--success)' }}>
          <div className="stat-value" style={{ fontSize: '32px' }}>{availableDriverCount}</div>
          <div className="stat-label">Available Drivers</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--primary)' }}>
          <div className="stat-value" style={{ fontSize: '32px' }}>{busyDrivers.length}</div>
          <div className="stat-label">On Delivery</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--warning)' }}>
          <div className="stat-value" style={{ fontSize: '32px' }}>{readyOrders.length}</div>
          <div className="stat-label">Orders Ready</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '32px' }}>{drivers.reduce((s, d) => s + d.totalDeliveries, 0)}</div>
          <div className="stat-label">Total Deliveries</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '24px' }}>
        {/* Orders Ready for Pickup */}
        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title">Orders Ready for Pickup ({readyOrders.length})</h3>
          </div>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {readyOrders.map(order => (
              <div key={order.id} style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span className="mono" style={{ fontWeight: '600' }}>{order.id}</span>
                    <span className="badge badge-in_progress" style={{ marginLeft: '8px', fontSize: '10px' }}>{getPlatformName(order.platform)}</span>
                  </div>
                  <span className="mono" style={{ fontWeight: '600', color: 'var(--primary)' }}>{formatCurrency(order.total)}</span>
                </div>
                <div style={{ fontSize: '13px', marginBottom: '4px' }}>{order.customerName} - {order.customerPhone}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{order.customerAddress}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {order.items.map((i, idx) => <span key={idx}>{i.quantity}x {i.name}{idx < order.items.length - 1 ? ', ' : ''}</span>)}
                </div>
                {order.driverName ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ color: 'var(--success)' }}>✓ Assigned: {order.driverName}</span>
                    </div>
                    <button className="btn btn-success" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => completeDelivery(order.id)}>
                      Complete
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setSelectedOrder(order); setShowAssignModal(true); }}>
                    Assign Driver
                  </button>
                )}
              </div>
            ))}
            {readyOrders.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-text">No orders ready for pickup</div>
              </div>
            )}
          </div>
        </div>

        {/* Drivers List */}
        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title">Drivers ({drivers.length})</h3>
          </div>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {drivers.map(driver => {
              const currentOrder = orders.find(o => o.id === driver.currentOrderId);
              return (
                <div key={driver.id} style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: driver.status === 'busy' ? 'rgba(99, 102, 241, 0.05)' : 'inherit' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        👤 {driver.name}
                        <span className={`badge ${getStatusColor(driver.status)}`}>{driver.status}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{driver.phone}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px' }}>⭐ {driver.rating.toFixed(1)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{driver.totalDeliveries} deliveries</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{driver.vehicle}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Zone: {driver.zone}</div>
                  {currentOrder && (
                    <div style={{ padding: '8px', background: 'var(--bg-elevated)', borderRadius: '6px', marginBottom: '8px', fontSize: '12px' }}>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>Currently delivering:</div>
                      <div>{currentOrder.id} - {currentOrder.customerName}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{currentOrder.customerAddress}</div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {driver.status === 'busy' ? (
                      <button className="btn btn-success" style={{ flex: 1, fontSize: '12px' }} disabled>
                        On Delivery
                      </button>
                    ) : (
                      <>
                        <button className="btn btn-secondary" style={{ flex: 1, fontSize: '12px' }} onClick={() => toggleDriverStatus(driver.id)}>
                          {driver.status === 'offline' ? 'Go Online' : 'Go Offline'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Assign Driver Modal */}
      <div className={`modal-overlay ${showAssignModal ? 'active' : ''}`} onClick={() => setShowAssignModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Assign Driver - {selectedOrder?.id}</h2>
            <button className="modal-close" onClick={() => setShowAssignModal(false)}>×</button>
          </div>
          <div className="modal-body">
            {selectedOrder && (
              <>
                <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px', marginBottom: '20px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px' }}>Order Details</div>
                  <div style={{ fontSize: '13px' }}>{selectedOrder.customerName} - {selectedOrder.customerPhone}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedOrder.customerAddress}</div>
                  <div style={{ marginTop: '8px', fontWeight: '600' }}>Total: {formatCurrency(selectedOrder.total)}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Available Driver</label>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {availableDrivers.map(driver => (
                      <div 
                        key={driver.id}
                        onClick={() => setSelectedDriver(driver)}
                        style={{ 
                          padding: '12px', 
                          background: selectedDriver?.id === driver.id ? 'var(--primary)' : 'var(--bg-elevated)', 
                          color: selectedDriver?.id === driver.id ? 'white' : 'inherit',
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          border: selectedDriver?.id === driver.id ? 'none' : '1px solid var(--border)'
                        }}
                      >
                        <div style={{ fontWeight: '600' }}>{driver.name}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>{driver.vehicle}</div>
                        <div style={{ fontSize: '11px', opacity: 0.7 }}>⭐ {driver.rating} • {driver.zone}</div>
                      </div>
                    ))}
                    {availableDrivers.length === 0 && (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No drivers available
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={assignDriver} disabled={!selectedDriver}>Assign Driver</button>
          </div>
        </div>
      </div>

      {/* Add Driver Modal */}
      <div className={`modal-overlay ${showAddDriverModal ? 'active' : ''}`} onClick={() => setShowAddDriverModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Add New Driver</h2>
            <button className="modal-close" onClick={() => setShowAddDriverModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Driver Name *</label>
              <input className="form-input" value={newDriver.name} onChange={e => setNewDriver({ ...newDriver, name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input className="form-input" value={newDriver.phone} onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })} placeholder="(555) 123-4567" />
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle *</label>
              <input className="form-input" value={newDriver.vehicle} onChange={e => setNewDriver({ ...newDriver, vehicle: e.target.value })} placeholder="Make Model - License Plate" />
            </div>
            <div className="form-group">
              <label className="form-label">Zone</label>
              <select className="form-select" value={newDriver.zone} onChange={e => setNewDriver({ ...newDriver, zone: e.target.value })}>
                <option value="Downtown">Downtown</option>
                <option value="West Side">West Side</option>
                <option value="North District">North District</option>
                <option value="East End">East End</option>
                <option value="South Area">South Area</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowAddDriverModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={addDriver} disabled={!newDriver.name || !newDriver.phone || !newDriver.vehicle}>Add Driver</button>
          </div>
        </div>
      </div>
    </>
  );
}