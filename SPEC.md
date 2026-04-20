# Restaurant ERP System Specification

## Project Overview

**Project Name**: RestaurantHub ERP
**Project Type**: Full-stack Web Application (Next.js)
**Core Functionality**: Comprehensive restaurant management system covering orders, menu, tables, inventory, staff, and analytics
**Target Users**: Restaurant owners, managers, and staff

---

## UI/UX Specification

### Layout Structure

**App Shell**
- Fixed sidebar navigation (280px width, collapsible to 72px)
- Top header bar (64px height) with search, notifications, user profile
- Main content area with breadcrumb navigation
- Responsive: sidebar becomes bottom nav on mobile (<768px)

**Pages**
1. Dashboard (default)
2. Orders Management
3. Menu Management
4. Table Management
5. Inventory Management
6. Staff Management
7. Reports & Analytics

### Visual Design

**Color Palette**
- Background Dark: `#0D0D0D`
- Background Card: `#1A1A1A`
- Background Elevated: `#242424`
- Primary Accent: `#FF6B35` (Warm Orange - appetite stimulating)
- Secondary Accent: `#2ECC71` (Success Green)
- Warning: `#F39C12`
- Danger: `#E74C3C`
- Text Primary: `#FFFFFF`
- Text Secondary: `#A0A0A0`
- Text Muted: `#666666`
- Border: `#333333`

**Typography**
- Font Family Headings: `"Clash Display", sans-serif` (from CDN)
- Font Family Body: `"DM Sans", sans-serif` (from Google Fonts)
- Font Family Mono: `"JetBrains Mono", monospace` (for numbers/data)
- H1: 32px, 700 weight
- H2: 24px, 600 weight
- H3: 18px, 600 weight
- Body: 14px, 400 weight
- Small: 12px, 400 weight

**Spacing System**
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px
- Card padding: 24px
- Section gaps: 32px

**Visual Effects**
- Card shadows: `0 4px 24px rgba(0,0,0,0.4)`
- Hover transitions: 200ms ease
- Border radius: 12px (cards), 8px (buttons), 6px (inputs)
- Subtle gradient overlays on stat cards
- Glow effect on primary buttons: `0 0 20px rgba(255,107,53,0.3)`

### Components

**Sidebar Navigation**
- Logo at top with restaurant name
- Navigation items with icons
- Active state: orange left border, orange text
- Hover: subtle background highlight
- Collapse toggle at bottom

**Stat Cards**
- Icon with colored background circle
- Large number display (mono font)
- Label and trend indicator
- Subtle gradient based on type

**Data Tables**
- Sticky header
- Alternating row backgrounds
- Row hover highlight
- Action buttons (edit, delete)
- Pagination controls

**Forms**
- Floating labels
- Validation states with icons
- Error messages below inputs

**Buttons**
- Primary: Orange background, white text
- Secondary: Transparent with border
- Danger: Red background
- Sizes: sm (32px), md (40px), lg (48px)

**Modals**
- Centered with dark overlay
- Slide-up animation
- Close button top-right

**Status Badges**
- Pill shape with colored background
- States: pending (yellow), completed (green), cancelled (red), active (blue)

---

## Functionality Specification

### 1. Dashboard

**Key Metrics (4 stat cards)**
- Today's Revenue: currency format, percentage change
- Active Orders: count, trend
- Tables Occupied: ratio (e.g., 8/12)
- Items Sold Today: count

**Quick Actions**
- New Order button
- Add Menu Item
- Table Reservation

**Recent Orders List**
- Last 5 orders with status
- Click to view details

**Activity Feed**
- Real-time style feed of recent actions

### 2. Orders Management

**Order List View**
- Table with columns: Order ID, Table, Items, Total, Status, Time, Actions
- Filter by status: All, Pending, In Progress, Completed, Cancelled
- Search by order ID or table number
- Sort by date, total, status

**New Order Modal**
- Select table (dropdown of available tables)
- Menu item selector with categories
- Quantity adjusters
- Special instructions field
- Calculate total automatically
- Submit creates order with "Pending" status

**Order Detail View**
- Full order information
- Items list with quantities and prices
- Status timeline (Pending → In Progress → Completed)
- Action buttons: Update Status, Cancel, Print

**Order Status Flow**
- Pending → In Progress → Ready → Completed
- Can cancel at any stage

### 3. Menu Management

**Menu Categories**
- Appetizers, Main Courses, Desserts, Beverages, Specials

