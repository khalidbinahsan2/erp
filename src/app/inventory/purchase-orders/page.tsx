'use client';

import { useState, useMemo, useCallback } from 'react';
import { inventoryItems as initialInventory } from '@/lib/mockData';
import { InventoryItem } from '@/types';

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

interface OrderTimelineEvent {
  date: string;
  status: 'pending' | 'ordered' | 'received' | 'used' | 'returned' | 'cancelled';
  notes?: string;
}

interface PurchaseOrderItem {
  itemId: string;
  name: string;
  quantity: number;
  cost: number;
  received?: number;
  actualCost?: number;
  batchNumber?: string;
  expiryDate?: string;
  returned?: number;
  returnReason?: string;
}

interface PurchaseOrder {
  id: string;
  items: PurchaseOrderItem[];
  subtotal?: number;
  shippingCost?: number;
  taxRate?: number;
  taxAmount?: number;
  discount?: number;
  discountAmount?: number;
  total: number;
  status: 'pending' | 'ordered' | 'received' | 'used' | 'returned' | 'partially_returned' | 'partially_received' | 'cancelled';
  supplier: string;
  createdAt: string;
  notes: string;
  deliveryDate?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  reference?: string;
  timeline?: OrderTimelineEvent[];
}

interface PurchasedItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  cost: number;
  totalCost: number;
}

interface MonthlyPurchase {
  month: string;
  year: number;
  items: PurchasedItem[];
  totalQuantity: number;
  totalCost: number;
}

interface YearlyPurchase {
  year: number;
  items: PurchasedItem[];
  totalQuantity: number;
  totalCost: number;
  monthlyBreakdown: { month: string; quantity: number; cost: number }[];
}

