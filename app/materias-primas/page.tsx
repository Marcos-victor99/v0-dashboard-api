"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, TrendingUp, Package, Users, FileText, ShoppingCart, MoreVertical } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

type RawMaterial = {
  id: number
  code: string
  name: string
  type: string
  current_stock: number
  min_stock: number
  reorder_point: number
  unit: string
  unit_cost: number
  status: string
}

export default function MateriasPrimas() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [materials, setMaterials] = useState<RawMaterial[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("beeoz_prod_raw_materials")
        .select("*")
        .eq("status", "ativo")
        .order("name")

      if (error) throw error
      setMaterials(data || [])
    } catch (error) {
      console.error("[v0] Error fetching materials:", error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: materials.length,
    normal: materials.filter((m) => m.current_stock > m.reorder_point).length,
    low: materials.filter(
      (m) => m.current_stock > 0 && m.current_stock <= m.reorder_point && m.current_stock > m.min_stock,
    ).length,
    critical: materials.filter((m) => m.current_stock <= m.min_stock).length,
  }

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || material.type === typeFilter
    return matchesSearch && matchesType
  })

  const calculateNeed = (current: number, reorderPoint: number) => {
    const need = Math.max(0, reorderPoint - current)
    return need
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando matérias-primas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Matérias-Primas</h1>
          <p className="text-muted-foreground">Gestão de ingredientes, embalagens e insumos para produção</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <TrendingUp className="h-4 w-4 mr-2" />
          Análise de Compras
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Itens</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Estoque Normal</CardTitle>
              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.normal}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Estoque Baixo</CardTitle>
              <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-orange-600"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.low}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Estoque Crítico</CardTitle>
              <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-red-600"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
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
                <SelectItem value="Insumo">Insumo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Materials Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMaterials.map((material) => {
          const need = calculateNeed(material.current_stock, material.reorder_point)

          return (
            <Card key={material.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{material.name}</CardTitle>
                    <CardDescription className="text-sm text-blue-600">{material.code}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {material.type}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Stock */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estoque Atual:</p>
                  <p className="text-3xl font-bold">
                    {material.current_stock} {material.unit}
                  </p>
                </div>

                {/* Stock Metrics */}
                <div className="grid grid-cols-3 gap-2 text-sm">
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
                    <p className="font-semibold text-red-600">
                      {need} {material.unit}
                    </p>
                  </div>
                </div>

                {/* Stock Level Indicator */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{material.current_stock}</p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="default" size="sm" className="bg-[#6b8e23] hover:bg-[#5a7a1e]">
                    <Package className="h-3 w-3 mr-1" />
                    Ver Detalhes
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-3 w-3 mr-1" />
                    Ficha Técnica
                  </Button>
                  <Button variant="outline" size="sm">
                    <Users className="h-3 w-3 mr-1" />
                    Fornecedores
                  </Button>
                  <Button variant="outline" size="sm">
                    <Package className="h-3 w-3 mr-1" />
                    Lotes
                  </Button>
                </div>

                {/* Purchase Button */}
                <Button className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Comprar
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma matéria-prima encontrada.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
