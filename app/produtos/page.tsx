"use client"

import { useState } from "react"
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
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ProductFormDialog } from "@/components/product-form-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useDebouncedValue } from "@/hooks/use-debounced-value" // Import debounced hook
import { trpc } from "@/lib/trpc" // Import TRPC
import React from "react" // Import React

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
  // const [products, setProducts] = useState<Product[]>([]) // Removed client-side products state
  const [selectedProductForLots, setSelectedProductForLots] = useState<Product | null>(null)
  const [isLotesDialogOpen, setIsLotesDialogOpen] = useState(false)

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [stockLevelFilter, setStockLevelFilter] = useState<"all" | "normal" | "low" | "critical">("all")
  const [priceRangeMin, setPriceRangeMin] = useState("")
  const [priceRangeMax, setPriceRangeMax] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "stock" | "price" | "code">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const { toast } = useToast()

  const [page, setPage] = useState(1)
  const limit = 20 // Define items per page

  const [categories, setCategories] = useState<string[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const debouncedSearch = useDebouncedValue(searchTerm, 300)

  const {
    data: productsData,
    isLoading: loading,
    refetch,
  } = trpc.products.list.useQuery({
    page,
    limit,
    search: debouncedSearch,
    status: statusFilter,
    tipo: selectedCategory !== "all" ? selectedCategory : undefined,
    // Pass advanced filters to TRPC query
    stockLevel: stockLevelFilter,
    priceMin: priceRangeMin ? Number.parseFloat(priceRangeMin) : undefined,
    priceMax: priceRangeMax ? Number.parseFloat(priceRangeMax) : undefined,
    sortBy,
    sortOrder,
  })

  const { data: stats } = trpc.products.stats.useQuery(undefined, {
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  })

  const products = productsData?.products || []
  const totalPages = productsData?.totalPages || 1

  const supabase = createClient()

  React.useEffect(() => {
    async function fetchCategories() {
      try {
        console.log("[v0] Fetching categories from produtos table...")
        setLoadingCategories(true)

        const { data, error } = await supabase.from("produtos").select("tipo").not("tipo", "is", null).order("tipo")

        if (error) {
          console.error("[v0] Error fetching categories:", error)
          // Fallback to extracting from current products
          const fallbackCategories = Array.from(new Set(products.map((p) => p.tipo).filter(Boolean))).sort((a, b) => {
            const numA = Number.parseInt(a.match(/^\d+/)?.[0] || "999")
            const numB = Number.parseInt(b.match(/^\d+/)?.[0] || "999")
            return numA - numB
          })
          setCategories(fallbackCategories)
          return
        }

        // Extract unique tipo values and sort them
        const uniqueCategories = Array.from(new Set(data.map((item) => item.tipo).filter(Boolean))).sort((a, b) => {
          const numA = Number.parseInt(a.match(/^\d+/)?.[0] || "999")
          const numB = Number.parseInt(b.match(/^\d+/)?.[0] || "999")
          return numA - numB
        })

        console.log("[v0] Categories fetched:", uniqueCategories)
        setCategories(uniqueCategories)
      } catch (error) {
        console.error("[v0] Error fetching categories:", error)
        // Fallback to extracting from current products
        const fallbackCategories = Array.from(new Set(products.map((p) => p.tipo).filter(Boolean))).sort((a, b) => {
          const numA = Number.parseInt(a.match(/^\d+/)?.[0] || "999")
          const numB = Number.parseInt(b.match(/^\d+/)?.[0] || "999")
          return numA - numB
        })
        setCategories(fallbackCategories)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [products]) // Run once on mount, re-run if products change significantly

  // Removed useEffect for fetching products, now handled by TRPC

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

  // Search, category and status filters are now handled server-side by TRPC
  const filteredProducts = products.filter((product) => {
    const stockStatus = getStockStatus(product)
    const matchesStockLevel = stockLevelFilter === "all" || stockStatus === stockLevelFilter

    const price = product.valor_custo || 0
    const matchesPriceMin = priceRangeMin === "" || price >= Number.parseFloat(priceRangeMin)
    const matchesPriceMax = priceRangeMax === "" || price <= Number.parseFloat(priceRangeMax)

    return matchesStockLevel && matchesPriceMin && matchesPriceMax
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

  const totalProducts = stats?.totalProducts || 0
  const normalStock = stats?.normalStock || 0
  const lowStock = stats?.lowStock || 0
  const criticalStock = stats?.criticalStock || 0

  // Removed old categories extraction - now using state from useEffect
  // const categories = Array.from(new Set(products.map((p) => p.tipo).filter(Boolean))).sort((a, b) => {
  //   const numA = Number.parseInt(a.match(/^\d+/)?.[0] || "999")
  //   const numB = Number.parseInt(b.match(/^\d+/)?.[0] || "999")
  //   return numA - numB
  // })

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

  async function handleSaveProduct(productData: any) {
    try {
      console.log("[v0] Saving product:", productData)

      if (selectedProductForEdit) {
        // Update existing product
        const { error } = await supabase.from("produtos").update(productData).eq("id", selectedProductForEdit.id)

        if (error) throw error

        toast({
          title: "Produto atualizado",
          description: "As alterações foram salvas com sucesso.",
        })
      } else {
        // Create new product
        const { data: existing } = await supabase
          .from("produtos")
          .select("id")
          .eq("identificacao", productData.identificacao)
          .single()

        if (existing) {
          toast({
            title: "Código duplicado",
            description: "Já existe um produto com este código.",
            variant: "destructive",
          })
          return
        }

        const { error } = await supabase.from("produtos").insert([productData])

        if (error) throw error

        toast({
          title: "Produto criado",
          description: "O produto foi cadastrado com sucesso.",
        })
      }

      refetch()

      setProductDialogOpen(false)
      setSelectedProductForEdit(null)
    } catch (error) {
      console.error("[v0] Error saving product:", error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o produto.",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteProduct() {
    if (!productToDelete) return

    try {
      // Check if product has lotes
      const { data: lotes } = await supabase.from("lotes").select("id").eq("produto_id", productToDelete.id).limit(1)

      if (lotes && lotes.length > 0) {
        toast({
          title: "Não é possível excluir",
          description: "Este produto possui lotes cadastrados. Remova os lotes antes de excluir o produto.",
          variant: "destructive",
        })
        setDeleteDialogOpen(false)
        setProductToDelete(null)
        return
      }

      const { error } = await supabase.from("produtos").delete().eq("id", productToDelete.id)

      if (error) throw error

      toast({
        title: "Produto excluído",
        description: "O produto foi removido do sistema.",
      })

      refetch()
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o produto.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Catálogo de Produtos</h1>
          <p className="text-muted-foreground">Gestão de produtos acabados da Beeoz</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSelectedProductForEdit(null)
              setProductDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
          <Link href="/analise-compras">
            <Button variant="outline">
              <ShoppingCart className="h-4 w-4 mr-1" />
              Análise de Compras
            </Button>
          </Link>
        </div>
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
          <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={loadingCategories}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={loadingCategories ? "Carregando..." : "Todas as categorias"} />
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
                  Mostrando {filteredProducts.length} de {totalProducts} produtos
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
        <>
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
                ? Math.ceil(
                    (new Date(oldestLot.data_validade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                  )
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
                        variant={
                          stockStatus === "normal" ? "success" : stockStatus === "low" ? "warning" : "destructive"
                        }
                        className="shrink-0"
                      >
                        {stockStatus === "normal" ? "Normal" : stockStatus === "low" ? "Baixo" : "Crítico"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-2">
                      <Button variant="outline" size="sm" className="w-full text-xs bg-transparent col-span-2">
                        📋 Ficha Técnica
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs bg-transparent relative col-span-2"
                        onClick={() => handleOpenLotesDialog(product)}
                      >
                        📦 Lotes
                        {product.lotes && product.lotes.length > 0 && (
                          <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                            {product.lotes.length}
                          </Badge>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs col-span-2 bg-transparent"
                        onClick={() => {
                          setSelectedProductForEdit(product)
                          setProductDialogOpen(true)
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 col-span-2 bg-transparent"
                        onClick={() => {
                          setProductToDelete(product)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Excluir
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>

              <span className="text-sm text-muted-foreground ml-4">
                Página {page} de {totalPages}
              </span>
            </div>
          )}
        </>
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
                        {(() => {
                          // Aggregate by deposito_descricao
                          const warehouseMap = new Map<string, { count: number; total: number }>()
                          selectedProductForLots.lotes.forEach((l) => {
                            if (l.deposito_descricao) {
                              const current = warehouseMap.get(l.deposito_descricao) || { count: 0, total: 0 }
                              warehouseMap.set(l.deposito_descricao, {
                                count: current.count + 1,
                                total: current.total + (l.saldo || 0),
                              })
                            }
                          })

                          const totalStock = selectedProductForLots.lotes.reduce((sum, l) => sum + (l.saldo || 0), 0)

                          return Array.from(warehouseMap.entries()).map(([name, { count, total }]) => {
                            const percentage = (total / totalStock) * 100
                            return (
                              <div key={name} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium">{name}</span>
                                  <span className="text-muted-foreground">
                                    {total.toFixed(2)} {selectedProductForLots.unidade_medida} ({count} lotes)
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
                          })
                        })()}
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
                      const utilizationPercentage = lote.qtde > 0 ? ((lote.saldo / lote.qtde) * 100).toFixed(1) : "0.0"

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

                            const totalStock = selectedProductForLots.lotes.reduce((sum, l) => sum + (l.saldo || 0), 0)

                            return ageRanges.map((range) => {
                              const lotsInRange = selectedProductForLots.lotes.filter((l) => {
                                const age = getLotAge(l.data_criacao)
                                return age !== null && age >= range.min && age <= range.max
                              })
                              const stockInRange = lotsInRange.reduce((sum, l) => sum + (l.saldo || 0), 0)
                              const percentage = totalStock > 0 ? (stockInRange / totalStock) * 100 : 0

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

                            const totalStock = selectedProductForLots.lotes.reduce((sum, l) => sum + (l.saldo || 0), 0)

                            return validityRanges.map((range) => {
                              const lotsInRange = selectedProductForLots.lotes.filter((l) => {
                                const days = getDaysUntilExpiration(l.data_validade)
                                return range.check(days)
                              })
                              const stockInRange = lotsInRange.reduce((sum, l) => sum + (l.saldo || 0), 0)
                              const percentage = totalStock > 0 ? (stockInRange / totalStock) * 100 : 0

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

      <ProductFormDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={selectedProductForEdit}
        onSave={handleSaveProduct}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto <strong>{productToDelete?.descricao}</strong>?
              <br />
              <br />
              Esta ação não pode ser desfeita. Se o produto possuir lotes cadastrados, a exclusão será bloqueada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
              Excluir Produto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