function usePurchaseOrders() {
  const [items, setItems] = useState<InventoryItem[]>(initialInventory);
  const [view, setView] = useState<'orders' | 'monthly' | 'yearly'>('orders');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    // April 2026
    { id: 'PO-028', items: [{ itemId: '1', name: 'Arborio Rice', quantity: 25, cost: 4.50 }, { itemId: '4', name: 'Parmesan Cheese', quantity: 8, cost: 21.75 }], subtotal: 286.50, shippingCost: 12.99, taxRate: 7, taxAmount: 20.06, total: 319.55, status: 'pending', supplier: 'Fresh Foods Co', createdAt: '2026-04-20', notes: 'Weekly risotto ingredients', priority: 'normal', timeline: [{ date: '2026-04-20', status: 'pending', notes: 'Order created' }] },
    { id: 'PO-027', items: [{ itemId: '2', name: 'Atlantic Salmon', quantity: 15, cost: 17.80 }], subtotal: 267.00, shippingCost: 18.50, taxRate: 7, taxAmount: 18.69, discount: 5, discountAmount: 13.35, total: 290.84, status: 'ordered', supplier: 'Ocean Catch', createdAt: '2026-04-18', notes: 'Weekly fresh fish delivery', deliveryDate: '2026-04-21', priority: 'high', timeline: [{ date: '2026-04-18', status: 'pending', notes: 'Order created' }, { date: '2026-04-18', status: 'ordered', notes: 'Confirmed with supplier' }] },
    { id: 'PO-026', items: [{ itemId: '12', name: 'Lettuce', quantity: 12, cost: 2.10 }, { itemId: '13', name: 'Tomatoes', quantity: 18, cost: 2.95 }, { itemId: '14', name: 'Lemon', quantity: 25, cost: 0.42 }, { itemId: '15', name: 'Mint Leaves', quantity: 3, cost: 14.75 }], subtotal: 153.15, shippingCost: 8.00, taxRate: 7, taxAmount: 10.72, total: 171.87, status: 'received', supplier: 'Fresh Farms', createdAt: '2026-04-16', notes: 'Salad bar restock', priority: 'normal', timeline: [{ date: '2026-04-16', status: 'pending', notes: 'Order created' }, { date: '2026-04-16', status: 'ordered', notes: 'Confirmed' }, { date: '2026-04-17', status: 'received', notes: 'Delivery received in good condition' }] },
    { id: 'PO-025', items: [{ itemId: '6', name: 'Ramen Noodles', quantity: 30, cost: 3.45 }], subtotal: 103.50, shippingCost: 7.50, taxRate: 7, taxAmount: 7.25, total: 118.25, status: 'used', supplier: 'Asian Supplies Co', createdAt: '2026-04-12', notes: 'Monthly ramen restock', priority: 'normal', timeline: [{ date: '2026-04-12', status: 'pending', notes: 'Order created' }, { date: '2026-04-12', status: 'ordered', notes: 'Confirmed' }, { date: '2026-04-14', status: 'received', notes: 'Received' }, { date: '2026-04-19', status: 'used', notes: 'Added to inventory' }] },
    { id: 'PO-024', items: [{ itemId: '5', name: 'Olive Oil', quantity: 12, cost: 7.90 }], subtotal: 94.80, shippingCost: 9.00, taxRate: 7, taxAmount: 6.64, total: 110.44, status: 'returned', supplier: 'Green Valley Farms', createdAt: '2026-04-08', notes: 'Damaged bottles on delivery', priority: 'normal', timeline: [{ date: '2026-04-08', status: 'pending', notes: 'Order created' }, { date: '2026-04-08', status: 'ordered', notes: 'Confirmed' }, { date: '2026-04-10', status: 'received', notes: 'Received' }, { date: '2026-04-11', status: 'returned', notes: '3 bottles damaged, full order returned' }] },
    
    // March 2026
    { id: 'PO-023', items: [{ itemId: '3', name: 'Wagyu Beef', quantity: 6, cost: 44.50 }, { itemId: '1', name: 'Arborio Rice', quantity: 20, cost: 4.45 }], subtotal: 356.00, shippingCost: 22.00, taxRate: 7, taxAmount: 24.92, discount: 10, discountAmount: 35.60, total: 367.32, status: 'used', supplier: 'Prime Meats', createdAt: '2026-03-30', notes: 'Special menu weekend order', priority: 'urgent', timeline: [{ date: '2026-03-30', status: 'pending', notes: 'Urgent order' }, { date: '2026-03-30', status: 'ordered', notes: 'Rush confirmed' }, { date: '2026-03-31', status: 'received', notes: 'Received overnight' }, { date: '2026-04-03', status: 'used', notes: 'Used for weekend special' }] },
    { id: 'PO-022', items: [{ itemId: '2', name: 'Atlantic Salmon', quantity: 20, cost: 17.50 }], subtotal: 350.00, shippingCost: 25.00, taxRate: 7, taxAmount: 24.50, total: 399.50, status: 'used', supplier: 'Ocean Catch', createdAt: '2026-03-26', notes: 'End of month bulk order', priority: 'normal', timeline: [{ date: '2026-03-26', status: 'pending', notes: 'Created' }, { date: '2026-03-26', status: 'ordered', notes: 'Confirmed' }, { date: '2026-03-28', status: 'received', notes: 'Received' }, { date: '2026-04-05', status: 'used', notes: 'Fully consumed' }] },
    { id: 'PO-021', items: [{ itemId: '4', name: 'Parmesan Cheese', quantity: 10, cost: 21.50 }, { itemId: '5', name: 'Olive Oil', quantity: 8, cost: 7.85 }], subtotal: 277.80, shippingCost: 14.00, taxRate: 7, taxAmount: 19.45, total: 311.25, status: 'received', supplier: 'Italian Imports', createdAt: '2026-03-22', notes: 'Italian ingredients restock', priority: 'normal', timeline: [{ date: '2026-03-22', status: 'pending', notes: 'Created' }, { date: '2026-03-22', status: 'ordered', notes: 'Confirmed' }, { date: '2026-03-25', status: 'received', notes: 'Received' }] },
    { id: 'PO-020', items: [{ itemId: '12', name: 'Lettuce', quantity: 15, cost: 2.00 }, { itemId: '13', name: 'Tomatoes', quantity: 20, cost: 2.90 }, { itemId: '14', name: 'Lemon', quantity: 40, cost: 0.40 }], subtotal: 104.00, shippingCost: 7.50, taxRate: 7, taxAmount: 7.28, total: 118.78, status: 'used', supplier: 'Fresh Farms', createdAt: '2026-03-18', notes: 'Weekly produce', priority: 'low', timeline: [{ date: '2026-03-18', status: 'pending', notes: 'Created' }, { date: '2026-03-18', status: 'ordered', notes: 'Confirmed' }, { date: '2026-03-19', status: 'received', notes: 'Received' }, { date: '2026-03-25', status: 'used', notes: 'Consumed' }] },
    { id: 'PO-019', items: [{ itemId: '1', name: 'Arborio Rice', quantity: 35, cost: 4.40 }], subtotal: 154.00, shippingCost: 10.00, taxRate: 7, taxAmount: 10.78, discount: 5, discountAmount: 7.70, total: 167.08, status: 'used', supplier: 'Fresh Foods Co', createdAt: '2026-03-14', notes: 'Bulk rice order', priority: 'normal', timeline: [{ date: '2026-03-14', status: 'pending', notes: 'Created' }, { date: '2026-03-14', status: 'ordered', notes: 'Confirmed' }, { date: '2026-03-16', status: 'received', notes: 'Received' }, { date: '2026-03-28', status: 'used', notes: 'Fully used' }] },
    { id: 'PO-018', items: [{ itemId: '6', name: 'Ramen Noodles', quantity: 25, cost: 3.40 }, { itemId: '15', name: 'Mint Leaves', quantity: 4, cost: 14.50 }], subtotal: 143.00, shippingCost: 8.50, taxRate: 7, taxAmount: 10.01, total: 161.51, status: 'used', supplier: 'Asian Supplies Co', createdAt: '2026-03-09', notes: 'Ramen and garnishes', priority: 'normal', timeline: [{ date: '2026-03-09', status: 'pending', notes: 'Created' }, { date: '2026-03-09', status: 'ordered', notes: 'Confirmed' }, { date: '2026-03-11', status: 'received', notes: 'Received' }, { date: '2026-03-20', status: 'used', notes: 'Used' }] },
    { id: 'PO-017', items: [{ itemId: '3', name: 'Wagyu Beef', quantity: 5, cost: 44.00 }], subtotal: 220.00, shippingCost: 15.00, taxRate: 7, taxAmount: 15.40, total: 250.40, status: 'used', supplier: 'Prime Meats', createdAt: '2026-03-04', notes: 'Weekend special order', priority: 'high', timeline: [{ date: '2026-03-04', status: 'pending', notes: 'Urgent' }, { date: '2026-03-04', status: 'ordered', notes: 'Confirmed' }, { date: '2026-03-05', status: 'received', notes: 'Received' }, { date: '2026-03-07', status: 'used', notes: 'Fully consumed' }] },
    
    // February 2026
    { id: 'PO-016', items: [{ itemId: '2', name: 'Atlantic Salmon', quantity: 18, cost: 17.25 }, { itemId: '5', name: 'Olive Oil', quantity: 10, cost: 7.75 }], subtotal: 388.00, shippingCost: 20.00, taxRate: 7, taxAmount: 27.16, discount: 7, discountAmount: 27.16, total: 407.99, status: 'used', supplier: 'Ocean Catch', createdAt: '2026-02-27', notes: 'Month end stock up', priority: 'normal', timeline: [{ date: '2026-02-27', status: 'pending', notes: 'Created' }, { date: '2026-02-27', status: 'ordered', notes: 'Confirmed' }, { date: '2026-03-01', status: 'received', notes: 'Received' }, { date: '2026-03-12', status: 'used', notes: 'Consumed' }] },
    { id: 'PO-015', items: [{ itemId: '4', name: 'Parmesan Cheese', quantity: 12, cost: 21.25 }], subtotal: 255.00, shippingCost: 12.00, taxRate: 7, taxAmount: 17.85, total: 284.85, status: 'used', supplier: 'Italian Imports', createdAt: '2026-02-22', notes: 'Cheese restock', priority: 'normal', timeline: [{ date: '2026-02-22', status: 'pending', notes: 'Created' }, { date: '2026-02-22', status: 'ordered', notes: 'Confirmed' }, { date: '2026-02-24', status: 'received', notes: 'Received' }, { date: '2026-03-08', status: 'used', notes: 'Fully used' }] },
    { id: 'PO-014', items: [{ itemId: '12', name: 'Lettuce', quantity: 14, cost: 1.95 }, { itemId: '13', name: 'Tomatoes', quantity: 22, cost: 2.85 }, { itemId: '14', name: 'Lemon', quantity: 35, cost: 0.38 }, { itemId: '15', name: 'Mint Leaves', quantity: 5, cost: 14.25 }], subtotal: 171.55, shippingCost: 9.00, taxRate: 7, taxAmount: 12.01, total: 192.56, status: 'used', supplier: 'Fresh Farms', createdAt: '2026-02-17', notes: 'Full salad bar order', priority: 'normal', timeline: [{ date: '2026-02-17', status: 'pending', notes: 'Created' }, { date: '2026-02-17', status: 'ordered', notes: 'Confirmed' }, { date: '2026-02-18', status: 'received', notes: 'Received' }, { date: '2026-02-25', status: 'used', notes: 'Consumed' }] },
    { id: 'PO-013', items: [{ itemId: '1', name: 'Arborio Rice', quantity: 30, cost: 4.35 }], subtotal: 130.50, shippingCost: 9.50, taxRate: 7, taxAmount: 9.14, total: 149.14, status: 'used', supplier: 'Fresh Foods Co', createdAt: '2026-02-13', notes: 'Regular rice order', priority: 'normal', timeline: [{ date: '2026-02-13', status: 'pending', notes: 'Created' }, { date: '2026-02-13', status: 'ordered', notes: 'Confirmed' }, { date: '2026-02-15', status: 'received', notes: 'Received' }, { date: '2026-02-28', status: 'used', notes: 'Fully consumed' }] },
    { id: 'PO-012', items: [{ itemId: '6', name: 'Ramen Noodles', quantity: 28, cost: 3.35 }], subtotal: 93.80, shippingCost: 7.00, taxRate: 7, taxAmount: 6.57, total: 107.37, status: 'used', supplier: 'Asian Supplies Co', createdAt: '2026-02-08', notes: 'Mid-month ramen restock', priority: 'low', timeline: [{ date: '2026-02-08', status: 'pending', notes: 'Created' }, { date: '2026-02-08', status: 'ordered', notes: 'Confirmed' }, { date: '2026-02-10', status: 'received', notes: 'Received' }, { date: '2026-02-22', status: 'used', notes: 'Used' }] },
    { id: 'PO-011', items: [{ itemId: '3', name: 'Wagyu Beef', quantity: 7, cost: 43.50 }], subtotal: 304.50, shippingCost: 18.00, taxRate: 7, taxAmount: 21.32, total: 343.82, status: 'used', supplier: 'Prime Meats', createdAt: '2026-02-03', notes: 'Valentines weekend order', priority: 'high', timeline: [{ date: '2026-02-03', status: 'pending', notes: 'Created' }, { date: '2026-02-03', status: 'ordered', notes: 'Confirmed' }, { date: '2026-02-05', status: 'received', notes: 'Received' }, { date: '2026-02-15', status: 'used', notes: 'Used for weekend' }] },
    
    // January 2026
    { id: 'PO-010', items: [{ itemId: '2', name: 'Atlantic Salmon', quantity: 22, cost: 17.00 }], subtotal: 374.00, shippingCost: 22.00, taxRate: 7, taxAmount: 26.18, discount: 10, discountAmount: 37.40, total: 384.78, status: 'used', supplier: 'Ocean Catch', createdAt: '2026-01-29', notes: 'End of month bulk order', priority: 'normal', timeline: [{ date: '2026-01-29', status: 'pending', notes: 'Created' }, { date: '2026-01-29', status: 'ordered', notes: 'Confirmed' }, { date: '2026-01-31', status: 'received', notes: 'Received' }, { date: '2026-02-12', status: 'used', notes: 'Consumed' }] },
    { id: 'PO-009', items: [{ itemId: '5', name: 'Olive Oil', quantity: 15, cost: 7.60 }, { itemId: '4', name: 'Parmesan Cheese', quantity: 8, cost: 21.00 }], subtotal: 282.00, shippingCost: 13.00, taxRate: 7, taxAmount: 19.74, total: 314.74, status: 'used', supplier: 'Green Valley Farms', createdAt: '2026-01-24', notes: 'Italian kitchen restock', priority: 'normal', timeline: [{ date: '2026-01-24', status: 'pending', notes: 'Created' }, { date: '2026-01-24', status: 'ordered', notes: 'Confirmed' }, { date: '2026-01-26', status: 'received', notes: 'Received' }, { date: '2026-02-07', status: 'used', notes: 'Fully used' }] },
    { id: 'PO-008', items: [{ itemId: '12', name: 'Lettuce', quantity: 16, cost: 1.90 }, { itemId: '13', name: 'Tomatoes', quantity: 25, cost: 2.80 }, { itemId: '14', name: 'Lemon', quantity: 45, cost: 0.37 }], subtotal: 117.05, shippingCost: 7.00, taxRate: 7, taxAmount: 8.19, total: 132.24, status: 'used', supplier: 'Fresh Farms', createdAt: '2026-01-19', notes: 'Weekly produce delivery', priority: 'normal', timeline: [{ date: '2026-01-19', status: 'pending', notes: 'Created' }, { date: '2026-01-19', status: 'ordered', notes: 'Confirmed' }, { date: '2026-01-20', status: 'received', notes: 'Received' }, { date: '2026-01-27', status: 'used', notes: 'Consumed' }] },
    { id: 'PO-007', items: [{ itemId: '1', name: 'Arborio Rice', quantity: 40, cost: 4.30 }], subtotal: 172.00, shippingCost: 11.00, taxRate: 7, taxAmount: 12.04, discount: 5, discountAmount: 8.60, total: 186.44, status: 'used', supplier: 'Fresh Foods Co', createdAt: '2026-01-15', notes: 'Monthly bulk rice order', priority: 'normal', timeline: [{ date: '2026-01-15', status: 'pending', notes: 'Created' }, { date: '2026-01-15', status: 'ordered', notes: 'Confirmed' }, { date: '2026-01-17', status: 'received', notes: 'Received' }, { date: '2026-02-02', status: 'used', notes: 'Fully consumed' }] },
    { id: 'PO-006', items: [{ itemId: '6', name: 'Ramen Noodles', quantity: 35, cost: 3.30 }], subtotal: 115.50, shippingCost: 8.00, taxRate: 7, taxAmount: 8.09, total: 131.59, status: 'used', supplier: 'Asian Supplies Co', createdAt: '2026-01-10', notes: 'First month ramen order', priority: 'normal', timeline: [{ date: '2026-01-10', status: 'pending', notes: 'Created' }, { date: '2026-01-10', status: 'ordered', notes: 'Confirmed' }, { date: '2026-01-12', status: 'received', notes: 'Received' }, { date: '2026-01-24', status: 'used', notes: 'Used' }] },
    { id: 'PO-005', items: [{ itemId: '3', name: 'Wagyu Beef', quantity: 10, cost: 43.00 }, { itemId: '15', name: 'Mint Leaves', quantity: 6, cost: 14.00 }], subtotal: 514.00, shippingCost: 20.00, taxRate: 7, taxAmount: 35.98, total: 569.98, status: 'used', supplier: 'Prime Meats', createdAt: '2026-01-05', notes: 'New year opening stock', priority: 'urgent', timeline: [{ date: '2026-01-05', status: 'pending', notes: 'Created' }, { date: '2026-01-05', status: 'ordered', notes: 'Confirmed' }, { date: '2026-01-06', status: 'received', notes: 'Received' }, { date: '2026-01-18', status: 'used', notes: 'Used for opening' }] },
    { id: 'PO-004', items: [{ itemId: '1', name: 'Arborio Rice', quantity: 25, cost: 4.25 }, { itemId: '4', name: 'Parmesan Cheese', quantity: 6, cost: 20.75 }], subtotal: 230.75, shippingCost: 11.50, taxRate: 7, taxAmount: 16.15, total: 258.40, status: 'used', supplier: 'Italian Imports', createdAt: '2026-01-22', notes: 'Risotto ingredients', priority: 'normal', timeline: [{ date: '2026-01-22', status: 'pending', notes: 'Created' }, { date: '2026-01-22', status: 'ordered', notes: 'Confirmed' }, { date: '2026-01-24', status: 'received', notes: 'Received' }, { date: '2026-02-03', status: 'used', notes: 'Consumed' }] },
    { id: 'PO-003', items: [{ itemId: '2', name: 'Atlantic Salmon', quantity: 12, cost: 16.75 }, { itemId: '14', name: 'Lemon', quantity: 20, cost: 0.35 }], subtotal: 208.00, shippingCost: 15.00, taxRate: 7, taxAmount: 14.56, total: 237.56, status: 'returned', supplier: 'Ocean Catch', createdAt: '2026-01-18', notes: 'Fish not fresh on delivery', priority: 'high', timeline: [{ date: '2026-01-18', status: 'pending', notes: 'Created' }, { date: '2026-01-18', status: 'ordered', notes: 'Confirmed' }, { date: '2026-01-20', status: 'received', notes: 'Received' }, { date: '2026-01-20', status: 'returned', notes: 'Salmon spoiled, full order returned' }] },
    { id: 'PO-002', items: [{ itemId: '5', name: 'Olive Oil', quantity: 10, cost: 7.50 }], subtotal: 75.00, shippingCost: 8.00, taxRate: 7, taxAmount: 5.25, total: 88.25, status: 'ordered', supplier: 'Green Valley Farms', createdAt: '2026-04-19', notes: 'Replacement order for returned shipment', priority: 'high', timeline: [{ date: '2026-04-19', status: 'pending', notes: 'Created' }, { date: '2026-04-19', status: 'ordered', notes: 'Confirmed with expedited shipping' }] },
    { id: 'PO-001', items: [{ itemId: '13', name: 'Tomatoes', quantity: 12, cost: 2.75 }, { itemId: '15', name: 'Mint Leaves', quantity: 2, cost: 13.75 }], subtotal: 60.50, shippingCost: 5.00, taxRate: 7, taxAmount: 4.24, total: 69.74, status: 'pending', supplier: 'Fresh Farms', createdAt: '2026-04-21', notes: 'Small emergency produce order', priority: 'urgent', timeline: [{ date: '2026-04-21', status: 'pending', notes: 'Created - urgent same day request' }] },
  ]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [showQuickRestockModal, setShowQuickRestockModal] = useState(false);
  const [quickRestockItems, setQuickRestockItems] = useState<{ itemId: string; quantity: number }[]>([]);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnItems, setReturnItems] = useState<{ itemId: string; quantity: number; reason: string }[]>([]);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveItems, setReceiveItems] = useState<{ 
    itemId: string; 
    quantity: number; 
    cost: number; 
    batchNumber: string; 
    expiryDate: string;
    received: number;
  }[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [receivedBy, setReceivedBy] = useState('');

  const addQuickRestockItem = useCallback((itemId: string) => {
    setQuickRestockItems(prev => {
      if (prev.find(i => i.itemId === itemId)) return prev;
      return [...prev, { itemId, quantity: 10 }];
    });
  }, []);

  const updateQuickRestockQty = useCallback((itemId: string, qty: number) => {
    setQuickRestockItems(prev => prev.map(i => 
      i.itemId === itemId ? { ...i, quantity: Math.max(1, qty) } : i
    ));
  }, []);

  const removeQuickRestockItem = useCallback((itemId: string) => {
    setQuickRestockItems(prev => prev.filter(i => i.itemId !== itemId));
  }, []);

  const submitQuickRestock = useCallback(() => {
    if (quickRestockItems.length === 0) return;
    const orderItems = quickRestockItems.map(ri => {
      const invItem = items.find(i => i.id === ri.itemId);
      return { itemId: ri.itemId, name: invItem?.name || '', quantity: ri.quantity, cost: invItem?.costPerUnit || 0 };
    });
    const total = orderItems.reduce((sum, i) => sum + i.quantity * i.cost, 0);
    const today = new Date().toISOString().split('T')[0];
    
    setPurchaseOrders(prev => {
      const order: PurchaseOrder = {
        id: `PO-${String(prev.length + 1).padStart(3, '0')}`,
        items: orderItems,
        total,
        status: 'ordered',
        supplier: 'Quick Restock',
        createdAt: today,
        notes: 'Quick restock order',
        timeline: [
          { date: today, status: 'pending', notes: 'Created via quick restock' },
          { date: today, status: 'ordered', notes: 'Auto-ordered from quick restock' }
        ]
      };
      return [order, ...prev];
    });
    setQuickRestockItems([]);
    setShowQuickRestockModal(false);
  }, [quickRestockItems, items]);

  const openReturnModal = useCallback((order: PurchaseOrder) => {
    setSelectedOrder(order);
    setReturnItems(order.items.map(item => ({
      itemId: item.itemId,
      quantity: 0,
      reason: ''
    })));
    setShowReturnModal(true);
  }, []);

  const updateReturnQuantity = useCallback((itemId: string, qty: number) => {
    const orderItem = selectedOrder?.items.find(i => i.itemId === itemId);
    const maxQty = orderItem ? orderItem.quantity - (orderItem.returned || 0) : 0;
    const validQty = Math.max(0, Math.min(qty, maxQty));
    
    setReturnItems(prev => prev.map(i => 
      i.itemId === itemId ? { ...i, quantity: validQty } : i
    ));
  }, [selectedOrder]);

  const updateReturnReason = useCallback((itemId: string, reason: string) => {
    setReturnItems(prev => prev.map(i => 
      i.itemId === itemId ? { ...i, reason } : i
    ));
  }, []);

  const openReceiveModal = useCallback((order: PurchaseOrder) => {
    setSelectedOrder(order);
    setReceiveItems(order.items.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity - (item.received || 0),
      cost: item.cost,
      batchNumber: '',
      expiryDate: '',
      received: item.received || 0
    })));
    setDeliveryNotes('');
    setReceivedBy('');
    setShowReceiveModal(true);
  }, []);

  const updateReceiveQuantity = useCallback((itemId: string, qty: number) => {
    const orderItem = selectedOrder?.items.find(i => i.itemId === itemId);
    const maxQty = orderItem ? orderItem.quantity - (orderItem.received || 0) : 0;
    const validQty = Math.max(0, Math.min(qty, maxQty));
    
    setReceiveItems(prev => prev.map(i => 
      i.itemId === itemId ? { ...i, quantity: validQty } : i
    ));
  }, [selectedOrder]);

  const updateReceiveCost = useCallback((itemId: string, cost: number) => {
    setReceiveItems(prev => prev.map(i => 
      i.itemId === itemId ? { ...i, cost: Math.max(0, cost) } : i
    ));
  }, []);

  const updateReceiveBatch = useCallback((itemId: string, batchNumber: string) => {
    setReceiveItems(prev => prev.map(i => 
      i.itemId === itemId ? { ...i, batchNumber } : i
    ));
  }, []);

  const updateReceiveExpiry = useCallback((itemId: string, expiryDate: string) => {
    setReceiveItems(prev => prev.map(i => 
      i.itemId === itemId ? { ...i, expiryDate } : i
    ));
  }, []);

  const submitReceive = useCallback(() => {
    if (!selectedOrder || receiveItems.every(i => i.quantity === 0)) return;
    const today = new Date().toISOString().split('T')[0];
    
    const receivedItems = receiveItems.filter(i => i.quantity > 0);
    
    setPurchaseOrders(prev => prev.map(o => {
      if (o.id !== selectedOrder.id) return o;
      
      const updatedItems = o.items.map(item => {
        const receiveItem = receivedItems.find(ri => ri.itemId === item.itemId);
        if (receiveItem) {
          return {
            ...item,
            received: (item.received || 0) + receiveItem.quantity,
            actualCost: receiveItem.cost,
            batchNumber: receiveItem.batchNumber,
            expiryDate: receiveItem.expiryDate
          };
        }
        return item;
      });
      
      const allReceived = updatedItems.every(item => (item.received || 0) >= item.quantity);
      const anyReceived = updatedItems.some(item => (item.received || 0) > 0);
      
      const newStatus = allReceived ? 'received' : anyReceived ? 'partially_received' : o.status;
      
      // Update inventory quantities
      setItems(prevItems => prevItems.map(invItem => {
        const received = receivedItems.find(ri => ri.itemId === invItem.id);
        if (received) {
          return {
            ...invItem,
            quantity: invItem.quantity + received.quantity,
            lastCost: received.cost
          };
        }
        return invItem;
      }));
      
      const receivedSummary = receivedItems.map(i => {
        const item = o.items.find(oi => oi.itemId === i.itemId);
        return `${i.quantity}x ${item?.name}${i.batchNumber ? ` (Batch: ${i.batchNumber})` : ''}`;
      }).join(', ');
      
      return {
        ...o,
        items: updatedItems,
        status: newStatus,
        timeline: [
          ...(o.timeline || [{ date: o.createdAt, status: 'pending', notes: o.notes }]),
          { 
            date: today, 
            status: 'received', 
            notes: `Received ${receivedItems.length} item(s): ${receivedSummary}${deliveryNotes ? ` | Notes: ${deliveryNotes}` : ''}${receivedBy ? ` | Received by: ${receivedBy}` : ''}`
          }
        ]
      };
    }));
    
    setReceiveItems([]);
    setDeliveryNotes('');
    setReceivedBy('');
    setSelectedOrder(null);
    setShowReceiveModal(false);
  }, [selectedOrder, receiveItems, deliveryNotes, receivedBy]);

  const submitReturn = useCallback(() => {
    if (!selectedOrder || returnItems.every(i => i.quantity === 0)) return;
    const today = new Date().toISOString().split('T')[0];
    
    const returnedItems = returnItems.filter(i => i.quantity > 0);
    
    setPurchaseOrders(prev => prev.map(o => {
      if (o.id !== selectedOrder.id) return o;
      
      const updatedItems = o.items.map(item => {
        const returnItem = returnedItems.find(ri => ri.itemId === item.itemId);
        if (returnItem) {
          return {
            ...item,
            returned: (item.returned || 0) + returnItem.quantity,
            returnReason: returnItem.reason
          };
        }
        return item;
      });
      
      const allReturned = updatedItems.every(item => (item.returned || 0) >= item.quantity);
      const anyReturned = updatedItems.some(item => (item.returned || 0) > 0);
      
      const newStatus = allReturned ? 'returned' : anyReturned ? 'partially_returned' : 'received';
      
      return {
        ...o,
        items: updatedItems,
        status: newStatus,
        timeline: [
          ...(o.timeline || [{ date: o.createdAt, status: 'pending', notes: o.notes }]),
          { 
            date: today, 
            status: 'returned', 
            notes: `Returned ${returnedItems.length} item(s): ${returnedItems.map(i => `${i.quantity}x ${o.items.find(oi => oi.itemId === i.itemId)?.name}`).join(', ')}`
          }
        ]
      };
    }));
    
    setReturnItems([]);
    setSelectedOrder(null);
    setShowReturnModal(false);
  }, [selectedOrder, returnItems]);

  // Status change handlers
  const handleOrderStatusToOrdered = useCallback((order: PurchaseOrder) => {
    const today = new Date().toISOString().split('T')[0];
    setPurchaseOrders(prev => prev.map(o => o.id === order.id ? { 
      ...o, 
      status: 'ordered',
      timeline: [
        ...(o.timeline || [{ date: o.createdAt, status: 'pending', notes: o.notes }]),
        { date: today, status: 'ordered', notes: 'Order placed with supplier' }
      ]
    } : o));
  }, []);

  const handleOrderStatusToReceived = useCallback((order: PurchaseOrder) => {
    const today = new Date().toISOString().split('T')[0];
    setPurchaseOrders(prev => prev.map(o => o.id === order.id ? { 
      ...o, 
      status: 'received',
      timeline: [
        ...(o.timeline || [{ date: o.createdAt, status: 'pending', notes: o.notes }]),
        { date: today, status: 'received', notes: 'Delivery received and checked' }
      ]
    } : o));
  }, []);

  const handleOrderStatusToUsed = useCallback((order: PurchaseOrder) => {
    const today = new Date().toISOString().split('T')[0];
    setPurchaseOrders(prev => prev.map(o => o.id === order.id ? { 
      ...o, 
      status: 'used',
      timeline: [
        ...(o.timeline || [{ date: o.createdAt, status: 'pending', notes: o.notes }]),
        { date: today, status: 'used', notes: 'Inventory items marked as used' }
      ]
    } : o));
  }, []);

  const handleRestockOrder = useCallback((order: PurchaseOrder) => {
    const today = new Date().toISOString().split('T')[0];
    setPurchaseOrders(prev => {
      const restockOrder: PurchaseOrder = {
        id: `PO-${String(prev.length + 1).padStart(3, '0')}`,
        items: order.items,
        total: order.total,
        status: 'pending',
        supplier: order.supplier,
        createdAt: today,
        notes: `Restock from ${order.id}`,
        timeline: [{ date: today, status: 'pending', notes: 'Auto restock order' }]
      };
      return [restockOrder, ...prev];
    });
  }, []);

  const handleCancelOrder = useCallback((order: PurchaseOrder) => {
    setPurchaseOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
  }, []);

  const handleDeleteOrder = useCallback((orderId: string) => {
    setPurchaseOrders(prev => prev.filter(o => o.id !== orderId));
  }, []);

  const handleViewHistory = useCallback((order: PurchaseOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  }, []);

  const suppliers = ['Fresh Foods Co', 'Ocean Catch', 'Prime Meats', 'Green Valley Farms', 'Beverage Distributors', 'Asian Supplies Co', 'Italian Imports', 'Fresh Farms', 'Restaurant Supply', 'Herb Garden'];

  const [newOrder, setNewOrder] = useState({
    supplier: '',
    items: [] as { itemId: string; name: string; quantity: number; cost: number }[],
    notes: '',
    deliveryDate: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    reference: '',
    shippingCost: 0,
    taxRate: 0,
    discount: 0,
  });
  const [selectedItem, setSelectedItem] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemCost, setItemCost] = useState(0);

  const addItemToOrder = useCallback(() => {
    if (!selectedItem || itemQty <= 0) return;
    const invItem = items.find(i => i.id === selectedItem);
    if (!invItem) return;
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { itemId: selectedItem, name: invItem.name, quantity: itemQty, cost: itemCost || invItem.costPerUnit }]
    }));
    setSelectedItem('');
    setItemQty(1);
    setItemCost(0);
  }, [selectedItem, itemQty, itemCost, items]);

  const removeItem = useCallback((idx: number) => {
    setNewOrder(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  }, []);

  const createOrder = useCallback(() => {
    if (!newOrder.supplier || newOrder.items.length === 0) return;
    const subtotal = newOrder.items.reduce((sum, item) => sum + item.quantity * item.cost, 0);
    const shippingCost = newOrder.shippingCost || 0;
    const taxAmount = subtotal * ((newOrder.taxRate || 0) / 100);
    const discountAmount = subtotal * ((newOrder.discount || 0) / 100);
    const total = subtotal + shippingCost + taxAmount - discountAmount;
    const today = new Date().toISOString().split('T')[0];
    
    setPurchaseOrders(prev => {
      const order: PurchaseOrder = {
        id: `PO-${String(prev.length + 1).padStart(3, '0')}`,
        items: newOrder.items,
        subtotal,
        shippingCost,
        taxRate: newOrder.taxRate,
        taxAmount,
        discount: newOrder.discount,
        discountAmount,
        total,
        status: 'pending',
        supplier: newOrder.supplier,
        createdAt: today,
        notes: newOrder.notes,
        deliveryDate: newOrder.deliveryDate,
        priority: newOrder.priority,
        reference: newOrder.reference,
        timeline: [{ date: today, status: 'pending', notes: newOrder.notes || 'Order created' }]
      };
      return [order, ...prev];
    });
    setShowCreateModal(false);
    setNewOrder({ 
      supplier: '', 
      items: [], 
      notes: '', 
      deliveryDate: '', 
      priority: 'normal', 
      reference: '', 
      shippingCost: 0, 
      taxRate: 0, 
      discount: 0 
    });
  }, [newOrder]);

  // Calculate monthly purchases
  const getMonthlyPurchases = useCallback((year: number): MonthlyPurchase[] => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const result: MonthlyPurchase[] = [];

    for (let month = 0; month < 12; month++) {
      const monthOrders = purchaseOrders.filter(o => {
        const [oYear, oMonth] = o.createdAt.split('-').map(Number);
        return oYear === year && oMonth === month + 1 && o.status === 'received';
      });

      const itemsMap: Record<string, PurchasedItem> = {};
      let totalQty = 0;

      monthOrders.forEach(order => {
        order.items.forEach(item => {
          const invItem = items.find(i => i.id === item.itemId);
          if (!itemsMap[item.itemId]) {
            itemsMap[item.itemId] = {
              itemId: item.itemId,
              itemName: item.name,
              quantity: 0,
              unit: invItem?.unit || 'pieces',
              cost: item.cost,
              totalCost: 0
            };
          }
          itemsMap[item.itemId].quantity += item.quantity;
          itemsMap[item.itemId].totalCost += item.quantity * item.cost;
          totalQty += item.quantity;
        });
      });

      result.push({
        month: months[month],
        year,
        items: Object.values(itemsMap),
        totalQuantity: totalQty,
        totalCost: Object.values(itemsMap).reduce((s, i) => s + i.totalCost, 0)
      });
    }

    return result;
  }, [purchaseOrders, items]);

  // Calculate yearly purchases
  const getYearlyPurchases = useCallback((): YearlyPurchase[] => {
    const years = [...new Set(purchaseOrders.map(o => parseInt(o.createdAt.split('-')[0])))].sort();
    const result: YearlyPurchase[] = [];

    years.forEach(year => {
      const yearOrders = purchaseOrders.filter(o => {
        const [oYear] = o.createdAt.split('-').map(Number);
        return oYear === year && o.status === 'received';
      });

      const itemsMap: Record<string, PurchasedItem> = {};
      const monthlyData: Record<number, { month: string; quantity: number; cost: number }> = {};

      yearOrders.forEach(order => {
        const month = parseInt(order.createdAt.split('-')[1]) - 1;
        const monthName = new Date(year, month).toLocaleString('en-US', { month: 'short' });
        
        if (!monthlyData[month]) {
          monthlyData[month] = { month: monthName, quantity: 0, cost: 0 };
        }

        order.items.forEach(item => {
          if (!itemsMap[item.itemId]) {
            const invItem = items.find(i => i.id === item.itemId);
            itemsMap[item.itemId] = {
              itemId: item.itemId,
              itemName: item.name,
              quantity: 0,
              unit: invItem?.unit || 'pieces',
              cost: item.cost,
              totalCost: 0
            };
          }
          itemsMap[item.itemId].quantity += item.quantity;
          itemsMap[item.itemId].totalCost += item.quantity * item.cost;
          monthlyData[month].quantity += item.quantity;
          monthlyData[month].cost += item.quantity * item.cost;
        });
      });

      result.push({
        year,
        items: Object.values(itemsMap),
        totalQuantity: Object.values(itemsMap).reduce((s, i) => s + i.quantity, 0),
        totalCost: Object.values(itemsMap).reduce((s, i) => s + i.totalCost, 0),
        monthlyBreakdown: Object.values(monthlyData)
      });
    });

    return result;
  }, [purchaseOrders, items]);

  const monthlyData = useMemo(() => getMonthlyPurchases(selectedYear), [selectedYear, getMonthlyPurchases]);
  const yearlyData = useMemo(() => getYearlyPurchases(), [getYearlyPurchases]);
  const currentMonthData = useMemo(() => monthlyData[selectedMonth], [monthlyData, selectedMonth]);
  const currentYearData = useMemo(() => yearlyData.find(y => y.year === selectedYear), [yearlyData, selectedYear]);

  const topPurchasedMonth = useMemo(() => 
    [...(currentMonthData?.items || [])].sort((a, b) => b.quantity - a.quantity).slice(0, 5), 
  [currentMonthData]);
  
  const topPurchasedYear = useMemo(() => 
    [...(currentYearData?.items || [])].sort((a, b) => b.quantity - a.quantity).slice(0, 5), 
  [currentYearData]);

  const monthNames = useMemo(() => 
    ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  []);

  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter(o => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchesSupplier = supplierFilter === 'all' || o.supplier === supplierFilter;
      const matchesSearch = !searchTerm || o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSupplier && matchesSearch;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [purchaseOrders, statusFilter, supplierFilter, searchTerm]);

  const pendingTotal = useMemo(() => 
    purchaseOrders.filter(o => o.status === 'pending').reduce((sum, o) => sum + o.total, 0), 
  [purchaseOrders]);
  
  const orderedTotal = useMemo(() => 
    purchaseOrders.filter(o => o.status === 'ordered').reduce((sum, o) => sum + o.total, 0), 
  [purchaseOrders]);
  
  const receivedTotal = useMemo(() => 
    purchaseOrders.filter(o => o.status === 'received').reduce((sum, o) => sum + o.total, 0), 
  [purchaseOrders]);
  
  const usedTotal = useMemo(() => 
    purchaseOrders.filter(o => o.status === 'used').reduce((sum, o) => sum + o.total, 0), 
  [purchaseOrders]);
  
  const cancelledTotal = useMemo(() => 
    purchaseOrders.filter(o => o.status === 'cancelled').reduce((sum, o) => sum + o.total, 0), 
  [purchaseOrders]);

  return {
    // State
    items,
    view,
    setView,
    purchaseOrders,
    statusFilter,
    setStatusFilter,
    supplierFilter,
    setSupplierFilter,
    searchTerm,
    setSearchTerm,
    showCreateModal,
    setShowCreateModal,
    showDetailModal,
    setShowDetailModal,
    selectedOrder,
    setSelectedOrder,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    showQuickRestockModal,
    setShowQuickRestockModal,
    quickRestockItems,
    setQuickRestockItems,
    showReturnModal,
    setShowReturnModal,
    returnItems,
    setReturnItems,
    showReceiveModal,
    setShowReceiveModal,
    receiveItems,
    setReceiveItems,
    deliveryNotes,
    setDeliveryNotes,
    receivedBy,
    setReceivedBy,
    newOrder,
    setNewOrder,
    selectedItem,
    setSelectedItem,
    itemQty,
    setItemQty,
    itemCost,
    setItemCost,
    
    // Handlers
    addQuickRestockItem,
    updateQuickRestockQty,
    removeQuickRestockItem,
    submitQuickRestock,
    openReturnModal,
    updateReturnQuantity,
    updateReturnReason,
    submitReturn,
    openReceiveModal,
    updateReceiveQuantity,
    updateReceiveCost,
    updateReceiveBatch,
    updateReceiveExpiry,
    submitReceive,
    handleOrderStatusToOrdered,
    handleOrderStatusToReceived,
    handleOrderStatusToUsed,
    handleRestockOrder,
    handleCancelOrder,
    handleDeleteOrder,
    handleViewHistory,
    addItemToOrder,
    removeItem,
    createOrder,
    
    // Calculated values
    suppliers,
    monthlyData,
    yearlyData,
    currentMonthData,
    currentYearData,
    topPurchasedMonth,
    topPurchasedYear,
    monthNames,
    filteredOrders,
    pendingTotal,
    orderedTotal,
    receivedTotal,
    usedTotal,
    cancelledTotal,
  };
}

