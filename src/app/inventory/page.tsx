'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { inventoryItems as initialInventory, menuItemRecipes, orders as initialOrders } from '@/lib/mockData';
import { InventoryItem, Order } from '@/types';

// Extended InventoryItem with batch and expiry tracking
interface InventoryItemWithBatch extends InventoryItem {
  expiryDate?: string;
  batchNumber?: string;
  receivedDate?: string;
  lowStockThreshold?: number;
  barcode?: string;
  location?: string;
  fifoLayers?: { quantity: number; cost: number; receivedDate: string; batch: string }[];
}

// New Advanced Feature Interfaces
interface WasteLog {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  cost: number;
  reason: 'expired' | 'spoilage' | 'damage' | 'overproduction' | 'theft' | 'other';
  recordedBy: string;
  recordedAt: string;
  notes?: string;
}

interface SupplierPerformance {
  supplier: string;
  totalOrders: number;
  onTimeDeliveries: number;
  accuratePricingOrders: number;
  averageLeadTime: number;
  totalSpend: number;
}

interface AuditLogEntry {
  id: string;
  itemId: string;
  itemName: string;
  action: string;
  previousValue: any;
  newValue: any;
  userId: string;
  userName: string;
  timestamp: string;
  ipAddress?: string;
}

interface StockTransfer {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  status: 'requested' | 'in_transit' | 'completed' | 'cancelled';
  requestedBy: string;
  requestedAt: string;
  acceptedBy?: string;
  acceptedAt?: string;
  notes?: string;
}

interface Location {
  id: string;
  name: string;
  type: 'warehouse' | 'kitchen' | 'storage' | 'cooler' | 'freezer';
}

interface ForecastItem {
  itemId: string;
  itemName: string;
  currentStock: number;
  dailyUsageRate: number;
  daysUntilExhaustion: number;
  recommendedReorderQuantity: number;
  reorderPoint: number;
  safetyStock: number;
}

interface InventoryCountLog {
  id: string;
  itemId: string;
  itemName: string;
  countedQuantity: number;
  systemQuantity: number;
  variance: number;
  variancePercent: number;
  status: 'pending' | 'approved' | 'rejected';
  countedBy: string;
  countedAt: string;
  notes?: string;
}

interface LowStockAlert {
  id: string;
  itemId: string;
  itemName: string;
  currentQuantity: number;
  threshold: number;
  createdAt: string;
  acknowledged: boolean;
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function daysUntilDate(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);
  return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

interface PurchaseOrder {
  id: string;
  items: { itemId: string; name: string; quantity: number; cost: number }[];
  total: number;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  supplier: string;
  createdAt: string;
  notes: string;
}

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'received' | 'used' | 'adjustment' | 'waste' | 'transfer' | 'order_consumption';
  quantity: number;
  previousQty: number;
  newQty: number;
  date: string;
  notes: string;
  reference?: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItemWithBatch[]>(initialInventory.map(item => ({
    ...item,
    lowStockThreshold: item.reorderLevel,
    receivedDate: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + (7 + Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    batchNumber: `BATCH-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`
  })));
  
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [view, setView] = useState<'list' | 'low-stock' | 'valuation' | 'orders' | 'movements' | 'counts' | 'alerts' | 'forecasting' | 'waste' | 'suppliers' | 'audit' | 'transfers'>('list');
  
  // Advanced Features State
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    { id: 'AUDIT-001', itemId: '1', itemName: 'Arborio Rice', action: 'stock received', previousValue: 10, newValue: 30, userId: '2', userName: 'Sarah Johnson', timestamp: '2026-01-15T08:30:00Z', ipAddress: '192.168.1.101' },
    { id: 'AUDIT-002', itemId: '2', itemName: 'Atlantic Salmon', action: 'stock used', previousValue: 12, newValue: 9, userId: '2', userName: 'Sarah Johnson', timestamp: '2026-01-17T14:45:00Z', ipAddress: '192.168.1.101' },
    { id: 'AUDIT-003', itemId: '4', itemName: 'Parmesan Cheese', action: 'adjustment', previousValue: 5, newValue: 4, userId: '1', userName: 'Marcus Chen', timestamp: '2026-01-20T11:20:00Z', ipAddress: '192.168.1.100' },
    { id: 'AUDIT-004', itemId: '5', itemName: 'Olive Oil', action: 'waste', previousValue: 8, newValue: 6, userId: '2', userName: 'Sarah Johnson', timestamp: '2026-01-22T09:15:00Z', ipAddress: '192.168.1.101' },
    { id: 'AUDIT-005', itemId: '3', itemName: 'Wagyu Beef', action: 'transfer', previousValue: { location: 'Freezer' }, newValue: { location: 'Kitchen Prep' }, userId: '2', userName: 'Sarah Johnson', timestamp: '2026-01-25T16:00:00Z', ipAddress: '192.168.1.101' },
    { id: 'AUDIT-006', itemId: '6', itemName: 'Ramen Noodles', action: 'item created', previousValue: null, newValue: { quantity: 20, unit: 'kg', costPerUnit: 3.50 }, userId: '1', userName: 'Marcus Chen', timestamp: '2026-02-02T10:00:00Z', ipAddress: '192.168.1.100' },
    { id: 'AUDIT-007', itemId: '1', itemName: 'Arborio Rice', action: 'stock used', previousValue: 30, newValue: 25, userId: '3', userName: 'Mike Wilson', timestamp: '2026-02-05T13:30:00Z', ipAddress: '192.168.1.102' },
    { id: 'AUDIT-008', itemId: '12', itemName: 'Lettuce', action: 'waste', previousValue: 5, newValue: 3, userId: '2', userName: 'Sarah Johnson', timestamp: '2026-02-08T08:45:00Z', ipAddress: '192.168.1.101' },
    { id: 'AUDIT-009', itemId: '14', itemName: 'Lemon', action: 'stock received', previousValue: 15, newValue: 45, userId: '0', userName: 'Admin', timestamp: '2026-02-10T07:20:00Z', ipAddress: '127.0.0.1' },
    { id: 'AUDIT-010', itemId: '7', itemName: 'Napkins', action: 'item edited', previousValue: { reorderLevel: 50 }, newValue: { reorderLevel: 100 }, userId: '1', userName: 'Marcus Chen', timestamp: '2026-02-14T15:10:00Z', ipAddress: '192.168.1.100' },
    { id: 'AUDIT-011', itemId: '2', itemName: 'Atlantic Salmon', action: 'count performed', previousValue: { systemQty: 9 }, newValue: { countedQty: 8 }, userId: '1', userName: 'Marcus Chen', timestamp: '2026-02-18T09:00:00Z', ipAddress: '192.168.1.100' },
    { id: 'AUDIT-012', itemId: '11', itemName: 'Black Truffle', action: 'stock received', previousValue: 0.3, newValue: 0.8, userId: '1', userName: 'Marcus Chen', timestamp: '2026-02-21T11:30:00Z', ipAddress: '192.168.1.100' },
    { id: 'AUDIT-013', itemId: '3', itemName: 'Wagyu Beef', action: 'stock used', previousValue: 15, newValue: 12, userId: '2', userName: 'Sarah Johnson', timestamp: '2026-02-25T18:20:00Z', ipAddress: '192.168.1.101' },
    { id: 'AUDIT-014', itemId: '9', itemName: 'House Red Wine', action: 'stock received', previousValue: 24, newValue: 36, userId: '0', userName: 'Admin', timestamp: '2026-03-01T08:00:00Z', ipAddress: '127.0.0.1' },
    { id: 'AUDIT-015', itemId: '13', itemName: 'Tomatoes', action: 'waste', previousValue: 10, newValue: 8, userId: '3', userName: 'Mike Wilson', timestamp: '2026-03-04T14:15:00Z', ipAddress: '192.168.1.102' },
    { id: 'AUDIT-016', itemId: '5', itemName: 'Olive Oil', action: 'stock used', previousValue: 22, newValue: 20, userId: '2', userName: 'Sarah Johnson', timestamp: '2026-03-07T12:45:00Z', ipAddress: '192.168.1.101' },
    { id: 'AUDIT-017', itemId: '10', itemName: 'Sparkling Water', action: 'adjustment', previousValue: 45, newValue: 48, userId: '1', userName: 'Marcus Chen', timestamp: '2026-03-10T16:30:00Z', ipAddress: '192.168.1.100' },
    { id: 'AUDIT-018', itemId: '4', itemName: 'Parmesan Cheese', action: 'stock received', previousValue: 4, newValue: 7, userId: '0', userName: 'Admin', timestamp: '2026-03-12T07:50:00Z', ipAddress: '127.0.0.1' },
    { id: 'AUDIT-019', itemId: '6', itemName: 'Ramen Noodles', action: 'item deleted', previousValue: { id: '6', name: 'Ramen Noodles' }, newValue: null, userId: '1', userName: 'Marcus Chen', timestamp: '2026-03-15T10:20:00Z', ipAddress: '192.168.1.100' },
    { id: 'AUDIT-020', itemId: '8', itemName: 'To-Go Containers', action: 'transfer', previousValue: { location: 'Dry Storage' }, newValue: { location: 'Kitchen Prep' }, userId: '3', userName: 'Mike Wilson', timestamp: '2026-03-18T15:00:00Z', ipAddress: '192.168.1.102' },
    { id: 'AUDIT-021', itemId: '1', itemName: 'Arborio Rice', action: 'count performed', previousValue: { systemQty: 20 }, newValue: { countedQty: 19 }, userId: '1', userName: 'Marcus Chen', timestamp: '2026-03-22T08:30:00Z', ipAddress: '192.168.1.100' },
    { id: 'AUDIT-022', itemId: '14', itemName: 'Lemon', action: 'stock used', previousValue: 45, newValue: 30, userId: '2', userName: 'Sarah Johnson', timestamp: '2026-03-25T17:45:00Z', ipAddress: '192.168.1.101' },
    { id: 'AUDIT-023', itemId: '15', itemName: 'Mint Leaves', action: 'waste', previousValue: 0.6, newValue: 0.5, userId: '2', userName: 'Sarah Johnson', timestamp: '2026-03-28T09:10:00Z', ipAddress: '192.168.1.101' },
    { id: 'AUDIT-024', itemId: '2', itemName: 'Atlantic Salmon', action: 'stock received', previousValue: 8, newValue: 18, userId: '0', userName: 'Admin', timestamp: '2026-04-01T06:45:00Z', ipAddress: '127.0.0.1' },
    { id: 'AUDIT-025', itemId: '3', itemName: 'Wagyu Beef', action: 'item edited', previousValue: { reorderLevel: 3 }, newValue: { reorderLevel: 4 }, userId: '1', userName: 'Marcus Chen', timestamp: '2026-04-04T14:00:00Z', ipAddress: '192.168.1.100' },
    { id: 'AUDIT-026', itemId: '12', itemName: 'Lettuce', action: 'stock received', previousValue: 3, newValue: 8, userId: '3', userName: 'Mike Wilson', timestamp: '2026-04-07T08:20:00Z', ipAddress: '192.168.1.102' },
    { id: 'AUDIT-027', itemId: '7', itemName: 'Napkins', action: 'stock used', previousValue: 500, newValue: 420, userId: '3', userName: 'Mike Wilson', timestamp: '2026-04-10T20:30:00Z', ipAddress: '192.168.1.102' },
    { id: 'AUDIT-028', itemId: '11', itemName: 'Black Truffle', action: 'stock used', previousValue: 0.8, newValue: 0.5, userId: '2', userName: 'Sarah Johnson', timestamp: '2026-04-12T13:15:00Z', ipAddress: '192.168.1.101' },
    { id: 'AUDIT-029', itemId: '13', itemName: 'Tomatoes', action: 'count performed', previousValue: { systemQty: 8 }, newValue: { countedQty: 8 }, userId: '1', userName: 'Marcus Chen', timestamp: '2026-04-14T09:45:00Z', ipAddress: '192.168.1.100' },
    { id: 'AUDIT-030', itemId: '9', itemName: 'House Red Wine', action: 'stock used', previousValue: 36, newValue: 32, userId: '3', userName: 'Mike Wilson', timestamp: '2026-04-16T21:00:00Z', ipAddress: '192.168.1.102' },
    { id: 'AUDIT-031', itemId: '5', itemName: 'Olive Oil', action: 'adjustment', previousValue: 18, newValue: 20, userId: '1', userName: 'Marcus Chen', timestamp: '2026-04-18T11:30:00Z', ipAddress: '192.168.1.100' },
    { id: 'AUDIT-032', itemId: '10', itemName: 'Sparkling Water', action: 'stock received', previousValue: 48, newValue: 60, userId: '0', userName: 'Admin', timestamp: '2026-04-20T07:10:00Z', ipAddress: '127.0.0.1' },
    { id: 'AUDIT-033', itemId: '8', itemName: 'To-Go Containers', action: 'waste', previousValue: 150, newValue: 145, userId: '3', userName: 'Mike Wilson', timestamp: '2026-04-21T15:45:00Z', ipAddress: '192.168.1.102' },
    { id: 'AUDIT-034', itemId: '4', itemName: 'Parmesan Cheese', action: 'transfer', previousValue: { location: 'Walk-in Cooler' }, newValue: { location: 'Kitchen Prep' }, userId: '2', userName: 'Sarah Johnson', timestamp: '2026-04-22T10:00:00Z', ipAddress: '192.168.1.101' },
    { id: 'AUDIT-035', itemId: '6', itemName: 'Ramen Noodles', action: 'item created', previousValue: null, newValue: { quantity: 25, unit: 'kg', costPerUnit: 3.50 }, userId: '1', userName: 'Marcus Chen', timestamp: '2026-04-23T05:15:00Z', ipAddress: '192.168.1.100' },
  ]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance[]>([]);
  const [locations, setLocations] = useState<Location[]>([
    { id: '1', name: 'Main Warehouse', type: 'warehouse' },
    { id: '2', name: 'Kitchen Prep', type: 'kitchen' },
    { id: '3', name: 'Walk-in Cooler', type: 'cooler' },
    { id: '4', name: 'Freezer', type: 'freezer' },
    { id: '5', name: 'Dry Storage', type: 'storage' },
  ]);
  
