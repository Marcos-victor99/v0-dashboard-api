"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Clock, Factory, CheckCircle2, Calendar, Box } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface ProductionOrder {
  id: number
  order_number: string
  product_id: number
  quantity: number
  status: string
  priority: string
  notes: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
  product?: {
    name: string
    code: string
  }
}

export default function OrdensProducao() {
  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const { data, error } = await supabase
        .from("beeoz_prod_production_orders")
        .select(
          `
          *,
          product:beeoz_prod_products(name, code)
        `,
        )
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching production orders:", error)
      } else {
        setOrders(data || [])
      }
      setLoading(false)
    }

    fetchOrders()
  }, [])

  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const inProgressOrders = orders.filter((o) => o.status === "in_progress").length
  const completedOrders = orders.filter((o) => o.status === "completed").length

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "warning" | "default" | "success" }> = {
      pending: { label: "Pendente", variant: "warning" },
      in_progress: { label: "Em Produção", variant: "default" },
      completed: { label: "Concluída", variant: "success" },
    }

    const config = statusConfig[status] || statusConfig.pending

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    return <Badge variant="secondary">{priority === "high" ? "Alta" : priority === "low" ? "Baixa" : "Normal"}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Ordens de Produção</h1>
          <p className="text-muted-foreground">Gestão e acompanhamento de ordens de produção</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nova Ordem
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Ordens</CardTitle>
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Produção</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Factory className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Ordens de Produção</h2>
          <p className="text-sm text-muted-foreground">Lista de todas as ordens de produção</p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Carregando ordens...</p>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Nenhuma ordem de produção encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="border-l-4 border-l-green-500">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Ordem #{order.order_number}</h3>
                        {getStatusBadge(order.status)}
                        {getPriorityBadge(order.priority)}
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Box className="h-4 w-4" />
                          <span>
                            Produto: {order.product?.name || "N/A"} ({order.product?.code || "N/A"})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span>Quantidade: {order.quantity} unidades</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Criada em: {formatDate(order.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
