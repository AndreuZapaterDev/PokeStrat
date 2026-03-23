/* eslint-disable @typescript-eslint/no-explicit-any */

export type PokemonListItem = {
  name: string
  url: string
}

export type PokemonCard = {
  id: number
  name: string
  spriteUrl: string
  types: string[]
}

export type PokemonListResponse = {
  count: number
  next: string | null
  previous: string | null
  results: PokemonListItem[]
}

export type PokemonDetail = {
  id: number
  name: string
  spriteUrl: string
  height: number
  weight: number
  baseExperience: number
  types: string[]
  abilities: Array<{ name: string; hidden: boolean; effect?: string }>
  stats: Array<{ name: string; value: number }>
  moves: Array<{
    name: string
    power?: number
    accuracy?: number
    pp?: number
    type?: string
    category?: string
    effect?: string
    level?: number
    method?: string
  }>
  heldItems: Array<{ name: string; effect?: string }>
  species: {
    name: string
    url: string
  }
  forms?: Array<{ name: string; url: string }>
  gameIndices?: Array<{ game: string; index: number }>
  cries?: {
    latest?: string
    legacy?: string
  }
  locationEncounters?: Array<{
    area: string
    version: string
    method?: string
    minLevel?: number
    maxLevel?: number
  }>
  description?: string
  genus?: string
  habitat?: string
  eggGroups?: string[]
  captureRate?: number
  baseHappiness?: number
  evolutionChain?: Array<{ id: number; name: string; parentId?: number; level?: number; method?: string; trigger?: string; itemName?: string; itemUrl?: string; itemSprite?: string }>
}

const POKEAPI_BASE = 'https://pokeapi.co/api/v2'

function getLocalizedValue(items: any[], language = 'es', valueKey = 'name'): string | undefined {
  if (!Array.isArray(items)) return undefined
  const entry = items.find((item) => item?.language?.name === language)
  return entry ? entry[valueKey] : undefined
}

function getFlavorText(entries: any[], language = 'es'): string | undefined {
  if (!Array.isArray(entries)) return undefined
  const entry = entries.find((item) => item?.language?.name === language)
  if (!entry || !entry.flavor_text) return undefined
  return String(entry.flavor_text).replace(/\s+/g, ' ').trim()
}

async function getLocalizedNameFromUrl(url: string | undefined, language = 'es'): Promise<string | undefined> {
  if (!url) return undefined
  try {
    const response = await fetch(url)
    if (!response.ok) return undefined
    const data = await response.json()
    const localized = getLocalizedValue(data.names, language)
    return localized
  } catch {
    return undefined
  }
}

async function getLocalizedEffectFromUrl(url: string | undefined, language = 'es'): Promise<string | undefined> {
  if (!url) return undefined
  try {
    const response = await fetch(url)
    if (!response.ok) return undefined
    const data = await response.json()
    const entry = (data.effect_entries ?? []).find((e: any) => e.language?.name === language)
    if (entry?.effect) return String(entry.effect).replace(/\s+/g, ' ').trim()

    const flavorEntry = (data.flavor_text_entries ?? []).find((e: any) => e.language?.name === language)
    if (flavorEntry?.flavor_text) return String(flavorEntry.flavor_text).replace(/\s+/g, ' ').trim()

    return undefined
  } catch {
    return undefined
  }
}

function localizeMoveMethod(method?: string): string | undefined {
  if (!method) return undefined
  const mapping: Record<string, string> = {
    'level-up': 'Por nivel',
    machine: 'MT/MO',
    tutor: 'Tutor',
    egg: 'Huevo',
    trade: 'Intercambio',
    unknown: 'Otros',
  }
  return mapping[method] ?? method.replace(/[-_]/g, ' ')
}

function localizeLocationMethod(method?: string): string | undefined {
  if (!method) return undefined
  const mapping: Record<string, string> = {
    walk: 'Caminar',
    surf: 'Surf',
    fish: 'Pescar',
    flash: 'Flash',
    unknown: 'Otros',
  }
  return mapping[method] ?? method.replace(/[-_]/g, ' ')
}

