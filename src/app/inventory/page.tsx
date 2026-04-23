'use client';

import { useState } from 'react';

type TabType = 'overview' | 'stock' | 'movements' | 'purchase-orders' | 'forecasting' | 'waste' | 'suppliers' | 'counts' | 'transfers' | 'audit-logs';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minLevel: number;
  maxLevel: number;
  unitCost: number;
  location: string;
  lastUpdated: string;
}

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  date: string;
  user: string;
  notes: string;
}

interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  items: { itemId: string; name: string; ordered: number; received: number }[];
  orderDate: string;
  expectedDate: string;
  total: number;
}

interface ForecastItem {
  itemId: string;
  itemName: string;
  currentStock: number;
  weeklyUsage: number;
  projectedStockout: string;
  recommendedOrder: number;
}

interface WasteRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  reason: string;
  date: string;
  user: string;
  cost: number;
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  leadTime: number;
  status: 'active' | 'inactive';
}

interface InventoryCount {
  id: string;
  name: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  date: string;
  itemsCounted: number;
  totalItems: number;
  variance: number;
}

interface Transfer {
  id: string;
  fromLocation: string;
  toLocation: string;
  status: 'pending' | 'in-transit' | 'completed';
  items: { itemId: string; name: string; quantity: number }[];
  date: string;
}

interface AuditLog {
  id: string;
  action: string;
  itemId: string;
  itemName: string;
  previousValue: string;
  newValue: string;
  user: string;
  timestamp: string;
}

const mockItems: InventoryItem[] = [
  { id: '1', sku: 'INV-001', name: 'Organic Flour', category: 'Dry Goods', quantity: 125, minLevel: 50, maxLevel: 200, unitCost: 12.99, location: 'A-12', lastUpdated: '2026-04-22' },
  { id: '2', sku: 'INV-002', name: 'Olive Oil', category: 'Oils', quantity: 42, minLevel: 30, maxLevel: 100, unitCost: 8.50, location: 'B-07', lastUpdated: '2026-04-22' },
  { id: '3', sku: 'INV-003', name: 'Chicken Breast', category: 'Proteins', quantity: 18, minLevel: 25, maxLevel: 80, unitCost: 6.75, location: 'C-03', lastUpdated: '2026-04-21' },
  { id: '4', sku: 'INV-004', name: 'Fresh Tomatoes', category: 'Produce', quantity: 78, minLevel: 40, maxLevel: 150, unitCost: 2.25, location: 'D-01', lastUpdated: '2026-04-23' },
  { id: '5', sku: 'INV-005', name: 'Whole Milk', category: 'Dairy', quantity: 32, minLevel: 20, maxLevel: 60, unitCost: 4.50, location: 'E-05', lastUpdated: '2026-04-22' },
];

const mockMovements: StockMovement[] = [
  { id: '1', itemId: '1', itemName: 'Organic Flour', type: 'in', quantity: 50, date: '2026-04-23 09:15', user: 'John D.', notes: 'Restock delivery' },
  { id: '2', itemId: '3', itemName: 'Chicken Breast', type: 'out', quantity: 12, date: '2026-04-23 08:45', user: 'Sarah M.', notes: 'Kitchen production' },
  { id: '3', itemId: '4', itemName: 'Fresh Tomatoes', type: 'adjustment', quantity: -5, date: '2026-04-22 16:30', user: 'Mike T.', notes: 'Spoilage adjustment' },
  { id: '4', itemId: '2', itemName: 'Olive Oil', type: 'transfer', quantity: 10, date: '2026-04-22 14:00', user: 'Lisa K.', notes: 'Transfer to store 2' },
];

const mockPurchaseOrders: PurchaseOrder[] = [
  { id: 'PO-1001', supplierId: 'S001', supplierName: 'Fresh Farms Inc.', status: 'ordered', items: [
    { itemId: '4', name: 'Fresh Tomatoes', ordered: 100, received: 0 },
    { itemId: '1', name: 'Organic Flour', ordered: 50, received: 0 },
  ], orderDate: '2026-04-21', expectedDate: '2026-04-24', total: 874.50 },
  { id: 'PO-1002', supplierId: 'S002', supplierName: 'Quality Meats Ltd.', status: 'received', items: [
    { itemId: '3', name: 'Chicken Breast', ordered: 40, received: 40 },
  ], orderDate: '2026-04-18', expectedDate: '2026-04-20', total: 270.00 },
];

