import { initTRPC } from "@trpc/server"
import { z } from "zod"
import { createClient } from "@/utils/supabase/server"

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
    list: publicProcedure
      .input(
        z.object({
          page: z.number().default(1),
          limit: z.number().default(20),
          search: z.string().optional(),
          status: z.enum(["ativo", "inativo", "todos"]).default("ativo"),
          tipo: z.string().optional(),
        }),
      )
      .query(async ({ input }) => {
        const supabase = await createClient()
        const { page, limit, search, status, tipo } = input
        const offset = (page - 1) * limit

        // First, get the produtos with filters
        let query = supabase.from("produtos").select("*", { count: "exact" })

        // Server-side filters
        if (status !== "todos") {
          query = query.eq("status", status)
        }
        if (tipo) {
          query = query.eq("tipo", tipo)
        }
        if (search) {
          query = query.or(`identificacao.ilike.%${search}%,descricao.ilike.%${search}%`)
        }

        // Pagination
        query = query.range(offset, offset + limit - 1).order("identificacao", { ascending: true })

        const { data: produtos, error, count } = await query

        if (error) throw error

        // Then, get all lotes for these produtos
        const produtoIds = produtos?.map((p) => p.id) || []
        const { data: lotes } = await supabase.from("lotes").select("produto_id, saldo").in("produto_id", produtoIds)

        // Aggregate lotes data by produto_id
        const lotesMap = new Map<number, { count: number; totalSaldo: number }>()
        lotes?.forEach((lote) => {
          const existing = lotesMap.get(lote.produto_id) || { count: 0, totalSaldo: 0 }
          lotesMap.set(lote.produto_id, {
            count: existing.count + 1,
            totalSaldo: existing.totalSaldo + (lote.saldo || 0),
          })
        })

        // Attach lotes data to produtos
        const produtosWithLotes = produtos?.map((produto) => {
          const lotesData = lotesMap.get(produto.id) || { count: 0, totalSaldo: 0 }
          return {
            ...produto,
            lotes: [{ count: lotesData.count }],
            lotes_aggregate: [{ sum: { saldo: lotesData.totalSaldo } }],
          }
        })

        return {
          products: produtosWithLotes || [],
          totalCount: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        }
      }),

    search: publicProcedure
      .input(
        z.object({
          query: z.string().min(2),
          limit: z.number().default(10),
        }),
      )
      .query(async ({ input }) => {
        const supabase = await createClient()

        const { data } = await supabase
          .from("produtos")
          .select("id, identificacao, descricao, tipo")
          .or(`identificacao.ilike.%${input.query}%,descricao.ilike.%${input.query}%`)
          .limit(input.limit)

        return data || []
      }),

    stats: publicProcedure.query(async () => {
      const supabase = await createClient()

      // Get all products
      const { data: produtos } = await supabase.from("produtos").select("id, status, qtde_minima")

      if (!produtos) {
        return {
          totalProducts: 0,
          activeProducts: 0,
          inactiveProducts: 0,
          normalStock: 0,
          lowStock: 0,
          criticalStock: 0,
        }
      }

      // Get all lotes for these produtos
      const produtoIds = produtos.map((p) => p.id)
      const { data: lotes } = await supabase.from("lotes").select("produto_id, saldo").in("produto_id", produtoIds)

      // Aggregate lotes by produto_id
      const lotesMap = new Map<number, number>()
      lotes?.forEach((lote) => {
        const existing = lotesMap.get(lote.produto_id) || 0
        lotesMap.set(lote.produto_id, existing + (lote.saldo || 0))
      })

      // Calculate statistics
      const totalProducts = produtos.length
      const activeProducts = produtos.filter((p) => p.status === "ativo").length
      const inactiveProducts = produtos.filter((p) => p.status === "inativo").length

      let normalStock = 0
      let lowStock = 0
      let criticalStock = 0

      produtos.forEach((produto) => {
        const estoqueAtual = lotesMap.get(produto.id) || 0
        const qtdeMinima = produto.qtde_minima || 0

        if (estoqueAtual >= qtdeMinima * 1.5) {
          normalStock++
        } else if (estoqueAtual >= qtdeMinima) {
          lowStock++
        } else {
          criticalStock++
        }
      })

      return {
        totalProducts,
        activeProducts,
        inactiveProducts,
        normalStock,
        lowStock,
        criticalStock,
      }
    }),

    byId: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const supabase = await createClient()

      const { data: produto, error } = await supabase.from("produtos").select("*").eq("id", input.id).single()

      if (error) throw error

      // Get lotes for this produto
      const { data: lotes } = await supabase.from("lotes").select("*").eq("produto_id", input.id)

      return {
        ...produto,
        lotes: lotes || [],
      }
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
