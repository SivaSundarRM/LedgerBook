import React from "react";
import { NotebookPen, LogOut, LayoutGrid, TrendingUp } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavTab({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? "bg-ink-900 text-white" : "text-ink-500 hover:bg-ink-100"
        }`
      }
    >
      <Icon size={15} />
      <span className="hidden sm:inline">{label}</span>
    </NavLink>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-ink-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ink-900 text-moss-300">
            <NotebookPen size={17} />
          </div>
          <span className="font-mono text-[15px] font-semibold tracking-tight text-ink-900">
            Ledger
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 rounded-md bg-white/60 p-1">
              <NavTab to="/" icon={LayoutGrid} label="Loans" />
              <NavTab to="/profit" icon={TrendingUp} label="Profit" />
            </nav>
            <span className="hidden text-sm text-ink-500 lg:inline">
              {user.name}
            </span>
            <button onClick={logout} className="btn-ghost" aria-label="Log out">
              <LogOut size={15} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
