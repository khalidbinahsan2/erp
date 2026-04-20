'use client';

import { useState } from 'react';
import { staff as initialStaff, roles } from '@/lib/mockData';
import { Staff } from '@/types';

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [view, setView] = useState<'list' | 'schedule'>('list');

  const [formData, setFormData] = useState({
    name: '',
    role: 'Server',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive'
  });

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({ name: '', role: 'Server', phone: '', email: '', status: 'active' });
    setShowModal(true);
  };

  const openEditModal = (member: Staff) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      role: member.role,
      phone: member.phone,
      email: member.email,
      status: member.status
    });
    setShowModal(true);
  };

  const saveStaff = () => {
    if (!formData.name) return;
    
    if (editingStaff) {
      setStaff(staff.map(s => s.id === editingStaff.id ? {
        ...s,
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
        status: formData.status
      } : s));
    } else {
      const newStaff: Staff = {
        id: String(staff.length + 1),
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
        status: formData.status,
        schedule: []
      };
      setStaff([...staff, newStaff]);
    }
    setShowModal(false);
  };

  const toggleStatus = (staffId: string) => {
    setStaff(staff.map(s => s.id === staffId ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
  };

  const activeStaff = staff.filter(s => s.status === 'active');

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Staff</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span className="badge badge-available">{activeStaff.length} Active</span>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Staff
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>Staff List</button>
        <button className={`tab ${view === 'schedule' ? 'active' : ''}`} onClick={() => setView('schedule')}>Weekly Schedule</button>
      </div>

      {view === 'list' && (
        <div className="data-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(member => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>
                    <span className="badge badge-in_progress">{member.role}</span>
                  </td>
                  <td>{member.phone}</td>
                  <td>{member.email}</td>
                  <td>
                    <span className={`badge badge-${member.status}`}>
                      {member.status}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn edit" onClick={() => openEditModal(member)}>Edit</button>
                    <button className="action-btn" style={{ marginLeft: '8px' }} onClick={() => toggleStatus(member.id)}>
                      {member.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'schedule' && (
        <div className="data-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Mon</th>
                <th>Tue</th>
                <th>Wed</th>
                <th>Thu</th>
                <th>Fri</th>
                <th>Sat</th>
                <th>Sun</th>
              </tr>
            </thead>
            <tbody>
              {staff.filter(s => s.status === 'active').map(member => {
                const scheduleMap = new Map(member.schedule.map(s => [s.day, s]));
                return (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                      const shift = scheduleMap.get(day);
                      return (
                        <td key={day}>
                          {shift ? (
                            <span style={{ fontSize: '12px', color: 'var(--primary)' }}>
                              {shift.startTime}-{shift.endTime}
                            </span>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={() => setShowModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{editingStaff ? 'Edit Staff' : 'Add New Staff'}</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(555) 000-0000" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@restaurant.com" />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveStaff}>{editingStaff ? 'Save Changes' : 'Add Staff'}</button>
          </div>
        </div>
      </div>
    </>
  );
}