export default function PurchaseOrdersPage() {
  const {
    items,
    view,
    setView,
    purchaseOrders,
    statusFilter,
    setStatusFilter,
    supplierFilter,
    setSupplierFilter,
    searchTerm,
    setSearchTerm,
    showCreateModal,
    setShowCreateModal,
    showDetailModal,
    setShowDetailModal,
    selectedOrder,
    setSelectedOrder,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    showQuickRestockModal,
    setShowQuickRestockModal,
    quickRestockItems,
    setQuickRestockItems,
    showReturnModal,
    setShowReturnModal,
    returnItems,
    setReturnItems,
    showReceiveModal,
    setShowReceiveModal,
    receiveItems,
    setReceiveItems,
    deliveryNotes,
    setDeliveryNotes,
    receivedBy,
    setReceivedBy,
    newOrder,
    setNewOrder,
    selectedItem,
    setSelectedItem,
    itemQty,
    setItemQty,
    itemCost,
    setItemCost,
    
    addQuickRestockItem,
    updateQuickRestockQty,
    removeQuickRestockItem,
    submitQuickRestock,
    openReturnModal,
    updateReturnQuantity,
    updateReturnReason,
    submitReturn,
    openReceiveModal,
    updateReceiveQuantity,
    updateReceiveCost,
    updateReceiveBatch,
    updateReceiveExpiry,
    submitReceive,
    handleOrderStatusToOrdered,
    handleOrderStatusToReceived,
    handleOrderStatusToUsed,
    handleRestockOrder,
    handleCancelOrder,
    handleDeleteOrder,
    handleViewHistory,
    addItemToOrder,
    removeItem,
    createOrder,
    
    suppliers,
    monthlyData,
    yearlyData,
    currentMonthData,
    currentYearData,
    topPurchasedMonth,
    topPurchasedYear,
    monthNames,
    filteredOrders,
    pendingTotal,
    orderedTotal,
    receivedTotal,
    usedTotal,
    cancelledTotal,
  } = usePurchaseOrders();

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Purchase Orders & Analytics</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => setShowQuickRestockModal(true)}>
            ⚡ Quick Restock
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            + Create Order
          </button>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: '24px' }}>
        <button className={`filter-btn ${view === 'orders' ? 'active' : ''}`} onClick={() => setView('orders')}>Orders</button>
        <button className={`filter-btn ${view === 'monthly' ? 'active' : ''}`} onClick={() => setView('monthly')}>Monthly</button>
        <button className={`filter-btn ${view === 'yearly' ? 'active' : ''}`} onClick={() => setView('yearly')}>Yearly</button>
      </div>

      {view === 'orders' && (
        <>
            <div className="stat-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(6, 1fr)' }}>
            <div className="stat-card" style={{ background: '#f59e0b' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{purchaseOrders.filter(o => o.status === 'pending').length}</div>
              <div className="stat-label">Pending</div>
              <div className="mono" style={{ fontSize: '14px', marginTop: '8px' }}>{formatCurrency(pendingTotal)}</div>
            </div>
            <div className="stat-card" style={{ background: '#f97316' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{purchaseOrders.filter(o => o.status === 'ordered').length}</div>
              <div className="stat-label">Ordered</div>
              <div className="mono" style={{ fontSize: '14px', marginTop: '8px' }}>{formatCurrency(orderedTotal)}</div>
            </div>
            <div className="stat-card" style={{ background: '#171717', border: '1px solid #444' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{purchaseOrders.filter(o => o.status === 'received').length}</div>
              <div className="stat-label">Received</div>
              <div className="mono" style={{ fontSize: '14px', marginTop: '8px' }}>{formatCurrency(receivedTotal)}</div>
            </div>
            <div className="stat-card" style={{ background: '#f59e0b' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{purchaseOrders.filter(o => o.status === 'used').length}</div>
              <div className="stat-label">Used</div>
              <div className="mono" style={{ fontSize: '14px', marginTop: '8px' }}>{formatCurrency(usedTotal)}</div>
            </div>
            <div className="stat-card" style={{ background: '#f97316' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{purchaseOrders.filter(o => o.status === 'returned').length}</div>
              <div className="stat-label">Returned</div>
              <div className="mono" style={{ fontSize: '14px', marginTop: '8px' }}>{formatCurrency(purchaseOrders.filter(o => o.status === 'returned').reduce((sum, o) => sum + o.total, 0))}</div>
            </div>
            <div className="stat-card" style={{ background: '#ef4444' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{purchaseOrders.filter(o => o.status === 'cancelled').length}</div>
              <div className="stat-label">Cancelled</div>
              <div className="mono" style={{ fontSize: '14px', marginTop: '8px' }}>{formatCurrency(cancelledTotal)}</div>
            </div>
          </div>

          <div className="filter-bar">
            <input className="form-input" style={{ width: '250px' }} placeholder="Search orders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             <select className="form-select" style={{ width: '150px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
               <option value="all">All Status</option>
               <option value="pending">Pending</option>
               <option value="ordered">Ordered</option>
               <option value="received">Received</option>
               <option value="used">Used</option>
               <option value="partially_returned">Partially Returned</option>
               <option value="returned">Returned</option>
               <option value="cancelled">Cancelled</option>
             </select>
            <select className="form-select" style={{ width: '180px' }} value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)}>
              <option value="all">All Suppliers</option>
              {suppliers.map(s => (<option key={s} value={s}>{s}</option>))}
            </select>
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
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td className="mono" style={{ fontWeight: '600' }}>{order.id}</td>
                    <td>{order.createdAt}</td>
                    <td>{order.supplier}</td>
                     <td>
                       <div style={{ fontSize: '12px' }}>
                         {order.items.map((item, idx) => (
                           <div key={idx}>
                             {item.name} x{item.quantity}
                             {item.returned && item.returned > 0 && (
                               <span style={{ color: '#f97316', marginLeft: '6px' }}>({item.returned} returned)</span>
                             )}
                           </div>
                         ))}
                       </div>
                     </td>
                    <td className="mono" style={{ fontWeight: '600' }}>{formatCurrency(order.total)}</td>
                    <td>
                     <span className={`badge ${
                         order.status === 'pending' ? 'badge-pending' :
                         order.status === 'ordered' ? 'badge-in_progress' :
                         order.status === 'received' ? 'badge-available' :
                         order.status === 'used' ? 'badge-warning' :
                         order.status === 'partially_returned' ? 'badge-warning' :
                         order.status === 'returned' ? 'badge-warning' : 'badge-cancelled'
                       }`}>{order.status.replace('_', ' ')}</span>
                    </td>
                    <td>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                       {order.status === 'pending' && (
                         <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => handleOrderStatusToOrdered(order)}>Order</button>
                       )}
                       {(order.status === 'ordered' || order.status === 'partially_received') && (
                          <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: '#10b981', borderColor: '#10b981', color: 'white' }} onClick={() => openReceiveModal(order)}>📦 Receive</button>
                        )}
                       {order.status === 'received' && (
                         <>
                           <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => handleOrderStatusToUsed(order)}>Used</button>
                            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', borderColor: '#f97316', color: '#f97316' }} onClick={() => openReturnModal(order)}>↩️ Return</button>
                         </>
                       )}
                       {order.status === 'used' && (
                         <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => handleRestockOrder(order)}>🔄 Restock</button>
                       )}
                       <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => handleViewHistory(order)}>History</button>
                      
                      {/* Changes Options Dropdown */}
                      <div style={{ position: 'relative' }}>
                        <button className="btn btn-secondary" style={{ padding: '6px 8px', fontSize: '13px' }} onClick={(e) => {
                          e.stopPropagation();
                          const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                          dropdown.classList.toggle('show');
                        }}>⋮</button>
                        <div style={{ 
                          position: 'absolute', 
                          right: 0, 
                          top: '100%', 
                          backgroundColor: 'var(--bg-elevated)', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          minWidth: '140px',
                          zIndex: 100,
                          display: 'none',
                          flexDirection: 'column'
                        }} className="action-dropdown">
                          <button style={{ padding: '10px 16px', textAlign: 'left', border: 'none', background: 'none', width: '100%', cursor: 'pointer' }} 
                            onClick={() => alert('Edit order functionality')}>Edit Order</button>
                          <button style={{ padding: '10px 16px', textAlign: 'left', border: 'none', background: 'none', width: '100%', cursor: 'pointer' }} 
                            onClick={() => alert('Print order')}>Print</button>
                          <button style={{ padding: '10px 16px', textAlign: 'left', border: 'none', background: 'none', width: '100%', cursor: 'pointer' }} 
                            onClick={() => alert('Export PDF')}>Export PDF</button>
                          <button style={{ padding: '10px 16px', textAlign: 'left', border: 'none', background: 'none', width: '100%', cursor: 'pointer', color: 'var(--danger)' }} 
                            onClick={() => handleDeleteOrder(order.id)}>Delete</button>
                        </div>
                      </div>
                      
                      {order.status !== 'received' && order.status !== 'used' && (
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleCancelOrder(order)}>Cancel</button>
                      )}
                    </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'monthly' && (
        <>
          <div className="filter-bar" style={{ marginBottom: '24px' }}>
            <select className="form-select" style={{ width: '150px' }} value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
            <select className="form-select" style={{ width: '180px' }} value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
              {monthNames.map((month, idx) => (<option key={idx} value={idx}>{month} {selectedYear}</option>))}
            </select>
          </div>

          <div className="stat-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card" style={{ background: 'var(--primary)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentMonthData?.items.length || 0}</div>
              <div className="stat-label">Items Purchased</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentMonthData?.totalQuantity.toFixed(1) || 0}</div>
              <div className="stat-label">Total Units</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--danger)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{formatCurrency(currentMonthData?.totalCost || 0)}</div>
              <div className="stat-label">Total Spent</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '32px' }}>{formatCurrency((currentMonthData?.totalCost || 0) / (currentMonthData?.items.length || 1))}</div>
              <div className="stat-label">Avg/Item</div>
            </div>
          </div>

          <div className="grid-2">
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Top Purchased Items</h3>
              </div>
              <div style={{ padding: '24px' }}>
                {topPurchasedMonth.map((item, index) => (
                  <div key={item.itemId} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <span style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'white' }}>{index + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>{item.itemName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatCurrency(item.cost)}/{item.unit}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono" style={{ fontWeight: '600', fontSize: '18px' }}>{item.quantity.toFixed(1)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.unit}</div>
                    </div>
                  </div>
                ))}
                {topPurchasedMonth.length === 0 && <div className="empty-state"><div className="empty-state-text">No purchases</div></div>}
              </div>
            </div>

            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">All Items Purchased</h3>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Item</th><th>Qty</th><th>Unit Cost</th><th>Total</th><th>%</th></tr>
                  </thead>
                  <tbody>
                    {currentMonthData?.items.sort((a, b) => b.quantity - a.quantity).map(item => (
                      <tr key={item.itemId}>
                        <td>{item.itemName}</td>
                        <td className="mono">{item.quantity.toFixed(1)} {item.unit}</td>
                        <td className="mono">{formatCurrency(item.cost)}</td>
                        <td className="mono" style={{ color: 'var(--danger)' }}>{formatCurrency(item.totalCost)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${(item.quantity / (currentMonthData?.totalQuantity || 1)) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                            </div>
                            <span className="mono" style={{ fontSize: '12px' }}>{((item.quantity / (currentMonthData?.totalQuantity || 1)) * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="data-card" style={{ marginTop: '24px' }}>
            <div className="data-card-header">
              <h3 className="data-card-title">Monthly Trend - {selectedYear}</h3>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', height: '180px', alignItems: 'flex-end' }}>
                {monthlyData.map((month, idx) => (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '100%', height: `${Math.max(4, (month.totalCost / Math.max(...monthlyData.map(m => m.totalCost))) * 160)}px`, background: idx === selectedMonth ? 'var(--danger)' : 'var(--bg-elevated)', borderRadius: '4px 4px 0 0', minHeight: '4px', cursor: 'pointer' }} onClick={() => setSelectedMonth(idx)} />
                    <span className="mono" style={{ fontSize: '10px', color: idx === selectedMonth ? 'var(--danger)' : 'var(--text-muted)' }}>{month.month.slice(0, 3)}</span>
                    <span className="mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{month.totalQuantity.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {view === 'yearly' && (
        <>
          <div className="filter-bar" style={{ marginBottom: '24px' }}>
            <select className="form-select" style={{ width: '150px' }} value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
              {yearlyData.map(y => (<option key={y.year} value={y.year}>{y.year}</option>))}
            </select>
          </div>

          <div className="stat-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card" style={{ background: 'var(--primary)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentYearData?.items.length || 0}</div>
              <div className="stat-label">Items Purchased</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '32px' }}>{currentYearData?.totalQuantity.toFixed(0) || 0}</div>
              <div className="stat-label">Total Units</div>
            </div>
            <div className="stat-card" style={{ background: 'var(--danger)' }}>
              <div className="stat-value" style={{ fontSize: '32px' }}>{formatCurrency(currentYearData?.totalCost || 0)}</div>
              <div className="stat-label">Total Spent</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: '32px' }}>{formatCurrency((currentYearData?.totalCost || 0) / 12)}</div>
              <div className="stat-label">Avg/Month</div>
            </div>
          </div>

          <div className="grid-2">
            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Top Purchased Items - {selectedYear}</h3>
              </div>
              <div style={{ padding: '24px' }}>
                {topPurchasedYear.map((item, index) => (
                  <div key={item.itemId} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <span style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'white' }}>{index + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>{item.itemName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatCurrency(item.cost)}/{item.unit}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono" style={{ fontWeight: '600', fontSize: '18px' }}>{item.quantity.toFixed(0)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.unit}</div>
                    </div>
                  </div>
                ))}
                {topPurchasedYear.length === 0 && <div className="empty-state"><div className="empty-state-text">No purchases</div></div>}
              </div>
            </div>

            <div className="data-card">
              <div className="data-card-header">
                <h3 className="data-card-title">Monthly Breakdown - {selectedYear}</h3>
              </div>
              <div style={{ padding: '24px' }}>
                {currentYearData?.monthlyBreakdown.map((month, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                    <span style={{ width: '60px', fontSize: '14px' }}>{month.month}</span>
                    <div style={{ flex: 1, height: '24px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ width: `${(month.cost / (currentYearData?.totalCost || 1)) * 100}%`, height: '100%', background: 'var(--danger)', borderRadius: '4px', display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
                        <span className="mono" style={{ fontSize: '11px', color: 'white' }}>{month.quantity.toFixed(0)} units</span>
                      </div>
                    </div>
                    <span className="mono" style={{ width: '80px', textAlign: 'right', fontSize: '13px', color: 'var(--danger)' }}>{formatCurrency(month.cost)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="data-card" style={{ marginTop: '24px' }}>
            <div className="data-card-header">
              <h3 className="data-card-title">All Items Purchased - {selectedYear}</h3>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Item</th><th>Qty Purchased</th><th>Unit Cost</th><th>Total Cost</th><th>%</th><th>Avg/Month</th></tr>
                </thead>
                <tbody>
                  {currentYearData?.items.sort((a, b) => b.quantity - a.quantity).map(item => (
                    <tr key={item.itemId}>
                      <td>{item.itemName}</td>
                      <td className="mono">{item.quantity.toFixed(1)} {item.unit}</td>
                      <td className="mono">{formatCurrency(item.cost)}</td>
                      <td className="mono" style={{ color: 'var(--danger)', fontWeight: '600' }}>{formatCurrency(item.totalCost)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${(item.quantity / (currentYearData?.totalQuantity || 1)) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                          </div>
                          <span className="mono" style={{ fontSize: '12px' }}>{((item.quantity / (currentYearData?.totalQuantity || 1)) * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="mono">{(item.quantity / 12).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Create Order Modal (Advanced) */}
      <div className={`modal-overlay ${showCreateModal ? 'active' : ''}`} onClick={() => setShowCreateModal(false)}>
        <div className="modal" style={{ maxWidth: '850px', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Create Purchase Order (Advanced)</h2>
            <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
          </div>
          <div className="modal-body">
            
            {/* Low Stock Alert Section */}
            <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', marginBottom: '8px', color: '#d39e00' }}>⚠️ Items Below Reorder Level</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '100px', overflowY: 'auto' }}>
                {items.filter(i => i.quantity <= i.reorderLevel).map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => { setSelectedItem(item.id); setItemQty(Math.max(10, item.reorderLevel - item.quantity)); }}
                    style={{ padding: '6px 10px', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', fontSize: '13px' }}
                  >
                    <div style={{ fontWeight: '500' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>Stock: {item.quantity} | Reorder: +{Math.max(0, item.reorderLevel - item.quantity)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Supplier *</label>
                <select className="form-select" value={newOrder.supplier} onChange={e => setNewOrder({ ...newOrder, supplier: e.target.value })}>
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Expected Delivery</label>
                <input className="form-input" type="date" value={newOrder.deliveryDate || ''} onChange={e => setNewOrder({ ...newOrder, deliveryDate: e.target.value })} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={newOrder.priority || 'normal'} onChange={e => setNewOrder({ ...newOrder, priority: e.target.value as any })}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Reference Number</label>
                <input className="form-input" placeholder="Supplier PO # / Reference" value={newOrder.reference || ''} onChange={e => setNewOrder({ ...newOrder, reference: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Add Items</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <select className="form-select" style={{ flex: 2 }} value={selectedItem} onChange={e => setSelectedItem(e.target.value)}>
                  <option value="">Select Item</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} (Stock: {i.quantity})</option>)}
                </select>
                <input className="form-input" type="number" min="1" style={{ flex: 1 }} placeholder="Qty" value={itemQty} onChange={e => setItemQty(parseInt(e.target.value) || 1)} />
                <input className="form-input" type="number" step="0.01" style={{ flex: 1 }} placeholder="Unit Cost" value={itemCost} onChange={e => setItemCost(parseFloat(e.target.value) || 0)} />
                <button className="btn btn-primary" onClick={addItemToOrder}>+ Add</button>
              </div>

              {newOrder.items.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>Item</th><th>Qty</th><th>Unit Cost</th><th>Subtotal</th><th></th></tr>
                    </thead>
                    <tbody>
                      {newOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.name}</td>
                          <td>
                            <input 
                              type="number" 
                              min="1" 
                              value={item.quantity}
                              onChange={e => {
                                const qty = parseInt(e.target.value) || 1;
                                setNewOrder({ ...newOrder, items: newOrder.items.map((it, i) => i === idx ? { ...it, quantity: qty } : it) });
                              }}
                              style={{ width: '70px' }}
                              className="form-input"
                            />
                          </td>
                          <td className="mono">{formatCurrency(item.cost)}</td>
                          <td className="mono" style={{ fontWeight: '600' }}>{formatCurrency(item.quantity * item.cost)}</td>
                          <td><button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => removeItem(idx)}>✕</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--bg-elevated)', borderRadius: '8px' }}>
                    <div className="grid-3">
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Shipping Cost</label>
                        <input className="form-input" type="number" step="0.01" placeholder="0.00" value={newOrder.shippingCost || ''} onChange={e => setNewOrder({ ...newOrder, shippingCost: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Tax (%)</label>
                        <input className="form-input" type="number" step="0.1" placeholder="0" value={newOrder.taxRate || ''} onChange={e => setNewOrder({ ...newOrder, taxRate: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Discount (%)</label>
                        <input className="form-input" type="number" step="0.1" placeholder="0" value={newOrder.discount || ''} onChange={e => setNewOrder({ ...newOrder, discount: parseFloat(e.target.value) || 0 })} />
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '16px', textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Subtotal: {formatCurrency(newOrder.items.reduce((sum, item) => sum + item.quantity * item.cost, 0))}
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '700' }}>
                        Order Total: {formatCurrency(
                          newOrder.items.reduce((sum, item) => sum + item.quantity * item.cost, 0) 
                          + (newOrder.shippingCost || 0) 
                          + (newOrder.items.reduce((sum, item) => sum + item.quantity * item.cost, 0) * ((newOrder.taxRate || 0) / 100))
                          - (newOrder.items.reduce((sum, item) => sum + item.quantity * item.cost, 0) * ((newOrder.discount || 0) / 100))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Notes / Instructions</label>
              <textarea className="form-input" rows={3} value={newOrder.notes} onChange={e => setNewOrder({ ...newOrder, notes: e.target.value })} placeholder="Internal notes, delivery instructions, terms..." />
            </div>

            <div className="form-group">
              <label className="form-label">Attachments</label>
              <div style={{ border: '2px dashed var(--border)', borderRadius: '8px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📎</div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Click to attach documents (invoice, quotes)</div>
              </div>
            </div>
            
          </div>
          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn btn-secondary" onClick={() => { 
              setNewOrder({ 
                supplier: '', 
                items: [], 
                notes: '', 
                deliveryDate: '', 
                priority: 'normal', 
                reference: '', 
                shippingCost: 0, 
                taxRate: 0, 
                discount: 0 
              }); 
            }}>Reset</button>
            </div>
            <button className="btn btn-primary" onClick={createOrder} disabled={!newOrder.supplier || newOrder.items.length === 0}>
              Create Purchase Order
            </button>
          </div>
        </div>
      </div>

      {/* Purchase Order Detail / Item History Modal */}
      <div className={`modal-overlay ${showDetailModal ? 'active' : ''}`} onClick={() => setShowDetailModal(false)}>
        <div className="modal" style={{ backgroundColor: '#121212', border: 'none', width: '90%', maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header" style={{ borderBottom: '1px solid #333', paddingBottom: '24px' }}>
            <h2 className="modal-title" style={{ fontSize: '42px', fontWeight: '700' }}>Order History - {selectedOrder?.id}</h2>
            <button className="modal-close" onClick={() => setShowDetailModal(false)} style={{ width: '50px', height: '50px', fontSize: '28px' }}>×</button>
          </div>
          <div className="modal-body" style={{ padding: '32px' }}>
            {selectedOrder && (
              <>
                {/* Order Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#888', marginBottom: '6px' }}>Expected Delivery</div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{selectedOrder.deliveryDate || 'Not specified'}</div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#888', marginBottom: '6px' }}>Priority</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', textTransform: 'capitalize' }}>{selectedOrder.priority || 'normal'}</div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#888', marginBottom: '6px' }}>Reference Number</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', fontFamily: 'monospace' }}>{selectedOrder.reference || '-'}</div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#888', marginBottom: '6px' }}>Attachments</div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>📎 No attachments</div>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div style={{ padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '8px', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Pricing Breakdown</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                      <span>Subtotal</span>
                      <span style={{ fontWeight: '500' }}>{formatCurrency(selectedOrder.subtotal || selectedOrder.total)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                      <span>Shipping Cost</span>
                      <span style={{ fontWeight: '500' }}>{formatCurrency(selectedOrder.shippingCost || 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                      <span>Tax ({selectedOrder.taxRate || 0}%)</span>
                      <span style={{ fontWeight: '500' }}>{formatCurrency(selectedOrder.taxAmount || 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                      <span>Discount ({selectedOrder.discount || 0}%)</span>
                      <span style={{ fontWeight: '500', color: '#ef4444' }}>- {formatCurrency(selectedOrder.discountAmount || 0)}</span>
                    </div>
                    <div style={{ height: '1px', backgroundColor: '#333', margin: '8px 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '700' }}>
                      <span>Order Total</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Order Timeline</h3>

                <table className="data-table" style={{ marginBottom: '32px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#222' }}>
                      <th style={{ fontSize: '18px', color: '#888', fontWeight: '500', padding: '12px' }}>Date</th>
                      <th style={{ fontSize: '18px', color: '#888', fontWeight: '500', padding: '12px' }}>Status</th>
                      <th style={{ fontSize: '18px', color: '#888', fontWeight: '500', padding: '12px' }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.timeline && selectedOrder.timeline.length > 0 ? (
                      selectedOrder.timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((event, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                          <td style={{ fontSize: '20px', padding: '16px 12px' }}>{event.date}</td>
                          <td style={{ padding: '16px 12px' }}>
                            <span className={`badge ${
                              event.status === 'pending' ? 'badge-pending' :
                              event.status === 'ordered' ? 'badge-in_progress' :
                              event.status === 'received' ? 'badge-available' :
                              event.status === 'used' ? 'badge-warning' : 'badge-cancelled'
                            }`}>{event.status}</span>
                          </td>
                          <td style={{ fontSize: '20px', padding: '16px 12px' }}>{event.notes || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr style={{ borderBottom: '1px solid #333' }}>
                        <td style={{ fontSize: '20px', padding: '16px 12px' }}>{selectedOrder.createdAt}</td>
                        <td style={{ padding: '16px 12px' }}>
                        <span className={`badge ${
                          selectedOrder.status === 'pending' ? 'badge-pending' :
                          selectedOrder.status === 'ordered' ? 'badge-in_progress' :
                          selectedOrder.status === 'received' ? 'badge-available' :
                          selectedOrder.status === 'used' ? 'badge-warning' :
                          selectedOrder.status === 'returned' ? 'badge-warning' : 'badge-cancelled'
                        }`}>{selectedOrder.status}</span>
                        </td>
                        <td style={{ fontSize: '20px', padding: '16px 12px' }}>{selectedOrder.notes || '-'}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '16px', color: '#888', marginBottom: '8px' }}>Supplier: {selectedOrder.supplier}</div>
                  
                  <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>Items in this order</h3>

                   <table className="data-table">
                     <thead>
                       <tr style={{ backgroundColor: '#222' }}>
                         <th style={{ fontSize: '18px', color: '#888', fontWeight: '500', padding: '12px' }}>Item</th>
                         <th style={{ fontSize: '18px', color: '#888', fontWeight: '500', padding: '12px' }}>Ordered</th>
                         <th style={{ fontSize: '18px', color: '#888', fontWeight: '500', padding: '12px' }}>Received</th>
                         <th style={{ fontSize: '18px', color: '#888', fontWeight: '500', padding: '12px' }}>Returned</th>
                         <th style={{ fontSize: '18px', color: '#888', fontWeight: '500', padding: '12px' }}>Unit Cost</th>
                         <th style={{ fontSize: '18px', color: '#888', fontWeight: '500', padding: '12px' }}>Total</th>
                       </tr>
                     </thead>
                     <tbody>
                       {selectedOrder.items.map((item, idx) => (
                         <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                           <td style={{ fontSize: '20px', padding: '16px 12px' }}>{item.name}</td>
                           <td style={{ fontSize: '20px', padding: '16px 12px' }}>{item.quantity}</td>
                           <td style={{ fontSize: '20px', padding: '16px 12px' }}>{item.quantity - (item.returned || 0)}</td>
                           <td style={{ fontSize: '20px', padding: '16px 12px', color: '#f97316' }}>{item.returned || 0}</td>
                           <td style={{ fontSize: '20px', padding: '16px 12px' }}>{formatCurrency(item.cost)}</td>
                           <td style={{ fontSize: '20px', padding: '16px 12px', fontWeight: '600' }}>{formatCurrency((item.quantity - (item.returned || 0)) * item.cost)}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                  
                  <div style={{ textAlign: 'right', marginTop: '16px', fontSize: '24px', fontWeight: '600' }}>
                    Total: {formatCurrency(selectedOrder.total)}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>Notes</div>
                    <div style={{ fontSize: '18px' }}>{selectedOrder.notes}</div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="modal-footer" style={{ borderTop: 'none', justifyContent: 'flex-end', padding: '24px' }}>
            <button className="btn btn-secondary" style={{ padding: '16px 40px', fontSize: '24px' }} onClick={() => setShowDetailModal(false)}>Close</button>
          </div>
        </div>
      </div>

      <style>{`
        .action-dropdown.show {
          display: flex !important;
        }
        .action-dropdown button:hover {
          background-color: var(--bg-hover);
        }
      `}</style>

      {/* Quick Restock Modal */}
      <div className={`modal-overlay ${showQuickRestockModal ? 'active' : ''}`} onClick={() => setShowQuickRestockModal(false)}>
        <div className="modal" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">⚡ Quick Restock</h2>
            <button className="modal-close" onClick={() => setShowQuickRestockModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div style={{ marginBottom: '16px' }}>
              <div className="form-label">Select items to restock:</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', maxHeight: '300px', overflowY: 'auto', marginTop: '8px' }}>
                {items.map(item => (
                  <div
                    key={item.id}
                    onClick={() => addQuickRestockItem(item.id)}
                    style={{ 
                      padding: '12px', 
                      border: '1px solid var(--border)', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      backgroundColor: quickRestockItems.find(i => i.itemId === item.id) ? 'var(--primary)' : 'transparent',
                      color: quickRestockItems.find(i => i.itemId === item.id) ? 'white' : 'var(--text)',
                    }}
                  >
                    <div style={{ fontWeight: '500' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>Stock: {item.quantity} {item.unit}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {quickRestockItems.length > 0 && (
              <div>
                <div className="form-label">Selected items:</div>
                <table className="data-table" style={{ marginTop: '8px' }}>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {quickRestockItems.map(ri => {
                      const item = items.find(i => i.id === ri.itemId);
                      return (
                        <tr key={ri.itemId}>
                          <td>{item?.name}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={ri.quantity}
                              onChange={e => updateQuickRestockQty(ri.itemId, parseInt(e.target.value))}
                              style={{ width: '80px' }}
                              className="form-input"
                            />
                          </td>
                          <td>
                            <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={() => removeQuickRestockItem(ri.itemId)}>×</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowQuickRestockModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitQuickRestock} disabled={quickRestockItems.length === 0}>
              Restock {quickRestockItems.length} Items
            </button>
          </div>
        </div>
       </div>

      {/* Return Items Modal */}
      <div className={`modal-overlay ${showReturnModal ? 'active' : ''}`} onClick={() => setShowReturnModal(false)}>
        <div className="modal" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Return Items - {selectedOrder?.id}</h2>
            <button className="modal-close" onClick={() => setShowReturnModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-label">Select items to return (enter quantity less than or equal to remaining received):</div>
            <table className="data-table" style={{ marginTop: '12px' }}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Ordered</th>
                  <th>Remaining</th>
                  <th>Return Qty</th>
                  <th>Return Reason</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder?.items.map((item) => {
                  const returnItem = returnItems.find(ri => ri.itemId === item.itemId);
                  const remaining = item.quantity - (item.returned || 0);
                  return (
                    <tr key={item.itemId}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{remaining}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max={remaining}
                          value={returnItem?.quantity || 0}
                          onChange={e => updateReturnQuantity(item.itemId, parseInt(e.target.value) || 0)}
                          style={{ width: '80px' }}
                          className="form-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Reason for return..."
                          value={returnItem?.reason || ''}
                          onChange={e => updateReturnReason(item.itemId, e.target.value)}
                          className="form-input"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {returnItems.some(i => i.quantity > 0) && (
              <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--bg-elevated)', borderRadius: '8px' }}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>Return Summary</div>
                {returnItems.filter(i => i.quantity > 0).map(ri => {
                  const item = selectedOrder?.items.find(i => i.itemId === ri.itemId);
                  return (
                    <div key={ri.itemId} style={{ marginBottom: '4px' }}>
                      {item?.name}: {ri.quantity} units {ri.reason && `- ${ri.reason}`}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitReturn} disabled={returnItems.every(i => i.quantity === 0)}>
              Confirm Return {returnItems.filter(i => i.quantity > 0).length > 0 ? `(${returnItems.filter(i => i.quantity > 0).length} items)` : ''}
            </button>
          </div>
        </div>
       </div>

      {/* Receive Items Modal */}
      <div className={`modal-overlay ${showReceiveModal ? 'active' : ''}`} onClick={() => setShowReceiveModal(false)}>
        <div className="modal" style={{ maxWidth: '1000px' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">📦 Receive Order - {selectedOrder?.id}</h2>
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
            <table className="data-table" style={{ marginTop: '12px' }}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style={{ textAlign: 'right' }}>Ordered</th>
                  <th style={{ textAlign: 'right' }}>Remaining</th>
                  <th style={{ textAlign: 'right' }}>Receive Qty</th>
                  <th style={{ textAlign: 'right' }}>Actual Cost</th>
                  <th>Batch #</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {receiveItems.map(item => {
                  const orderItem = selectedOrder?.items.find(i => i.itemId === item.itemId);
                  const maxQty = (orderItem?.quantity || 0) - (orderItem?.received || 0);
                  return (
                    <tr key={item.itemId}>
                      <td>{orderItem?.name}</td>
                      <td style={{ textAlign: 'right' }}>{orderItem?.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{maxQty}</td>
                      <td style={{ textAlign: 'right', width: '100px' }}>
                        <input 
                          type="number" 
                          className="form-input" 
                          style={{ textAlign: 'right' }}
                          min={0} 
                          max={maxQty}
                          value={item.quantity} 
                          onChange={e => updateReceiveQuantity(item.itemId, parseInt(e.target.value) || 0)} 
                        />
                      </td>
                      <td style={{ textAlign: 'right', width: '120px' }}>
                        <input 
                          type="number" 
                          step="0.01"
                          className="form-input" 
                          style={{ textAlign: 'right' }}
                          min={0}
                          value={item.cost} 
                          onChange={e => updateReceiveCost(item.itemId, parseFloat(e.target.value) || 0)} 
                        />
                      </td>
                      <td style={{ width: '130px' }}>
                        <input 
                          type="text" 
                          className="form-input"
                          placeholder="Batch"
                          value={item.batchNumber} 
                          onChange={e => updateReceiveBatch(item.itemId, e.target.value)} 
                        />
                      </td>
                      <td style={{ width: '140px' }}>
                        <input 
                          type="date" 
                          className="form-input"
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
      </>
    );
  }