'use client';

import { useState } from 'react';
import { menuItems as initialMenuItems, categories } from '@/lib/mockData';
import { MenuItem } from '@/types';

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [filter, setFilter] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Main Courses',
    price: '',
    prepTime: '',
    image: '',
    dietary: [] as string[]
  });

  const filteredItems = filter === 'All' ? menuItems : menuItems.filter(m => m.category === filter);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '', category: 'Main Courses', price: '', prepTime: '', image: '', dietary: [] });
    setShowModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price.toString(),
      prepTime: item.prepTime.toString(),
      image: item.image,
      dietary: item.dietary
    });
    setShowModal(true);
  };

  const saveItem = () => {
    if (!formData.name || !formData.price) return;
    
    if (editingItem) {
      setMenuItems(menuItems.map(m => m.id === editingItem.id ? {
        ...m,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        prepTime: parseInt(formData.prepTime) || 15,
        image: formData.image
      } : m));
    } else {
      const newItem: MenuItem = {
        id: String(menuItems.length + 1),
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        prepTime: parseInt(formData.prepTime) || 15,
        available: true,
        image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
        dietary: formData.dietary
      };
      setMenuItems([...menuItems, newItem]);
    }
    setShowModal(false);
  };

  const toggleAvailability = (itemId: string) => {
    setMenuItems(menuItems.map(m => m.id === itemId ? { ...m, available: !m.available } : m));
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Menu</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add Item
        </button>
      </div>

      <div className="filter-bar">
        <button className={`filter-btn ${filter === 'All' ? 'active' : ''}`} onClick={() => setFilter('All')}>All</button>
        {categories.map(cat => (
          <button key={cat} className={`filter-btn ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>{cat}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button className={`filter-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>Grid</button>
        <button className={`filter-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>Table</button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid-3">
          {filteredItems.map(item => (
            <div key={item.id} className="menu-card">
              <div className="menu-card-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🍽️</div>
              <div className="menu-card-content">
                <div className="menu-card-name">{item.name}</div>
                <div className="menu-card-category">{item.category}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="menu-card-price">{formatCurrency(item.price)}</div>
                  <span className={`badge badge-${item.available ? 'available' : 'cancelled'}`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="menu-card-actions">
                  <button className="action-btn edit" onClick={() => openEditModal(item)}>Edit</button>
                  <button className="action-btn" onClick={() => toggleAvailability(item.id)}>
                    {item.available ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="data-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Prep Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td className="mono">{formatCurrency(item.price)}</td>
                  <td>{item.prepTime} min</td>
                  <td>
                    <span className={`badge badge-${item.available ? 'available' : 'cancelled'}`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn edit" onClick={() => openEditModal(item)}>Edit</button>
                    <button className="action-btn" style={{ marginLeft: '8px' }} onClick={() => toggleAvailability(item.id)}>
                      {item.available ? 'Unavailable' : 'Available'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={() => setShowModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Item name" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Description" rows={3} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price</label>
                <input className="form-input" type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Prep Time (min)</label>
                <input className="form-input" type="number" value={formData.prepTime} onChange={e => setFormData({ ...formData, prepTime: e.target.value })} placeholder="15" />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input className="form-input" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveItem}>{editingItem ? 'Save Changes' : 'Add Item'}</button>
          </div>
        </div>
      </div>
    </>
  );
}