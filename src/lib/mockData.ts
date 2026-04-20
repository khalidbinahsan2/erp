import { MenuItem, Order, Table, InventoryItem, Staff, Reservation } from '@/types';

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Truffle Risotto',
    description: 'Creamy arborio rice with black truffle and parmesan',
    category: 'Main Courses',
    price: 28.00,
    prepTime: 25,
    available: true,
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=300&h=200&fit=crop',
    dietary: ['Vegetarian']
  },
  {
    id: '2',
    name: 'Grilled Salmon',
    description: 'Atlantic salmon with lemon butter sauce and asparagus',
    category: 'Main Courses',
    price: 32.00,
    prepTime: 20,
    available: true,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop',
    dietary: ['Gluten-Free']
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Romaine lettuce, croutons, parmesan with classic dressing',
    category: 'Appetizers',
    price: 14.00,
    prepTime: 10,
    available: true,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=300&h=200&fit=crop',
    dietary: []
  },
  {
    id: '4',
    name: 'Wagyu Burger',
    description: 'Premium wagyu beef patty with truffle aioli and brioche bun',
    category: 'Main Courses',
    price: 26.00,
    prepTime: 18,
    available: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
    dietary: []
  },
  {
    id: '5',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with espresso-soaked ladyfingers',
    category: 'Desserts',
    price: 12.00,
    prepTime: 5,
    available: true,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=200&fit=crop',
    dietary: ['Vegetarian']
  },
  {
    id: '6',
    name: 'Spicy Ramen',
    description: 'Rich pork broth with noodles, chashu, and soft-boiled egg',
    category: 'Main Courses',
    price: 22.00,
    prepTime: 15,
    available: true,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop',
    dietary: ['Spicy']
  },
  {
    id: '7',
    name: 'Bruschetta',
    description: 'Toasted bread with fresh tomatoes, basil, and garlic',
    category: 'Appetizers',
    price: 10.00,
    prepTime: 8,
    available: true,
    image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=300&h=200&fit=crop',
    dietary: ['Vegan']
  },
  {
    id: '8',
    name: 'Craft Lemonade',
    description: 'Fresh-squeezed lemonade with mint',
    category: 'Beverages',
    price: 6.00,
    prepTime: 3,
    available: true,
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=300&h=200&fit=crop',
    dietary: ['Vegan', 'Gluten-Free']
  },
  {
    id: '9',
    name: 'Vegan Buddha Bowl',
    description: 'Quinoa, roasted vegetables, avocado, and tahini dressing',
    category: 'Main Courses',
    price: 19.00,
    prepTime: 15,
    available: true,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
    dietary: ['Vegan', 'Gluten-Free']
  },
  {
    id: '10',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center and vanilla ice cream',
    category: 'Desserts',
    price: 14.00,
    prepTime: 12,
    available: false,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&h=200&fit=crop',
    dietary: ['Vegetarian']
  }
];

export const orders: Order[] = [
  {
    id: 'ORD-001',
    tableId: '1',
    tableNumber: 5,
    items: [
      { menuItemId: '1', name: 'Truffle Risotto', quantity: 2, price: 28.00 },
      { menuItemId: '8', name: 'Craft Lemonade', quantity: 2, price: 6.00 }
    ],
    total: 68.00,
    status: 'in_progress',
    createdAt: new Date(Date.now() - 30 * 60000),
    specialInstructions: 'Extra cheese on risotto'
  },
  {
    id: 'ORD-002',
    tableId: '2',
    tableNumber: 8,
    items: [
      { menuItemId: '4', name: 'Wagyu Burger', quantity: 1, price: 26.00 },
      { menuItemId: '3', name: 'Caesar Salad', quantity: 1, price: 14.00 }
    ],
    total: 40.00,
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60000)
  },
  {
    id: 'ORD-003',
    tableId: '3',
    tableNumber: 12,
    items: [
      { menuItemId: '2', name: 'Grilled Salmon', quantity: 1, price: 32.00 },
      { menuItemId: '5', name: 'Tiramisu', quantity: 1, price: 12.00 }
    ],
    total: 44.00,
    status: 'completed',
    createdAt: new Date(Date.now() - 90 * 60000)
  },
  {
    id: 'ORD-004',
    tableId: '4',
    tableNumber: 3,
    items: [
      { menuItemId: '6', name: 'Spicy Ramen', quantity: 3, price: 22.00 }
    ],
    total: 66.00,
    status: 'ready',
    createdAt: new Date(Date.now() - 20 * 60000)
  },
  {
    id: 'ORD-005',
    tableId: '5',
    tableNumber: 1,
    items: [
      { menuItemId: '7', name: 'Bruschetta', quantity: 2, price: 10.00 },
      { menuItemId: '9', name: 'Vegan Buddha Bowl', quantity: 1, price: 19.00 }
    ],
    total: 39.00,
    status: 'cancelled',
    createdAt: new Date(Date.now() - 120 * 60000),
    specialInstructions: 'Customer changed mind'
  },
  {
    id: 'ORD-006',
    tableId: '6',
    tableNumber: 15,
    items: [
      { menuItemId: '4', name: 'Wagyu Burger', quantity: 2, price: 26.00 },
      { menuItemId: '8', name: 'Craft Lemonade', quantity: 2, price: 6.00 },
      { menuItemId: '5', name: 'Tiramisu', quantity: 1, price: 12.00 }
    ],
    total: 70.00,
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60000)
  }
];

