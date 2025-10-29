"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ProductFormDialog } from "@/components/product-form-dialog"
import { Package, Plus, Search, MoreVertical, Edit, Trash2, Power, PowerOff, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function GerenciarProdutosPage() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [filteredProdutos, setFilteredProdutos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const { toast } = useToast()

  const supabase = createClient()

  useEffect(() => {
    loadProdutos()
  }, [])

  useEffect(() => {
    const filtered = produtos.filter(
      (p) =>
        p.identificacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProdutos(filtered)
  }, [searchTerm, produtos])

  async function loadProdutos() {
    try {
      console.log("[v0] Loading products...")
      const { data, error } = await supabase.from("produtos").select("*").order("identificacao")

      if (error) throw error

      console.log("[v0] Products loaded:", data?.length)
      setProdutos(data || [])
      setFilteredProdutos(data || [])
    } catch (error) {
      console.error("[v0] Error loading products:", error)
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar a lista de produtos.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProduct(productData: any) {
    try {
      console.log("[v0] Saving product:", productData)

      if (selectedProduct) {
        // Update existing product
        const { error } = await supabase.from("produtos").update(productData).eq("id", selectedProduct.id)

        if (error) throw error

        toast({
          title: "Produto atualizado",
          description: "As alterações foram salvas com sucesso.",
        })
      } else {
        // Create new product
        // Check if code already exists
        const { data: existing } = await supabase
          .from("produtos")
          .select("id")
          .eq("identificacao", productData.identificacao)
          .single()

        if (existing) {
          toast({
            title: "Código duplicado",
            description: "Já existe um produto com este código.",
            variant: "destructive",
          })
          return
        }

        const { error } = await supabase.from("produtos").insert([productData])

        if (error) throw error

        toast({
          title: "Produto criado",
          description: "O produto foi cadastrado com sucesso.",
        })
      }

      loadProdutos()
      setDialogOpen(false)
      setSelectedProduct(null)
    } catch (error) {
      console.error("[v0] Error saving product:", error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o produto.",
        variant: "destructive",
      })
    }
  }

  async function handleToggleStatus(product: any) {
    try {
      const { error } = await supabase.from("produtos").update({ ativo: !product.ativo }).eq("id", product.id)

      if (error) throw error

      toast({
        title: product.ativo ? "Produto desativado" : "Produto ativado",
        description: `O produto foi ${product.ativo ? "desativado" : "ativado"} com sucesso.`,
      })

      loadProdutos()
    } catch (error) {
      console.error("[v0] Error toggling status:", error)
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do produto.",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteProduct() {
    if (!productToDelete) return

    try {
      // Check if product has lotes
      const { data: lotes } = await supabase.from("lotes").select("id").eq("produto_id", productToDelete.id).limit(1)

      if (lotes && lotes.length > 0) {
        toast({
          title: "Não é possível excluir",
          description: "Este produto possui lotes cadastrados. Remova os lotes antes de excluir o produto.",
          variant: "destructive",
        })
        setDeleteDialogOpen(false)
        setProductToDelete(null)
        return
      }

      const { error } = await supabase.from("produtos").delete().eq("id", productToDelete.id)

      if (error) throw error

      toast({
        title: "Produto excluído",
        description: "O produto foi removido do sistema.",
      })

      loadProdutos()
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o produto.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const totalProdutos = produtos.length
  const produtosAtivos = produtos.filter((p) => p.ativo !== false).length
  const produtosInativos = produtos.filter((p) => p.ativo === false).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="h-12 w-12 animate-pulse mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>
          <p className="text-muted-foreground">Crie, edite e gerencie o catálogo de produtos</p>
        </div>
        <Button
          onClick={() => {
            setSelectedProduct(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProdutos}</div>
            <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{produtosAtivos}</div>
            <p className="text-xs text-muted-foreground">Disponíveis para uso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Produtos Inativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{produtosInativos}</div>
            <p className="text-xs text-muted-foreground">Desativados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Produtos</CardTitle>
              <CardDescription>Visualize e gerencie todos os produtos cadastrados</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Venda</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProdutos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "Nenhum produto encontrado com este termo de busca." : "Nenhum produto cadastrado."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProdutos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-mono">{produto.identificacao}</TableCell>
                    <TableCell className="max-w-md truncate">{produto.descricao}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{produto.tipo?.split(" - ")[0] || "N/A"}</Badge>
                    </TableCell>
                    <TableCell>{produto.unidade_medida?.split(" - ")[0] || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      {produto.valor_custo ? `R$ ${Number(produto.valor_custo).toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {produto.valor_venda ? `R$ ${Number(produto.valor_venda).toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={produto.ativo !== false ? "default" : "secondary"}>
                        {produto.ativo !== false ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProduct(produto)
                              setDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(produto)}>
                            {produto.ativo !== false ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setProductToDelete(produto)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto <strong>{productToDelete?.descricao}</strong>?
              <br />
              <br />
              Esta ação não pode ser desfeita. Se o produto possuir lotes cadastrados, a exclusão será bloqueada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
              Excluir Produto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
