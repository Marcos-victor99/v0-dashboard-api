"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, Package, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
    return matchesSearch && matchesCategory
  })

  const totalProducts = filteredProducts.length
  const normalStock = filteredProducts.filter((p) => getStockStatus(p) === "normal").length
  const lowStock = filteredProducts.filter((p) => getStockStatus(p) === "low").length
  const criticalStock = filteredProducts.filter((p) => getStockStatus(p) === "critical").length

  console.log("[v0] Summary Statistics:")
  console.log("[v0] Total Products:", totalProducts)
  console.log("[v0] Normal Stock:", normalStock)
  console.log("[v0] Low Stock:", lowStock)
  console.log("[v0] Critical Stock:", criticalStock)
  console.log("[v0] Status Filter:", statusFilter)
  console.log("[v0] Products array length:", products.length)

  const getStockPercentage = (product: Product) => {
    const currentStock = product.estoque_atual || 0
    const maxStock = (product.qtde_seguranca || 0) * 2 || 1000
    return Math.min((currentStock / maxStock) * 100, 100)
  }

  const categories = Array.from(new Set(products.map((p) => p.tipo).filter(Boolean))).sort((a, b) => {
    const numA = Number.parseInt(a.match(/^\d+/)?.[0] || "999")
    const numB = Number.parseInt(b.match(/^\d+/)?.[0] || "999")
    return numA - numB
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getDaysUntilExpiration = (expirationDate: string) => {
    if (!expirationDate) return null
    const today = new Date()
    const expDate = new Date(expirationDate)
    const diffTime = expDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleOpenLotesDialog = (product: Product) => {
    setSelectedProductForLots(product)
    setIsLotesDialogOpen(true)
  }

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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Lotes - {selectedProductForLots?.descricao}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{selectedProductForLots?.identificacao}</p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {selectedProductForLots?.lotes && selectedProductForLots.lotes.length > 0 ? (
              selectedProductForLots.lotes.map((lote) => {
                const daysUntilExpiration = getDaysUntilExpiration(lote.data_validade)
                const isExpired = daysUntilExpiration !== null && daysUntilExpiration < 0

                return (
                  <Card key={lote.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">Lote: {lote.identificacao}</h4>
                          {isExpired && (
                            <Badge variant="destructive" className="mt-1">
                              Vencido
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Saldo</p>
                          <p className="text-2xl font-bold text-green-600">
                            {lote.saldo} {selectedProductForLots.unidade_medida}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Quantidade Produzida</p>
                          <p className="font-medium">
                            {lote.qtde} {selectedProductForLots.unidade_medida}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Data de Produção</p>
                          <p className="font-medium">{formatDate(lote.data_criacao)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Data de Validade</p>
                          <p className="font-medium">{formatDate(lote.data_validade)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Dias até Vencimento</p>
                          <p className={`font-medium ${isExpired ? "text-red-600" : ""}`}>
                            {isExpired
                              ? "Vencido"
                              : daysUntilExpiration !== null
                                ? `${daysUntilExpiration} dias`
                                : "N/A"}
                          </p>
                        </div>
                        {lote.localizacao && (
                          <div>
                            <p className="text-muted-foreground">Localização</p>
                            <p className="font-medium">{lote.localizacao}</p>
                          </div>
                        )}
                        {lote.deposito_descricao && (
                          <div>
                            <p className="text-muted-foreground">Depósito</p>
                            <p className="font-medium">{lote.deposito_descricao}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">Nenhum lote encontrado para este produto</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
