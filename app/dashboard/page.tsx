"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  Package,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  DollarSign,
  Factory,
  ShoppingCart,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const executiveKpis = [
    {
      title: "Saúde Financeira do Estoque",
      value: "R$ 2.4M",
      description: "Capital imobilizado: R$ 1.8M",
      trend: "+8.5% vs mês anterior",
      trendUp: true,
      icon: DollarSign,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      buttonText: "Ver Detalhes",
      href: "/produtos",
    },
    {
      title: "Risco de Ruptura",
      value: "12 produtos",
      description: "Impacto: R$ 180k/mês",
      trend: "Ruptura em 5-7 dias",
      trendUp: false,
      icon: AlertTriangle,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      buttonText: "Acionar Pedidos",
      href: "/ponto-pedido",
    },
    {
      title: "Capacidade Produtiva",
      value: "68%",
      description: "Utilizada • 32% ociosa",
      trend: "+5% vs mês anterior",
      trendUp: true,
      icon: Factory,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      buttonText: "Ordens Ativas",
      href: "/ordens-producao",
    },
    {
      title: "Performance de Compras",
      value: "92%",
      description: "Economia: R$ 45k",
      trend: "3 fornecedores críticos",
      trendUp: true,
      icon: ShoppingCart,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      buttonText: "Análise de Compras",
      href: "/analise-compras",
    },
  ]

  const priorityAlerts = [
    {
      title: "Ponto de Pedido Crítico",
      description: "10 matérias-primas em ponto crítico",
      value: "R$ 73k em vendas",
      icon: AlertTriangle,
      color: "border-red-200 bg-red-50",
      iconColor: "text-red-600",
      buttonText: "Gerar Pedidos",
      buttonIcon: Zap,
      href: "/ponto-pedido",
    },
    {
      title: "Produtos com Estoque Baixo",
      description: "3 produtos abaixo do mínimo",
      value: "Ruptura em 7 dias",
      icon: Package,
      color: "border-orange-200 bg-orange-50",
      iconColor: "text-orange-600",
      buttonText: "Programar Produção",
      buttonIcon: Zap,
      href: "/ordens-producao",
    },
    {
      title: "Lotes Próximos do Vencimento",
      description: "1 lote(s) vencem em 30 dias",
      value: "Valor: R$ 113k",
      icon: Clock,
      color: "border-yellow-200 bg-yellow-50",
      iconColor: "text-yellow-600",
      buttonText: "Criar Promoção",
      buttonIcon: Zap,
      href: "/produtos",
    },
  ]

  const kpis = [
    {
      title: "Taxa de Giro de Estoque",
      value: "4.2x/ano",
      meta: "Meta: 6.0x",
      trend: "+12% vs anterior",
      trendUp: true,
      icon: TrendingUp,
    },
    {
      title: "Acurácia de Inventário",
      value: "96%",
      meta: "Meta: 98%",
      trend: "+2% vs anterior",
      trendUp: true,
      icon: CheckCircle2,
    },
    {
      title: "Lead Time Médio",
      value: "15 dias",
      meta: "Meta: 12 dias",
      trend: "-2% vs anterior",
      trendUp: false,
      icon: Clock,
    },
    {
      title: "ROI de Produção",
      value: "42%",
      meta: "Margem Bruta",
      trend: "+3% vs anterior",
      trendUp: true,
      icon: TrendingUp,
    },
  ]

  const lowStockProducts = [
    {
      code: "PRO00202",
      name: "Propolift Extrato Alcoólico Vermelho",
      currentStock: 0,
      minStock: 150,
      unit: "un",
      status: "Baixo",
    },
    {
      code: "PRO00203",
      name: "Propolift Extrato Aquoso Verde",
      currentStock: 0,
      minStock: 150,
      unit: "un",
      status: "Baixo",
    },
    {
      code: "PRO00201",
      name: "Propolift Extrato Alcoólico Verde",
      currentStock: 0,
      minStock: 150,
      unit: "un",
      status: "Baixo",
    },
  ]

  const criticalRawMaterials = [
    {
      code: "ING002",
      name: "Própolis Verde",
      currentStock: 0,
      minStock: 4,
      unit: "kg",
      status: "Crítico",
    },
    {
      code: "ING003",
      name: "Própolis Vermelha",
      currentStock: 0,
      minStock: 4,
      unit: "kg",
      status: "Crítico",
    },
    {
      code: "ING004",
      name: "Açaí em Pó",
      currentStock: 0,
      minStock: 10,
      unit: "kg",
      status: "Crítico",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Visão Executiva
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {executiveKpis.map((kpi) => (
            <Card key={kpi.title} className={`${kpi.bgColor} border-2 ${kpi.borderColor}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <kpi.icon className={`h-4 w-4 ${kpi.iconColor}`} />
                  {kpi.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-3xl font-bold mb-1">{kpi.value}</div>
                  <p className="text-sm text-muted-foreground">{kpi.description}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {kpi.trendUp ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs ${kpi.trendUp ? "text-green-600" : "text-red-600"}`}>{kpi.trend}</span>
                  </div>
                </div>
                <Link href={kpi.href}>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    {kpi.buttonText}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Alertas e Ações Prioritárias
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {priorityAlerts.map((alert) => (
            <Card key={alert.title} className={`${alert.color} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <alert.icon className={`h-5 w-5 ${alert.iconColor}`} />
                  {alert.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <p className="text-sm font-semibold mt-1">{alert.value}</p>
                </div>
                <Link href={alert.href}>
                  <Button className="w-full bg-green-700 hover:bg-green-800 text-white">
                    <alert.buttonIcon className="h-4 w-4 mr-2" />
                    {alert.buttonText}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Indicadores de Performance
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">{kpi.meta}</p>
                <div className="flex items-center gap-1">
                  {kpi.trendUp ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-xs ${kpi.trendUp ? "text-green-600" : "text-red-600"}`}>{kpi.trend}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Low Stock Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-5 w-5 text-orange-600" />
              Produtos com Estoque Baixo
            </CardTitle>
            <CardDescription className="text-sm">Produtos que atingiram o ponto de reposição</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div
                  key={product.code}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.code}</p>
                  </div>
                  <div className="text-right mr-3">
                    <p className="text-sm font-semibold">
                      {product.currentStock} {product.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">Mín: {product.minStock}</p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    {product.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Critical Raw Materials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Ponto de Pedido Crítico
            </CardTitle>
            <CardDescription className="text-sm">Clique para ver lista completa de compras necessárias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalRawMaterials.map((rm) => (
                <div
                  key={rm.code}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{rm.name}</p>
                    <p className="text-xs text-muted-foreground">{rm.code}</p>
                  </div>
                  <div className="text-right mr-3">
                    <p className="text-sm font-semibold">
                      {rm.currentStock} {rm.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">Mín: {rm.minStock}</p>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-300">
                    {rm.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
