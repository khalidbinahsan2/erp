'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  
  // General settings
  const [restaurantName, setRestaurantName] = useState('RestaurantHub');
  const [address, setAddress] = useState('123 Main Street, City, State 12345');
  const [phone, setPhone] = useState('(555) 000-0000');
  const [email, setEmail] = useState('contact@restaurant.com');
  const [timezone, setTimezone] = useState('America/New_York');
  const [currency, setCurrency] = useState('USD');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');

// @ts-ignore
  // @ts-ignore
  const [notifications, setNotifications] = useState({
    lowStock: true,
    newReservation: true,
    orderComplete: false,
    dailyReport: true,
    weeklyReport: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  });

  // @ts-ignore
  const [displaySettings, setDisplaySettings] = useState({
    darkMode: false,
    compactView: false,
    showPrices: true,
    showImages: true,
    animatedTransitions: true,
    itemsPerPage: 20
  });

  // Order settings
  const [orderSettings, setOrderSettings] = useState<Record<string, boolean | number | string>>({
    autoRefresh: true,
    refreshInterval: 30,
    soundAlerts: true,
    defaultStatus: 'pending',
    autoAssignTable: true,
    requireConfirmation: false,
    allowEdit: true,
    allowCancel: true,
    cancelWindow: 30
  });

  // Staff settings
  const [staffSettings, setStaffSettings] = useState<Record<string, boolean | number>>({
    showSalaries: false,
    autoSchedule: false,
    shiftReminder: true,
    overtimeAlert: true,
    minStaffRequired: 3
  });

  // Inventory settings
  const [inventorySettings, setInventorySettings] = useState<Record<string, boolean | number>>({
    lowStockThreshold: 10,
    autoReorder: false,
    trackUsage: true,
    expirationWarnings: true,
    expirationDays: 7
  });

  // Table settings
  const [tableSettings, setTableSettings] = useState<Record<string, boolean | number>>({
    reservationDuration: 90,
    turnTime: 45,
    maxPartySize: 10,
    requireDeposit: false,
    allowSplit: true,
    tableMapping: true
  });

  // Report settings
  const [reportSettings, setReportSettings] = useState<Record<string, boolean | string>>({
    includeTaxes: true,
    includeDiscounts: true,
    groupByCategory: true,
    showTrends: true,
    exportFormat: 'csv'
  });

  // Data management
  const [dataSettings, setDataSettings] = useState<Record<string, boolean | string | number>>({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 30
  });

  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportData = () => {
    alert('Data export initiated. Your data will be downloaded as a zip file.');
  };

  const importData = () => {
    alert('Import functionality - select a backup file to restore.');
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      alert('Settings reset to defaults.');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <button className={`btn btn-primary ${saved ? 'btn-success' : ''}`} onClick={saveSettings}>
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid-4" style={{ gridTemplateColumns: '250px 1fr' }}>
        <div className="data-card" style={{ padding: '12px', height: 'fit-content' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'general', label: 'General', icon: '⚙️' },
              { id: 'notifications', label: 'Notifications', icon: '🔔' },
              { id: 'display', label: 'Display', icon: '🖥️' },
              { id: 'orders', label: 'Orders', icon: '📋' },
              { id: 'staff', label: 'Staff', icon: '👥' },
              { id: 'inventory', label: 'Inventory', icon: '📦' },
              { id: 'tables', label: 'Tables', icon: '🪑' },
              { id: 'reports', label: 'Reports', icon: '📈' },
              { id: 'data', label: 'Data', icon: '💾' },
            ].map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left',
                  background: activeTab === item.id ? 'var(--primary)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: activeTab === item.id ? 'white' : 'var(--text)',
                  fontWeight: activeTab === item.id ? '600' : '400'
                }}
              >
                <span style={{ marginRight: '8px' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div>
          {activeTab === 'general' && (
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">General Settings</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Restaurant Name</label>
                  <input className="form-input" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select className="form-select" value={timezone} onChange={e => setTimezone(e.target.value)}>
                      <option value="America/New_York">Eastern (ET)</option>
                      <option value="America/Chicago">Central (CT)</option>
                      <option value="America/Denver">Mountain (MT)</option>
                      <option value="America/Los_Angeles">Pacific (PT)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date Format</label>
                    <select className="form-select" value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Notification Settings</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <h4 style={{ marginBottom: '16px' }}>In-App Notifications</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'lowStock', label: 'Low stock alerts', desc: 'Get notified when inventory items are low' },
                    { key: 'newReservation', label: 'New reservations', desc: 'Get notified for new reservation bookings' },
                    { key: 'orderComplete', label: 'Order completion', desc: 'Get notified when orders are completed' },
                    { key: 'dailyReport', label: 'Daily summary', desc: 'Receive daily sales summary' },
                    { key: 'weeklyReport', label: 'Weekly report', desc: 'Receive weekly analytics report' },
                  ].map(item => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={!!(notifications as any)[item.key]} 
                        onChange={e => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                      />
                      <div>
                        <div style={{ fontWeight: '600' }}>{item.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <h4 style={{ marginTop: '24px', marginBottom: '16px' }}>Notification Methods</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'emailNotifications', label: 'Email notifications' },
                    { key: 'smsNotifications', label: 'SMS notifications' },
                    { key: 'pushNotifications', label: 'Push notifications' },
                  ].map(item => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={!!(notifications as any)[item.key]} 
                        onChange={e => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Display Settings</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'darkMode', label: 'Dark mode', desc: 'Use dark theme throughout the app' },
                    { key: 'compactView', label: 'Compact view', desc: 'Show more items in less space' },
                    { key: 'showPrices', label: 'Show prices', desc: 'Display menu item prices' },
                    { key: 'showImages', label: 'Show images', desc: 'Display menu item images' },
                    { key: 'animatedTransitions', label: 'Animated transitions', desc: 'Use animations when navigating' },
                  ].map(item => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={!!(displaySettings as any)[item.key]} 
                        onChange={e => setDisplaySettings({ ...displaySettings, [item.key]: e.target.checked })}
                      />
                      <div>
                        <div style={{ fontWeight: '600' }}>{item.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Items Per Page</label>
                  <select className="form-select" value={displaySettings.itemsPerPage} onChange={e => setDisplaySettings({ ...displaySettings, itemsPerPage: parseInt(e.target.value) })}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Order Settings</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'autoRefresh', label: 'Auto-refresh orders', desc: 'Automatically refresh the orders list' },
                    { key: 'soundAlerts', label: 'Sound alerts', desc: 'Play sounds for new orders' },
                    { key: 'autoAssignTable', label: 'Auto-assign tables', desc: 'Automatically assign available tables' },
                    { key: 'requireConfirmation', label: 'Require confirmation', desc: 'Require confirmation before completing orders' },
                    { key: 'allowEdit', label: 'Allow editing', desc: 'Allow editing of existing orders' },
                    { key: 'allowCancel', label: 'Allow cancellation', desc: 'Allow cancellation of orders' },
                  ].map(item => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={!!(orderSettings as any)[item.key]} 
                        onChange={e => setOrderSettings({ ...orderSettings, [item.key]: e.target.checked })}
                      />
                      <div>
                        <div style={{ fontWeight: '600' }}>{item.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="grid-2" style={{ marginTop: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Refresh Interval (seconds)</label>
                    <input className="form-input" type="number" value={orderSettings.refreshInterval as number} onChange={e => setOrderSettings({ ...orderSettings, refreshInterval: parseInt(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cancel Window (minutes)</label>
                    <input className="form-input" type="number" value={orderSettings.cancelWindow as number} onChange={e => setOrderSettings({ ...orderSettings, cancelWindow: parseInt(e.target.value) })} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Staff Settings</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'showSalaries', label: 'Show salary data', desc: 'Display salary information in staff profiles' },
                    { key: 'autoSchedule', label: 'Auto-schedule', desc: 'Automatically generate staff schedules' },
                    { key: 'shiftReminder', label: 'Shift reminders', desc: 'Send reminders before shifts' },
                    { key: 'overtimeAlert', label: 'Overtime alerts', desc: 'Alert when staff approaches overtime' },
                  ].map(item => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={!!(staffSettings as any)[item.key]} 
                        onChange={e => setStaffSettings({ ...staffSettings, [item.key]: e.target.checked })}
                      />
                      <div>
                        <div style={{ fontWeight: '600' }}>{item.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Minimum Staff Required</label>
                  <input className="form-input" type="number" value={staffSettings.minStaffRequired as number} onChange={e => setStaffSettings({ ...staffSettings, minStaffRequired: parseInt(e.target.value) })} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Inventory Settings</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'autoReorder', label: 'Auto-reorder', desc: 'Automatically create purchase orders for low stock' },
                    { key: 'trackUsage', label: 'Track usage', desc: 'Track inventory usage over time' },
                    { key: 'expirationWarnings', label: 'Expiration warnings', desc: 'Warn about expiring items' },
                  ].map(item => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={!!(inventorySettings as any)[item.key]} 
                        onChange={e => setInventorySettings({ ...inventorySettings, [item.key]: e.target.checked })}
                      />
                      <div>
                        <div style={{ fontWeight: '600' }}>{item.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="grid-2" style={{ marginTop: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Low Stock Threshold (%)</label>
                    <input className="form-input" type="number" value={inventorySettings.lowStockThreshold as number} onChange={e => setInventorySettings({ ...inventorySettings, lowStockThreshold: parseInt(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiration Warning (days)</label>
                    <input className="form-input" type="number" value={inventorySettings.expirationDays as number} onChange={e => setInventorySettings({ ...inventorySettings, expirationDays: parseInt(e.target.value) })} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Table Settings</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'requireDeposit', label: 'Require deposit', desc: 'Require deposit for reservations' },
                    { key: 'allowSplit', label: 'Allow splitting', desc: 'Allow tables to be split for larger parties' },
                    { key: 'tableMapping', label: 'Table mapping', desc: 'Show table positions on floor plan' },
                  ].map(item => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={!!(tableSettings as any)[item.key]} 
                        onChange={e => setTableSettings({ ...tableSettings, [item.key]: e.target.checked })}
                      />
                      <div>
                        <div style={{ fontWeight: '600' }}>{item.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="grid-3" style={{ marginTop: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Reservation Duration (min)</label>
                    <input className="form-input" type="number" value={tableSettings.reservationDuration as number} onChange={e => setTableSettings({ ...tableSettings, reservationDuration: parseInt(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Turn Time (min)</label>
                    <input className="form-input" type="number" value={tableSettings.turnTime as number} onChange={e => setTableSettings({ ...tableSettings, turnTime: parseInt(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Party Size</label>
                    <input className="form-input" type="number" value={tableSettings.maxPartySize as number} onChange={e => setTableSettings({ ...tableSettings, maxPartySize: parseInt(e.target.value) })} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Report Settings</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'includeTaxes', label: 'Include taxes', desc: 'Include taxes in revenue reports' },
                    { key: 'includeDiscounts', label: 'Include discounts', desc: 'Show discounts in reports' },
                    { key: 'groupByCategory', label: 'Group by category', desc: 'Group menu items by category' },
                    { key: 'showTrends', label: 'Show trends', desc: 'Display trend analytics' },
                  ].map(item => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={!!(reportSettings as any)[item.key]} 
                        onChange={e => setReportSettings({ ...reportSettings, [item.key]: e.target.checked })}
                      />
                      <div>
                        <div style={{ fontWeight: '600' }}>{item.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Default Export Format</label>
                  <select className="form-select" value={reportSettings.exportFormat as string} onChange={e => setReportSettings({ ...reportSettings, exportFormat: e.target.value })}>
                    <option value="csv">CSV</option>
                    <option value="xlsx">Excel (XLSX)</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Data Management</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { key: 'autoBackup', label: 'Automatic backups', desc: 'Automatically backup data daily' },
                  ].map(item => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={!!(dataSettings as any)[item.key]} 
                        onChange={e => setDataSettings({ ...dataSettings, [item.key]: e.target.checked })}
                      />
                      <div>
                        <div style={{ fontWeight: '600' }}>{item.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="grid-2" style={{ marginBottom: '24px' }}>
                  <div className="form-group">
                    <label className="form-label">Backup Frequency</label>
                    <select className="form-select" value={dataSettings.backupFrequency as string} onChange={e => setDataSettings({ ...dataSettings, backupFrequency: e.target.value })} disabled={!dataSettings.autoBackup}>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Data Retention (days)</label>
                    <input className="form-input" type="number" value={dataSettings.retentionDays as number} onChange={e => setDataSettings({ ...dataSettings, retentionDays: parseInt(e.target.value) })} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', padding: '24px', border: '2px dashed var(--border)', borderRadius: '8px' }}>
                  <button className="btn btn-secondary" onClick={exportData}>
                    Export Data
                  </button>
                  <button className="btn btn-secondary" onClick={importData}>
                    Import Data
                  </button>
                  <button className="btn btn-primary" onClick={resetSettings} style={{ background: 'var(--danger)' }}>
                    Reset Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}