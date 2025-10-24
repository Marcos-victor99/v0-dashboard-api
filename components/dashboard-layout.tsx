"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Calculator,
  ClipboardList,
  FileText,
  TrendingUp,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Produtos", href: "/produtos", icon: Package },
  { name: "Matérias-Primas", href: "/materias-primas", icon: ShoppingCart },
  { name: "Fornecedores", href: "/fornecedores", icon: Users },
  { name: "Fichas Técnicas", href: "/fichas-tecnicas", icon: FileText },
  { name: "Ordens de Produção", href: "/ordens-producao", icon: ClipboardList },
  {
    name: "Suprimentos",
    icon: PackageOpen,
    submenu: [
      { name: "Necessidades (MRP)", href: "/necessidades-materiais", icon: Calculator },
      { name: "Simulador MRP", href: "/simulador-mrp", icon: Calculator },
      { name: "Cotações", href: "/cotacoes", icon: FileText },
      { name: "Pedidos de Compra", href: "/pedidos-compra", icon: ShoppingCart },
      { name: "Compras", href: "/compras", icon: FileText },
      { name: "Análise de Compras", href: "/analise-compras", icon: TrendingUp },
      { name: "Ponto de Pedido", href: "/ponto-pedido", icon: ShoppingCart },
    ],
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [suprimentosOpen, setSuprimentosOpen] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const stored = localStorage.getItem("sidebarCollapsed")
    if (stored !== null) {
      setIsCollapsed(stored === "true")
    }
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebarCollapsed", String(newState))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white border-r transform transition-all duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          "w-64", // Mobile always full width
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 h-16 px-4 border-b">
            {!isCollapsed && (
              <>
                <img
                  src="https://vdhxtlnadjejyyydmlit.supabase.co/storage/v1/object/public/arealeira/producao/logo-app-prod.png"
                  alt="Beeoz Logo"
                  className="h-10 w-auto object-contain"
                />
                <span className="font-semibold text-base text-gray-900 truncate">Beeoz Production System</span>
              </>
            )}
            {isCollapsed && (
              <img
                src="https://vdhxtlnadjejyyydmlit.supabase.co/storage/v1/object/public/arealeira/producao/logo-app-prod.png"
                alt="Beeoz Logo"
                className="h-8 w-8 object-contain mx-auto"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn("hidden lg:flex", isCollapsed ? "mx-auto" : "ml-auto")}
              onClick={toggleCollapse}
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => {
              if (item.submenu) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setSuprimentosOpen(!suprimentosOpen)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-normal text-gray-700 hover:bg-gray-50 transition-colors",
                        isCollapsed && "justify-center",
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && item.name}
                    </button>
                    {suprimentosOpen && !isCollapsed && (
                      <div className="space-y-0.5">
                        {item.submenu.map((subitem) => {
                          const isActive = pathname === subitem.href
                          return (
                            <Link
                              key={subitem.name}
                              href={subitem.href}
                              className={cn(
                                "flex items-center gap-3 pl-11 pr-3 py-2.5 text-sm font-normal transition-colors",
                                isActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50",
                              )}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <subitem.icon className="h-4 w-4" />
                              {subitem.name}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }

              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-normal transition-colors",
                    isActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50",
                    isCollapsed && "justify-center",
                  )}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && item.name}
                </Link>
              )
            })}
          </nav>

          {!isCollapsed && (
            <div className="p-4 border-t">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-medium">
                  U
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">Usuário de Desenvolvimento</div>
                  <div className="text-xs text-gray-500 truncate">dev@beeoz.com</div>
                </div>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="p-2 border-t">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-medium mx-auto">
                U
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={cn("transition-all duration-300", isCollapsed ? "lg:pl-16" : "lg:pl-64")}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b flex items-center px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Sistema de Gestão de Produção</div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
