"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Send, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

type Product = {
  id: number
  identificacao: string
  descricao: string
  unidade_medida: string
}

type Supplier = {
  id: string
  cnomefantasia: string
  crazaosocial: string
}

type OrderItem = {
  tempId: string
  produto_id: number | null
  produto_identificacao: string
  produto_descricao: string
  quantidade: number
  unidade_medida: string
  valor_unitario: number
  valor_total: number
}

export default function NovoPedidoCompraPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quotationId = searchParams.get("quotation_id")

  const [loading, setLoading] = useState(false)
  const [produtos, setProdutos] = useState<Product[]>([])
  const [fornecedores, setFornecedores] = useState<Supplier[]>([])

  const [fornecedorId, setFornecedorId] = useState("")
  const [dataEntregaPrevista, setDataEntregaPrevista] = useState("")
  const [condicaoPagamento, setCondicaoPagamento] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [items, setItems] = useState<OrderItem[]>([
    {
      tempId: crypto.randomUUID(),
      produto_id: null,
      produto_identificacao: "",
      produto_descricao: "",
      quantidade: 0,
      unidade_medida: "UN",
      valor_unitario: 0,
      valor_total: 0,
    },
  ])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (quotationId) {
      loadQuotation(quotationId)
    }
  }, [quotationId])

  const fetchData = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    try {
      const [produtosResult, fornecedoresResult] = await Promise.all([
        supabase.from("produtos").select("id, identificacao, descricao, unidade_medida").order("descricao"),
        supabase.from("fornecedores").select("id, cnomefantasia, crazaosocial").order("cnomefantasia"),
      ])

      if (produtosResult.error) throw produtosResult.error
      if (fornecedoresResult.error) throw fornecedoresResult.error

      setProdutos(produtosResult.data || [])
      setFornecedores(fornecedoresResult.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const loadQuotation = async (id: string) => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    try {
      const { data: quotation, error: quotationError } = await supabase
        .from("beeoz_prod_quotations")
        .select("*")
        .eq("id", id)
        .single()

      if (quotationError) throw quotationError

      setFornecedorId(quotation.fornecedor_id)
      setCondicaoPagamento(quotation.condicao_pagamento || "")

      const prazoEntrega = new Date()
      prazoEntrega.setDate(prazoEntrega.getDate() + quotation.prazo_entrega_dias)
      setDataEntregaPrevista(prazoEntrega.toISOString().split("T")[0])

      const { data: quotationItems, error: itemsError } = await supabase
        .from("beeoz_prod_quotation_items")
        .select("*, produtos(identificacao, descricao, unidade_medida)")
        .eq("quotation_id", id)

      if (itemsError) throw itemsError

      const loadedItems: OrderItem[] = (quotationItems || []).map((item: any) => ({
        tempId: crypto.randomUUID(),
        produto_id: item.produto_id,
        produto_identificacao: item.produtos?.identificacao || `PROD-${item.produto_id}`,
        produto_descricao: item.produtos?.descricao || "Produto desconhecido",
        quantidade: item.quantidade_cotada,
        unidade_medida: item.produtos?.unidade_medida || "UN",
        valor_unitario: item.valor_unitario,
        valor_total: item.valor_total,
      }))

      setItems(loadedItems)
    } catch (error) {
      console.error("Error loading quotation:", error)
    }
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        tempId: crypto.randomUUID(),
        produto_id: null,
        produto_identificacao: "",
        produto_descricao: "",
        quantidade: 0,
        unidade_medida: "UN",
        valor_unitario: 0,
        valor_total: 0,
      },
    ])
  }

  const removeItem = (tempId: string) => {
    setItems(items.filter((item) => item.tempId !== tempId))
  }

  const updateItem = (tempId: string, field: keyof OrderItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.tempId === tempId) {
          let updatedItem = { ...item, [field]: value }

          if (field === "produto_id" && value) {
            const produto = produtos.find((p) => p.id === Number.parseInt(value))
            if (produto) {
              updatedItem = {
                ...updatedItem,
                produto_id: produto.id,
                produto_identificacao: produto.identificacao,
                produto_descricao: produto.descricao,
                unidade_medida: produto.unidade_medida,
              }
            }
          }

          if (field === "quantidade" || field === "valor_unitario") {
            const quantidade = field === "quantidade" ? Number.parseFloat(value) : item.quantidade
            const valorUnitario = field === "valor_unitario" ? Number.parseFloat(value) : item.valor_unitario
            updatedItem.valor_total = quantidade * valorUnitario
          }

          return updatedItem
        }
        return item
      }),
    )
  }

  const handleSave = async (sendToSupplier: boolean) => {
    if (!fornecedorId) {
      alert("Por favor, selecione um fornecedor")
      return
    }

    if (items.length === 0 || items.some((item) => !item.produto_id)) {
      alert("Por favor, adicione pelo menos um item válido")
      return
    }

    if (!dataEntregaPrevista) {
      alert("Por favor, defina a data de entrega prevista")
      return
    }

    setLoading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    try {
      const valorTotal = items.reduce((sum, item) => sum + item.valor_total, 0)

      const { data: order, error: orderError } = await supabase
        .from("beeoz_prod_purchase_orders")
        .insert({
          fornecedor_id: fornecedorId,
          quotation_id: quotationId || null,
          data_entrega_prevista: dataEntregaPrevista,
          valor_total: valorTotal,
          status: sendToSupplier ? "enviado" : "rascunho",
          condicao_pagamento: condicaoPagamento,
          observacoes: observacoes,
        })
        .select()
        .single()

      if (orderError) throw orderError

      const itemsToInsert = items.map((item) => ({
        purchase_order_id: order.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        unidade_medida: item.unidade_medida,
        valor_unitario: item.valor_unitario,
        valor_total: item.valor_total,
      }))

      const { error: itemsError } = await supabase.from("beeoz_prod_purchase_order_items").insert(itemsToInsert)

      if (itemsError) throw itemsError

      if (quotationId) {
        await supabase
          .from("beeoz_prod_quotation_requests")
          .update({ status: "convertida" })
          .eq(
            "id",
            supabase
              .from("beeoz_prod_quotations")
              .select("quotation_request_id")
              .eq("id", quotationId)
              .single()
              .then((res) => res.data?.quotation_request_id),
          )
      }

      router.push(`/pedidos-compra/${order.id}`)
    } catch (error) {
      console.error("Error creating purchase order:", error)
      alert("Erro ao criar pedido de compra")
    } finally {
      setLoading(false)
    }
  }

  const valorTotal = items.reduce((sum, item) => sum + item.valor_total, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/pedidos-compra">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Novo Pedido de Compra</h1>
            <p className="text-muted-foreground mt-1">Crie um novo pedido de compra</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button onClick={() => handleSave(true)} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            Enviar ao Fornecedor
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Pedido</CardTitle>
              <CardDescription>Dados básicos do pedido de compra</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fornecedor">Fornecedor *</Label>
                <Select value={fornecedorId} onValueChange={setFornecedorId} disabled={!!quotationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores.map((fornecedor) => (
                      <SelectItem key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.cnomefantasia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataEntrega">Data de Entrega Prevista *</Label>
                <Input
                  id="dataEntrega"
                  type="date"
                  value={dataEntregaPrevista}
                  onChange={(e) => setDataEntregaPrevista(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condicaoPagamento">Condição de Pagamento</Label>
                <Input
                  id="condicaoPagamento"
                  placeholder="Ex: 30/60 dias"
                  value={condicaoPagamento}
                  onChange={(e) => setCondicaoPagamento(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Informações adicionais..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Itens do Pedido</CardTitle>
                  <CardDescription>Produtos e quantidades</CardDescription>
                </div>
                {!quotationId && (
                  <Button size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.tempId} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Item {index + 1}</Badge>
                    {!quotationId && items.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.tempId)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Produto *</Label>
                      <Select
                        value={item.produto_id?.toString() || ""}
                        onValueChange={(value) => updateItem(item.tempId, "produto_id", value)}
                        disabled={!!quotationId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {produtos.map((produto) => (
                            <SelectItem key={produto.id} value={produto.id.toString()}>
                              {produto.identificacao} - {produto.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quantidade *</Label>
                      <Input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => updateItem(item.tempId, "quantidade", e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unidade</Label>
                      <Input value={item.unidade_medida} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label>Valor Unitário *</Label>
                      <Input
                        type="number"
                        value={item.valor_unitario}
                        onChange={(e) => updateItem(item.tempId, "valor_unitario", e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="R$ 0,00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Valor Total</Label>
                      <Input value={`R$ ${item.valor_total.toFixed(2)}`} disabled />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">Total de Itens</span>
                <span className="font-semibold">{items.length}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">Quantidade Total</span>
                <span className="font-semibold">
                  {items.reduce((sum, item) => sum + item.quantidade, 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold">Valor Total</span>
                <span className="text-2xl font-bold text-green-600">R$ {valorTotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {quotationId && (
            <Card>
              <CardHeader>
                <CardTitle>Origem</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">Criado a partir de Cotação</Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Este pedido foi gerado automaticamente a partir de uma cotação aprovada
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
