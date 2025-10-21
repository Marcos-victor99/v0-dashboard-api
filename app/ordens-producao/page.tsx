"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Clock, FileText, CheckCircle2, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase-client"

interface Product {
  id: number
  code: string
  name: string
}

interface ProductionOrder {
  id: number
  order_number: string
  product_id: number
  quantity: number
  status: string
  priority: string
  created_at: string
  beeoz_prod_products?: Product
}

export default function OrdensProducao() {
  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("beeoz_prod_production_orders")
        .select(`
          *,
          beeoz_prod_products (
            id,
            code,
            name
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching production orders:", error)
        return
      }

      console.log("[v0] Fetched production orders:", data)
      setOrders(data || [])
    } catch (error) {
      console.error("[v0] Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: orders.length,
    pendentes: orders.filter((o) => o.status === "Pendente").length,
    emProducao: orders.filter((o) => o.status === "Em Produção").length,
    concluidas: orders.filter((o) => o.status === "Concluída").length,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando ordens de produção...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Ordens de Produção</h1>
          <p className="text-muted-foreground">Gestão e acompanhamento de ordens de produção</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <span className="mr-2">+</span>
          Nova Ordem
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total de Ordens</CardTitle>
            <Package className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendentes}</div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Em Produção</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.emProducao}</div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Concluídas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.concluidas}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Ordens de Produção</CardTitle>
          <CardDescription>Lista de todas as ordens de produção</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma ordem de produção encontrada</div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="border-l-4 border-primary bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">Ordem #{order.order_number}</h3>
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{order.status}</Badge>
                      <Badge variant="outline" className="text-gray-600">
                        {order.priority}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="h-4 w-4" />
                      <span className="font-medium">Produto:</span>
                      <span>{order.beeoz_prod_products?.code || order.product_id}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Quantidade:</span>
                      <span>{order.quantity} unidades</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Criada em:</span>
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