function localizeVersionName(version?: string): string | undefined {
  if (!version) return undefined
  const mapping: Record<string, string> = {
    red: 'Rojo',
    blue: 'Azul',
    yellow: 'Amarillo',
    gold: 'Oro',
    silver: 'Plata',
    crystal: 'Cristal',
    ruby: 'Rubí',
    sapphire: 'Zafiro',
    emerald: 'Esmeralda',
    'firered': 'Rojo Fuego',
    'leafgreen': 'Verde Hoja',
    'diamond': 'Diamante',
    'pearl': 'Perla',
    'platinum': 'Platino',
    'heartgold': 'Oro HeartGold',
    'soulsilver': 'Plata SoulSilver',
    'black': 'Negro',
    'white': 'Blanco',
    'black-2': 'Negro 2',
    'white-2': 'Blanco 2',
    'x': 'X',
    'y': 'Y',
    'omega-ruby': 'Omega Rubí',
    'alpha-sapphire': 'Alfa Zafiro',
    'sun': 'Sol',
    'moon': 'Luna',
    'ultra-sun': 'Ultrasol',
    'ultra-moon': 'Ultraluna',
    'sword': 'Espada',
    'shield': 'Escudo',
    'brilliant-diamond': 'Diamante Brillante',
    'shining-pearl': 'Perla Reluciente',
    'legends-arceus': 'Leyendas: Arceus',
    'scarlet': 'Escarlata',
    'violet': 'Púrpura',
  }
  return mapping[version] ?? version.replace(/[-_]/g, ' ')
}

async function parseEvolutionChain(
  chain: any,
  language = 'es',
): Promise<Array<{ id: number; name: string; parentId?: number; level?: number; method?: string; trigger?: string; itemName?: string; itemUrl?: string; itemSprite?: string }>> {
  const result: Array<{ id: number; name: string; parentId?: number; level?: number; method?: string; trigger?: string; itemName?: string; itemUrl?: string; itemSprite?: string }> = []

  async function formatTrigger(detail: any): Promise<string | undefined> {
    if (!detail) return undefined
    const trigger = detail.trigger?.name
    const item = detail.item?.name
    const known = ['level-up', 'trade', 'use-item', 'shed'].includes(trigger)

    if (trigger === 'level-up') {
      return detail.min_level ? `Nivel ${detail.min_level}` : 'Por nivel'
    }
    if (trigger === 'trade') {
      return 'Intercambio'
    }
    if (trigger === 'use-item' && item) {
      // Localiza nombre del objeto si está disponible (idioma español)
      const localizedItem = detail.item?.url ? await getLocalizedNameFromUrl(detail.item.url, language) : undefined
      return `Usar ${localizedItem ?? item}`
    }
    if (trigger) {
      return localizeMoveMethod(trigger)
    }
    if (item) {
      return `Usar ${item}`
    }
    return known ? trigger.replace(/[-_]/g, ' ') : undefined
  }

  async function traverse(node: any, prevDetail?: any, parentId?: number) {
    if (!node || !node.species) return
    const id = getPokemonIdFromUrl(node.species.url)
    if (id) {
      const localizedName = (await getLocalizedNameFromUrl(node.species.url, language)) ?? node.species.name
      const level = prevDetail?.min_level ? Number(prevDetail.min_level) : undefined
      const trigger = prevDetail?.trigger?.name
      const itemName = prevDetail?.item?.name
      const itemUrl = prevDetail?.item?.url
      let itemSprite: string | undefined
      if (itemUrl) {
        try {
          const itemResp = await fetch(itemUrl)
          if (itemResp.ok) {
            const itemData = await itemResp.json()
            itemSprite = itemData?.sprites?.default
          }
        } catch {
          itemSprite = undefined
        }
      }

      result.push({
        id,
        parentId,
        name: localizedName,
        level,
        method: trigger ? localizeMoveMethod(trigger) : undefined,
        trigger: await formatTrigger(prevDetail),
        itemName,
        itemUrl,
        itemSprite,
      })
    }

    const evolvesTo = Array.isArray(node.evolves_to) ? node.evolves_to : []
    for (const next of evolvesTo) {
      const detail = Array.isArray(next.evolution_details) ? next.evolution_details[0] : undefined
      await traverse(next, detail, id)
    }
  }

  await traverse(chain)
  return result
}

