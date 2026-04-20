'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: '📊', label: 'Dashboard' },
  { href: '/orders', icon: '📋', label: 'Orders' },
  { href: '/orders/online', icon: '📦', label: 'Online Orders', sub: true },
  { href: '/drivers', icon: '🚗', label: 'Drivers' },
  { href: '/menu', icon: '🍽️', label: 'Menu' },
  { href: '/categories', icon: '🏷️', label: 'Categories' },
  { href: '/tables', icon: '🪑', label: 'Tables' },
  { href: '/inventory', icon: '📦', label: 'Inventory' },
  { href: '/inventory/purchase-orders', icon: '🛒', label: 'Purchase Orders', sub: true },
  { href: '/customers', icon: '👤', label: 'Customers' },
  { href: '/staff', icon: '👥', label: 'Staff' },
  { href: '/reports', icon: '📈', label: 'Reports' },
  { href: '/reports/profits', icon: '💵', label: 'Profits', sub: true },
  { href: '/settings', icon: '⚙️', label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string, sub?: boolean) => {
    if (sub) {
      return pathname === href || pathname.startsWith(href + '/');
    }
    return pathname === href;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">R</div>
        <span className="sidebar-logo-text">RestaurantHub</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive(item.href, item.sub) ? 'active' : ''} ${item.sub ? 'nav-sub-item' : ''}`}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span className="nav-item-text">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
