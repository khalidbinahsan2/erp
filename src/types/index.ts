export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  prepTime: number;
  available: boolean;
  image: string;
  dietary: string[];
  costPerUnit?: number;
  profitPerUnit?: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'in_progress' | 'ready' | 'completed' | 'cancelled';
  createdAt: Date;
  specialInstructions?: string;
  customerId?: string;
  customerName?: string;
  paymentStatus?: 'unpaid' | 'paid' | 'partial';
  paymentMethod?: 'cash' | 'card' | 'online';
  paidAmount?: number;
  paymentDate?: string;
  changeGiven?: number;
  tip?: number;
}

export interface Payment {
  id: string;
  orderId: string;
  customerId?: string;
  amount: number;
  method: 'cash' | 'card' | 'online';
  status: 'completed' | 'refunded' | 'failed';
  transactionId?: string;
  createdAt: Date;
}

export interface Customer {
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

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  costPerUnit: number;
  salePrice?: number;
}

export interface Shift {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  schedule: Shift[];
  pin?: string;
  salary?: {
    hourlyRate: number;
    hoursWorked: number;
    overtimeHours: number;
    monthlySalary: number;
  };
}

export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  dateTime: Date;
  partySize: number;
  tableId: string;
  tableNumber: number;
  status: 'confirmed' | 'seated' | 'completed' | 'cancelled';
}

export type KDSPriority = 'high' | 'medium' | 'low';

export type KDSStatus = 'received' | 'preparing' | 'cooking' | 'plating' | 'ready' | 'served';

export type OrderType = 'dine-in' | 'online' | 'takeout';

export interface KDSOrder {
  id: string;
  orderType: OrderType;
  tableNumber?: number;
  items: OrderItem[];
  total: number;
  status: KDSStatus;
  createdAt: Date;
  priority: KDSPriority;
  specialInstructions?: string;
  estimatedPrepTime: number;
  actualPrepTime?: number;
  assignedChef?: string;
  rushOrder?: boolean;
}

export interface Chef {
  id: string;
  name: string;
  station: string;
  ticketsCompleted: number;
  avgPrepTime: number;
  targetPrepTime: number;
  efficiency: number;
  active: boolean;
}

export interface SmartOven {
  id: string;
  name: string;
  temperature: number;
  targetTemp: number;
  cookingProgress: number;
  recipe: string;
  timeRemaining: number;
  status: 'idle' | 'preheating' | 'cooking' | 'completed';
  utilization: number;
  lastMaintenance: Date;
}

export interface EquipmentAlert {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'maintenance' | 'error' | 'warning';
  message: string;
  severity: 'high' | 'medium' | 'low';
  createdAt: Date;
}
