"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Search, ShoppingCart, Package, AlertTriangle, AlertCircle } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Product = {
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
}

export default function Produtos() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const { data, error } = await supabase
        .from("beeoz_prod_products")
        .select(`
          *,
          category:beeoz_prod_categories(name, icon)
        `)
        .order("code", { ascending: true })

      if (error) {
        console.error("Error fetching products:", error)
      } else {
        setProducts(data || [])
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  const getStockStatus = (product: Product) => {
    const stock = product.current_stock || 0
    if (stock === 0) return "critical"
    if (stock < 50) return "low"
    return "normal"
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalProducts = products.length
  const normalStock = products.filter((p) => getStockStatus(p) === "normal").length
  const lowStock = products.filter((p) => getStockStatus(p) === "low").length
  const criticalStock = products.filter((p) => getStockStatus(p) === "critical").length

  const getStockPercentage = (currentStock: number) => {
    const maxStock = 15000 // Assuming max stock for visualization
    return Math.min((currentStock / maxStock) * 100, 100)
  }

  const categories = Array.from(new Set(products.map((p) => p.category_id).filter(Boolean)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Catálogo de Produtos</h1>
          <p className="text-muted-foreground">Gestão de produtos acabados da Beeoz</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Análise de Compras
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-green-600" />
            </div>
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

      {loading ? (
        <div className="text-center py-12">Carregando produtos...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product)
            const stockPercentage = getStockPercentage(product.current_stock || 0)

            return (
              <Card key={product.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold leading-tight">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{product.code}</p>
                    </div>
                    <Badge
                      variant={stockStatus === "normal" ? "default" : "secondary"}
                      className={
                        stockStatus === "normal"
                          ? "bg-green-600 hover:bg-green-700"
                          : stockStatus === "low"
                            ? "bg-yellow-600 hover:bg-yellow-700"
                            : "bg-red-600 hover:bg-red-700"
                      }
                    >
                      {stockStatus === "normal" ? "Normal" : stockStatus === "low" ? "Baixo" : "Crítico"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="ficha" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="ficha" className="text-xs">
                        📋 Ficha Técnica
                      </TabsTrigger>
                      <TabsTrigger value="lotes" className="text-xs">
                        📦 Lotes
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="ficha" className="space-y-3 mt-4">
                      {product.category && (
                        <div className="flex items-center gap-2 text-sm">
                          <span>{product.category.icon}</span>
                          <span className="font-medium">{product.category.name}</span>
                        </div>
                      )}

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estoque Atual:</span>
                          <span
                            className={`font-semibold ${
                              stockStatus === "normal"
                                ? "text-green-600"
                                : stockStatus === "low"
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {product.current_stock || 0} un
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estoque Mínimo:</span>
                          <span className="font-medium">50 un</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ponto de Reposição:</span>
                          <span className="font-medium">75 un</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lote Econômico (EOQ):</span>
                          <span className="font-medium">500 un</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Nível de Estoque</span>
                          <span
                            className={
                              stockStatus === "normal"
                                ? "text-green-600"
                                : stockStatus === "low"
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }
                          >
                            {stockPercentage.toFixed(0)}%
                          </span>
                        </div>
                        <Progress
                          value={stockPercentage}
                          className="h-2"
                          indicatorClassName={
                            stockStatus === "normal"
                              ? "bg-green-600"
                              : stockStatus === "low"
                                ? "bg-yellow-600"
                                : "bg-red-600"
                          }
                        />
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>Validade: 730 dias</span>
                        <span>Lote Setup: 100 un</span>
                      </div>
                    </TabsContent>
                    <TabsContent value="lotes" className="mt-4">
                      <p className="text-sm text-muted-foreground text-center py-4">Informações de lotes em breve</p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">Nenhum produto encontrado</div>
      )}
    </div>
  )
}
