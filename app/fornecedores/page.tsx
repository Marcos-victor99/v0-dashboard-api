"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Package,
  DollarSign,
  Percent,
  AlertTriangle,
  Clock,
  Users,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ShoppingCart,
  MessageSquare,
  PhoneCall,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface Supplier {
  id: number
  identificacao: string
  razao_social: string
  nome_fantasia: string
  documento: string
  tipo: string
  comunicacao_email: string
  comunicacao_telefone1: string
  comunicacao_telefone2: string
  endereco_logradouro: string
  endereco_numero: string
  endereco_complemento: string
  endereco_bairro: string
  endereco_cidade: string
  endereco_estado: string
  endereco_cep: string
  extra_tags: string | string[] | null
}

export default function Fornecedores() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("name")

  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const supabase = createClient()

        const allSuppliers: Supplier[] = []
        const batchSize = 1000
        let start = 0
        let hasMore = true

        console.log("[v0] Starting to fetch suppliers from fornecedor table...")

        while (hasMore) {
          const { data: suppliersBatch, error } = await supabase
            .from("fornecedor")
            .select("*")
            .range(start, start + batchSize - 1)
            .order("razao_social", { ascending: true })

          if (error) {
            console.error("[v0] Error fetching suppliers:", error)
            throw error
          }

          if (suppliersBatch && suppliersBatch.length > 0) {
            allSuppliers.push(...suppliersBatch)
            console.log(`[v0] Fetched suppliers batch: ${suppliersBatch.length} (total: ${allSuppliers.length})`)

            if (suppliersBatch.length < batchSize) {
              hasMore = false
            } else {
              start += batchSize
            }
          } else {
            hasMore = false
          }
        }

        console.log(`[v0] Total suppliers fetched: ${allSuppliers.length}`)

        const suppliersWithTags = allSuppliers.filter((s) => s.extra_tags)
        console.log(`[v0] Suppliers with extra_tags: ${suppliersWithTags.length}`)
        if (suppliersWithTags.length > 0) {
          console.log(`[v0] Sample supplier with tags:`, {
            id: suppliersWithTags[0].id,
            name: suppliersWithTags[0].razao_social,
            extra_tags: suppliersWithTags[0].extra_tags,
            tags_type: typeof suppliersWithTags[0].extra_tags,
          })
        }

        setSuppliers(allSuppliers)
      } catch (error) {
        console.error("[v0] Error in fetchSuppliers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuppliers()
  }, [])

  const filteredSuppliers = suppliers.filter((supplier) => {
    const searchLower = searchTerm.toLowerCase()
    if (filterType === "name") {
      return (
        supplier.razao_social?.toLowerCase().includes(searchLower) ||
        supplier.nome_fantasia?.toLowerCase().includes(searchLower)
      )
    } else if (filterType === "code") {
      return supplier.identificacao?.toLowerCase().includes(searchLower)
    } else if (filterType === "document") {
      return supplier.documento?.toLowerCase().includes(searchLower)
    }
    return true
  })

  const totalSuppliers = suppliers.length

  const types = Array.from(new Set(suppliers.map((s) => s.tipo))).filter(Boolean)

  const metrics = {
    deliveryPerformance: 82,
    deliveryPrevious: 78,
    qualityScore: 94,
    qualityPrevious: 92,
    purchaseVolume: 523000,
    purchaseTicket: 36700,
    purchasePrevious: -8,
    economySaved: 42000,
    economyLeadTime: 15,
    economyPrevious: 27,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Fornecedores</h1>
        <p className="text-muted-foreground">Gestão de relacionamento e performance de compras</p>
      </div>

      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="h-5 w-5" />
          Visão Executiva
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          {/* Performance de Entregas */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Performance de Entregas</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">{metrics.deliveryPerformance}%</div>
              <div className="text-xs text-muted-foreground">{metrics.deliveryPrevious}% no período</div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />+{metrics.deliveryPerformance - metrics.deliveryPrevious}% vs mês
                anterior
              </div>
              <Button variant="link" className="h-auto p-0 text-xs" onClick={() => {}}>
                Ver Histórico <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>

          {/* Qualidade dos Fornecimentos */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Qualidade dos Fornecimentos</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">{metrics.qualityScore}%</div>
              <div className="text-xs text-muted-foreground">{100 - metrics.qualityScore}% devoluções</div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />+{metrics.qualityScore - metrics.qualityPrevious}% vs mês anterior
              </div>
              <Button variant="link" className="h-auto p-0 text-xs" onClick={() => {}}>
                Avaliar Qualidade <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>

          {/* Volume de Compras */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Volume de Compras</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">R$ {(metrics.purchaseVolume / 1000).toFixed(0)}k</div>
              <div className="text-xs text-muted-foreground">
                Ticket médio: R$ {(metrics.purchaseTicket / 1000).toFixed(1)}k
              </div>
              <div className="flex items-center gap-1 text-xs text-red-600">
                <TrendingDown className="h-3 w-3" />
                {metrics.purchasePrevious}% vs mês anterior
              </div>
              <Button variant="link" className="h-auto p-0 text-xs" onClick={() => {}}>
                Analisar de Compras <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>

          {/* Economia Negociada */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Economia Negociada</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <Percent className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">R$ {(metrics.economySaved / 1000).toFixed(0)}k</div>
              <div className="text-xs text-muted-foreground">Lead time médio: {metrics.economyLeadTime} dias</div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />+{metrics.economyPrevious}% vs mês anterior
              </div>
              <Button variant="link" className="h-auto p-0 text-xs" onClick={() => {}}>
                Renegociar <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <AlertTriangle className="h-5 w-5" />
          Alertas e Ações Prioritárias
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Fornecedores Críticos */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <CardTitle className="text-sm font-semibold">Fornecedores Críticos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">2 fornecedores com atrasos recorrentes</p>
              <p className="text-xs text-muted-foreground">Risco de ruptura</p>
              <Button className="w-full">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Revisar Contratos
              </Button>
            </CardContent>
          </Card>

          {/* Contratos Vencendo */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <CardTitle className="text-sm font-semibold">Contratos Vencendo</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">3 contratos vencem em 30 dias</p>
              <p className="text-xs text-muted-foreground">Renovação necessária</p>
              <Button className="w-full">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Iniciar Renovação
              </Button>
            </CardContent>
          </Card>

          {/* Dependência Única */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                  <Package className="h-4 w-4 text-yellow-600" />
                </div>
                <CardTitle className="text-sm font-semibold">Dependência Única</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">8 produtos com fornecedor único</p>
              <p className="text-xs text-muted-foreground">Risco de concentração</p>
              <Button className="w-full">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Buscar Alternativas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="h-5 w-5" />
          Indicadores de Performance
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Lead Time Médio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">15 dias</div>
              <div className="text-xs text-muted-foreground">Prazo médio de entrega</div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                Calculado de {totalSuppliers} fornecedores
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Prazo de Pagamento Médio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">30 dias</div>
              <div className="text-xs text-muted-foreground">Prazo médio de pagamento</div>
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <CheckCircle2 className="h-3 w-3" />
                Média da base
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">{totalSuppliers}</div>
              <div className="text-xs text-muted-foreground">{types.length} tipos</div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                Cadastrados no sistema
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Entregas no Prazo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">82%</div>
              <div className="text-xs text-muted-foreground">Meta: 90%</div>
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <AlertTriangle className="h-3 w-3" />
                +3% vs semestre
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Users className="h-5 w-5" />
          Catálogo de Fornecedores
        </h2>

        {/* Search and Filter */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Buscar Fornecedor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="w-48">
                <label className="mb-2 block text-sm font-medium">Tipo de Busca</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="name">Por Nome do Fornecedor</option>
                  <option value="code">Por Código</option>
                  <option value="document">Por Documento (CNPJ/CPF)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium">&nbsp;</label>
                <Input
                  placeholder="Buscar por nome, código ou documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {loading ? "Carregando..." : `${filteredSuppliers.length} fornecedor(es) encontrado(s)`}
            </div>
          </CardContent>
        </Card>

        {/* Supplier Cards Grid */}
        {loading ? (
          <div className="text-center text-muted-foreground">Carregando fornecedores...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredSuppliers.map((supplier) => {
              const tags = (() => {
                if (!supplier.extra_tags) return []
                if (Array.isArray(supplier.extra_tags)) return supplier.extra_tags
                if (typeof supplier.extra_tags === "string") {
                  try {
                    const parsed = JSON.parse(supplier.extra_tags)
                    if (Array.isArray(parsed)) return parsed
                  } catch {
                    return supplier.extra_tags
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                  }
                }
                return []
              })()

              return (
                <Card key={supplier.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{supplier.tipo === "J" ? "Jurídica" : "Física"}</Badge>
                        <h3 className="font-semibold">{supplier.nome_fantasia || supplier.razao_social}</h3>
                      </div>
                      <Button size="sm">Detalhes</Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {supplier.identificacao} • {supplier.documento}
                    </p>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Contact Information */}
                    <div className="space-y-2 text-sm">
                      {supplier.nome_fantasia && supplier.razao_social !== supplier.nome_fantasia && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs">{supplier.razao_social}</span>
                        </div>
                      )}
                      {supplier.comunicacao_telefone1 && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{supplier.comunicacao_telefone1}</span>
                        </div>
                      )}
                      {supplier.comunicacao_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{supplier.comunicacao_email}</span>
                        </div>
                      )}
                      {(supplier.endereco_logradouro || supplier.endereco_cidade) && (
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <span className="text-xs leading-relaxed">
                            {[
                              supplier.endereco_logradouro,
                              supplier.endereco_numero,
                              supplier.endereco_bairro,
                              supplier.endereco_cidade,
                              supplier.endereco_estado,
                              supplier.endereco_cep,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Pedido
                      </Button>
                      <Button variant="outline">
                        <Package className="mr-2 h-4 w-4" />
                        Cotações
                      </Button>
                      {supplier.comunicacao_telefone1 && (
                        <>
                          <Button variant="outline">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            WhatsApp
                          </Button>
                          <Button variant="outline">
                            <PhoneCall className="mr-2 h-4 w-4" />
                            Ligar
                          </Button>
                        </>
                      )}
                    </div>
                    {supplier.comunicacao_email && (
                      <Button variant="default" className="w-full">
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {!loading && filteredSuppliers.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">Nenhum fornecedor encontrado</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
