'use client';

import { useState, useMemo, useCallback } from 'react';
import { menuItems as initialMenuItems, categories, inventoryItems, menuItemRecipes } from '@/lib/mockData';
import { MenuItem } from '@/types';

const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Halal', 'Kosher'];
const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'cost', label: 'Cost' },
  { value: 'margin', label: 'Margin' },
  { value: 'prepTime', label: 'Prep Time' }
];

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function calculateItemCost(menuItemId: string): number {
  const recipe = menuItemRecipes.find(r => r.menuItemId === menuItemId);
  if (!recipe) return 0;

  return recipe.ingredients.reduce((cost, ing) => {
    const invItem = inventoryItems.find(i => i.id === ing.inventoryItemId);
    return cost + (invItem ? invItem.costPerUnit * ing.quantity : 0);
  }, 0);
}

function calculateIngredientsCost(ingredients: { inventoryItemId: string; quantity: number }[]): number {
  return ingredients.reduce((cost, ing) => {
    const invItem = inventoryItems.find(i => i.id === ing.inventoryItemId);
    return cost + (invItem ? invItem.costPerUnit * ing.quantity : 0);
  }, 0);
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [dietaryFilter, setDietaryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Main Courses',
    price: '',
    prepTime: '',
    image: '',
    dietary: [] as string[],
    costPerUnit: '',
    profitPerUnit: '',
    ingredients: [] as { inventoryItemId: string; quantity: number }[]
  });

  const filteredItems = useMemo(() => {
    let items = [...menuItems];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'All') {
      items = items.filter(m => m.category === categoryFilter);
    }

    // Dietary filter
    if (dietaryFilter !== 'All') {
      items = items.filter(m => m.dietary?.includes(dietaryFilter));
    }

    // Sorting
    items.sort((a, b) => {
      const costA = a.costPerUnit || calculateItemCost(a.id);
      const costB = b.costPerUnit || calculateItemCost(b.id);
      const profitA = a.profitPerUnit || (a.price - costA);
      const profitB = b.profitPerUnit || (b.price - costB);
      const marginA = a.price > 0 ? (profitA / a.price) * 100 : 0;
      const marginB = b.price > 0 ? (profitB / b.price) * 100 : 0;

      let comparison = 0;
      switch (sortBy) {
        case 'name': comparison = a.name.localeCompare(b.name); break;
        case 'price': comparison = a.price - b.price; break;
        case 'cost': comparison = costA - costB; break;
        case 'margin': comparison = marginA - marginB; break;
        case 'prepTime': comparison = a.prepTime - b.prepTime; break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return items;
  }, [menuItems, searchQuery, categoryFilter, dietaryFilter, sortBy, sortDirection]);

  const openAddModal = useCallback(() => {
    setEditingItem(null);
    setFormData({ 
      name: '', 
      description: '', 
      category: 'Main Courses', 
      price: '', 
      prepTime: '', 
      image: '', 
      dietary: [], 
      costPerUnit: '', 
      profitPerUnit: '',
      ingredients: []
    });
    setShowModal(true);
  }, []);

  const openEditModal = useCallback((item: MenuItem) => {
    const existingRecipe = menuItemRecipes.find(r => r.menuItemId === item.id);
    const itemCost = calculateItemCost(item.id);
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price.toString(),
      prepTime: item.prepTime.toString(),
      image: item.image,
      dietary: item.dietary || [],
      costPerUnit: item.costPerUnit?.toString() || itemCost.toString(),
      profitPerUnit: item.profitPerUnit?.toString() || (item.price - itemCost).toString(),
      ingredients: existingRecipe ? [...existingRecipe.ingredients] : []
    });
    setShowModal(true);
  }, []);

  const duplicateItem = useCallback((item: MenuItem) => {
    const newItem: MenuItem = {
      ...item,
      id: String(menuItems.length + 1),
      name: `${item.name} (Copy)`,
      available: true
    };
    setMenuItems([...menuItems, newItem]);
  }, [menuItems]);

  const deleteItem = useCallback((itemId: string) => {
    setDeletingItemId(itemId);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deletingItemId) {
      setMenuItems(menuItems.filter(m => m.id !== deletingItemId));
    }
    setShowDeleteConfirm(false);
    setDeletingItemId(null);
  }, [menuItems, deletingItemId]);

  const saveItem = useCallback(() => {
    if (!formData.name || !formData.price) return;
    
    const calculatedCost = calculateIngredientsCost(formData.ingredients);
    const costPerUnit = formData.costPerUnit ? parseFloat(formData.costPerUnit) : calculatedCost;
    const profitPerUnit = formData.profitPerUnit ? parseFloat(formData.profitPerUnit) : (parseFloat(formData.price) - costPerUnit);
    
    if (editingItem) {
      setMenuItems(menuItems.map(m => m.id === editingItem.id ? {
        ...m,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        prepTime: parseInt(formData.prepTime) || 15,
        image: formData.image,
        dietary: formData.dietary,
        costPerUnit,
        profitPerUnit
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
        dietary: formData.dietary,
        costPerUnit,
        profitPerUnit
      };
      setMenuItems([...menuItems, newItem]);
    }
    setShowModal(false);
  }, [formData, editingItem, menuItems]);

  const toggleAvailability = useCallback((itemId: string) => {
    setMenuItems(menuItems.map(m => m.id === itemId ? { ...m, available: !m.available } : m));
  }, [menuItems]);

  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const selectAllItems = useCallback(() => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(i => i.id)));
    }
  }, [filteredItems, selectedItems.size]);

  const bulkToggleAvailability = useCallback(() => {
    setMenuItems(menuItems.map(m => 
      selectedItems.has(m.id) ? { ...m, available: !m.available } : m
    ));
    setSelectedItems(new Set());
  }, [menuItems, selectedItems]);

  const bulkDelete = useCallback(() => {
    setMenuItems(menuItems.filter(m => !selectedItems.has(m.id)));
    setSelectedItems(new Set());
  }, [menuItems, selectedItems]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Menu</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add Item
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input 
          className="form-input" 
          placeholder="Search menu items..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ maxWidth: '400px', marginBottom: '16px' }}
        />
      </div>

      <div className="filter-bar">
        <button className={`filter-btn ${categoryFilter === 'All' ? 'active' : ''}`} onClick={() => setCategoryFilter('All')}>All</button>
        {categories.map(cat => (
          <button key={cat} className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`} onClick={() => setCategoryFilter(cat)}>{cat}</button>
        ))}
        <div style={{ margin: '0 16px', height: '24px', borderLeft: '1px solid var(--border)' }} />
        <button className={`filter-btn ${dietaryFilter === 'All' ? 'active' : ''}`} onClick={() => setDietaryFilter('All')}>All Dietary</button>
        {dietaryOptions.map(diet => (
          <button key={diet} className={`filter-btn ${dietaryFilter === diet ? 'active' : ''}`} onClick={() => setDietaryFilter(diet)}>{diet}</button>
        ))}
        <div style={{ flex: 1 }} />
        <select 
          className="form-select" 
          value={sortBy} 
          onChange={e => setSortBy(e.target.value)}
          style={{ width: 'auto', minWidth: '120px', marginRight: '8px' }}
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button className={`filter-btn ${sortDirection === 'asc' ? 'active' : ''}`} onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}>
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
        <button className={`filter-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>Grid</button>
        <button className={`filter-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>Table</button>
      </div>

      {selectedItems.size > 0 && (
        <div className="filter-bar" style={{ background: 'var(--bg-secondary)', marginTop: '8px', padding: '12px 16px' }}>
          <span style={{ fontWeight: 500 }}>{selectedItems.size} items selected</span>
          <div style={{ flex: 1 }} />
          <button className="btn btn-secondary btn-sm" onClick={bulkToggleAvailability}>Toggle Availability</button>
          <button className="btn btn-danger btn-sm" onClick={bulkDelete} style={{ marginLeft: '8px' }}>Delete Selected</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedItems(new Set())} style={{ marginLeft: '8px' }}>Clear Selection</button>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid-3">
          {filteredItems.map(item => {
            const cost = item.costPerUnit || calculateItemCost(item.id);
            const profit = item.profitPerUnit || (item.price - cost);
            const margin = item.price > 0 ? (profit / item.price) * 100 : 0;
            return (
              <div key={item.id} className="menu-card">
                <div className="menu-card-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🍽️</div>
                <div className="menu-card-content">
                  <div className="menu-card-name">{item.name}</div>
                  <div className="menu-card-category">{item.category}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="menu-card-price">{formatCurrency(item.price)}</div>
                    <span className={`badge ${margin >= 30 ? 'badge-available' : margin >= 15 ? 'badge-pending' : 'badge-cancelled'}`}>
                      {margin.toFixed(0)}% margin
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span>Cost: {formatCurrency(cost)}</span>
                    <span style={{ color: 'var(--success)' }}>Profit: {formatCurrency(profit)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge badge-${item.available ? 'available' : 'cancelled'}`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="menu-card-actions" style={{ gap: '4px', flexWrap: 'wrap' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      style={{ marginRight: '8px' }}
                    />
                    <button className="action-btn edit" onClick={() => openEditModal(item)}>Edit</button>
                    <button className="action-btn" onClick={() => duplicateItem(item)}>Duplicate</button>
                    <button className="action-btn" onClick={() => toggleAvailability(item.id)}>
                      {item.available ? 'Unavailable' : 'Available'}
                    </button>
                    <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => deleteItem(item.id)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="data-card">
          <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                      onChange={selectAllItems}
                    />
                  </th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Cost</th>
                  <th>Profit</th>
                  <th>Margin</th>
                  <th>Prep Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
            <tbody>
              {filteredItems.map(item => {
                const cost = item.costPerUnit || calculateItemCost(item.id);
                const profit = item.profitPerUnit || (item.price - cost);
                const margin = item.price > 0 ? (profit / item.price) * 100 : 0;
                return (
                  <tr key={item.id}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                      />
                    </td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td className="mono">{formatCurrency(item.price)}</td>
                    <td className="mono" style={{ color: 'var(--danger)' }}>{formatCurrency(cost)}</td>
                    <td className="mono" style={{ color: 'var(--success)', fontWeight: '600' }}>{formatCurrency(profit)}</td>
                    <td>
                      <span className={`badge ${margin >= 30 ? 'badge-available' : margin >= 15 ? 'badge-pending' : 'badge-cancelled'}`}>
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                    <td>{item.prepTime} min</td>
                    <td>
                      <span className={`badge badge-${item.available ? 'available' : 'cancelled'}`}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn edit" onClick={() => openEditModal(item)}>Edit</button>
                      <button className="action-btn" onClick={() => duplicateItem(item)}>Duplicate</button>
                      <button className="action-btn" onClick={() => toggleAvailability(item.id)}>
                        {item.available ? 'Unavailable' : 'Available'}
                      </button>
                      <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => deleteItem(item.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
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
                 <label className="form-label">Sale Price</label>
                 <input 
                   className="form-input" 
                   type="number" 
                   step="0.01" 
                   value={formData.price} 
                   onChange={e => {
                     const calculatedCost = calculateIngredientsCost(formData.ingredients);
                     const newPrice = parseFloat(e.target.value) || 0;
                     setFormData({ 
                       ...formData, 
                       price: e.target.value,
                       profitPerUnit: (newPrice - calculatedCost).toString()
                     });
                   }} 
                   placeholder="0.00" 
                 />
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

              <div className="form-group">
                <label className="form-label">Ingredients</label>
                <div className="data-card" style={{ marginBottom: '12px', padding: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '8px', fontWeight: 500, fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span>Item</span>
                    <span>Quantity</span>
                    <span>Cost</span>
                    <span></span>
                  </div>
                  {formData.ingredients.map((ing, idx) => {
                    const invItem = inventoryItems.find(i => i.id === ing.inventoryItemId);
                    const itemCost = invItem ? invItem.costPerUnit * ing.quantity : 0;
                    return (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px' }}>{invItem?.name || 'Unknown'}</span>
                        <input 
                          type="number"
                          step="0.01"
                          className="form-input"
                          value={ing.quantity}
                          onChange={(e) => {
                            const newIngredients = [...formData.ingredients];
                            newIngredients[idx].quantity = parseFloat(e.target.value) || 0;
                            const newCost = calculateIngredientsCost(newIngredients);
                            setFormData({ 
                              ...formData, 
                              ingredients: newIngredients,
                              costPerUnit: newCost.toString(),
                              profitPerUnit: (parseFloat(formData.price) - newCost).toString()
                            });
                          }}
                        />
                        <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>{formatCurrency(itemCost)}</span>
                        <button 
                          className="action-btn" 
                          style={{ color: 'var(--danger)', padding: 0 }}
                          onClick={() => {
                            const newIngredients = formData.ingredients.filter((_, i) => i !== idx);
                            const newCost = calculateIngredientsCost(newIngredients);
                            setFormData({ 
                              ...formData, 
                              ingredients: newIngredients,
                              costPerUnit: newCost.toString(),
                              profitPerUnit: (parseFloat(formData.price) - newCost).toString()
                            });
                          }}
                        >×</button>
                      </div>
                    );
                  })}
                  <div style={{ marginTop: '12px' }}>
                    <select 
                      className="form-select"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          const newIngredients = [...formData.ingredients, { inventoryItemId: e.target.value, quantity: 1 }];
                          const newCost = calculateIngredientsCost(newIngredients);
                          setFormData({ 
                            ...formData, 
                            ingredients: newIngredients,
                            costPerUnit: newCost.toString(),
                            profitPerUnit: (parseFloat(formData.price) - newCost).toString()
                          });
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">Add ingredient...</option>
                      {inventoryItems
                        .filter(item => item.category === 'Ingredients')
                        .filter(item => !formData.ingredients.some(i => i.inventoryItemId === item.id))
                        .map(item => (
                          <option key={item.id} value={item.id}>{item.name} ({formatCurrency(item.costPerUnit)}/{item.unit})</option>
                        ))}
                    </select>
                  </div>
                </div>
                
                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500 }}>Calculated Total Cost:</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 600 }}>
                      {formatCurrency(calculateIngredientsCost(formData.ingredients))}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Cost is automatically calculated from selected ingredients. You may override manually below.
                  </div>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Cost per Unit</label>
                  <input className="form-input" type="number" step="0.01" value={formData.costPerUnit} onChange={e => setFormData({ ...formData, costPerUnit: e.target.value })} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Profit per Unit</label>
                  <input className="form-input" type="number" step="0.01" value={formData.profitPerUnit} onChange={e => setFormData({ ...formData, profitPerUnit: e.target.value })} placeholder="0.00" />
                </div>
              </div>

             <div className="form-group">
               <label className="form-label">Dietary Tags</label>
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                 {dietaryOptions.map(diet => (
                   <label key={diet} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                     <input 
                       type="checkbox"
                       checked={formData.dietary.includes(diet)}
                       onChange={e => {
                         if (e.target.checked) {
                           setFormData({ ...formData, dietary: [...formData.dietary, diet] });
                         } else {
                           setFormData({ ...formData, dietary: formData.dietary.filter(d => d !== diet) });
                         }
                       }}
                     />
                     {diet}
                   </label>
                 ))}
               </div>
             </div>
           </div>
           <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveItem}>{editingItem ? 'Save Changes' : 'Add Item'}</button>
          </div>
        </div>
       </div>

       <div className={`modal-overlay ${showDeleteConfirm ? 'active' : ''}`} onClick={() => setShowDeleteConfirm(false)}>
         <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
           <div className="modal-header">
             <h2 className="modal-title">Confirm Delete</h2>
             <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
           </div>
           <div className="modal-body">
             <p>Are you sure you want to delete this menu item? This action cannot be undone.</p>
           </div>
           <div className="modal-footer">
             <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
             <button className="btn btn-danger" onClick={confirmDelete}>Delete Item</button>
           </div>
         </div>
       </div>
     </>
   );
 }