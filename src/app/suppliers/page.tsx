'use client';

import { useState } from 'react';

interface PurchaseOrder {
  id: string;
  orderDate: string;
  deliveryDate: string;
  total: number;
  status: 'pending' | 'received' | 'delayed' | 'cancelled';
  items: string[];
}

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  paymentTerms: string;
  notes: string;
  rating: number;
  status: 'active' | 'inactive';
  onTimeDeliveryRate: number;
  averageLeadTime: number;
  totalSpend: number;
  totalOrders: number;
  lastOrderDate: string;
  categories: string[];
  purchaseOrders: PurchaseOrder[];
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'Prime Food Distributors',
      contactName: 'David Martinez',
      email: 'david@primefoods.com',
      phone: '(555) 111-2222',
      address: '123 Industrial Blvd, City',
      taxId: 'XX-XXXXXXX',
      paymentTerms: 'Net 30',
      notes: 'Reliable supplier for premium meats and seafood. Preferred vendor for restaurant operations.',
      rating: 4.8,
      status: 'active',
      onTimeDeliveryRate: 96.5,
      averageLeadTime: 2,
      totalSpend: 24850.75,
      totalOrders: 42,
      lastOrderDate: '2026-04-20',
      categories: ['Meats', 'Seafood', 'Poultry'],
      purchaseOrders: [
        { id: 'PO-001', orderDate: '2026-04-20', deliveryDate: '2026-04-22', total: 1250.50, status: 'received', items: ['Wagyu Beef', 'Atlantic Salmon'] },
        { id: 'PO-002', orderDate: '2026-04-12', deliveryDate: '2026-04-14', total: 890.25, status: 'received', items: ['Chicken Breast', 'Pork Loin'] },
        { id: 'PO-003', orderDate: '2026-04-05', deliveryDate: '2026-04-08', total: 2100.00, status: 'delayed', items: ['Lamb Chops', 'Duck Breast'] }
      ]
    },
    {
      id: '2',
      name: 'Fresh Harvest Produce',
      contactName: 'Sarah Thompson',
      email: 'sarah@freshharvest.com',
      phone: '(555) 222-3333',
      address: '456 Farm Road, City',
      taxId: 'YY-YYYYYYY',
      paymentTerms: 'Net 15',
      notes: 'Local organic farm. Provides seasonal vegetables and fruits. Delivery every Tuesday and Friday.',
      rating: 4.6,
      status: 'active',
      onTimeDeliveryRate: 92.3,
      averageLeadTime: 1,
      totalSpend: 15420.30,
      totalOrders: 68,
      lastOrderDate: '2026-04-21',
      categories: ['Vegetables', 'Fruits', 'Herbs'],
      purchaseOrders: [
        { id: 'PO-004', orderDate: '2026-04-21', deliveryDate: '2026-04-22', total: 450.00, status: 'received', items: ['Lettuce', 'Tomatoes', 'Basil'] },
        { id: 'PO-005', orderDate: '2026-04-18', deliveryDate: '2026-04-19', total: 380.50, status: 'received', items: ['Mushrooms', 'Spinach', 'Arugula'] }
      ]
    },
    {
      id: '3',
      name: 'Gourmet Pantry Supplies',
      contactName: 'Robert Kim',
      email: 'robert@gourmetpantry.com',
      phone: '(555) 333-4444',
      address: '789 Warehouse Ave, City',
      taxId: 'ZZ-ZZZZZZZ',
      paymentTerms: 'Net 45',
      notes: 'Specialty ingredients: imported cheeses, truffles, exotic spices. Minimum order $500.',
      rating: 4.4,
      status: 'active',
      onTimeDeliveryRate: 88.7,
      averageLeadTime: 5,
      totalSpend: 18960.00,
      totalOrders: 24,
      lastOrderDate: '2026-04-15',
      categories: ['Dairy', 'Spices', 'Dry Goods'],
      purchaseOrders: [
        { id: 'PO-006', orderDate: '2026-04-15', deliveryDate: '2026-04-20', total: 2400.00, status: 'received', items: ['Parmesan Cheese', 'Black Truffle', 'Olive Oil'] }
      ]
    },
    {
      id: '4',
      name: 'Beverage World Inc',
      contactName: 'Jennifer Adams',
      email: 'jennifer@beverageworld.com',
      phone: '(555) 444-5555',
      address: '321 Beverage Drive, City',
      taxId: 'AA-AAAAAAA',
      paymentTerms: 'Net 30',
      notes: 'Wine, spirits, and craft beverages. Offers seasonal discounts on bulk orders.',
      rating: 4.7,
      status: 'active',
      onTimeDeliveryRate: 94.2,
      averageLeadTime: 3,
      totalSpend: 32150.00,
      totalOrders: 36,
      lastOrderDate: '2026-04-18',
      categories: ['Wine', 'Spirits', 'Soft Drinks'],
      purchaseOrders: []
    },
    {
      id: '5',
      name: 'Restaurant Equipment Co',
      contactName: 'Michael Torres',
      email: 'michael@reco.com',
      phone: '(555) 555-6666',
      address: '567 Commercial St, City',
      taxId: 'BB-BBBBBBB',
      paymentTerms: 'Net 60',
      notes: 'Kitchen equipment, utensils, and supplies. Provides maintenance services.',
      rating: 4.2,
      status: 'active',
      onTimeDeliveryRate: 85.5,
      averageLeadTime: 7,
      totalSpend: 45200.00,
      totalOrders: 12,
      lastOrderDate: '2026-03-28',
      categories: ['Equipment', 'Supplies'],
      purchaseOrders: []
    },
    {
      id: '6',
      name: 'Seafood Specialists',
      contactName: 'Thomas Chen',
      email: 'thomas@seafoodspec.com',
      phone: '(555) 666-7777',
      address: '890 Harbor Rd, City',
      taxId: 'CC-CCCCCCC',
      paymentTerms: 'Net 10',
      notes: 'Daily fresh seafood deliveries. Requires refrigerated storage upon delivery.',
      rating: 4.9,
      status: 'active',
      onTimeDeliveryRate: 98.1,
      averageLeadTime: 1,
      totalSpend: 28750.25,
      totalOrders: 56,
      lastOrderDate: '2026-04-22',
      categories: ['Seafood'],
      purchaseOrders: []
    },
    {
      id: '7',
      name: 'Green Leaf Organics',
      contactName: 'Emma Wilson',
      email: 'emma@greenleaf.com',
      phone: '(555) 777-8888',
      address: '234 Eco Lane, City',
      taxId: 'DD-DDDDDDD',
      paymentTerms: 'Net 15',
      notes: '100% organic produce. Higher pricing but certified sustainable.',
      rating: 4.5,
      status: 'inactive',
      onTimeDeliveryRate: 79.8,
      averageLeadTime: 4,
      totalSpend: 8920.50,
      totalOrders: 18,
      lastOrderDate: '2026-02-14',
      categories: ['Vegetables', 'Fruits'],
      purchaseOrders: []
    },
    {
      id: '8',
      name: 'Artisan Bakery Supply',
      contactName: 'Lucas Rodriguez',
      email: 'lucas@artisanbakery.com',
      phone: '(555) 888-9999',
      address: '678 Baker St, City',
      taxId: 'EE-EEEEEEE',
      paymentTerms: 'Net 30',
      notes: 'Specialty flours, yeast, and baking supplies. Delivers daily for pastry department.',
      rating: 4.6,
      status: 'active',
      onTimeDeliveryRate: 93.4,
      averageLeadTime: 2,
      totalSpend: 12480.00,
      totalOrders: 45,
      lastOrderDate: '2026-04-22',
      categories: ['Baking', 'Dry Goods'],
      purchaseOrders: []
    },
    {
      id: '9',
      name: 'Protein Plus Meats',
      contactName: 'Andrew Johnson',
      email: 'andrew@proteinplus.com',
      phone: '(555) 999-0000',
      address: '901 Butcher Way, City',
      taxId: 'FF-FFFFFFF',
      paymentTerms: 'Net 20',
      notes: 'Premium grass-fed beef and free-range poultry. Custom cuts available.',
      rating: 4.3,
      status: 'active',
      onTimeDeliveryRate: 90.2,
      averageLeadTime: 3,
      totalSpend: 16540.75,
      totalOrders: 31,
      lastOrderDate: '2026-04-19',
      categories: ['Meats', 'Poultry'],
      purchaseOrders: []
    },
    {
      id: '10',
      name: 'Global Gourmet Imports',
      contactName: 'Sophie Laurent',
      email: 'sophie@globalgourmet.com',
      phone: '(555) 000-1111',
      address: '111 International Dr, City',
      taxId: 'GG-GGGGGGG',
      paymentTerms: 'Net 45',
      notes: 'Imported specialty items from Europe and Asia. Longer lead times for international shipments.',
      rating: 4.1,
      status: 'active',
      onTimeDeliveryRate: 82.6,
      averageLeadTime: 14,
      totalSpend: 9870.00,
      totalOrders: 8,
      lastOrderDate: '2026-04-01',
      categories: ['Specialty', 'Dry Goods'],
      purchaseOrders: []
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const allCategories = ['All', 'Meats', 'Seafood', 'Poultry', 'Vegetables', 'Fruits', 'Dairy', 'Spices', 'Beverages', 'Dry Goods', 'Supplies', 'Equipment'];

  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    paymentTerms: '',
    notes: '',
    rating: 3,
    status: 'active' as 'active' | 'inactive',
    categories: [] as string[]
  });

  const filteredSuppliers = suppliers
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || s.categories.includes(categoryFilter);
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'rating': return b.rating - a.rating;
        case 'spend': return b.totalSpend - a.totalSpend;
        case 'orders': return b.totalOrders - a.totalOrders;
        case 'delivery': return b.onTimeDeliveryRate - a.onTimeDeliveryRate;
        default: return 0;
      }
    });

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const totalSpend = suppliers.reduce((sum, s) => sum + s.totalSpend, 0);
  const avgDeliveryRate = totalSuppliers > 0 
    ? suppliers.reduce((sum, s) => sum + s.onTimeDeliveryRate, 0) / totalSuppliers 
    : 0;

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({ name: '', contactName: '', email: '', phone: '', address: '', taxId: '', paymentTerms: '', notes: '', rating: 3, status: 'active', categories: [] });
    setShowModal(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      taxId: supplier.taxId,
      paymentTerms: supplier.paymentTerms,
      notes: supplier.notes,
      rating: supplier.rating,
      status: supplier.status,
      categories: supplier.categories
    });
    setShowModal(true);
  };

  const viewSupplierDetail = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailModal(true);
  };

  const saveSupplier = () => {
    if (!formData.name || !formData.phone) return;

    if (editingSupplier) {
      setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? {
        ...s,
        name: formData.name,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        taxId: formData.taxId,
        paymentTerms: formData.paymentTerms,
        notes: formData.notes,
        rating: formData.rating,
        status: formData.status,
        categories: formData.categories
      } : s));
    } else {
      const newSupplier: Supplier = {
        id: String(suppliers.length + 1),
        name: formData.name,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        taxId: formData.taxId,
        paymentTerms: formData.paymentTerms,
        notes: formData.notes,
        rating: formData.rating,
        status: formData.status,
        categories: formData.categories,
        onTimeDeliveryRate: 0,
        averageLeadTime: 0,
        totalSpend: 0,
        totalOrders: 0,
        lastOrderDate: '-',
        purchaseOrders: []
      };
      setSuppliers([...suppliers, newSupplier]);
    }
    setShowModal(false);
  };

  const deleteSupplier = (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  const toggleCategory = (category: string) => {
    if (formData.categories.includes(category)) {
      setFormData({ ...formData, categories: formData.categories.filter(c => c !== category) });
    } else {
      setFormData({ ...formData, categories: [...formData.categories, category] });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} style={{ color: star <= Math.round(rating) ? '#fbbf24' : '#d1d5db' }}>★</span>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Suppliers</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add Supplier
        </button>
      </div>

      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ background: 'var(--primary)' }}>
          <div className="stat-value" style={{ fontSize: '32px' }}>{totalSuppliers}</div>
          <div className="stat-label">Total Suppliers</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--success)' }}>
          <div className="stat-value" style={{ fontSize: '32px' }}>{activeSuppliers}</div>
          <div className="stat-label">Active Suppliers</div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-value" style={{ fontSize: '32px' }}>{formatCurrency(totalSpend)}</div>
          <div className="stat-label">Total Spend</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '32px' }}>{avgDeliveryRate.toFixed(1)}%</div>
          <div className="stat-label">Avg On-Time Delivery</div>
        </div>
      </div>

      <div className="filter-bar">
        <input 
          className="form-input" 
          style={{ width: '300px' }}
          placeholder="Search suppliers..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select className="form-select" style={{ width: '150px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="form-select" style={{ width: '150px' }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          {allCategories.map(cat => (
            <option key={cat} value={cat === 'All' ? 'all' : cat}>{cat}</option>
          ))}
        </select>
        <select className="form-select" style={{ width: '180px' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="rating">Sort by Rating</option>
          <option value="spend">Sort by Spend</option>
          <option value="orders">Sort by Orders</option>
          <option value="delivery">Sort by Delivery Rate</option>
        </select>
      </div>

      <div className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Contact</th>
              <th>Rating</th>
              <th>Total Spend</th>
              <th>Orders</th>
              <th>Delivery Rate</th>
              <th>Lead Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map(supplier => (
              <tr key={supplier.id}>
                <td>
                  <div style={{ fontWeight: '600' }}>{supplier.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{supplier.categories.join(', ')}</div>
                </td>
                <td>
                  <div style={{ fontSize: '13px' }}>{supplier.contactName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{supplier.phone}</div>
                </td>
                <td>{renderStars(supplier.rating)}</td>
                <td className="mono" style={{ fontWeight: '600' }}>{formatCurrency(supplier.totalSpend)}</td>
                <td className="mono">{supplier.totalOrders}</td>
                <td>
                  <span className={`badge ${supplier.onTimeDeliveryRate >= 90 ? 'badge-success' : supplier.onTimeDeliveryRate >= 75 ? 'badge-warning' : 'badge-danger'}`}>
                    {supplier.onTimeDeliveryRate.toFixed(1)}%
                  </span>
                </td>
                <td className="mono">{supplier.averageLeadTime} days</td>
                <td>
                  <span className={`badge ${supplier.status === 'active' ? 'badge-available' : 'badge-cancelled'}`}>
                    {supplier.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn" onClick={() => viewSupplierDetail(supplier)}>View</button>
                  <button className="action-btn edit" onClick={() => openEditModal(supplier)}>Edit</button>
                  <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => deleteSupplier(supplier.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSuppliers.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-text">No suppliers found</div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={() => setShowModal(false)}>
        <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Company name" />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Person</label>
                <input className="form-input" value={formData.contactName} onChange={e => setFormData({ ...formData, contactName: e.target.value })} placeholder="Contact name" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@supplier.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(555) 123-4567" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Tax ID</label>
                <input className="form-input" value={formData.taxId} onChange={e => setFormData({ ...formData, taxId: e.target.value })} placeholder="Tax identification number" />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Terms</label>
                <input className="form-input" value={formData.paymentTerms} onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })} placeholder="Net 30" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Full address" />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={2} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes about this supplier..." />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        fontSize: '24px', 
                        cursor: 'pointer',
                        color: star <= formData.rating ? '#fbbf24' : '#d1d5db'
                      }}
                      onClick={() => setFormData({ ...formData, rating: star })}
                    >
                      ★
                    </button>
                  ))}
                </div>
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
              <label className="form-label">Categories</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {allCategories.filter(c => c !== 'All').map(category => (
                  <button
                    key={category}
                    type="button"
                    className={`btn ${formData.categories.includes(category) ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '4px 12px', fontSize: '12px' }}
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveSupplier}>{editingSupplier ? 'Save Changes' : 'Add Supplier'}</button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <div className={`modal-overlay ${showDetailModal ? 'active' : ''}`} onClick={() => setShowDetailModal(false)}>
        <div className="modal" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Supplier Profile</h2>
            <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
          </div>
          <div className="modal-body">
            {selectedSupplier && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', padding: '20px', background: 'var(--bg-elevated)', borderRadius: '12px' }}>
                  <div style={{ width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '600', color: 'white' }}>
                    {selectedSupplier.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '24px', fontWeight: '700' }}>{selectedSupplier.name}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                      {renderStars(selectedSupplier.rating)}
                      <span className={`badge ${selectedSupplier.status === 'active' ? 'badge-available' : 'badge-cancelled'}`}>
                        {selectedSupplier.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--success)' }}>{formatCurrency(selectedSupplier.totalSpend)}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total Spend</div>
                  </div>
                </div>

                <div className="stat-grid" style={{ marginBottom: '24px' }}>
                  <div className="stat-card">
                    <div className="stat-value">{selectedSupplier.totalOrders}</div>
                    <div className="stat-label">Total Orders</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{selectedSupplier.onTimeDeliveryRate.toFixed(1)}%</div>
                    <div className="stat-label">On-Time Delivery</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{selectedSupplier.averageLeadTime} days</div>
                    <div className="stat-label">Avg Lead Time</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{selectedSupplier.lastOrderDate}</div>
                    <div className="stat-label">Last Order</div>
                  </div>
                </div>

                <div className="grid-2" style={{ marginBottom: '24px' }}>
                  <div className="data-card">
                    <div className="data-card-header">
                      <h3 className="data-card-title">Contact Information</h3>
                    </div>
                    <div style={{ padding: '16px', display: 'grid', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Contact Person</div>
                        <div>{selectedSupplier.contactName}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email</div>
                        <div>{selectedSupplier.email || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phone</div>
                        <div>{selectedSupplier.phone}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Address</div>
                        <div>{selectedSupplier.address || '-'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="data-card">
                    <div className="data-card-header">
                      <h3 className="data-card-title">Business Details</h3>
                    </div>
                    <div style={{ padding: '16px', display: 'grid', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tax ID</div>
                        <div>{selectedSupplier.taxId || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Payment Terms</div>
                        <div>{selectedSupplier.paymentTerms || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Categories</div>
                        <div>{selectedSupplier.categories.join(', ')}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedSupplier.notes && (
                  <div className="data-card" style={{ marginBottom: '24px' }}>
                    <div className="data-card-header">
                      <h3 className="data-card-title">Notes</h3>
                    </div>
                    <div style={{ padding: '16px' }}>
                      {selectedSupplier.notes}
                    </div>
                  </div>
                )}

                {selectedSupplier.purchaseOrders.length > 0 && (
                  <div className="data-card">
                    <div className="data-card-header">
                      <h3 className="data-card-title">Recent Purchase Orders</h3>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>PO #</th>
                            <th>Order Date</th>
                            <th>Delivery Date</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSupplier.purchaseOrders.map(po => (
                            <tr key={po.id}>
                              <td className="mono">{po.id}</td>
                              <td className="mono">{po.orderDate}</td>
                              <td className="mono">{po.deliveryDate}</td>
                              <td className="mono">{formatCurrency(po.total)}</td>
                              <td>
                                <span className={`badge ${
                                  po.status === 'received' ? 'badge-success' : 
                                  po.status === 'pending' ? 'badge-pending' : 
                                  po.status === 'delayed' ? 'badge-warning' : 
                                  'badge-cancelled'
                                }`}>
                                  {po.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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