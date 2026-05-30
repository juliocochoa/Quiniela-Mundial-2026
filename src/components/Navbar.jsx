import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant w-full sticky top-0 z-40">
      <div className="flex justify-between items-center px-gutter py-4 w-full max-w-container-max mx-auto">
        <div className="flex items-center gap-8">
          <NavLink to="/" className="text-headline-lg font-headline-lg text-primary select-none hover:opacity-90">
            FIFA 2026
          </NavLink>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink 
              to="/picks" 
              className={({ isActive }) => 
                `pb-1 font-body-md text-body-md transition-colors duration-200 ${
                  isActive 
                    ? 'text-primary border-b-2 border-primary font-semibold' 
                    : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              Picks
            </NavLink>
            <NavLink 
              to="/results" 
              className={({ isActive }) => 
                `pb-1 font-body-md text-body-md transition-colors duration-200 ${
                  isActive 
                    ? 'text-primary border-b-2 border-secondary font-semibold' 
                    : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              Results
            </NavLink>
            <NavLink 
              to="/leaderboard" 
              className={({ isActive }) => 
                `pb-1 font-body-md text-body-md transition-colors duration-200 ${
                  isActive 
                    ? 'text-primary border-b-2 border-primary font-semibold' 
                    : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              Leaderboard
            </NavLink>
            <NavLink 
              to="/admin" 
              className={({ isActive }) => 
                `pb-1 font-body-md text-body-md transition-colors duration-200 ${
                  isActive 
                    ? 'text-primary border-b-2 border-secondary font-semibold font-semibold' 
                    : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              Admin
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all active:opacity-80">
            notifications
          </button>
          <button className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all active:opacity-80">
            settings
          </button>
          {user && (
            <div className="group relative">
              <img 
                alt="User Avatar" 
                className="w-10 h-10 rounded-full border-2 border-primary-fixed object-cover cursor-pointer hover:border-secondary transition-all" 
                src={user.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDUYWv2zDHZ3PsocYa6JWzOE-prmZdevSScIRtbdden0q_WLEBOtqFr5oTq3BOkGvnmwkpaQaAye-4aXkyVbo8qR9M2j2DA6OOYc6_-LS0tFX-6XByiuG9t4KPIW3V8wbEBmrykq_Pcf5qXkdXuvicfb80Ng8K7VzLXk0JFQhjBVwA_XAN6cABbGWUv2xn5VuwMxUGDNTXZemdn17bU12yqdearP7rl7hK38j0AkBEtLP2890o7aT7YaOR2dJ8Bl1z16aLBw3aIqg5'}
              />
              {/* Dropdown for logout */}
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 p-2">
                <div className="px-4 py-2 border-b border-outline-variant mb-1">
                  <p className="text-sm font-bold text-on-surface truncate">{user.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                </div>
                <NavLink 
                  to="/admin"
                  className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low rounded-md transition-colors flex items-center gap-2 mb-1"
                >
                  <span className="material-symbols-outlined text-[18px]">terminal</span>
                  Admin Terminal
                </NavLink>
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-surface-container-low rounded-md transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
