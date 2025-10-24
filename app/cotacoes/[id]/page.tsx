"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  FileText,
  Users,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Trophy,
  DollarSign,
  Clock,
  Star,
} from "lucide-react"
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
  criterio_preco_peso: number
  criterio_prazo_peso: number
  criterio_qualidade_peso: number
}

type RequestItem = {
  id: string
  produto_id: number
  produto_identificacao: string
  produto_descricao: string
  quantidade_solicitada: number
  unidade_medida: string
  preco_referencia: number
  especificacao_tecnica: string | null
  aceita_similar: boolean
}

type Supplier = {
  id: string
  fornecedor_id: string
  fornecedor_nome: string
  status: string
  data_convite: string
  data_resposta: string | null
}

type Quotation = {
  id: string
  fornecedor_id: string
  fornecedor_nome: string
  numero_proposta: string
  valor_total: number
  prazo_entrega_dias: number
  data_recebimento: string
  status: string
  escolhida: boolean
  score_total: number
  score_preco: number
  score_prazo: number
  score_qualidade: number
  ranking: number
  condicao_pagamento: string | null
  observacoes: string | null
}

type QuotationItem = {
  id: string
  quotation_id: string
  produto_id: number
  quantidade_cotada: number
  valor_unitario: number
  valor_total: number
  prazo_entrega_dias: number
  eh_melhor_preco: boolean
}

