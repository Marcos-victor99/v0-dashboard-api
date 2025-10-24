"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Search, Plus, Clock, AlertCircle, TrendingUp } from "lucide-react"
import Link from "next/link"

type PurchaseOrder = {
  id: string
  order_number: string
  supplier_id: string
  supplier_name: string
  quotation_id: string | null
  quotation_number: string | null
  order_date: string
  expected_delivery_date: string
  total_cost: number
  status: string
  payment_terms: string | null
  total_items: number
  notes: string | null
}

export default function PedidosCompraPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchPurchaseOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter])

  const fetchPurchaseOrders = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("beeoz_prod_purchase_orders")
        .select("*")
        .limit(10000)
        .order("order_date", { ascending: false })

      if (ordersError) throw ordersError

      const supplierIds = [...new Set(ordersData?.map((o) => o.supplier_id) || [])]
      const quotationIds = ordersData?.filter((o) => o.quotation_id).map((o) => o.quotation_id) || []

      const [suppliersResult, quotationsResult, itemsResult] = await Promise.all([
        supabase.from("fornecedores").select("id, cnomefantasia").in("id", supplierIds).limit(10000),
        quotationIds.length > 0
          ? supabase
              .from("beeoz_prod_quotations")
              .select("id, quotation_request_id, beeoz_prod_quotation_requests(numero_cotacao)")
              .in("id", quotationIds)
              .limit(10000)
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from("beeoz_prod_purchase_order_items")
          .select("order_id")
          .in("order_id", ordersData?.map((o) => o.id) || [])
          .limit(10000),
      ])

      if (suppliersResult.error) throw suppliersResult.error
      if (quotationsResult.error) throw quotationsResult.error
      if (itemsResult.error) throw itemsResult.error

      const enrichedOrders: PurchaseOrder[] = (ordersData || []).map((order) => {
        const supplier = suppliersResult.data?.find((f) => f.id === order.supplier_id)
        const quotation = quotationsResult.data?.find((q: any) => q.id === order.quotation_id)
        const totalItems = itemsResult.data?.filter((i) => i.order_id === order.id).length || 0

        return {
          id: order.id,
          order_number: order.order_number,
          supplier_id: order.supplier_id,
          supplier_name: supplier?.cnomefantasia || "Fornecedor desconhecido",
          quotation_id: order.quotation_id,
          quotation_number: (quotation as any)?.beeoz_prod_quotation_requests?.numero_cotacao || null,
          order_date: order.order_date,
          expected_delivery_date: order.expected_delivery_date,
          total_cost: order.total_cost,
          status: order.status,
          payment_terms: null, // payment_terms not in schema, using null
          total_items: totalItems,
          notes: order.notes,
        }
      })

      setOrders(enrichedOrders)
    } catch (error) {
      console.error("Error fetching purchase orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (o) =>
          o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (o.quotation_number && o.quotation_number.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    setFilteredOrders(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      rascunho: { label: "Rascunho", variant: "outline" },
      enviado: { label: "Enviado", variant: "default" },
      confirmado: { label: "Confirmado", variant: "secondary" },
      em_transito: { label: "Em Trânsito", variant: "default" },
      recebido: { label: "Recebido", variant: "default" },
      cancelado: { label: "Cancelado", variant: "destructive" },
    }
    const config = statusMap[status] || { label: status, variant: "outline" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const stats = {
    total: orders.length,
    enviados: orders.filter((o) => o.status === "enviado").length,
    confirmados: orders.filter((o) => o.status === "confirmado").length,
    recebidos: orders.filter((o) => o.status === "recebido").length,
    valor_total: orders.reduce((sum, o) => sum + o.total_cost, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pedidos de Compra</h1>
          <p className="text-muted-foreground mt-1">Gerencie pedidos de compra e acompanhe entregas</p>
        </div>
        <Link href="/pedidos-compra/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Pedido
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Todos os pedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Enviados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.enviados}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando confirmação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Confirmados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.confirmados}</div>
            <p className="text-xs text-muted-foreground mt-1">Em processamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {stats.valor_total.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground mt-1">Soma de todos os pedidos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Pedidos</CardTitle>
              <CardDescription>Visualize e gerencie todos os pedidos de compra</CardDescription>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, fornecedor ou cotação..."
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
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="em_transito">Em Trânsito</SelectItem>
                <SelectItem value="recebido">Recebido</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pedido encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Data Pedido</TableHead>
                  <TableHead>Entrega Prevista</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link href={`/pedidos-compra/${order.id}`} className="font-medium text-blue-600 hover:underline">
                        {order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{order.supplier_name}</p>
                    </TableCell>
                    <TableCell>
                      {order.quotation_number ? (
                        <div>
                          <Badge variant="outline">Cotação</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{order.quotation_number}</p>
                        </div>
                      ) : (
                        <Badge variant="secondary">Manual</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(order.order_date).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{new Date(order.expected_delivery_date).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <span className="font-semibold">{order.total_items}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">R$ {order.total_cost.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/pedidos-compra/${order.id}`}>
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
