"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ShoppingCart, Package, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Product = {
  id: number
  identificacao: string
  descricao: string
  unidade_medida: string
  tipo: string
  status: string
  valor_venda: number
  valor_custo: number
  qtde_minima?: number
  qtde_seguranca?: number
  lote_minimo_compra?: number
  ncm?: string
  origem?: string
  [key: string]: any
}

export default function Produtos() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient()

      console.log("[v0] Fetching products from 'produtos' table...")
      const { data, error } = await supabase.from("produtos").select("*").order("identificacao", { ascending: true })

      if (error) {
        console.error("[v0] Error fetching products:", error)
      } else {
        console.log("[v0] Products fetched successfully:", data)
        console.log("[v0] First product structure:", data?.[0])
        setProducts(data || [])
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  const getStockStatus = (product: Product) => {
    const minQty = product.qtde_minima || 50
    const safetyQty = product.qtde_seguranca || 100

    // Since we don't have current stock in this table, we'll show all as normal for now
    // In a real scenario, you'd join with an inventory table
    return "normal"
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.identificacao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.tipo === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalProducts = products.length
  const normalStock = products.filter((p) => getStockStatus(p) === "normal").length
  const lowStock = products.filter((p) => getStockStatus(p) === "low").length
  const criticalStock = products.filter((p) => getStockStatus(p) === "critical").length

  const getStockPercentage = (currentStock: number) => {
    const maxStock = 15000
    return Math.min((currentStock / maxStock) * 100, 100)
  }

  const categories = Array.from(new Set(products.map((p) => p.tipo).filter(Boolean)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Catálogo de Produtos</h1>
          <p className="text-muted-foreground">Gestão de produtos acabados da Beeoz</p>
        </div>
        <Button>
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
            <Package className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estoque Normal</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{normalStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estoque Crítico</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalStock}</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando produtos...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product)
            const currentStock = 1000 // Mock value - would need to join with inventory table
            const stockPercentage = getStockPercentage(currentStock)

            return (
              <Card key={product.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold leading-tight">{product.descricao}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{product.identificacao}</p>
                    </div>
                    <Badge variant={product.status === "ativo" ? "success" : "destructive"}>
                      {product.status === "ativo" ? "Ativo" : "Inativo"}
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
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tipo:</span>
                          <span className="font-medium">{product.tipo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unidade:</span>
                          <span className="font-medium">{product.unidade_medida}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Valor Venda:</span>
                          <span className="font-semibold text-green-600">R$ {product.valor_venda.toFixed(2)}</span>
                        </div>
                        {product.qtde_minima > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Qtd. Mínima:</span>
                            <span className="font-medium">
                              {product.qtde_minima} {product.unidade_medida}
                            </span>
                          </div>
                        )}
                        {product.lote_minimo_compra > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Lote Mínimo:</span>
                            <span className="font-medium">
                              {product.lote_minimo_compra} {product.unidade_medida}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>NCM: {product.ncm || "N/A"}</span>
                        <span>Origem: {product.origem || "N/A"}</span>
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