export function getPokemonIdFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/)
  return match ? Number(match[1]) : 0
}

export function getPokemonSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

export async function fetchPokemonList(
  limit = 20,
  offset = 0,
): Promise<PokemonListResponse> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon?limit=${limit}&offset=${offset}`)
  if (!response.ok) {
    throw new Error(`Error en la API de PokéAPI (${response.status})`)
  }
  const data = await response.json()
  return {
    count: data.count,
    next: data.next,
    previous: data.previous,
    results: data.results || [],
  }
}

const pokemonSummaryCache = new Map<string | number, PokemonCard>()

export async function fetchPokemonSummary(
  idOrName: string | number,
): Promise<PokemonCard> {
  const cacheKey = String(idOrName)
  const cached = pokemonSummaryCache.get(cacheKey)
  if (cached) return cached

  const response = await fetch(`${POKEAPI_BASE}/pokemon/${idOrName}`)
  if (!response.ok) {
    throw new Error(`Error en la API de PokéAPI (${response.status})`)
  }
  const data = await response.json()

  const summary: PokemonCard = {
    id: data.id,
    name: normalizePokemonName(data.name),
    spriteUrl:
      data.sprites?.other?.['official-artwork']?.front_default ||
      data.sprites?.front_default ||
      getPokemonSpriteUrl(data.id),
    types: data.types?.map((t: any) => t.type?.name).filter(Boolean) ?? [],
  }

  pokemonSummaryCache.set(cacheKey, summary)
  return summary
}

export async function fetchPokemonsByTypes(typeNames: string[]): Promise<PokemonListItem[]> {
  if (!Array.isArray(typeNames) || typeNames.length === 0) {
    return []
  }

  const results = await Promise.all(
    typeNames.map(async (type) => {
      const res = await fetch(`${POKEAPI_BASE}/type/${type}`)
      if (!res.ok) {
        throw new Error(`Error en la API de PokéAPI (type ${type}: ${res.status})`)
      }
      const data = await res.json()
      const pokemon = Array.isArray(data.pokemon)
        ? data.pokemon
            .map((p: any) => p?.pokemon)
            .filter((p: any) => p && typeof p.name === 'string' && typeof p.url === 'string')
        : []
      return pokemon as PokemonListItem[]
    }),
  )

  if (results.length === 0) return []

  const intersection = results.reduce((acc, list) => {
    if (acc.length === 0) return list
    const set = new Set(list.map((item) => item.name))
    return acc.filter((item) => set.has(item.name))
  }, results[0])

  const uniqueMap = new Map<string, PokemonListItem>()
  intersection.forEach((item) => {
    if (!uniqueMap.has(item.name)) {
      uniqueMap.set(item.name, item)
    }
  })

  return Array.from(uniqueMap.values())
}

export async function fetchPokemonDetail(idOrName: string | number): Promise<PokemonDetail> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${idOrName}`)
  if (!response.ok) {
    throw new Error(`Error en la API de PokéAPI (${response.status})`)
  }
  const data = await response.json()

  // Fetch species data to get Spanish translations
  const speciesResponse = await fetch(`${POKEAPI_BASE}/pokemon-species/${idOrName}`)
  const speciesData = speciesResponse.ok ? await speciesResponse.json() : null

  const localizedName = normalizePokemonName(getLocalizedValue(speciesData?.names, 'es') ?? data.name)
  const description = getFlavorText(speciesData?.flavor_text_entries, 'es')
  const genus = getLocalizedValue(speciesData?.genera, 'es', 'genus')
  const habitat = speciesData?.habitat?.name
  const eggGroups = speciesData?.egg_groups?.map((g: any) => g.name) ?? []
  const captureRate = speciesData?.capture_rate
  const baseHappiness = speciesData?.base_happiness

  const types = data.types?.map((t: any) => t.type?.name).filter(Boolean) ?? []

  const abilities: Array<{ name: string; hidden: boolean; detailsUrl?: string }> =
    (data.abilities ?? [])
      .map((a: any) => ({
        name: a.ability?.name,
        hidden: a.is_hidden,
        detailsUrl: a.ability?.url,
      }))
      .filter((a: any) => a.name != null)

  const stats = data.stats
    ?.map((s: any) => ({ name: s.stat?.name, value: s.base_stat }))
    .filter((s: any) => s.name != null) ?? []

  const moves: Array<{ name: string; detailsUrl?: string; level?: number; method?: string }> =
    (data.moves ?? [])
      .map((m: any) => {
        const versionDetails = Array.isArray(m.version_group_details) ? m.version_group_details : []
        const methods: Array<{ method: string; level: number }> = versionDetails
          .map((d: any) => ({
            method: d.move_learn_method?.name,
            level: Number(d.level_learned_at) || 0,
          }))
          .filter((d: { method?: string; level: number }): d is { method: string; level: number } => Boolean(d.method))

        const levelUp = methods
          .filter((d: { method: string; level: number }) => d.method === 'level-up')
          .sort((a: { method: string; level: number }, b: { method: string; level: number }) => a.level - b.level)[0]
        const finalMethod = levelUp
          ? 'level-up'
          : methods[0]?.method ?? 'unknown'

        return {
          name: m.move?.name,
          detailsUrl: m.move?.url,
          level: levelUp ? levelUp.level : 0,
          method: finalMethod,
        }
      })
      .filter((m: any) => m.name != null)
      .sort((a: { name?: string; level?: number; method?: string }, b: { name?: string; level?: number; method?: string }) => {
        const priority: Record<string, number> = {
          'level-up': 1,
          'egg': 2,
          'machine': 3,
          'tutor': 4,
          'trade': 5,
          unknown: 6,
        }
        const pa = priority[a.method ?? 'unknown'] ?? 99
        const pb = priority[b.method ?? 'unknown'] ?? 99

        if (pa !== pb) return pa - pb

        if (pa === 1) {
          return (a.level ?? 0) - (b.level ?? 0)
        }

        return (a.name ?? '').localeCompare(b.name ?? '')
      })

  const heldItems: Array<{ name: string; detailsUrl?: string }> =
    (data.held_items ?? [])
      .map((h: any) => ({ name: h.item?.name, detailsUrl: h.item?.url }))
      .filter((h: any) => h.name != null)

  const evolutionChainUrl = speciesData?.evolution_chain?.url
  const evolutionChain: Array<{ id: number; name: string }> = []
  if (evolutionChainUrl) {
    try {
      const evoResp = await fetch(evolutionChainUrl)
      if (evoResp.ok) {
        const evoData = await evoResp.json()
        evolutionChain.push(...(await parseEvolutionChain(evoData.chain, 'es')))
      }
    } catch {
      // ignore evolution chain fetch errors
    }
  }

  const locationEncountersUrl = data.location_area_encounters
  const locationEncounters: Array<{
    area: string
    version: string
    method?: string
    minLevel?: number
    maxLevel?: number
  }> = []

  if (locationEncountersUrl) {
    try {
      const locResp = await fetch(locationEncountersUrl)
      if (locResp.ok) {
        const locData = await locResp.json()
        for (const entry of locData ?? []) {
          const areaName = entry.location_area?.name
          for (const versionDetail of entry.version_details ?? []) {
            const versionName = versionDetail.version?.name
            for (const encounter of versionDetail.encounter_details ?? []) {
              locationEncounters.push({
                area: areaName,
                version: localizeVersionName(versionName) ?? (versionName ?? 'Desconocida'),
                method: localizeLocationMethod(encounter.method?.name),
                minLevel: encounter.min_level,
                maxLevel: encounter.max_level,
              })
            }
          }
        }
      }
    } catch {
      // ignore location fetch errors
    }
  }

  // Fetch localized names for abilities, moves and items (in parallel)
  const localizedAbilities = await Promise.all(
    abilities.map(async (ability) => {
      const [localizedName, effect] = await Promise.all([
        getLocalizedNameFromUrl(ability.detailsUrl),
        getLocalizedEffectFromUrl(ability.detailsUrl),
      ])
      return {
        ...ability,
        name: localizedName ?? ability.name,
        effect,
      }
    }),
  )

  const localizedMoves = await Promise.all(
    moves.map(async (move) => {
      const [localizedName, effect] = await Promise.all([
        getLocalizedNameFromUrl(move.detailsUrl),
        getLocalizedEffectFromUrl(move.detailsUrl),
      ])
      const moveData = await (async () => {
        if (!move.detailsUrl) return {}
        try {
          const response = await fetch(move.detailsUrl)
          if (!response.ok) return {}
          const data = await response.json()
          return {
            power: data.power,
            accuracy: data.accuracy,
            pp: data.pp,
            type: data.type?.name,
            category: data.damage_class?.name,
          }
        } catch {
          return {}
        }
      })()

      return {
        ...move,
        name: localizedName ?? move.name,
        effect,
        ...moveData,
      }
    }),
  )

  const localizedItems = await Promise.all(
    heldItems.map(async (item) => {
      const [localizedName, effect] = await Promise.all([
        getLocalizedNameFromUrl(item.detailsUrl),
        getLocalizedEffectFromUrl(item.detailsUrl),
      ])
      return {
        ...item,
        name: localizedName ?? item.name,
        effect,
      }
    }),
  )

  const formsFromPokemon: Array<{ name: string; url: string }> =
    (data.forms ?? []).map((f: any) => ({ name: f.name, url: f.url }))

  const formsFromSpecies: Array<{ name: string; url: string }> =
    (speciesData?.varieties ?? [])
      .map((v: any) => ({ name: v.pokemon?.name, url: v.pokemon?.url }))
      .filter((f: any) => typeof f.name === 'string' && typeof f.url === 'string')

  // Unificamos forms para incluir mega formas de species y las del endpoint pokemon.
  const forms: Array<{ name: string; url: string }> = [
    ...formsFromPokemon,
    ...formsFromSpecies,
  ].filter((form, index, self) => self.findIndex((f) => f.name === form.name) === index)

  const gameIndices: Array<{ game: string; index: number }> =
    (data.game_indices ?? []).map((g: any) => ({
      game: g.version?.name,
      index: g.game_index,
    }))

  const cries = data.cries ?? {}

  return {
    id: data.id,
    name: localizedName,
    spriteUrl: data.sprites?.other?.['official-artwork']?.front_default ||
      data.sprites?.front_default ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
    height: data.height,
    weight: data.weight,
    baseExperience: data.base_experience,
    types,
    abilities: localizedAbilities,
    stats,
    moves: localizedMoves,
    heldItems: localizedItems,
    species: {
      name: data.species?.name ?? '',
      url: data.species?.url ?? '',
    },
    forms,
    gameIndices,
    cries,
    locationEncounters,
    description,
    genus,
    habitat,
    eggGroups,
    captureRate,
    baseHappiness,
    evolutionChain,
  }
}

function normalizePokemonName(name: string): string {
  return String(name ?? '').replace(/-/g, ' ')
}

export function toPokemonCard(item: PokemonListItem): PokemonCard {
  const id = getPokemonIdFromUrl(item.url)
  return {
    id,
    name: normalizePokemonName(item.name),
    spriteUrl: getPokemonSpriteUrl(id),
    types: [],
  }
}
