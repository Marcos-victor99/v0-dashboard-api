"use client"

import { ArrowLeft, Building2, Calendar, CheckCircle2, Mail, MapPin, Phone, TrendingUp, XCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

export default function FornecedorDetalhes() {
  const router = useRouter()
  const params = useParams()
  const supplierId = params.id

  // Mock data - em produção viria de uma API
  const supplier = {
    id: Number(supplierId),
    code: "FOR001",
    name: "Apiário São Paulo",
    cnpj: "12.345.678/0001-90",
    contactPerson: "João Silva",
    phone: "(11) 98765-4321",
    email: "contato@apiariosaopaulo.com.br",
    address: "Rua das Abelhas, 123 - São Paulo, SP",
  }

  const items = [
    {
      id: 1,
      rawMaterial: { code: "MP001", name: "Própolis Verde" },
      unitPrice: 150.0,
      minOrderQty: 10,
      leadTimeDays: 15,
    },
    {
      id: 2,
      rawMaterial: { code: "MP002", name: "Mel Silvestre" },
      unitPrice: 45.0,
      minOrderQty: 50,
      leadTimeDays: 10,
    },
    {
      id: 3,
      rawMaterial: { code: "MP010", name: "Própolis Vermelha" },
      unitPrice: 180.0,
      minOrderQty: 10,
      leadTimeDays: 20,
    },
  ]

  // Dados mockados para o gráfico (últimos 12 meses)
  const purchaseData = [
    { mes: "Nov/24", valor: 12500 },
    { mes: "Dez/24", valor: 15800 },
    { mes: "Jan/25", valor: 14200 },
    { mes: "Fev/25", valor: 16900 },
    { mes: "Mar/25", valor: 18300 },
    { mes: "Abr/25", valor: 15600 },
    { mes: "Mai/25", valor: 17400 },
    { mes: "Jun/25", valor: 19200 },
    { mes: "Jul/25", valor: 16800 },
    { mes: "Ago/25", valor: 18900 },
    { mes: "Set/25", valor: 20100 },
    { mes: "Out/25", valor: 21500 },
  ]

  const totalComprado = purchaseData.reduce((acc, curr) => acc + curr.valor, 0)
  const numeroPedidos = 48
  const ticketMedio = totalComprado / numeroPedidos

  // Dados de homologação (mockados)
  const homologacao = {
    status: "homologado" as "homologado" | "pendente" | "vencido",
    dataHomologacao: "15/03/2024",
    dataVencimento: "15/03/2026",
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "homologado":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Homologado
          </Badge>
        )
      case "pendente":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>
      case "vencido":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Vencido
          </Badge>
        )
      default:
        return null
    }
  }

  const handleWhatsApp = () => {
    if (supplier?.phone) {
      const phoneNumber = supplier.phone.replace(/\D/g, "")
      window.open(`https://wa.me/55${phoneNumber}`, "_blank")
    }
  }

  const handleCall = () => {
    if (supplier?.phone) {
      window.location.href = `tel:${supplier.phone}`
    }
  }

  const handleEmail = () => {
    if (supplier?.email) {
      window.location.href = `mailto:${supplier.email}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push("/fornecedores")} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Fornecedores
          </Button>
          <h1 className="text-3xl font-bold">{supplier.name}</h1>
          <p className="text-muted-foreground">{supplier.code}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleWhatsApp} className="bg-green-600 hover:bg-green-700">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            WhatsApp
          </Button>
          <Button onClick={handleCall} className="bg-blue-600 hover:bg-blue-700">
            <Phone className="w-4 h-4 mr-2" />
            Ligar
          </Button>
          <Button onClick={handleEmail} className="bg-orange-600 hover:bg-orange-700">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comprado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalComprado)}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 12 meses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Realizados</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numeroPedidos}</div>
            <p className="text-xs text-muted-foreground">Últimos 12 meses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(ticketMedio)}
            </div>
            <p className="text-xs text-muted-foreground">Por pedido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Qualidade</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="mb-2">{getStatusBadge(homologacao.status)}</div>
            <p className="text-xs text-muted-foreground">Vence em {homologacao.dataVencimento}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Cadastrais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Cadastrais</CardTitle>
            <CardDescription>Dados completos do fornecedor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Razão Social</p>
                  <p className="text-sm text-muted-foreground">{supplier.name}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">CNPJ</p>
                  <p className="text-sm text-muted-foreground">{supplier.cnpj || "Não informado"}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Contato</p>
                  <p className="text-sm text-muted-foreground">{supplier.contactPerson || "Não informado"}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <p className="text-sm text-muted-foreground">{supplier.phone || "Não informado"}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{supplier.email || "Não informado"}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Endereço</p>
                  <p className="text-sm text-muted-foreground">{supplier.address || "Não informado"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Homologação de Qualidade */}
        <Card>
          <CardHeader>
            <CardTitle>Homologação de Qualidade</CardTitle>
            <CardDescription>Certificação e validade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Status Atual</p>
                {getStatusBadge(homologacao.status)}
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium">Data de Homologação</p>
                <p className="text-sm text-muted-foreground">{homologacao.dataHomologacao}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium">Data de Vencimento</p>
                <p className="text-sm text-muted-foreground">{homologacao.dataVencimento}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium">Validade</p>
                <p className="text-sm text-green-600 font-medium">Válido por mais 16 meses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Compras */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Compras</CardTitle>
          <CardDescription>Valores comprados nos últimos 12 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={purchaseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))
                }
              />
              <Legend />
              <Bar dataKey="valor" fill="hsl(var(--primary))" name="Valor Comprado (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Catálogo de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Produtos</CardTitle>
          <CardDescription>Itens fornecidos por {supplier.name}</CardDescription>
        </CardHeader>
        <CardContent>
          {items && items.length > 0 ? (
            <div className="rounded-md border">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="p-3 text-left text-sm font-medium">Código</th>
                    <th className="p-3 text-left text-sm font-medium">Item</th>
                    <th className="p-3 text-right text-sm font-medium">Preço Unitário</th>
                    <th className="p-3 text-right text-sm font-medium">Qtd. Mínima</th>
                    <th className="p-3 text-right text-sm font-medium">Lead Time</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, index: number) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 text-sm">{item.rawMaterial?.code}</td>
                      <td className="p-3 text-sm font-medium">{item.rawMaterial?.name}</td>
                      <td className="p-3 text-sm text-right">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                          item.unitPrice || 0,
                        )}
                      </td>
                      <td className="p-3 text-sm text-right">{item.minOrderQty || "-"}</td>
                      <td className="p-3 text-sm text-right">{item.leadTimeDays || "-"} dias</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Nenhum item cadastrado para este fornecedor</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
