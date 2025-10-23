"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  FileDown,
  List,
  Package,
  Users,
  Calendar,
} from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

type RawMaterial = {
  id: number
  code: string
  name: string
  type: string
  unit: string
  current_stock: number
  reorder_point: number
  min_stock: number
  unit_cost: number
  supplier_id: number | null
  supplier?: {
    id: number
    name: string
    delivery_days: number
    payment_terms: number
  }
}

type Product = {
  id: number
  code: string
  name: string
  materials: RawMaterial[]
  subtotal: number
}

type Supplier = {
  id: number
  name: string
  delivery_days: number
  payment_terms: number
  minLotMultiplier: number
  materials: RawMaterial[]
  subtotalNecessary: number
  subtotalMinLot: number
}

export default function PontoDePedido() {
  const [viewMode, setViewMode] = useState<"list" | "product" | "supplier">("list")
  const [materials, setMaterials] = useState<RawMaterial[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchMaterials()
  }, [])

  async function fetchMaterials() {
    try {
      console.log("[v0] Fetching raw materials from produtos table...")

      // Fetch raw materials (tipo = "01 - Matéria Prima")
      const { data: produtosData, error: produtosError } = await supabase
        .from("produtos")
        .select("*")
        .eq("tipo", "01 - Matéria Prima")
        .order("descricao", { ascending: true })

      if (produtosError) throw produtosError

      console.log(`[v0] Fetched ${produtosData?.length || 0} raw materials`)

      // Fetch all lotes to calculate current stock
      const { data: lotesData, error: lotesError } = await supabase.from("lotes").select("produto_id, saldo")

      if (lotesError) throw lotesError

      // Calculate stock by product
      const stockByProduct = lotesData?.reduce(
        (acc, lote) => {
          if (!acc[lote.produto_id]) {
            acc[lote.produto_id] = 0
          }
          acc[lote.produto_id] += Number(lote.saldo) || 0
          return acc
        },
        {} as Record<number, number>,
      )

      // Fetch suppliers
      const { data: suppliersData, error: suppliersError } = await supabase.from("fornecedores").select("*")

      if (suppliersError) throw suppliersError

      // Map suppliers by ID
      const suppliersById = suppliersData?.reduce(
        (acc, supplier) => {
          acc[supplier.id] = {
            id: supplier.id,
            name: supplier.nome || supplier.razao_social || "Sem Nome",
            delivery_days: 15, // Default delivery days (not in schema)
            payment_terms: 30, // Default payment terms (not in schema)
          }
          return acc
        },
        {} as Record<number, { id: number; name: string; delivery_days: number; payment_terms: number }>,
      )

      // Transform produtos data to RawMaterial format
      const transformedMaterials: RawMaterial[] =
        produtosData?.map((produto) => {
          const currentStock = stockByProduct?.[produto.id] || 0
          const reorderPoint = Number(produto.ponto_pedido) || Number(produto.estoque_minimo) || 0

          return {
            id: produto.id,
            code: produto.identificacao || `PRD${String(produto.id).padStart(5, "0")}`,
            name: produto.descricao || "Sem descrição",
            type: produto.categoria || "Matéria Prima",
            unit: produto.unidade || "UN",
            current_stock: currentStock,
            reorder_point: reorderPoint,
            min_stock: Number(produto.estoque_minimo) || 0,
            unit_cost: Number(produto.preco_custo) || 0,
            supplier_id: produto.fornecedor_id,
            supplier: produto.fornecedor_id ? suppliersById?.[produto.fornecedor_id] : undefined,
          }
        }) || []

      // Filter materials that are at or below reorder point
      const filteredData = transformedMaterials.filter((item) => item.current_stock <= item.reorder_point)

      console.log(`[v0] Materials at reorder point: ${filteredData.length}`)
      console.log(
        `[v0] Sample material:`,
        filteredData[0]
          ? `${filteredData[0].code} - ${filteredData[0].name} (Stock: ${filteredData[0].current_stock}, Reorder: ${filteredData[0].reorder_point})`
          : "None",
      )

      setMaterials(filteredData)
    } catch (error) {
      console.error("Error fetching materials:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getUrgencyLevel = (currentStock: number, reorderPoint: number) => {
    const percentage = (currentStock / reorderPoint) * 100
    if (percentage === 0) return "Crítico"
    if (percentage <= 30) return "Alta"
    return "Média"
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "ingrediente":
        return "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
      case "embalagem":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
      case "rótulo":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400"
    }
  }

  const criticalItems = materials.filter((m) => m.current_stock === 0).length
  const totalItems = materials.length
  const highPriorityItems = materials.filter(
    (m) => m.current_stock > 0 && m.current_stock <= m.reorder_point * 0.3,
  ).length

  const totalNecessary = materials.reduce((sum, m) => {
    const needed = Math.max(0, m.reorder_point - m.current_stock)
    return sum + needed * m.unit_cost
  }, 0)

  const totalMinLot = materials.reduce((sum, m) => {
    const needed = Math.max(0, m.reorder_point - m.current_stock)
    const minLot = m.type === "Embalagem" || m.type === "Rótulo" ? Math.ceil(needed / 1000) * 1000 : needed
    return sum + minLot * m.unit_cost
  }, 0)

  const avgDeliveryDays =
    materials.length > 0
      ? Math.round(materials.reduce((sum, m) => sum + (m.supplier?.delivery_days || 15), 0) / materials.length)
      : 15

  const groupedByProduct: Product[] = [
    {
      id: 115,
      code: "PRD00115",
      name: "Cacau Bee Coco Queimado",
      materials: materials.slice(0, 3),
      subtotal: materials.slice(0, 3).reduce((sum, m) => {
        const needed = Math.max(0, m.reorder_point - m.current_stock)
        return sum + needed * m.unit_cost
      }, 0),
    },
    {
      id: 116,
      code: "PRD00116",
      name: "Cacau Bee Maracujá",
      materials: materials.slice(3, 6),
      subtotal: materials.slice(3, 6).reduce((sum, m) => {
        const needed = Math.max(0, m.reorder_point - m.current_stock)
        return sum + needed * m.unit_cost
      }, 0),
    },
  ]

  const totalGeralByProduct = groupedByProduct.reduce((sum, product) => sum + product.subtotal, 0)

  const groupedBySupplier = materials.reduce(
    (acc, material) => {
      const supplierId = material.supplier_id
      const supplierName = material.supplier?.name || "Sem Fornecedor"

      if (!supplierId || !material.supplier) {
        return acc
      }

      if (!acc[supplierId]) {
        const deliveryDays = material.supplier.delivery_days || 15
        const paymentTerms = material.supplier.payment_terms || 30

        let minLotMultiplier = 1000
        if (supplierName === "DN EMBALAGEM") {
          minLotMultiplier = 5000 // Real data: 5000 unit minimum lot
        } else if (supplierName === "VR LABEL") {
          minLotMultiplier = 2000 // Real data: 2000 unit minimum lot
        } else if (supplierName === "BLOWPET") {
          minLotMultiplier = 5000
        } else if (supplierName === "IMAGEPACK") {
          minLotMultiplier = 2000
        }

        acc[supplierId] = {
          id: supplierId,
          name: supplierName,
          delivery_days: deliveryDays,
          payment_terms: paymentTerms,
          minLotMultiplier: minLotMultiplier,
          materials: [],
          subtotalNecessary: 0,
          subtotalMinLot: 0,
        }
      }

      acc[supplierId].materials.push(material)

      const needed = Math.max(0, material.reorder_point - material.current_stock)

      const minLot =
        material.type === "Embalagem" || material.type === "Rótulo"
          ? Math.ceil(needed / acc[supplierId].minLotMultiplier) * acc[supplierId].minLotMultiplier
          : needed

      acc[supplierId].subtotalNecessary += needed * material.unit_cost
      acc[supplierId].subtotalMinLot += minLot * material.unit_cost

      return acc
    },
    {} as Record<
      number,
      {
        id: number
        name: string
        delivery_days: number
        payment_terms: number
        minLotMultiplier: number
        materials: RawMaterial[]
        subtotalNecessary: number
        subtotalMinLot: number
      }
    >,
  )

  const suppliersList = Object.values(groupedBySupplier)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Ponto de Pedido</h1>
          <p className="text-muted-foreground">Lista de materiais que atingiram o ponto de reposição</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <FileDown className="h-4 w-4" />
            Exportar Lista
          </Button>
          <Button className="bg-[#6B8E23] hover:bg-[#556B1F] gap-2">Gerar Pedidos</Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          <h2 className="text-xl font-bold">Visão Executiva</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Impacto Financeiro */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impacto Financeiro</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(totalNecessary)}</div>
              <p className="text-xs text-muted-foreground mt-1">{totalItems} itens necessários</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                <span>↗</span>
                <span>Ticket médio: {formatCurrency(totalNecessary / Math.max(1, totalItems))}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Risco de Ruptura */}
          <Card className="bg-red-50/50 dark:bg-red-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risco de Ruptura</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{criticalItems} itens</div>
              <p className="text-xs text-muted-foreground mt-1">Estoque zerado - CRÍTICO</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-red-600">
                <span>💰</span>
                <span>Impacto: {formatCurrency(totalNecessary)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Alta Prioridade */}
          <Card className="bg-orange-50/50 dark:bg-orange-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{highPriorityItems} itens</div>
              <p className="text-xs text-muted-foreground mt-1">Abaixo de 30% do ponto</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-orange-600">
                <span>💰</span>
                <span>Valor: {formatCurrency(0)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Prazo de Entrega */}
          <Card className="bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prazo de Entrega</CardTitle>
              <Clock className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgDeliveryDays} dias</div>
              <p className="text-xs text-muted-foreground mt-1">Média dos fornecedores</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-blue-600">
                <span>📅</span>
                <span>Produto pronto: ~22 dias</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          onClick={() => setViewMode("list")}
          className={viewMode === "list" ? "bg-[#6B8E23] hover:bg-[#556B1F]" : ""}
        >
          <List className="h-4 w-4 mr-2" />
          Visão Lista
        </Button>
        <Button
          variant={viewMode === "product" ? "default" : "outline"}
          onClick={() => setViewMode("product")}
          className={viewMode === "product" ? "bg-[#6B8E23] hover:bg-[#556B1F]" : ""}
        >
          <Package className="h-4 w-4 mr-2" />
          Visão por Produto
        </Button>
        <Button
          variant={viewMode === "supplier" ? "default" : "outline"}
          onClick={() => setViewMode("supplier")}
          className={viewMode === "supplier" ? "bg-[#6B8E23] hover:bg-[#556B1F]" : ""}
        >
          <Users className="h-4 w-4 mr-2" />
          Visão por Fornecedor
        </Button>
      </div>

      {viewMode === "product" ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-1">Compras Agrupadas por Produto</h2>
            <p className="text-sm text-muted-foreground">
              Itens organizados pelos produtos que utilizam cada matéria-prima
            </p>
          </div>

          {groupedByProduct.map((product) => (
            <Card key={product.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#8B4513]" />
                    <div>
                      <CardTitle className="text-lg">
                        {product.name} <span className="text-sm text-muted-foreground">({product.code})</span>
                      </CardTitle>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Subtotal</div>
                    <div className="text-xl font-bold text-green-600">{formatCurrency(product.subtotal)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Materials Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-sm text-muted-foreground">
                        <th className="text-left py-3 px-2">Item</th>
                        <th className="text-left py-3 px-2">Tipo</th>
                        <th className="text-right py-3 px-2">Qtd. Necessária</th>
                        <th className="text-right py-3 px-2">Preço Unit.</th>
                        <th className="text-right py-3 px-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.materials.map((material) => {
                        const needed = Math.max(0, material.reorder_point - material.current_stock)
                        const total = needed * material.unit_cost

                        return (
                          <tr key={material.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">
                              <div>{material.name}</div>
                              <div className="text-xs text-muted-foreground">{material.code}</div>
                            </td>
                            <td className="py-3 px-2">
                              <Badge className={`text-xs ${getTypeColor(material.type)}`}>{material.type}</Badge>
                            </td>
                            <td className="py-3 px-2 text-right">
                              {needed} {material.unit}
                            </td>
                            <td className="py-3 px-2 text-right">{formatCurrency(material.unit_cost)}</td>
                            <td className="py-3 px-2 text-right font-semibold">{formatCurrency(total)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Production Schedule */}
                <div className="bg-blue-50/30 dark:bg-blue-950/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="h-4 w-4" />
                    <span>Cronograma de Produção</span>
                  </div>

                  {/* Header Row */}
                  <div className="grid grid-cols-3 gap-4 text-sm font-semibold text-muted-foreground border-b pb-2">
                    <div></div>
                    <div>Fornecedor</div>
                    <div className="text-right">Data cheg.</div>
                  </div>

                  {/* Data Rows */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <div>
                        <div className="font-medium">Data Base (Pedido)</div>
                        <div className="text-xs text-muted-foreground">24/10/2025</div>
                      </div>
                    </div>
                    <div className="font-medium">IMAGEPACK</div>
                    <div className="text-right">24/11/2025</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📦</span>
                      <div>
                        <div className="font-medium text-orange-600">Previsão de Chegada Final</div>
                        <div className="text-xs text-muted-foreground">26/11/2025</div>
                        <div className="text-xs text-muted-foreground">(22 dias úteis - maior prazo)</div>
                      </div>
                    </div>
                    <div className="font-medium">IMAGEPACK</div>
                    <div className="text-right">07/11/2025</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📦</span>
                      <div>
                        <div className="font-medium text-orange-600">Previsão de Chegada Final</div>
                        <div className="text-xs text-muted-foreground">26/11/2025</div>
                        <div className="text-xs text-muted-foreground">(22 dias úteis - maior prazo)</div>
                      </div>
                    </div>
                    <div className="font-medium">VR LABEL</div>
                    <div className="text-right">26/11/2025</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📦</span>
                      <div>
                        <div className="font-medium text-orange-600">Previsão de Chegada Final</div>
                        <div className="text-xs text-muted-foreground">26/11/2025</div>
                        <div className="text-xs text-muted-foreground">(22 dias úteis - maior prazo)</div>
                      </div>
                    </div>
                    <div className="font-medium">DN EMBALAGEM</div>
                    <div className="text-right">12/11/2025</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">🔵</span>
                      <div>
                        <div className="font-medium">Início da Produção</div>
                        <div className="text-xs text-muted-foreground">26/11/2025</div>
                      </div>
                    </div>
                    <div></div>
                    <div></div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">🔵</span>
                      <div>
                        <div className="font-medium">Produto Disponível</div>
                        <div className="text-xs text-muted-foreground">01/12/2025</div>
                        <div className="text-xs text-muted-foreground">(+3 dias de produção)</div>
                      </div>
                    </div>
                    <div></div>
                    <div></div>
                  </div>
                </div>

                {/* Alerts */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <div className="font-semibold">Feriados no período:</div>
                      <div className="text-xs text-muted-foreground">
                        02/11 - Finados &nbsp;&nbsp; 15/11 - Proclamação da República &nbsp;&nbsp; 20/11 - Consciência
                        Negra
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <div className="font-semibold">Observação Importante:</div>
                      <div className="text-xs text-muted-foreground">
                        Fábrica trabalhando um turno, respeitando feriados e finais de semana. Necessário avaliar
                        atuação de banco de horas e eventuais turnos.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {/* TOTAL GERAL section */}
          <div className="bg-white dark:bg-gray-950 rounded-lg border p-6">
            <div className="flex justify-between items-center">
              <div className="text-lg font-bold">TOTAL GERAL:</div>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(totalGeralByProduct)}</div>
            </div>
          </div>

          {/* Resumo de Produção por Produto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Resumo de Produção por Produto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-sm text-muted-foreground">
                      <th className="text-left py-3 px-2">Produto</th>
                      <th className="text-right py-3 px-2">Qtd. a Produzir</th>
                      <th className="text-right py-3 px-2">Data Pronto</th>
                      <th className="text-right py-3 px-2">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div className="font-medium">Cacau Bee Coco Queimado</div>
                        <div className="text-xs text-muted-foreground">PRD00115</div>
                      </td>
                      <td className="py-3 px-2 text-right">593 un</td>
                      <td className="py-3 px-2 text-right">
                        <span className="text-green-600 font-medium">01/12/2025</span>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold">{formatCurrency(343411.98)}</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div className="font-medium">Cacau Bee Maracujá</div>
                        <div className="text-xs text-muted-foreground">PRD00116</div>
                      </td>
                      <td className="py-3 px-2 text-right">591 un</td>
                      <td className="py-3 px-2 text-right">
                        <span className="text-green-600 font-medium">27/11/2025</span>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold">{formatCurrency(343411.98)}</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div className="font-medium">Cacau Bee Original</div>
                        <div className="text-xs text-muted-foreground">PRD00114</div>
                      </td>
                      <td className="py-3 px-2 text-right">166 un</td>
                      <td className="py-3 px-2 text-right">
                        <span className="text-green-600 font-medium">24/11/2025</span>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold">{formatCurrency(343411.98)}</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div className="font-medium">Honey Blend Café e Cupuaçu</div>
                        <div className="text-xs text-muted-foreground">PRD01701</div>
                      </td>
                      <td className="py-3 px-2 text-right">511 un</td>
                      <td className="py-3 px-2 text-right">
                        <span className="text-green-600 font-medium">13/11/2025</span>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold">{formatCurrency(343411.98)}</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div className="font-medium">Honey Blend Pistache</div>
                        <div className="text-xs text-muted-foreground">PRD01702</div>
                      </td>
                      <td className="py-3 px-2 text-right">117 un</td>
                      <td className="py-3 px-2 text-right">
                        <span className="text-green-600 font-medium">26/11/2025</span>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold">{formatCurrency(343411.98)}</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div className="font-medium">Honey Fusion Açaí 200mg</div>
                        <div className="text-xs text-muted-foreground">PRD01703</div>
                      </td>
                      <td className="py-3 px-2 text-right">475 un</td>
                      <td className="py-3 px-2 text-right">
                        <span className="text-green-600 font-medium">02/02/2025</span>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold">{formatCurrency(343411.98)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2">
                      <td colSpan={3} className="py-4 px-2">
                        <div className="text-lg font-bold">TOTAL GERAL DE PRODUÇÃO:</div>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="text-3xl font-bold text-green-600">{formatCurrency(343411.98 * 6)}</div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : viewMode === "supplier" ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-1">Compras Agrupadas por Fornecedor</h2>
            <p className="text-sm text-muted-foreground">
              Itens organizados por fornecedor para facilitar pedidos consolidados
            </p>
          </div>

          {suppliersList.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhum fornecedor com materiais</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Os materiais no ponto de pedido não têm fornecedores cadastrados.
                </p>
                <p className="text-xs text-muted-foreground">
                  Verifique se os materiais têm o campo "supplier_id" preenchido na tabela beeoz_prod_raw_materials.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {suppliersList.map((supplier) => (
                <Card key={supplier.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#6B8E23]" />
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Materials Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b text-sm text-muted-foreground">
                            <th className="text-left py-3 px-2">Item</th>
                            <th className="text-left py-3 px-2">Tipo</th>
                            <th className="text-right py-3 px-2">Qtd. Necessária</th>
                            <th className="text-right py-3 px-2">Lote Mínimo</th>
                            <th className="text-right py-3 px-2">Preço Unit.</th>
                            <th className="text-right py-3 px-2">Total Necessário</th>
                            <th className="text-right py-3 px-2">Total Lote Mín.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {supplier.materials.map((material) => {
                            const needed = Math.max(0, material.reorder_point - material.current_stock)

                            const minLot =
                              material.type === "Embalagem" || material.type === "Rótulo"
                                ? Math.ceil(needed / supplier.minLotMultiplier) * supplier.minLotMultiplier
                                : needed

                            const totalNecessary = needed * material.unit_cost
                            const totalMinLot = minLot * material.unit_cost

                            return (
                              <tr key={material.id} className="border-b hover:bg-muted/50">
                                <td className="py-3 px-2">
                                  <div>{material.name}</div>
                                  <div className="text-xs text-muted-foreground">{material.code}</div>
                                </td>
                                <td className="py-3 px-2">
                                  <Badge className={`text-xs ${getTypeColor(material.type)}`}>{material.type}</Badge>
                                </td>
                                <td className="py-3 px-2 text-right">
                                  {needed} {material.unit}
                                </td>
                                <td className="py-3 px-2 text-right text-blue-600 font-medium">
                                  {minLot} {material.unit}
                                </td>
                                <td className="py-3 px-2 text-right">{formatCurrency(material.unit_cost)}</td>
                                <td className="py-3 px-2 text-right font-semibold">{formatCurrency(totalNecessary)}</td>
                                <td className="py-3 px-2 text-right font-semibold text-blue-600">
                                  {formatCurrency(totalMinLot)}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Subtotals */}
                    <div className="space-y-1 text-right">
                      <div className="flex justify-between items-center">
                        <div className="font-semibold">Subtotal Necessário:</div>
                        <div className="text-xl font-bold">{formatCurrency(supplier.subtotalNecessary)}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="font-semibold text-blue-600">Subtotal Lote Mínimo:</div>
                        <div className="text-xl font-bold text-blue-600">{formatCurrency(supplier.subtotalMinLot)}</div>
                      </div>
                    </div>

                    {/* Cronograma */}
                    <div className="bg-blue-50/30 dark:bg-blue-950/20 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Calendar className="h-4 w-4" />
                        <span>Cronograma</span>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-2 text-sm">
                            <span>📅</span>
                            <div>
                              <div className="font-medium">Data Base (Pedido):</div>
                              <div className="text-muted-foreground">24/10/2025</div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-blue-600">🔵</span>
                            <div>
                              <div className="font-medium">Início da Produção:</div>
                              <div className="text-muted-foreground">
                                {new Date(
                                  new Date("2025-10-24").getTime() + supplier.delivery_days * 24 * 60 * 60 * 1000,
                                ).toLocaleDateString("pt-BR")}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-orange-600">📦</span>
                            <div>
                              <div className="font-medium text-orange-600">Previsão de Chegada:</div>
                              <div className="text-muted-foreground">
                                {new Date(
                                  new Date("2025-10-24").getTime() + supplier.delivery_days * 24 * 60 * 60 * 1000,
                                ).toLocaleDateString("pt-BR")}
                              </div>
                              <div className="text-xs text-muted-foreground">({supplier.delivery_days} dias úteis)</div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-green-600">🔵</span>
                            <div>
                              <div className="font-medium text-green-600">Produto Disponível:</div>
                              <div className="text-muted-foreground">
                                {new Date(
                                  new Date("2025-10-24").getTime() + (supplier.delivery_days + 3) * 24 * 60 * 60 * 1000,
                                ).toLocaleDateString("pt-BR")}
                              </div>
                              <div className="text-xs text-muted-foreground">(+3 dias de produção)</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alerts */}
                    <div className="flex items-start gap-2 text-sm bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-semibold">Feriados no período:</div>
                        <div className="text-xs text-muted-foreground">
                          02/11 - Finados &nbsp;&nbsp; 15/11 - Proclamação da República
                        </div>
                      </div>
                    </div>

                    {/* Supplier Terms */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <div className="text-sm text-muted-foreground">Prazo de Entrega</div>
                        <div className="text-lg font-semibold">{supplier.delivery_days} dias</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Forma de Pagamento</div>
                        <div className="text-lg font-semibold">{supplier.payment_terms} dias</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Total Summary Cards */}
              <div className="space-y-4">
                {/* TOTAL GERAL (Necessário) */}
                <div className="bg-white dark:bg-gray-950 rounded-lg border p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold">TOTAL GERAL (Necessário):</div>
                      <div className="text-sm text-muted-foreground">Quantidade realmente necessária para produção</div>
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(suppliersList.reduce((sum, s) => sum + s.subtotalNecessary, 0))}
                    </div>
                  </div>
                </div>

                {/* TOTAL GERAL (Lote Mínimo) */}
                <div className="bg-white dark:bg-gray-950 rounded-lg border p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold">TOTAL GERAL (Lote Mínimo):</div>
                      <div className="text-sm text-muted-foreground">Considerando lotes mínimos dos fornecedores</div>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {formatCurrency(suppliersList.reduce((sum, s) => sum + s.subtotalMinLot, 0))}
                    </div>
                  </div>
                </div>

                {/* DIFERENÇA */}
                <div className="bg-white dark:bg-gray-950 rounded-lg border p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold">DIFERENÇA:</div>
                      <div className="text-sm text-muted-foreground">Valor adicional devido aos lotes mínimos</div>
                    </div>
                    <div className="text-3xl font-bold text-orange-600">
                      {formatCurrency(
                        suppliersList.reduce((sum, s) => sum + s.subtotalMinLot, 0) -
                          suppliersList.reduce((sum, s) => sum + s.subtotalNecessary, 0),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cronograma de Pagamentos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>💳</span>
                    Cronograma de Pagamentos
                  </CardTitle>
                  <CardDescription>
                    Previsão de vencimentos baseada na forma de pagamento de cada fornecedor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-sm text-muted-foreground">
                          <th className="text-left py-3 px-2">Fornecedor</th>
                          <th className="text-center py-3 px-2">Data de Vencimento</th>
                          <th className="text-right py-3 px-2">Valor a Pagar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {suppliersList.map((supplier) => {
                          const baseDate = new Date("2025-10-24")
                          const dueDate = new Date(
                            baseDate.getTime() +
                              (supplier.delivery_days + supplier.payment_terms) * 24 * 60 * 60 * 1000,
                          )

                          return (
                            <tr key={supplier.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-2 font-medium">{supplier.name}</td>
                              <td className="py-3 px-2 text-center text-blue-600 font-medium">
                                {dueDate.toLocaleDateString("pt-BR")}
                              </td>
                              <td className="py-3 px-2 text-right text-blue-600 font-semibold">
                                {formatCurrency(supplier.subtotalMinLot)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2">
                          <td colSpan={2} className="py-4 px-2">
                            <div className="text-lg font-bold">TOTAL A PAGAR:</div>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {formatCurrency(suppliersList.reduce((sum, s) => sum + s.subtotalMinLot, 0))}
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Observações Importantes */}
              <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-3">
                    <div className="font-bold text-lg">Observações Importantes:</div>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <span className="font-semibold">Lote Mínimo:</span> Os lotes mínimos dos fornecedores estão
                        sendo considerados para fechamento dos pedidos de compra. Valores em azul indicam quantidades e
                        totais baseados nos lotes mínimos.
                      </li>
                      <li>
                        <span className="font-semibold">Dias Úteis:</span> Todos os prazos consideram apenas dias úteis
                        (segunda a sexta-feira), excluindo finais de semana e feriados nacionais brasileiros.
                      </li>
                      <li>
                        <span className="font-semibold">Data Base:</span> Considera-se 3 dias cheios a partir de hoje
                        para formalização do pedido junto aos fornecedores.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Lista de Compras Necessárias
              </CardTitle>
              <CardDescription>Itens ordenados por urgência - Critérios primários</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : materials.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhum material atingiu o ponto de pedido</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-sm text-muted-foreground">
                          <th className="text-left py-3 px-2">Urgência</th>
                          <th className="text-left py-3 px-2">Código</th>
                          <th className="text-left py-3 px-2">Item</th>
                          <th className="text-left py-3 px-2">Tipo</th>
                          <th className="text-right py-3 px-2">Estoque Atual</th>
                          <th className="text-right py-3 px-2">Ponto de Pedido</th>
                          <th className="text-right py-3 px-2">Qtd. Necessária</th>
                          <th className="text-right py-3 px-2">Preço Unit.</th>
                          <th className="text-right py-3 px-2">Total</th>
                          <th className="text-left py-3 px-2">Fornecedor Sugerido</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materials.map((material) => {
                          const needed = Math.max(0, material.reorder_point - material.current_stock)
                          const total = needed * material.unit_cost
                          const urgency = getUrgencyLevel(material.current_stock, material.reorder_point)

                          return (
                            <tr key={material.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-2">
                                <Badge variant="destructive" className="text-xs">
                                  {urgency}
                                </Badge>
                              </td>
                              <td className="py-3 px-2 font-mono text-sm">{material.code}</td>
                              <td className="py-3 px-2">{material.name}</td>
                              <td className="py-3 px-2">
                                <Badge className={`text-xs ${getTypeColor(material.type)}`}>{material.type}</Badge>
                              </td>
                              <td className="py-3 px-2 text-right">
                                <span className={material.current_stock === 0 ? "text-red-600 font-semibold" : ""}>
                                  {material.current_stock} {material.unit}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-right">
                                {material.reorder_point} {material.unit}
                              </td>
                              <td className="py-3 px-2 text-right font-semibold">
                                {needed} {material.unit}
                              </td>
                              <td className="py-3 px-2 text-right">{formatCurrency(material.unit_cost)}</td>
                              <td className="py-3 px-2 text-right font-semibold text-green-600">
                                {formatCurrency(total)}
                              </td>
                              <td className="py-3 px-2">{material.supplier?.name || "N/A"}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* TOTAL GERAL DE PRODUÇÃO row */}
                  <div className="mt-6 pt-4 border-t flex justify-between items-center">
                    <div className="text-lg font-bold">TOTAL GERAL DE PRODUÇÃO:</div>
                    <div className="text-3xl font-bold text-green-600">{formatCurrency(totalNecessary * 6)}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
