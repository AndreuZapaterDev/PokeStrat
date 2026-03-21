import { createClient, type AuthChangeEvent, type Session } from '@supabase/supabase-js'
import type { PokemonCard, PokemonDetail } from './pokeapi'

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

function mapPokemonRowToCard(row: PokemonRow): PokemonCard {
  return {
    id: row.id,
    name: row.name,
    spriteUrl: row.sprite_url,
    types: row.types || [],
  }
}

function mapPokemonRowToDetail(row: PokemonRow): PokemonDetail {
  return {
    id: row.id,
    name: row.name,
    spriteUrl: row.sprite_url,
    height: row.height ?? 0,
    weight: row.weight ?? 0,
    baseExperience: row.base_experience ?? 0,
    types: row.types || [],
    abilities: row.abilities || [],
    stats: row.stats || [],
    moves: row.moves || [],
    heldItems: row.held_items || [],
    species: {
      name: row.species_name ?? row.name,
      url: row.species_url ?? '',
    },
    description: row.description,
    genus: row.genus,
    habitat: row.habitat,
    eggGroups: row.egg_groups,
    captureRate: row.capture_rate,
    baseHappiness: row.base_happiness,
    gameIndices: row.game_indices,
  }
}

export async function fetchPokemonListFromSupabase(
  page = 0,
  pageSize = 50,
  search = '',
): Promise<{ count: number; results: PokemonCard[] }> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  let query = supabase
    .from('pokemons')
    .select('*', { count: 'exact' })
    .order('id', { ascending: true })
    .range(page * pageSize, page * pageSize + pageSize - 1)

  if (search.trim()) {
    query = query.ilike('name', `%${search.trim()}%`)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(error.message)
  }

  return {
    count: count ?? 0,
    results: (data ?? []).map(mapPokemonRowToCard),
  }
}

export async function fetchPokemonDetailFromSupabase(
  idOrName: string | number,
): Promise<PokemonDetail> {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const byId = typeof idOrName === 'number' || /^[0-9]+$/.test(String(idOrName))
  const matchValue = byId ? Number(idOrName) : String(idOrName).toLowerCase()

  const query = supabase
    .from('pokemons')
    .select('*')
    .limit(1)

  const { data, error } = byId
    ? await query.eq('id', Number(matchValue))
    : await query.ilike('name', String(matchValue))

  if (error) {
    throw new Error(error.message)
  }

  const row = data?.[0]
  if (!row) {
    throw new Error(`Pokémon ${idOrName} no encontrado en Supabase`)
  }

  return mapPokemonRowToDetail(row)
}

export async function insertPokemonInSupabase(pokemon: PokemonDetail) {
  if (!supabase) {
    throw new Error('Supabase no está configurado')
  }

  const row: PokemonRow = {
    id: pokemon.id,
    name: pokemon.name,
    sprite_url: pokemon.spriteUrl,
    types: pokemon.types,
    height: pokemon.height,
    weight: pokemon.weight,
    base_experience: pokemon.baseExperience,
    description: pokemon.description,
    genus: pokemon.genus,
    habitat: pokemon.habitat,
    egg_groups: pokemon.eggGroups,
    capture_rate: pokemon.captureRate,
    base_happiness: pokemon.baseHappiness,
    species_name: pokemon.species.name,
    species_url: pokemon.species.url,
    abilities: pokemon.abilities,
    stats: pokemon.stats,
    moves: pokemon.moves,
    held_items: pokemon.heldItems,
    game_indices: pokemon.gameIndices,
  }

  const { error } = await supabase.from('pokemons').upsert(row)
  if (error) throw new Error(error.message)

  return row
}
