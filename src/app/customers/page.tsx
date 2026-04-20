'use client';

import { useState } from 'react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalVisits: number;
  totalSpent: number;
  lastVisit: string;
  birthday?: string;
  notes: string;
  tags: string[];
  loyaltyPoints: number;
  address?: string;
  preferences?: string;
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([
    { id: '1', name: 'John Smith', email: 'john.smith@email.com', phone: '(555) 123-4567', totalVisits: 15, totalSpent: 1250.00, lastVisit: '2024-04-18', birthday: '1985-06-15', notes: 'Regular weekend customer', tags: ['VIP', 'Regular'], loyaltyPoints: 1250, address: '123 Main St, City', preferences: 'Prefers window seating' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '(555) 234-5678', totalVisits: 8, totalSpent: 520.00, lastVisit: '2024-04-15', birthday: '1990-03-22', notes: 'Allergic to nuts', tags: ['Regular'], loyaltyPoints: 520, address: '456 Oak Ave, City' },
    { id: '3', name: 'Michael Brown', email: 'mbrown@email.com', phone: '(555) 345-6789', totalVisits: 3, totalSpent: 180.00, lastVisit: '2024-04-10', notes: 'First time visit was great', tags: ['New'], loyaltyPoints: 180 },
    { id: '4', name: 'Emily Davis', email: 'emily.davis@email.com', phone: '(555) 456-7890', totalVisits: 22, totalSpent: 2100.00, lastVisit: '2024-04-19', birthday: '1982-11-08', notes: 'Celebrates anniversaries here', tags: ['VIP', 'Loyal'], loyaltyPoints: 2100, address: '789 Pine Rd, City', preferences: 'Vegetarian options needed' },
    { id: '5', name: 'Robert Wilson', email: 'rwilson@email.com', phone: '(555) 567-8901', totalVisits: 1, totalSpent: 45.00, lastVisit: '2024-04-05', notes: 'Corporate event booking', tags: ['Business'], loyaltyPoints: 45 },
    { id: '6', name: 'Jennifer Lee', email: 'jlee@email.com', phone: '(555) 678-9012', totalVisits: 12, totalSpent: 890.00, lastVisit: '2024-04-17', birthday: '1988-07-30', notes: 'Brings family on weekends', tags: ['Family', 'Regular'], loyaltyPoints: 890, address: '321 Elm St, City' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const allTags = ['All', 'VIP', 'Regular', 'New', 'Loyal', 'Business', 'Family'];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    address: '',
    notes: '',
    preferences: '',
    tags: [] as string[]
  });

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);
    const matchesTag = tagFilter === 'all' || c.tags.includes(tagFilter);
    return matchesSearch && matchesTag;
  });

  const totalCustomers = customers.length;
  const vipCustomers = customers.filter(c => c.tags.includes('VIP')).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgSpent = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', birthday: '', address: '', notes: '', preferences: '', tags: [] });
    setShowModal(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      birthday: customer.birthday || '',
      address: customer.address || '',
      notes: customer.notes,
      preferences: customer.preferences || '',
      tags: customer.tags
    });
    setShowModal(true);
  };

  const viewCustomerDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const saveCustomer = () => {
    if (!formData.name || !formData.phone) return;

    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? {
        ...c,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        birthday: formData.birthday || undefined,
        address: formData.address || undefined,
        notes: formData.notes,
        preferences: formData.preferences || undefined,
        tags: formData.tags
      } : c));
    } else {
      const newCustomer: Customer = {
        id: String(customers.length + 1),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        birthday: formData.birthday || undefined,
        address: formData.address || undefined,
        notes: formData.notes,
        preferences: formData.preferences || undefined,
        tags: formData.tags,
        totalVisits: 0,
        totalSpent: 0,
        lastVisit: '-',
        loyaltyPoints: 0
      };
      setCustomers([...customers, newCustomer]);
    }
    setShowModal(false);
  };

  const deleteCustomer = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add Customer
        </button>
      </div>

      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ background: 'var(--primary)' }}>
          <div className="stat-value" style={{ fontSize: '32px' }}>{totalCustomers}</div>
          <div className="stat-label">Total Customers</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--warning)' }}>
          <div className="stat-value" style={{ fontSize: '32px' }}>{vipCustomers}</div>
          <div className="stat-label">VIP Customers</div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-value" style={{ fontSize: '32px' }}>{formatCurrency(totalRevenue)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '32px' }}>{formatCurrency(avgSpent)}</div>
          <div className="stat-label">Avg Spent</div>
        </div>
      </div>

      <div className="filter-bar">
        <input 
          className="form-input" 
          style={{ width: '300px' }}
          placeholder="Search customers..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select className="form-select" style={{ width: '150px' }} value={tagFilter} onChange={e => setTagFilter(e.target.value)}>
          {allTags.map(tag => (
            <option key={tag} value={tag === 'All' ? 'all' : tag}>{tag}</option>
          ))}
        </select>
      </div>

      <div className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Visits</th>
              <th>Total Spent</th>
              <th>Points</th>
              <th>Last Visit</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id}>
                <td>
                  <div style={{ fontWeight: '600' }}>{customer.name}</div>
                  {customer.birthday && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>🎂 {new Date(customer.birthday).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  )}
                </td>
                <td>
                  <div style={{ fontSize: '13px' }}>{customer.email}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{customer.phone}</div>
                </td>
                <td className="mono">{customer.totalVisits}</td>
                <td className="mono" style={{ fontWeight: '600' }}>{formatCurrency(customer.totalSpent)}</td>
                <td>
                  <span className="badge badge-pending">{customer.loyaltyPoints} pts</span>
                </td>
                <td className="mono">{customer.lastVisit}</td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {customer.tags.map(tag => (
                      <span key={tag} className={`badge ${tag === 'VIP' ? 'badge-warning' : tag === 'New' ? 'badge-available' : 'badge-in_progress'}`} style={{ fontSize: '10px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <button className="action-btn" onClick={() => viewCustomerDetail(customer)}>View</button>
                  <button className="action-btn edit" onClick={() => openEditModal(customer)}>Edit</button>
                  <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => deleteCustomer(customer.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCustomers.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-text">No customers found</div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={() => setShowModal(false)}>
        <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(555) 123-4567" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Birthday</label>
                <input className="form-input" type="date" value={formData.birthday} onChange={e => setFormData({ ...formData, birthday: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Full address" />
            </div>
            <div className="form-group">
              <label className="form-label">Preferences</label>
              <textarea className="form-input" rows={2} value={formData.preferences} onChange={e => setFormData({ ...formData, preferences: e.target.value })} placeholder="Dietary restrictions, seating preferences..." />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={2} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes..." />
            </div>
            <div className="form-group">
              <label className="form-label">Tags</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {formData.tags.map(tag => (
                  <span key={tag} className="badge badge-in_progress" style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)}>
                    {tag} ×
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['VIP', 'Regular', 'New', 'Loyal', 'Business', 'Family'].filter(t => !formData.tags.includes(t)).map(tag => (
                  <button key={tag} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => addTag(tag)}>
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveCustomer}>{editingCustomer ? 'Save Changes' : 'Add Customer'}</button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <div className={`modal-overlay ${showDetailModal ? 'active' : ''}`} onClick={() => setShowDetailModal(false)}>
        <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Customer Profile</h2>
            <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
          </div>
          <div className="modal-body">
            {selectedCustomer && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', padding: '20px', background: 'var(--bg-elevated)', borderRadius: '12px' }}>
                  <div style={{ width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '600', color: 'white' }}>
                    {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '24px', fontWeight: '700' }}>{selectedCustomer.name}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      {selectedCustomer.tags.map(tag => (
                        <span key={tag} className={`badge ${tag === 'VIP' ? 'badge-warning' : 'badge-in_progress'}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)' }}>{selectedCustomer.loyaltyPoints}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Loyalty Points</div>
                  </div>
                </div>

                <div className="grid-2" style={{ marginBottom: '24px' }}>
                  <div className="data-card">
                    <div className="data-card-header">
                      <h3 className="data-card-title">Contact Information</h3>
                    </div>
                    <div style={{ padding: '16px', display: 'grid', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email</div>
                        <div>{selectedCustomer.email || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phone</div>
                        <div>{selectedCustomer.phone}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Address</div>
                        <div>{selectedCustomer.address || '-'}</div>
                      </div>
                      {selectedCustomer.birthday && (
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Birthday</div>
                          <div>{new Date(selectedCustomer.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="data-card">
                    <div className="data-card-header">
                      <h3 className="data-card-title">Statistics</h3>
                    </div>
                    <div style={{ padding: '16px', display: 'grid', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Total Visits</span>
                        <span className="mono" style={{ fontWeight: '600' }}>{selectedCustomer.totalVisits}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Total Spent</span>
                        <span className="mono" style={{ fontWeight: '600', color: 'var(--success)' }}>{formatCurrency(selectedCustomer.totalSpent)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Avg per Visit</span>
                        <span className="mono" style={{ fontWeight: '600' }}>{formatCurrency(selectedCustomer.totalVisits > 0 ? selectedCustomer.totalSpent / selectedCustomer.totalVisits : 0)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Last Visit</span>
                        <span className="mono">{selectedCustomer.lastVisit}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCustomer.preferences && (
                  <div className="data-card" style={{ marginBottom: '24px' }}>
                    <div className="data-card-header">
                      <h3 className="data-card-title">Preferences</h3>
                    </div>
                    <div style={{ padding: '16px' }}>
                      {selectedCustomer.preferences}
                    </div>
                  </div>
                )}

                {selectedCustomer.notes && (
                  <div className="data-card">
                    <div className="data-card-header">
                      <h3 className="data-card-title">Notes</h3>
                    </div>
                    <div style={{ padding: '16px' }}>
                      {selectedCustomer.notes}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Close</button>
          </div>
        </div>
      </div>
    </>
  );
}