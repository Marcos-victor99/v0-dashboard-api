"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Search, Plus, FileText } from "lucide-react"
import Link from "next/link"

type MaterialRequirement = {
  id: number
  produto_id: number
  produto_identificacao: string
  produto_descricao: string
  quantidade_necessaria: number
  unidade_medida: string
  data_necessidade: string
  data_solicitacao: string
  status: string
  ordem_producao_instancia_id: number | null
  ordem_producao_identificacao: string | null
  purchase_order_id: number | null
  purchase_order_number: string | null
  days_until_needed: number
  urgency: string
}

export default function NecessidadesMateriaisPage() {
  const [requirements, setRequirements] = useState<MaterialRequirement[]>([])
  const [filteredRequirements, setFilteredRequirements] = useState<MaterialRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchRequirements()
  }, [])

  useEffect(() => {
    filterRequirements()
  }, [requirements, searchTerm, statusFilter])

  const fetchRequirements = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    try {
      const { data: mrData, error: mrError } = await supabase
        .from("beeoz_prod_material_requirements")
        .select(`
          id,
          produto_id,
          quantidade_necessaria,
          unidade_medida,
          data_necessidade,
          data_solicitacao,
          status,
          ordem_producao_instancia_id,
          purchase_order_id
        `)
        .order("data_necessidade", { ascending: true })

      if (mrError) throw mrError

      const produtoIds = [...new Set(mrData?.map((mr) => mr.produto_id) || [])]
      const { data: produtos, error: produtosError } = await supabase
        .from("produtos")
        .select("id, identificacao, descricao, unidade_medida")
        .in("id", produtoIds)

      if (produtosError) throw produtosError

      const ordemIds = [
        ...new Set(
          mrData?.filter((mr) => mr.ordem_producao_instancia_id).map((mr) => mr.ordem_producao_instancia_id) || [],
        ),
      ]
      const { data: ordens, error: ordensError } = await supabase
        .from("ordens_producao_instancias")
        .select("id, identificacao")
        .in("id", ordemIds)

      if (ordensError) throw ordensError

      const pedidoIds = [
        ...new Set(mrData?.filter((mr) => mr.purchase_order_id).map((mr) => mr.purchase_order_id) || []),
      ]
      const { data: pedidos, error: pedidosError } = await supabase
        .from("beeoz_prod_purchase_orders")
        .select("id, order_number")
        .in("id", pedidoIds)

      if (pedidosError) throw pedidosError

      const now = new Date()
      const enrichedData: MaterialRequirement[] = (mrData || []).map((mr) => {
        const produto = produtos?.find((p) => p.id === mr.produto_id)
        const ordem = ordens?.find((o) => o.id === mr.ordem_producao_instancia_id)
        const pedido = pedidos?.find((p) => p.id === mr.purchase_order_id)
        const dataNecessidade = new Date(mr.data_necessidade)
        const daysUntilNeeded = Math.ceil((dataNecessidade.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        let urgency = "normal"
        if (daysUntilNeeded < 0) urgency = "atrasado"
        else if (daysUntilNeeded <= 3) urgency = "urgente"
        else if (daysUntilNeeded <= 7) urgency = "prioritario"

        return {
          id: mr.id,
          produto_id: mr.produto_id,
          produto_identificacao: produto?.identificacao || `PROD-${mr.produto_id}`,
          produto_descricao: produto?.descricao || "Produto desconhecido",
          quantidade_necessaria: mr.quantidade_necessaria,
          unidade_medida: mr.unidade_medida || produto?.unidade_medida || "UN",
          data_necessidade: mr.data_necessidade,
          data_solicitacao: mr.data_solicitacao,
          status: mr.status,
          ordem_producao_instancia_id: mr.ordem_producao_instancia_id,
          ordem_producao_identificacao: ordem?.identificacao || null,
          purchase_order_id: mr.purchase_order_id,
          purchase_order_number: pedido?.order_number || null,
          days_until_needed: daysUntilNeeded,
          urgency,
        }
      })

      setRequirements(enrichedData)
    } catch (error) {
      console.error("Error fetching material requirements:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterRequirements = () => {
    let filtered = requirements

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.produto_identificacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.produto_descricao.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredRequirements(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pendente: { label: "Pendente", variant: "destructive" },
      em_compra: { label: "Em Compra", variant: "default" },
      comprado: { label: "Comprado", variant: "secondary" },
      recebido: { label: "Recebido", variant: "outline" },
      alocado: { label: "Alocado", variant: "outline" },
    }
    const config = statusMap[status] || { label: status, variant: "outline" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getUrgencyBadge = (urgency: string) => {
    const urgencyMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: string }
    > = {
      atrasado: { label: "Atrasado", variant: "destructive", icon: "🔴" },
      urgente: { label: "Urgente", variant: "destructive", icon: "🟠" },
      prioritario: { label: "Prioritário", variant: "default", icon: "🟡" },
      normal: { label: "Normal", variant: "outline", icon: "🟢" },
    }
    const config = urgencyMap[urgency] || { label: urgency, variant: "outline", icon: "" }
    return (
      <Badge variant={config.variant}>
        {config.icon} {config.label}
      </Badge>
    )
  }

  const stats = {
    total: requirements.length,
    pendente: requirements.filter((r) => r.status === "pendente").length,
    urgente: requirements.filter((r) => r.urgency === "urgente" || r.urgency === "atrasado").length,
    em_compra: requirements.filter((r) => r.status === "em_compra").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Necessidades de Materiais (MRP)</h1>
          <p className="text-muted-foreground mt-1">Gerencie as necessidades de materiais identificadas pelo sistema</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Necessidade
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Necessidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Todas as necessidades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.pendente}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando cotação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Urgentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.urgente}</div>
            <p className="text-xs text-muted-foreground mt-1">Prazo crítico</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Compra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.em_compra}</div>
            <p className="text-xs text-muted-foreground mt-1">Pedidos em andamento</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Necessidades</CardTitle>
              <CardDescription>Visualize e gerencie todas as necessidades de materiais</CardDescription>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por produto..."
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
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_compra">Em Compra</SelectItem>
                <SelectItem value="comprado">Comprado</SelectItem>
                <SelectItem value="recebido">Recebido</SelectItem>
                <SelectItem value="alocado">Alocado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredRequirements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma necessidade encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Data Necessidade</TableHead>
                  <TableHead>Urgência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequirements.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{req.produto_descricao}</p>
                        <p className="text-xs text-muted-foreground">{req.produto_identificacao}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {req.quantidade_necessaria.toFixed(2)} {req.unidade_medida}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{new Date(req.data_necessidade).toLocaleDateString("pt-BR")}</p>
                        <p className="text-xs text-muted-foreground">
                          {req.days_until_needed >= 0
                            ? `Em ${req.days_until_needed} dias`
                            : `Atrasado ${Math.abs(req.days_until_needed)} dias`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getUrgencyBadge(req.urgency)}</TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell>
                      {req.ordem_producao_identificacao ? (
                        <Link
                          href={`/ordens-producao`}
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          {req.ordem_producao_identificacao}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">Manual</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {req.purchase_order_number ? (
                        <Link href={`/pedidos-compra`} className="text-sm text-blue-600 hover:underline">
                          {req.purchase_order_number}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {req.status === "pendente" && (
                        <Link href={`/cotacoes/nova?mr_id=${req.id}`}>
                          <Button size="sm" variant="outline">
                            Criar Cotação
                          </Button>
                        </Link>
                      )}
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
