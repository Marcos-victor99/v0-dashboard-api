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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, ArrowLeft, Save, Send } from "lucide-react"
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

type QuotationItem = {
  tempId: string
  produto_id: number | null
  produto_identificacao: string
  produto_descricao: string
  quantidade_solicitada: number
  unidade_medida: string
  preco_referencia: number
  especificacao_tecnica: string
  aceita_similar: boolean
  material_requirement_id: number | null
}

export default function NovaCotacaoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mrId = searchParams.get("mr_id")

  const [loading, setLoading] = useState(false)
  const [produtos, setProdutos] = useState<Product[]>([])
  const [fornecedores, setFornecedores] = useState<Supplier[]>([])
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])

  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [dataLimite, setDataLimite] = useState("")
  const [items, setItems] = useState<QuotationItem[]>([
    {
      tempId: crypto.randomUUID(),
      produto_id: null,
      produto_identificacao: "",
      produto_descricao: "",
      quantidade_solicitada: 0,
      unidade_medida: "UN",
      preco_referencia: 0,
      especificacao_tecnica: "",
      aceita_similar: false,
      material_requirement_id: null,
    },
  ])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (mrId) {
      loadMaterialRequirement(Number.parseInt(mrId))
    }
  }, [mrId])

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

  const loadMaterialRequirement = async (id: number) => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    try {
      const { data: mr, error } = await supabase
        .from("beeoz_prod_material_requirements")
        .select("*, produtos(identificacao, descricao, unidade_medida)")
        .eq("id", id)
        .single()

      if (error) throw error

      if (mr) {
        setTitulo(`Material para Necessidade #${id}`)
        setItems([
          {
            tempId: crypto.randomUUID(),
            produto_id: mr.produto_id,
            produto_identificacao: mr.produtos?.identificacao || "",
            produto_descricao: mr.produtos?.descricao || "",
            quantidade_solicitada: mr.quantidade_necessaria,
            unidade_medida: mr.unidade_medida || mr.produtos?.unidade_medida || "UN",
            preco_referencia: 0,
            especificacao_tecnica: "",
            aceita_similar: false,
            material_requirement_id: id,
          },
        ])
      }
    } catch (error) {
      console.error("Error loading material requirement:", error)
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
        quantidade_solicitada: 0,
        unidade_medida: "UN",
        preco_referencia: 0,
        especificacao_tecnica: "",
        aceita_similar: false,
        material_requirement_id: null,
      },
    ])
  }

  const removeItem = (tempId: string) => {
    setItems(items.filter((item) => item.tempId !== tempId))
  }

  const updateItem = (tempId: string, field: keyof QuotationItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.tempId === tempId) {
          if (field === "produto_id" && value) {
            const produto = produtos.find((p) => p.id === Number.parseInt(value))
            if (produto) {
              return {
                ...item,
                produto_id: produto.id,
                produto_identificacao: produto.identificacao,
                produto_descricao: produto.descricao,
                unidade_medida: produto.unidade_medida,
              }
            }
          }
          return { ...item, [field]: value }
        }
        return item
      }),
    )
  }

  const toggleSupplier = (supplierId: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(supplierId) ? prev.filter((id) => id !== supplierId) : [...prev, supplierId],
    )
  }

  const handleSave = async (sendToSuppliers: boolean) => {
    if (!titulo.trim()) {
      alert("Por favor, preencha o título da cotação")
      return
    }

    if (items.length === 0 || items.some((item) => !item.produto_id)) {
      alert("Por favor, adicione pelo menos um item válido")
      return
    }

    if (sendToSuppliers && selectedSuppliers.length === 0) {
      alert("Por favor, selecione pelo menos um fornecedor")
      return
    }

    if (!dataLimite) {
      alert("Por favor, defina a data limite de resposta")
      return
    }

    setLoading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    try {
      const { data: request, error: requestError } = await supabase
        .from("beeoz_prod_quotation_requests")
        .insert({
          titulo,
          descricao,
          origem: mrId ? "mrp" : "manual",
          origem_referencia_id: mrId ? Number.parseInt(mrId) : null,
          data_limite_resposta: dataLimite,
          status: sendToSuppliers ? "enviada" : "rascunho",
          criterio_preco_peso: 0.6,
          criterio_prazo_peso: 0.25,
          criterio_qualidade_peso: 0.15,
        })
        .select()
        .single()

      if (requestError) throw requestError

      const itemsToInsert = items.map((item) => ({
        quotation_request_id: request.id,
        produto_id: item.produto_id,
        quantidade_solicitada: item.quantidade_solicitada,
        unidade_medida: item.unidade_medida,
        preco_referencia: item.preco_referencia,
        especificacao_tecnica: item.especificacao_tecnica,
        aceita_similar: item.aceita_similar,
        material_requirement_id: item.material_requirement_id,
      }))

      const { error: itemsError } = await supabase.from("beeoz_prod_quotation_request_items").insert(itemsToInsert)

      if (itemsError) throw itemsError

      if (selectedSuppliers.length > 0) {
        const suppliersToInsert = selectedSuppliers.map((supplierId) => ({
          quotation_request_id: request.id,
          fornecedor_id: supplierId,
          data_convite: new Date().toISOString(),
        }))

        const { error: suppliersError } = await supabase
          .from("beeoz_prod_quotation_request_suppliers")
          .insert(suppliersToInsert)

        if (suppliersError) throw suppliersError
      }

      router.push(`/cotacoes/${request.id}`)
    } catch (error) {
      console.error("Error creating quotation request:", error)
      alert("Erro ao criar solicitação de cotação")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/cotacoes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Nova Solicitação de Cotação</h1>
            <p className="text-muted-foreground mt-1">Crie uma nova RFQ e convide fornecedores</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button onClick={() => handleSave(true)} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            Enviar aos Fornecedores
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
              <CardDescription>Dados básicos da solicitação de cotação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Material para Ordem de Produção OP-128"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Detalhes adicionais sobre a cotação..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataLimite">Data Limite de Resposta *</Label>
                <Input
                  id="dataLimite"
                  type="datetime-local"
                  value={dataLimite}
                  onChange={(e) => setDataLimite(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Itens da Cotação</CardTitle>
                  <CardDescription>Produtos e quantidades solicitadas</CardDescription>
                </div>
                <Button size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.tempId} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Item {index + 1}</Badge>
                    {items.length > 1 && (
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
                        value={item.quantidade_solicitada}
                        onChange={(e) =>
                          updateItem(item.tempId, "quantidade_solicitada", Number.parseFloat(e.target.value))
                        }
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unidade</Label>
                      <Input value={item.unidade_medida} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label>Preço de Referência</Label>
                      <Input
                        type="number"
                        value={item.preco_referencia}
                        onChange={(e) => updateItem(item.tempId, "preco_referencia", Number.parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                        placeholder="R$ 0,00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Especificação Técnica</Label>
                      <Input
                        value={item.especificacao_tecnica}
                        onChange={(e) => updateItem(item.tempId, "especificacao_tecnica", e.target.value)}
                        placeholder="Ex: Pureza mínima 99%"
                      />
                    </div>

                    <div className="flex items-center space-x-2 md:col-span-2">
                      <Checkbox
                        id={`aceita-similar-${item.tempId}`}
                        checked={item.aceita_similar}
                        onCheckedChange={(checked) => updateItem(item.tempId, "aceita_similar", checked)}
                      />
                      <Label htmlFor={`aceita-similar-${item.tempId}`} className="cursor-pointer">
                        Aceita produto similar
                      </Label>
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
              <CardTitle>Fornecedores</CardTitle>
              <CardDescription>Selecione os fornecedores que receberão a cotação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {fornecedores.map((fornecedor) => (
                  <div
                    key={fornecedor.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={`supplier-${fornecedor.id}`}
                      checked={selectedSuppliers.includes(fornecedor.id)}
                      onCheckedChange={() => toggleSupplier(fornecedor.id)}
                    />
                    <Label htmlFor={`supplier-${fornecedor.id}`} className="flex-1 cursor-pointer">
                      <p className="font-medium text-sm">{fornecedor.cnomefantasia}</p>
                      <p className="text-xs text-muted-foreground">{fornecedor.crazaosocial}</p>
                    </Label>
                  </div>
                ))}
              </div>
              {selectedSuppliers.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium">{selectedSuppliers.length} fornecedor(es) selecionado(s)</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