export const tables: Table[] = [
  { id: '1', number: 1, capacity: 2, status: 'available' },
  { id: '2', number: 2, capacity: 4, status: 'occupied', currentOrderId: 'ORD-002' },
  { id: '3', number: 3, capacity: 4, status: 'occupied', currentOrderId: 'ORD-004' },
  { id: '4', number: 4, capacity: 6, status: 'reserved' },
  { id: '5', number: 5, capacity: 2, status: 'occupied', currentOrderId: 'ORD-001' },
  { id: '6', number: 6, capacity: 8, status: 'available' },
  { id: '7', number: 7, capacity: 4, status: 'available' },
  { id: '8', number: 8, capacity: 6, status: 'reserved' },
  { id: '9', number: 9, capacity: 2, status: 'available' },
  { id: '10', number: 10, capacity: 4, status: 'available' },
  { id: '11', number: 11, capacity: 6, status: 'occupied' },
  { id: '12', number: 12, capacity: 8, status: 'available' },
  { id: '13', number: 13, capacity: 2, status: 'reserved' },
  { id: '14', number: 14, capacity: 4, status: 'available' },
  { id: '15', number: 15, capacity: 10, status: 'occupied', currentOrderId: 'ORD-006' }
];

export const inventoryItems: InventoryItem[] = [
  { id: '1', name: 'Arborio Rice', category: 'Ingredients', quantity: 15, unit: 'kg', reorderLevel: 5, costPerUnit: 4.50 },
  { id: '2', name: 'Atlantic Salmon', category: 'Ingredients', quantity: 8, unit: 'kg', reorderLevel: 3, costPerUnit: 18.00 },
  { id: '3', name: 'Wagyu Beef', category: 'Ingredients', quantity: 12, unit: 'kg', reorderLevel: 4, costPerUnit: 45.00 },
  { id: '4', name: 'Parmesan Cheese', category: 'Ingredients', quantity: 3, unit: 'kg', reorderLevel: 2, costPerUnit: 22.00 },
  { id: '5', name: 'Olive Oil', category: 'Ingredients', quantity: 20, unit: 'liters', reorderLevel: 5, costPerUnit: 8.00 },
  { id: '6', name: 'Ramen Noodles', category: 'Ingredients', quantity: 25, unit: 'kg', reorderLevel: 10, costPerUnit: 3.50 },
  { id: '7', name: 'Napkins', category: 'Supplies', quantity: 500, unit: 'pieces', reorderLevel: 100, costPerUnit: 0.10 },
  { id: '8', name: 'To-Go Containers', category: 'Supplies', quantity: 150, unit: 'pieces', reorderLevel: 50, costPerUnit: 0.75 },
  { id: '9', name: 'House Red Wine', category: 'Beverages', quantity: 36, unit: 'bottles', reorderLevel: 12, costPerUnit: 8.00 },
  { id: '10', name: 'Sparkling Water', category: 'Beverages', quantity: 48, unit: 'bottles', reorderLevel: 24, costPerUnit: 1.50 },
  { id: '11', name: 'Black Truffle', category: 'Ingredients', quantity: 0.5, unit: 'kg', reorderLevel: 0.3, costPerUnit: 200.00 },
  { id: '12', name: 'Lettuce', category: 'Ingredients', quantity: 2, unit: 'kg', reorderLevel: 5, costPerUnit: 2.00 },
  { id: '13', name: 'Tomatoes', category: 'Ingredients', quantity: 8, unit: 'kg', reorderLevel: 4, costPerUnit: 3.00 },
  { id: '14', name: 'Lemon', category: 'Ingredients', quantity: 30, unit: 'pieces', reorderLevel: 15, costPerUnit: 0.40 },
  { id: '15', name: 'Mint Leaves', category: 'Ingredients', quantity: 0.5, unit: 'kg', reorderLevel: 0.3, costPerUnit: 15.00 }
];

