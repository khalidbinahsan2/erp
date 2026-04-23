'use client';

import { useState, useMemo, useCallback } from 'react';
import { inventoryItems as initialInventory } from '@/lib/mockData';
import { InventoryItem } from '@/types';

type StockMovementType = 'received' | 'used' | 'adjustment' | 'waste' | 'transfer';
type POStatus = 'draft' | 'pending' | 'sent' | 'partial' | 'received' | 'cancelled';
type TabView = 'overview' | 'items' | 'movements' | 'purchaseOrders' | 'forecasting' | 'waste' | 'suppliers' | 'counts' | 'transfers' | 'audit';

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: StockMovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  userId: string;
  userName: string;
  createdAt: Date;
  location?: string;
}

interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitCost: number;
}

interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  status: POStatus;
  items: PurchaseOrderItem[];
  orderedAt: Date;
  expectedAt?: Date;
  receivedAt?: Date;
  subtotal: number;
  shippingCost: number;
  taxPercent: number;
  discountPercent: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  notes?: string;
}

interface WasteRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  reason: string;
  category: 'spoiled' | 'expired' | 'damaged' | 'over-prep' | 'other';
  createdAt: Date;
  userId: string;
  cost: number;
}

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address?: string;
  leadTimeDays: number;
  paymentTerms: string;
  active: boolean;
}

interface InventoryCount {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'reconciled';
  scheduledAt: Date;
  completedAt?: Date;
  items: { itemId: string; expected: number; counted: number; variance: number }[];
  userId: string;
  notes?: string;
}

interface StockTransfer {
  id: string;
  fromLocation: string;
  toLocation: string;
  items: { itemId: string; itemName: string; quantity: number }[];
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
  requestedBy: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  previousValue?: string;
  newValue?: string;
  userId: string;
  userName: string;
  createdAt: Date;
  ipAddress?: string;
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString();
}

// Mock data
const mockMovements: StockMovement[] = [
  { id: 'm1', itemId: 'inv1', itemName: 'Chicken Breast', type: 'received', quantity: 50, previousQuantity: 20, newQuantity: 70, userId: 'u1', userName: 'John Manager', createdAt: new Date(Date.now() - 3600000) },
  { id: 'm2', itemId: 'inv2', itemName: 'Fresh Lettuce', type: 'used', quantity: 12, previousQuantity: 45, newQuantity: 33, userId: 'u2', userName: 'Sarah Chef', createdAt: new Date(Date.now() - 7200000) },
  { id: 'm3', itemId: 'inv3', itemName: 'Tomatoes', type: 'waste', quantity: 5, previousQuantity: 30, newQuantity: 25, reason: 'Spoiled', userId: 'u2', userName: 'Sarah Chef', createdAt: new Date(Date.now() - 10800000) },
  { id: 'm4', itemId: 'inv4', itemName: 'Olive Oil', type: 'adjustment', quantity: 2, previousQuantity: 8, newQuantity: 10, reason: 'Count correction', userId: 'u1', userName: 'John Manager', createdAt: new Date(Date.now() - 86400000) },
];

const mockPurchaseOrders: PurchaseOrder[] = [
  { id: 'po1', supplierId: 's1', supplierName: 'Fresh Foods Co', status: 'received', items: [
    { itemId: 'inv1', itemName: 'Chicken Breast', orderedQuantity: 100, receivedQuantity: 100, unitCost: 2.5 },
    { itemId: 'inv2', itemName: 'Fresh Lettuce', orderedQuantity: 50, receivedQuantity: 50, unitCost: 1.2 }
  ], orderedAt: new Date(Date.now() - 172800000), receivedAt: new Date(Date.now() - 86400000), subtotal: 310, shippingCost: 0, taxPercent: 0, discountPercent: 0, taxAmount: 0, discountAmount: 0, total: 310 },
  { id: 'po2', supplierId: 's2', supplierName: 'Prime Meats Ltd', status: 'partial', items: [
    { itemId: 'inv5', itemName: 'Ground Beef', orderedQuantity: 80, receivedQuantity: 40, unitCost: 3.2 }
  ], orderedAt: new Date(Date.now() - 86400000), expectedAt: new Date(Date.now() + 86400000), subtotal: 256, shippingCost: 0, taxPercent: 0, discountPercent: 0, taxAmount: 0, discountAmount: 0, total: 256 },
  { id: 'po3', supplierId: 's1', supplierName: 'Fresh Foods Co', status: 'sent', items: [
    { itemId: 'inv3', itemName: 'Tomatoes', orderedQuantity: 60, receivedQuantity: 0, unitCost: 0.9 }
  ], orderedAt: new Date(Date.now()), expectedAt: new Date(Date.now() + 172800000), subtotal: 54, shippingCost: 0, taxPercent: 0, discountPercent: 0, taxAmount: 0, discountAmount: 0, total: 54 },
];

const mockWasteRecords: WasteRecord[] = [
  { id: 'w1', itemId: 'inv3', itemName: 'Tomatoes', quantity: 5, reason: 'Left out overnight', category: 'spoiled', createdAt: new Date(Date.now() - 86400000), userId: 'u2', cost: 4.5 },
  { id: 'w2', itemId: 'inv2', itemName: 'Fresh Lettuce', quantity: 8, reason: 'Expired', category: 'expired', createdAt: new Date(Date.now() - 172800000), userId: 'u3', cost: 9.6 },
  { id: 'w3', itemId: 'inv6', itemName: 'Cheese Slices', quantity: 12, reason: 'Overprepared for service', category: 'over-prep', createdAt: new Date(Date.now() - 259200000), userId: 'u2', cost: 18.0 },
];

const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'Fresh Foods Co', contactName: 'Mike Johnson', email: 'orders@freshfoods.com', phone: '555-0101', leadTimeDays: 2, paymentTerms: 'Net 15', active: true },
  { id: 's2', name: 'Prime Meats Ltd', contactName: 'Lisa Carter', email: 'sales@primemeats.com', phone: '555-0102', leadTimeDays: 3, paymentTerms: 'Net 30', active: true },
  { id: 's3', name: 'Dairy Best', contactName: 'Tom Wilson', email: 'support@dairybest.com', phone: '555-0103', leadTimeDays: 1, paymentTerms: 'Net 7', active: true },
];

const mockCounts: InventoryCount[] = [
  { id: 'c1', status: 'completed', scheduledAt: new Date(Date.now() - 604800000), completedAt: new Date(Date.now() - 604800000), items: [
    { itemId: 'inv1', expected: 45, counted: 43, variance: -2 },
    { itemId: 'inv2', expected: 32, counted: 32, variance: 0 },
    { itemId: 'inv3', expected: 28, counted: 25, variance: -3 },
  ], userId: 'u1', notes: 'Minor variances within acceptable range' },
  { id: 'c2', status: 'pending', scheduledAt: new Date(Date.now() + 86400000), items: [], userId: 'u1' },
];

