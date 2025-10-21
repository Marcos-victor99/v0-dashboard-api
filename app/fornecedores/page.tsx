"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  DollarSign,
  Zap,
  AlertTriangle,
  Clock,
  Target,
  Users,
  Package,
  Phone,
  Mail,
  MapPin,
  User,
} from "lucide-react"
import { createClient } from "@/lib/supabase-client"

export default function Fornecedores() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("name")
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("beeoz_prod_suppliers").select("*").order("name")

      if (error) throw error
      setSuppliers(data || [])
    } catch (error) {
      console.error("[v0] Erro ao buscar fornecedores:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSuppliers = suppliers.filter((supplier) => {
    const searchLower = searchTerm.toLowerCase()
    if (searchType === "name") {
      return supplier.name?.toLowerCase().includes(searchLower)
    } else {
      return supplier.code?.toLowerCase().includes(searchLower)
    }
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Fornecedores</h1>
        <p className="text-muted-foreground">Gestão estratégica de fornecedores e performance de compras</p>
      </div>

      {/* Visão Executiva */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Visão Executiva
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Performance de Entregas</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">82%</div>
              <p className="text-xs text-muted-foreground mt-1">Meta: 90%</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>+15% vs mês anterior</span>
              </div>
              <Button variant="link" className="h-auto p-0 mt-2 text-xs">
                Ver Histórico →
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Qualidade dos Fornecedores</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground mt-1">5% classificados</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>+2% vs mês anterior</span>
              </div>
              <Button variant="link" className="h-auto p-0 mt-2 text-xs">
                Avaliar Qualidade →
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Volume de Compras</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ 523k</div>
              <p className="text-xs text-muted-foreground mt-1">Ticket médio: R$ 16.1k</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                <TrendingDown className="h-3 w-3" />
                <span>-6% vs mês anterior</span>
              </div>
              <Button variant="link" className="h-auto p-0 mt-2 text-xs">
                Análise de Compras →
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Economia Negociada</CardTitle>
                <Package className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ 42k</div>
              <p className="text-xs text-muted-foreground mt-1">Lead time médio: 12 dias</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>+47% vs mês anterior</span>
              </div>
              <Button variant="link" className="h-auto p-0 mt-2 text-xs">
                Renegociar →
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Alertas e Ações Prioritárias */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Alertas e Ações Prioritárias
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-base">Fornecedores Críticos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">2 fornecedores com atrasos recorrentes</p>
                <p className="text-xs text-muted-foreground">Risco de ruptura</p>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Revisar Contratos
              </Button>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-base">Contratos Vencendo</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">3 contratos vencem em 30 dias</p>
                <p className="text-xs text-muted-foreground">Renovação necessária</p>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Iniciar Renovação
              </Button>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-base">Dependência Única</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">8 produtos com fornecedor único</p>
                <p className="text-xs text-muted-foreground">Risco de concentração</p>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Buscar Alternativas
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Indicadores de Performance */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Indicadores de Performance</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Lead Time Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">15 dias</div>
              <p className="text-xs text-muted-foreground mt-1">Meta: 12 dias</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>+7% vs anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Taxa de Conformidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground mt-1">Meta: 90%</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>+2% vs anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">4</div>
              <p className="text-xs text-muted-foreground mt-1">4 ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Entregas no Prazo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">82%</div>
              <p className="text-xs text-muted-foreground mt-1">Meta: 85%</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>+4% vs anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Catálogo de Fornecedores */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Catálogo de Fornecedores
        </h2>

        {/* Filtros */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Buscar Fornecedor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Busca</label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Por Nome do Fornecedor</SelectItem>
                  <SelectItem value="code">Por Código</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Input
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Fornecedores */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando fornecedores...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-500 hover:bg-yellow-600">Fornecedor</Badge>
                      <h3 className="text-xl font-bold">{supplier.name}</h3>
                    </div>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                      Detalhes
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{supplier.code}</p>
                  <Badge variant="outline" className="w-fit mt-2">
                    {supplier.category}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Informações de Contato */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.contact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-pretty">{supplier.address}</span>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Phone className="h-4 w-4 mr-2" />
                      Pedido
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Package className="h-4 w-4 mr-2" />
                      Contrato
                    </Button>
                  </div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredSuppliers.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum fornecedor encontrado</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
