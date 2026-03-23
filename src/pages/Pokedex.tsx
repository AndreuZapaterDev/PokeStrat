import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import './Pokedex.css'
import { fetchPokemonList, fetchPokemonSummary, fetchPokemonsByTypes, toPokemonCard } from '../services/pokeapi'
import type { PokemonCard, PokemonListItem } from '../services/pokeapi'

const PAGE_SIZE = 50

const typeLabels: Record<string, string> = {
  normal: 'Normal',
  fire: 'Fuego',
  water: 'Agua',
  electric: 'Eléctrico',
  grass: 'Planta',
  ice: 'Hielo',
  fighting: 'Lucha',
  poison: 'Veneno',
  ground: 'Tierra',
  flying: 'Volador',
  psychic: 'Psíquico',
  bug: 'Bicho',
  rock: 'Roca',
  ghost: 'Fantasma',
  dragon: 'Dragón',
  dark: 'Siniestro',
  steel: 'Acero',
  fairy: 'Hada',
}

const typeColors: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
}

export default function Pokedex() {
  const [search, setSearch] = useState('')
  const [cards, setCards] = useState<PokemonCard[]>([])
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>([])
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState<number | null>(null)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [typeFilteredCards, setTypeFilteredCards] = useState<PokemonCard[]>([])
  const [typeFilterLoading, setTypeFilterLoading] = useState(false)
  const [typeFilterError, setTypeFilterError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchMatches, setSearchMatches] = useState<PokemonCard[]>([])

  useEffect(() => {
    let isCancelled = false
    async function loadPage() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchPokemonList(PAGE_SIZE, page * PAGE_SIZE)
        if (isCancelled) return

        setTotal(data.count)
        const basicCards = data.results.map(toPokemonCard)
        setCards(basicCards)

        // Preload details in paralelo con batch pequeño
        const batchSize = 10
        for (let i = 0; i < basicCards.length; i += batchSize) {
          const batch = basicCards.slice(i, i + batchSize)
          const updatedBatch = await Promise.all(
            batch.map(async (card) => {
              try {
                const detail = await fetchPokemonSummary(card.id)
                return { ...card, name: detail.name, types: detail.types }
              } catch {
                return card
              }
            }),
          )
          if (isCancelled) return

          setCards((prev) => {
            const map = new Map(prev.map((c) => [c.id, c]))
            updatedBatch.forEach((card) => map.set(card.id, card))
            return Array.from(map.values())
          })
        }
      } catch (err) {
        if (!isCancelled) setError((err as Error)?.message ?? 'Error al cargar la Pokédex')
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    loadPage()

    return () => {
      isCancelled = true
    }
  }, [page])

  useEffect(() => {
    let isCancelled = false
    async function loadAll() {
      try {
        const all = await fetchPokemonList(100000, 0)
        if (!isCancelled) setAllPokemon(all.results)
      } catch {
        if (!isCancelled) {
          setSearchError('No se pudo cargar la lista completa para búsqueda global')
        }
      }
    }

    loadAll()

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (selectedTypes.length === 0) {
      setTypeFilteredCards([])
      setTypeFilterError(null)
      setTypeFilterLoading(false)
      return
    }

    let isCancelled = false

    async function loadTypeCards() {
      setTypeFilterLoading(true)
      setTypeFilterError(null)

      try {
        const list = await fetchPokemonsByTypes(selectedTypes)
        if (isCancelled) return

        const batchSize = 24
        let loaded: PokemonCard[] = []

        for (let i = 0; i < list.length && !isCancelled; i += batchSize) {
          const batch = list.slice(i, i + batchSize)
          const fetchedBatch = await Promise.all(
            batch.map(async (item) => {
              try {
                return await fetchPokemonSummary(item.name)
              } catch {
                return undefined
              }
            }),
          )

          if (isCancelled) return

          loaded = [...loaded, ...fetchedBatch.filter((c): c is PokemonCard => Boolean(c))]
          setTypeFilteredCards(loaded)
        }
      } catch (err) {
        if (!isCancelled) setTypeFilterError('No se pudo cargar el filtro por tipo')
      } finally {
        if (!isCancelled) setTypeFilterLoading(false)
      }
    }

    loadTypeCards()

    return () => {
      isCancelled = true
    }
  }, [selectedTypes])

  const filteredLocal = useMemo(() => {
    const term = search.trim().toLowerCase()
    const sourceCards = selectedTypes.length ? typeFilteredCards : cards

    if (term.length < 2) return sourceCards
    return sourceCards.filter((item) => item.name.toLowerCase().includes(term))
  }, [cards, typeFilteredCards, search, selectedTypes])

  useEffect(() => {
    const term = search.trim().toLowerCase()
    if (term.length < 2) {
      setSearchMatches([])
      setSearchError(null)
      setSearchLoading(false)
      return
    }

    let isCancelled = false
    setSearchLoading(true)
    setSearchError(null)

    const timer = window.setTimeout(async () => {
      try {
        if (selectedTypes.length > 0) {
          const filtered = typeFilteredCards.filter((item) => item.name.toLowerCase().includes(term))
          if (!isCancelled) {
            if (filtered.length === 0) {
              setSearchMatches([])
              setSearchError(`No se encontró ningún Pokémon para "${search}" con los tipos seleccionados.`)
            } else {
              setSearchMatches(filtered.slice(0, 30))
              setSearchError(null)
            }
            setSearchLoading(false)
          }
          return
        }

        const matches = allPokemon
          .filter((item) => item.name.toLowerCase().includes(term))
          .slice(0, 40)

        if (matches.length === 0) {
          if (!isCancelled) {
            setSearchMatches([])
            setSearchError(`No se encontró ningún Pokémon para "${search}".`)
            setSearchLoading(false)
          }
          return
        }

        const loadedMatches = cards.filter((card) => matches.some((m) => m.name === card.name))
        const toFetch = matches
          .filter((item) => !loadedMatches.some((card) => card.name === item.name))
          .slice(0, 20)

        const fetched = await Promise.all(
          toFetch.map(async (item) => {
            try {
              return await fetchPokemonSummary(item.name)
            } catch {
              return undefined
            }
          }),
        )

        if (!isCancelled) {
          const allResults = [...loadedMatches, ...fetched.filter((c): c is PokemonCard => Boolean(c))]
          const withType = selectedTypes.length
            ? allResults.filter((item) => selectedTypes.every((type) => item.types.includes(type)))
            : allResults

          setSearchMatches(withType.slice(0, 30))
          setSearchLoading(false)
        }
      } catch (err) {
        if (!isCancelled) {
          setSearchError('Error en la búsqueda')
          setSearchLoading(false)
        }
      }
    }, 260)

    return () => {
      isCancelled = true
      window.clearTimeout(timer)
    }
  }, [search, allPokemon, cards, selectedTypes, typeFilteredCards])

  const displayCards = search.trim().length >= 2 ? searchMatches : filteredLocal

  const totalPages = total ? Math.ceil(total / PAGE_SIZE) : 0
  const showPagination = Boolean(total && totalPages > 1 && search.trim().length < 2)
  const canPrev = page > 0
  const canNext = total !== null ? page < totalPages - 1 : false

  const paginationWindow = 4
  const startPage = Math.max(0, page - paginationWindow)
  const endPage = Math.min(totalPages - 1, page + paginationWindow)
  const pageNumbers = []
  for (let p = startPage; p <= endPage; p += 1) pageNumbers.push(p)

  return (
    <main className="page">
      <header className="pageHeader">
        <h1>Pokédex</h1>
        <Link className="button secondary" to="/">
          Volver al inicio
        </Link>
      </header>

      <section className="search">
        <div className="searchTopBar">
          <div className="searchInputGroup">
            <label htmlFor="search">Buscar Pokémon</label>
            <input
              id="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setSearchError(null)
              }}
              placeholder="Ej. pikachu"
              autoComplete="off"
            />
          </div>
          <button
            type="button"
            className="button secondary clearFilters"
            onClick={() => {
              setSelectedTypes([])
              setSearch('')
              setSearchMatches([])
              setSearchError(null)
            }}
          >
            Limpiar filtros
          </button>
        </div>

        <div className="typeFilterRow">
          <span>Filtro por tipo:</span>
        </div>

        <div className="typeList">
          {Object.entries(typeLabels).map(([typeKey, typeName]) => {
            const selected = selectedTypes.includes(typeKey)
            const color = typeColors[typeKey] ?? '#A8A77A'
            return (
              <button
                key={typeKey}
                className={`typeChip ${selected ? 'active' : ''}`}
                type="button"
                style={{
                  borderColor: selected ? color : 'rgba(255, 255, 255, 0.25)',
                  background: selected ? `${color}51` : 'rgba(255, 255, 255, 0.08)',
                  color: selected ? '#fff' : 'var(--text)',
                  boxShadow: selected ? `0 0 0 2px ${color}99` : 'none',
                }}
                onClick={() => {
                  setSelectedTypes((prev) => {
                    if (prev.includes(typeKey)) {
                      return prev.filter((t) => t !== typeKey)
                    }
                    if (prev.length >= 2) {
                      return prev
                    }
                    return [...prev, typeKey]
                  })
                }}
              >
                {typeName}
              </button>
            )
          })}
        </div>
      </section>

      {loading && <LoadingSpinner label="Cargando Pokémon" />}
      {typeFilterLoading && <LoadingSpinner label="Aplicando filtro de tipo" />}
      {searchLoading && <LoadingSpinner label="Buscando Pokémon" />}
      {error && <p className="status error">{error}</p>}
      {typeFilterError && <p className="status error">{typeFilterError}</p>}
      {searchError && <p className="status error">{searchError}</p>}

      {!loading && !error && (
        <>
          <section className="grid">
            {displayCards.length === 0 ? (
              <p className="status">No se encontró ningún Pokémon.</p>
            ) : (
              displayCards.map((pokemon) => {
                const primaryType = pokemon.types[0] || 'normal'
                const baseColor = typeColors[primaryType] || '#A8A77A'
                return (
                  <Link
                    key={pokemon.id}
                    to={`/pokemon/${pokemon.id}`}
                    className="card"
                    style={{
                      background: `linear-gradient(135deg, ${baseColor}20 0%, ${baseColor}10 50%, rgba(10, 14, 26, 0.7) 100%)`,
                      borderColor: `rgba(255,255,255,0.12)`,
                    }}
                  >
                    <img
                      className="sprite"
                      src={pokemon.spriteUrl}
                      alt={pokemon.name}
                      loading="lazy"
                      width={96}
                      height={96}
                    />
                    <div className="cardContent">
                      <span className="badge">#{pokemon.id.toString().padStart(3, '0')}</span>
                      <p className="name">{pokemon.name}</p>
                      <div className="typeList">
                        {pokemon.types.map((type) => {
                          const color = typeColors[type] ?? '#A8A77A'
                          return (
                            <span
                              key={type}
                              className={`typeBadge type-${type}`}
                              style={{
                                background: `${color}33`,
                                border: `1px solid ${color}66`,
                                color: '#fff',
                              }}
                            >
                              {typeLabels[type] ?? type}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </section>

          {showPagination && (
            <footer className="pagination">
              <button
                type="button"
                className="button secondary"
                disabled={!canPrev}
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              >
                Anterior
              </button>
              <div className="pageNumberList">
                {startPage > 0 && (
                  <>
                    <button type="button" className="button secondary" onClick={() => setPage(0)}>
                      1
                    </button>
                    {startPage > 1 && <span className="ellipsis">...</span>}
                  </>
                )}
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={`button ${pageNumber === page ? 'active' : 'secondary'}`}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber + 1}
                  </button>
                ))}
                {endPage < totalPages - 1 && (
                  <>
                    {endPage < totalPages - 2 && <span className="ellipsis">...</span>}
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => setPage(totalPages - 1)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                className="button secondary"
                disabled={!canNext}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
              >
                Siguiente
              </button>
            </footer>
          )}
        </>
      )}
    </main>
  )
}
