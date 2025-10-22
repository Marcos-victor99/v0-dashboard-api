"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Package,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ShoppingCart,
  FileText,
  Users,
  PackageOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface RawMaterial {
  id: number
  code: string
  name: string
  type: string
  current_stock: number
  min_stock: number
  reorder_point: number
  unit: string
  unit_cost: number
}

export default function MateriasPrimas() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [materials, setMaterials] = useState<RawMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchMaterials()
  }, [])

  async function fetchMaterials() {
    try {
      const { data, error } = await supabase.from("beeoz_prod_raw_materials").select("*").order("name")

      if (error) throw error
      setMaterials(data || [])
    } catch (error) {
      console.error("Error fetching materials:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCard = (id: number) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCards(newExpanded)
  }

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || material.type === typeFilter
    return matchesSearch && matchesType
  })

  const getStockStatus = (current: number, reorderPoint: number) => {
    if (current === 0) return "critical"
    if (current <= reorderPoint * 0.5) return "low"
    if (current <= reorderPoint) return "normal"
    return "good"
  }

  const stockStats = {
    total: materials.length,
    normal: materials.filter((m) => {
      const status = getStockStatus(m.current_stock, m.reorder_point)
      return status === "good"
    }).length,
    low: materials.filter((m) => {
      const status = getStockStatus(m.current_stock, m.reorder_point)
      return status === "low"
    }).length,
    critical: materials.filter((m) => {
      const status = getStockStatus(m.current_stock, m.reorder_point)
      return status === "critical"
    }).length,
  }

  const calculateNecessity = (current: number, reorderPoint: number) => {
    const need = Math.max(0, reorderPoint - current)
    return need
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando matérias-primas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Matérias-Primas</h1>
          <p className="text-muted-foreground">Gestão de ingredientes, embalagens e insumos para produção</p>
        </div>
        <Button>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Análise de Compras
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Itens</p>
                <p className="text-3xl font-bold mt-2">{stockStats.total}</p>
              </div>
              <Package className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estoque Normal</p>
                <p className="text-3xl font-bold mt-2">{stockStats.normal}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estoque Baixo</p>
                <p className="text-3xl font-bold mt-2">{stockStats.low}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estoque Crítico</p>
                <p className="text-3xl font-bold mt-2">{stockStats.critical}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Filtros</h3>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos os Tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="Ingrediente">Ingrediente</SelectItem>
              <SelectItem value="Embalagem">Embalagem</SelectItem>
              <SelectItem value="Rótulo">Rótulo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMaterials.map((material) => {
          const necessity = calculateNecessity(material.current_stock, material.reorder_point)
          const isExpanded = expandedCards.has(material.id)
          const stockStatus = getStockStatus(material.current_stock, material.reorder_point)

          return (
            <Card key={material.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{material.name}</h3>
                    <p className="text-sm text-muted-foreground">{material.code}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        stockStatus === "critical" ? "destructive" : stockStatus === "low" ? "warning" : "success"
                      }
                    >
                      {material.type}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => toggleCard(material.id)} className="h-6 w-6 p-0">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-1">Estoque Atual:</p>
                  <p className="text-4xl font-bold">
                    {material.current_stock} {material.unit}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Estoque Mínimo</p>
                    <p className="font-semibold">
                      {material.min_stock} {material.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Ponto de Pedido</p>
                    <p className="font-semibold">
                      {material.reorder_point} {material.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Necessidade</p>
                    <p className="font-semibold text-orange-600">
                      {necessity} {material.unit}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="default">
                    <PackageOpen className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Ficha Técnica
                  </Button>
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Fornecedores
                  </Button>
                  <Button variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Lotes
                  </Button>
                </div>

                <Button className="w-full">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Comprar
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum material encontrado</h3>
          <p className="text-muted-foreground">Tente ajustar os filtros ou termos de busca.</p>
        </div>
      )}
    </div>
  )
}
