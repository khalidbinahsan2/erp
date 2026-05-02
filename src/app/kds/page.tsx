'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { OrderItem } from '@/types';

type KDSStatus = 'received' | 'preparing' | 'cooking' | 'plating' | 'ready' | 'served';
type KDSPriority = 'high' | 'medium' | 'low';
type OrderType = 'dine-in' | 'online' | 'takeout';

interface KDSOrder {
  id: string;
  orderType: OrderType;
  tableNumber?: number;
  items: OrderItem[];
  total: number;
  status: KDSStatus;
  createdAt: Date;
  priority: KDSPriority;
  specialInstructions?: string;
  estimatedPrepTime: number;
  actualPrepTime?: number;
  assignedChef?: string;
  rushOrder?: boolean;
}

interface Chef {
  id: string;
  name: string;
  station: string;
  ticketsCompleted: number;
  avgPrepTime: number;
  targetPrepTime: number;
  efficiency: number;
  active: boolean;
}

interface SmartOven {
  id: string;
  name: string;
  temperature: number;
  targetTemp: number;
  cookingProgress: number;
  recipe: string;
  timeRemaining: number;
  status: 'idle' | 'preheating' | 'cooking' | 'completed';
  utilization: number;
  lastMaintenance: Date;
}

const chefs: Chef[] = [
  { id: '1', name: 'Sarah Johnson', station: 'Grill Station', ticketsCompleted: 24, avgPrepTime: 12, targetPrepTime: 15, efficiency: 125, active: true },
  { id: '2', name: 'David Martinez', station: 'Sauce Station', ticketsCompleted: 18, avgPrepTime: 8, targetPrepTime: 10, efficiency: 120, active: true },
  { id: '3', name: 'Emma Chen', station: 'Prep Station', ticketsCompleted: 32, avgPrepTime: 6, targetPrepTime: 8, efficiency: 133, active: true },
];

const smartOvens: SmartOven[] = [
  { id: '1', name: 'Oven #1', temperature: 375, targetTemp: 400, cookingProgress: 65, recipe: 'Roast Beef', timeRemaining: 18, status: 'cooking', utilization: 85, lastMaintenance: new Date() },
  { id: '2', name: 'Oven #2', temperature: 400, targetTemp: 400, cookingProgress: 100, recipe: 'Chicken Breast', timeRemaining: 0, status: 'completed', utilization: 72, lastMaintenance: new Date() },
  { id: '3', name: 'Oven #3', temperature: 250, targetTemp: 450, cookingProgress: 0, recipe: 'Pork Belly', timeRemaining: 45, status: 'preheating', utilization: 60, lastMaintenance: new Date() },
];

const initialOrders: KDSOrder[] = [
  {
    id: 'KDS-001',
    orderType: 'dine-in',
    tableNumber: 5,
    items: [{ menuItemId: '1', name: 'Truffle Risotto', quantity: 2, price: 28.00 }],
    total: 56.00,
    status: 'received',
    createdAt: new Date(),
    priority: 'high',
    estimatedPrepTime: 25,
    rushOrder: true,
  },
  {
    id: 'KDS-002',
    orderType: 'online',
    items: [{ menuItemId: '4', name: 'Wagyu Burger', quantity: 1, price: 26.00 }, { menuItemId: '3', name: 'Caesar Salad', quantity: 1, price: 14.00 }],
    total: 40.00,
    status: 'received',
    createdAt: new Date(),
    priority: 'medium',
    estimatedPrepTime: 18,
  },
  {
    id: 'KDS-003',
    orderType: 'takeout',
    items: [{ menuItemId: '6', name: 'Spicy Ramen', quantity: 3, price: 22.00 }],
    total: 66.00,
    status: 'preparing',
    createdAt: new Date(),
    priority: 'low',
    estimatedPrepTime: 15,
    assignedChef: 'Sarah Johnson',
  },
  {
    id: 'KDS-004',
    orderType: 'dine-in',
    tableNumber: 12,
    items: [{ menuItemId: '2', name: 'Grilled Salmon', quantity: 1, price: 32.00 }],
    total: 32.00,
    status: 'cooking',
    createdAt: new Date(),
    priority: 'high',
    estimatedPrepTime: 20,
    assignedChef: 'David Martinez',
  },
  {
    id: 'KDS-005',
    orderType: 'online',
    items: [{ menuItemId: '9', name: 'Vegan Buddha Bowl', quantity: 2, price: 19.00 }],
    total: 38.00,
    status: 'plating',
    createdAt: new Date(),
    priority: 'medium',
    estimatedPrepTime: 15,
    assignedChef: 'Emma Chen',
  },
];

