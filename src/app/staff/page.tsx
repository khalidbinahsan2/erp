'use client';

import { useState } from 'react';
import { staff as initialStaff, roles, orders } from '@/lib/mockData';
import { Staff } from '@/types';

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [view, setView] = useState<'list' | 'schedule' | 'performance'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    role: 'Server',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive'
  });

  const [scheduleForm, setScheduleForm] = useState<{ day: string; startTime: string; endTime: string }[]>([]);

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

  const openScheduleModal = (member: Staff) => {
    setEditingStaff(member);
    setScheduleForm(member.schedule.length > 0 ? member.schedule : [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' }
    ]);
    setShowScheduleModal(true);
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

  const saveSchedule = () => {
    if (!editingStaff) return;
    setStaff(staff.map(s => s.id === editingStaff.id ? { ...s, schedule: scheduleForm } : s));
    setShowScheduleModal(false);
  };

  const addScheduleDay = () => {
    setScheduleForm([...scheduleForm, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
  };

  const removeScheduleDay = (index: number) => {
    setScheduleForm(scheduleForm.filter((_, i) => i !== index));
  };

  const updateScheduleDay = (index: number, field: string, value: string) => {
    const updated = [...scheduleForm];
    updated[index] = { ...updated[index], [field]: value };
    setScheduleForm(updated);
  };

  const toggleStatus = (staffId: string) => {
    setStaff(staff.map(s => s.id === staffId ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
  };

  const deleteStaff = (staffId: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      setStaff(staff.filter(s => s.id !== staffId));
    }
  };

  const exportStaffData = () => {
    const headers = ['Name', 'Role', 'Phone', 'Email', 'Status'];
    const rows = filteredStaff.map(s => [s.name, s.role, s.phone, s.email, s.status]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStaffPerformance = (memberId: string) => {
    const staffOrders = orders.filter(o => o.status === 'completed');
    const orderCount = 32;
    const revenue = 1245;
    const rating = 4.7;
    return { orderCount, revenue, rating };
  };

  const activeStaff = staff.filter(s => s.status === 'active');

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Staff</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span className="badge badge-available">{activeStaff.length} Active</span>
          <button className="btn btn-secondary" onClick={exportStaffData}>Export CSV</button>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Staff
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>Staff List</button>
        <button className={`tab ${view === 'schedule' ? 'active' : ''}`} onClick={() => setView('schedule')}>Weekly Schedule</button>
        <button className={`tab ${view === 'performance' ? 'active' : ''}`} onClick={() => setView('performance')}>Performance</button>
      </div>

      {view === 'list' && (
        <>
          <div className="filter-bar">
            <input 
              className="form-input" 
              style={{ width: '300px' }}
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select className="form-select" style={{ width: '150px' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <select className="form-select" style={{ width: '150px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); setRoleFilter('all'); setStatusFilter('all'); }}>
              Clear Filters
            </button>
          </div>

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
                {filteredStaff.map(member => (
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
                      <button className="action-btn" style={{ marginLeft: '8px' }} onClick={() => openScheduleModal(member)}>Schedule</button>
                      <button className="action-btn" style={{ marginLeft: '8px', color: 'var(--error)' }} onClick={() => deleteStaff(member.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStaff.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-text">No staff members found</div>
              </div>
            )}
          </div>
        </>
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
                <th>Actions</th>
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
                    <td>
                      <button className="action-btn edit" onClick={() => openScheduleModal(member)}>Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {view === 'performance' && (
        <div className="grid-2">
          {staff.filter(s => s.status === 'active').map(member => {
            const perf = getStaffPerformance(member.id);
            return (
              <div key={member.id} className="data-card">
                <div className="data-card-header">
                  <h3 className="data-card-title">{member.name}</h3>
                  <span className="badge badge-in_progress">{member.role}</span>
                </div>
                <div style={{ padding: '24px' }}>
                  <div className="stat-grid" style={{ marginBottom: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div className="stat-value" style={{ fontSize: '24px' }}>{perf.orderCount}</div>
                      <div className="stat-label">Orders</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div className="stat-value" style={{ fontSize: '24px' }}>${perf.revenue}</div>
                      <div className="stat-label">Revenue</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div className="stat-value" style={{ fontSize: '24px' }}>{perf.rating}/5</div>
                      <div className="stat-label">Rating</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600' }}>{member.email}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{member.phone}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Staff Form Modal */}
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

      {/* Schedule Modal */}
      <div className={`modal-overlay ${showScheduleModal ? 'active' : ''}`} onClick={() => setShowScheduleModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Manage Schedule - {editingStaff?.name}</h2>
            <button className="modal-close" onClick={() => setShowScheduleModal(false)}>×</button>
          </div>
          <div className="modal-body">
            {scheduleForm.map((shift, index) => (
              <div key={index} className="grid-4" style={{ marginBottom: '12px', alignItems: 'end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Day</label>
                  <select className="form-select" value={shift.day} onChange={e => updateScheduleDay(index, 'day', e.target.value)}>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Start</label>
                  <input type="time" className="form-input" value={shift.startTime} onChange={e => updateScheduleDay(index, 'startTime', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">End</label>
                  <input type="time" className="form-input" value={shift.endTime} onChange={e => updateScheduleDay(index, 'endTime', e.target.value)} />
                </div>
                <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={() => removeScheduleDay(index)}>Remove</button>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={addScheduleDay} style={{ marginTop: '8px' }}>+ Add Day</button>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowScheduleModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveSchedule}>Save Schedule</button>
          </div>
        </div>
      </div>
    </>
  );
}