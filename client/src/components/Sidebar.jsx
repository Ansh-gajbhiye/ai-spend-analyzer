import { useState } from 'react';

export default function Sidebar({ collapsed, onToggle }) {
  const menuItems = [
    { label: 'Dashboard', active: true },
    { label: 'Transactions' },
    { label: 'AI Auditor' },
  ];

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-zinc-900 border-r border-zinc-800 h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-50`}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-zinc-800">
        {!collapsed && (
          <span className="text-xl font-bold text-white whitespace-nowrap">AI Spend Analyzer</span>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Menu Items – show only icons when collapsed */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              item.active
                ? 'bg-teal-500 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {/* You can add icons here if you want */}
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            {collapsed && <span className="text-sm font-medium"> </span>} {/* icon placeholder */}
          </button>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold flex-shrink-0">
            U
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-50 truncate">User</p>
              <p className="text-xs text-zinc-400 truncate">user@email.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}