const mockTransfers: StockTransfer[] = [
  { id: 't1', fromLocation: 'Main Storage', toLocation: 'Bar Station', items: [
    { itemId: 'inv7', itemName: 'Lemons', quantity: 20 },
    { itemId: 'inv8', itemName: 'Limes', quantity: 15 }
  ], status: 'completed', createdAt: new Date(Date.now() - 43200000), completedAt: new Date(Date.now() - 43100000), requestedBy: 'John Manager' },
  { id: 't2', fromLocation: 'Walk-in Freezer', toLocation: 'Prep Kitchen', items: [
    { itemId: 'inv1', itemName: 'Chicken Breast', quantity: 25 }
  ], status: 'in_transit', createdAt: new Date(Date.now()), requestedBy: 'Sarah Chef' },
];

const mockAuditLogs: AuditLogEntry[] = [
  { id: 'a1', action: 'UPDATE', entityType: 'InventoryItem', entityId: 'inv1', previousValue: '{"quantity": 65}', newValue: '{"quantity": 70}', userId: 'u1', userName: 'John Manager', createdAt: new Date(Date.now() - 3600000) },
  { id: 'a2', action: 'CREATE', entityType: 'StockMovement', entityId: 'm1', userId: 'u1', userName: 'John Manager', createdAt: new Date(Date.now() - 3600000) },
  { id: 'a3', action: 'UPDATE', entityType: 'PurchaseOrder', entityId: 'po1', previousValue: '{"status": "sent"}', newValue: '{"status": "received"}', userId: 'u1', userName: 'John Manager', createdAt: new Date(Date.now() - 86400000) },
  { id: 'a4', action: 'CREATE', entityType: 'WasteRecord', entityId: 'w1', userId: 'u2', userName: 'Sarah Chef', createdAt: new Date(Date.now() - 86400000) },
];

interface NewInventoryItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  reorderLevel: number;
  minStock: number;
  maxStock: number;
  storageLocation: string;
  supplier: string;
  barcode: string;
  expiryDate: string;
  batchNumber: string;
}

