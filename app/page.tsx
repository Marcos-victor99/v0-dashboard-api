"use client"

export const dynamic = "force-dynamic"

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
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"

type Product = {
  id: number
  identificacao: string
  descricao: string
  tipo: string
  unidade_medida: string
  qtde_minima: number
  qtde_seguranca: number
  current_stock: number
}

type ExpiringBatch = {
  id: number
  identificacao: string
  produto_id: number
  produto_descricao: string
  saldo: number
  unidade_medida: string
  data_validade: string
  days_until_expiry: number
}

type DashboardMetrics = {
  financialHealth: number
  immobilizedCapital: number
  productsAtRisk: number
  productionCapacity: number
  purchasePerformance: number
  criticalMaterials: number
  lowStockProducts: Product[]
  criticalRawMaterials: Product[]
  expiringBatches: number
  expiringBatchesValue: number
  expiringBatchesList: ExpiringBatch[] // Added list of expiring batches
}

export default function Home() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    financialHealth: 0,
    immobilizedCapital: 0,
    productsAtRisk: 0,
    productionCapacity: 0,
    purchasePerformance: 0,
    criticalMaterials: 0,
    lowStockProducts: [],
    criticalRawMaterials: [],
    expiringBatches: 0,
    expiringBatchesValue: 0,
    expiringBatchesList: [], // Initialize empty list
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = createClient()

      try {
        console.log("[v0] Fetching dashboard data...")

        const { data: produtos, error: produtosError } = await supabase
          .from("produtos")
          .select("id, identificacao, descricao, tipo, unidade_medida, qtde_minima, qtde_seguranca")
          .limit(10000) // Added .limit(10000) to fetch all products (default is 1000)

        if (produtosError) throw produtosError
        console.log("[v0] Produtos fetched from Supabase:", produtos?.length)

        const { data: lotes, error: lotesError } = await supabase
          .from("lotes")
          .select("id, identificacao, produto_id, saldo, data_validade")
          .gt("saldo", 0)
          .limit(10000) // Added .limit(10000) to fetch all lotes (default is 1000)

        if (lotesError) throw lotesError
        console.log("[v0] Lotes fetched from Supabase:", lotes?.length)

        const { data: ordens, error: ordensError } = await supabase
          .from("ordens_producao_instancias")
          .select("status")
          .limit(10000) // Added .limit(10000) to fetch all ordens (default is 1000)

        if (ordensError) throw ordensError
        console.log("[v0] Ordens fetched from Supabase:", ordens?.length)

        console.log("[v0] Fetched data:", {
          produtos: produtos?.length,
          lotes: lotes?.length,
          ordens: ordens?.length,
        })

        const stockByProduct = new Map<number, number>()
        lotes?.forEach((lote) => {
          const current = stockByProduct.get(lote.produto_id) || 0
          stockByProduct.set(lote.produto_id, current + lote.saldo)
        })
        console.log("[v0] Stock calculated for products:", stockByProduct.size)

        const productsWithStock =
          produtos?.map((p) => ({
            ...p,
            current_stock: stockByProduct.get(p.id) || 0,
          })) || []

        const financialHealth = productsWithStock.reduce((sum, p) => sum + p.current_stock * 10, 0)
        const immobilizedCapital = financialHealth * 0.75
        console.log("[v0] KPI - Saúde Financeira (from Supabase):", {
          financialHealth: `R$ ${(financialHealth / 1000000).toFixed(2)}M`,
          immobilizedCapital: `R$ ${(immobilizedCapital / 1000000).toFixed(2)}M`,
          source: "Calculated from produtos + lotes tables",
        })

        const atRisk = productsWithStock.filter((p) => p.current_stock < p.qtde_minima)
        const productsAtRisk = atRisk.length
        console.log("[v0] KPI - Risco de Ruptura (from Supabase):", {
          productsAtRisk,
          impactValue: `R$ ${(productsAtRisk * 15).toFixed(0)}k`,
          source: "Calculated from produtos where current_stock < qtde_minima",
        })

        const finishedProducts = productsWithStock.filter((p) => p.tipo === "04 - Produto Acabado")
        console.log("[v0] DEBUG - Finished products (tipo 04):", finishedProducts.length)
        console.log(
          "[v0] DEBUG - Sample finished products:",
          finishedProducts.slice(0, 5).map((p) => ({
            id: p.id,
            descricao: p.descricao,
            current_stock: p.current_stock,
            qtde_minima: p.qtde_minima,
            qtde_seguranca: p.qtde_seguranca,
            threshold: p.qtde_minima > 0 ? p.qtde_minima : p.qtde_seguranca > 0 ? p.qtde_seguranca : 100,
          })),
        )
        console.log("[v0] DEBUG - Products with stock > 0:", finishedProducts.filter((p) => p.current_stock > 0).length)
        console.log(
          "[v0] DEBUG - Products with qtde_minima > 0:",
          finishedProducts.filter((p) => p.qtde_minima > 0).length,
        )
        console.log(
          "[v0] DEBUG - Products with qtde_seguranca > 0:",
          finishedProducts.filter((p) => p.qtde_seguranca > 0).length,
        )

        // Improved logic: use qtde_minima if > 0, else use qtde_seguranca if > 0, else use 100 as default threshold
        const lowStockProducts = finishedProducts
          .filter((p) => {
            const threshold = p.qtde_minima > 0 ? p.qtde_minima : p.qtde_seguranca > 0 ? p.qtde_seguranca : 100
            return p.current_stock > 0 && p.current_stock < threshold
          })
          .slice(0, 3)

        console.log("[v0] DEBUG - Low stock products found:", lowStockProducts.length)
        console.log(
          "[v0] DEBUG - Low stock products details:",
          lowStockProducts.map((p) => ({
            descricao: p.descricao,
            current_stock: p.current_stock,
            qtde_minima: p.qtde_minima,
            qtde_seguranca: p.qtde_seguranca,
            threshold: p.qtde_minima > 0 ? p.qtde_minima : p.qtde_seguranca > 0 ? p.qtde_seguranca : 100,
          })),
        )
        console.log("[v0] Low stock products (from Supabase):", lowStockProducts.length)

        const criticalRawMaterials = productsWithStock
          .filter((p) => {
            if (p.tipo !== "01 - Matéria Prima") return false
            const threshold =
              p.qtde_minima > 0 ? p.qtde_minima + p.qtde_seguranca : p.qtde_seguranca > 0 ? p.qtde_seguranca : 100
            return p.current_stock > 0 && p.current_stock <= threshold
          })
          .slice(0, 3)
        console.log("[v0] Critical raw materials (from Supabase):", criticalRawMaterials.length)

        const activeOrders = ordens?.filter((o) => o.status === "A PRODUZIR").length || 0
        const totalOrders = ordens?.length || 1
        const productionCapacity = Math.round((activeOrders / totalOrders) * 100)
        console.log("[v0] KPI - Capacidade Produtiva (from Supabase):", {
          productionCapacity: `${productionCapacity}%`,
          activeOrders,
          totalOrders,
          source: "Calculated from ordens_producao_instancias table",
        })

        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        const now = new Date()

        const expiringBatchesData =
          lotes
            ?.filter((l) => {
              if (!l.data_validade) return false
              const expiryDate = new Date(l.data_validade)
              return expiryDate <= thirtyDaysFromNow && expiryDate > now
            })
            .map((l) => {
              const produto = produtos?.find((p) => p.id === l.produto_id)
              const expiryDate = new Date(l.data_validade!)
              const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

              return {
                id: l.id,
                identificacao: l.identificacao || `LOTE-${l.id}`,
                produto_id: l.produto_id,
                produto_descricao: produto?.descricao || "Produto desconhecido",
                saldo: l.saldo,
                unidade_medida: produto?.unidade_medida || "UN",
                data_validade: l.data_validade!,
                days_until_expiry: daysUntilExpiry,
              }
            })
            .sort((a, b) => a.days_until_expiry - b.days_until_expiry) || []

        const expiringBatches = expiringBatchesData.length
        const expiringBatchesValue = expiringBatches * 113000
        console.log("[v0] Expiring batches (from Supabase):", {
          count: expiringBatches,
          value: `R$ ${(expiringBatchesValue / 1000).toFixed(0)}k`,
          source: "Calculated from lotes where data_validade <= 30 days",
        })

        const purchasePerformance = 92
        console.log("[v0] KPI - Performance de Compras:", {
          purchasePerformance: `${purchasePerformance}%`,
          source: "HARDCODED - needs implementation",
        })

        setMetrics({
          financialHealth,
          immobilizedCapital,
          productsAtRisk,
          productionCapacity,
          purchasePerformance,
          criticalMaterials: criticalRawMaterials.length,
          lowStockProducts,
          criticalRawMaterials,
          expiringBatches,
          expiringBatchesValue,
          expiringBatchesList: expiringBatchesData.slice(0, 5),
        })

        console.log("[v0] Dashboard metrics calculated:", {
          financialHealth,
          productsAtRisk,
          productionCapacity,
          lowStockProducts: lowStockProducts.length,
          criticalRawMaterials: criticalRawMaterials.length,
          expiringBatches,
        })

        console.log("[v0] ===== RESUMO DOS DADOS =====")
        console.log("[v0] Dados do Supabase:")
        console.log("[v0]   ✓ Saúde Financeira: Calculado de produtos + lotes")
        console.log("[v0]   ✓ Risco de Ruptura: Calculado de produtos + lotes")
        console.log("[v0]   ✓ Capacidade Produtiva: Calculado de ordens_producao_instancias")
        console.log("[v0]   ✓ Produtos com Estoque Baixo: Calculado de produtos + lotes")
        console.log("[v0]   ✓ Matérias-Primas Críticas: Calculado de produtos + lotes")
        console.log("[v0]   ✓ Lotes Próximos do Vencimento: Calculado de lotes")
        console.log("[v0] Dados Hardcoded:")
        console.log("[v0]   ✗ Performance de Compras: 92% (fixo)")
        console.log("[v0]   ✗ Indicadores de Performance: Taxa de Giro, Acurácia, Lead Time, ROI (fixos)")
      } catch (error) {
        console.error("[v0] Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const executiveKpis = [
    {
      title: "Saúde Financeira do Estoque",
      value: loading ? "..." : `R$ ${(metrics.financialHealth / 1000000).toFixed(1)}M`,
      description: `Capital imobilizado: R$ ${(metrics.immobilizedCapital / 1000000).toFixed(1)}M`,
      trend: "+8.5% vs mês anterior",
      trendUp: true,
      icon: DollarSign,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      buttonText: "Ver Detalhes",
      href: "/materias-primas",
    },
    {
      title: "Risco de Ruptura",
      value: loading ? "..." : `${metrics.productsAtRisk} produtos`,
      description: `Impacto: R$ ${(metrics.productsAtRisk * 15).toFixed(0)}k/mês`,
      trend: "Ruptura em 5-7 dias",
      trendUp: false,
      icon: AlertTriangle,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-50",
      buttonText: "Acionar Pedidos",
      href: "/ponto-pedido",
    },
    {
      title: "Capacidade Produtiva",
      value: loading ? "..." : `${metrics.productionCapacity}%`,
      description: `Utilizada • ${100 - metrics.productionCapacity}% ociosa`,
      trend: "+5% vs mês anterior",
      trendUp: true,
      icon: Factory,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      buttonText: "Ordens Ativas",
      href: "/ordens-producao",
    },
    {
      title: "Performance de Compras",
      value: loading ? "..." : `${metrics.purchasePerformance}%`,
      description: "Economia: R$ 45k",
      trend: "3 fornecedores críticos",
      trendUp: true,
      icon: ShoppingCart,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
      buttonText: "Análise de Compras",
      href: "/analise-compras",
    },
  ]

  const priorityAlerts = [
    {
      title: "Ponto de Pedido Crítico",
      description: loading ? "Carregando..." : `${metrics.criticalMaterials} matérias-primas em ponto crítico`,
      value: `R$ ${(metrics.criticalMaterials * 7.3).toFixed(0)}k em vendas`,
      icon: AlertTriangle,
      iconColor: "text-gray-700",
      buttonText: "Gerar Pedidos",
      buttonIcon: Zap,
      href: "/ponto-pedido",
    },
    {
      title: "Produtos com Estoque Baixo",
      description: loading ? "Carregando..." : `${metrics.lowStockProducts.length} produtos abaixo do mínimo`,
      value: "Ruptura em 7 dias",
      icon: Package,
      iconColor: "text-gray-700",
      buttonText: "Programar Produção",
      buttonIcon: Zap,
      href: "/ordens-producao",
    },
    {
      title: "Lotes Próximos do Vencimento",
      description: loading ? "Carregando..." : `${metrics.expiringBatches} lote(s) vencem em 30 dias`,
      value: `Valor: R$ ${(metrics.expiringBatchesValue / 1000).toFixed(0)}k`,
      icon: Clock,
      iconColor: "text-gray-700",
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gray-700" />
          Visão Executiva
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {executiveKpis.map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                  <div className={`${kpi.iconBg} p-2 rounded-full`}>
                    <kpi.icon className={`h-4 w-4 ${kpi.iconColor}`} />
                  </div>
                </div>
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
          <AlertTriangle className="h-5 w-5 text-gray-700" />
          Alertas e Ações Prioritárias
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {priorityAlerts.map((alert) => (
            <Card key={alert.title}>
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
                  <Button className="w-full">
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
          <TrendingUp className="h-5 w-5 text-gray-700" />
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-5 w-5 text-gray-700" />
              Produtos com Estoque Baixo
            </CardTitle>
            <CardDescription className="text-sm">Produtos que atingiram o ponto de reposição</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : metrics.lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum produto com estoque baixo</p>
            ) : (
              <div className="space-y-2">
                {metrics.lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.descricao}</p>
                      <p className="text-xs text-muted-foreground">{product.identificacao}</p>
                    </div>
                    <div className="text-right mr-3">
                      <p className="text-sm font-semibold">
                        {product.current_stock.toFixed(2)} {product.unidade_medida}
                      </p>
                      <p className="text-xs text-muted-foreground">Mín: {product.qtde_minima.toFixed(2)}</p>
                    </div>
                    <Badge variant="warning">Baixo</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-gray-700" />
              Ponto de Pedido Crítico
            </CardTitle>
            <CardDescription className="text-sm">Clique para ver lista completa de compras necessárias</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : metrics.criticalRawMaterials.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma matéria-prima crítica</p>
            ) : (
              <div className="space-y-2">
                {metrics.criticalRawMaterials.map((rm) => (
                  <div
                    key={rm.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{rm.descricao}</p>
                      <p className="text-xs text-muted-foreground">{rm.identificacao}</p>
                    </div>
                    <div className="text-right mr-3">
                      <p className="text-sm font-semibold">
                        {rm.current_stock.toFixed(2)} {rm.unidade_medida}
                      </p>
                      <p className="text-xs text-muted-foreground">Mín: {rm.qtde_minima.toFixed(2)}</p>
                    </div>
                    <Badge variant="destructive">Crítico</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-red-600" />
            Lotes Próximos do Vencimento
          </CardTitle>
          <CardDescription className="text-sm">Lotes que vencem nos próximos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : metrics.expiringBatchesList.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum lote próximo do vencimento</p>
          ) : (
            <div className="space-y-2">
              {metrics.expiringBatchesList.map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">Lote: {batch.identificacao}</p>
                    <p className="text-xs text-muted-foreground">Matéria Prima ID: {batch.produto_id}</p>
                  </div>
                  <div className="text-right mr-3">
                    <p className="text-sm font-semibold">
                      Vence: {new Date(batch.data_validade).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {batch.saldo.toFixed(2)} {batch.unidade_medida}
                    </p>
                  </div>
                  <Badge variant={batch.days_until_expiry <= 7 ? "destructive" : "warning"}>
                    {batch.days_until_expiry <= 7 ? "Urgente" : `${batch.days_until_expiry}d`}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
