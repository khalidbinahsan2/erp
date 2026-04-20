'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: '📊', label: 'Dashboard' },
  { href: '/orders', icon: '📋', label: 'Orders' },
  { href: '/menu', icon: '🍽️', label: 'Menu' },
  { href: '/tables', icon: '🪑', label: 'Tables' },
  { href: '/inventory', icon: '📦', label: 'Inventory' },
  { href: '/staff', icon: '👥', label: 'Staff' },
  { href: '/reports', icon: '📈', label: 'Reports' },
];

export function Sidebar() {
  const pathname = usePathname();

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
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span className="nav-item-text">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
