'use client';

export function Header() {
  return (
    <header className="top-header">
      <div className="header-search">
        <span>🔍</span>
        <input type="text" placeholder="Search orders, menu items..." />
      </div>
      <div className="header-actions">
        <button className="header-btn">🔔</button>
        <button className="header-btn">⚙️</button>
        <div className="header-user">
          <div className="header-avatar">MC</div>
          <div className="header-user-info">
            <span className="header-user-name">Marcus Chen</span>
            <span className="header-user-role">Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
}
