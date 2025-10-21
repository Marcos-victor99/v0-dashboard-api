"use client"

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
import { createBrowserClient } from "@supabase/ssr"

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface Supplier {
  id: number
  code: string
  name: string
  category: string
  contact: string
  phone: string
  email: string
  address: string
  cnpj: string
  delivery_days: number
  payment_terms: number
}

export default function Fornecedores() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("name")

  useEffect(() => {
    async function fetchSuppliers() {
      const { data, error } = await supabase.from("beeoz_prod_suppliers").select("*").order("name", { ascending: true })

      if (error) {
        console.error("Error fetching suppliers:", error)
      } else {
        setSuppliers(data || [])
      }
      setLoading(false)
    }

    fetchSuppliers()
  }, [])

  const filteredSuppliers = suppliers.filter((supplier) => {
    const searchLower = searchTerm.toLowerCase()
    if (filterType === "name") {
      return supplier.name.toLowerCase().includes(searchLower)
    } else {
      return supplier.code.toLowerCase().includes(searchLower)
    }
  })

  const metrics = {
    deliveryPerformance: 82,
    deliveryPrevious: 78,
    qualityScore: 94,
    qualityPrevious: 92,
    purchaseVolume: 523000,
    purchaseTicket: 36700,
    purchasePrevious: -8,
    economySaved: 42000,
    economyLeadTime: 10,
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
                <CheckCircle2 className="h-5 w-5 text-green-600" />
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
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
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
                <DollarSign className="h-5 w-5 text-purple-600" />
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
                <Percent className="h-5 w-5 text-orange-600" />
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
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-sm font-semibold">Fornecedores Críticos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">2 fornecedores com atrasos recorrentes</p>
              <p className="text-xs text-muted-foreground">Risco de ruptura</p>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Revisar Contratos
              </Button>
            </CardContent>
          </Card>

          {/* Contratos Vencendo */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-sm font-semibold">Contratos Vencendo</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">3 contratos vencem em 30 dias</p>
              <p className="text-xs text-muted-foreground">Renovação necessária</p>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Iniciar Renovação
              </Button>
            </CardContent>
          </Card>

          {/* Dependência Única */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-sm font-semibold">Dependência Única</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">8 produtos com fornecedor único</p>
              <p className="text-xs text-muted-foreground">Risco de concentração</p>
              <Button className="w-full bg-green-600 hover:bg-green-700">
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
              <div className="text-xs text-muted-foreground">Média: 17 dias</div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                +2% vs semestre
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Taxa de Conformidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">94%</div>
              <div className="text-xs text-muted-foreground">Meta: 95%</div>
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <AlertTriangle className="h-3 w-3" />
                +8% vs semestre
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">{suppliers.length}</div>
              <div className="text-xs text-muted-foreground">2 ativos</div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 className="h-3 w-3" />
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
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium">&nbsp;</label>
                <Input
                  placeholder="Buscar por nome ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Cards Grid */}
        {loading ? (
          <div className="text-center text-muted-foreground">Carregando fornecedores...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                        {supplier.category}
                      </Badge>
                      <h3 className="font-semibold">{supplier.name}</h3>
                    </div>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      Detalhes
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{supplier.code}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Contact Information */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.contact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="text-xs leading-relaxed">{supplier.address}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Pedido
                    </Button>
                    <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                      <Package className="mr-2 h-4 w-4" />
                      Cotações
                    </Button>
                    <Button variant="default" className="bg-green-600 hover:bg-green-700">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                      <PhoneCall className="mr-2 h-4 w-4" />
                      Ligar
                    </Button>
                  </div>
                  <Button variant="default" className="w-full bg-orange-600 hover:bg-orange-700">
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                </CardContent>
              </Card>
            ))}
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