**Menu Item List**
- Grid or table view toggle
- Columns: Image (thumbnail), Name, Category, Price, Status, Actions
- Filter by category
- Search by name

**Add/Edit Menu Item**
- Name, description
- Category selection
- Price input
- Preparation time (minutes)
- Availability toggle (available/unavailable)
- Image upload placeholder (URL input)
- Dietary tags (Vegetarian, Vegan, Gluten-Free, Spicy)

### 4. Table Management

**Floor Plan View**
- Visual representation of restaurant floor
- Tables shown as numbered boxes
- Color coded: Available (green), Occupied (orange), Reserved (blue)
- Click table to view details/make reservation

**Table List View**
- Table number, capacity, status, current order (if any)
- Quick status toggle

**Reservations**
- List of upcoming reservations
- Add reservation: Name, phone, date/time, party size, table preference
- Confirmation status

### 5. Inventory Management

**Inventory Items List**
- Item name, category, quantity, unit, reorder level, status
- Low stock highlighted in yellow
- Out of stock in red

**Add/Edit Item**
- Name, category (Ingredients, Supplies, Beverages)
- Current quantity, unit (kg, liters, pieces, boxes)
- Reorder level
- Cost per unit

**Stock Alerts**
- Visual indicator when below reorder level
- Quick reorder action

### 6. Staff Management

**Staff List**
- Name, role, phone, email, status (active/inactive)
- Roles: Manager, Chef, Server, Cashier, Host

**Add/Edit Staff**
- Name, role, phone, email
- Shift schedule (select days and hours)
- PIN code for time clock (4 digits)

**Staff Schedule View**
- Weekly calendar showing shifts
- Color coded by role

### 7. Reports & Analytics

**Date Range Selector**
- Today, This Week, This Month, Custom

**Sales Reports**
- Total revenue (bar chart by day)
- Average order value
- Orders by hour (heatmap style)

**Menu Performance**
- Top selling items (pie chart)
- Least popular items
- Category breakdown

**Staff Performance**
- Orders handled per server
- Average service time

---

## Technical Implementation

### State Management
- React useState/useReducer for local state
- Mock data for demonstration

### Data Models (TypeScript Interfaces)

```typescript
interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  prepTime: number;
  available: boolean;
  image: string;
  dietary: string[];
}

interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'in_progress' | 'ready' | 'completed' | 'cancelled';
  createdAt: Date;
  specialInstructions?: string;
}

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  costPerUnit: number;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  schedule: Schedule[];
}

interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  dateTime: Date;
  partySize: number;
  tableId: string;
  status: 'confirmed' | 'seated' | 'completed' | 'cancelled';
}
```

### File Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (dashboard)
│   ├── globals.css
│   ├── orders/
│   │   └── page.tsx
│   ├── menu/
│   │   └── page.tsx
│   ├── tables/
│   │   └── page.tsx
│   ├── inventory/
│   │   └── page.tsx
│   ├── staff/
│   │   └── page.tsx
│   └── reports/
│       └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   └── RecentOrders.tsx
│   ├── orders/
│   │   ├── OrderList.tsx
│   │   └── NewOrderModal.tsx
│   ├── menu/
│   │   ├── MenuGrid.tsx
│   │   └── MenuItemForm.tsx
│   ├── tables/
│   │   ├── FloorPlan.tsx
│   │   └── TableList.tsx
│   ├── inventory/
│   │   └── InventoryList.tsx
│   ├── staff/
│   │   └── StaffList.tsx
│   └── reports/
│       └── Charts.tsx
├── lib/
│   └── mockData.ts
└── types/
    └── index.ts
```

---

## Acceptance Criteria

### Visual Checkpoints
- [ ] Dark theme with orange accent is applied throughout
- [ ] Sidebar navigation is visible and functional
- [ ] All pages are accessible via navigation
- [ ] Stat cards display with correct styling
- [ ] Tables have proper hover states
- [ ] Forms have floating labels and validation
- [ ] Modals animate smoothly

### Functional Checkpoints
- [ ] Dashboard shows mock data for all 4 stat cards
- [ ] Orders page lists orders with filtering
- [ ] Can create new order via modal
- [ ] Menu page shows items in grid
- [ ] Can add/edit menu items
- [ ] Tables page shows visual floor plan
- [ ] Table status can be toggled
- [ ] Inventory shows items with stock levels
- [ ] Staff list displays employees
- [ ] Reports page shows date selector and charts

### Performance
- [ ] Page loads without errors
- [ ] No console errors
- [ ] Build completes successfully
- [ ] Lint passes without errors