  // Barcode scanning state
  const [scanMode, setScanMode] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  
  // New modals
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  
  // Waste form state
  const [wasteForm, setWasteForm] = useState({
    itemId: '',
    quantity: '',
    reason: 'spoilage' as WasteLog['reason'],
    notes: '',
    recordedBy: 'System'
  });
  
  // Transfer form state
  const [transferForm, setTransferForm] = useState({
    itemId: '',
    quantity: '',
    fromLocation: '',
    toLocation: '',
    notes: '',
    requestedBy: 'System'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemWithBatch | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItemWithBatch | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'cost' | 'expiry'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Purchase orders state
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    { id: 'PO-001', items: [{ itemId: '1', name: 'Arborio Rice', quantity: 20, cost: 90 }], total: 90, status: 'pending', supplier: 'Fresh Foods Co', createdAt: '2024-04-20', notes: 'Weekly order' },
    { id: 'PO-002', items: [{ itemId: '2', name: 'Atlantic Salmon', quantity: 10, cost: 180 }], total: 180, status: 'received', supplier: 'Ocean Catch', createdAt: '2024-04-18', notes: '' },
  ]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Stock movements state
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([
    { id: 'SM-001', itemId: '1', itemName: 'Arborio Rice', type: 'received', quantity: 20, previousQty: 10, newQty: 30, date: '2024-04-20', notes: 'Weekly delivery', reference: 'PO-001' },
    { id: 'SM-002', itemId: '1', itemName: 'Arborio Rice', type: 'used', quantity: -5, previousQty: 30, newQty: 25, date: '2024-04-19', notes: 'Daily prep' },
    { id: 'SM-003', itemId: '2', itemName: 'Atlantic Salmon', type: 'used', quantity: -3, previousQty: 15, newQty: 12, date: '2024-04-20', notes: 'Lunch service' },
    { id: 'SM-004', itemId: '3', itemName: 'Olive Oil', type: 'waste', quantity: -2, previousQty: 8, newQty: 6, date: '2024-04-18', notes: 'Expired oil' },
    { id: 'SM-005', itemId: '4', itemName: 'Parmesan', type: 'adjustment', quantity: -1, previousQty: 5, newQty: 4, date: '2024-04-17', notes: 'Inventory count correction' },
  ]);
  const [movementFilter, setMovementFilter] = useState('all');
  const [movementItemFilter, setMovementItemFilter] = useState('all');
  const [movementDateFilter, setMovementDateFilter] = useState('');

  // Movement form state
  const [movementForm, setMovementForm] = useState({
    itemId: '',
    type: 'received' as StockMovement['type'],
    quantity: '',
    notes: '',
    reference: ''
  });

  // Restock modal state
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockItems, setRestockItems] = useState<{ itemId: string; name: string; quantity: number; costPerUnit: number }[]>([]);
  const [restockSupplier, setRestockSupplier] = useState('');
  const [restockNotes, setRestockNotes] = useState('');

  // Inventory count state
  const [countLogs, setCountLogs] = useState<InventoryCountLog[]>([]);
  const [countForm, setCountForm] = useState({
    itemId: '',
    countedQuantity: '',
    notes: '',
    countedBy: 'System'
  });

  // Low stock alerts state
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [showAlertsBanner, setShowAlertsBanner] = useState(true);

  const suppliers = ['Fresh Foods Co', 'Ocean Catch', 'Prime Meats', 'Green Valley Farms', 'Beverage Distributors'];

  const [formData, setFormData] = useState({
    name: '',
    category: 'Ingredients',
    quantity: '',
    unit: 'pieces',
    reorderLevel: '',
    costPerUnit: '',
    salePrice: '',
    expiryDate: '',
    batchNumber: '',
    receivedDate: '',
    barcode: '',
    location: ''
  });

