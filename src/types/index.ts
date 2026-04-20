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
