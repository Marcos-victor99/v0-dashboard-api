"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Search,
  ClipboardList,
  Factory,
  CheckCircle2,
  AlertCircle,
  Package,
  Calendar,
  FileText,
  Settings,
  Filter,
  X,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface OrdemProducao {
  id: number
  identificacao: string
  status: string
  produto_id: number | null
  produto_identificacao: string | null
  produto_descricao: string | null
  ficha_tecnica_id: number | null
  ficha_tecnica_identificacao: string | null
  linha_producao_id: number | null
  linha_producao_descricao: string | null
  qtde: number
  data_abertura: string
  data_inicio: string | null
  data_final: string | null
  data_previsao_entrega: string | null
  tempo_total: number | null
  documento: string | null
  origem: string | null
  obs: string | null
  tarefas_count: number
  tarefas_concluidas: number
}

interface OrdemServico {
  id: number
  identificacao: string
  status: string
  operacao: string | null
  equipamento_id: number | null
  equipamento_identificacao: string | null
  equipamento_descricao: string | null
  data_abertura: string
  data_inicio: string | null
  data_final: string | null
  tempo_total: number | null
}

export const dynamic = "force-dynamic"

export default function OrdensProducao() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [produtoFilter, setProdutoFilter] = useState<string>("all")
  const [linhaFilter, setLinhaFilter] = useState<string>("all")
  const [dateFromFilter, setDateFromFilter] = useState<string>("")
  const [dateToFilter, setDateToFilter] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("data_abertura_desc")
  const [showFilters, setShowFilters] = useState(false)

  const [ordens, setOrdens] = useState<OrdemProducao[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrdem, setSelectedOrdem] = useState<OrdemProducao | null>(null)
  const [tarefas, setTarefas] = useState<OrdemServico[]>([])
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchOrdens()
  }, [])

  async function fetchOrdens() {
    try {
      console.log("[v0] Fetching ordens de produção from ordens_producao_instancias...")

      // Fetch production order instances
      const { data: ordensData, error: ordensError } = await supabase
        .from("ordens_producao_instancias")
        .select(
          `
          id,
          identificacao,
          status,
          produto_id,
          ficha_tecnica_id,
          linha_producao_id,
          qtde,
          data_abertura,
          data_inicio,
          data_final,
          data_previsao_entrega,
          tempo_total,
          documento,
          origem,
          obs
        `,
        )
        .order("data_abertura", { ascending: false })

      if (ordensError) {
        console.error("[v0] Error fetching ordens:", ordensError)
        throw ordensError
      }

      console.log(`[v0] Fetched ${ordensData?.length || 0} ordens de produção`)

      const uniqueStatuses = [...new Set(ordensData?.map((o) => o.status) || [])]
      console.log("[v0] Unique status values found:", uniqueStatuses)
      console.log("[v0] Status breakdown:", {
        total: ordensData?.length || 0,
        statusCounts: uniqueStatuses.map((status) => ({
          status,
          count: ordensData?.filter((o) => o.status === status).length || 0,
        })),
      })

      // Fetch related data
      const produtoIds = ordensData?.map((o) => o.produto_id).filter(Boolean) || []
      const fichaIds = ordensData?.map((o) => o.ficha_tecnica_id).filter(Boolean) || []
      const linhaIds = ordensData?.map((o) => o.linha_producao_id).filter(Boolean) || []

      // Fetch produtos
      const { data: produtosData } = await supabase
        .from("produtos")
        .select("id, identificacao, descricao")
        .in("id", produtoIds)

      // Fetch fichas técnicas
      const { data: fichasData } = await supabase.from("ordens_producao").select("id, identificacao").in("id", fichaIds)

      // Fetch linhas de produção
      const { data: linhasData } = await supabase.from("linhas_producao").select("id, descricao").in("id", linhaIds)

      // Fetch service orders count
      const { data: tarefasData } = await supabase.from("ordens_servico").select("id, ordem_producao_id, status")

      // Map data with related info
      const ordensWithInfo = ordensData?.map((ordem) => {
        const produto = produtosData?.find((p) => p.id === ordem.produto_id)
        const ficha = fichasData?.find((f) => f.id === ordem.ficha_tecnica_id)
        const linha = linhasData?.find((l) => l.id === ordem.linha_producao_id)

        const tarefasOrdem = tarefasData?.filter((t) => t.ordem_producao_id === ordem.id) || []
        const tarefasConcluidas = tarefasOrdem.filter(
          (t) => t.status === "concluido" || t.status === "finalizado",
        ).length

        return {
          ...ordem,
          produto_identificacao: produto?.identificacao || null,
          produto_descricao: produto?.descricao || null,
          ficha_tecnica_identificacao: ficha?.identificacao || null,
          linha_producao_descricao: linha?.descricao || null,
          tarefas_count: tarefasOrdem.length,
          tarefas_concluidas: tarefasConcluidas,
        }
      })

      console.log(`[v0] Processed ${ordensWithInfo?.length || 0} ordens with related data`)
      setOrdens(ordensWithInfo || [])
    } catch (error) {
      console.error("[v0] Error fetching ordens:", error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchOrdemDetails(ordemId: number) {
    setLoadingDetails(true)
    try {
      // Fetch service orders for this production order
      const { data: tarefasData, error: tarefasError } = await supabase
        .from("ordens_servico")
        .select(
          `
          id,
          identificacao,
          status,
          operacao,
          equipamento_id,
          data_abertura,
          data_inicio,
          data_final,
          tempo_total
        `,
        )
        .eq("ordem_producao_id", ordemId)
        .order("data_abertura")

      if (tarefasError) {
        console.error("[v0] Error fetching tarefas:", tarefasError)
        return
      }

      // Fetch equipment info
      const equipIds = tarefasData?.map((t) => t.equipamento_id).filter(Boolean) || []
      let equipData: any[] = []

      if (equipIds.length > 0) {
        const { data, error } = await supabase
          .from("equipamentos")
          .select("id, identificacao, descricao")
          .in("id", equipIds)

        if (!error) {
          equipData = data || []
        }
      }

      // Merge tarefas with equipment data
      const tarefasWithEquip = tarefasData?.map((t) => {
        const equip = equipData.find((e) => e.id === t.equipamento_id)
        return {
          ...t,
          equipamento_identificacao: equip?.identificacao || null,
          equipamento_descricao: equip?.descricao || null,
        }
      })

      setTarefas(tarefasWithEquip || [])
    } catch (error) {
      console.error("[v0] Error fetching ordem details:", error)
    } finally {
      setLoadingDetails(false)
    }
  }

  async function handleViewDetails(ordem: OrdemProducao) {
    setSelectedOrdem(ordem)
    setDetailsDialogOpen(true)
    await fetchOrdemDetails(ordem.id)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setProdutoFilter("all")
    setLinhaFilter("all")
    setDateFromFilter("")
    setDateToFilter("")
    setSortBy("data_abertura_desc")
  }

  const filteredOrdens = ordens
    .filter((ordem) => {
      // Search filter
      const matchesSearch =
        ordem.identificacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ordem.produto_descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ordem.documento?.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === "all" || ordem.status === statusFilter

      // Product filter
      const matchesProduto = produtoFilter === "all" || ordem.produto_identificacao === produtoFilter

      // Production line filter
      const matchesLinha = linhaFilter === "all" || String(ordem.linha_producao_id) === linhaFilter

      // Date range filter
      let matchesDateRange = true
      if (dateFromFilter || dateToFilter) {
        const ordemDate = new Date(ordem.data_abertura)
        if (dateFromFilter) {
          matchesDateRange = matchesDateRange && ordemDate >= new Date(dateFromFilter)
        }
        if (dateToFilter) {
          matchesDateRange = matchesDateRange && ordemDate <= new Date(dateToFilter)
        }
      }

      return matchesSearch && matchesStatus && matchesProduto && matchesLinha && matchesDateRange
    })
    .sort((a, b) => {
      // Sort logic
      switch (sortBy) {
        case "data_abertura_desc":
          return new Date(b.data_abertura).getTime() - new Date(a.data_abertura).getTime()
        case "data_abertura_asc":
          return new Date(a.data_abertura).getTime() - new Date(b.data_abertura).getTime()
        case "progresso_desc":
          return calculateProgress(b) - calculateProgress(a)
        case "progresso_asc":
          return calculateProgress(a) - calculateProgress(b)
        case "qtde_desc":
          return b.qtde - a.qtde
        case "qtde_asc":
          return a.qtde - b.qtde
        default:
          return 0
      }
    })

  const uniqueProdutos = Array.from(new Set(ordens.map((o) => o.produto_identificacao).filter(Boolean))).sort()

  const uniqueLinhas = Array.from(
    new Map(
      ordens
        .filter((o) => o.linha_producao_id !== null)
        .map((o) => [o.linha_producao_id, { id: o.linha_producao_id, desc: o.linha_producao_descricao }]),
    ).values(),
  ).sort((a, b) => (a.desc || "").localeCompare(b.desc || ""))

  const totalOrdens = ordens.length
  const ordensAbertas = ordens.filter((o) => o.status === "A PRODUZIR").length
  const ordensEmAndamento = ordens.filter((o) => o.status === "EM_ANDAMENTO").length
  const ordensConcluidas = ordens.filter((o) => o.status === "ENCERRADO" || o.status === "CONCLUÍDO").length

  const getStatusBadge = (status: string) => {
    const statusUpper = status?.toUpperCase() || ""
    if (statusUpper === "A PRODUZIR") return <Badge variant="secondary">A Produzir</Badge>
    if (statusUpper === "EM_ANDAMENTO") return <Badge variant="default">Em Andamento</Badge>
    if (statusUpper === "ENCERRADO" || statusUpper === "CONCLUÍDO") return <Badge variant="success">Concluído</Badge>
    return <Badge variant="outline">{status}</Badge>
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString("pt-BR")
  }

  const formatTime = (minutes: number | null) => {
    if (!minutes) return "-"
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
  }

  const calculateProgress = (ordem: OrdemProducao) => {
    if (ordem.tarefas_count === 0) return 0
    return Math.round((ordem.tarefas_concluidas / ordem.tarefas_count) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando ordens de produção...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Ordens de Produção</h1>
          <p className="text-muted-foreground">Acompanhamento de ordens de produção em execução</p>
        </div>
      </div>

      {/* ... existing metrics cards ... */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Ordens</p>
                <p className="text-3xl font-bold mt-2">{totalOrdens}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Abertas</p>
                <p className="text-3xl font-bold mt-2">{ordensAbertas}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-3xl font-bold mt-2">{ordensEmAndamento}</p>
              </div>
              <Factory className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-3xl font-bold mt-2">{ordensConcluidas}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                {showFilters ? "Ocultar Filtros Avançados" : "Mostrar Filtros Avançados"}
              </Button>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
          </div>

          {/* Basic search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por identificação, produto ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="A PRODUZIR">A Produzir</SelectItem>
                    <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                    <SelectItem value="ENCERRADO">Encerrado</SelectItem>
                    <SelectItem value="CONCLUÍDO">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="produto-filter">Produto</Label>
                <Select value={produtoFilter} onValueChange={setProdutoFilter}>
                  <SelectTrigger id="produto-filter">
                    <SelectValue placeholder="Todos os produtos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os produtos</SelectItem>
                    {uniqueProdutos.map((produto) => (
                      <SelectItem key={produto} value={produto!}>
                        {produto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linha-filter">Linha de Produção</Label>
                <Select value={linhaFilter} onValueChange={setLinhaFilter}>
                  <SelectTrigger id="linha-filter">
                    <SelectValue placeholder="Todas as linhas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as linhas</SelectItem>
                    {uniqueLinhas.map((linha) => (
                      <SelectItem key={linha.id} value={String(linha.id)}>
                        {linha.desc || `Linha ${linha.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-from">Data de Abertura (De)</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-to">Data de Abertura (Até)</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort-by">Ordenar por</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort-by">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data_abertura_desc">Data de Abertura (Mais recente)</SelectItem>
                    <SelectItem value="data_abertura_asc">Data de Abertura (Mais antiga)</SelectItem>
                    <SelectItem value="progresso_desc">Progresso (Maior)</SelectItem>
                    <SelectItem value="progresso_asc">Progresso (Menor)</SelectItem>
                    <SelectItem value="qtde_desc">Quantidade (Maior)</SelectItem>
                    <SelectItem value="qtde_asc">Quantidade (Menor)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Filter summary */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Mostrando {filteredOrdens.length} de {totalOrdens} ordens
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ... existing cards grid ... */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrdens.map((ordem) => {
          const progress = calculateProgress(ordem)

          return (
            <Card key={ordem.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{ordem.identificacao}</h3>
                    {ordem.documento && <p className="text-sm text-muted-foreground">{ordem.documento}</p>}
                  </div>
                  {getStatusBadge(ordem.status)}
                </div>

                {ordem.produto_descricao && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Produto</p>
                    <p className="font-medium text-sm">{ordem.produto_descricao}</p>
                    {ordem.produto_identificacao && (
                      <p className="text-xs text-muted-foreground">{ordem.produto_identificacao}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-semibold">
                      {ordem.tarefas_concluidas}/{ordem.tarefas_count} tarefas
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Quantidade</p>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      <p className="font-semibold">{ordem.qtde}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Abertura</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <p className="font-semibold">{formatDate(ordem.data_abertura)}</p>
                    </div>
                  </div>
                </div>

                {ordem.ficha_tecnica_identificacao && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span>Ficha: {ordem.ficha_tecnica_identificacao}</span>
                  </div>
                )}

                {ordem.linha_producao_descricao && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Factory className="h-3 w-3" />
                    <span>{ordem.linha_producao_descricao}</span>
                  </div>
                )}

                <Button className="w-full" onClick={() => handleViewDetails(ordem)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Ver Tarefas
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredOrdens.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma ordem de produção encontrada</h3>
          <p className="text-muted-foreground">Tente ajustar os termos de busca ou filtros.</p>
        </div>
      )}

      {/* ... existing dialog ... */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="!w-[98vw] !h-[95vh] !max-w-[98vw] flex flex-col overflow-hidden p-6">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Detalhes da Ordem de Produção</DialogTitle>
            <DialogDescription>
              {selectedOrdem && (
                <>
                  {selectedOrdem.identificacao} - {selectedOrdem.produto_descricao || "Sem produto"}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="tarefas" className="w-full h-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tarefas">Tarefas ({tarefas.length})</TabsTrigger>
                  <TabsTrigger value="info">Informações</TabsTrigger>
                </TabsList>

                <TabsContent value="tarefas" className="space-y-4">
                  {tarefas.length === 0 ? (
                    <div className="text-center py-8">
                      <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhuma tarefa cadastrada.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Operação</TableHead>
                          <TableHead>Equipamento</TableHead>
                          <TableHead>Abertura</TableHead>
                          <TableHead>Início</TableHead>
                          <TableHead>Fim</TableHead>
                          <TableHead className="text-right">Tempo Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tarefas.map((tarefa) => (
                          <TableRow key={tarefa.id}>
                            <TableCell className="font-medium">{tarefa.identificacao}</TableCell>
                            <TableCell>{getStatusBadge(tarefa.status)}</TableCell>
                            <TableCell>{tarefa.operacao || "-"}</TableCell>
                            <TableCell>
                              {tarefa.equipamento_descricao || tarefa.equipamento_identificacao || "-"}
                            </TableCell>
                            <TableCell>{formatDateTime(tarefa.data_abertura)}</TableCell>
                            <TableCell>{formatDateTime(tarefa.data_inicio)}</TableCell>
                            <TableCell>{formatDateTime(tarefa.data_final)}</TableCell>
                            <TableCell className="text-right">{formatTime(tarefa.tempo_total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="info" className="space-y-4">
                  {selectedOrdem && (
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardContent className="pt-6 space-y-3">
                          <h3 className="font-semibold mb-4">Informações Gerais</h3>
                          <div>
                            <p className="text-sm text-muted-foreground">Identificação</p>
                            <p className="font-medium">{selectedOrdem.identificacao}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <div className="mt-1">{getStatusBadge(selectedOrdem.status)}</div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Quantidade</p>
                            <p className="font-medium">{selectedOrdem.qtde}</p>
                          </div>
                          {selectedOrdem.documento && (
                            <div>
                              <p className="text-sm text-muted-foreground">Documento</p>
                              <p className="font-medium">{selectedOrdem.documento}</p>
                            </div>
                          )}
                          {selectedOrdem.origem && (
                            <div>
                              <p className="text-sm text-muted-foreground">Origem</p>
                              <p className="font-medium">{selectedOrdem.origem}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6 space-y-3">
                          <h3 className="font-semibold mb-4">Datas</h3>
                          <div>
                            <p className="text-sm text-muted-foreground">Data de Abertura</p>
                            <p className="font-medium">{formatDateTime(selectedOrdem.data_abertura)}</p>
                          </div>
                          {selectedOrdem.data_inicio && (
                            <div>
                              <p className="text-sm text-muted-foreground">Data de Início</p>
                              <p className="font-medium">{formatDateTime(selectedOrdem.data_inicio)}</p>
                            </div>
                          )}
                          {selectedOrdem.data_final && (
                            <div>
                              <p className="text-sm text-muted-foreground">Data Final</p>
                              <p className="font-medium">{formatDateTime(selectedOrdem.data_final)}</p>
                            </div>
                          )}
                          {selectedOrdem.data_previsao_entrega && (
                            <div>
                              <p className="text-sm text-muted-foreground">Previsão de Entrega</p>
                              <p className="font-medium">{formatDateTime(selectedOrdem.data_previsao_entrega)}</p>
                            </div>
                          )}
                          {selectedOrdem.tempo_total && (
                            <div>
                              <p className="text-sm text-muted-foreground">Tempo Total</p>
                              <p className="font-medium">{formatTime(selectedOrdem.tempo_total)}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {selectedOrdem.obs && (
                        <Card className="md:col-span-2">
                          <CardContent className="pt-6">
                            <h3 className="font-semibold mb-2">Observações</h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedOrdem.obs}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