const mockForecasts: ForecastItem[] = [
  { itemId: '1', itemName: 'Organic Flour', currentStock: 125, weeklyUsage: 32, projectedStockout: '2026-05-15', recommendedOrder: 75 },
  { itemId: '3', itemName: 'Chicken Breast', currentStock: 18, weeklyUsage: 45, projectedStockout: '2026-04-26', recommendedOrder: 60 },
  { itemId: '5', itemName: 'Whole Milk', currentStock: 32, weeklyUsage: 28, projectedStockout: '2026-05-01', recommendedOrder: 30 },
];

const mockWaste: WasteRecord[] = [
  { id: '1', itemId: '4', itemName: 'Fresh Tomatoes', quantity: 8, reason: 'Spoilage', date: '2026-04-22', user: 'Mike T.', cost: 18.00 },
  { id: '2', itemId: '5', itemName: 'Whole Milk', quantity: 6, reason: 'Expired', date: '2026-04-21', user: 'Sarah M.', cost: 27.00 },
  { id: '3', itemId: '2', itemName: 'Olive Oil', quantity: 2, reason: 'Damaged packaging', date: '2026-04-20', user: 'John D.', cost: 17.00 },
];

const mockSuppliers: Supplier[] = [
  { id: 'S001', name: 'Fresh Farms Inc.', contact: 'Bob Wilson', email: 'orders@freshfarms.com', phone: '555-1234', leadTime: 3, status: 'active' },
  { id: 'S002', name: 'Quality Meats Ltd.', contact: 'Amanda Lee', email: 'sales@qualitymeats.com', phone: '555-5678', leadTime: 2, status: 'active' },
  { id: 'S003', name: 'Dairy Direct', contact: 'Tom Davis', email: 'support@dairydirect.com', phone: '555-9012', leadTime: 1, status: 'active' },
];

const mockCounts: InventoryCount[] = [
  { id: 'CNT-001', name: 'Monthly Full Count', status: 'completed', date: '2026-04-01', itemsCounted: 142, totalItems: 142, variance: -124.75 },
  { id: 'CNT-002', name: 'Weekly Perishables', status: 'scheduled', date: '2026-04-25', itemsCounted: 0, totalItems: 28, variance: 0 },
];

const mockTransfers: Transfer[] = [
  { id: 'TRF-001', fromLocation: 'Warehouse', toLocation: 'Main Kitchen', status: 'completed', items: [
    { itemId: '1', name: 'Organic Flour', quantity: 30 },
    { itemId: '2', name: 'Olive Oil', quantity: 15 },
  ], date: '2026-04-22' },
  { id: 'TRF-002', fromLocation: 'Main Kitchen', toLocation: 'Catering', status: 'pending', items: [
    { itemId: '3', name: 'Chicken Breast', quantity: 20 },
  ], date: '2026-04-23' },
];

