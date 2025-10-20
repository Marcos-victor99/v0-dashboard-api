import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Package, AlertCircle } from "lucide-react"

interface Batch {
  id: string
  batchNumber: string
  quantity: number
  productionDate: Date
  expiryDate: Date
  balance: number
  unit: string
}

interface ProductBatchesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  productCode: string
  batches: Batch[]
}

export function ProductBatchesDialog({
  open,
  onOpenChange,
  productName,
  productCode,
  batches,
}: ProductBatchesDialogProps) {
  const getBatchStatus = (expiryDate: Date) => {
    const today = new Date()
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) {
      return { label: "Vencido", variant: "destructive" as const }
    } else if (daysUntilExpiry <= 30) {
      return { label: "Vence em breve", variant: "outline" as const }
    } else {
      return { label: "Válido", variant: "default" as const }
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Lotes - {productName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{productCode}</p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {batches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum lote cadastrado para este produto</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {batches.map((batch) => {
                const status = getBatchStatus(batch.expiryDate)
                const daysUntilExpiry = Math.floor(
                  (batch.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                )

                return (
                  <div key={batch.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">Lote: {batch.batchNumber}</h3>
                        <Badge variant={status.variant} className="mt-1">
                          {status.label}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Saldo</p>
                        <p className="text-2xl font-bold text-primary">
                          {batch.balance} {batch.unit}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Quantidade Produzida</p>
                        <p className="font-semibold">
                          {batch.quantity} {batch.unit}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Data de Produção
                        </p>
                        <p className="font-semibold">{formatDate(batch.productionDate)}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Data de Validade
                        </p>
                        <p className="font-semibold">{formatDate(batch.expiryDate)}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1">Dias até Vencimento</p>
                        <p
                          className={`font-semibold ${
                            daysUntilExpiry < 0
                              ? "text-red-600"
                              : daysUntilExpiry <= 30
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {daysUntilExpiry < 0 ? "Vencido" : `${daysUntilExpiry} dias`}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
