'use client';

import { useState } from 'react';
import { categories as initialCategories, menuItems } from '@/lib/mockData';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const getCategoryStats = (category: string) => {
    const items = menuItems.filter(item => item.category === category);
    const totalItems = items.length;
    const availableItems = items.filter(item => item.available).length;
    const avgPrice = items.length > 0 
      ? items.reduce((sum, item) => sum + item.price, 0) / items.length 
      : 0;
    return { totalItems, availableItems, avgPrice };
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setShowModal(true);
  };

  const openEditModal = (category: string) => {
    setEditingCategory(category);
    setNewCategoryName(category);
    setShowModal(true);
  };

  const saveCategory = () => {
    if (!newCategoryName.trim()) return;

    if (editingCategory) {
      setCategories(categories.map(c => c === editingCategory ? newCategoryName : c));
    } else {
      setCategories([...categories, newCategoryName]);
    }
    setShowModal(false);
  };

  const deleteCategory = (category: string) => {
    const itemCount = menuItems.filter(item => item.category === category).length;
    if (itemCount > 0) {
      alert(`Cannot delete "${category}" - it has ${itemCount} menu items. Please reassign or delete those items first.`);
      return;
    }
    if (confirm(`Are you sure you want to delete "${category}"?`)) {
      setCategories(categories.filter(c => c !== category));
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    const statsA = getCategoryStats(a);
    const statsB = getCategoryStats(b);
    return statsB.totalItems - statsA.totalItems;
  });

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Categories</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span className="badge badge-available">{categories.length} Categories</span>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Category
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <input 
          className="form-input" 
          style={{ width: '300px' }}
          placeholder="Search categories..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid-3">
        {sortedCategories.map(category => {
          const stats = getCategoryStats(category);
          return (
            <div key={category} className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">{category}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="action-btn edit" onClick={() => openEditModal(category)}>Edit</button>
                  <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => deleteCategory(category)}>Delete</button>
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <div className="stat-grid" style={{ marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="stat-value" style={{ fontSize: '28px' }}>{stats.totalItems}</div>
                    <div className="stat-label">Total Items</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="stat-value" style={{ fontSize: '28px', color: 'var(--success)' }}>{stats.availableItems}</div>
                    <div className="stat-label">Available</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="stat-value" style={{ fontSize: '28px' }}>${stats.avgPrice.toFixed(2)}</div>
                    <div className="stat-label">Avg Price</div>
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Availability</span>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>
                      {stats.totalItems > 0 ? ((stats.availableItems / stats.totalItems) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${stats.totalItems > 0 ? (stats.availableItems / stats.totalItems) * 100 : 0}%`, 
                        height: '100%', 
                        background: stats.availableItems === stats.totalItems ? 'var(--success)' : 'var(--warning)', 
                        borderRadius: '4px' 
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedCategories.length === 0 && (
        <div className="data-card">
          <div className="empty-state">
            <div className="empty-state-text">No categories found</div>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={openAddModal}>
              + Add First Category
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={() => setShowModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input 
                className="form-input" 
                value={newCategoryName} 
                onChange={e => setNewCategoryName(e.target.value)} 
                placeholder="e.g., Appetizers, Main Courses, Desserts"
              />
            </div>
            {editingCategory && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  This category currently has:
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                  {menuItems.filter(item => item.category === editingCategory).length} menu items
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveCategory}>
              {editingCategory ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}