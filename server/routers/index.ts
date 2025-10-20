import { initTRPC } from "@trpc/server"
import { z } from "zod"

const t = initTRPC.create()

const publicProcedure = t.procedure
const router = t.router

// Mock data for development
const mockSuppliers = [
  {
    id: 1,
    supplierId: 1,
    unitPrice: 145.0,
    minOrderQty: 10,
    leadTimeDays: 15,
    supplier: {
      id: 1,
      name: "Apiário Silva",
      contactPerson: "João Silva",
      phone: "(11) 91234-5678",
      email: "joao@apiariossilva.com.br",
      address: "Rua das Flores, 123 - São Paulo, SP",
      qualityStatus: "approved" as const,
    },
  },
  {
    id: 2,
    supplierId: 2,
    unitPrice: 155.0,
    minOrderQty: 5,
    leadTimeDays: 10,
    supplier: {
      id: 2,
      name: "Mel & Cia",
      contactPerson: "Maria Santos",
      phone: "(11) 98765-4321",
      email: "maria@melecia.com.br",
      address: "Av. Paulista, 456 - São Paulo, SP",
      qualityStatus: "approved" as const,
    },
  },
]

const mockProducts = [
  { id: 1, name: "Propolift Extrato Verde", code: "PRD00201" },
  { id: 2, name: "Propolift Spray Verde", code: "PRD00203" },
  { id: 3, name: "Mel Orgânico 500g", code: "PRD00101" },
]

export const appRouter = router({
  suppliers: router({
    byRawMaterial: publicProcedure.input(z.object({ rawMaterialId: z.number() })).query(({ input }) => {
      // Return mock suppliers for any raw material
      return mockSuppliers
    }),
  }),
  products: router({
    list: publicProcedure.query(() => {
      return mockProducts
    }),
  }),
  simulator: router({
    calculateMrp: publicProcedure
      .input(
        z.object({
          productionPlans: z.array(
            z.object({
              productId: z.number(),
              quantity: z.number(),
            }),
          ),
        }),
      )
      .mutation(({ input }) => {
        // Mock MRP calculation
        return {
          requirements: [
            {
              code: "MP001",
              name: "Própolis Verde",
              required: 50,
              stock: 2,
              purchase: 48,
              unitCost: 150,
              totalCost: 7200,
            },
            {
              code: "MP002",
              name: "Álcool 70%",
              required: 30,
              stock: 15,
              purchase: 15,
              unitCost: 25,
              totalCost: 375,
            },
          ],
          totalCost: 7575,
        }
      }),
  }),
})

export type AppRouter = typeof appRouter
