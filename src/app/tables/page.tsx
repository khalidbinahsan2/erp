'use client';

import { useState } from 'react';
import { tables as initialTables, reservations as initialReservations } from '@/lib/mockData';
import { Table, Reservation } from '@/types';

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [view, setView] = useState<'floor' | 'list' | 'reservations' | 'analytics'>('floor');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showTableModal, setShowTableModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  
  // Form states
  const [tableForm, setTableForm] = useState({ number: '', capacity: '' });
  const [reservationForm, setReservationForm] = useState({
    customerName: '',
    phone: '',
    date: '',
    time: '',
    partySize: '',
    tableId: ''
  });

  const updateTableStatus = (tableId: string, newStatus: Table['status']) => {
    setTables(tables.map(t => t.id === tableId ? { ...t, status: newStatus } : t));
  };

  const filteredTables = tables.filter(t => {
    const matchesSearch = t.number.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Table CRUD
  const openAddTableModal = () => {
    setEditingTable(null);
    setTableForm({ number: '', capacity: '' });
    setShowTableModal(true);
  };

  const openEditTableModal = (table: Table) => {
    setEditingTable(table);
    setTableForm({ number: table.number.toString(), capacity: table.capacity.toString() });
    setShowTableModal(true);
  };

  const saveTable = () => {
    if (!tableForm.number || !tableForm.capacity) return;
    
    if (editingTable) {
      setTables(tables.map(t => t.id === editingTable.id ? {
        ...t,
        number: parseInt(tableForm.number),
        capacity: parseInt(tableForm.capacity)
      } : t));
    } else {
      const newTable: Table = {
        id: String(tables.length + 1),
        number: parseInt(tableForm.number),
        capacity: parseInt(tableForm.capacity),
        status: 'available'
      };
      setTables([...tables, newTable]);
    }
    setShowTableModal(false);
  };

  const deleteTable = (tableId: string) => {
    if (confirm('Are you sure you want to delete this table?')) {
      setTables(tables.filter(t => t.id !== tableId));
    }
  };

  // Reservation management
  const openReservationModal = (table?: Table) => {
    const now = new Date();
    setReservationForm({
      customerName: '',
      phone: '',
      date: now.toISOString().split('T')[0],
      time: '18:00',
      partySize: '2',
      tableId: table?.id || ''
    });
    setShowReservationModal(true);
  };

  const saveReservation = () => {
    if (!reservationForm.customerName || !reservationForm.phone || !reservationForm.date || !reservationForm.time) return;
    
    const selectedTable = tables.find(t => t.id === reservationForm.tableId);
    const newReservation: Reservation = {
      id: `RES-${String(reservations.length + 1).padStart(3, '0')}`,
      customerName: reservationForm.customerName,
      phone: reservationForm.phone,
      dateTime: new Date(`${reservationForm.date}T${reservationForm.time}`),
      partySize: parseInt(reservationForm.partySize),
      tableId: reservationForm.tableId,
      tableNumber: selectedTable?.number || 0,
      status: 'confirmed'
    };
    setReservations([...reservations, newReservation]);
    
    if (selectedTable) {
      updateTableStatus(selectedTable.id, 'reserved');
    }
    
    setShowReservationModal(false);
  };

  const cancelReservation = (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation) {
      updateTableStatus(reservation.tableId, 'available');
    }
    setReservations(reservations.filter(r => r.id !== reservationId));
  };

  // Analytics
  const availableTables = tables.filter(t => t.status === 'available').length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const reservedTables = tables.filter(t => t.status === 'reserved').length;
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
  const occupiedCapacity = tables.filter(t => t.status === 'occupied').reduce((sum, t) => sum + t.capacity, 0);
  const avgTurnTime = 45; // minutes
  const estimatedWaitTime = Math.ceil((tables.filter(t => t.status !== 'available').length / tables.length) * 30);

  const upcomingReservations = reservations
    .filter(r => new Date(r.dateTime) > new Date() && r.status === 'confirmed')
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 5);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Tables</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span className="badge badge-available">{availableTables} Available</span>
          <span className="badge badge-in_progress">{occupiedTables} Occupied</span>
          <span className="badge badge-pending">{reservedTables} Reserved</span>
          <button className="btn btn-secondary" onClick={openAddTableModal}>+ Add Table</button>
          <button className="btn btn-primary" onClick={() => openReservationModal()}>+ New Reservation</button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${view === 'floor' ? 'active' : ''}`} onClick={() => setView('floor')}>Floor Plan</button>
        <button className={`tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>Table List</button>
        <button className={`tab ${view === 'reservations' ? 'active' : ''}`} onClick={() => setView('reservations')}>
          Reservations ({reservations.filter(r => r.status === 'confirmed').length})
        </button>
        <button className={`tab ${view === 'analytics' ? 'active' : ''}`} onClick={() => setView('analytics')}>Analytics</button>
      </div>

      {view === 'floor' && (
        <>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'rgba(46, 204, 113, 0.3)', border: '2px solid var(--secondary)' }} />
              <span style={{ fontSize: '12px' }}>Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'rgba(255, 107, 53, 0.3)', border: '2px solid var(--primary)' }} />
              <span style={{ fontSize: '12px' }}>Occupied</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'rgba(52, 152, 219, 0.3)', border: '2px solid #3498db' }} />
              <span style={{ fontSize: '12px' }}>Reserved</span>
            </div>
          </div>
          
          <div className="table-grid">
            {tables.map(table => (
              <div 
                key={table.id} 
                className={`table-item ${table.status}`}
                onClick={() => { setSelectedTable(table); }}
                style={{ cursor: 'pointer' }}
              >
                <span className="table-number">{table.number}</span>
                <span className="table-capacity">{table.capacity} seats</span>
                {table.currentOrderId && (
                  <span style={{ fontSize: '10px', position: 'absolute', bottom: '4px' }}>Order active</span>
                )}
              </div>
            ))}
          </div>

          {selectedTable && (
            <div className="data-card" style={{ marginTop: '24px' }}>
              <div className="data-card-header">
                <h3 className="data-card-title">Table {selectedTable.number} Details</h3>
                <button className="modal-close" onClick={() => setSelectedTable(null)}>×</button>
              </div>
              <div style={{ padding: '24px' }}>
                <div className="stat-grid" style={{ marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="stat-value">{selectedTable.capacity}</div>
                    <div className="stat-label">Capacity</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span className={`badge badge-${selectedTable.status}`}>{selectedTable.status}</span>
                    <div className="stat-label">Status</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="stat-value">{estimatedWaitTime} min</div>
                    <div className="stat-label">Est. Wait</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {selectedTable.status === 'available' && (
                    <>
                      <button className="btn btn-primary" onClick={() => { updateTableStatus(selectedTable.id, 'occupied'); setSelectedTable(null); }}>Seat Guests</button>
                      <button className="btn btn-secondary" onClick={() => { openReservationModal(selectedTable); setSelectedTable(null); }}>Reserve</button>
                    </>
                  )}
                  {selectedTable.status === 'occupied' && (
                    <button className="btn btn-secondary" onClick={() => { updateTableStatus(selectedTable.id, 'available'); setSelectedTable(null); }}>Clear Table</button>
                  )}
                  {selectedTable.status === 'reserved' && (
                    <button className="btn btn-secondary" onClick={() => { updateTableStatus(selectedTable.id, 'available'); setSelectedTable(null); }}>Clear Reservation</button>
                  )}
                  <button className="action-btn edit" onClick={() => { openEditTableModal(selectedTable); setSelectedTable(null); }}>Edit</button>
                  <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => { deleteTable(selectedTable.id); setSelectedTable(null); }}>Delete</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {view === 'list' && (
        <>
          <div className="filter-bar">
            <input 
              className="form-input" 
              style={{ width: '300px' }}
              placeholder="Search tables..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select className="form-select" style={{ width: '150px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>

          <div className="data-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTables.map(table => (
                  <tr key={table.id}>
                    <td>Table {table.number}</td>
                    <td>{table.capacity} seats</td>
                    <td>
                      <span className={`badge badge-${table.status}`}>
                        {table.status}
                      </span>
                    </td>
                    <td>
                      {table.status === 'available' && (
                        <>
                          <button className="action-btn" onClick={() => updateTableStatus(table.id, 'occupied')}>Seat</button>
                          <button className="action-btn" style={{ marginLeft: '8px' }} onClick={() => openReservationModal(table)}>Reserve</button>
                        </>
                      )}
                      {table.status === 'occupied' && (
                        <button className="action-btn" onClick={() => updateTableStatus(table.id, 'available')}>Clear</button>
                      )}
                      {table.status === 'reserved' && (
                        <button className="action-btn" onClick={() => updateTableStatus(table.id, 'available')}>Clear</button>
                      )}
                      <button className="action-btn edit" style={{ marginLeft: '8px' }} onClick={() => openEditTableModal(table)}>Edit</button>
                      <button className="action-btn" style={{ marginLeft: '8px', color: 'var(--danger)' }} onClick={() => deleteTable(table.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'reservations' && (
        <>
          <div className="data-card" style={{ marginBottom: '24px' }}>
            <div className="data-card-header">
              <h3 className="data-card-title">Upcoming Reservations</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Date/Time</th>
                  <th>Party Size</th>
                  <th>Table</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingReservations.map(res => (
                  <tr key={res.id}>
                    <td>{res.customerName}</td>
                    <td>{res.phone}</td>
                    <td>{formatDate(res.dateTime)} {formatTime(res.dateTime)}</td>
                    <td>{res.partySize} guests</td>
                    <td>Table {res.tableNumber}</td>
                    <td>
                      <span className={`badge badge-${res.status}`}>
                        {res.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-primary" onClick={() => {
                        updateTableStatus(res.tableId, 'occupied');
                        setReservations(reservations.map(r => r.id === res.id ? { ...r, status: 'completed' } : r));
                      }}>Seat</button>
                      <button className="action-btn" style={{ marginLeft: '8px', color: 'var(--danger)' }} onClick={() => cancelReservation(res.id)}>Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {upcomingReservations.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-text">No upcoming reservations</div>
              </div>
            )}
          </div>

          <div className="data-card">
            <div className="data-card-header">
              <h3 className="data-card-title">All Reservations</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Date/Time</th>
                  <th>Party Size</th>
                  <th>Table</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(res => (
                  <tr key={res.id}>
                    <td>{res.customerName}</td>
                    <td>{res.phone}</td>
                    <td>{formatDate(res.dateTime)} {formatTime(res.dateTime)}</td>
                    <td>{res.partySize} guests</td>
                    <td>Table {res.tableNumber}</td>
                    <td>
                      <span className={`badge badge-${res.status}`}>
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'analytics' && (
        <div className="grid-2">
          <div className="data-card">
            <div className="data-card-header">
              <h3 className="data-card-title">Table Utilization</h3>
            </div>
            <div style={{ padding: '24px' }}>
              <div className="stat-grid" style={{ marginBottom: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-value" style={{ fontSize: '36px' }}>{availableTables}</div>
                  <div className="stat-label">Available</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-value" style={{ fontSize: '36px', color: 'var(--primary)' }}>{occupiedTables}</div>
                  <div className="stat-label">Occupied</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-value" style={{ fontSize: '36px', color: 'var(--warning)' }}>{reservedTables}</div>
                  <div className="stat-label">Reserved</div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Utilization Rate</span>
                  <span className="mono">{tables.length > 0 ? ((occupiedTables / tables.length) * 100).toFixed(0) : 0}%</span>
                </div>
                <div style={{ height: '12px', background: 'var(--bg-elevated)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${tables.length > 0 ? (occupiedTables / tables.length) * 100 : 0}%`, height: '100%', background: 'var(--primary)', borderRadius: '6px' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="data-card">
            <div className="data-card-header">
              <h3 className="data-card-title">Capacity Overview</h3>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div className="stat-value" style={{ fontSize: '48px', color: 'var(--primary)' }}>{occupiedCapacity}</div>
                <div className="stat-label">/ {totalCapacity} seats occupied</div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Capacity Usage</span>
                  <span className="mono">{totalCapacity > 0 ? ((occupiedCapacity / totalCapacity) * 100).toFixed(0) : 0}%</span>
                </div>
                <div style={{ height: '12px', background: 'var(--bg-elevated)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${totalCapacity > 0 ? (occupiedCapacity / totalCapacity) * 100 : 0}%`, height: '100%', background: 'var(--secondary)', borderRadius: '6px' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="data-card">
            <div className="data-card-header">
              <h3 className="data-card-title">Turn Time Analytics</h3>
            </div>
            <div style={{ padding: '24px' }}>
              <div className="stat-grid">
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-value" style={{ fontSize: '36px' }}>{avgTurnTime}</div>
                  <div className="stat-label">Avg Minutes</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-value" style={{ fontSize: '36px' }}>{estimatedWaitTime}</div>
                  <div className="stat-label">Est. Wait (min)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="data-card">
            <div className="data-card-header">
              <h3 className="data-card-title">Today&apos;s Summary</h3>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span>Total Tables</span>
                <span className="mono" style={{ fontWeight: '600' }}>{tables.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span>Total Seats</span>
                <span className="mono" style={{ fontWeight: '600' }}>{totalCapacity}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span>Reservations Today</span>
                <span className="mono" style={{ fontWeight: '600' }}>{reservations.filter(r => {
                  const today = new Date().toDateString();
                  return new Date(r.dateTime).toDateString() === today;
                }).length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Table Modal */}
      <div className={`modal-overlay ${showTableModal ? 'active' : ''}`} onClick={() => setShowTableModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{editingTable ? 'Edit Table' : 'Add New Table'}</h2>
            <button className="modal-close" onClick={() => setShowTableModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Table Number</label>
                <input 
                  className="form-input" 
                  type="number" 
                  value={tableForm.number} 
                  onChange={e => setTableForm({ ...tableForm, number: e.target.value })} 
                  placeholder="1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Capacity (seats)</label>
                <input 
                  className="form-input" 
                  type="number" 
                  value={tableForm.capacity} 
                  onChange={e => setTableForm({ ...tableForm, capacity: e.target.value })} 
                  placeholder="4"
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowTableModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveTable}>{editingTable ? 'Save Changes' : 'Add Table'}</button>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      <div className={`modal-overlay ${showReservationModal ? 'active' : ''}`} onClick={() => setShowReservationModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">New Reservation</h2>
            <button className="modal-close" onClick={() => setShowReservationModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input 
                className="form-input" 
                value={reservationForm.customerName} 
                onChange={e => setReservationForm({ ...reservationForm, customerName: e.target.value })} 
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input 
                className="form-input" 
                value={reservationForm.phone} 
                onChange={e => setReservationForm({ ...reservationForm, phone: e.target.value })} 
                placeholder="(555) 000-0000"
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input 
                  className="form-input" 
                  type="date" 
                  value={reservationForm.date} 
                  onChange={e => setReservationForm({ ...reservationForm, date: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input 
                  className="form-input" 
                  type="time" 
                  value={reservationForm.time} 
                  onChange={e => setReservationForm({ ...reservationForm, time: e.target.value })} 
                />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Party Size</label>
                <select 
                  className="form-select" 
                  value={reservationForm.partySize} 
                  onChange={e => setReservationForm({ ...reservationForm, partySize: e.target.value })}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <option key={n} value={n}>{n} guests</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Table</label>
                <select 
                  className="form-select" 
                  value={reservationForm.tableId} 
                  onChange={e => setReservationForm({ ...reservationForm, tableId: e.target.value })}
                >
                  <option value="">Select table...</option>
                  {tables.filter(t => t.status === 'available').map(t => (
                    <option key={t.id} value={t.id}>Table {t.number} ({t.capacity} seats)</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowReservationModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveReservation}>Create Reservation</button>
          </div>
        </div>
      </div>
    </>
  );
}