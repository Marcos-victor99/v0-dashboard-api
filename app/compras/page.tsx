"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, DollarSign, ShoppingCart, Clock, CheckCircle2, Send } from "lucide-react"

export default function Compras() {
  const [activeTab, setActiveTab] = useState("requisitions")

  const requisitions: any[] = []
  const quotations: any[] = []
  const orders: any[] = []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Gestão de Compras</h1>
        <p className="text-muted-foreground">Requisições, cotações e pedidos de compra</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="requisitions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Requisições
          </TabsTrigger>
          <TabsTrigger value="quotations" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cotações
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Pedidos
          </TabsTrigger>
        </TabsList>

        {/* Requisitions Tab */}
        <TabsContent value="requisitions" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Requisições de Compra</CardTitle>
              <CardDescription>Lista de todas as requisições</CardDescription>
            </CardHeader>
            <CardContent>
              {requisitions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Nenhuma requisição</h3>
                  <p className="text-sm text-muted-foreground">As requisições aparecerão aqui quando criadas</p>
                </div>
              ) : (
                <div className="space-y-4">{/* Requisitions will be listed here */}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quotations Tab */}
        <TabsContent value="quotations" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Send className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cotações</CardTitle>
              <CardDescription>Lista de todas as cotações</CardDescription>
            </CardHeader>
            <CardContent>
              {quotations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <DollarSign className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Nenhuma cotação</h3>
                  <p className="text-sm text-muted-foreground">As cotações aparecerão aqui quando criadas</p>
                </div>
              ) : (
                <div className="space-y-4">{/* Quotations will be listed here */}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Recebidos</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pedidos de Compra</CardTitle>
              <CardDescription>Lista de todos os pedidos</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <ShoppingCart className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Nenhum pedido</h3>
                  <p className="text-sm text-muted-foreground">Os pedidos aparecerão aqui quando criados</p>
                </div>
              ) : (
                <div className="space-y-4">{/* Orders will be listed here */}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
