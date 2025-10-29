import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ybxamqbzznwadvlgzkai.supabase.co"
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlieGFtcWJ6em53YWR2bGd6a2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTcwODMsImV4cCI6MjA3NjEzMzA4M30.mlRKRDi5IxntAzQ5kaI8SgbbH2Q-8Kw6lilHAJmaBiA"

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
