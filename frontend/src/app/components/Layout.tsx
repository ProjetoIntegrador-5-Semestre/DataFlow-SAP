import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Menu,
  X,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "../lib/auth";

export function Layout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/chat", icon: MessageSquare, label: "Gerador IA" },
    { path: "/analytics", icon: BarChart3, label: "Estatísticas" },
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50 md:flex-row">
      {/* Sidebar / Topbar */}
      <aside
        className={`shrink-0 flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 border-b border-slate-700 md:border-b-0 md:border-r ${
          sidebarOpen ? "w-full md:w-64" : "w-full md:w-20"
        }`}
      >
        {/* Logo & Toggle */}
        <div className={`p-4 flex items-center justify-between border-b border-slate-700 md:border-transparent ${!sidebarOpen ? "md:justify-center" : ""}`}>
          <div className={`flex items-center gap-3 ${!sidebarOpen ? "md:hidden" : ""}`}>
            <div>
              <h1 className="font-bold text-sm whitespace-nowrap">SAP Script AI</h1>
              <p className="text-sm font-medium text-slate-300">Klabin</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors shrink-0"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation & Profile */}
        <div className={`flex-1 flex-col ${!sidebarOpen ? "hidden md:flex" : "flex"}`}>
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-white/10 text-white shadow-lg shadow-black/20 hover:text-blue-400"
                      : "hover:bg-slate-700/50 text-slate-300 hover:text-blue-400"
                  } ${!sidebarOpen ? "justify-center" : ""}`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className={`font-medium text-sm whitespace-nowrap ${!sidebarOpen ? "md:hidden" : ""}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className={`p-4 border-t border-slate-700 flex flex-col gap-4 ${!sidebarOpen ? "md:items-center" : ""}`}>
            <div className={`flex items-center gap-3 ${!sidebarOpen ? "justify-center" : ""}`}>
              <div className="w-10 h-10 shrink-0 bg-slate-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-300" />
              </div>
              <div className={`space-y-0.5 min-w-0 ${!sidebarOpen ? "md:hidden" : ""}`}>
                <p className="font-semibold text-sm text-white truncate">
                  {user?.full_name || "Admin"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.role === "admin" ? "Administrador" : "Analista"}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 font-medium text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors ${
                !sidebarOpen ? "w-10 h-10 p-0 rounded-full md:rounded-xl" : "w-full px-3 py-2 text-sm"
              }`}
              title="Sair do sistema"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className={`${!sidebarOpen ? "hidden" : "inline"}`}>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 md:px-6">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Scripts automáticos para visualização de dados
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="min-w-0 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}