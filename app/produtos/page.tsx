"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ShoppingCart, FileText, Package, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase-client"

interface Product {
  id: number
  code: string
  name: string
  category_id: string
  current_stock: number
  status: string
  category?: {
    name: string
    icon: string
  }
  // Campos calculados/mock para o exemplo
  min_stock: number
  reorder_point: number
  eoq: number
  shelf_life_days: number
  lot_setup: number
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const supabase = createClient()

      // Buscar categorias
      const { data: categoriesData } = await supabase.from("beeoz_prod_categories").select("*")

      // Buscar produtos
      const { data: productsData } = await supabase.from("beeoz_prod_products").select("*")

      if (categoriesData) setCategories(categoriesData)

      if (productsData) {
        // Enriquecer produtos com dados da categoria e campos mock
        const enrichedProducts = productsData.map((product) => {
          const category = categoriesData?.find((c) => c.id === product.category_id)
          return {
            ...product,
            category,
            min_stock: 50,
            reorder_point: 75,
            eoq: 500,
            shelf_life_days: 730,
            lot_setup: 100,
          }
        })
        setProducts(enrichedProducts)
      }
    } catch (error) {
      console.error("[v0] Erro ao buscar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory

    return matchesSearch && matchesCategory
  })

  const totalProducts = products.length
  const normalStock = products.filter((p) => p.current_stock >= p.reorder_point).length
  const lowStock = products.filter((p) => p.current_stock < p.reorder_point && p.current_stock > 0).length
  const criticalStock = products.filter((p) => p.current_stock === 0).length

  const getStockLevel = (product: Product) => {
    if (product.current_stock === 0) return "critical"
    if (product.current_stock < product.reorder_point) return "low"
    return "normal"
  }

  const getStockPercentage = (product: Product) => {
    return Math.min((product.current_stock / product.eoq) * 100, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Catálogo de Produtos</h1>
          <p className="text-muted-foreground">Gestão de produtos acabados da Beeoz</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Análise de Compras
        </Button>
      </div>

      {/* Search and Filter */}
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
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estoque Normal</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{normalStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estoque Crítico</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
          const stockLevel = getStockLevel(product)
          const stockPercentage = getStockPercentage(product)

          return (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.code}</p>
                  </div>
                  <Badge
                    variant={stockLevel === "normal" ? "default" : "secondary"}
                    className={
                      stockLevel === "normal"
                        ? "bg-green-600 hover:bg-green-700"
                        : stockLevel === "low"
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-red-600 hover:bg-red-700"
                    }
                  >
                    {stockLevel === "normal" ? "Normal" : stockLevel === "low" ? "Baixo" : "Crítico"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <FileText className="h-3 w-3 mr-1" />
                    Ficha Técnica
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Package className="h-3 w-3 mr-1" />
                    Lotes
                  </Button>
                </div>

                {/* Category */}
                {product.category && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{product.category.icon}</span>
                    <span className="font-medium">{product.category.name}</span>
                  </div>
                )}

                {/* Stock Info */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estoque Atual:</span>
                    <span className="font-bold">{product.current_stock} un</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estoque Mínimo:</span>
                    <span>{product.min_stock} un</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ponto de Reposição:</span>
                    <span>{product.reorder_point} un</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lote Econômico (EOQ):</span>
                    <span>{product.eoq} un</span>
                  </div>
                </div>

                {/* Stock Level Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nível de Estoque</span>
                    <span className="font-medium text-green-600">{stockPercentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={stockPercentage} className="h-2" />
                </div>

                {/* Additional Info */}
                <div className="pt-2 border-t space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Validade:</span>
                    <span>{product.shelf_life_days} dias</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lote Setup:</span>
                    <span>{product.lot_setup} un</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Nenhum produto encontrado</p>
            <p className="text-sm text-muted-foreground">Tente ajustar os filtros ou termo de busca</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
