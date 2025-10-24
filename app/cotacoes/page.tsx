"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Search, Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

type QuotationRequest = {
  id: string
  numero_cotacao: string
  titulo: string
  descricao: string | null
  origem: string
  status: string
  data_abertura: string
  data_limite_resposta: string
  total_itens: number
  total_fornecedores_convidados: number
  fornecedores_responderam: number
  total_cotacoes_recebidas: number
  taxa_resposta: number
  days_until_deadline: number
  urgency: string
}

export default function CotacoesPage() {
  const [requests, setRequests] = useState<QuotationRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<QuotationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchQuotationRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, searchTerm, statusFilter])

  const fetchQuotationRequests = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    try {
      const { data: requestsData, error: requestsError } = await supabase
        .from("beeoz_prod_quotation_requests")
        .select("*")
        .order("data_abertura", { ascending: false })

      if (requestsError) throw requestsError

      const requestIds = requestsData?.map((r) => r.id) || []

      const [itemsResult, suppliersResult, quotationsResult] = await Promise.all([
        supabase
          .from("beeoz_prod_quotation_request_items")
          .select("quotation_request_id")
          .in("quotation_request_id", requestIds),
        supabase
          .from("beeoz_prod_quotation_request_suppliers")
          .select("quotation_request_id, status")
          .in("quotation_request_id", requestIds),
        supabase
          .from("beeoz_prod_quotations")
          .select("quotation_request_id, status")
          .in("quotation_request_id", requestIds),
      ])

      if (itemsResult.error) throw itemsResult.error
      if (suppliersResult.error) throw suppliersResult.error
      if (quotationsResult.error) throw quotationsResult.error

      const now = new Date()
      const enrichedData: QuotationRequest[] = (requestsData || []).map((req) => {
        const totalItens = itemsResult.data?.filter((i) => i.quotation_request_id === req.id).length || 0
        const fornecedoresConvidados =
          suppliersResult.data?.filter((s) => s.quotation_request_id === req.id).length || 0
        const fornecedoresResponderam =
          suppliersResult.data?.filter((s) => s.quotation_request_id === req.id && s.status === "cotado").length || 0
        const cotacoesRecebidas = quotationsResult.data?.filter((q) => q.quotation_request_id === req.id).length || 0
        const taxaResposta = fornecedoresConvidados > 0 ? (fornecedoresResponderam / fornecedoresConvidados) * 100 : 0

        const dataLimite = new Date(req.data_limite_resposta)
        const daysUntilDeadline = Math.ceil((dataLimite.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        let urgency = "normal"
        if (daysUntilDeadline < 0) urgency = "vencida"
        else if (daysUntilDeadline <= 2) urgency = "urgente"
        else if (daysUntilDeadline <= 5) urgency = "atencao"

        return {
          id: req.id,
          numero_cotacao: req.numero_cotacao,
          titulo: req.titulo,
          descricao: req.descricao,
          origem: req.origem,
          status: req.status,
          data_abertura: req.data_abertura,
          data_limite_resposta: req.data_limite_resposta,
          total_itens: totalItens,
          total_fornecedores_convidados: fornecedoresConvidados,
          fornecedores_responderam: fornecedoresResponderam,
          total_cotacoes_recebidas: cotacoesRecebidas,
          taxa_resposta: taxaResposta,
          days_until_deadline: daysUntilDeadline,
          urgency,
        }
      })

      setRequests(enrichedData)
    } catch (error) {
      console.error("Error fetching quotation requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = requests

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.numero_cotacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.titulo.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredRequests(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      rascunho: { label: "Rascunho", variant: "outline" },
      enviada: { label: "Enviada", variant: "default" },
      em_analise: { label: "Em Análise", variant: "secondary" },
      analisada: { label: "Analisada", variant: "secondary" },
      aprovada: { label: "Aprovada", variant: "default" },
      convertida: { label: "Convertida", variant: "outline" },
      cancelada: { label: "Cancelada", variant: "destructive" },
    }
    const config = statusMap[status] || { label: status, variant: "outline" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getUrgencyBadge = (urgency: string) => {
    const urgencyMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> =
      {
        vencida: { label: "Vencida", variant: "destructive" },
        urgente: { label: "Urgente", variant: "destructive" },
        atencao: { label: "Atenção", variant: "default" },
        normal: { label: "Normal", variant: "outline" },
      }
    const config = urgencyMap[urgency] || { label: urgency, variant: "outline" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const stats = {
    total: requests.length,
    enviadas: requests.filter((r) => r.status === "enviada").length,
    em_analise: requests.filter((r) => r.status === "em_analise").length,
    convertidas: requests.filter((r) => r.status === "convertida").length,
    taxa_resposta_media:
      requests.length > 0 ? requests.reduce((sum, r) => sum + r.taxa_resposta, 0) / requests.length : 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Solicitações de Cotação</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie solicitações de cotação e compare propostas de fornecedores
          </p>
        </div>
        <Link href="/cotacoes/nova">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Cotação
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total de Cotações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Todas as solicitações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Enviadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.enviadas}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando respostas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Em Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.em_analise}</div>
            <p className="text-xs text-muted-foreground mt-1">Comparando propostas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Taxa de Resposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.taxa_resposta_media.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Média geral</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Solicitações</CardTitle>
              <CardDescription>Visualize e gerencie todas as solicitações de cotação</CardDescription>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número ou título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="enviada">Enviada</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="analisada">Analisada</SelectItem>
                <SelectItem value="aprovada">Aprovada</SelectItem>
                <SelectItem value="convertida">Convertida</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Fornecedores</TableHead>
                  <TableHead>Propostas</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <Link href={`/cotacoes/${req.id}`} className="font-medium text-blue-600 hover:underline">
                        {req.numero_cotacao}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{req.titulo}</p>
                        {req.descricao && <p className="text-xs text-muted-foreground line-clamp-1">{req.descricao}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{req.origem === "mrp" ? "MRP" : req.origem.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{req.total_itens}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">
                          {req.fornecedores_responderam}/{req.total_fornecedores_convidados}
                        </p>
                        <p className="text-xs text-muted-foreground">{req.taxa_resposta.toFixed(0)}% resposta</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{req.total_cotacoes_recebidas}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{new Date(req.data_limite_resposta).toLocaleDateString("pt-BR")}</p>
                        <div className="mt-1">{getUrgencyBadge(req.urgency)}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/cotacoes/${req.id}`}>
                        <Button size="sm" variant="outline">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