const mockAuditLogs: AuditLog[] = [
  { id: '1', action: 'UPDATE_QUANTITY', itemId: '1', itemName: 'Organic Flour', previousValue: '75', newValue: '125', user: 'John D.', timestamp: '2026-04-23 09:15:22' },
  { id: '2', action: 'UPDATE_MIN_LEVEL', itemId: '3', itemName: 'Chicken Breast', previousValue: '20', newValue: '25', user: 'Admin', timestamp: '2026-04-22 11:30:45' },
  { id: '3', action: 'CREATE_ITEM', itemId: '6', itemName: 'Brown Rice', previousValue: '-', newValue: 'Created', user: 'Sarah M.', timestamp: '2026-04-22 09:05:12' },
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [items] = useState<InventoryItem[]>(mockItems);
  const [movements] = useState<StockMovement[]>(mockMovements);
  const [purchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [forecasts] = useState<ForecastItem[]>(mockForecasts);
  const [waste] = useState<WasteRecord[]>(mockWaste);
  const [suppliers] = useState<Supplier[]>(mockSuppliers);
  const [counts] = useState<InventoryCount[]>(mockCounts);
  const [transfers] = useState<Transfer[]>(mockTransfers);
  const [auditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: { key: TabType; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'stock', label: 'Stock Items' },
    { key: 'movements', label: 'Movements' },
    { key: 'purchase-orders', label: 'Purchase Orders' },
    { key: 'forecasting', label: 'Forecasting' },
    { key: 'waste', label: 'Waste Tracking' },
    { key: 'suppliers', label: 'Suppliers' },
    { key: 'counts', label: 'Inventory Counts' },
    { key: 'transfers', label: 'Transfers' },
    { key: 'audit-logs', label: 'Audit Logs' },
  ];

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
        <p className="text-2xl font-bold">{items.length}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-sm font-medium text-gray-500">Low Stock Alerts</h3>
        <p className="text-2xl font-bold text-red-600">{items.filter(i => i.quantity < i.minLevel).length}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-sm font-medium text-gray-500">Open Purchase Orders</h3>
        <p className="text-2xl font-bold text-blue-600">{purchaseOrders.filter(po => po.status === 'ordered').length}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-sm font-medium text-gray-500">Waste This Month</h3>
        <p className="text-2xl font-bold">${waste.reduce((sum, w) => sum + w.cost, 0).toFixed(2)}</p>
      </div>
      
      <div className="md:col-span-2 bg-white p-4 rounded-lg shadow border">
        <h3 className="font-semibold mb-3">Low Stock Items</h3>
        <div className="space-y-2">
          {items.filter(i => i.quantity < i.minLevel).map(item => (
            <div key={item.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
              <span className="font-medium">{item.name}</span>
              <span className="text-red-600">{item.quantity} / {item.minLevel}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="md:col-span-2 bg-white p-4 rounded-lg shadow border">
        <h3 className="font-semibold mb-3">Recent Movements</h3>
        <div className="space-y-2">
          {movements.slice(0, 3).map(mov => (
            <div key={mov.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
              <span>{mov.itemName}</span>
              <span className={mov.type === 'in' ? 'text-green-600' : 'text-red-600'}>
                {mov.type === 'in' ? '+' : '-'}{mov.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStockItems = () => (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold">Inventory Items</h3>
        <input
          type="text"
          placeholder="Search items..."
          className="px-3 py-2 border rounded text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">SKU</th>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-right font-medium">Quantity</th>
              <th className="px-4 py-3 text-right font-medium">Unit Cost</th>
              <th className="px-4 py-3 text-left font-medium">Location</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{item.sku}</td>
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right">${item.unitCost.toFixed(2)}</td>
                <td className="px-4 py-3">{item.location}</td>
                <td className="px-4 py-3">
                  {item.quantity < item.minLevel ? (
                    <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">Low Stock</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Good</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMovements = () => (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Stock Movements</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Item</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-right font-medium">Quantity</th>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {movements.map(mov => (
              <tr key={mov.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{mov.date}</td>
                <td className="px-4 py-3 font-medium">{mov.itemName}</td>
                <td className="px-4 py-3 capitalize">{mov.type}</td>
                <td className={`px-4 py-3 text-right font-medium ${mov.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                  {mov.type === 'in' ? '+' : '-'}{mov.quantity}
                </td>
                <td className="px-4 py-3">{mov.user}</td>
                <td className="px-4 py-3">{mov.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPurchaseOrders = () => (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Purchase Orders</h3>
      </div>
      <div className="divide-y">
        {purchaseOrders.map(po => (
          <div key={po.id} className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-semibold">{po.id}</span>
                <span className="ml-3 text-gray-500">{po.supplierName}</span>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                po.status === 'ordered' ? 'bg-blue-100 text-blue-700' : 
                po.status === 'received' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
              }`}>
                {po.status}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-3">
              Ordered: {po.orderDate} | Expected: {po.expectedDate} | Total: ${po.total.toFixed(2)}
            </div>
            <div className="space-y-1">
              {po.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span>{item.received} / {item.ordered}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderForecasting = () => (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Demand Forecasting</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Item</th>
              <th className="px-4 py-3 text-right font-medium">Current Stock</th>
              <th className="px-4 py-3 text-right font-medium">Weekly Usage</th>
              <th className="px-4 py-3 text-left font-medium">Projected Stockout</th>
              <th className="px-4 py-3 text-right font-medium">Recommended Order</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {forecasts.map(fc => (
              <tr key={fc.itemId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{fc.itemName}</td>
                <td className="px-4 py-3 text-right">{fc.currentStock}</td>
                <td className="px-4 py-3 text-right">{fc.weeklyUsage}</td>
                <td className="px-4 py-3">{fc.projectedStockout}</td>
                <td className="px-4 py-3 text-right font-medium text-blue-600">{fc.recommendedOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWaste = () => (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Waste Tracking</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Item</th>
              <th className="px-4 py-3 text-right font-medium">Quantity</th>
              <th className="px-4 py-3 text-left font-medium">Reason</th>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-right font-medium">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {waste.map(w => (
              <tr key={w.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{w.date}</td>
                <td className="px-4 py-3 font-medium">{w.itemName}</td>
                <td className="px-4 py-3 text-right">{w.quantity}</td>
                <td className="px-4 py-3">{w.reason}</td>
                <td className="px-4 py-3">{w.user}</td>
                <td className="px-4 py-3 text-right">${w.cost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSuppliers = () => (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Suppliers</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Contact</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Phone</th>
              <th className="px-4 py-3 text-right font-medium">Lead Time</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {suppliers.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.contact}</td>
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3">{s.phone}</td>
                <td className="px-4 py-3 text-right">{s.leadTime} days</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCounts = () => (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Inventory Counts</h3>
      </div>
      <div className="divide-y">
        {counts.map(count => (
          <div key={count.id} className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">{count.name}</div>
              <span className={`px-2 py-1 text-xs rounded ${
                count.status === 'completed' ? 'bg-green-100 text-green-700' :
                count.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {count.status}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Date: {count.date} | Items: {count.itemsCounted}/{count.totalItems}
              {count.status === 'completed' && <span className="ml-3">Variance: ${count.variance.toFixed(2)}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTransfers = () => (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Stock Transfers</h3>
      </div>
      <div className="divide-y">
        {transfers.map(tf => (
          <div key={tf.id} className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-semibold">{tf.id}</span>
                <span className="mx-2 text-gray-400">→</span>
                <span className="text-gray-600">{tf.fromLocation} → {tf.toLocation}</span>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                tf.status === 'completed' ? 'bg-green-100 text-green-700' :
                tf.status === 'in-transit' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {tf.status}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-2">Date: {tf.date}</div>
            <div className="space-y-1">
              {tf.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span>{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Audit Logs</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Timestamp</th>
              <th className="px-4 py-3 text-left font-medium">Action</th>
              <th className="px-4 py-3 text-left font-medium">Item</th>
              <th className="px-4 py-3 text-left font-medium">Previous</th>
              <th className="px-4 py-3 text-left font-medium">New</th>
              <th className="px-4 py-3 text-left font-medium">User</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {auditLogs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{log.timestamp}</td>
                <td className="px-4 py-3 font-medium">{log.action}</td>
                <td className="px-4 py-3">{log.itemName}</td>
                <td className="px-4 py-3 text-gray-500">{log.previousValue}</td>
                <td className="px-4 py-3 font-medium">{log.newValue}</td>
                <td className="px-4 py-3">{log.user}</td>
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
      case 'stock': return renderStockItems();
      case 'movements': return renderMovements();
      case 'purchase-orders': return renderPurchaseOrders();
      case 'forecasting': return renderForecasting();
      case 'waste': return renderWaste();
      case 'suppliers': return renderSuppliers();
      case 'counts': return renderCounts();
      case 'transfers': return renderTransfers();
      case 'audit-logs': return renderAuditLogs();
      default: return renderOverview();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Inventory Management</h1>
        <p className="text-gray-600">Track stock levels, movements, orders, and inventory operations.</p>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white shadow text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {renderActiveTab()}
    </div>
  );
}