const priorityLabels = {
  high: 'High Priority',
  medium: 'Medium Priority',
  low: 'Low Priority',
};

export default function KDSPage() {
  const [orders, setOrders] = useState<KDSOrder[]>(initialOrders);
  const [chefsState, setChefsState] = useState<Chef[]>(chefs);
  const [ovens, setOvens] = useState<SmartOven[]>(smartOvens);
  const [filter, setFilter] = useState<'all' | KDSOrder['status']>('all');

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => {
        const updated = [...prevOrders];
        updated.forEach(order => {
          if (order.status === 'received') {
            const random = Math.random();
            if (random > 0.7) {
              order.status = 'preparing';
              const availableChef = chefsState.find(c => c.active && !updated.some(o => o.assignedChef === c.name));
              if (availableChef) order.assignedChef = availableChef.name;
            }
          } else if (order.status === 'preparing') {
            if (Math.random() > 0.5) order.status = 'cooking';
          } else if (order.status === 'cooking') {
            if (Math.random() > 0.6) order.status = 'plating';
          } else if (order.status === 'plating') {
            if (Math.random() > 0.5) order.status = 'ready';
          } else if (order.status === 'ready') {
            if (Math.random() > 0.4) order.status = 'served';
          }
        });
        return updated;
      });

      setOvens(prevOvens => {
        return prevOvens.map(oven => ({
          ...oven,
          cookingProgress: oven.status === 'cooking' ? Math.min(100, oven.cookingProgress + 5) : oven.cookingProgress,
          timeRemaining: oven.status === 'cooking' ? Math.max(0, oven.timeRemaining - 1) : oven.timeRemaining,
          status: oven.cookingProgress >= 100 ? 'completed' : oven.status,
        }));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [chefsState]);

  const sortedOrders = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...orders]
      .filter(order => filter === 'all' || order.status === filter)
      .sort((a, b) => {
        if (a.rushOrder && !b.rushOrder) return -1;
        if (!a.rushOrder && b.rushOrder) return 1;
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  }, [orders, filter]);

  const updateStatus = useCallback((orderId: string, newStatus: KDSOrder['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  }, []);

  const assignChef = useCallback((orderId: string, chefName: string) => {
    setOrders(prevOrders =>
      prevOrders.map(o => (o.id === orderId ? { ...o, assignedChef: chefName } : o))
    );
  }, []);

  const ordersPerHour = useMemo(() => {
    return orders.filter(o => o.status === 'served').length;
  }, [orders]);

  const avgPrepTime = useMemo(() => {
    const completed = orders.filter(o => o.actualPrepTime);
    if (completed.length === 0) return 0;
    return Math.round(completed.reduce((sum, o) => sum + (o.actualPrepTime || 0), 0) / completed.length);
  }, [orders]);

  const highPriorityCount = orders.filter(o => o.priority === 'high' && o.status !== 'served').length;
  const readyCount = orders.filter(o => o.status === 'ready').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kitchen Display System</h1>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <span className="badge badge-cancelled" style={{ background: 'rgba(255, 107, 53, 0.2)', color: 'var(--primary)' }}>
              {highPriorityCount} High Priority
            </span>
            <span className="badge badge-ready" style={{ background: 'rgba(52, 152, 219, 0.2)', color: '#3498db' }}>
              {readyCount} Ready for Service
            </span>
            <span className="badge" style={{ background: 'rgba(46, 204, 113, 0.2)', color: 'var(--secondary)' }}>
              {ordersPerHour} Orders/Hour
            </span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`filter-btn ${filter === 'received' ? 'active' : ''}`} onClick={() => setFilter('received')}>Received</button>
        <button className={`filter-btn ${filter === 'preparing' ? 'active' : ''}`} onClick={() => setFilter('preparing')}>Preparing</button>
        <button className={`filter-btn ${filter === 'cooking' ? 'active' : ''}`} onClick={() => setFilter('cooking')}>Cooking</button>
        <button className={`filter-btn ${filter === 'plating' ? 'active' : ''}`} onClick={() => setFilter('plating')}>Plating</button>
        <button className={`filter-btn ${filter === 'ready' ? 'active' : ''}`} onClick={() => setFilter('ready')}>Ready</button>
      </div>

      <div className="grid-2" style={{ marginBottom: '32px' }}>
        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title">Chef Performance</h3>
          </div>
          <div style={{ padding: '16px' }}>
            {chefsState.filter(c => c.active).map(chef => (
              <div key={chef.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{chef.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{chef.station}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontWeight: '600' }}>{chef.ticketsCompleted} tickets</div>
                  <div style={{ fontSize: '12px', color: chef.efficiency >= 100 ? 'var(--secondary)' : 'var(--warning)' }}>
                    {chef.efficiency}% efficiency
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title">Smart Ovens</h3>
          </div>
          <div style={{ padding: '16px' }}>
            {ovens.map(oven => (
              <div key={oven.id} style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600' }}>{oven.name}</span>
                  <span className={`badge ${oven.status === 'cooking' ? 'badge-in_progress' : oven.status === 'preheating' ? 'badge-pending' : 'badge-completed'}`}>
                    {oven.status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {oven.recipe} • {oven.timeRemaining > 0 ? `${oven.timeRemaining}m remaining` : 'Complete'}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ flex: 1, height: '6px', background: 'var(--bg-card)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${oven.cookingProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 300ms ease' }} />
                  </div>
                  <span className="mono" style={{ fontSize: '12px' }}>{oven.temperature}°F</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {sortedOrders.map(order => (
          <div key={order.id} className="data-card" style={{ borderLeft: `4px solid ${order.priority === 'high' ? 'var(--primary)' : order.priority === 'medium' ? 'var(--warning)' : 'var(--secondary)'}` }}>
            <div className="data-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="mono" style={{ fontWeight: '600', fontSize: '16px' }}>{order.id}</span>
                <span className={`badge ${order.orderType === 'dine-in' ? 'badge-in_progress' : order.orderType === 'online' ? 'badge-pending' : 'badge-available'}`}>
                  {order.orderType}
                </span>
                {order.rushOrder && <span className="badge badge-cancelled">Rush</span>}
              </div>
              {order.tableNumber && <span className="mono">Table {order.tableNumber}</span>}
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ marginBottom: '12px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '14px', marginBottom: '4px' }}>
                    <span className="mono">{item.quantity}x</span> {item.name}
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Est. Prep:</span>
                <span className="mono">{order.estimatedPrepTime} min</span>
              </div>

              {order.assignedChef && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chef:</span>
                  <span style={{ fontWeight: '600' }}>{order.assignedChef}</span>
                </div>
              )}

              {order.specialInstructions && (
                <div style={{ padding: '8px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '6px', marginBottom: '12px', fontSize: '12px' }}>
                  <strong>Note:</strong> {order.specialInstructions}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {order.status === 'received' && (
                  <button className="btn btn-primary btn-sm" onClick={() => { updateStatus(order.id, 'preparing'); assignChef(order.id, chefsState[0].name); }}>
                    Start
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button className="btn btn-primary btn-sm" onClick={() => updateStatus(order.id, 'cooking')}>
                    Cooking
                  </button>
                )}
                {order.status === 'cooking' && (
                  <button className="btn btn-primary btn-sm" onClick={() => updateStatus(order.id, 'plating')}>
                    Plate
                  </button>
                )}
                {order.status === 'plating' && (
                  <button className="btn btn-primary btn-sm" onClick={() => updateStatus(order.id, 'ready')}>
                    Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(order.id, 'served')}>
                    Served
                  </button>
                )}
                <span className={`badge ${order.priority === 'high' ? 'badge-cancelled' : order.priority === 'medium' ? 'badge-pending' : 'badge-available'}`}>
                  {priorityLabels[order.priority]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedOrders.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-text">No orders in this view</div>
        </div>
      )}
    </>
  );
}