import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Icons = {
  Dashboard: () => <span>📊</span>,
  Transactions: () => <span>💳</span>,
  AI: () => <span>🤖</span>,
  Docs: () => <span>📄</span>,
  Settings: () => <span>⚙️</span>,
  Search: () => <span>🔍</span>,
  Logout: () => <span>🚪</span>,
};
export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    // 1. Remove the token from local storage
    localStorage.removeItem('token'); 
    
    // (Optional) Remove other user data if you saved it
    localStorage.removeItem('userId'); 

    // 2. Redirect the user back to the login page
    navigate('/login'); 
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const menuItems = [
    { label: 'Dashboard', icon: Icons.Dashboard, to: '/' },
    { label: 'Transactions', icon: Icons.Transactions, to: '/transactions' },
    { label: 'AI Auditor', icon: Icons.AI, to: '/ai-auditor' },
    { label: 'Docs', icon: Icons.Docs, to: '/docs' },
    { label: 'Settings', icon: Icons.Settings, to: '/settings' },
  ];

  // Filter items based on search query
  const filteredItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle navigation on selection
  const handleSelect = (to) => {
    navigate(to);
    setSearchQuery('');
    setShowDropdown(false);
  };

  // Handle Enter key – navigate to first match
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredItems.length > 0) {
      handleSelect(filteredItems[0].to);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide dropdown when collapsed
  useEffect(() => {
    if (collapsed) setShowDropdown(false);
  }, [collapsed]);

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-zinc-900 border-r border-zinc-800 h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-50 shadow-lg`}
    >
      {/* Top: App name & collapse toggle */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-800">
        {!collapsed ? (
          <span className="text-lg font-semibold text-white whitespace-nowrap">AI Spend Analyzer</span>
        ) : (
          <span className="text-lg font-semibold text-white">💸</span>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Search Bar – only when expanded */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2 relative" ref={searchRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icons.Search />
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowDropdown(true)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white placeholder-zinc-500"
            />
          </div>

          {/* Dropdown suggestions */}
          {showDropdown && searchQuery.length > 0 && filteredItems.length > 0 && (
            <div className="absolute left-4 right-4 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg overflow-hidden z-50">
              {filteredItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleSelect(item.to)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left"
                >
                  <span className="text-zinc-400">
                    <item.icon />
                  </span>
                  <span className="text-sm text-white">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white font-medium'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`
                }
              >
                <span className="text-zinc-400">
                  <IconComponent />
                </span>
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom: User profile */}
     <div className="p-4 border-t border-zinc-800">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-sm">
                U
              </div>
              <div>
                <p className="text-sm font-semibold text-white">ANSH</p>
                <p className="text-xs text-zinc-400">user@email.com</p>
              </div>
            </div>
            {/* Logout Button (Expanded) */}
            <button
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Log out"
            >
              <Icons.Logout />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-sm">
              U
            </div>
            {/* Logout Button (Collapsed) */}
            <button
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Log out"
            >
              <Icons.Logout />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
