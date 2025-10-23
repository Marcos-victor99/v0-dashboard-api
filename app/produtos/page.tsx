"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  ShoppingCart,
  Package,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Filter,
  X,
  Calendar,
  MapPin,
  Warehouse,
  Clock,
  TrendingUp,
  BarChart3,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

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
  estoque_atual?: number
  lotes?: any[]
  [key: string]: any
}

export default function Produtos() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [statusFilter, setStatusFilter] = useState<"ativo" | "inativo" | "todos">("ativo")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProductForLots, setSelectedProductForLots] = useState<Product | null>(null)
  const [isLotesDialogOpen, setIsLotesDialogOpen] = useState(false)

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [stockLevelFilter, setStockLevelFilter] = useState<"all" | "normal" | "low" | "critical">("all")
  const [priceRangeMin, setPriceRangeMin] = useState("")
  const [priceRangeMax, setPriceRangeMax] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "stock" | "price" | "code">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient()
      setLoading(true)

      try {
        console.log("[v0] Fetching products and lotes separately...")

        // Fetch all products in batches
        let allProducts: any[] = []
        let productsStart = 0
        const productsBatchSize = 1000
        let hasMoreProducts = true

        while (hasMoreProducts) {
          let query = supabase
            .from("produtos")
            .select("*", { count: "exact" })
            .range(productsStart, productsStart + productsBatchSize - 1)

          if (statusFilter !== "todos") {
            query = query.eq("status", statusFilter)
          }

          const { data: batch, error, count } = await query.order("identificacao", { ascending: true })

          if (error) {
            console.error("[v0] Error fetching products:", error)
            setLoading(false)
            return
          }

          if (batch && batch.length > 0) {
            allProducts = [...allProducts, ...batch]
            console.log(`[v0] Fetched products batch: ${batch.length} (total: ${allProducts.length} of ${count})`)

            if (batch.length < productsBatchSize || allProducts.length >= (count || 0)) {
              hasMoreProducts = false
            } else {
              productsStart += productsBatchSize
            }
          } else {
            hasMoreProducts = false
          }
        }

        console.log(`[v0] Total products fetched: ${allProducts.length}`)

        // Fetch all lotes in batches
        let allLotes: any[] = []
        let lotesStart = 0
        const lotesBatchSize = 1000
        let hasMoreLotes = true

        while (hasMoreLotes) {
          const { data: lotesBatch, error: lotesError } = await supabase
            .from("lotes")
            .select("*")
            .gt("saldo", 0)
            .range(lotesStart, lotesStart + lotesBatchSize - 1)
            .order("data_criacao", { ascending: false })

          if (lotesError) {
            console.error("[v0] Error fetching lotes:", lotesError)
            break
          }

          if (lotesBatch && lotesBatch.length > 0) {
            allLotes = [...allLotes, ...lotesBatch]
            console.log(`[v0] Fetched lotes batch: ${lotesBatch.length} (total: ${allLotes.length})`)

            if (lotesBatch.length < lotesBatchSize) {
              hasMoreLotes = false
            } else {
              lotesStart += lotesBatchSize
            }
          } else {
            hasMoreLotes = false
          }
        }

        console.log(`[v0] Total lotes fetched: ${allLotes.length}`)

        // Match lotes to products and calculate stock
        const productsWithStock = allProducts.map((product) => {
          const productLotes = allLotes.filter((lote) => lote.produto_id === product.id)
          const estoqueAtual = productLotes.reduce((sum, lote) => sum + (lote.saldo || 0), 0)

          return {
            ...product,
            estoque_atual: estoqueAtual,
            lotes: productLotes,
          }
        })

        console.log(`[v0] Products with stock calculated: ${productsWithStock.length}`)
        const productsWithLotes = productsWithStock.filter((p) => p.lotes && p.lotes.length > 0)
        const productsWithoutLotes = productsWithStock.filter((p) => !p.lotes || p.lotes.length === 0)
        console.log(`[v0] Products WITH lotes: ${productsWithLotes.length}`)
        console.log(`[v0] Products WITHOUT lotes (zero stock): ${productsWithoutLotes.length}`)

        // Sample product stock calculation
        if (productsWithLotes.length > 0) {
          const sample = productsWithLotes[0]
          console.log(`[v0] Sample product: ${sample.identificacao} - ${sample.descricao}`)
          console.log(`[v0] - Number of lotes: ${sample.lotes?.length || 0}`)
          console.log(`[v0] - Stock from lotes: ${sample.estoque_atual} ${sample.unidade_medida}`)
          console.log(
            `[v0] - Lotes details:`,
            sample.lotes?.map((l: any) => `${l.identificacao}: ${l.saldo}`).join(", "),
          )
        }

        setProducts(productsWithStock)
      } catch (error) {
        console.error("[v0] Error in fetchProducts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [statusFilter])

  const getStockStatus = (product: Product) => {
    const currentStock = product.estoque_atual || 0
    const minQty = product.qtde_minima || 0
    const safetyQty = product.qtde_seguranca || 0

    if (currentStock === 0) {
      return "critical"
    }

    if (minQty > 0 && currentStock <= minQty) {
      return "critical"
    }

    if (safetyQty > 0 && currentStock <= safetyQty) {
      return "low"
    }

    return "normal"
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.identificacao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.tipo === selectedCategory

    const stockStatus = getStockStatus(product)
    const matchesStockLevel = stockLevelFilter === "all" || stockStatus === stockLevelFilter

    const price = product.valor_custo || 0
    const matchesPriceMin = priceRangeMin === "" || price >= Number.parseFloat(priceRangeMin)
    const matchesPriceMax = priceRangeMax === "" || price <= Number.parseFloat(priceRangeMax)

    return matchesSearch && matchesCategory && matchesStockLevel && matchesPriceMin && matchesPriceMax
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "name":
        comparison = a.descricao.localeCompare(b.descricao)
        break
      case "code":
        comparison = a.identificacao.localeCompare(b.identificacao)
        break
      case "stock":
        comparison = (a.estoque_atual || 0) - (b.estoque_atual || 0)
        break
      case "price":
        comparison = (a.valor_custo || 0) - (b.valor_custo || 0)
        break
    }

    return sortOrder === "asc" ? comparison : -comparison
  })

  const totalProducts = sortedProducts.length
  const normalStock = sortedProducts.filter((p) => getStockStatus(p) === "normal").length
  const lowStock = sortedProducts.filter((p) => getStockStatus(p) === "low").length
  const criticalStock = sortedProducts.filter((p) => getStockStatus(p) === "critical").length

  const categories = Array.from(new Set(products.map((p) => p.tipo).filter(Boolean))).sort((a, b) => {
    const numA = Number.parseInt(a.match(/^\d+/)?.[0] || "999")
    const numB = Number.parseInt(b.match(/^\d+/)?.[0] || "999")
    return numA - numB
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDaysUntilExpiration = (expirationDate: string) => {
    if (!expirationDate) return null
    const today = new Date()
    const expDate = new Date(expirationDate)
    const diffTime = expDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getLotAge = (creationDate: string) => {
    if (!creationDate) return null
    const today = new Date()
    const createDate = new Date(creationDate)
    const diffTime = today.getTime() - createDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getExpirationStatus = (daysUntilExpiration: number | null) => {
    if (daysUntilExpiration === null) return { label: "Sem validade", variant: "secondary" as const, color: "gray" }
    if (daysUntilExpiration < 0) return { label: "Vencido", variant: "destructive" as const, color: "red" }
    if (daysUntilExpiration <= 30) return { label: "Vence em breve", variant: "warning" as const, color: "orange" }
    if (daysUntilExpiration <= 90) return { label: "Atenção", variant: "warning" as const, color: "yellow" }
    return { label: "Válido", variant: "success" as const, color: "green" }
  }

  const handleOpenLotesDialog = (product: Product) => {
    setSelectedProductForLots(product)
    setIsLotesDialogOpen(true)
  }

  const clearAdvancedFilters = () => {
    setStockLevelFilter("all")
    setPriceRangeMin("")
    setPriceRangeMax("")
    setSortBy("name")
    setSortOrder("asc")
  }

  const activeFiltersCount = [stockLevelFilter !== "all", priceRangeMin !== "", priceRangeMax !== ""].filter(
    Boolean,
  ).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Catálogo de Produtos</h1>
          <p className="text-muted-foreground">Gestão de produtos acabados da Beeoz</p>
        </div>
        <Link href="/analise-compras">
          <Button>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Análise de Compras
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4 items-center">
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
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "ativo" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("ativo")}
            >
              Ativo
            </Button>
            <Button
              variant={statusFilter === "inativo" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("inativo")}
            >
              Inativo
            </Button>
            <Button
              variant={statusFilter === "todos" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("todos")}
            >
              Todos
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avançados
            {activeFiltersCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {showAdvancedFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Filtros Avançados</h3>
                  <Button variant="ghost" size="sm" onClick={clearAdvancedFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nível de Estoque</label>
                    <Select value={stockLevelFilter} onValueChange={(value: any) => setStockLevelFilter(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Níveis</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="critical">Crítico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preço Mínimo (R$)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={priceRangeMin}
                      onChange={(e) => setPriceRangeMin(e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preço Máximo (R$)</label>
                    <Input
                      type="number"
                      placeholder="999999.99"
                      value={priceRangeMax}
                      onChange={(e) => setPriceRangeMax(e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ordenar Por</label>
                    <div className="flex gap-2">
                      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Nome</SelectItem>
                          <SelectItem value="code">Código</SelectItem>
                          <SelectItem value="stock">Estoque</SelectItem>
                          <SelectItem value="price">Preço</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      >
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Mostrando {totalProducts} de {products.length} produtos
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estoque Normal</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{normalStock}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStock}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
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
          {sortedProducts.map((product) => {
            const stockStatus = getStockStatus(product)
            const currentStock = product.estoque_atual || 0
            const minStock = product.qtde_minima || 0
            const reorderPoint = product.qtde_seguranca || 0
            const eoq = product.lote_minimo_compra || 0

            const maxStock = minStock * 10 || 1000
            const stockPercentage = minStock > 0 ? Math.min((currentStock / minStock) * 100, 10000) : 0

            const oldestLot = product.lotes?.[0]
            const validityDays = oldestLot?.data_validade
              ? Math.ceil((new Date(oldestLot.data_validade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null

            return (
              <Card key={product.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold leading-tight">{product.descricao}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{product.identificacao}</p>
                    </div>
                    <Badge
                      variant={stockStatus === "normal" ? "success" : stockStatus === "low" ? "warning" : "destructive"}
                      className="shrink-0"
                    >
                      {stockStatus === "normal" ? "Normal" : stockStatus === "low" ? "Baixo" : "Crítico"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="w-full text-xs bg-transparent">
                      📋 Ficha Técnica
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs bg-transparent relative"
                      onClick={() => handleOpenLotesDialog(product)}
                    >
                      📦 Lotes
                      {product.lotes && product.lotes.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                          {product.lotes.length}
                        </Badge>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                      {product.tipo?.charAt(0) || "P"}
                    </div>
                    <span className="text-sm font-medium">{product.tipo || "Produto"}</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estoque Atual:</span>
                      <span className="font-semibold text-green-600 flex items-center gap-1">
                        {currentStock} {product.unidade_medida}
                        {product.lotes && product.lotes.length > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            ({product.lotes.length} {product.lotes.length === 1 ? "lote" : "lotes"})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estoque Mínimo:</span>
                      <span className="font-medium">
                        {minStock} {product.unidade_medida}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ponto de Reposição:</span>
                      <span className="font-medium">
                        {reorderPoint} {product.unidade_medida}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lote Econômico (EOQ):</span>
                      <span className="font-medium">
                        {eoq} {product.unidade_medida}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Nível de Estoque:</span>
                      <span className="font-semibold text-green-600">{stockPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          stockStatus === "critical"
                            ? "bg-red-500"
                            : stockStatus === "low"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>Validade: {validityDays !== null ? `${validityDays} dias` : "N/A"}</span>
                    <span>
                      Lote Setup: {eoq} {product.unidade_medida}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">Nenhum produto encontrado</div>
      )}

      <Dialog open={isLotesDialogOpen} onOpenChange={setIsLotesDialogOpen}>
        <DialogContent className="!w-[95vw] !max-w-[95vw] !h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-xl font-bold">{selectedProductForLots?.descricao}</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Código: {selectedProductForLots?.identificacao}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {selectedProductForLots?.lotes && selectedProductForLots.lotes.length > 0 ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="details">Detalhes dos Lotes</TabsTrigger>
                  <TabsTrigger value="analytics">Análise</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total de Lotes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{selectedProductForLots.lotes.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Lotes ativos</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Estoque Total</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                          {selectedProductForLots.lotes.reduce((sum, l) => sum + (l.saldo || 0), 0).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{selectedProductForLots.unidade_medida}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Lote Mais Antigo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-orange-600">
                          {getLotAge(
                            selectedProductForLots.lotes.sort(
                              (a, b) => new Date(a.data_criacao).getTime() - new Date(b.data_criacao).getTime(),
                            )[0]?.data_criacao,
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">dias de idade</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Próximo Vencimento</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const nextExpiring = selectedProductForLots.lotes
                            .filter((l) => l.data_validade)
                            .sort(
                              (a, b) => new Date(a.data_validade).getTime() - new Date(b.data_validade).getTime(),
                            )[0]
                          const days = nextExpiring ? getDaysUntilExpiration(nextExpiring.data_validade) : null
                          const status = getExpirationStatus(days)
                          return (
                            <>
                              <div className={`text-3xl font-bold text-${status.color}-600`}>
                                {days !== null ? (days < 0 ? "Vencido" : `${days}d`) : "N/A"}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {nextExpiring ? formatDate(nextExpiring.data_validade) : "Sem validade"}
                              </p>
                            </>
                          )
                        })()}
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Warehouse className="h-5 w-5" />
                        Distribuição por Depósito
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Array.from(
                          new Map(
                            selectedProductForLots.lotes
                              .filter((l) => l.deposito_descricao)
                              .map((l) => [
                                l.deposito_descricao,
                                {
                                  name: l.deposito_descricao,
                                  count: 0,
                                  total: 0,
                                },
                              ]),
                          ).values(),
                        ).map((warehouse) => {
                          const warehouseLots = selectedProductForLots.lotes.filter(
                            (l) => l.deposito_descricao === warehouse.name,
                          )
                          const totalStock = warehouseLots.reduce((sum, l) => sum + (l.saldo || 0), 0)
                          const percentage =
                            (totalStock / selectedProductForLots.lotes.reduce((sum, l) => sum + (l.saldo || 0), 0)) *
                            100

                          return (
                            <div key={warehouse.name} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{warehouse.name}</span>
                                <span className="text-muted-foreground">
                                  {totalStock.toFixed(2)} {selectedProductForLots.unidade_medida} (
                                  {warehouseLots.length} lotes)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-6">
                  {selectedProductForLots.lotes
                    .sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime())
                    .map((lote, index) => {
                      const daysUntilExpiration = getDaysUntilExpiration(lote.data_validade)
                      const lotAge = getLotAge(lote.data_criacao)
                      const expirationStatus = getExpirationStatus(daysUntilExpiration)
                      const utilizationPercentage = ((lote.saldo / lote.qtde) * 100).toFixed(1)

                      return (
                        <Card key={lote.id} className="border-l-4 border-l-primary overflow-hidden">
                          <CardHeader className="bg-muted/30 pb-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-xl font-bold">{lote.identificacao}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    #{index + 1}
                                  </Badge>
                                </div>
                                {lote.descricao && <p className="text-sm text-muted-foreground">{lote.descricao}</p>}
                              </div>
                              <Badge variant={expirationStatus.variant} className="text-xs">
                                {expirationStatus.label}
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                  <Package className="h-4 w-4" />
                                  Informações de Estoque
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Saldo Atual</p>
                                    <p className="text-2xl font-bold text-green-600">
                                      {lote.saldo} {selectedProductForLots.unidade_medida}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Quantidade Produzida</p>
                                    <p className="text-lg font-semibold">
                                      {lote.qtde} {selectedProductForLots.unidade_medida}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Utilização</p>
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-green-500 h-2 rounded-full transition-all"
                                          style={{ width: `${utilizationPercentage}%` }}
                                        />
                                      </div>
                                      <span className="text-sm font-medium">{utilizationPercentage}%</span>
                                    </div>
                                  </div>
                                  {lote.id_estoque && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">ID Estoque</p>
                                      <p className="text-sm font-mono">{lote.id_estoque}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  Informações de Data
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Data de Produção</p>
                                    <p className="text-sm font-medium">{formatDateTime(lote.data_criacao)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Idade do Lote</p>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <p className="text-sm font-medium">
                                        {lotAge !== null ? `${lotAge} dias` : "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                  {lote.data_validade && (
                                    <>
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">Data de Validade</p>
                                        <p className="text-sm font-medium">{formatDate(lote.data_validade)}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">Dias até Vencimento</p>
                                        <p
                                          className={`text-sm font-bold ${
                                            daysUntilExpiration !== null && daysUntilExpiration < 0
                                              ? "text-red-600"
                                              : daysUntilExpiration !== null && daysUntilExpiration <= 30
                                                ? "text-orange-600"
                                                : "text-green-600"
                                          }`}
                                        >
                                          {daysUntilExpiration !== null
                                            ? daysUntilExpiration < 0
                                              ? `Vencido há ${Math.abs(daysUntilExpiration)} dias`
                                              : `${daysUntilExpiration} dias`
                                            : "N/A"}
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  Informações de Localização
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                  {lote.deposito_descricao && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Depósito</p>
                                      <div className="flex items-center gap-2">
                                        <Warehouse className="h-4 w-4 text-primary" />
                                        <p className="text-sm font-medium">{lote.deposito_descricao}</p>
                                      </div>
                                    </div>
                                  )}
                                  {lote.deposito_mrp && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Código MRP</p>
                                      <p className="text-sm font-mono">{lote.deposito_mrp}</p>
                                    </div>
                                  )}
                                  {lote.deposito_id && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">ID Depósito</p>
                                      <p className="text-sm font-mono">{lote.deposito_id}</p>
                                    </div>
                                  )}
                                  {lote.localizacao && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Localização Física</p>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <p className="text-sm font-medium">{lote.localizacao}</p>
                                      </div>
                                    </div>
                                  )}
                                  {lote.identificacao_produto && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">ID Produto</p>
                                      <p className="text-sm font-mono">{lote.identificacao_produto}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Distribuição de Idade dos Lotes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {(() => {
                            const ageRanges = [
                              { label: "0-30 dias", min: 0, max: 30, color: "bg-green-500" },
                              { label: "31-60 dias", min: 31, max: 60, color: "bg-blue-500" },
                              { label: "61-90 dias", min: 61, max: 90, color: "bg-yellow-500" },
                              { label: "90+ dias", min: 91, max: Number.POSITIVE_INFINITY, color: "bg-red-500" },
                            ]

                            return ageRanges.map((range) => {
                              const lotsInRange = selectedProductForLots.lotes.filter((l) => {
                                const age = getLotAge(l.data_criacao)
                                return age !== null && age >= range.min && age <= range.max
                              })
                              const stockInRange = lotsInRange.reduce((sum, l) => sum + (l.saldo || 0), 0)
                              const percentage =
                                (stockInRange /
                                  selectedProductForLots.lotes.reduce((sum, l) => sum + (l.saldo || 0), 0)) *
                                100

                              return (
                                <div key={range.label} className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{range.label}</span>
                                    <span className="text-muted-foreground">
                                      {lotsInRange.length} lotes ({stockInRange.toFixed(2)}{" "}
                                      {selectedProductForLots.unidade_medida})
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`${range.color} h-2 rounded-full transition-all`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            })
                          })()}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Status de Validade
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {(() => {
                            const validityRanges = [
                              {
                                label: "Vencidos",
                                check: (days: number | null) => days !== null && days < 0,
                                color: "bg-red-500",
                              },
                              {
                                label: "Vence em 30 dias",
                                check: (days: number | null) => days !== null && days >= 0 && days <= 30,
                                color: "bg-orange-500",
                              },
                              {
                                label: "Vence em 90 dias",
                                check: (days: number | null) => days !== null && days > 30 && days <= 90,
                                color: "bg-yellow-500",
                              },
                              {
                                label: "Válidos (90+ dias)",
                                check: (days: number | null) => days !== null && days > 90,
                                color: "bg-green-500",
                              },
                            ]

                            return validityRanges.map((range) => {
                              const lotsInRange = selectedProductForLots.lotes.filter((l) => {
                                const days = getDaysUntilExpiration(l.data_validade)
                                return range.check(days)
                              })
                              const stockInRange = lotsInRange.reduce((sum, l) => sum + (l.saldo || 0), 0)
                              const percentage =
                                (stockInRange /
                                  selectedProductForLots.lotes.reduce((sum, l) => sum + (l.saldo || 0), 0)) *
                                100

                              return (
                                <div key={range.label} className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{range.label}</span>
                                    <span className="text-muted-foreground">
                                      {lotsInRange.length} lotes ({stockInRange.toFixed(2)}{" "}
                                      {selectedProductForLots.unidade_medida})
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`${range.color} h-2 rounded-full transition-all`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            })
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum lote encontrado</h3>
                <p className="text-sm text-muted-foreground">Este produto não possui lotes cadastrados no momento.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
