import { createClient, type AuthChangeEvent, type Session } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

type AppDatabase = {
  public: {
    Tables: {
      pokemons: {
        Row: PokemonRow
        Insert: PokemonRow
        Update: Partial<PokemonRow>
      }
    }
  }
}

export const supabase = supabaseEnabled
  ? (createClient<AppDatabase>(SUPABASE_URL, SUPABASE_ANON_KEY) as unknown as any)
  : null

// Auth helpers

export async function signUpWithEmail(email: string, password: string, username?: string) {
  if (!supabase) throw new Error('Supabase no está configurado')

  const payload: { email: string; password: string; options?: { data?: Record<string, unknown> } } = {
    email,
    password,
  }

  if (username?.trim()) {
    payload.options = {
      data: {
        username: username.trim(),
      },
    }
  }

  const { data, error } = await supabase.auth.signUp(payload)

  if (error) throw new Error(error.message)
  return data
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) throw new Error('Supabase no está configurado')

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw new Error(error.message)
  return data
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase no está configurado')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  })

  if (error) throw new Error(error.message)
  return data
}

export async function signOut() {
  if (!supabase) throw new Error('Supabase no está configurado')

  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

export async function getCurrentUser() {
  if (!supabase) return null

  const { data, error } = await supabase.auth.getUser()
  if (error) throw new Error(error.message)
  return data.user
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange(callback)
  return () => data.subscription.unsubscribe()
}

// **** Helpers: mapping entre filas Supabase y tipos de app ****

type PokemonRow = {
  id: number
  name: string
  sprite_url: string
  types: string[]
  height?: number
  weight?: number
  base_experience?: number
  description?: string
  genus?: string
  habitat?: string
  egg_groups?: string[]
  capture_rate?: number
  base_happiness?: number
  species_name?: string
  species_url?: string
  abilities?: Array<{ name: string; hidden: boolean; effect?: string }>
  stats?: Array<{ name: string; value: number }>
  moves?: Array<{ name: string; power?: number; accuracy?: number; pp?: number; type?: string; category?: string; effect?: string }>
  held_items?: Array<{ name: string; effect?: string }>
  game_indices?: Array<{ game: string; index: number }>
}



