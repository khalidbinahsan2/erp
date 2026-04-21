'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const [showSalaryData, setShowSalaryData] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: 'Server',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
    hourlyRate: '',
    overtimeHours: ''
  });

  const [scheduleForm, setScheduleForm] = useState<{ day: string; startTime: string; endTime: string }[]>([]);

  const openAddModal = useCallback(() => {
    setEditingStaff(null);
    setFormData({ name: '', role: 'Server', phone: '', email: '', status: 'active', hourlyRate: '', overtimeHours: '' });
    setShowModal(true);
  }, []);

  const openEditModal = useCallback((member: Staff) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      role: member.role,
      phone: member.phone,
      email: member.email,
      status: member.status,
      hourlyRate: member.salary?.hourlyRate.toString() || '',
      overtimeHours: member.salary?.overtimeHours.toString() || ''
    });
    setShowModal(true);
  }, []);

  const openScheduleModal = useCallback((member: Staff) => {
    setEditingStaff(member);
    setScheduleForm(member.schedule.length > 0 ? member.schedule : [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' }
    ]);
    setShowScheduleModal(true);
  }, []);

  const saveStaff = useCallback(() => {
    if (!formData.name) return;
    
    const hourlyRate = parseFloat(formData.hourlyRate) || 0;
    const overtimeHours = parseFloat(formData.overtimeHours) || 0;
    const hoursWorked = 160 + overtimeHours;
    const monthlySalary = Math.round(hourlyRate * hoursWorked + (overtimeHours * hourlyRate * 1.5));
    
    if (editingStaff) {
      setStaff(prevStaff => prevStaff.map(s => s.id === editingStaff.id ? {
        ...s,
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
        status: formData.status,
        salary: hourlyRate > 0 ? { hourlyRate, hoursWorked, overtimeHours, monthlySalary } : undefined
      } : s));
    } else {
      setStaff(prevStaff => {
        const newStaff: Staff = {
          id: String(prevStaff.length + 1),
          name: formData.name,
          role: formData.role,
          phone: formData.phone,
          email: formData.email,
          status: formData.status,
          schedule: [],
          salary: hourlyRate > 0 ? { hourlyRate, hoursWorked, overtimeHours, monthlySalary } : undefined
        };
        return [...prevStaff, newStaff];
      });
    }
    setShowModal(false);
  }, [editingStaff, formData]);

  const saveSchedule = useCallback(() => {
    if (!editingStaff) return;
    setStaff(prevStaff => prevStaff.map(s => 
      s.id === editingStaff.id ? { ...s, schedule: scheduleForm } : s
    ));
    setShowScheduleModal(false);
  }, [editingStaff, scheduleForm]);

  const addScheduleDay = useCallback(() => {
    setScheduleForm(prev => [...prev, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
  }, []);

  const removeScheduleDay = useCallback((index: number) => {
    setScheduleForm(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateScheduleDay = useCallback((index: number, field: string, value: string) => {
    setScheduleForm(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const toggleStatus = useCallback((staffId: string) => {
    setStaff(prevStaff => prevStaff.map(s => 
      s.id === staffId ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
    ));
  }, []);

  const deleteStaff = useCallback((staffId: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      setStaff(prevStaff => prevStaff.filter(s => s.id !== staffId));
    }
  }, []);

  const filteredStaff = useMemo(() => staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  }), [staff, searchTerm, roleFilter, statusFilter]);

  const exportStaffData = useCallback(() => {
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
  }, [filteredStaff]);

  const getStaffPerformance = useCallback((memberId: string) => {
    const orderCount = 32;
    const revenue = 1245;
    const rating = 4.7;
    return { orderCount, revenue, rating };
  }, []);

  const activeStaff = useMemo(() => staff.filter(s => s.status === 'active'), [staff]);
  const totalSalaries = useMemo(() => staff.reduce((sum, s) => sum + (s.salary?.monthlySalary || 0), 0), [staff]);
  const totalOvertime = useMemo(() => staff.reduce((sum, s) => sum + (s.salary?.overtimeHours || 0), 0), [staff]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Staff</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showSalaryData} onChange={e => setShowSalaryData(e.target.checked)} />
            <span style={{ fontSize: '14px' }}>Show Salaries</span>
          </label>
          <span className="badge badge-available">{activeStaff.length} Active</span>
          <button className="btn btn-secondary" onClick={exportStaffData}>Export CSV</button>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Staff
          </button>
        </div>
      </div>

      {showSalaryData && (
        <div className="stat-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card">
            <div className="stat-value" style={{ fontSize: '28px' }}>${totalSalaries.toLocaleString()}</div>
            <div className="stat-label">Total Monthly Payroll</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ fontSize: '28px', color: 'var(--warning)' }}>{totalOvertime}h</div>
            <div className="stat-label">Total Overtime Hours</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ fontSize: '28px' }}>{staff.filter(s => (s.salary?.overtimeHours || 0) > 0).length}</div>
            <div className="stat-label">Staff with Overtime</div>
          </div>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>Staff List</button>
        <button className={`tab ${view === 'schedule' ? 'active' : ''}`} onClick={() => setView('schedule')}>Schedule</button>
        <button className={`tab ${view === 'performance' ? 'active' : ''}`} onClick={() => setView('performance')}>Performance</button>
        <Link href="/staff/attendance" className="tab">Attendance</Link>
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
                  {showSalaryData && <th>Hourly Rate</th>}
                  {showSalaryData && <th>Hours</th>}
                  {showSalaryData && <th>OT Hours</th>}
                  {showSalaryData && <th>Monthly</th>}
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(member => {
                  const salary = member.salary;
                  const hasOvertime = (salary?.overtimeHours || 0) > 0;
                  return (
                    <tr key={member.id}>
                      <td>
                        <Link href={`/staff/${member.id}`} style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                          {member.name}
                        </Link>
                      </td>
                      <td>
                        <span className="badge badge-in_progress">{member.role}</span>
                      </td>
                      <td>{member.phone}</td>
                      <td>{member.email}</td>
                      {showSalaryData && <td className="mono">{salary ? `$${salary.hourlyRate}/hr` : '-'}</td>}
                      {showSalaryData && <td className="mono">{salary?.hoursWorked || '-'}</td>}
                      {showSalaryData && <td className="mono" style={{ color: hasOvertime ? 'var(--warning)' : 'inherit' }}>{salary?.overtimeHours || 0}h</td>}
                      {showSalaryData && <td className="mono" style={{ fontWeight: '600' }}>{salary ? `$${salary.monthlySalary}` : '-'}</td>}
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
                  );
                })}
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
            const salary = member.salary;
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
                  {showSalaryData && salary && (
                    <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Overtime Status</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: salary.overtimeHours > 0 ? 'var(--warning)' : 'var(--success)' }}>
                          {salary.overtimeHours > 0 ? `${salary.overtimeHours}h overtime` : 'No overtime'}
                        </span>
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
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
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Hourly Rate ($)</label>
                <input className="form-input" type="number" step="0.01" value={formData.hourlyRate} onChange={e => setFormData({ ...formData, hourlyRate: e.target.value })} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Overtime Hours</label>
                <input className="form-input" type="number" value={formData.overtimeHours} onChange={e => setFormData({ ...formData, overtimeHours: e.target.value })} placeholder="0" />
              </div>
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