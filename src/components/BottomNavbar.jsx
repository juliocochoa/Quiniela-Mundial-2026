import React from 'react';
import { NavLink } from 'react-router-dom';

export default function BottomNavbar() {
  return (
    <nav className="fixed bottom-0 w-full flex justify-around items-center px-4 py-2 md:hidden bg-surface-container shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 rounded-t-xl border-t border-outline-variant">
      <NavLink 
        to="/picks" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center rounded-full px-5 py-1.5 transition-all ${
            isActive 
              ? 'bg-primary text-on-primary scale-105 shadow-md' 
              : 'text-on-surface-variant hover:text-primary'
          }`
        }
      >
        <span className="material-symbols-outlined text-[22px]">edit_square</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">Picks</span>
      </NavLink>

      <NavLink 
        to="/results" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center rounded-full px-5 py-1.5 transition-all ${
            isActive 
              ? 'bg-primary text-on-primary scale-105 shadow-md' 
              : 'text-on-surface-variant hover:text-primary'
          }`
        }
      >
        <span className="material-symbols-outlined text-[22px]">sports_soccer</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">Results</span>
      </NavLink>

      <NavLink 
        to="/leaderboard" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center rounded-full px-5 py-1.5 transition-all ${
            isActive 
              ? 'bg-primary text-on-primary scale-105 shadow-md' 
              : 'text-on-surface-variant hover:text-primary'
          }`
        }
      >
        <span className="material-symbols-outlined text-[22px]">leaderboard</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">Rank</span>
      </NavLink>

      <NavLink 
        to="/admin" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center rounded-full px-5 py-1.5 transition-all ${
            isActive 
              ? 'bg-primary text-on-primary scale-105 shadow-md' 
              : 'text-on-surface-variant hover:text-primary'
          }`
        }
      >
        <span className="material-symbols-outlined text-[22px]">terminal</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">Admin</span>
      </NavLink>
    </nav>
  );
}
