"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Users,
  FileText,
  ShoppingCart,
  DollarSign,
  BarChart3,
  ArrowLeft,
  PackageOpen,
} from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

export default function MateriaPrimaDetalhes() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id ? Number.parseInt(params.id as string) : 0

  const [rawMaterial, setRawMaterial] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    "https://vdhxtlnadjejyyydmlit.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkaHh0bG5hZGplanl5eWRtbGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODAzMDEsImV4cCI6MjA1Njc1NjMwMX0.TWzazmeto1Ic5cNAf7LrDjHcrbuaofCid_3xNiBnVkE",
  )

  useEffect(() => {
    fetchMaterialDetails()
  }, [id])

  async function fetchMaterialDetails() {
    try {
      console.log("[v0] Fetching material details for ID:", id)

      const { data, error } = await supabase.from("produtos").select("*").eq("id", id).single()

      if (error) {
        console.error("[v0] Error fetching material:", error)
        throw error
      }

      console.log("[v0] Material data:", data)

      setRawMaterial({
        id: data.id,
        code: data.identificacao || "",
        name: data.descricao || "",
        type: data.tipo || "",
        currentStock: data.estoque_atual || 0,
        minStock: data.quantidade_minima || 0,
        reorderPoint: data.ponto_reposicao || data.quantidade_minima || 0,
        unit: data.unidade_medida || "UN",
        unitCost: data.valor_custo || 0,
        status: data.status || "ativo",
      })
    } catch (error) {
      console.error("[v0] Error fetching material details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando detalhes...</p>
        </div>
      </div>
    )
  }

  if (!rawMaterial) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Material não encontrado</h3>
          <Link href="/materias-primas">
            <Button>Voltar para Matérias-Primas</Button>
          </Link>
        </div>
      </div>
    )
  }

  const stockLevel = rawMaterial.currentStock || 0
  const minStock = rawMaterial.minStock || 0
  const stockPercentage = minStock > 0 ? (stockLevel / minStock) * 100 : 0

  const getStockStatus = () => {
    if (stockLevel === 0) return { label: "Crítico", color: "destructive", icon: AlertTriangle }
    if (stockLevel < minStock) return { label: "Baixo", color: "warning", icon: TrendingDown }
    return { label: "Normal", color: "success", icon: CheckCircle2 }
  }

  const status = getStockStatus()
  const StatusIcon = status.icon

  const suppliersCount = 0 // TODO: Fetch from database
  const productsCount = 0 // TODO: Fetch from database

  return (
    <div className="space-y-6 p-6">
      <Link href="/materias-primas">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Matérias-Primas
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <PackageOpen className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{rawMaterial.name}</h1>
            <p className="text-muted-foreground mt-1">Código: {rawMaterial.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Ficha Técnica
          </Button>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Fornecedores ({suppliersCount})
          </Button>
          <Button variant="outline">
            <Package className="h-4 w-4 mr-2" />
            Lotes
          </Button>
          <Button variant="default" className="bg-green-600 hover:bg-green-700">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Comprar
          </Button>
          <Badge variant="destructive" className="text-sm px-3 py-1">
            <StatusIcon className="h-4 w-4 mr-1" />
            Crítico
          </Badge>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Atual</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stockLevel} {rawMaterial.unit}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo: {minStock} {rawMaterial.unit}
            </p>
            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  stockPercentage < 50 ? "bg-destructive" : stockPercentage < 100 ? "bg-warning" : "bg-success"
                }`}
                style={{ width: `${Math.min(stockPercentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Nenhum cadastrado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos que Usam</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Não utilizado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rawMaterial.unitCost ? `R$ ${rawMaterial.unitCost.toFixed(2)}` : "-"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Por {rawMaterial.unit}</p>
          </CardContent>
        </Card>
      </div>

      {/* Informações de Estoque e Detalhes */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Estoque Atual:</p>
                <p className="text-lg font-semibold">
                  {stockLevel} {rawMaterial.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estoque Mínimo:</p>
                <p className="text-lg font-semibold">
                  {minStock} {rawMaterial.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ponto de Reposição:</p>
                <p className="text-lg font-semibold">
                  {rawMaterial.reorderPoint || 0} {rawMaterial.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lote Econômico:</p>
                <p className="text-lg font-semibold">0 {rawMaterial.unit}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Nível de Estoque</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      stockPercentage < 50 ? "bg-destructive" : stockPercentage < 100 ? "bg-warning" : "bg-success"
                    }`}
                    style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{stockPercentage.toFixed(0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Detalhes do Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Tipo:</p>
              <Badge variant="outline" className="mt-1">
                Ingrediente
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Unidade de Medida:</p>
              <p className="text-lg font-semibold mt-1">{rawMaterial.unit}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">0</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Valor em Estoque:</p>
              <p className="text-lg font-semibold mt-1">
                {rawMaterial.unitCost ? `R$ ${(stockLevel * rawMaterial.unitCost).toFixed(2)}` : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
