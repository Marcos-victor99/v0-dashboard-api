"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, FileText, Package, Settings, ChevronDown, ChevronUp } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface FichaTecnica {
  id: number
  identificacao: string
  descricao: string
  produto: string | null
  status: string
  data_criacao: string
  qtde: number | null
  qtde_referencia: number | null
  operacoes_count: number
  materiais_count: number
  subprodutos_count: number
}

interface Operacao {
  operacao_id: string
  ordem_id: number
  tempo_preparacao: number | null
  tempo_operacao: number | null
  tempo_total_otimista: number | null
  tempo_total_pessimista: number | null
  capacidade: number | null
  unidade: string | null
}

interface Material {
  material_id: string
  operacao_id: string
  produto_id: number
  produto_identificacao: string | null
  produto_descricao: string | null
  qtde: number
  porcentagem: number | null
}

interface Subproduto {
  subproduto_id: string
  operacao_id: string
  produto_id: number
  produto_identificacao: string | null
  produto_descricao: string | null
  qtde: number
  comportamento: string | null
}

export default function FichasTecnicas() {
  const [searchTerm, setSearchTerm] = useState("")
  const [fichas, setFichas] = useState<FichaTecnica[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFicha, setSelectedFicha] = useState<FichaTecnica | null>(null)
  const [operacoes, setOperacoes] = useState<Operacao[]>([])
  const [materiais, setMateriais] = useState<Material[]>([])
  const [subprodutos, setSubprodutos] = useState<Subproduto[]>([])
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchFichasTecnicas()
  }, [])

  async function fetchFichasTecnicas() {
    try {
      console.log("[v0] Fetching fichas técnicas from ordens_producao table...")

      const { data: ordensData, error: ordensError } = await supabase
        .from("ordens_producao")
        .select(
          `
          id,
          identificacao,
          descricao,
          produto,
          status,
          data_criacao,
          qtde,
          qtde_referencia
        `,
        )
        .order("identificacao")

      if (ordensError) {
        console.error("[v0] Error fetching ordens_producao:", ordensError)
        throw ordensError
      }

      console.log(`[v0] Fetched ${ordensData?.length || 0} fichas técnicas`)

      const { data: operacoesData, error: operacoesError } = await supabase
        .from("operacoes")
        .select("operacao_id, ordem_id")

      if (operacoesError) {
        console.error("[v0] Error fetching operacoes:", operacoesError)
      }

      const { data: materiaisData, error: materiaisError } = await supabase
        .from("operacao_materiais")
        .select("material_id, operacao_id")

      if (materiaisError) {
        console.error("[v0] Error fetching materiais:", materiaisError)
      }

      const { data: subprodutosData, error: subprodutosError } = await supabase
        .from("operacao_subprodutos")
        .select("subproduto_id, operacao_id")

      if (subprodutosError) {
        console.error("[v0] Error fetching subprodutos:", subprodutosError)
      }

      // Map data with counts
      const fichasWithCounts = ordensData?.map((ordem) => {
        const operacoesCount = operacoesData?.filter((op) => op.ordem_id === ordem.id).length || 0

        const operacaoIds = operacoesData?.filter((op) => op.ordem_id === ordem.id).map((op) => op.operacao_id) || []

        const materiaisCount = materiaisData?.filter((m) => operacaoIds.includes(m.operacao_id)).length || 0

        const subprodutosCount = subprodutosData?.filter((s) => operacaoIds.includes(s.operacao_id)).length || 0

        return {
          id: ordem.id,
          identificacao: ordem.identificacao,
          descricao: ordem.descricao,
          produto: ordem.produto,
          status: ordem.status,
          data_criacao: ordem.data_criacao,
          qtde: ordem.qtde,
          qtde_referencia: ordem.qtde_referencia,
          operacoes_count: operacoesCount,
          materiais_count: materiaisCount,
          subprodutos_count: subprodutosCount,
        }
      })

      console.log(`[v0] Processed ${fichasWithCounts?.length || 0} fichas with counts`)
      setFichas(fichasWithCounts || [])
    } catch (error) {
      console.error("[v0] Error fetching fichas técnicas:", error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchFichaDetails(fichaId: number) {
    setLoadingDetails(true)
    try {
      const { data: operacoesData, error: operacoesError } = await supabase
        .from("operacoes")
        .select(
          `
          operacao_id,
          ordem_id,
          tempo_preparacao,
          tempo_operacao,
          tempo_total_otimista,
          tempo_total_pessimista,
          capacidade,
          unidade
        `,
        )
        .eq("ordem_id", fichaId)

      if (operacoesError) {
        console.error("[v0] Error fetching operacoes:", operacoesError)
        return
      }

      setOperacoes(operacoesData || [])

      const operacaoIds = operacoesData?.map((op) => op.operacao_id) || []

      // Fetch materiais
      if (operacaoIds.length > 0) {
        const { data: materiaisData, error: materiaisError } = await supabase
          .from("operacao_materiais")
          .select(
            `
            material_id,
            operacao_id,
            produto_id,
            qtde,
            porcentagem
          `,
          )
          .in("operacao_id", operacaoIds)

        if (materiaisError) {
          console.error("[v0] Error fetching materiais:", materiaisError)
        } else {
          const matProdIds = materiaisData?.map((m) => m.produto_id).filter(Boolean) || []
          const { data: matProdsData } = await supabase
            .from("produtos")
            .select("id, identificacao, descricao")
            .in("id", matProdIds)

          const materiaisWithNames = materiaisData?.map((m) => {
            const produto = matProdsData?.find((p) => p.id === m.produto_id)
            return {
              ...m,
              produto_identificacao: produto?.identificacao || null,
              produto_descricao: produto?.descricao || null,
            }
          })

          setMateriais(materiaisWithNames || [])
        }

        // Fetch subprodutos
        const { data: subprodutosData, error: subprodutosError } = await supabase
          .from("operacao_subprodutos")
          .select(
            `
            subproduto_id,
            operacao_id,
            produto_id,
            qtde,
            comportamento
          `,
          )
          .in("operacao_id", operacaoIds)

        if (subprodutosError) {
          console.error("[v0] Error fetching subprodutos:", subprodutosError)
        } else {
          const subProdIds = subprodutosData?.map((s) => s.produto_id).filter(Boolean) || []
          const { data: subProdsData } = await supabase
            .from("produtos")
            .select("id, identificacao, descricao")
            .in("id", subProdIds)

          const subprodutosWithNames = subprodutosData?.map((s) => {
            const produto = subProdsData?.find((p) => p.id === s.produto_id)
            return {
              ...s,
              produto_identificacao: produto?.identificacao || null,
              produto_descricao: produto?.descricao || null,
            }
          })

          setSubprodutos(subprodutosWithNames || [])
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching ficha details:", error)
    } finally {
      setLoadingDetails(false)
    }
  }

  async function handleViewDetails(ficha: FichaTecnica) {
    setSelectedFicha(ficha)
    setDetailsDialogOpen(true)
    await fetchFichaDetails(ficha.id)
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

  const filteredFichas = fichas.filter((ficha) => {
    const matchesSearch =
      ficha.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ficha.identificacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ficha.produto?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const formatTime = (minutes: number | null) => {
    if (!minutes) return "-"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando fichas técnicas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Fichas Técnicas</h1>
          <p className="text-muted-foreground">Gestão de processos produtivos e estruturas de produção</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Fichas</p>
                <p className="text-3xl font-bold mt-2">{fichas.length}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativas</p>
                <p className="text-3xl font-bold mt-2">{fichas.filter((f) => f.status === "ativo").length}</p>
              </div>
              <Settings className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Operações</p>
                <p className="text-3xl font-bold mt-2">{fichas.reduce((sum, f) => sum + f.operacoes_count, 0)}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Materiais</p>
                <p className="text-3xl font-bold mt-2">{fichas.reduce((sum, f) => sum + f.materiais_count, 0)}</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Filtros</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por identificação, descrição ou produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredFichas.map((ficha) => {
          const isExpanded = expandedCards.has(ficha.id)

          return (
            <Card key={ficha.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{ficha.descricao}</h3>
                    <p className="text-sm text-muted-foreground">{ficha.identificacao}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ficha.status === "ativo" ? "success" : "secondary"}>{ficha.status}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => toggleCard(ficha.id)} className="h-6 w-6 p-0">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {ficha.produto && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Produto</p>
                    <p className="font-medium text-sm">{ficha.produto}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Operações</p>
                    <p className="font-semibold text-blue-600">{ficha.operacoes_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Materiais</p>
                    <p className="font-semibold text-orange-600">{ficha.materiais_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Subprodutos</p>
                    <p className="font-semibold text-green-600">{ficha.subprodutos_count}</p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t pt-4 space-y-2 text-sm">
                    {ficha.qtde && (
                      <div>
                        <p className="text-xs text-muted-foreground">Quantidade</p>
                        <p className="font-medium">{ficha.qtde}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Data de Criação</p>
                      <p className="font-medium">{formatDate(ficha.data_criacao)}</p>
                    </div>
                  </div>
                )}

                <Button className="w-full" onClick={() => handleViewDetails(ficha)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Detalhes Completos
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredFichas.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma ficha técnica encontrada</h3>
          <p className="text-muted-foreground">Tente ajustar os termos de busca.</p>
        </div>
      )}

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Ficha Técnica</DialogTitle>
            <DialogDescription>
              {selectedFicha && (
                <>
                  {selectedFicha.descricao} ({selectedFicha.identificacao})
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs defaultValue="operacoes" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="operacoes">Operações ({operacoes.length})</TabsTrigger>
                <TabsTrigger value="materiais">Materiais ({materiais.length})</TabsTrigger>
                <TabsTrigger value="subprodutos">Subprodutos ({subprodutos.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="operacoes" className="space-y-4">
                {operacoes.length === 0 ? (
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma operação cadastrada.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Operação</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead className="text-right">Preparação</TableHead>
                        <TableHead className="text-right">Operação</TableHead>
                        <TableHead className="text-right">Capacidade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {operacoes.map((op) => (
                        <TableRow key={op.operacao_id}>
                          <TableCell className="font-medium">{op.operacao_id}</TableCell>
                          <TableCell>{op.unidade || "-"}</TableCell>
                          <TableCell className="text-right">{formatTime(op.tempo_preparacao)}</TableCell>
                          <TableCell className="text-right">{formatTime(op.tempo_operacao)}</TableCell>
                          <TableCell className="text-right">{op.capacidade || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="materiais" className="space-y-4">
                {materiais.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum material cadastrado.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Operação</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materiais.map((mat) => (
                        <TableRow key={mat.material_id}>
                          <TableCell>
                            <Badge variant="outline">{mat.operacao_id}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{mat.produto_descricao || "Sem descrição"}</TableCell>
                          <TableCell className="text-muted-foreground">{mat.produto_identificacao || "-"}</TableCell>
                          <TableCell className="text-right">{mat.qtde}</TableCell>
                          <TableCell className="text-right">{mat.porcentagem ? `${mat.porcentagem}%` : "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="subprodutos" className="space-y-4">
                {subprodutos.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum subproduto cadastrado.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Operação</TableHead>
                        <TableHead>Subproduto</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                        <TableHead>Comportamento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subprodutos.map((sub) => (
                        <TableRow key={sub.subproduto_id}>
                          <TableCell>
                            <Badge variant="outline">{sub.operacao_id}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{sub.produto_descricao || "Sem descrição"}</TableCell>
                          <TableCell className="text-muted-foreground">{sub.produto_identificacao || "-"}</TableCell>
                          <TableCell className="text-right">{sub.qtde}</TableCell>
                          <TableCell>{sub.comportamento || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
