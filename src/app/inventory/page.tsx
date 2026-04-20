'use client';

import { useState } from 'react';
import { inventoryItems as initialInventory } from '@/lib/mockData';
import { InventoryItem } from '@/types';

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(initialInventory);
  const [filter, setFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Ingredients',
    quantity: '',
    unit: 'pieces',
    reorderLevel: '',
    costPerUnit: ''
  });

  const filteredItems = filter === 'all' ? items : items.filter(i => i.category === filter);

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return 'out-of-stock';
    if (item.quantity <= item.reorderLevel) return 'low-stock';
    return 'ok';
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ name: '', category: 'Ingredients', quantity: '', unit: 'pieces', reorderLevel: '', costPerUnit: '' });
    setShowModal(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      reorderLevel: item.reorderLevel.toString(),
      costPerUnit: item.costPerUnit.toString()
    });
    setShowModal(true);
  };

  const saveItem = () => {
    if (!formData.name || !formData.quantity) return;
    
    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? {
        ...i,
        name: formData.name,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        reorderLevel: parseFloat(formData.reorderLevel) || 0,
        costPerUnit: parseFloat(formData.costPerUnit) || 0
      } : i));
    } else {
      const newItem: InventoryItem = {
        id: String(items.length + 1),
        name: formData.name,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        reorderLevel: parseFloat(formData.reorderLevel) || 0,
        costPerUnit: parseFloat(formData.costPerUnit) || 0
      };
      setItems([...items, newItem]);
    }
    setShowModal(false);
  };

  const lowStockCount = items.filter(i => i.quantity <= i.reorderLevel).length;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Inventory</h1>
        {lowStockCount > 0 && (
          <span className="badge badge-pending" style={{ fontSize: '14px' }}>
            {lowStockCount} items low on stock
          </span>
        )}
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add Item
        </button>
      </div>

      <div className="filter-bar">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`filter-btn ${filter === 'Ingredients' ? 'active' : ''}`} onClick={() => setFilter('Ingredients')}>Ingredients</button>
        <button className={`filter-btn ${filter === 'Supplies' ? 'active' : ''}`} onClick={() => setFilter('Supplies')}>Supplies</button>
        <button className={`filter-btn ${filter === 'Beverages' ? 'active' : ''}`} onClick={() => setFilter('Beverages')}>Beverages</button>
      </div>

      <div className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Reorder Level</th>
              <th>Cost/Unit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => {
              const stockStatus = getStockStatus(item);
              return (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td className="mono" style={{ color: stockStatus === 'out-of-stock' ? 'var(--danger)' : stockStatus === 'low-stock' ? 'var(--warning)' : 'inherit' }}>
                    {item.quantity}
                  </td>
                  <td>{item.unit}</td>
                  <td>{item.reorderLevel}</td>
                  <td className="mono">{formatCurrency(item.costPerUnit)}</td>
                  <td>
                    <span className={`badge ${
                      stockStatus === 'out-of-stock' ? 'badge-cancelled' :
                      stockStatus === 'low-stock' ? 'badge-pending' :
                      'badge-available'
                    }`}>
                      {stockStatus === 'out-of-stock' ? 'Out of Stock' : stockStatus === 'low-stock' ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn edit" onClick={() => openEditModal(item)}>Edit</button>
                    <button className="action-btn" style={{ marginLeft: '8px' }} onClick={() => setItems(items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + i.reorderLevel } : i))}>
                      Quick Order
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={() => setShowModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Item Name</label>
              <input className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Item name" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option>Ingredients</option>
                  <option>Supplies</option>
                  <option>Beverages</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select className="form-select" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                  <option>pieces</option>
                  <option>kg</option>
                  <option>liters</option>
                  <option>bottles</option>
                  <option>boxes</option>
                  <option>grams</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Reorder Level</label>
                <input className="form-input" type="number" value={formData.reorderLevel} onChange={e => setFormData({ ...formData, reorderLevel: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Cost per Unit</label>
              <input className="form-input" type="number" step="0.01" value={formData.costPerUnit} onChange={e => setFormData({ ...formData, costPerUnit: e.target.value })} placeholder="0.00" />
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