export default function CotacaoDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [request, setRequest] = useState<QuotationRequest | null>(null)
  const [items, setItems] = useState<RequestItem[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuotationDetails()
  }, [id])

  const fetchQuotationDetails = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    try {
      const { data: requestData, error: requestError } = await supabase
        .from("beeoz_prod_quotation_requests")
        .select("*")
        .eq("id", id)
        .single()

      if (requestError) throw requestError
      setRequest(requestData)

      const { data: itemsData, error: itemsError } = await supabase
        .from("beeoz_prod_quotation_request_items")
        .select("*, produtos(identificacao, descricao)")
        .eq("quotation_request_id", id)

      if (itemsError) throw itemsError

      const enrichedItems: RequestItem[] = (itemsData || []).map((item: any) => ({
        id: item.id,
        produto_id: item.produto_id,
        produto_identificacao: item.produtos?.identificacao || `PROD-${item.produto_id}`,
        produto_descricao: item.produtos?.descricao || "Produto desconhecido",
        quantidade_solicitada: item.quantidade_solicitada,
        unidade_medida: item.unidade_medida,
        preco_referencia: item.preco_referencia,
        especificacao_tecnica: item.especificacao_tecnica,
        aceita_similar: item.aceita_similar,
      }))
      setItems(enrichedItems)

      const { data: suppliersData, error: suppliersError } = await supabase
        .from("beeoz_prod_quotation_request_suppliers")
        .select("*, fornecedores(id, cnomefantasia)")
        .eq("quotation_request_id", id)

      if (suppliersError) throw suppliersError

      const enrichedSuppliers: Supplier[] = (suppliersData || []).map((s: any) => ({
        id: s.id,
        fornecedor_id: s.fornecedor_id,
        fornecedor_nome: s.fornecedores?.cnomefantasia || "Fornecedor desconhecido",
        status: s.status,
        data_convite: s.data_convite,
        data_resposta: s.data_resposta,
      }))
      setSuppliers(enrichedSuppliers)

      const { data: quotationsData, error: quotationsError } = await supabase
        .from("beeoz_prod_quotations")
        .select("*")
        .eq("quotation_request_id", id)
        .order("ranking", { ascending: true })

      if (quotationsError) throw quotationsError

      const fornecedorIds = [...new Set(quotationsData?.map((q: any) => q.fornecedor_id) || [])]
      const { data: fornecedoresData } = await supabase
        .from("fornecedores")
        .select("id, cnomefantasia")
        .in("id", fornecedorIds)

      const enrichedQuotations: Quotation[] = (quotationsData || []).map((q: any) => {
        const fornecedor = fornecedoresData?.find((f: any) => f.id === q.fornecedor_id)
        return {
          id: q.id,
          fornecedor_id: q.fornecedor_id,
          fornecedor_nome: fornecedor?.cnomefantasia || "Fornecedor desconhecido",
          numero_proposta: q.numero_proposta,
          valor_total: q.valor_total,
          prazo_entrega_dias: q.prazo_entrega_dias,
          data_recebimento: q.data_recebimento,
          status: q.status,
          escolhida: q.escolhida,
          score_total: q.score_total,
          score_preco: q.score_preco,
          score_prazo: q.score_prazo,
          score_qualidade: q.score_qualidade,
          ranking: q.ranking,
          condicao_pagamento: q.condicao_pagamento,
          observacoes: q.observacoes,
        }
      })
      setQuotations(enrichedQuotations)

      const quotationIds = quotationsData?.map((q: any) => q.id) || []
      if (quotationIds.length > 0) {
        const { data: itemsData, error: itemsError } = await supabase
          .from("beeoz_prod_quotation_items")
          .select("*")
          .in("quotation_id", quotationIds)

        if (!itemsError) {
          setQuotationItems(itemsData || [])
        }
      }
    } catch (error) {
      console.error("Error fetching quotation details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChooseWinner = async (quotationId: string) => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    try {
      await supabase.from("beeoz_prod_quotations").update({ escolhida: false }).eq("quotation_request_id", id)

      await supabase
        .from("beeoz_prod_quotations")
        .update({
          escolhida: true,
          status: "aprovada",
          aprovada_em: new Date().toISOString(),
        })
        .eq("id", quotationId)

      await supabase.from("beeoz_prod_quotation_requests").update({ status: "aprovada" }).eq("id", id)

      fetchQuotationDetails()
    } catch (error) {
      console.error("Error choosing winner:", error)
      alert("Erro ao escolher vencedor")
    }
  }

  const handleConvertToPurchaseOrder = async () => {
    const winnerQuotation = quotations.find((q) => q.escolhida)
    if (!winnerQuotation) {
      alert("Por favor, escolha uma cotação vencedora primeiro")
      return
    }

    router.push(`/pedidos-compra/novo?quotation_id=${winnerQuotation.id}`)
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

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  if (!request) {
    return <div className="text-center py-8">Cotação não encontrada</div>
  }

  const winnerQuotation = quotations.find((q) => q.escolhida)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/cotacoes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{request.numero_cotacao}</h1>
              {getStatusBadge(request.status)}
            </div>
            <p className="text-muted-foreground mt-1">{request.titulo}</p>
          </div>
        </div>
        {winnerQuotation && request.status === "aprovada" && (
          <Button onClick={handleConvertToPurchaseOrder}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Converter em Pedido
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Itens Solicitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Produtos na cotação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {suppliers.filter((s) => s.status === "cotado").length}/{suppliers.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Responderam</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Propostas Recebidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{quotations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de cotações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Prazo Limite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {new Date(request.data_limite_resposta).toLocaleDateString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(request.data_limite_resposta).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Itens Solicitados</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="quotations">Propostas ({quotations.length})</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Itens da Cotação</CardTitle>
              <CardDescription>Produtos e quantidades solicitadas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço Referência</TableHead>
                    <TableHead>Especificação</TableHead>
                    <TableHead>Similar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.produto_descricao}</p>
                          <p className="text-xs text-muted-foreground">{item.produto_identificacao}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {item.quantidade_solicitada.toFixed(2)} {item.unidade_medida}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.preco_referencia > 0 ? (
                          <span className="font-semibold">R$ {item.preco_referencia.toFixed(2)}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.especificacao_tecnica ? (
                          <span className="text-sm">{item.especificacao_tecnica}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.aceita_similar ? (
                          <Badge variant="outline">Sim</Badge>
                        ) : (
                          <Badge variant="secondary">Não</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fornecedores Convidados</CardTitle>
              <CardDescription>Status de resposta dos fornecedores</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data Convite</TableHead>
                    <TableHead>Data Resposta</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <p className="font-medium">{supplier.fornecedor_nome}</p>
                      </TableCell>
                      <TableCell>{new Date(supplier.data_convite).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        {supplier.data_resposta ? (
                          new Date(supplier.data_resposta).toLocaleDateString("pt-BR")
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {supplier.status === "cotado" ? (
                          <Badge variant="default">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Respondeu
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Aguardando
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Propostas Recebidas</CardTitle>
              <CardDescription>Cotações enviadas pelos fornecedores</CardDescription>
            </CardHeader>
            <CardContent>
              {quotations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma proposta recebida ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quotations.map((quotation) => (
                    <div
                      key={quotation.id}
                      className={`p-4 border rounded-lg ${quotation.escolhida ? "border-green-500 bg-green-50" : ""}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {quotation.ranking === 1 && <Trophy className="h-5 w-5 text-yellow-500" />}
                          <div>
                            <p className="font-semibold text-lg">{quotation.fornecedor_nome}</p>
                            <p className="text-sm text-muted-foreground">Proposta: {quotation.numero_proposta}</p>
                          </div>
                        </div>
                        {quotation.escolhida && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Vencedor
                          </Badge>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Valor Total</p>
                          <p className="text-xl font-bold text-green-600">R$ {quotation.valor_total.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Prazo Entrega</p>
                          <p className="text-lg font-semibold">{quotation.prazo_entrega_dias} dias</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Score Total</p>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <p className="text-lg font-semibold">{quotation.score_total.toFixed(1)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Ranking</p>
                          <p className="text-lg font-semibold">#{quotation.ranking}</p>
                        </div>
                      </div>

                      <div className="grid gap-2 md:grid-cols-3 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Preço: {quotation.score_preco.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Prazo: {quotation.score_prazo.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Qualidade: {quotation.score_qualidade.toFixed(1)}</span>
                        </div>
                      </div>

                      {quotation.condicao_pagamento && (
                        <p className="text-sm mb-2">
                          <span className="font-medium">Condição de Pagamento:</span> {quotation.condicao_pagamento}
                        </p>
                      )}

                      {quotation.observacoes && (
                        <p className="text-sm text-muted-foreground mb-4">{quotation.observacoes}</p>
                      )}

                      {!quotation.escolhida && request.status !== "convertida" && (
                        <Button size="sm" onClick={() => handleChooseWinner(quotation.id)} className="w-full">
                          <Trophy className="h-4 w-4 mr-2" />
                          Escolher como Vencedor
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Propostas</CardTitle>
              <CardDescription>Análise comparativa das cotações recebidas</CardDescription>
            </CardHeader>
            <CardContent>
              {quotations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma proposta para comparar</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ranking</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotations.map((quotation) => (
                      <TableRow key={quotation.id} className={quotation.escolhida ? "bg-green-50" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {quotation.ranking === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                            <span className="font-semibold">#{quotation.ranking}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{quotation.fornecedor_nome}</p>
                          <p className="text-xs text-muted-foreground">{quotation.numero_proposta}</p>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">R$ {quotation.valor_total.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{quotation.prazo_entrega_dias} dias</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">{quotation.score_total.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {quotation.escolhida ? (
                            <Badge variant="default" className="bg-green-600">
                              Vencedor
                            </Badge>
                          ) : (
                            <Badge variant="outline">Analisando</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