const initialFormState: NewInventoryItem = {
  name: '',
  category: 'Ingredients',
  quantity: 0,
  unit: 'each',
  costPerUnit: 0,
  reorderLevel: 5,
  minStock: 2,
  maxStock: 100,
  storageLocation: '',
  supplier: '',
  barcode: '',
  expiryDate: '',
  batchNumber: '',
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(initialInventory);
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [movements, setMovements] = useState<StockMovement[]>(mockMovements);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [wasteRecords] = useState<WasteRecord[]>(mockWasteRecords);
  const [suppliers] = useState<Supplier[]>(mockSuppliers);
  const [counts] = useState<InventoryCount[]>(mockCounts);
  const [transfers] = useState<StockTransfer[]>(mockTransfers);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [formData, setFormData] = useState<NewInventoryItem>(initialFormState);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof NewInventoryItem, string>>>({});
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementForm, setMovementForm] = useState({
    itemId: '',
    type: 'received' as StockMovementType,
    quantity: 0,
    notes: '',
    location: '',
  });
  const [movementErrors, setMovementErrors] = useState<Partial<Record<keyof typeof movementForm, string>>>({});
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(mockMovements);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [showCreatePOModal, setShowCreatePOModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showViewPOModal, setShowViewPOModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveItems, setReceiveItems] = useState<Array<{
    itemId: string;
    quantity: number;
    cost: number;
    batchNumber: string;
    expiryDate: string;
  }>>([]);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  
  interface POFormItem {
    itemId: string;
    orderedQuantity: number;
    unitCost: number;
  }
  
  interface POFormData {
    supplierId: string;
    expectedAt: string;
    notes: string;
    items: POFormItem[];
    shippingCost: number;
    taxPercent: number;
    discountPercent: number;
  }
  
  const initialPOForm: POFormData = {
    supplierId: '',
    expectedAt: '',
    notes: '',
    items: [{ itemId: '', orderedQuantity: 0, unitCost: 0 }],
    shippingCost: 0,
    taxPercent: 0,
    discountPercent: 0
  };
  
  const [poForm, setPOForm] = useState<POFormData>(initialPOForm);
  const [poFormErrors, setPOFormErrors] = useState<Partial<Record<keyof POFormData | 'items', string>>>({});

  const poCalculations = useMemo(() => {
    const subtotal = poForm.items.reduce((sum, item) => {
      return sum + (item.orderedQuantity * item.unitCost);
    }, 0);
    
    const discountAmount = subtotal * (poForm.discountPercent / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (poForm.taxPercent / 100);
    const total = afterDiscount + taxAmount + poForm.shippingCost;
    
    return {
      subtotal,
      discountAmount,
      taxAmount,
      total: Math.max(0, total)
    };
  }, [poForm.items, poForm.shippingCost, poForm.taxPercent, poForm.discountPercent]);

  const poTotal = poCalculations.total;

  const validatePOForm = (): boolean => {
    const errors: Partial<Record<keyof POFormData | 'items', string>> = {};
    
    if (!poForm.supplierId) errors.supplierId = 'Please select a supplier';
    
    const validItems = poForm.items.filter(i => i.itemId && i.orderedQuantity > 0 && i.unitCost >= 0);
    if (validItems.length === 0) {
      errors.items = 'At least one valid item is required';
    }
    
    for (let idx = 0; idx < poForm.items.length; idx++) {
      const item = poForm.items[idx];
      if (item.itemId && item.orderedQuantity <= 0) {
        errors.items = `Item ${idx + 1}: Quantity must be greater than 0`;
        break;
      }
    }

    setPOFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePOInputChange = (field: keyof POFormData, value: string | number | POFormItem[]) => {
    setPOForm(prev => ({ ...prev, [field]: value }));
    if (poFormErrors[field]) {
      setPOFormErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePOItemChange = (index: number, field: keyof POFormItem, value: string | number) => {
    const newItems = [...poForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    handlePOInputChange('items', newItems);
  };

  const addPOItem = () => {
    handlePOInputChange('items', [...poForm.items, { itemId: '', orderedQuantity: 0, unitCost: 0 }]);
  };

  const removePOItem = (index: number) => {
    if (poForm.items.length > 1) {
      const newItems = poForm.items.filter((_, i) => i !== index);
      handlePOInputChange('items', newItems);
    }
  };

  const handleSavePO = useCallback(() => {
    if (!validatePOForm()) return;

    const selectedSupplier = suppliers.find(s => s.id === poForm.supplierId)!;
    
    const poItems: PurchaseOrderItem[] = poForm.items
      .filter(i => i.itemId && i.orderedQuantity > 0)
      .map(item => ({
        itemId: item.itemId,
        itemName: items.find(i => i.id === item.itemId)?.name || '',
        orderedQuantity: item.orderedQuantity,
        receivedQuantity: 0,
        unitCost: item.unitCost,
      }));

    const newPO: PurchaseOrder = {
      id: `po${Date.now()}`,
      supplierId: poForm.supplierId,
      supplierName: selectedSupplier.name,
      status: 'pending',
      items: poItems,
      orderedAt: new Date(),
      expectedAt: poForm.expectedAt ? new Date(poForm.expectedAt) : undefined,
      subtotal: poCalculations.subtotal,
      shippingCost: poForm.shippingCost,
      taxPercent: poForm.taxPercent,
      discountPercent: poForm.discountPercent,
      taxAmount: poCalculations.taxAmount,
      discountAmount: poCalculations.discountAmount,
      total: poTotal,
      notes: poForm.notes || undefined,
    };

    setPurchaseOrders(prev => [newPO, ...prev]);

    // Add audit log entry
    const newAuditEntry: AuditLogEntry = {
      id: `a${Date.now()}`,
      action: 'CREATE',
      entityType: 'PurchaseOrder',
      entityId: newPO.id,
      newValue: JSON.stringify({
        supplier: newPO.supplierName,
        items: poItems.length,
        total: newPO.total,
        status: newPO.status
      }),
      userId: 'u1',
      userName: 'John Manager',
      createdAt: new Date(),
    };
    setAuditLogs(prev => [newAuditEntry, ...prev]);

    // Reset form and close modal
    setPOForm(initialPOForm);
    setPOFormErrors({});
    setShowCreatePOModal(false);
  }, [poForm, items, suppliers, poTotal, poCalculations, validatePOForm, initialPOForm]);

  const openCreatePOModal = () => {
    setPOForm(initialPOForm);
    setPOFormErrors({});
    setShowCreatePOModal(true);
  };

  const openViewPOModal = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setShowViewPOModal(true);
  };

  const openReceiveModal = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setReceiveItems(po.items.map(item => ({
      itemId: item.itemId,
      quantity: item.orderedQuantity - item.receivedQuantity,
      cost: item.unitCost,
      batchNumber: '',
      expiryDate: '',
    })));
    setDeliveryNotes('');
    setReceivedBy('');
    setShowReceiveModal(true);
  };

  const updateReceiveQuantity = (itemId: string, qty: number) => {
    const orderItem = selectedPO?.items.find(i => i.itemId === itemId);
    const maxQty = orderItem ? orderItem.orderedQuantity - orderItem.receivedQuantity : 0;
    const validQty = Math.max(0, Math.min(qty, maxQty));
    
    setReceiveItems(prev => prev.map(i => 
      i.itemId === itemId ? { ...i, quantity: validQty } : i
    ));
  };

  const updateReceiveCost = (itemId: string, cost: number) => {
    setReceiveItems(prev => prev.map(i => 
      i.itemId === itemId ? { ...i, cost: Math.max(0, cost) } : i
    ));
  };

  const updateReceiveBatch = (itemId: string, batchNumber: string) => {
    setReceiveItems(prev => prev.map(i => 
      i.itemId === itemId ? { ...i, batchNumber } : i
    ));
  };

  const updateReceiveExpiry = (itemId: string, expiryDate: string) => {
    setReceiveItems(prev => prev.map(i => 
      i.itemId === itemId ? { ...i, expiryDate } : i
    ));
  };

  const submitReceive = useCallback(() => {
    if (!selectedPO || receiveItems.every(i => i.quantity === 0)) return;
    const today = new Date();
    
    const receivedItems = receiveItems.filter(i => i.quantity > 0);
    
    setPurchaseOrders(prev => prev.map(o => {
      if (o.id !== selectedPO.id) return o;
      
      const updatedItems = o.items.map(item => {
        const receiveItem = receivedItems.find(ri => ri.itemId === item.itemId);
        if (receiveItem) {
          return {
            ...item,
            receivedQuantity: item.receivedQuantity + receiveItem.quantity,
            unitCost: receiveItem.cost,
          };
        }
        return item;
      });
      
      const allReceived = updatedItems.every(item => item.receivedQuantity >= item.orderedQuantity);
      const anyReceived = updatedItems.some(item => item.receivedQuantity > 0);
      
      const newStatus: POStatus = allReceived ? 'received' : anyReceived ? 'partial' : o.status;
      
      // Update inventory quantities
      setItems(prevItems => prevItems.map(invItem => {
        const received = receivedItems.find(ri => ri.itemId === invItem.id);
        if (received) {
          return {
            ...invItem,
            quantity: invItem.quantity + received.quantity,
            costPerUnit: received.cost,
          };
        }
        return invItem;
      }));
      
      // Create stock movements
      const newMovements = receivedItems.map(received => {
        const invItem = items.find(i => i.id === received.itemId);
        const previousQuantity = invItem?.quantity || 0;
        return {
          id: `m${Date.now()}-${received.itemId}`,
          itemId: received.itemId,
          itemName: invItem?.name || received.itemId,
          type: 'received' as StockMovementType,
          quantity: received.quantity,
          previousQuantity,
          newQuantity: previousQuantity + received.quantity,
          reason: `Received from PO ${o.id}`,
          userId: 'u1',
          userName: 'John Manager',
          createdAt: today,
        } as StockMovement;
      });
      
      setMovements(prev => [...newMovements, ...prev]);
      
      // Add audit log entries
      const newAuditEntries: AuditLogEntry[] = receivedItems.map(received => {
        const invItem = items.find(i => i.id === received.itemId);
        return {
          id: `a${Date.now()}-${received.itemId}`,
          action: 'UPDATE',
          entityType: 'InventoryItem',
          entityId: received.itemId,
          previousValue: JSON.stringify({ quantity: invItem?.quantity || 0 }),
          newValue: JSON.stringify({ quantity: (invItem?.quantity || 0) + received.quantity }),
          userId: 'u1',
          userName: 'John Manager',
          createdAt: today,
        };
      });
      
      // Add PO status change audit log
      newAuditEntries.push({
        id: `a${Date.now()}-po`,
        action: 'UPDATE',
        entityType: 'PurchaseOrder',
        entityId: o.id,
        previousValue: JSON.stringify({ status: o.status }),
        newValue: JSON.stringify({ status: newStatus }),
        userId: 'u1',
        userName: 'John Manager',
        createdAt: today,
      });
      
      setAuditLogs(prev => [...newAuditEntries, ...prev]);
      
      return {
        ...o,
        items: updatedItems,
        status: newStatus,
        receivedAt: allReceived ? today : o.receivedAt,
      };
    }));
    
    setReceiveItems([]);
    setDeliveryNotes('');
    setReceivedBy('');
    setSelectedPO(null);
    setShowReceiveModal(false);
  }, [selectedPO, receiveItems, deliveryNotes, receivedBy, items]);

  const stats = useMemo(() => {
    const lowStockItems = items.filter(i => i.quantity <= i.reorderLevel);
    const totalValue = items.reduce((sum, i) => sum + (i.quantity * i.costPerUnit), 0);
    const totalWasteCost = wasteRecords.reduce((sum, w) => sum + w.cost, 0);
    const pendingPOs = purchaseOrders.filter(po => po.status === 'sent' || po.status === 'partial').length;
    
    return { totalItems: items.length, lowStockItems: lowStockItems.length, totalValue, totalWasteCost, pendingPOs };
  }, [items, wasteRecords, purchaseOrders]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof NewInventoryItem, string>> = {};
    
    if (!formData.name.trim()) errors.name = 'Item name is required';
    if (formData.quantity < 0) errors.quantity = 'Quantity cannot be negative';
    if (formData.costPerUnit < 0) errors.costPerUnit = 'Cost cannot be negative';
    if (formData.reorderLevel < 0) errors.reorderLevel = 'Reorder level cannot be negative';
    if (formData.minStock < 0) errors.minStock = 'Min stock cannot be negative';
    if (formData.maxStock < 0) errors.maxStock = 'Max stock cannot be negative';
    if (formData.minStock > formData.maxStock) errors.minStock = 'Min stock cannot exceed max stock';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof NewInventoryItem, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSaveItem = useCallback(() => {
    if (!validateForm()) return;

    const newItem: InventoryItem = {
      id: `inv${Date.now()}`,
      name: formData.name.trim(),
      category: formData.category,
      quantity: formData.quantity,
      unit: formData.unit,
      reorderLevel: formData.reorderLevel,
      costPerUnit: formData.costPerUnit,
    };

    setItems(prev => [...prev, newItem]);
    setFormData(initialFormState);
    setFormErrors({});
    setShowAddItemModal(false);
  }, [formData, items]);

  const openAddItemModal = () => {
    setFormData(initialFormState);
    setFormErrors({});
    setShowAddItemModal(true);
  };

  const validateMovementForm = (): boolean => {
    const errors: Partial<Record<keyof typeof movementForm, string>> = {};
    
    if (!movementForm.itemId) errors.itemId = 'Please select an inventory item';
    if (movementForm.quantity <= 0) errors.quantity = 'Quantity must be greater than 0';
    if (movementForm.type === 'transfer' && !movementForm.location) errors.location = 'Location is required for transfers';
    
    const selectedItem = items.find(i => i.id === movementForm.itemId);
    if (selectedItem && ['used', 'waste', 'transfer'].includes(movementForm.type)) {
      if (movementForm.quantity > selectedItem.quantity) {
        errors.quantity = `Insufficient stock. Available: ${selectedItem.quantity} ${selectedItem.unit}`;
      }
    }

    setMovementErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleMovementInputChange = (field: keyof typeof movementForm, value: string | number) => {
    setMovementForm(prev => ({ ...prev, [field]: value }));
    if (movementErrors[field]) {
      setMovementErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSaveMovement = useCallback(() => {
    if (!validateMovementForm()) return;

    const selectedItem = items.find(i => i.id === movementForm.itemId)!;
    const previousQuantity = selectedItem.quantity;
    
    let quantityChange = 0;
    switch (movementForm.type) {
      case 'received':
      case 'adjustment':
        quantityChange = movementForm.quantity;
        break;
      case 'used':
      case 'waste':
      case 'transfer':
        quantityChange = -movementForm.quantity;
        break;
    }
    const newQuantity = previousQuantity + quantityChange;

    // Create StockMovement entry
    const newMovement: StockMovement = {
      id: `m${Date.now()}`,
      itemId: movementForm.itemId,
      itemName: selectedItem.name,
      type: movementForm.type,
      quantity: movementForm.quantity * (quantityChange < 0 ? -1 : 1),
      previousQuantity,
      newQuantity,
      reason: movementForm.notes || undefined,
      userId: 'u1',
      userName: 'John Manager',
      createdAt: new Date(),
      location: movementForm.type === 'transfer' ? movementForm.location : undefined,
    };

    // Update inventory quantity
    setItems(prev => prev.map(item => 
      item.id === movementForm.itemId 
        ? { ...item, quantity: newQuantity }
        : item
    ));

    // Add stock movement
    setMovements(prev => [newMovement, ...prev]);

    // Add audit log entry
    const newAuditEntry: AuditLogEntry = {
      id: `a${Date.now()}`,
      action: 'CREATE',
      entityType: 'StockMovement',
      entityId: newMovement.id,
      previousValue: JSON.stringify({ quantity: previousQuantity }),
      newValue: JSON.stringify({ quantity: newQuantity }),
      userId: 'u1',
      userName: 'John Manager',
      createdAt: new Date(),
    };
    setAuditLogs(prev => [newAuditEntry, ...prev]);

    // Reset form and close modal
    setMovementForm({
      itemId: '',
      type: 'received',
      quantity: 0,
      notes: '',
      location: '',
    });
    setMovementErrors({});
    setShowMovementModal(false);
  }, [movementForm, items]);

  const openMovementModal = () => {
    setMovementForm({
      itemId: '',
      type: 'received',
      quantity: 0,
      notes: '',
      location: '',
    });
    setMovementErrors({});
    setShowMovementModal(true);
  };

  const tabs: { id: TabView; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'items', label: 'Items' },
    { id: 'movements', label: 'Movements' },
    { id: 'purchaseOrders', label: 'Purchase Orders' },
    { id: 'forecasting', label: 'Forecasting' },
    { id: 'waste', label: 'Waste Tracking' },
    { id: 'suppliers', label: 'Suppliers' },
    { id: 'counts', label: 'Inventory Counts' },
    { id: 'transfers', label: 'Transfers' },
    { id: 'audit', label: 'Audit Log' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalItems}</div>
          <div className="stat-label">Total Items</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--warning)' }}>
          <div className="stat-value">{stats.lowStockItems}</div>
          <div className="stat-label">Low Stock Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatCurrency(stats.totalValue)}</div>
          <div className="stat-label">Total Inventory Value</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--danger)' }}>
          <div className="stat-value">{formatCurrency(stats.totalWasteCost)}</div>
          <div className="stat-label">Waste This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendingPOs}</div>
          <div className="stat-label">Pending Orders</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="card-title">Recent Stock Movements</h3>
          <div className="space-y-3">
            {movements.slice(0, 5).map(m => (
              <div key={m.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="font-medium">{m.itemName}</div>
                  <div className="text-sm text-gray-500">{m.type} • {formatDate(m.createdAt)}</div>
                </div>
                <div className={`font-semibold ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {m.quantity > 0 ? '+' : ''}{m.quantity} {items.find(i => i.id === m.itemId)?.unit || ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Reorder Recommendations</h3>
          <div className="space-y-3">
            {items.filter(i => i.quantity <= i.reorderLevel).slice(0, 5).map(item => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-red-500">{item.quantity} / {item.reorderLevel} {item.unit}</div>
                </div>
                <button className="btn btn-sm btn-primary">Create PO</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderItems = () => (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="card-title">Inventory Items</h3>
        <button className="btn btn-primary" onClick={openAddItemModal}>Add Item</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2">Name</th>
              <th className="text-left py-3 px-2">Category</th>
              <th className="text-right py-3 px-2">Quantity</th>
              <th className="text-right py-3 px-2">Unit</th>
              <th className="text-right py-3 px-2">Cost</th>
              <th className="text-right py-3 px-2">Value</th>
              <th className="text-left py-3 px-2">Status</th>
              <th className="text-center py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2 font-medium">{item.name}</td>
                <td className="py-3 px-2">{item.category}</td>
                <td className="py-3 px-2 text-right">{item.quantity}</td>
                <td className="py-3 px-2 text-right">{item.unit}</td>
                <td className="py-3 px-2 text-right">{formatCurrency(item.costPerUnit)}</td>
                <td className="py-3 px-2 text-right">{formatCurrency(item.quantity * item.costPerUnit)}</td>
                <td className="py-3 px-2">
                  {item.quantity <= item.reorderLevel ? <span className="text-red-600 font-medium">Low Stock</span> : <span className="text-green-600">Good</span>}
                </td>
                <td className="py-3 px-2 text-center">
                  <button className="btn btn-sm btn-secondary mr-2">Edit</button>
                  <button className="btn btn-sm btn-secondary">Adjust</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMovements = () => (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="card-title">Stock Movements</h3>
        <button className="btn btn-primary" onClick={openMovementModal}>Record Movement</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2">Date</th>
              <th className="text-left py-3 px-2">Item</th>
              <th className="text-left py-3 px-2">Type</th>
              <th className="text-right py-3 px-2">Quantity</th>
              <th className="text-right py-3 px-2">Before</th>
              <th className="text-right py-3 px-2">After</th>
              <th className="text-left py-3 px-2">Reason</th>
              <th className="text-left py-3 px-2">User</th>
            </tr>
          </thead>
          <tbody>
            {movements.map(m => (
              <tr key={m.id} className="border-b border-gray-100">
                <td className="py-3 px-2">{formatDate(m.createdAt)}</td>
                <td className="py-3 px-2 font-medium">{m.itemName}</td>
                <td className="py-3 px-2 capitalize">{m.type}</td>
                <td className={`py-3 px-2 text-right font-medium ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {m.quantity > 0 ? '+' : ''}{m.quantity}
                </td>
                <td className="py-3 px-2 text-right">{m.previousQuantity}</td>
                <td className="py-3 px-2 text-right">{m.newQuantity}</td>
                <td className="py-3 px-2">{m.reason || '-'}</td>
                <td className="py-3 px-2">{m.userName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPurchaseOrders = () => (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="card-title">Purchase Orders</h3>
        <button className="btn btn-primary" onClick={openCreatePOModal}>Create PO</button>
      </div>
      <div className="space-y-4">
        {purchaseOrders.map(po => (
          <div key={po.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-semibold">PO #{po.id.toUpperCase()}</div>
                <div className="text-sm text-gray-500">{po.supplierName} • {formatDate(po.orderedAt)}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatCurrency(po.total)}</div>
                <div className="text-sm capitalize">{po.status.replace('_', ' ')}</div>
              </div>
            </div>
            <div className="space-y-2">
              {po.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.itemName}</span>
                  <span>{item.receivedQuantity}/{item.orderedQuantity} received</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button className="btn btn-sm btn-secondary" onClick={() => openViewPOModal(po)}>View</button>
              {po.status === 'sent' && <button className="btn btn-sm btn-primary" onClick={() => openReceiveModal(po)}>Receive Items</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderForecasting = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="card-title">Demand Forecasting & Smart Reordering</h3>
        <p className="text-gray-600 mb-4">Based on 30-day consumption patterns</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Item</th>
                <th className="text-right py-3 px-2">Daily Usage</th>
                <th className="text-right py-3 px-2">Current Stock</th>
                <th className="text-right py-3 px-2">Days Remaining</th>
                <th className="text-right py-3 px-2">Recommended Order</th>
                <th className="text-center py-3 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 8).map(item => {
                const dailyUsage = Math.round((Math.random() * 10) + 1);
                const daysRemaining = Math.floor(item.quantity / dailyUsage);
                const recommended = Math.max(0, (dailyUsage * 7) - item.quantity + item.reorderLevel);
                return (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 px-2 font-medium">{item.name}</td>
                    <td className="py-3 px-2 text-right">{dailyUsage} {item.unit}/day</td>
                    <td className="py-3 px-2 text-right">{item.quantity} {item.unit}</td>
                    <td className={`py-3 px-2 text-right ${daysRemaining < 3 ? 'text-red-600 font-medium' : ''}`}>{daysRemaining} days</td>
                    <td className="py-3 px-2 text-right font-medium">{recommended} {item.unit}</td>
                    <td className="py-3 px-2 text-center">
                      {recommended > 0 && <button className="btn btn-sm btn-primary">Add to PO</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderWaste = () => (
    <div className="space-y-6">
      <div className="stat-grid">
        <div className="stat-card" style={{ background: 'var(--danger)' }}>
          <div className="stat-value">{formatCurrency(stats.totalWasteCost)}</div>
          <div className="stat-label">Total Waste This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{wasteRecords.length}</div>
          <div className="stat-label">Waste Records</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{((stats.totalWasteCost / stats.totalValue) * 100).toFixed(1)}%</div>
          <div className="stat-label">Waste Percentage</div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="card-title">Waste Log</h3>
          <button className="btn btn-danger">Record Waste</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Date</th>
                <th className="text-left py-3 px-2">Item</th>
                <th className="text-left py-3 px-2">Category</th>
                <th className="text-right py-3 px-2">Quantity</th>
                <th className="text-right py-3 px-2">Cost</th>
                <th className="text-left py-3 px-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {wasteRecords.map(w => (
                <tr key={w.id} className="border-b border-gray-100">
                  <td className="py-3 px-2">{formatDate(w.createdAt)}</td>
                  <td className="py-3 px-2 font-medium">{w.itemName}</td>
                  <td className="py-3 px-2 capitalize">{w.category.replace('-', ' ')}</td>
                  <td className="py-3 px-2 text-right">{w.quantity}</td>
                  <td className="py-3 px-2 text-right">{formatCurrency(w.cost)}</td>
                  <td className="py-3 px-2">{w.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSuppliers = () => (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="card-title">Suppliers</h3>
        <button className="btn btn-primary">Add Supplier</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map(s => (
          <div key={s.id} className="border border-gray-200 rounded-lg p-4">
            <div className="font-semibold">{s.name}</div>
            <div className="text-sm text-gray-600 mt-1">{s.contactName}</div>
            <div className="text-sm mt-2">{s.email}</div>
            <div className="text-sm">{s.phone}</div>
            <div className="text-sm mt-2 text-gray-500">Lead Time: {s.leadTimeDays} days</div>
            <div className="text-sm text-gray-500">Terms: {s.paymentTerms}</div>
            <div className="flex gap-2 mt-3">
              <button className="btn btn-sm btn-secondary">Edit</button>
              <button className="btn btn-sm btn-secondary">View POs</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCounts = () => (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="card-title">Inventory Counts & Reconciliation</h3>
        <button className="btn btn-primary">Schedule Count</button>
      </div>
      <div className="space-y-4">
        {counts.map(c => (
          <div key={c.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">Count #{c.id.toUpperCase()}</div>
                <div className="text-sm text-gray-500">Scheduled: {formatDate(c.scheduledAt)}</div>
                {c.completedAt && <div className="text-sm text-gray-500">Completed: {formatDate(c.completedAt)}</div>}
              </div>
              <div className="text-sm capitalize font-medium">{c.status.replace('_', ' ')}</div>
            </div>
            {c.items.length > 0 && (
              <div className="mt-3 space-y-1">
                {c.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{items.find(i => i.id === item.itemId)?.name || item.itemId}</span>
                    <span className={item.variance !== 0 ? 'text-red-600' : ''}>
                      {item.counted} / {item.expected} {item.variance !== 0 && `(${item.variance > 0 ? '+' : ''}${item.variance})`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-3">
              {c.status === 'pending' && <button className="btn btn-sm btn-primary">Start Count</button>}
              {c.status === 'completed' && <button className="btn btn-sm btn-primary">Reconcile</button>}
              <button className="btn btn-sm btn-secondary">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTransfers = () => (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="card-title">Multi-Location Stock Transfers</h3>
        <button className="btn btn-primary">Create Transfer</button>
      </div>
      <div className="space-y-4">
        {transfers.map(t => (
          <div key={t.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">Transfer #{t.id.toUpperCase()}</div>
                <div className="text-sm">{t.fromLocation} → {t.toLocation}</div>
                <div className="text-sm text-gray-500">{formatDate(t.createdAt)} • {t.requestedBy}</div>
              </div>
              <div className="text-sm capitalize font-medium">{t.status.replace('_', ' ')}</div>
            </div>
            <div className="mt-3 space-y-1">
              {t.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.itemName}</span>
                  <span>{item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              {t.status === 'in_transit' && <button className="btn btn-sm btn-primary">Mark Received</button>}
              <button className="btn btn-sm btn-secondary">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAudit = () => (
    <div className="card">
      <h3 className="card-title">Audit Logs</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2">Timestamp</th>
              <th className="text-left py-3 px-2">Action</th>
              <th className="text-left py-3 px-2">Entity</th>
              <th className="text-left py-3 px-2">User</th>
              <th className="text-left py-3 px-2">Changes</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map(log => (
              <tr key={log.id} className="border-b border-gray-100">
                <td className="py-3 px-2 text-sm">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="py-3 px-2 font-medium">{log.action}</td>
                <td className="py-3 px-2">{log.entityType}</td>
                <td className="py-3 px-2">{log.userName}</td>
                <td className="py-3 px-2 text-sm text-gray-600">
                  {log.previousValue && log.newValue ? `${log.previousValue} → ${log.newValue}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'items': return renderItems();
      case 'movements': return renderMovements();
      case 'purchaseOrders': return renderPurchaseOrders();
      case 'forecasting': return renderForecasting();
      case 'waste': return renderWaste();
      case 'suppliers': return renderSuppliers();
      case 'counts': return renderCounts();
      case 'transfers': return renderTransfers();
      case 'audit': return renderAudit();
      default: return renderOverview();
    }
  };

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1 className="page-title">Inventory Management</h1>
      </div>

      <div className="tabs mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderActiveTab()}

      {/* Add Item Modal */}
      <div className={`modal-overlay ${showAddItemModal ? 'active' : ''}`} onClick={() => setShowAddItemModal(false)}>
        <div className="modal" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Add New Inventory Item</h2>
            <button className="modal-close" onClick={() => setShowAddItemModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Item Name *</label>
                <input
                  type="text"
                  className={`form-input ${formErrors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter item name"
                />
                {formErrors.name && <div className="form-error text-red-600 text-sm mt-1">{formErrors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="Ingredients">Ingredients</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Unit Type</label>
                <select
                  className="form-input"
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                >
                  <option value="each">Each</option>
                  <option value="kg">Kilograms</option>
                  <option value="g">Grams</option>
                  <option value="l">Liters</option>
                  <option value="ml">Milliliters</option>
                  <option value="box">Box</option>
                  <option value="case">Case</option>
                  <option value="packet">Packet</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  className={`form-input ${formErrors.quantity ? 'error' : ''}`}
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="any"
                />
                {formErrors.quantity && <div className="form-error text-red-600 text-sm mt-1">{formErrors.quantity}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Cost per Unit *</label>
                <input
                  type="number"
                  className={`form-input ${formErrors.costPerUnit ? 'error' : ''}`}
                  value={formData.costPerUnit}
                  onChange={(e) => handleInputChange('costPerUnit', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                {formErrors.costPerUnit && <div className="form-error text-red-600 text-sm mt-1">{formErrors.costPerUnit}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Reorder Level</label>
                <input
                  type="number"
                  className={`form-input ${formErrors.reorderLevel ? 'error' : ''}`}
                  value={formData.reorderLevel}
                  onChange={(e) => handleInputChange('reorderLevel', parseFloat(e.target.value) || 0)}
                  min="0"
                />
                {formErrors.reorderLevel && <div className="form-error text-red-600 text-sm mt-1">{formErrors.reorderLevel}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Min Stock</label>
                <input
                  type="number"
                  className={`form-input ${formErrors.minStock ? 'error' : ''}`}
                  value={formData.minStock}
                  onChange={(e) => handleInputChange('minStock', parseFloat(e.target.value) || 0)}
                  min="0"
                />
                {formErrors.minStock && <div className="form-error text-red-600 text-sm mt-1">{formErrors.minStock}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Max Stock</label>
                <input
                  type="number"
                  className={`form-input ${formErrors.maxStock ? 'error' : ''}`}
                  value={formData.maxStock}
                  onChange={(e) => handleInputChange('maxStock', parseFloat(e.target.value) || 0)}
                  min="0"
                />
                {formErrors.maxStock && <div className="form-error text-red-600 text-sm mt-1">{formErrors.maxStock}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Storage Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.storageLocation}
                  onChange={(e) => handleInputChange('storageLocation', e.target.value)}
                  placeholder="e.g. Walk-in Freezer, Dry Storage"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Supplier</label>
                <select
                  className="form-input"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Barcode</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.barcode}
                  onChange={(e) => handleInputChange('barcode', e.target.value)}
                  placeholder="Scan or enter barcode"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Batch Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.batchNumber}
                  onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                  placeholder="Batch / Lot number"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Expiry Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowAddItemModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveItem}>Save Item</button>
          </div>
        </div>
      </div>

      {/* Record Movement Modal */}
      <div className={`modal-overlay ${showMovementModal ? 'active' : ''}`} onClick={() => setShowMovementModal(false)}>
        <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Record Stock Movement</h2>
            <button className="modal-close" onClick={() => setShowMovementModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Inventory Item *</label>
                <select
                  className={`form-input ${movementErrors.itemId ? 'error' : ''}`}
                  value={movementForm.itemId}
                  onChange={(e) => handleMovementInputChange('itemId', e.target.value)}
                >
                  <option value="">Select item</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.quantity} {item.unit} available)
                    </option>
                  ))}
                </select>
                {movementErrors.itemId && <div className="form-error text-red-600 text-sm mt-1">{movementErrors.itemId}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Movement Type *</label>
                <select
                  className="form-input"
                  value={movementForm.type}
                  onChange={(e) => handleMovementInputChange('type', e.target.value as StockMovementType)}
                >
                  <option value="received">Received (Stock In)</option>
                  <option value="used">Used (Stock Out)</option>
                  <option value="adjustment">Adjustment (Correction)</option>
                  <option value="waste">Waste (Discarded)</option>
                  <option value="transfer">Transfer (Moved)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  className={`form-input ${movementErrors.quantity ? 'error' : ''}`}
                  value={movementForm.quantity}
                  onChange={(e) => handleMovementInputChange('quantity', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="any"
                  placeholder="Enter quantity"
                />
                {movementErrors.quantity && <div className="form-error text-red-600 text-sm mt-1">{movementErrors.quantity}</div>}
              </div>

              {movementForm.type === 'transfer' && (
                <div className="form-group">
                  <label className="form-label">Transfer Location *</label>
                  <select
                    className={`form-input ${movementErrors.location ? 'error' : ''}`}
                    value={movementForm.location}
                    onChange={(e) => handleMovementInputChange('location', e.target.value)}
                  >
                    <option value="">Select location</option>
                    <option value="Main Storage">Main Storage</option>
                    <option value="Walk-in Freezer">Walk-in Freezer</option>
                    <option value="Prep Kitchen">Prep Kitchen</option>
                    <option value="Bar Station">Bar Station</option>
                    <option value="Dry Storage">Dry Storage</option>
                    <option value="Other Location">Other Location</option>
                  </select>
                  {movementErrors.location && <div className="form-error text-red-600 text-sm mt-1">{movementErrors.location}</div>}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Notes / Reference</label>
                <textarea
                  className="form-input"
                  value={movementForm.notes}
                  onChange={(e) => handleMovementInputChange('notes', e.target.value)}
                  placeholder="Add notes or reference number (optional)"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowMovementModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveMovement}>Record Movement</button>
          </div>
        </div>
      </div>

      {/* Create Purchase Order Modal */}
      <div className={`modal-overlay ${showCreatePOModal ? 'active' : ''}`} onClick={() => setShowCreatePOModal(false)}>
        <div className="modal" style={{ maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Create Purchase Order</h2>
            <button className="modal-close" onClick={() => setShowCreatePOModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Supplier *</label>
                  <select
                    className={`form-input ${poFormErrors.supplierId ? 'error' : ''}`}
                    value={poForm.supplierId}
                    onChange={(e) => handlePOInputChange('supplierId', e.target.value)}
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {poFormErrors.supplierId && <div className="form-error text-red-600 text-sm mt-1">{poFormErrors.supplierId}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Expected Delivery Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={poForm.expectedAt}
                    onChange={(e) => handlePOInputChange('expectedAt', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="flex justify-between items-center mb-2">
                  <label className="form-label m-0">Order Items</label>
                  <button className="btn btn-sm btn-secondary" onClick={addPOItem}>+ Add Item</button>
                </div>
                
                {poFormErrors.items && <div className="form-error text-red-600 text-sm mb-2">{poFormErrors.items}</div>}

                <div className="space-y-3">
                  {poForm.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-5">
                        <select
                          className="form-input"
                          value={item.itemId}
                          onChange={(e) => handlePOItemChange(index, 'itemId', e.target.value)}
                        >
                          <option value="">Select item</option>
                          {items.map(i => (
                            <option key={i.id} value={i.id}>
                              {i.name} ({i.quantity} {i.unit} available)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          className="form-input"
                          value={item.orderedQuantity}
                          onChange={(e) => handlePOItemChange(index, 'orderedQuantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="any"
                          placeholder="Qty"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          className="form-input"
                          value={item.unitCost}
                          onChange={(e) => handlePOItemChange(index, 'unitCost', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          placeholder="Cost"
                        />
                      </div>
                      <div className="col-span-2 text-right">
                        <div className="font-medium">{formatCurrency(item.orderedQuantity * item.unitCost)}</div>
                      </div>
                      <div className="col-span-1">
                        <button 
                          className="btn btn-sm btn-secondary" 
                          onClick={() => removePOItem(index)}
                          disabled={poForm.items.length <= 1}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes / Reference</label>
                <textarea
                  className="form-input"
                  value={poForm.notes}
                  onChange={(e) => handlePOInputChange('notes', e.target.value)}
                  placeholder="Add notes, reference number or special instructions (optional)"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Shipping Cost ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={poForm.shippingCost}
                    onChange={(e) => handlePOInputChange('shippingCost', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tax (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={poForm.taxPercent}
                    onChange={(e) => handlePOInputChange('taxPercent', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={poForm.discountPercent}
                    onChange={(e) => handlePOInputChange('discountPercent', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="border-t pt-4 flex justify-end">
                <div className="text-right w-64 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatCurrency(poCalculations.subtotal)}</span>
                  </div>
                  {poForm.discountPercent > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Discount ({poForm.discountPercent}%)</span>
                      <span className="text-green-600">-{formatCurrency(poCalculations.discountAmount)}</span>
                    </div>
                  )}
                  {poForm.taxPercent > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax ({poForm.taxPercent}%)</span>
                      <span>{formatCurrency(poCalculations.taxAmount)}</span>
                    </div>
                  )}
                  {poForm.shippingCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span>{formatCurrency(poForm.shippingCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t mt-2">
                    <span className="font-medium">Order Total</span>
                    <span className="text-2xl font-bold">{formatCurrency(poTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowCreatePOModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSavePO}>Create Purchase Order</button>
          </div>
        </div>
      </div>

      {/* View Purchase Order Modal */}
      <div className={`modal-overlay ${showViewPOModal ? 'active' : ''}`} onClick={() => { setShowViewPOModal(false); setSelectedPO(null); }}>
        <div className="modal" style={{ maxWidth: '950px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Purchase Order Details</h2>
            <button className="modal-close" onClick={() => { setShowViewPOModal(false); setSelectedPO(null); }}>×</button>
          </div>
          <div className="modal-body">
            {selectedPO && (
              <div className="space-y-6">
                {/* Order Header */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Order ID</div>
                    <div className="font-semibold">PO #{selectedPO.id.toUpperCase()}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Supplier</div>
                    <div className="font-semibold">{selectedPO.supplierName}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="font-semibold capitalize">{selectedPO.status.replace('_', ' ')}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Total</div>
                    <div className="font-semibold">{formatCurrency(selectedPO.total)}</div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Ordered Date</div>
                    <div>{formatDate(selectedPO.orderedAt)}</div>
                  </div>
                  {selectedPO.expectedAt && (
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Expected Date</div>
                      <div>{formatDate(selectedPO.expectedAt)}</div>
                    </div>
                  )}
                  {selectedPO.receivedAt && (
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Received Date</div>
                      <div>{formatDate(selectedPO.receivedAt)}</div>
                    </div>
                  )}
                </div>

                {/* Order Items Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Item</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Ordered</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Received</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Unit Cost</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPO.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">{item.itemName}</td>
                          <td className="py-3 px-4 text-right">{item.orderedQuantity}</td>
                          <td className="py-3 px-4 text-right">{item.receivedQuantity}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(item.unitCost)}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(item.orderedQuantity * item.unitCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pricing Breakdown */}
                <div className="flex justify-end">
                  <div className="w-72 space-y-2">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Subtotal</span>
                      <span>{formatCurrency(selectedPO.subtotal)}</span>
                    </div>
                    {selectedPO.discountPercent > 0 && (
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">Discount ({selectedPO.discountPercent}%)</span>
                        <span className="text-green-600">-{formatCurrency(selectedPO.discountAmount)}</span>
                      </div>
                    )}
                    {selectedPO.taxPercent > 0 && (
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">Tax ({selectedPO.taxPercent}%)</span>
                        <span>{formatCurrency(selectedPO.taxAmount)}</span>
                      </div>
                    )}
                    {selectedPO.shippingCost > 0 && (
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500">Shipping</span>
                        <span>{formatCurrency(selectedPO.shippingCost)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t font-semibold">
                      <span>Grand Total</span>
                      <span>{formatCurrency(selectedPO.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline / Status History */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Order Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Order Created</div>
                        <div className="text-sm text-gray-500">{formatDate(selectedPO.orderedAt)}</div>
                      </div>
                    </div>
                    {selectedPO.status !== 'draft' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-2 bg-yellow-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">Order Sent to Supplier</div>
                          <div className="text-sm text-gray-500">Pending confirmation</div>
                        </div>
                      </div>
                    )}
                    {selectedPO.status === 'partial' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-2 bg-orange-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">Partially Received</div>
                          <div className="text-sm text-gray-500">Some items have been received</div>
                        </div>
                      </div>
                    )}
                    {selectedPO.status === 'received' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">Order Fully Received</div>
                          <div className="text-sm text-gray-500">{selectedPO.receivedAt ? formatDate(selectedPO.receivedAt) : ''}</div>
                        </div>
                      </div>
                    )}
                    {selectedPO.status === 'cancelled' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-2 bg-red-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">Order Cancelled</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedPO.notes && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Notes & Reference</h4>
                    <p className="text-gray-600">{selectedPO.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => { setShowViewPOModal(false); setSelectedPO(null); }}>Close</button>
          </div>
        </div>
      </div>

      {/* Receive Items Modal */}
      <div className={`modal-overlay ${showReceiveModal ? 'active' : ''}`} onClick={() => setShowReceiveModal(false)}>
        <div className="modal" style={{ maxWidth: '1000px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">📦 Receive Order - {selectedPO?.id}</h2>
            <button className="modal-close" onClick={() => setShowReceiveModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label className="form-label">Received By</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Name of person receiving delivery"
                  value={receivedBy} 
                  onChange={e => setReceivedBy(e.target.value)} 
                />
              </div>
              <div>
                <label className="form-label">Delivery Notes</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Condition, carrier info, etc."
                  value={deliveryNotes} 
                  onChange={e => setDeliveryNotes(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-label">Received Items:</div>
            <table className="data-table" style={{ marginTop: '12px', width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Item</th>
                  <th style={{ textAlign: 'right', padding: '12px 8px' }}>Ordered</th>
                  <th style={{ textAlign: 'right', padding: '12px 8px' }}>Remaining</th>
                  <th style={{ textAlign: 'right', padding: '12px 8px' }}>Receive Qty</th>
                  <th style={{ textAlign: 'right', padding: '12px 8px' }}>Actual Cost</th>
                  <th style={{ padding: '12px 8px' }}>Batch #</th>
                  <th style={{ padding: '12px 8px' }}>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {receiveItems.map(item => {
                  const orderItem = selectedPO?.items.find(i => i.itemId === item.itemId);
                  const maxQty = orderItem ? orderItem.orderedQuantity - orderItem.receivedQuantity : 0;
                  return (
                    <tr key={item.itemId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 8px' }}>{orderItem?.itemName}</td>
                      <td style={{ textAlign: 'right', padding: '12px 8px' }}>{orderItem?.orderedQuantity}</td>
                      <td style={{ textAlign: 'right', padding: '12px 8px' }}>{maxQty}</td>
                      <td style={{ textAlign: 'right', width: '100px', padding: '12px 8px' }}>
                        <input 
                          type="number" 
                          className="form-input" 
                          style={{ textAlign: 'right', margin: 0 }}
                          min={0} 
                          max={maxQty}
                          value={item.quantity} 
                          onChange={e => updateReceiveQuantity(item.itemId, parseInt(e.target.value) || 0)} 
                        />
                      </td>
                      <td style={{ textAlign: 'right', width: '120px', padding: '12px 8px' }}>
                        <input 
                          type="number" 
                          step="0.01"
                          className="form-input" 
                          style={{ textAlign: 'right', margin: 0 }}
                          min={0}
                          value={item.cost} 
                          onChange={e => updateReceiveCost(item.itemId, parseFloat(e.target.value) || 0)} 
                        />
                      </td>
                      <td style={{ width: '130px', padding: '12px 8px' }}>
                        <input 
                          type="text" 
                          className="form-input"
                          placeholder="Batch"
                          style={{ margin: 0 }}
                          value={item.batchNumber} 
                          onChange={e => updateReceiveBatch(item.itemId, e.target.value)} 
                        />
                      </td>
                      <td style={{ width: '140px', padding: '12px 8px' }}>
                        <input 
                          type="date" 
                          className="form-input"
                          style={{ margin: 0 }}
                          value={item.expiryDate} 
                          onChange={e => updateReceiveExpiry(item.itemId, e.target.value)} 
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              💡 <strong>Tip:</strong> You may receive partial quantities. Any remaining items will stay on this order for future receipt.
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowReceiveModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitReceive} disabled={receiveItems.every(i => i.quantity === 0)} style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}>
              ✓ Receive Items
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}