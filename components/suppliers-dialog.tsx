"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { trpc } from "../lib/trpc"
import { useLocation } from "wouter"
import { Users, Calendar, Package, Phone, Mail, MapPin, TrendingUp, Award } from "lucide-react"

interface SuppliersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rawMaterialId: number
  rawMaterialName: string
  rawMaterialUnit: string
}

export function SuppliersDialog({
  open,
  onOpenChange,
  rawMaterialId,
  rawMaterialName,
  rawMaterialUnit,
}: SuppliersDialogProps) {
  const [, navigate] = useLocation()

  const { data: suppliers, isLoading } = trpc.suppliers.byRawMaterial.useQuery(
    { rawMaterialId },
    { enabled: open && !!rawMaterialId },
  )

  const handleSupplierClick = (supplierId: number) => {
    onOpenChange(false)
    navigate(`/fornecedor-detalhes?id=${supplierId}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Users className="h-6 w-6" />
            Fornecedores Disponíveis
          </DialogTitle>
          <p className="text-muted-foreground">
            Fornecedores que oferecem: <span className="font-semibold">{rawMaterialName}</span>
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando fornecedores...</p>
              </div>
            </div>
          )}

          {!isLoading && (!suppliers || suppliers.length === 0) && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum Fornecedor Encontrado</h3>
              <p className="text-muted-foreground mb-4">Não há fornecedores cadastrados para este item.</p>
              <Button onClick={() => navigate("/fornecedores")}>Cadastrar Fornecedor</Button>
            </div>
          )}

          {suppliers && suppliers.length > 0 && (
            <>
              <div className="grid gap-4">
                {suppliers.map((supplierItem: any) => {
                  const supplier = supplierItem.supplier
                  if (!supplier) return null

                  return (
                    <div
                      key={supplierItem.id}
                      className="border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => handleSupplierClick(supplierItem.supplierId)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">{supplier.name}</h3>
                            {supplier.qualityStatus === "approved" && (
                              <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                                <Award className="h-3 w-3 mr-1" />
                                Homologado
                              </Badge>
                            )}
                          </div>
                          {supplier.contactPerson && (
                            <p className="text-sm text-muted-foreground">Contato: {supplier.contactPerson}</p>
                          )}
                        </div>

                        {supplierItem.unitPrice && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">R$ {supplierItem.unitPrice.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">por {rawMaterialUnit}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        {supplierItem.minOrderQty && (
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Qtd. Mínima</p>
                              <p className="text-sm font-medium">
                                {supplierItem.minOrderQty} {rawMaterialUnit}
                              </p>
                            </div>
                          </div>
                        )}

                        {supplierItem.leadTimeDays && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Lead Time</p>
                              <p className="text-sm font-medium">{supplierItem.leadTimeDays} dias</p>
                            </div>
                          </div>
                        )}

                        {supplier.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Telefone</p>
                              <p className="text-sm font-medium">{supplier.phone}</p>
                            </div>
                          </div>
                        )}

                        {supplier.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Email</p>
                              <p className="text-sm font-medium truncate max-w-[150px]">{supplier.email}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {supplier.address && (
                        <div className="flex items-start gap-2 pt-3 border-t">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm text-muted-foreground">{supplier.address}</p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSupplierClick(supplierItem.supplierId)
                          }}
                        >
                          Ver Detalhes Completos
                        </Button>
                        {supplier.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`tel:${supplier.phone}`, "_self")
                            }}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                        {supplier.email && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`mailto:${supplier.email}`, "_blank")
                            }}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Comparação de Preços */}
              {suppliers.length > 1 && (
                <div className="mt-6 p-4 bg-accent rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Comparação de Preços
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Menor Preço</p>
                      <p className="text-lg font-bold text-green-600">
                        {(() => {
                          const sorted = suppliers
                            .filter((s: any) => s.unitPrice)
                            .sort((a: any, b: any) => a.unitPrice - b.unitPrice)
                          return sorted[0] ? `R$ ${sorted[0].unitPrice?.toFixed(2) || "0.00"}` : "-"
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Preço Médio</p>
                      <p className="text-lg font-bold">
                        {suppliers.filter((s: any) => s.unitPrice).length > 0
                          ? `R$ ${(
                              suppliers
                                .filter((s: any) => s.unitPrice)
                                .reduce((acc: number, s: any) => acc + s.unitPrice, 0) /
                                suppliers.filter((s: any) => s.unitPrice).length
                            ).toFixed(2)}`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Maior Preço</p>
                      <p className="text-lg font-bold text-red-600">
                        {(() => {
                          const sorted = suppliers
                            .filter((s: any) => s.unitPrice)
                            .sort((a: any, b: any) => b.unitPrice - a.unitPrice)
                          return sorted[0] ? `R$ ${sorted[0].unitPrice?.toFixed(2) || "0.00"}` : "-"
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              navigate("/fornecedores")
            }}
          >
            Ver Todos os Fornecedores
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
