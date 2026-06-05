import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, Car, TrendingUp, FileText, LogOut, Menu, X, ChevronRight,
  Newspaper, Handshake, Users, LayoutTemplate, UserCircle, UserPlus, FolderCheck,
  CalendarCheck, ShieldCheck, ShoppingCart, Settings2, Navigation, Calculator,
  BookOpen,
} from "lucide-react";

const nav = [
  { href: "/portal/dashboard",       label: "Visão Geral",           icon: LayoutDashboard },
  { href: "/portal/reservas",        label: "Reservas",              icon: CalendarCheck },
  { href: "/portal/propostas",       label: "Propostas",             icon: Handshake },
  { href: "/portal/simulador",       label: "Simulador",             icon: Calculator },
  { href: "/portal/clientes",        label: "Clientes",              icon: Users },
  { href: "/portal/parceiros",       label: "Parceiros",             icon: UserPlus },
  { href: "/portal/candidatos",      label: "Candidatos Investidor", icon: ShieldCheck },
  { href: "/portal/catalogo",        label: "Catálogo de Veículos",  icon: ShoppingCart },
  { href: "/portal/admin-veiculos",  label: "Gerenciar Catálogo",    icon: Settings2 },
  { href: "/portal/contratos",       label: "Contratos",             icon: FileText },
  { href: "/portal/modelos",         label: "Modelos de Contrato",   icon: LayoutTemplate },
  { href: "/portal/rastreamento",    label: "Rastreamento GPS",      icon: Navigation },
  { href: "/portal/veiculos",        label: "Veículos (legacy)",     icon: Car },
  { href: "/portal/financeiro",      label: "Financeiro",            icon: TrendingUp },
  { href: "/portal/documentos",      label: "Documentos",            icon: FolderCheck },
  { href: "/portal/blog",            label: "Blog",                  icon: Newspaper },
  { href: "/portal/perfil",          label: "Meu Perfil",            icon: UserCircle },
  { href: "/portal/tutorial",        label: "Tutorial do Sistema",   icon: BookOpen },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { investor, logout } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-white/10 fixed top-0 bottom-0 left-0">
        <div className="p-6 border-b border-white/10">
          <img src="/logo-black-sm.webp" alt="VaideVan" className="h-10 w-auto" style={{ mixBlendMode: "screen" }} />
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                location === item.href
                  ? "bg-primary text-black"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm">
              {investor?.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{investor?.name}</p>
              <p className="text-white/40 text-xs truncate">{investor?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-white/10 h-16 flex items-center px-4 justify-between">
        <img src="/logo-black-sm.webp" alt="VaideVan" className="h-8 w-auto" style={{ mixBlendMode: "screen" }} />
        <button onClick={() => setOpen(!open)} className="p-2">
          {open ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background pt-16 px-4 flex flex-col gap-2">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-semibold transition-all ${
                location === item.href
                  ? "bg-primary text-black"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Link>
          ))}
          <button onClick={() => { logout(); setOpen(false); }} className="flex items-center gap-3 px-4 py-4 text-red-400 text-sm font-semibold">
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
