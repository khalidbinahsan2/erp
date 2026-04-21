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

const now = new Date();
const baseTime = now.getTime();

export const orders: Order[] = [
  // Current month (April 2026)
  {
    id: 'ORD-001',
    tableId: '1',
    tableNumber: 5,
    items: [
      { menuItemId: '1', name: 'Truffle Risotto', quantity: 2, price: 28.00 },
      { menuItemId: '8', name: 'Craft Lemonade', quantity: 2, price: 6.00 }
    ],
    total: 68.00,
    status: 'completed',
    createdAt: new Date(baseTime - 30 * 60000),
    customerId: '1',
    customerName: 'John Smith'
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
    status: 'completed',
    createdAt: new Date(baseTime - 5 * 60000),
    customerId: '2',
    customerName: 'Sarah Johnson'
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
    createdAt: new Date(baseTime - 90 * 60000),
    customerId: '4',
    customerName: 'Emily Davis'
  },
  {
    id: 'ORD-004',
    tableId: '4',
    tableNumber: 3,
    items: [
      { menuItemId: '6', name: 'Spicy Ramen', quantity: 3, price: 22.00 }
    ],
    total: 66.00,
    status: 'completed',
    createdAt: new Date(baseTime - 20 * 60000),
    customerId: '6',
    customerName: 'Jennifer Lee'
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
    status: 'completed',
    createdAt: new Date(baseTime - 120 * 60000),
    customerId: '3',
    customerName: 'Michael Brown'
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
    status: 'completed',
    createdAt: new Date(baseTime - 2 * 60000),
    customerId: '5',
    customerName: 'Robert Wilson'
  },

  // March 2026 orders
  { id: 'ORD-007', tableId: '1', tableNumber: 3, items: [{ menuItemId: '1', name: 'Truffle Risotto', quantity: 1, price: 28.00 }, { menuItemId: '8', name: 'Craft Lemonade', quantity: 1, price: 6.00 }], total: 34.00, status: 'completed', createdAt: new Date(2026, 2, 15, 12, 30) },
  { id: 'ORD-008', tableId: '2', tableNumber: 7, items: [{ menuItemId: '4', name: 'Wagyu Burger', quantity: 2, price: 26.00 }, { menuItemId: '3', name: 'Caesar Salad', quantity: 2, price: 14.00 }], total: 80.00, status: 'completed', createdAt: new Date(2026, 2, 15, 13, 45) },
  { id: 'ORD-009', tableId: '3', tableNumber: 5, items: [{ menuItemId: '2', name: 'Grilled Salmon', quantity: 2, price: 32.00 }, { menuItemId: '5', name: 'Tiramisu', quantity: 2, price: 12.00 }], total: 88.00, status: 'completed', createdAt: new Date(2026, 2, 16, 19, 0) },
  { id: 'ORD-010', tableId: '4', tableNumber: 9, items: [{ menuItemId: '6', name: 'Spicy Ramen', quantity: 4, price: 22.00 }], total: 88.00, status: 'completed', createdAt: new Date(2026, 2, 17, 12, 15) },
  { id: 'ORD-011', tableId: '5', tableNumber: 2, items: [{ menuItemId: '7', name: 'Bruschetta', quantity: 3, price: 10.00 }, { menuItemId: '9', name: 'Vegan Buddha Bowl', quantity: 2, price: 19.00 }], total: 68.00, status: 'completed', createdAt: new Date(2026, 2, 18, 20, 30) },
  { id: 'ORD-012', tableId: '6', tableNumber: 11, items: [{ menuItemId: '1', name: 'Truffle Risotto', quantity: 3, price: 28.00 }, { menuItemId: '8', name: 'Craft Lemonade', quantity: 3, price: 6.00 }], total: 102.00, status: 'completed', createdAt: new Date(2026, 2, 20, 18, 0) },
  { id: 'ORD-013', tableId: '7', tableNumber: 4, items: [{ menuItemId: '4', name: 'Wagyu Burger', quantity: 1, price: 26.00 }, { menuItemId: '5', name: 'Tiramisu', quantity: 1, price: 12.00 }], total: 38.00, status: 'completed', createdAt: new Date(2026, 2, 22, 13, 0) },
  { id: 'ORD-014', tableId: '8', tableNumber: 6, items: [{ menuItemId: '2', name: 'Grilled Salmon', quantity: 1, price: 32.00 }, { menuItemId: '3', name: 'Caesar Salad', quantity: 1, price: 14.00 }], total: 46.00, status: 'completed', createdAt: new Date(2026, 2, 25, 19, 30) },
  { id: 'ORD-015', tableId: '9', tableNumber: 8, items: [{ menuItemId: '6', name: 'Spicy Ramen', quantity: 2, price: 22.00 }, { menuItemId: '8', name: 'Craft Lemonade', quantity: 2, price: 6.00 }], total: 56.00, status: 'completed', createdAt: new Date(2026, 2, 28, 20, 0) },

  // February 2026 orders
  { id: 'ORD-016', tableId: '1', tableNumber: 1, items: [{ menuItemId: '1', name: 'Truffle Risotto', quantity: 2, price: 28.00 }], total: 56.00, status: 'completed', createdAt: new Date(2026, 1, 5, 12, 0) },
  { id: 'ORD-017', tableId: '2', tableNumber: 4, items: [{ menuItemId: '4', name: 'Wagyu Burger', quantity: 3, price: 26.00 }, { menuItemId: '3', name: 'Caesar Salad', quantity: 1, price: 14.00 }], total: 92.00, status: 'completed', createdAt: new Date(2026, 1, 8, 13, 30) },
  { id: 'ORD-018', tableId: '3', tableNumber: 6, items: [{ menuItemId: '2', name: 'Grilled Salmon', quantity: 2, price: 32.00 }, { menuItemId: '5', name: 'Tiramisu', quantity: 2, price: 12.00 }], total: 88.00, status: 'completed', createdAt: new Date(2026, 1, 10, 19, 0) },
  { id: 'ORD-019', tableId: '4', tableNumber: 10, items: [{ menuItemId: '7', name: 'Bruschetta', quantity: 4, price: 10.00 }, { menuItemId: '9', name: 'Vegan Buddha Bowl', quantity: 2, price: 19.00 }], total: 78.00, status: 'completed', createdAt: new Date(2026, 1, 12, 18, 45) },
  { id: 'ORD-020', tableId: '5', tableNumber: 2, items: [{ menuItemId: '6', name: 'Spicy Ramen', quantity: 5, price: 22.00 }], total: 110.00, status: 'completed', createdAt: new Date(2026, 1, 15, 12, 30) },
  { id: 'ORD-021', tableId: '6', tableNumber: 8, items: [{ menuItemId: '1', name: 'Truffle Risotto', quantity: 1, price: 28.00 }, { menuItemId: '8', name: 'Craft Lemonade', quantity: 1, price: 6.00 }], total: 34.00, status: 'completed', createdAt: new Date(2026, 1, 18, 20, 0) },
  { id: 'ORD-022', tableId: '7', tableNumber: 5, items: [{ menuItemId: '4', name: 'Wagyu Burger', quantity: 2, price: 26.00 }, { menuItemId: '5', name: 'Tiramisu', quantity: 1, price: 12.00 }], total: 64.00, status: 'completed', createdAt: new Date(2026, 1, 22, 13, 15) },
  { id: 'ORD-023', tableId: '8', tableNumber: 12, items: [{ menuItemId: '2', name: 'Grilled Salmon', quantity: 3, price: 32.00 }], total: 96.00, status: 'completed', createdAt: new Date(2026, 1, 25, 19, 30) },
  { id: 'ORD-024', tableId: '9', tableNumber: 3, items: [{ menuItemId: '3', name: 'Caesar Salad', quantity: 4, price: 14.00 }], total: 56.00, status: 'completed', createdAt: new Date(2026, 1, 28, 18, 0) },

  // January 2026 orders
  { id: 'ORD-025', tableId: '1', tableNumber: 7, items: [{ menuItemId: '1', name: 'Truffle Risotto', quantity: 3, price: 28.00 }, { menuItemId: '5', name: 'Tiramisu', quantity: 2, price: 12.00 }], total: 108.00, status: 'completed', createdAt: new Date(2026, 0, 5, 12, 30) },
  { id: 'ORD-026', tableId: '2', tableNumber: 9, items: [{ menuItemId: '4', name: 'Wagyu Burger', quantity: 4, price: 26.00 }], total: 104.00, status: 'completed', createdAt: new Date(2026, 0, 8, 13, 0) },
  { id: 'ORD-027', tableId: '3', tableNumber: 11, items: [{ menuItemId: '2', name: 'Grilled Salmon', quantity: 2, price: 32.00 }, { menuItemId: '8', name: 'Craft Lemonade', quantity: 2, price: 6.00 }], total: 76.00, status: 'completed', createdAt: new Date(2026, 0, 12, 19, 30) },
  { id: 'ORD-028', tableId: '4', tableNumber: 4, items: [{ menuItemId: '6', name: 'Spicy Ramen', quantity: 6, price: 22.00 }], total: 132.00, status: 'completed', createdAt: new Date(2026, 0, 15, 18, 15) },
  { id: 'ORD-029', tableId: '5', tableNumber: 6, items: [{ menuItemId: '7', name: 'Bruschetta', quantity: 3, price: 10.00 }, { menuItemId: '9', name: 'Vegan Buddha Bowl', quantity: 3, price: 19.00 }], total: 87.00, status: 'completed', createdAt: new Date(2026, 0, 18, 20, 0) },
  { id: 'ORD-030', tableId: '6', tableNumber: 2, items: [{ menuItemId: '3', name: 'Caesar Salad', quantity: 3, price: 14.00 }, { menuItemId: '5', name: 'Tiramisu', quantity: 2, price: 12.00 }], total: 66.00, status: 'completed', createdAt: new Date(2026, 0, 22, 12, 45) },
  { id: 'ORD-031', tableId: '7', tableNumber: 8, items: [{ menuItemId: '1', name: 'Truffle Risotto', quantity: 2, price: 28.00 }, { menuItemId: '4', name: 'Wagyu Burger', quantity: 1, price: 26.00 }], total: 82.00, status: 'completed', createdAt: new Date(2026, 0, 25, 19, 0) },
  { id: 'ORD-032', tableId: '8', tableNumber: 10, items: [{ menuItemId: '2', name: 'Grilled Salmon', quantity: 2, price: 32.00 }], total: 64.00, status: 'completed', createdAt: new Date(2026, 0, 28, 13, 30) },

  // 2025 orders (for yearly analytics)
  { id: 'ORD-033', tableId: '1', tableNumber: 5, items: [{ menuItemId: '1', name: 'Truffle Risotto', quantity: 5, price: 28.00 }, { menuItemId: '8', name: 'Craft Lemonade', quantity: 5, price: 6.00 }], total: 170.00, status: 'completed', createdAt: new Date(2025, 11, 15, 12, 0) },
  { id: 'ORD-034', tableId: '2', tableNumber: 8, items: [{ menuItemId: '4', name: 'Wagyu Burger', quantity: 6, price: 26.00 }, { menuItemId: '3', name: 'Caesar Salad', quantity: 4, price: 14.00 }], total: 212.00, status: 'completed', createdAt: new Date(2025, 11, 20, 13, 30) },
  { id: 'ORD-035', tableId: '3', tableNumber: 3, items: [{ menuItemId: '2', name: 'Grilled Salmon', quantity: 4, price: 32.00 }, { menuItemId: '5', name: 'Tiramisu', quantity: 4, price: 12.00 }], total: 176.00, status: 'completed', createdAt: new Date(2025, 11, 25, 19, 0) },
  { id: 'ORD-036', tableId: '4', tableNumber: 1, items: [{ menuItemId: '6', name: 'Spicy Ramen', quantity: 8, price: 22.00 }], total: 176.00, status: 'completed', createdAt: new Date(2025, 10, 10, 18, 0) },
  { id: 'ORD-037', tableId: '5', tableNumber: 9, items: [{ menuItemId: '7', name: 'Bruschetta', quantity: 6, price: 10.00 }, { menuItemId: '9', name: 'Vegan Buddha Bowl', quantity: 5, price: 19.00 }], total: 155.00, status: 'completed', createdAt: new Date(2025, 10, 15, 20, 30) },
  { id: 'ORD-038', tableId: '6', tableNumber: 7, items: [{ menuItemId: '1', name: 'Truffle Risotto', quantity: 4, price: 28.00 }, { menuItemId: '4', name: 'Wagyu Burger', quantity: 3, price: 26.00 }], total: 190.00, status: 'completed', createdAt: new Date(2025, 9, 5, 12, 15) },
  { id: 'ORD-039', tableId: '7', tableNumber: 4, items: [{ menuItemId: '2', name: 'Grilled Salmon', quantity: 5, price: 32.00 }, { menuItemId: '8', name: 'Craft Lemonade', quantity: 5, price: 6.00 }], total: 190.00, status: 'completed', createdAt: new Date(2025, 9, 12, 19, 45) },
  { id: 'ORD-040', tableId: '8', tableNumber: 11, items: [{ menuItemId: '3', name: 'Caesar Salad', quantity: 7, price: 14.00 }, { menuItemId: '5', name: 'Tiramisu', quantity: 5, price: 12.00 }], total: 158.00, status: 'completed', createdAt: new Date(2025, 8, 20, 13, 0) },
  { id: 'ORD-041', tableId: '9', tableNumber: 2, items: [{ menuItemId: '6', name: 'Spicy Ramen', quantity: 10, price: 22.00 }], total: 220.00, status: 'completed', createdAt: new Date(2025, 8, 25, 18, 30) },
  { id: 'ORD-042', tableId: '10', tableNumber: 6, items: [{ menuItemId: '7', name: 'Bruschetta', quantity: 5, price: 10.00 }, { menuItemId: '9', name: 'Vegan Buddha Bowl', quantity: 4, price: 19.00 }], total: 126.00, status: 'completed', createdAt: new Date(2025, 7, 8, 20, 0) },
  { id: 'ORD-043', tableId: '1', tableNumber: 8, items: [{ menuItemId: '1', name: 'Truffle Risotto', quantity: 3, price: 28.00 }, { menuItemId: '2', name: 'Grilled Salmon', quantity: 3, price: 32.00 }], total: 180.00, status: 'completed', createdAt: new Date(2025, 6, 15, 12, 30) },
  { id: 'ORD-044', tableId: '2', tableNumber: 10, items: [{ menuItemId: '4', name: 'Wagyu Burger', quantity: 8, price: 26.00 }], total: 208.00, status: 'completed', createdAt: new Date(2025, 6, 22, 13, 15) },
  { id: 'ORD-045', tableId: '3', tableNumber: 5, items: [{ menuItemId: '3', name: 'Caesar Salad', quantity: 6, price: 14.00 }, { menuItemId: '8', name: 'Craft Lemonade', quantity: 6, price: 6.00 }], total: 120.00, status: 'completed', createdAt: new Date(2025, 5, 10, 19, 0) },
  { id: 'ORD-046', tableId: '4', tableNumber: 12, items: [{ menuItemId: '5', name: 'Tiramisu', quantity: 8, price: 12.00 }, { menuItemId: '6', name: 'Spicy Ramen', quantity: 4, price: 22.00 }], total: 184.00, status: 'completed', createdAt: new Date(2025, 5, 18, 18, 45) },
  { id: 'ORD-047', tableId: '5', tableNumber: 3, items: [{ menuItemId: '7', name: 'Bruschetta', quantity: 7, price: 10.00 }, { menuItemId: '9', name: 'Vegan Buddha Bowl', quantity: 6, price: 19.00 }], total: 184.00, status: 'completed', createdAt: new Date(2025, 4, 25, 20, 0) },
  { id: 'ORD-048', tableId: '6', tableNumber: 9, items: [{ menuItemId: '1', name: 'Truffle Risotto', quantity: 4, price: 28.00 }, { menuItemId: '4', name: 'Wagyu Burger', quantity: 2, price: 26.00 }, { menuItemId: '8', name: 'Craft Lemonade', quantity: 4, price: 6.00 }], total: 200.00, status: 'completed', createdAt: new Date(2025, 3, 12, 12, 0) },
  { id: 'ORD-049', tableId: '7', tableNumber: 1, items: [{ menuItemId: '2', name: 'Grilled Salmon', quantity: 6, price: 32.00 }, { menuItemId: '3', name: 'Caesar Salad', quantity: 3, price: 14.00 }], total: 234.00, status: 'completed', createdAt: new Date(2025, 3, 20, 13, 30) },
  { id: 'ORD-050', tableId: '8', tableNumber: 7, items: [{ menuItemId: '6', name: 'Spicy Ramen', quantity: 12, price: 22.00 }], total: 264.00, status: 'completed', createdAt: new Date(2025, 2, 15, 19, 15) },
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

export interface MenuItemRecipe {
  menuItemId: string;
  ingredients: { inventoryItemId: string; quantity: number }[];
}

export const menuItemRecipes: MenuItemRecipe[] = [
  { menuItemId: '1', ingredients: [{ inventoryItemId: '1', quantity: 0.3 }, { inventoryItemId: '4', quantity: 0.1 }, { inventoryItemId: '11', quantity: 0.02 }] },
  { menuItemId: '2', ingredients: [{ inventoryItemId: '2', quantity: 0.25 }, { inventoryItemId: '14', quantity: 1 }, { inventoryItemId: '5', quantity: 0.05 }] },
  { menuItemId: '3', ingredients: [{ inventoryItemId: '12', quantity: 0.2 }, { inventoryItemId: '1', quantity: 0.1 }] },
  { menuItemId: '4', ingredients: [{ inventoryItemId: '3', quantity: 0.25 }, { inventoryItemId: '5', quantity: 0.03 }] },
  { menuItemId: '5', ingredients: [{ inventoryItemId: '4', quantity: 0.05 }, { inventoryItemId: '1', quantity: 0.1 }] },
  { menuItemId: '6', ingredients: [{ inventoryItemId: '6', quantity: 0.3 }, { inventoryItemId: '14', quantity: 0.5 }] },
  { menuItemId: '7', ingredients: [{ inventoryItemId: '13', quantity: 0.15 }, { inventoryItemId: '5', quantity: 0.02 }, { inventoryItemId: '15', quantity: 0.01 }] },
  { menuItemId: '8', ingredients: [{ inventoryItemId: '14', quantity: 2 }, { inventoryItemId: '15', quantity: 0.02 }] },
  { menuItemId: '9', ingredients: [{ inventoryItemId: '12', quantity: 0.15 }, { inventoryItemId: '13', quantity: 0.1 }] },
  { menuItemId: '10', ingredients: [{ inventoryItemId: '1', quantity: 0.15 }, { inventoryItemId: '4', quantity: 0.05 }, { inventoryItemId: '5', quantity: 0.02 }] },
];

export const inventoryItems: InventoryItem[] = [
  { id: '1', name: 'Arborio Rice', category: 'Ingredients', quantity: 15, unit: 'kg', reorderLevel: 5, costPerUnit: 4.50, salePrice: 9.00 },
  { id: '2', name: 'Atlantic Salmon', category: 'Ingredients', quantity: 8, unit: 'kg', reorderLevel: 3, costPerUnit: 18.00, salePrice: 36.00 },
  { id: '3', name: 'Wagyu Beef', category: 'Ingredients', quantity: 12, unit: 'kg', reorderLevel: 4, costPerUnit: 45.00, salePrice: 90.00 },
  { id: '4', name: 'Parmesan Cheese', category: 'Ingredients', quantity: 3, unit: 'kg', reorderLevel: 2, costPerUnit: 22.00, salePrice: 44.00 },
  { id: '5', name: 'Olive Oil', category: 'Ingredients', quantity: 20, unit: 'liters', reorderLevel: 5, costPerUnit: 8.00, salePrice: 16.00 },
  { id: '6', name: 'Ramen Noodles', category: 'Ingredients', quantity: 25, unit: 'kg', reorderLevel: 10, costPerUnit: 3.50, salePrice: 7.00 },
  { id: '7', name: 'Napkins', category: 'Supplies', quantity: 500, unit: 'pieces', reorderLevel: 100, costPerUnit: 0.10 },
  { id: '8', name: 'To-Go Containers', category: 'Supplies', quantity: 150, unit: 'pieces', reorderLevel: 50, costPerUnit: 0.75 },
  { id: '9', name: 'House Red Wine', category: 'Beverages', quantity: 36, unit: 'bottles', reorderLevel: 12, costPerUnit: 8.00, salePrice: 16.00 },
  { id: '10', name: 'Sparkling Water', category: 'Beverages', quantity: 48, unit: 'bottles', reorderLevel: 24, costPerUnit: 1.50, salePrice: 3.00 },
  { id: '11', name: 'Black Truffle', category: 'Ingredients', quantity: 0.5, unit: 'kg', reorderLevel: 0.3, costPerUnit: 200.00, salePrice: 400.00 },
  { id: '12', name: 'Lettuce', category: 'Ingredients', quantity: 2, unit: 'kg', reorderLevel: 5, costPerUnit: 2.00, salePrice: 4.00 },
  { id: '13', name: 'Tomatoes', category: 'Ingredients', quantity: 8, unit: 'kg', reorderLevel: 4, costPerUnit: 3.00, salePrice: 6.00 },
  { id: '14', name: 'Lemon', category: 'Ingredients', quantity: 30, unit: 'pieces', reorderLevel: 15, costPerUnit: 0.40, salePrice: 0.80 },
  { id: '15', name: 'Mint Leaves', category: 'Ingredients', quantity: 0.5, unit: 'kg', reorderLevel: 0.3, costPerUnit: 15.00, salePrice: 30.00 }
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