export const staff: Staff[] = [
  {
    id: '1',
    name: 'Marcus Chen',
    role: 'Manager',
    phone: '(555) 123-4567',
    email: 'marcus@restaurant.com',
    status: 'active',
    schedule: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', startTime: '09:00', endTime: '17:00' }
    ]
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'Chef',
    phone: '(555) 234-5678',
    email: 'sarah@restaurant.com',
    status: 'active',
    schedule: [
      { day: 'Monday', startTime: '10:00', endTime: '18:00' },
      { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
      { day: 'Wednesday', startTime: '10:00', endTime: '18:00' },
      { day: 'Thursday', startTime: '10:00', endTime: '18:00' },
      { day: 'Friday', startTime: '10:00', endTime: '18:00' }
    ]
  },
  {
    id: '3',
    name: 'James Wilson',
    role: 'Server',
    phone: '(555) 345-6789',
    email: 'james@restaurant.com',
    status: 'active',
    schedule: [
      { day: 'Monday', startTime: '16:00', endTime: '23:00' },
      { day: 'Tuesday', startTime: '16:00', endTime: '23:00' },
      { day: 'Friday', startTime: '16:00', endTime: '23:00' },
      { day: 'Saturday', startTime: '16:00', endTime: '23:00' },
      { day: 'Sunday', startTime: '16:00', endTime: '23:00' }
    ]
  },
  {
    id: '4',
    name: 'Emily Davis',
    role: 'Server',
    phone: '(555) 456-7890',
    email: 'emily@restaurant.com',
    status: 'active',
    schedule: [
      { day: 'Wednesday', startTime: '16:00', endTime: '23:00' },
      { day: 'Thursday', startTime: '16:00', endTime: '23:00' },
      { day: 'Friday', startTime: '16:00', endTime: '23:00' },
      { day: 'Saturday', startTime: '16:00', endTime: '23:00' }
    ]
  },
  {
    id: '5',
    name: 'Michael Brown',
    role: 'Cashier',
    phone: '(555) 567-8901',
    email: 'michael@restaurant.com',
    status: 'active',
    schedule: [
      { day: 'Monday', startTime: '11:00', endTime: '19:00' },
      { day: 'Tuesday', startTime: '11:00', endTime: '19:00' },
      { day: 'Wednesday', startTime: '11:00', endTime: '19:00' },
      { day: 'Thursday', startTime: '11:00', endTime: '19:00' },
      { day: 'Friday', startTime: '11:00', endTime: '19:00' }
    ]
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    role: 'Host',
    phone: '(555) 678-9012',
    email: 'lisa@restaurant.com',
    status: 'active',
    schedule: [
      { day: 'Thursday', startTime: '17:00', endTime: '22:00' },
      { day: 'Friday', startTime: '17:00', endTime: '23:00' },
      { day: 'Saturday', startTime: '17:00', endTime: '23:00' },
      { day: 'Sunday', startTime: '17:00', endTime: '22:00' }
    ]
  },
  {
    id: '7',
    name: 'David Martinez',
    role: 'Chef',
    phone: '(555) 789-0123',
    email: 'david@restaurant.com',
    status: 'inactive',
    schedule: []
  }
];

export const reservations: Reservation[] = [
  {
    id: 'RES-001',
    customerName: 'Robert Taylor',
    phone: '(555) 111-2222',
    dateTime: new Date(Date.now() + 2 * 60 * 60000),
    partySize: 4,
    tableId: '4',
    tableNumber: 4,
    status: 'confirmed'
  },
  {
    id: 'RES-002',
    customerName: 'Jennifer Lee',
    phone: '(555) 333-4444',
    dateTime: new Date(Date.now() + 3 * 60 * 60000),
    partySize: 6,
    tableId: '8',
    tableNumber: 8,
    status: 'confirmed'
  },
  {
    id: 'RES-003',
    customerName: 'William Garcia',
    phone: '(555) 555-6666',
    dateTime: new Date(Date.now() + 5 * 60 * 60000),
    partySize: 2,
    tableId: '13',
    tableNumber: 13,
    status: 'confirmed'
  },
  {
    id: 'RES-004',
    customerName: 'Amanda White',
    phone: '(555) 777-8888',
    dateTime: new Date(Date.now() - 60 * 60000),
    partySize: 8,
    tableId: '4',
    tableNumber: 4,
    status: 'completed'
  }
];

export const categories = ['Appetizers', 'Main Courses', 'Desserts', 'Beverages', 'Specials'];
export const roles = ['Manager', 'Chef', 'Server', 'Cashier', 'Host'];
