'use client';

import { useState } from 'react';
import { staff as initialStaff } from '@/lib/mockData';
import { Staff } from '@/types';

interface ActivityRecord {
  id: string;
  staffId: string;
  date: string;
  clockIn: string;
  clockOut: string;
  breakMinutes: number;
  status: 'present' | 'absent' | 'late' | 'overtime';
  notes: string;
  hoursWorked: number;
}

export default function StaffAttendancePage() {
  const [staff] = useState<Staff[]>(initialStaff);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [editingActivity, setEditingActivity] = useState<ActivityRecord | null>(null);

  // Mock activity data
  const [activities, setActivities] = useState<ActivityRecord[]>([
    { id: '1', staffId: '1', date: '2024-04-20', clockIn: '09:00', clockOut: '17:00', breakMinutes: 30, status: 'present', notes: '', hoursWorked: 7.5 },
    { id: '2', staffId: '2', date: '2024-04-20', clockIn: '09:30', clockOut: '17:30', breakMinutes: 45, status: 'late', notes: 'Traffic delay', hoursWorked: 7.25 },
    { id: '3', staffId: '3', date: '2024-04-20', clockIn: '10:00', clockOut: '18:00', breakMinutes: 30, status: 'overtime', notes: 'Covered for another shift', hoursWorked: 7.5 },
    { id: '4', staffId: '1', date: '2024-04-19', clockIn: '09:00', clockOut: '17:00', breakMinutes: 30, status: 'present', notes: '', hoursWorked: 7.5 },
    { id: '5', staffId: '2', date: '2024-04-19', clockIn: '09:00', clockOut: '17:00', breakMinutes: 30, status: 'present', notes: '', hoursWorked: 7.5 },
  ]);

  const [formData, setFormData] = useState({
    clockIn: '09:00',
    clockOut: '17:00',
    breakMinutes: '30',
    status: 'present',
    notes: ''
  });

  const getStaff = (id: string) => staff.find(s => s.id === id);
  const getActivitiesForDate = (date: string) => activities.filter(a => a.date === date);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'var(--success)';
      case 'absent': return 'var(--danger)';
      case 'late': return 'var(--warning)';
      case 'overtime': return 'var(--primary)';
      default: return 'var(--text-muted)';
    }
  };

  const openAddModal = (staffId?: string) => {
    setSelectedStaffId(staffId || staff[0]?.id || '');
    setEditingActivity(null);
    setFormData({ clockIn: '09:00', clockOut: '17:00', breakMinutes: '30', status: 'present', notes: '' });
    setShowModal(true);
  };

  const openEditModal = (activity: ActivityRecord) => {
    setSelectedStaffId(activity.staffId);
    setEditingActivity(activity);
    setFormData({
      clockIn: activity.clockIn,
      clockOut: activity.clockOut,
      breakMinutes: activity.breakMinutes.toString(),
      status: activity.status,
      notes: activity.notes
    });
    setShowModal(true);
  };

  const saveActivity = () => {
    const clockInHours = parseInt(formData.clockIn.split(':')[0]);
    const clockOutHours = parseInt(formData.clockOut.split(':')[0]);
    const breakHours = parseInt(formData.breakMinutes) / 60;
    const hoursWorked = clockOutHours - clockInHours - breakHours;
    const status = formData.status as ActivityRecord['status'];

    if (editingActivity) {
      setActivities(activities.map(a => 
        a.id === editingActivity.id 
          ? { ...a, ...formData, status, breakMinutes: parseInt(formData.breakMinutes), hoursWorked }
          : a
      ));
    } else {
      const newActivity: ActivityRecord = {
        id: String(activities.length + 1),
        staffId: selectedStaffId,
        date: selectedDate,
        clockIn: formData.clockIn,
        clockOut: formData.clockOut,
        breakMinutes: parseInt(formData.breakMinutes),
        status,
        notes: formData.notes,
        hoursWorked
      };
      setActivities([...activities, newActivity]);
    }
    setShowModal(false);
  };

  const deleteActivity = (activityId: string) => {
    if (confirm('Are you sure you want to delete this activity record?')) {
      setActivities(activities.filter(a => a.id !== activityId));
    }
  };

  const dateActivities = getActivitiesForDate(selectedDate);
  const presentCount = dateActivities.filter(a => a.status === 'present').length;
  const lateCount = dateActivities.filter(a => a.status === 'late').length;
  const absentCount = dateActivities.filter(a => a.status === 'absent').length;
  const overtimeCount = dateActivities.filter(a => a.status === 'overtime').length;
  const totalHours = dateActivities.reduce((sum, a) => sum + a.hoursWorked, 0);

  const activeStaff = staff.filter(s => s.status === 'active');
  const missingStaff = activeStaff.filter(s => !dateActivities.find(a => a.staffId === s.id));

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Staff Attendance</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input 
            type="date" 
            className="form-input" 
            style={{ width: '180px' }}
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => openAddModal()}>
            + Record Attendance
          </button>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '28px', color: 'var(--success)' }}>{presentCount}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--warning)' }}>
          <div className="stat-value" style={{ fontSize: '28px' }}>{lateCount}</div>
          <div className="stat-label">Late</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--danger)' }}>
          <div className="stat-value" style={{ fontSize: '28px' }}>{absentCount}</div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '28px', color: 'var(--primary)' }}>{overtimeCount}</div>
          <div className="stat-label">Overtime</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '28px' }}>{totalHours.toFixed(1)}h</div>
          <div className="stat-label">Total Hours</div>
        </div>
      </div>

      {missingStaff.length > 0 && (
        <div className="data-card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--warning)' }}>
          <div className="data-card-header">
            <h3 className="data-card-title" style={{ color: 'var(--warning)' }}>Missing Attendance</h3>
          </div>
          <div style={{ padding: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {missingStaff.map(s => (
              <button 
                key={s.id} 
                className="btn btn-secondary"
                onClick={() => { openAddModal(s.id); }}
              >
                + {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Staff</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Break</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dateActivities.map(activity => {
              const staffMember = getStaff(activity.staffId);
              return (
                <tr key={activity.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'white' }}>
                        {staffMember?.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span>{staffMember?.name}</span>
                    </div>
                  </td>
                  <td className="mono">{activity.clockIn}</td>
                  <td className="mono">{activity.clockOut}</td>
                  <td className="mono">{activity.breakMinutes}m</td>
                  <td className="mono" style={{ fontWeight: '600' }}>{activity.hoursWorked.toFixed(1)}h</td>
                  <td>
                    <span 
                      className={`badge`}
                      style={{ 
                        background: getStatusColor(activity.status),
                        color: 'white'
                      }}
                    >
                      {activity.status}
                    </span>
                  </td>
                  <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activity.notes || '-'}
                  </td>
                  <td>
                    <button className="action-btn edit" onClick={() => openEditModal(activity)}>Edit</button>
                    <button className="action-btn" style={{ marginLeft: '8px', color: 'var(--danger)' }} onClick={() => deleteActivity(activity.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {dateActivities.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-text">No attendance records for this date</div>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => openAddModal()}>
              Record Attendance
            </button>
          </div>
        )}
      </div>

      {/* Attendance Modal */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={() => setShowModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">
              {editingActivity ? 'Edit Attendance' : 'Record Attendance'}
            </h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Staff Member</label>
              <select 
                className="form-select" 
                value={selectedStaffId} 
                onChange={e => setSelectedStaffId(e.target.value)}
                disabled={!!editingActivity}
              >
                {activeStaff.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Clock In</label>
                <input 
                  type="time" 
                  className="form-input" 
                  value={formData.clockIn} 
                  onChange={e => setFormData({ ...formData, clockIn: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Clock Out</label>
                <input 
                  type="time" 
                  className="form-input" 
                  value={formData.clockOut} 
                  onChange={e => setFormData({ ...formData, clockOut: e.target.value })} 
                />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Break (minutes)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={formData.breakMinutes} 
                  onChange={e => setFormData({ ...formData, breakMinutes: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  className="form-select" 
                  value={formData.status} 
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="overtime">Overtime</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea 
                className="form-input" 
                style={{ minHeight: '80px' }}
                value={formData.notes} 
                onChange={e => setFormData({ ...formData, notes: e.target.value })} 
                placeholder="Any notes about this attendance..."
              />
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Calculated Hours</div>
              <div className="stat-value" style={{ fontSize: '24px' }}>
                {(() => {
                  const inH = parseInt(formData.clockIn.split(':')[0]);
                  const outH = parseInt(formData.clockOut.split(':')[0]);
                  const breakM = parseInt(formData.breakMinutes) / 60;
                  return (outH - inH - breakM).toFixed(1);
                })()}h
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveActivity}>
              {editingActivity ? 'Save Changes' : 'Record'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}