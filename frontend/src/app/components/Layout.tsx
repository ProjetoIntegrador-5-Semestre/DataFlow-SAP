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
    <div className="h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } flex flex-col`}
      >
        {/* Logo & Toggle */}
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="font-bold text-sm">SAP Script AI</h1>
                  
                  <p className="text-sm font-medium text-slate-300">Klabin</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors mx-auto"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
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
                } ${!sidebarOpen && "justify-center"}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700">
          {sidebarOpen ? (
            <>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-300" />
                </div>
                <div className="space-y-1">
                  {/* Nome dinâmico puxado do banco/token */}
                  <p className="font-semibold text-sm text-white">
                    {user?.full_name || "Admin"}
                  </p>
                  {/* Mostra se é Admin ou email */}
                  <p className="text-xs text-slate-400">
                    {user?.role === "admin" ? "Administrador" : "Analista"}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <button
                  onClick={logout}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors"
                  title="Logout"
                >
                  Logout
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div
              className="w-10 h-10 bg-slate-600 hover:bg-slate-700/50 cursor-pointer rounded-full flex items-center justify-center mx-auto transition-colors text-slate-300 hover:text-blue-400"
              onClick={logout}
              title="Sair do sistema"
            >
              <LogOut className="w-5 h-5" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Scripts automáticos para visualização de dados
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
