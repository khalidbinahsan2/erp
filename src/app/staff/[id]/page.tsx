'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { staff as initialStaff, orders } from '@/lib/mockData';
import { Staff } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export default function StaffDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [staffData, setStaffData] = useState<Staff[]>(initialStaff);
  const member = staffData.find(s => s.id === id);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [formData, setFormData] = useState({
    name: member?.name || '',
    role: member?.role || 'Server',
    phone: member?.phone || '',
    email: member?.email || '',
    status: member?.status || 'active',
    hourlyRate: member?.salary?.hourlyRate.toString() || '',
    overtimeHours: member?.salary?.overtimeHours.toString() || ''
  });

  const [scheduleForm, setScheduleForm] = useState(member?.schedule || [
    { day: 'Monday', startTime: '09:00', endTime: '17:00' }
  ]);

  if (!member) {
    return (
      <div className="data-card" style={{ padding: '48px', textAlign: 'center' }}>
        <h2>Staff member not found</h2>
        <button className="btn btn-primary" onClick={() => router.push('/staff')} style={{ marginTop: '16px' }}>
          Back to Staff List
        </button>
      </div>
    );
  }

  const salary = member.salary;
  const hasOvertime = (salary?.overtimeHours || 0) > 0;

  // Performance data (mock)
  const performance = {
    ordersHandled: 35,
    revenue: 1245,
    rating: '4.5',
    shiftsCompleted: 15
  };

  // Recent activity (mock)
  const recentActivity = [
    { date: '2024-04-20', action: 'Completed shift', duration: '8h' },
    { date: '2024-04-19', action: 'Completed shift', duration: '8h' },
    { date: '2024-04-18', action: 'Late arrival', duration: '7.5h' },
    { date: '2024-04-17', action: 'Completed shift', duration: '8h' },
  ];

  const updateStaff = (updates: Partial<Staff>) => {
    setStaffData(staffData.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const saveStaff = () => {
    const hourlyRate = parseFloat(formData.hourlyRate) || 0;
    const overtimeHours = parseFloat(formData.overtimeHours) || 0;
    const hoursWorked = 160 + overtimeHours;
    const monthlySalary = Math.round(hourlyRate * hoursWorked + (overtimeHours * hourlyRate * 1.5));

    updateStaff({
      name: formData.name,
      role: formData.role,
      phone: formData.phone,
      email: formData.email,
      status: formData.status as 'active' | 'inactive',
      salary: hourlyRate > 0 ? { hourlyRate, hoursWorked, overtimeHours, monthlySalary } : undefined
    });
    setIsEditing(false);
  };

  const saveSchedule = () => {
    updateStaff({ schedule: scheduleForm });
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

  const toggleStatus = () => {
    updateStaff({ status: member.status === 'active' ? 'inactive' : 'active' });
  };

  const calculateWeeklyHours = () => {
    return scheduleForm.reduce((total, shift) => {
      const start = parseInt(shift.startTime.split(':')[0]);
      const end = parseInt(shift.endTime.split(':')[0]);
      return total + (end - start);
    }, 0);
  };

  const weeklyHours = calculateWeeklyHours();

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-secondary" onClick={() => router.push('/staff')}>← Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '60px', height: '60px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '600', color: 'white' }}>
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="page-title" style={{ marginBottom: '4px' }}>{member.name}</h1>
              <span className="badge badge-in_progress">{member.role}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className={`badge badge-${member.status}`}>{member.status}</span>
          <button className="btn btn-secondary" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          {isEditing && (
            <button className="btn btn-primary" onClick={saveStaff}>Save Changes</button>
          )}
        </div>
      </div>

      {hasOvertime && (
        <div style={{ padding: '12px 16px', background: 'var(--warning)', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚠️ This staff member has {salary?.overtimeHours} hours of overtime this month
        </div>
      )}

      <div className="grid-4" style={{ gridTemplateColumns: '280px 1fr' }}>
        {/* Sidebar */}
        <div>
          <div className="data-card" style={{ marginBottom: '16px' }}>
            <div className="data-card-header">
              <h3 className="data-card-title">Quick Actions</h3>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => setShowScheduleModal(true)}>
                📅 Manage Schedule
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => setShowSalaryModal(true)}>
                💰 Set Salary
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={toggleStatus}>
                {member.status === 'active' ? '⏸️ Deactivate' : '▶️ Activate'}
              </button>
            </div>
          </div>

          <div className="data-card">
            <div className="data-card-header">
              <h3 className="data-card-title">Contact Info</h3>
            </div>
            <div style={{ padding: '16px' }}>
              {isEditing ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phone</div>
                    <div>{member.phone}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email</div>
                    <div>{member.email}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div>
          <div className="tabs">
            <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
            <button className={`tab ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>Schedule</button>
            <button className={`tab ${activeTab === 'salary' ? 'active' : ''}`} onClick={() => setActiveTab('salary')}>Salary</button>
            <button className={`tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>Activity</button>
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="stat-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                  <div className="stat-icon orders">📋</div>
                  <div className="stat-value">{performance.ordersHandled}</div>
                  <div className="stat-label">Orders Handled</div>
                </div>
                <div className="stat-card revenue">
                  <div className="stat-icon revenue">💰</div>
                  <div className="stat-value">${performance.revenue}</div>
                  <div className="stat-label">Revenue</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orders">⭐</div>
                  <div className="stat-value">{performance.rating}/5</div>
                  <div className="stat-label">Rating</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon tables">🕐</div>
                  <div className="stat-value">{performance.shiftsCompleted}</div>
                  <div className="stat-label">Shifts</div>
                </div>
              </div>

              {isEditing && (
                <div className="data-card" style={{ marginBottom: '24px' }}>
                  <div className="data-card-header">
                    <h3 className="data-card-title">Edit Details</h3>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Role</label>
                        <select className="form-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                          <option value="Manager">Manager</option>
                          <option value="Chef">Chef</option>
                          <option value="Server">Server</option>
                          <option value="Cashier">Cashier</option>
                          <option value="Host">Host</option>
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
                  </div>
                </div>
              )}

              <div className="grid-2">
                <div className="data-card">
                  <div className="data-card-header">
                    <h3 className="data-card-title">This Week</h3>
                  </div>
                  <div style={{ padding: '24px', textAlign: 'center' }}>
                    <div className="stat-value" style={{ fontSize: '48px' }}>{weeklyHours}h</div>
                    <div className="stat-label">Hours Scheduled</div>
                    <div style={{ marginTop: '16px' }}>
                      <span className={`badge ${weeklyHours > 40 ? 'badge-pending' : 'badge-available'}`}>
                        {weeklyHours > 40 ? 'Overtime' : 'On Track'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="data-card">
                  <div className="data-card-header">
                    <h3 className="data-card-title">Monthly Summary</h3>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span>Regular Hours</span>
                      <span className="mono">160h</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span>Overtime</span>
                      <span className="mono" style={{ color: hasOvertime ? 'var(--warning)' : 'inherit' }}>{salary?.overtimeHours || 0}h</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontWeight: '600' }}>Total Hours</span>
                      <span className="mono" style={{ fontWeight: '600' }}>{(salary?.hoursWorked || 160) + (salary?.overtimeHours || 0)}h</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'schedule' && (
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Weekly Schedule</h3>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total: {weeklyHours}h/week</span>
              </div>
              <div style={{ padding: '24px' }}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                  const shift = scheduleForm.find(s => s.day === day);
                  return (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: '100px', fontWeight: '600' }}>{day}</div>
                      <div style={{ flex: 1 }}>
                        {shift ? (
                          <span style={{ color: 'var(--primary)' }}>{shift.startTime} - {shift.endTime}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>No shift</span>
                        )}
                      </div>
                      {shift && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {parseInt(shift.endTime.split(':')[0]) - parseInt(shift.startTime.split(':')[0])}h
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'salary' && (
            <div className="grid-2">
              <div className="data-card">
                <div className="data-card-header">
                  <h3 className="data-card-title">Compensation</h3>
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Hourly Rate</div>
                    <div className="stat-value" style={{ fontSize: '32px' }}>${salary?.hourlyRate || 0}/hr</div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Monthly Salary</div>
                    <div className="stat-value" style={{ fontSize: '32px', color: 'var(--primary)' }}>${salary?.monthlySalary || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Annual Estimate</div>
                    <div className="stat-value" style={{ fontSize: '32px' }}>${((salary?.monthlySalary || 0) * 12).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="data-card">
                <div className="data-card-header">
                  <h3 className="data-card-title">Overtime Status</h3>
                </div>
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <div className="stat-value" style={{ fontSize: '48px', color: hasOvertime ? 'var(--warning)' : 'var(--success)' }}>
                    {salary?.overtimeHours || 0}h
                  </div>
                  <div className="stat-label">Overtime Hours</div>
                  <div style={{ marginTop: '16px' }}>
                    <span className={`badge ${hasOvertime ? 'badge-pending' : 'badge-available'}`}>
                      {hasOvertime ? '⚠️ Overtime Applied' : 'No Overtime'}
                    </span>
                  </div>
                  {hasOvertime && (
                    <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
                      OT Pay: ${Math.round((salary?.hourlyRate || 0) * 1.5 * (salary?.overtimeHours || 0))}
                    </div>
                  )}
                </div>
              </div>

              <div className="data-card" style={{ gridColumn: 'span 2' }}>
                <div className="data-card-header">
                  <h3 className="data-card-title">Salary Breakdown</h3>
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span>Regular Pay (160h × ${salary?.hourlyRate || 0})</span>
                    <span className="mono">${(salary?.hourlyRate || 0) * 160}</span>
                  </div>
                  {hasOvertime && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span>Overtime Pay ({salary?.overtimeHours}h × ${(salary?.hourlyRate || 0) * 1.5}/h)</span>
                      <span className="mono">${Math.round((salary?.hourlyRate || 0) * 1.5 * (salary?.overtimeHours || 0))}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '2px solid var(--border)', fontWeight: '600' }}>
                    <span>Monthly Total</span>
                    <span className="mono" style={{ fontSize: '18px' }}>${salary?.monthlySalary || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Recent Activity</h3>
              </div>
              <div style={{ padding: '24px' }}>
                {recentActivity.map((activity, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: index < recentActivity.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: '100px', fontSize: '14px', color: 'var(--text-muted)' }}>{activity.date}</div>
                    <div style={{ flex: 1 }}>{activity.action}</div>
                    <div className="mono">{activity.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Salary Modal */}
      <div className={`modal-overlay ${showSalaryModal ? 'active' : ''}`} onClick={() => setShowSalaryModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Set Salary</h2>
            <button className="modal-close" onClick={() => setShowSalaryModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Hourly Rate ($)</label>
              <input className="form-input" type="number" step="0.01" value={formData.hourlyRate} onChange={e => setFormData({ ...formData, hourlyRate: e.target.value })} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Overtime Hours This Month</label>
              <input className="form-input" type="number" value={formData.overtimeHours} onChange={e => setFormData({ ...formData, overtimeHours: e.target.value })} placeholder="0" />
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px', marginTop: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Calculated Monthly Salary</div>
              <div className="stat-value" style={{ fontSize: '32px', color: 'var(--primary)' }}>
                ${Math.round((parseFloat(formData.hourlyRate) || 0) * 160 + (parseFloat(formData.hourlyRate) || 0) * 1.5 * (parseFloat(formData.overtimeHours) || 0))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowSalaryModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { saveStaff(); setShowSalaryModal(false); }}>Save Salary</button>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <div className={`modal-overlay ${showScheduleModal ? 'active' : ''}`} onClick={() => setShowScheduleModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Manage Schedule - {member.name}</h2>
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