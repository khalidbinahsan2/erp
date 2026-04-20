'use client';

import { useState } from 'react';
import { tables as initialTables, reservations as initialReservations } from '@/lib/mockData';
import { Table, Reservation } from '@/types';

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [reservations] = useState<Reservation[]>(initialReservations);
  const [view, setView] = useState<'floor' | 'list' | 'reservations'>('floor');

  const updateTableStatus = (tableId: string, newStatus: Table['status']) => {
    setTables(tables.map(t => t.id === tableId ? { ...t, status: newStatus } : t));
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Tables</h1>
      </div>

      <div className="tabs">
        <button className={`tab ${view === 'floor' ? 'active' : ''}`} onClick={() => setView('floor')}>Floor Plan</button>
        <button className={`tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>Table List</button>
        <button className={`tab ${view === 'reservations' ? 'active' : ''}`} onClick={() => setView('reservations')}>Reservations</button>
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
              <div key={table.id} className={`table-item ${table.status}`}>
                <span className="table-number">{table.number}</span>
                <span className="table-capacity">{table.capacity} seats</span>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'list' && (
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
              {tables.map(table => (
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
                      <button className="action-btn" onClick={() => updateTableStatus(table.id, 'occupied')}>Mark Occupied</button>
                    )}
                    {table.status === 'occupied' && (
                      <button className="action-btn" onClick={() => updateTableStatus(table.id, 'available')}>Mark Available</button>
                    )}
                    {table.status === 'reserved' && (
                      <button className="action-btn" onClick={() => updateTableStatus(table.id, 'available')}>Clear Reservation</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'reservations' && (
        <div className="data-card">
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
      )}
    </>
  );
}