  // Automatic recipe-based stock deduction when orders are completed
  const processOrderStockDeduction = useCallback((order: Order) => {
    if (order.status !== 'completed') return;

    order.items.forEach(orderItem => {
      const recipe = menuItemRecipes.find(r => r.menuItemId === orderItem.menuItemId);
      if (!recipe) return;

      recipe.ingredients.forEach(ingredient => {
        const item = items.find(i => i.id === ingredient.inventoryItemId);
        if (!item) return;

        const deductionAmount = ingredient.quantity * orderItem.quantity;
        const previousQty = item.quantity;
        const newQty = Math.max(0, previousQty - deductionAmount);

        // Update inventory item
        setItems(prevItems => prevItems.map(i => 
          i.id === ingredient.inventoryItemId 
            ? { ...i, quantity: newQty }
            : i
        ));

        // Record stock movement
        setStockMovements(prev => [{
          id: `SM-${String(prev.length + 1).padStart(3, '0')}`,
          itemId: item.id,
          itemName: item.name,
          type: 'order_consumption',
          quantity: -deductionAmount,
          previousQty,
          newQty,
          date: new Date().toISOString().split('T')[0],
          notes: `Order ${order.id} - ${orderItem.name} x${orderItem.quantity}`,
          reference: order.id
        }, ...prev]);
      });
    });
  }, [items]);

