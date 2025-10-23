"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  economic_lot: number
  unit: string
  unit_cost: number
  status: string
  lotes_count?: number
  grupo: { id: number; descricao: string } | null
  ncm: string | null
  origem: string | null
  localizacao: string | null
}

interface Lote {
  id: number
  identificacao: string
  produto_id: number
  saldo: number
  qtde: number
  data_criacao: string
  data_validade: string | null
  deposito_id: number | null
  localizacao: string | null
}

export default function MateriasPrimas() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<"ativo" | "inativo" | "all">("ativo")
  const [materials, setMaterials] = useState<RawMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null)
  const [lotes, setLotes] = useState<Lote[]>([])
  const [lotesDialogOpen, setLotesDialogOpen] = useState(false)
  const [loadingLotes, setLoadingLotes] = useState(false)

  const supabase = createBrowserClient(
    "https://vdhxtlnadjejyyydmlit.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkaHh0bG5hZGplanl5eWRtbGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODAzMDEsImV4cCI6MjA1Njc1NjMwMX0.TWzazmeto1Ic5cNAf7LrDjHcrbuaofCid_3xNiBnVkE",
  )

  useEffect(() => {
    fetchMaterials()
  }, [statusFilter])

  async function fetchLotesForProduct(productId: number) {
    setLoadingLotes(true)
    try {
      const { data, error } = await supabase
        .from("lotes")
        .select("*")
        .eq("produto_id", productId)
        .order("data_criacao", { ascending: true })

      if (error) {
        console.error("[v0] Error fetching lotes:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("[v0] Error fetching lotes:", error)
      return []
    } finally {
      setLoadingLotes(false)
    }
  }

  async function handleLotesClick(material: RawMaterial) {
    setSelectedMaterial(material)
    setLotesDialogOpen(true)
    const lotesData = await fetchLotesForProduct(material.id)
    setLotes(lotesData)
  }

  async function fetchMaterials() {
    try {
      console.log("[v0] Fetching raw materials from produtos table...")

      const allProducts = []
      let start = 0
      const batchSize = 1000

      while (true) {
        let query = supabase
          .from("produtos")
          .select(
            "id, identificacao, descricao, tipo, status, unidade_medida, valor_custo, qtde_minima, qtde_seguranca, lote_minimo_compra, grupo, ncm, origem, localizacao",
          )
          .eq("tipo", "01 - Matéria Prima")
          .range(start, start + batchSize - 1)
          .order("descricao")

        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter)
        }

        const { data, error } = await query

        if (error) {
          console.error("[v0] Error fetching materials:", error)
          throw error
        }

        if (!data || data.length === 0) break

        allProducts.push(...data)
        console.log(`[v0] Fetched products batch: ${data.length} (total: ${allProducts.length})`)

        if (data.length < batchSize) break
        start += batchSize
      }

      console.log(`[v0] Total products fetched: ${allProducts.length}`)

      const allLotes = []
      let lotesStart = 0
      const lotesBatchSize = 1000

      while (true) {
        const { data: lotesBatch, error: lotesError } = await supabase
          .from("lotes")
          .select("*")
          .gt("saldo", 0)
          .range(lotesStart, lotesStart + lotesBatchSize - 1)
          .order("data_criacao", { ascending: true })

        if (lotesError) {
          console.error("[v0] Error fetching lotes:", lotesError)
          break
        }

        if (!lotesBatch || lotesBatch.length === 0) break

        allLotes.push(...lotesBatch)
        console.log(`[v0] Fetched lotes batch: ${lotesBatch.length} (total: ${allLotes.length})`)

        if (lotesBatch.length < lotesBatchSize) break
        lotesStart += lotesBatchSize
      }

      console.log(`[v0] Total lotes fetched: ${allLotes.length}`)

      const materialsWithStock = allProducts.map((item: any) => {
        const productLotes = allLotes.filter((lote: any) => lote.produto_id === item.id)
        const estoqueAtual = productLotes.reduce((sum: number, lote: any) => sum + (lote.saldo || 0), 0)

        let grupoObj = null
        if (item.grupo) {
          try {
            grupoObj = typeof item.grupo === "string" ? JSON.parse(item.grupo) : item.grupo
          } catch (e) {
            console.warn("[v0] Error parsing grupo:", e)
          }
        }

        return {
          id: item.id,
          code: item.identificacao || "",
          name: item.descricao || "",
          type: item.tipo || "",
          current_stock: estoqueAtual,
          min_stock: item.qtde_minima || 0,
          reorder_point: item.qtde_seguranca || 0,
          economic_lot: item.lote_minimo_compra || 0,
          unit: item.unidade_medida || "UN",
          unit_cost: item.valor_custo || 0,
          status: item.status || "ativo",
          lotes_count: productLotes.length,
          grupo: grupoObj,
          ncm: item.ncm,
          origem: item.origem,
          localizacao: item.localizacao,
        }
      })

      console.log(`[v0] Materials with stock calculated: ${materialsWithStock.length}`)
      console.log(`[v0] Materials with lotes: ${materialsWithStock.filter((m) => m.lotes_count > 0).length}`)
      console.log(`[v0] Materials without lotes: ${materialsWithStock.filter((m) => m.lotes_count === 0).length}`)

      setMaterials(materialsWithStock)
    } catch (error) {
      console.error("[v0] Error fetching materials:", error)
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
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
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "ativo" ? "default" : "outline"}
              onClick={() => setStatusFilter("ativo")}
              size="sm"
            >
              Ativo
            </Button>
            <Button
              variant={statusFilter === "inativo" ? "default" : "outline"}
              onClick={() => setStatusFilter("inativo")}
              size="sm"
            >
              Inativo
            </Button>
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              size="sm"
            >
              Todos
            </Button>
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
                  {material.lotes_count !== undefined && material.lotes_count > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {material.lotes_count} {material.lotes_count === 1 ? "lote" : "lotes"}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Estoque Mínimo</p>
                    <p className="font-semibold">
                      {material.min_stock} {material.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Ponto de Pedido</p>
                    <p className="font-semibold text-blue-600">
                      {material.reorder_point} {material.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Lote Econômico</p>
                    <p className="font-semibold">
                      {material.economic_lot} {material.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">Qtd. ideal</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Necessidade</p>
                    <p className="font-semibold text-orange-600">
                      {necessity} {material.unit}
                    </p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground">Informações Cadastrais</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {material.grupo && (
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground mb-1">Grupo</p>
                          <p className="font-medium">{material.grupo.descricao}</p>
                        </div>
                      )}
                      {material.ncm && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">NCM</p>
                          <p className="font-medium">{material.ncm}</p>
                        </div>
                      )}
                      {material.origem && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Origem</p>
                          <p className="font-medium">{material.origem}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Custo Unitário</p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(material.unit_cost)}/{material.unit}
                        </p>
                      </div>
                      {material.localizacao && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Localização</p>
                          <p className="font-medium">{material.localizacao}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/materias-primas/${material.id}`}>
                    <Button variant="default" className="w-full">
                      <PackageOpen className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Ficha Técnica
                  </Button>
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Fornecedores
                  </Button>
                  <Button variant="outline" onClick={() => handleLotesClick(material)}>
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

      <Dialog open={lotesDialogOpen} onOpenChange={setLotesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Lotes</DialogTitle>
            <DialogDescription>
              {selectedMaterial && (
                <>
                  {selectedMaterial.name} ({selectedMaterial.code})
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {loadingLotes ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : lotes.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum lote encontrado para este produto.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identificação</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Data Criação</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Localização</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lotes.map((lote) => (
                  <TableRow key={lote.id}>
                    <TableCell className="font-medium">{lote.identificacao}</TableCell>
                    <TableCell className="text-right">
                      {lote.qtde} {selectedMaterial?.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={lote.saldo > 0 ? "success" : "secondary"}>
                        {lote.saldo} {selectedMaterial?.unit}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(lote.data_criacao)}</TableCell>
                    <TableCell>{formatDate(lote.data_validade)}</TableCell>
                    <TableCell>{lote.localizacao || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