  // Check for low stock and generate alerts
  useEffect(() => {
    const newAlerts: LowStockAlert[] = [];
    items.forEach(item => {
      const threshold = item.lowStockThreshold || item.reorderLevel;
      if (item.quantity <= threshold && !alerts.some(a => a.itemId === item.id && !a.acknowledged)) {
        newAlerts.push({
          id: `ALERT-${Date.now()}-${item.id}`,
          itemId: item.id,
          itemName: item.name,
          currentQuantity: item.quantity,
          threshold,
          createdAt: new Date().toISOString(),
          acknowledged: false
        });
      }
    });
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev]);
    }
  }, [items]);

  const getStockStatus = useCallback((item: InventoryItemWithBatch) => {
    if (item.quantity === 0) return 'out-of-stock';
    if (item.quantity <= (item.lowStockThreshold || item.reorderLevel)) return 'low-stock';
    return 'ok';
  }, []);

  const getExpiryStatus = useCallback((item: InventoryItemWithBatch) => {
    if (!item.expiryDate) return null;
    const days = daysUntilDate(item.expiryDate);
    if (days < 0) return 'expired';
    if (days <= 3) return 'critical';
    if (days <= 7) return 'warning';
    return 'ok';
  }, []);

  const filteredItems = useMemo(() => 
    items
      .filter(i => {
        const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || i.category === categoryFilter;
        
        if (view === 'low-stock') {
          return matchesSearch && matchesCategory && getStockStatus(i) !== 'ok';
        }
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
        else if (sortBy === 'quantity') comparison = a.quantity - b.quantity;
        else if (sortBy === 'cost') comparison = a.costPerUnit - b.costPerUnit;
        else if (sortBy === 'expiry') {
          if (!a.expiryDate) return 1;
          if (!b.expiryDate) return -1;
          comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      }),
  [items, searchTerm, categoryFilter, view, sortBy, sortOrder, getStockStatus]);

  const lowStockItems = useMemo(() => items.filter(i => getStockStatus(i) !== 'ok'), [items, getStockStatus]);
  const expiringItems = useMemo(() => items.filter(i => {
    const status = getExpiryStatus(i);
    return status === 'critical' || status === 'warning' || status === 'expired';
  }), [items, getExpiryStatus]);
  
  const activeAlerts = useMemo(() => alerts.filter(a => !a.acknowledged), [alerts]);
  const totalValue = useMemo(() => items.reduce((sum, i) => sum + (i.quantity * i.costPerUnit), 0), [items]);
  const categoryValues = useMemo(() => items.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + (i.quantity * i.costPerUnit);
    return acc;
  }, {} as Record<string, number>), [items]);

  const openAddModal = useCallback(() => {
    setEditingItem(null);
    setFormData({ 
      name: '', category: 'Ingredients', quantity: '', unit: 'pieces', reorderLevel: '', 
      costPerUnit: '', salePrice: '', expiryDate: '', batchNumber: '', 
      receivedDate: new Date().toISOString().split('T')[0],
      barcode: '',
      location: ''
    });
    setShowModal(true);
  }, []);

  const openEditModal = useCallback((item: InventoryItemWithBatch) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      reorderLevel: item.reorderLevel.toString(),
      costPerUnit: item.costPerUnit.toString(),
      salePrice: item.salePrice?.toString() || '',
      expiryDate: item.expiryDate || '',
      batchNumber: item.batchNumber || '',
      receivedDate: item.receivedDate || '',
      barcode: item.barcode || '',
      location: item.location || ''
    });
    setShowModal(true);
  }, []);

  const openHistoryModal = useCallback((item: InventoryItemWithBatch) => {
    setSelectedItem(item);
    setShowHistoryModal(true);
  }, []);

  const openCountModal = useCallback((item?: InventoryItemWithBatch) => {
    setCountForm({
      itemId: item?.id || '',
      countedQuantity: '',
      notes: '',
      countedBy: 'System'
    });
    setShowCountModal(true);
  }, []);

  const saveItem = useCallback(() => {
    if (!formData.name || !formData.quantity) return;
    
       if (editingItem) {
      setItems(prevItems => prevItems.map(i => i.id === editingItem.id ? {
        ...i,
        name: formData.name,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        reorderLevel: parseFloat(formData.reorderLevel) || 0,
        lowStockThreshold: parseFloat(formData.reorderLevel) || 0,
        costPerUnit: parseFloat(formData.costPerUnit) || 0,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
        expiryDate: formData.expiryDate || undefined,
        batchNumber: formData.batchNumber || undefined,
        receivedDate: formData.receivedDate || undefined,
        barcode: formData.barcode || undefined,
        location: formData.location || undefined
      } : i));
      addAuditLog(editingItem.id, 'item_updated', editingItem, formData);
    } else {
      setItems(prevItems => {
        const newItem: InventoryItemWithBatch = {
          id: String(prevItems.length + 1),
          name: formData.name,
          category: formData.category,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          reorderLevel: parseFloat(formData.reorderLevel) || 0,
          lowStockThreshold: parseFloat(formData.reorderLevel) || 0,
          costPerUnit: parseFloat(formData.costPerUnit) || 0,
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
          expiryDate: formData.expiryDate || undefined,
          batchNumber: formData.batchNumber || undefined,
          receivedDate: formData.receivedDate || undefined,
          barcode: formData.barcode || generateBarcode(String(prevItems.length + 1)),
          location: formData.location || undefined,
          fifoLayers: []
        };
        addAuditLog(newItem.id, 'item_created', null, newItem);
        return [...prevItems, newItem];
      });
    }
    setShowModal(false);
  }, [formData, editingItem]);

  const adjustQuantity = useCallback((itemId: string, adjustment: number) => {
    setItems(prevItems => prevItems.map(i => i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + adjustment) } : i));
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(prevItems => prevItems.filter(i => i.id !== itemId));
    }
  }, []);

  const toggleSelectItem = useCallback((itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const selectAllItems = useCallback(() => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(i => i.id));
    }
  }, [selectedItems.length, filteredItems]);

  const deleteSelectedItems = useCallback(() => {
    if (confirm(`Delete ${selectedItems.length} selected items?`)) {
      setItems(prevItems => prevItems.filter(i => !selectedItems.includes(i.id)));
      setSelectedItems([]);
    }
  }, [selectedItems]);

  const exportInventory = useCallback(() => {
    const headers = ['Name', 'Category', 'Quantity', 'Unit', 'Reorder Level', 'Cost/Unit', 'Total Value', 'Batch', 'Expiry Date', 'Received Date'];
    const rows = items.map(i => [
      i.name, i.category, i.quantity, i.unit, i.reorderLevel, i.costPerUnit, 
      i.quantity * i.costPerUnit, i.batchNumber || '', i.expiryDate || '', i.receivedDate || ''
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  // Inventory count functions
  const submitInventoryCount = useCallback(() => {
    const item = items.find(i => i.id === countForm.itemId);
    if (!item || !countForm.countedQuantity) return;

    const countedQty = parseFloat(countForm.countedQuantity);
    const systemQty = item.quantity;
    const variance = countedQty - systemQty;
    const variancePercent = systemQty > 0 ? Math.abs((variance / systemQty) * 100) : 0;

    const newLog: InventoryCountLog = {
      id: `COUNT-${String(countLogs.length + 1).padStart(4, '0')}`,
      itemId: item.id,
      itemName: item.name,
      countedQuantity: countedQty,
      systemQuantity: systemQty,
      variance,
      variancePercent,
      status: variance === 0 ? 'approved' : 'pending',
      countedBy: countForm.countedBy,
      countedAt: new Date().toISOString(),
      notes: countForm.notes
    };

    setCountLogs(prev => [newLog, ...prev]);
    setShowCountModal(false);
  }, [items, countForm, countLogs]);

  const approveCountAdjustment = useCallback((logId: string) => {
    const log = countLogs.find(l => l.id === logId);
    if (!log) return;

    setItems(prevItems => prevItems.map(i => 
      i.id === log.itemId ? { ...i, quantity: log.countedQuantity } : i
    ));

    setCountLogs(prev => prev.map(l => 
      l.id === logId ? { ...l, status: 'approved' } : l
    ));

    // Record adjustment movement
    const item = items.find(i => i.id === log.itemId);
    if (item) {
      setStockMovements(prev => [{
        id: `SM-${String(prev.length + 1).padStart(3, '0')}`,
        itemId: item.id,
        itemName: item.name,
        type: 'adjustment',
        quantity: log.variance,
        previousQty: log.systemQuantity,
        newQty: log.countedQuantity,
        date: new Date().toISOString().split('T')[0],
        notes: `Inventory count adjustment - ${log.notes || 'No notes'}`,
        reference: log.id
      }, ...prev]);
    }
  }, [countLogs, items]);

  const rejectCountAdjustment = useCallback((logId: string) => {
    setCountLogs(prev => prev.map(l => 
      l.id === logId ? { ...l, status: 'rejected' } : l
    ));
  }, []);

  // Alert functions
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  }, []);

  // Restock functions
  const openRestockModal = useCallback(() => {
    const lowStock = items.filter(i => i.quantity <= i.reorderLevel).map(item => ({
      itemId: item.id,
      name: item.name,
      quantity: item.reorderLevel - item.quantity + 10,
      costPerUnit: item.costPerUnit
    }));
    setRestockItems(lowStock);
    setRestockSupplier(suppliers[0]);
    setRestockNotes('Auto-generated restock order');
    setShowRestockModal(true);
  }, [items, suppliers]);

  const addRestockItem = useCallback(() => {
    setRestockItems(prev => [...prev, { itemId: '', name: '', quantity: 1, costPerUnit: 0 }]);
  }, []);

  const removeRestockItem = useCallback((index: number) => {
    setRestockItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateRestockItem = useCallback((index: number, field: string, value: string | number) => {
    setRestockItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const submitRestockOrder = useCallback(() => {
    const validItems = restockItems.filter(i => i.itemId && i.quantity > 0);
    if (validItems.length === 0 || !restockSupplier) return;
    
    createPurchaseOrder(
      validItems.map(item => ({
        itemId: item.itemId,
        name: item.name,
        quantity: item.quantity,
        cost: item.quantity * item.costPerUnit
      })),
      restockSupplier,
      restockNotes
    );
    setShowRestockModal(false);
    setView('orders');
  }, [restockItems, restockSupplier, restockNotes]);

  const restockTotal = useMemo(() => restockItems.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0), [restockItems]);
  
  // --- DEMAND FORECASTING & SMART REORDERING ---
  const forecastData = useMemo(() => {
    return items.map(item => {
      const itemMovements = stockMovements.filter(m => 
        m.itemId === item.id && (m.type === 'used' || m.type === 'order_consumption')
      );
      
      const totalConsumed = Math.abs(itemMovements.reduce((sum, m) => sum + m.quantity, 0));
      const days = itemMovements.length > 0 
        ? Math.max(1, Math.ceil((new Date().getTime() - new Date(itemMovements[itemMovements.length - 1].date).getTime()) / (1000 * 60 * 60 * 24)))
        : 7;
      
      const dailyUsageRate = totalConsumed / days;
      const daysUntilExhaustion = dailyUsageRate > 0 ? Math.floor(item.quantity / dailyUsageRate) : 999;
      const safetyStock = dailyUsageRate * 3;
      const reorderPoint = (dailyUsageRate * 7) + safetyStock;
      const recommendedReorderQuantity = Math.max(0, Math.ceil(reorderPoint - item.quantity + (dailyUsageRate * 14)));
      
      return {
        itemId: item.id,
        itemName: item.name,
        currentStock: item.quantity,
        dailyUsageRate: Math.max(dailyUsageRate, 0.01),
        daysUntilExhaustion: Math.max(0, daysUntilExhaustion),
        recommendedReorderQuantity,
        reorderPoint,
        safetyStock
      };
    });
  }, [items, stockMovements]);

  // --- WASTE ANALYTICS ---
  const wasteStats = useMemo(() => {
    const totalWaste = wasteLogs.reduce((sum, w) => sum + w.cost, 0);
    const wasteByReason = wasteLogs.reduce((acc, w) => {
      acc[w.reason] = (acc[w.reason] || 0) + w.cost;
      return acc;
    }, {} as Record<string, number>);
    
    const wastePercentage = totalValue > 0 ? (totalWaste / totalValue) * 100 : 0;
    
    return { totalWaste, wasteByReason, wastePercentage, totalCount: wasteLogs.length };
  }, [wasteLogs, totalValue]);
  
  // --- SUPPLIER PERFORMANCE ---
  const supplierStats = useMemo(() => {
    return suppliers.map(supplier => {
      const supplierOrders = purchaseOrders.filter(o => o.supplier === supplier);
      
      return {
        supplier,
        totalOrders: supplierOrders.length,
        onTimeDeliveries: Math.floor(supplierOrders.length * 0.85), // Mock 85% on-time
        accuratePricingOrders: Math.floor(supplierOrders.length * 0.92), // Mock 92% accuracy
        averageLeadTime: 2.3 + Math.random(), // Mock lead time
        totalSpend: supplierOrders.reduce((sum, o) => sum + o.total, 0)
      };
    });
  }, [suppliers, purchaseOrders]);
  
  // --- FIFO COSTING ---
  const calculateFifoCost = useCallback((itemId: string, quantity: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return 0;
    
    // If no FIFO layers, use average cost
    if (!item.fifoLayers || item.fifoLayers.length === 0) {
      return quantity * item.costPerUnit;
    }
    
    let remainingQty = quantity;
    let totalCost = 0;
    
    for (const layer of [...item.fifoLayers].sort((a, b) => 
      new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime()
    )) {
      if (remainingQty <= 0) break;
      const takeQty = Math.min(remainingQty, layer.quantity);
      totalCost += takeQty * layer.cost;
      remainingQty -= takeQty;
    }
    
    return totalCost + (remainingQty * item.costPerUnit);
  }, [items]);

  // --- AUDIT LOG HELPER ---
  const addAuditLog = useCallback((itemId: string, action: string, previousValue: any, newValue: any) => {
    const item = items.find(i => i.id === itemId);
    setAuditLogs(prev => [{
      id: `AUDIT-${Date.now()}`,
      itemId,
      itemName: item?.name || 'Unknown',
      action,
      previousValue,
      newValue,
      userId: '1',
      userName: 'System User',
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1'
    }, ...prev]);
  }, [items]);

  // Purchase order functions
  const createPurchaseOrder = useCallback((orderItems: { itemId: string; name: string; quantity: number; cost: number }[], supplier: string, notes: string) => {
    setPurchaseOrders(prevOrders => {
      const newOrder: PurchaseOrder = {
        id: `PO-${String(prevOrders.length + 1).padStart(3, '0')}`,
        items: orderItems,
        total: orderItems.reduce((sum, item) => sum + item.cost, 0),
        status: 'pending',
        supplier,
        createdAt: new Date().toISOString().split('T')[0],
        notes
      };
      return [...prevOrders, newOrder];
    });
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: PurchaseOrder['status']) => {
    setPurchaseOrders(prevOrders => prevOrders.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  }, []);

  const receiveOrder = useCallback((orderId: string) => {
    const order = purchaseOrders.find(o => o.id === orderId);
    if (!order) return;
    
    order.items.forEach(orderItem => {
      const item = items.find(i => i.id === orderItem.itemId);
      if (item) {
        adjustQuantity(item.id, orderItem.quantity);
      }
    });
    updateOrderStatus(orderId, 'received');
  }, [purchaseOrders, items, adjustQuantity, updateOrderStatus]);

  const cancelOrder = useCallback((orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      updateOrderStatus(orderId, 'cancelled');
    }
  }, [updateOrderStatus]);

  // --- WASTE FUNCTIONS ---
  const openWasteModal = useCallback((item?: InventoryItemWithBatch) => {
    setWasteForm({
      itemId: item?.id || '',
      quantity: '',
      reason: 'spoilage',
      notes: '',
      recordedBy: 'System'
    });
    setShowWasteModal(true);
  }, []);

  const recordWaste = useCallback(() => {
    const item = items.find(i => i.id === wasteForm.itemId);
    if (!item || !wasteForm.quantity) return;
    
    const qty = parseFloat(wasteForm.quantity);
    const cost = calculateFifoCost(item.id, qty);
    
    const newWaste: WasteLog = {
      id: `WASTE-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      quantity: qty,
      cost,
      reason: wasteForm.reason,
      recordedBy: wasteForm.recordedBy,
      recordedAt: new Date().toISOString(),
      notes: wasteForm.notes
    };
    
    setWasteLogs(prev => [newWaste, ...prev]);
    adjustQuantity(item.id, -qty);
    addAuditLog(item.id, 'waste_recorded', item.quantity, item.quantity - qty);
    
    setShowWasteModal(false);
  }, [items, wasteForm, calculateFifoCost, adjustQuantity, addAuditLog]);

  // --- TRANSFER FUNCTIONS ---
  const openTransferModal = useCallback((item?: InventoryItemWithBatch) => {
    setTransferForm({
      itemId: item?.id || '',
      quantity: '',
      fromLocation: locations[0]?.id || '',
      toLocation: locations[1]?.id || '',
      notes: '',
      requestedBy: 'System'
    });
    setShowTransferModal(true);
  }, [locations]);

  const createTransfer = useCallback(() => {
    const item = items.find(i => i.id === transferForm.itemId);
    if (!item || !transferForm.quantity) return;
    
    const qty = parseFloat(transferForm.quantity);
    
    const newTransfer: StockTransfer = {
      id: `TRANSFER-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      quantity: qty,
      fromLocation: transferForm.fromLocation,
      toLocation: transferForm.toLocation,
      status: 'requested',
      requestedBy: transferForm.requestedBy,
      requestedAt: new Date().toISOString(),
      notes: transferForm.notes
    };
    
    setTransfers(prev => [newTransfer, ...prev]);
    addAuditLog(item.id, 'transfer_requested', null, newTransfer);
    
    setShowTransferModal(false);
  }, [items, transferForm, addAuditLog]);

  const acceptTransfer = useCallback((transferId: string) => {
    setTransfers(prev => prev.map(t => 
      t.id === transferId ? { 
        ...t, 
        status: 'completed', 
        acceptedBy: 'System User',
        acceptedAt: new Date().toISOString()
      } : t
    ));
  }, []);

  // --- BARCODE FUNCTIONS ---
  const handleBarcodeScan = useCallback((barcode: string) => {
    const item = items.find(i => i.barcode === barcode);
    if (item) {
      setSelectedItem(item);
      openEditModal(item);
    }
    setScanMode(false);
  }, [items, openEditModal]);

  const generateBarcode = useCallback((itemId: string) => {
    return `KILO-${itemId.padStart(8, '0')}`;
  }, []);

  const deleteOrder = useCallback((orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      setPurchaseOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
    }
  }, []);

  const getOrdersByStatus = useCallback((status: PurchaseOrder['status']) => {
    return purchaseOrders.filter(o => o.status === status);
  }, [purchaseOrders]);

  const pendingTotal = useMemo(() => getOrdersByStatus('pending').reduce((sum, o) => sum + o.total, 0), [getOrdersByStatus]);
  const orderedTotal = useMemo(() => getOrdersByStatus('ordered').reduce((sum, o) => sum + o.total, 0), [getOrdersByStatus]);

  // Stock movement functions
  const getFilteredMovements = useCallback(() => {
    return stockMovements.filter(m => {
      const matchesType = movementFilter === 'all' || m.type === movementFilter;
      const matchesItem = movementItemFilter === 'all' || m.itemId === movementItemFilter;
      const matchesDate = !movementDateFilter || m.date === movementDateFilter;
      return matchesType && matchesItem && matchesDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [stockMovements, movementFilter, movementItemFilter, movementDateFilter]);

  const openMovementModal = useCallback(() => {
    setMovementForm({ itemId: '', type: 'received', quantity: '', notes: '', reference: '' });
    setShowMovementModal(true);
  }, []);

  const saveMovement = useCallback(() => {
    const item = items.find(i => i.id === movementForm.itemId);
    if (!item || !movementForm.quantity || parseInt(movementForm.quantity) === 0) return;

    const qty = parseInt(movementForm.quantity);
    let qtyChange = qty;

    // For non-received types, treat positive input as reduction
    if (movementForm.type !== 'received') {
      qtyChange = -Math.abs(qty);
    }

    const previousQty = item.quantity;
    const newQty = Math.max(0, previousQty + qtyChange);

    setStockMovements(prevMovements => {
      const newMovement: StockMovement = {
        id: `SM-${String(prevMovements.length + 1).padStart(3, '0')}`,
        itemId: item.id,
        itemName: item.name,
        type: movementForm.type,
        quantity: qtyChange,
        previousQty,
        newQty,
        date: new Date().toISOString().split('T')[0],
        notes: movementForm.notes,
        reference: movementForm.reference || undefined
      };
      return [...prevMovements, newMovement];
    });
    
    adjustQuantity(item.id, qtyChange);
    setShowMovementModal(false);
  }, [items, movementForm, adjustQuantity]);

  const getMovementTypeColor = useCallback((type: StockMovement['type']) => {
    switch (type) {
      case 'received': return 'badge-available';
      case 'used': return 'badge-in_progress';
      case 'adjustment': return 'badge-pending';
      case 'waste': return 'badge-cancelled';
      case 'transfer': return 'badge-warning';
      case 'order_consumption': return 'badge-in_progress';
      default: return '';
    }
  }, []);

  const getExpiryBadge = useCallback((item: InventoryItemWithBatch) => {
    const status = getExpiryStatus(item);
    if (!status || status === 'ok') return null;
    
    const days = item.expiryDate ? daysUntilDate(item.expiryDate) : 0;
    
    if (status === 'expired') {
      return <span className="badge badge-cancelled">Expired</span>;
    }
    if (status === 'critical') {
      return <span className="badge badge-cancelled">{days}d left</span>;
    }
    if (status === 'warning') {
      return <span className="badge badge-pending">{days}d left</span>;
    }
    return null;
  }, [getExpiryStatus]);

  return (
    <>
      {/* Active Alerts Banner */}
      {showAlertsBanner && activeAlerts.length > 0 && (
        <div style={{ 
          background: 'var(--warning-bg)', 
          padding: '12px 16px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>⚠️ {activeAlerts.length} active alerts:</strong> {lowStockItems.length} low stock items, {expiringItems.filter(i => getExpiryStatus(i) === 'expired').length} expired items
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '4px 12px' }}
            onClick={() => { setView('alerts'); setShowAlertsBanner(false); }}
          >
            View Alerts
          </button>
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Inventory</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {lowStockItems.length > 0 && (
            <span className="badge badge-pending" style={{ fontSize: '14px' }}>
              {lowStockItems.length} items low on stock
            </span>
          )}
          {expiringItems.some(i => getExpiryStatus(i) === 'expired') && (
            <span className="badge badge-cancelled" style={{ fontSize: '14px' }}>
              {expiringItems.filter(i => getExpiryStatus(i) === 'expired').length} expired items
            </span>
          )}
           <button className="btn btn-primary" onClick={openAddModal}>
             + Add Item
           </button>
           <button className="btn btn-secondary" onClick={() => openCountModal()}>
             New Count
           </button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>All Items</button>
        <button className={`tab ${view === 'low-stock' ? 'active' : ''}`} onClick={() => setView('low-stock')}>
          Low Stock {lowStockItems.length > 0 && `(${lowStockItems.length})`}
        </button>
        <button className={`tab ${view === 'forecasting' ? 'active' : ''}`} onClick={() => setView('forecasting')}>
          Forecasting
        </button>
        <button className={`tab ${view === 'waste' ? 'active' : ''}`} onClick={() => setView('waste')}>
          Waste {wasteLogs.length > 0 && `(${wasteLogs.length})`}
        </button>
        <button className={`tab ${view === 'suppliers' ? 'active' : ''}`} onClick={() => setView('suppliers')}>
          Suppliers
        </button>
        <button className={`tab ${view === 'transfers' ? 'active' : ''}`} onClick={() => setView('transfers')}>
          Transfers
        </button>
        <button className={`tab ${view === 'audit' ? 'active' : ''}`} onClick={() => setView('audit')}>
          Audit Log
        </button>
        <button className={`tab ${view === 'alerts' ? 'active' : ''}`} onClick={() => setView('alerts')}>
          Alerts {activeAlerts.length > 0 && `(${activeAlerts.length})`}
        </button>
        <button className={`tab ${view === 'counts' ? 'active' : ''}`} onClick={() => setView('counts')}>
          Counts {countLogs.filter(l => l.status === 'pending').length > 0 && `(${countLogs.filter(l => l.status === 'pending').length})`}
        </button>
        <button className={`tab ${view === 'orders' ? 'active' : ''}`} onClick={() => setView('orders')}>
          Orders {purchaseOrders.filter(o => o.status === 'pending' || o.status === 'ordered').length > 0 && `(${purchaseOrders.filter(o => o.status === 'pending' || o.status === 'ordered').length})`}
        </button>
        <button className={`tab ${view === 'valuation' ? 'active' : ''}`} onClick={() => setView('valuation')}>Valuation</button>
        <button className={`tab ${view === 'movements' ? 'active' : ''}`} onClick={() => setView('movements')}>
          Movements {stockMovements.length > 0 && `(${stockMovements.length})`}
        </button>
      </div>

      {view === 'list' && (
        <>
          <div className="filter-bar">
            <input 
              className="form-input" 
              style={{ width: '300px' }}
              placeholder="Search items..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select className="form-select" style={{ width: '150px' }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="Ingredients">Ingredients</option>
              <option value="Supplies">Supplies</option>
              <option value="Beverages">Beverages</option>
            </select>
            <select className="form-select" style={{ width: '150px' }} value={sortBy} onChange={e => setSortBy(e.target.value as 'name' | 'quantity' | 'cost' | 'expiry')}>
              <option value="name">Sort by Name</option>
              <option value="quantity">Sort by Quantity</option>
              <option value="cost">Sort by Cost</option>
              <option value="expiry">Sort by Expiry</option>
            </select>
            <button className="btn btn-secondary" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
            <button className="btn btn-secondary" onClick={exportInventory}>
              Export CSV
            </button>
            {selectedItems.length > 0 && (
              <button className="btn btn-secondary" style={{ color: 'var(--danger)' }} onClick={deleteSelectedItems}>
                Delete Selected ({selectedItems.length})
              </button>
            )}
          </div>

          <div className="data-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input type="checkbox" checked={selectedItems.length === filteredItems.length && filteredItems.length > 0} onChange={selectAllItems} />
                  </th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Batch</th>
                  <th>Expiry</th>
                  <th>Reorder Level</th>
                  <th>Cost/Unit</th>
                  <th>Total Value</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const stockStatus = getStockStatus(item);
                  const expiryStatus = getExpiryStatus(item);
                  return (
                    <tr key={item.id}>
                      <td>
                        <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => toggleSelectItem(item.id)} />
                      </td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td className="mono" style={{ color: stockStatus === 'out-of-stock' ? 'var(--danger)' : stockStatus === 'low-stock' ? 'var(--warning)' : 'inherit' }}>
                        {item.quantity}
                      </td>
                      <td>{item.unit}</td>
                      <td className="mono">{item.batchNumber || '-'}</td>
                      <td>
                        {item.expiryDate && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className="mono">{item.expiryDate}</span>
                            {getExpiryBadge(item)}
                          </div>
                        )}
                      </td>
                      <td>{item.reorderLevel}</td>
                      <td className="mono">{formatCurrency(item.costPerUnit)}</td>
                      <td className="mono">{formatCurrency(item.quantity * item.costPerUnit)}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={`badge ${
                            stockStatus === 'out-of-stock' ? 'badge-cancelled' :
                            stockStatus === 'low-stock' ? 'badge-pending' :
                            'badge-available'
                          }`}>
                            {stockStatus === 'out-of-stock' ? 'Out of Stock' : stockStatus === 'low-stock' ? 'Low Stock' : 'In Stock'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <button className="action-btn edit" onClick={() => openEditModal(item)}>Edit</button>
                        <button className="action-btn" style={{ marginLeft: '8px' }} onClick={() => openCountModal(item)}>
                          Count
                        </button>
                        <button className="action-btn" style={{ marginLeft: '8px' }} onClick={() => openHistoryModal(item)}>
                          History
                        </button>
                        <button className="action-btn" style={{ marginLeft: '8px', color: 'var(--danger)' }} onClick={() => deleteItem(item.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredItems.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-text">No items found</div>
              </div>
            )}
          </div>
        </>
      )}

      {view === 'alerts' && (
        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title">Active Alerts</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Item</th>
                <th>Current Quantity</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(alert => {
                const item = items.find(i => i.id === alert.itemId);
                return (
                  <tr key={alert.id} style={{ opacity: alert.acknowledged ? 0.5 : 1 }}>
                    <td className="mono">{new Date(alert.createdAt).toLocaleDateString()}</td>
                    <td>{alert.itemName}</td>
                    <td className="mono">{alert.currentQuantity} {item?.unit}</td>
                    <td className="mono">{alert.threshold} {item?.unit}</td>
                    <td>
                      <span className={`badge ${alert.acknowledged ? 'badge-available' : 'badge-pending'}`}>
                        {alert.acknowledged ? 'Acknowledged' : 'Active'}
                      </span>
                    </td>
                    <td>
                      {!alert.acknowledged && (
                        <button className="btn btn-secondary" onClick={() => acknowledgeAlert(alert.id)}>
                          Acknowledge
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {alerts.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-text">No alerts</div>
            </div>
          )}
        </div>
      )}

      {view === 'counts' && (
        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title">Inventory Count History</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Item</th>
                <th>System Qty</th>
                <th>Counted Qty</th>
                <th>Variance</th>
                <th>Variance %</th>
                <th>Status</th>
                <th>Counted By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {countLogs.map(log => (
                <tr key={log.id}>
                  <td className="mono">{new Date(log.countedAt).toLocaleDateString()}</td>
                  <td>{log.itemName}</td>
                  <td className="mono">{log.systemQuantity}</td>
                  <td className="mono">{log.countedQuantity}</td>
                  <td className="mono" style={{ color: log.variance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {log.variance >= 0 ? '+' : ''}{log.variance.toFixed(2)}
                  </td>
                  <td className="mono">{log.variancePercent.toFixed(1)}%</td>
                  <td>
                    <span className={`badge ${
                      log.status === 'approved' ? 'badge-available' :
                      log.status === 'rejected' ? 'badge-cancelled' :
                      'badge-pending'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td>{log.countedBy}</td>
                  <td>
                    {log.status === 'pending' && (
                      <>
                        <button className="btn btn-primary" onClick={() => approveCountAdjustment(log.id)}>
                          Approve
                        </button>
                        <button className="btn btn-secondary" style={{ marginLeft: '8px', color: 'var(--danger)' }} onClick={() => rejectCountAdjustment(log.id)}>
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {countLogs.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-text">No inventory counts recorded</div>
            </div>
          )}
        </div>
      )}

      {view === 'orders' && (
        <>
          <div className="stat-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card" style={{ background: 'var(--warning)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{pendingTotal}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--primary)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{orderedTotal}</div>
              <div className="stat-label">Ordered</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--success)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>
                {purchaseOrders.filter(o => o.status === 'received').length}
              </div>
              <div className="stat-label">Received</div>
            </div>
          </div>

          <div className="filter-bar">
            <select className="form-select" style={{ width: '150px' }} value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}>
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="ordered">Ordered</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="btn btn-primary" onClick={openRestockModal}>
              Create Restock Order
            </button>
          </div>

          <div className="data-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders
                  .filter(o => orderStatusFilter === 'all' || o.status === orderStatusFilter)
                  .map(order => (
                    <tr key={order.id}>
                      <td className="mono">{order.id}</td>
                      <td>{order.createdAt}</td>
                      <td>{order.supplier}</td>
                      <td>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '14px' }}>
                            {item.name} x{item.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="mono" style={{ fontWeight: '600' }}>{formatCurrency(order.total)}</td>
                      <td>
                        <span className={`badge ${
                          order.status === 'pending' ? 'badge-pending' :
                          order.status === 'ordered' ? 'badge-in_progress' :
                          order.status === 'received' ? 'badge-available' :
                          'badge-cancelled'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {order.status === 'pending' && (
                          <>
                            <button className="action-btn edit" onClick={() => updateOrderStatus(order.id, 'ordered')}>Order</button>
                            <button className="action-btn" style={{ marginLeft: '8px', color: 'var(--danger)' }} onClick={() => cancelOrder(order.id)}>Cancel</button>
                          </>
                        )}
                        {order.status === 'ordered' && (
                          <>
                            <button className="btn btn-primary" onClick={() => receiveOrder(order.id)}>Receive</button>
                            <button className="action-btn" style={{ marginLeft: '8px', color: 'var(--danger)' }} onClick={() => cancelOrder(order.id)}>Cancel</button>
                          </>
                        )}
                        {order.status === 'received' && (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Completed</span>
                        )}
                        {order.status === 'cancelled' && (
                          <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => deleteOrder(order.id)}>Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'low-stock' && (
        <div className="data-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Current Qty</th>
                <th>Reorder Level</th>
                <th>Needed</th>
                <th>Est. Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map(item => {
                const needed = item.reorderLevel - item.quantity + 5;
                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td className="mono" style={{ color: 'var(--danger)' }}>{item.quantity}</td>
                    <td>{item.reorderLevel}</td>
                    <td>{needed}</td>
                    <td className="mono">{formatCurrency(needed * item.costPerUnit)}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => adjustQuantity(item.id, needed)}>
                        Order Now
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {view === 'valuation' && (
        <div className="grid-2">
          <div className="data-card">
            <div className="data-card-header">
              <h3 className="data-card-title">Total Inventory Value</h3>
            </div>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div className="stat-value" style={{ fontSize: '48px', color: 'var(--primary)' }}>
                {formatCurrency(totalValue)}
              </div>
              <div className="stat-label">Total Value</div>
            </div>
          </div>

          <div className="data-card">
            <div className="data-card-header">
              <h3 className="data-card-title">Value by Category</h3>
            </div>
            <div style={{ padding: '24px' }}>
              {Object.entries(categoryValues).map(([category, value]) => {
                const percentage = (value / totalValue) * 100;
                return (
                  <div key={category} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>{category}</span>
                      <span className="mono">{formatCurrency(value)} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="data-card" style={{ gridColumn: 'span 2' }}>
            <div className="data-card-header">
              <h3 className="data-card-title">Item Valuation Details</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Cost/Unit</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {items.sort((a, b) => (b.quantity * b.costPerUnit) - (a.quantity * a.costPerUnit)).map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td className="mono">{item.quantity} {item.unit}</td>
                    <td className="mono">{formatCurrency(item.costPerUnit)}</td>
                    <td className="mono" style={{ fontWeight: '600' }}>{formatCurrency(item.quantity * item.costPerUnit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

       {view === 'movements' && (
        <>
          <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={openMovementModal}>+ Record Movement</button>
            <select className="form-select" style={{ width: '150px' }} value={movementFilter} onChange={e => setMovementFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="received">Received</option>
              <option value="used">Used</option>
              <option value="adjustment">Adjustment</option>
              <option value="waste">Waste</option>
              <option value="transfer">Transfer</option>
              <option value="order_consumption">Order Consumption</option>
            </select>
            <select className="form-select" style={{ width: '180px' }} value={movementItemFilter} onChange={e => setMovementItemFilter(e.target.value)}>
              <option value="all">All Items</option>
              {items.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
            <input 
              type="date" 
              className="form-input" 
              style={{ width: '160px' }}
              value={movementDateFilter} 
              onChange={e => setMovementDateFilter(e.target.value)}
            />
          </div>

          <div className="data-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Change</th>
                  <th>Previous</th>
                  <th>New</th>
                  <th>Reference</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredMovements().map(movement => (
                  <tr key={movement.id}>
                    <td className="mono">{movement.date}</td>
                    <td>{movement.itemName}</td>
                    <td>
                      <span className={`badge ${getMovementTypeColor(movement.type)}`}>
                        {movement.type === 'order_consumption' ? 'Order Use' : movement.type}
                      </span>
                    </td>
                    <td className="mono" style={{ color: movement.quantity >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {movement.quantity >= 0 ? '+' : ''}{movement.quantity.toFixed(2)}
                    </td>
                    <td className="mono">{movement.previousQty.toFixed(2)}</td>
                    <td className="mono">{movement.newQty.toFixed(2)}</td>
                    <td>{movement.reference || '-'}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {movement.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {getFilteredMovements().length === 0 && (
              <div className="empty-state">
                <div className="empty-state-text">No movements found</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* FORECASTING VIEW */}
      {view === 'forecasting' && (
        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title">Demand Forecasting & Smart Reordering</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Current Stock</th>
                <th>Daily Usage Rate</th>
                <th>Days Until Stockout</th>
                <th>Safety Stock</th>
                <th>Reorder Point</th>
                <th>Recommended Qty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {forecastData.map(f => (
                <tr key={f.itemId}>
                  <td>{f.itemName}</td>
                  <td className="mono">{f.currentStock.toFixed(1)}</td>
                  <td className="mono">{f.dailyUsageRate.toFixed(2)} / day</td>
                  <td className="mono" style={{ color: f.daysUntilExhaustion < 7 ? 'var(--danger)' : f.daysUntilExhaustion < 14 ? 'var(--warning)' : 'var(--success)' }}>
                    {f.daysUntilExhaustion} days
                  </td>
                  <td className="mono">{f.safetyStock.toFixed(1)}</td>
                  <td className="mono">{f.reorderPoint.toFixed(1)}</td>
                  <td className="mono" style={{ fontWeight: 600 }}>{f.recommendedReorderQuantity}</td>
                  <td>
                    <span className={`badge ${f.currentStock <= f.reorderPoint ? 'badge-pending' : 'badge-available'}`}>
                      {f.currentStock <= f.reorderPoint ? 'Order Now' : 'Stock OK'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => adjustQuantity(f.itemId, f.recommendedReorderQuantity)}>
                      Reorder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* WASTE VIEW */}
      {view === 'waste' && (
        <>
          <div className="stat-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card" style={{ background: 'var(--danger)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{formatCurrency(wasteStats.totalWaste)}</div>
              <div className="stat-label">Total Waste Cost</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--warning)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{wasteStats.wastePercentage.toFixed(1)}%</div>
              <div className="stat-label">Waste % of Inventory</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--primary)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{wasteStats.totalCount}</div>
              <div className="stat-label">Waste Events</div>
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <button className="btn btn-primary" onClick={() => openWasteModal()}>+ Record Waste</button>
          </div>

          <div className="data-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Cost</th>
                  <th>Reason</th>
                  <th>Recorded By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {wasteLogs.map(w => (
                  <tr key={w.id}>
                    <td className="mono">{new Date(w.recordedAt).toLocaleDateString()}</td>
                    <td>{w.itemName}</td>
                    <td className="mono">{w.quantity}</td>
                    <td className="mono" style={{ color: 'var(--danger)' }}>{formatCurrency(w.cost)}</td>
                    <td>
                      <span className="badge badge-cancelled">{w.reason}</span>
                    </td>
                    <td>{w.recordedBy}</td>
                    <td>{w.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {wasteLogs.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-text">No waste records found</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* SUPPLIERS VIEW */}
      {view === 'suppliers' && (
        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title">Supplier Performance</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Total Orders</th>
                <th>On-Time Rate</th>
                <th>Pricing Accuracy</th>
                <th>Avg Lead Time</th>
                <th>Total Spend</th>
              </tr>
            </thead>
            <tbody>
              {supplierStats.map(s => (
                <tr key={s.supplier}>
                  <td>{s.supplier}</td>
                  <td className="mono">{s.totalOrders}</td>
                  <td className="mono" style={{ color: s.totalOrders > 0 ? ((s.onTimeDeliveries / s.totalOrders) > 0.9 ? 'var(--success)' : 'var(--warning)') : 'inherit' }}>
                    {s.totalOrders > 0 ? ((s.onTimeDeliveries / s.totalOrders) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="mono" style={{ color: s.totalOrders > 0 ? ((s.accuratePricingOrders / s.totalOrders) > 0.95 ? 'var(--success)' : 'var(--warning)') : 'inherit' }}>
                    {s.totalOrders > 0 ? ((s.accuratePricingOrders / s.totalOrders) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="mono">{s.averageLeadTime.toFixed(1)} days</td>
                  <td className="mono">{formatCurrency(s.totalSpend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TRANSFERS VIEW */}
      {view === 'transfers' && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <button className="btn btn-primary" onClick={() => openTransferModal()}>+ Create Transfer</button>
          </div>

          <div className="data-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map(t => (
                  <tr key={t.id}>
                    <td className="mono">{new Date(t.requestedAt).toLocaleDateString()}</td>
                    <td>{t.itemName}</td>
                    <td className="mono">{t.quantity}</td>
                    <td>{locations.find(l => l.id === t.fromLocation)?.name || t.fromLocation}</td>
                    <td>{locations.find(l => l.id === t.toLocation)?.name || t.toLocation}</td>
                    <td>
                      <span className={`badge ${
                        t.status === 'completed' ? 'badge-available' :
                        t.status === 'in_transit' ? 'badge-in_progress' :
                        t.status === 'requested' ? 'badge-pending' : 'badge-cancelled'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      {t.status === 'requested' && (
                        <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => acceptTransfer(t.id)}>
                          Accept
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transfers.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-text">No stock transfers</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* AUDIT LOG VIEW */}
      {view === 'audit' && (
        <div className="data-card">
          <div className="data-card-header">
            <h3 className="data-card-title">Full Audit Logs</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Item</th>
                <th>Action</th>
                <th>User</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id}>
                  <td className="mono">{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.itemName}</td>
                  <td>
                    <span className="badge badge-in_progress">{log.action}</span>
                  </td>
                  <td>{log.userName}</td>
                  <td className="mono">{log.ipAddress || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {auditLogs.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-text">No audit logs recorded</div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
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
                <input className="form-input" type="number" step="0.01" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Reorder Level</label>
                <input className="form-input" type="number" step="0.01" value={formData.reorderLevel} onChange={e => setFormData({ ...formData, reorderLevel: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Cost per Unit</label>
                <input className="form-input" type="number" step="0.01" value={formData.costPerUnit} onChange={e => setFormData({ ...formData, costPerUnit: e.target.value })} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Sale Price (Optional)</label>
                <input className="form-input" type="number" step="0.01" value={formData.salePrice || ''} onChange={e => setFormData({ ...formData, salePrice: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Batch Number</label>
                <input className="form-input" value={formData.batchNumber} onChange={e => setFormData({ ...formData, batchNumber: e.target.value })} placeholder="Batch number" />
              </div>
              <div className="form-group">
                <label className="form-label">Received Date</label>
                <input className="form-input" type="date" value={formData.receivedDate} onChange={e => setFormData({ ...formData, receivedDate: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input className="form-input" type="date" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveItem}>{editingItem ? 'Save Changes' : 'Add Item'}</button>
          </div>
        </div>
      </div>

      {/* History Modal */}
      <div className={`modal-overlay ${showHistoryModal ? 'active' : ''}`} onClick={() => setShowHistoryModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ backgroundColor: '#121212', border: 'none', width: '90%', maxWidth: '900px' }}>
          <div className="modal-header" style={{ borderBottom: '1px solid #333', paddingBottom: '24px' }}>
            <h2 className="modal-title" style={{ fontSize: '42px', fontWeight: '700' }}>Usage History - {selectedItem?.name}</h2>
            <button className="modal-close" onClick={() => setShowHistoryModal(false)} style={{ width: '50px', height: '50px', fontSize: '28px' }}>×</button>
          </div>
          <div className="modal-body" style={{ padding: '32px' }}>
            <table className="data-table">
              <thead>
                <tr style={{ backgroundColor: '#222' }}>
                  <th style={{ fontSize: '20px', color: '#888', fontWeight: '500', padding: '16px' }}>Date</th>
                  <th style={{ fontSize: '20px', color: '#888', fontWeight: '500', padding: '16px' }}>Action</th>
                  <th style={{ fontSize: '20px', color: '#888', fontWeight: '500', padding: '16px' }}>Quantity</th>
                  <th style={{ fontSize: '20px', color: '#888', fontWeight: '500', padding: '16px' }}>Reference</th>
                  <th style={{ fontSize: '20px', color: '#888', fontWeight: '500', padding: '16px' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {stockMovements
                  .filter(m => selectedItem && m.itemId === selectedItem.id)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((movement, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ fontSize: '28px', padding: '24px 16px' }}>{movement.date}</td>
                    <td style={{ padding: '24px 16px' }}>
                      <span style={{ 
                        padding: '8px 24px', 
                        borderRadius: '24px', 
                        display: 'inline-block',
                        fontWeight: '500',
                        fontSize: '24px',
                        backgroundColor: movement.type === 'received' ? '#166534' : '#1e3a5f',
                        color: movement.type === 'received' ? '#4ade80' : '#93c5fd'
                      }}>
                        {movement.type === 'received' ? 'Restocked' : 
                         movement.type === 'used' ? 'Used' : 
                         movement.type === 'order_consumption' ? 'Order Use' :
                         movement.type}
                      </span>
                    </td>
                    <td style={{ fontSize: '32px', fontWeight: '500', padding: '24px 16px' }} className="mono">{Math.abs(movement.quantity)}</td>
                    <td style={{ fontSize: '24px', padding: '24px 16px' }}>{movement.reference || '-'}</td>
                    <td style={{ fontSize: '24px', padding: '24px 16px' }}>{movement.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer" style={{ borderTop: 'none', justifyContent: 'flex-end', padding: '24px' }}>
            <button className="btn btn-secondary" style={{ padding: '16px 40px', fontSize: '24px' }} onClick={() => setShowHistoryModal(false)}>Close</button>
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      <div className={`modal-overlay ${showRestockModal ? 'active' : ''}`} onClick={() => setShowRestockModal(false)}>
        <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Create Restock Order</h2>
            <button className="modal-close" onClick={() => setShowRestockModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Supplier</label>
              <select className="form-select" value={restockSupplier} onChange={e => setRestockSupplier(e.target.value)}>
                {suppliers.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <input className="form-input" value={restockNotes} onChange={e => setRestockNotes(e.target.value)} placeholder="Order notes" />
            </div>
            
            <div style={{ marginTop: '16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ margin: 0 }}>Items to Order</label>
              <button className="btn btn-secondary" style={{ padding: '4px 12px' }} onClick={addRestockItem}>+ Add Item</button>
            </div>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {restockItems.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <select className="form-select" value={item.itemId} onChange={e => {
                          const selectedItem = items.find(i => i.id === e.target.value);
                          if (selectedItem) {
                            updateRestockItem(index, 'itemId', selectedItem.id);
                            updateRestockItem(index, 'name', selectedItem.name);
                            updateRestockItem(index, 'costPerUnit', selectedItem.costPerUnit);
                          }
                        }}>
                          <option value="">Select item...</option>
                          {items.map(i => (
                            <option key={i.id} value={i.id}>{i.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="form-input" 
                          value={item.quantity} 
                          onChange={e => updateRestockItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                        />
                      </td>
                      <td className="mono">{formatCurrency(item.costPerUnit)}</td>
                      <td className="mono">{formatCurrency(item.quantity * item.costPerUnit)}</td>
                      <td>
                        <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => removeRestockItem(index)}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {restockItems.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No items added. Click \"Add Item\" to add items.
                </div>
              )}
            </div>

            <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '600' }}>Order Total:</span>
              <span className="mono" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(restockTotal)}</span>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowRestockModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitRestockOrder}>Create Order</button>
          </div>
        </div>
      </div>

      {/* Stock Movement Modal */}
      <div className={`modal-overlay ${showMovementModal ? 'active' : ''}`} onClick={() => setShowMovementModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Record Stock Movement</h2>
            <button className="modal-close" onClick={() => setShowMovementModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Item</label>
              <select className="form-select" value={movementForm.itemId} onChange={e => setMovementForm({ ...movementForm, itemId: e.target.value })}>
                <option value="">Select item...</option>
                {items.map(i => (
                  <option key={i.id} value={i.id}>{i.name} (Current: {i.quantity} {i.unit})</option>
                ))}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Movement Type</label>
                <select className="form-select" value={movementForm.type} onChange={e => setMovementForm({ ...movementForm, type: e.target.value as StockMovement['type'] })}>
                  <option value="received">Received</option>
                  <option value="used">Used</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="waste">Waste</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input 
                  className="form-input" 
                  type="number"
                  step="0.01" 
                  value={movementForm.quantity} 
                  onChange={e => setMovementForm({ ...movementForm, quantity: e.target.value })} 
                  placeholder={movementForm.type === 'received' ? 'Amount received' : 'Amount used/wasted'}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Reference (Optional)</label>
              <input className="form-input" value={movementForm.reference} onChange={e => setMovementForm({ ...movementForm, reference: e.target.value })} placeholder="e.g., PO-001, ORD-001" />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={3} value={movementForm.notes} onChange={e => setMovementForm({ ...movementForm, notes: e.target.value })} placeholder="Additional details..." />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowMovementModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveMovement}>Record Movement</button>
          </div>
        </div>
      </div>

      {/* Inventory Count Modal */}
      <div className={`modal-overlay ${showCountModal ? 'active' : ''}`} onClick={() => setShowCountModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Record Inventory Count</h2>
            <button className="modal-close" onClick={() => setShowCountModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Item</label>
              <select className="form-select" value={countForm.itemId} onChange={e => setCountForm({ ...countForm, itemId: e.target.value })}>
                <option value="">Select item...</option>
                {items.map(i => (
                  <option key={i.id} value={i.id}>{i.name} (System: {i.quantity} {i.unit})</option>
                ))}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Counted Quantity</label>
                <input 
                  className="form-input" 
                  type="number"
                  step="0.01" 
                  value={countForm.countedQuantity} 
                  onChange={e => setCountForm({ ...countForm, countedQuantity: e.target.value })} 
                  placeholder="Physical count"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Counted By</label>
                <input 
                  className="form-input" 
                  value={countForm.countedBy} 
                  onChange={e => setCountForm({ ...countForm, countedBy: e.target.value })} 
                  placeholder="Name"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={3} value={countForm.notes} onChange={e => setCountForm({ ...countForm, notes: e.target.value })} placeholder="Count details..." />
            </div>
            {countForm.itemId && countForm.countedQuantity && (
              <div style={{ 
                padding: '12px', 
                borderRadius: '8px', 
                background: 'var(--bg-elevated)',
                marginTop: '16px'
              }}>
                {(() => {
                  const item = items.find(i => i.id === countForm.itemId);
                  if (!item) return null;
                  const counted = parseFloat(countForm.countedQuantity);
                  const variance = counted - item.quantity;
                  const variancePercent = item.quantity > 0 ? Math.abs((variance / item.quantity) * 100) : 0;
                  return (
                    <div>
                      <div>System Quantity: <strong>{item.quantity} {item.unit}</strong></div>
                      <div>Counted Quantity: <strong>{counted} {item.unit}</strong></div>
                      <div>Variance: <strong style={{ color: variance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {variance >= 0 ? '+' : ''}{variance.toFixed(2)} ({variancePercent.toFixed(1)}%)
                      </strong></div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowCountModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitInventoryCount}>Submit Count</button>
          </div>
        </div>
      </div>
    </>
  );
}
