import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import './Pokedex.css'
import { fetchPokemonList, fetchPokemonSummary, toPokemonCard } from '../services/pokeapi'
import type { PokemonCard } from '../services/pokeapi'

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

export default function Pokedex() {
  const [search, setSearch] = useState('')
  const [cards, setCards] = useState<PokemonCard[]>([])
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

        // Fetch basic info in small batches so the UI can show cards quickly
        const batchSize = 10
        for (let i = 0; i < basicCards.length; i += batchSize) {
          const batch = basicCards.slice(i, i + batchSize)

          const updatedBatch = await Promise.all(
            batch.map(async (card) => {
              try {
                const detail = await fetchPokemonSummary(card.id)
                return {
                  ...card,
                  name: detail.name,
                  types: detail.types,
                }
              } catch {
                return card
              }
            }),
          )

          if (isCancelled) return

          setCards((prev) => {
            const prevById = new Map(prev.map((c) => [c.id, c]))
            updatedBatch.forEach((card) => prevById.set(card.id, card))
            return Array.from(prevById.values())
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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return cards
    return cards.filter((item) => item.name.toLowerCase().includes(term))
  }, [cards, search])

  const totalPages = total ? Math.ceil(total / PAGE_SIZE) : 0
  const showPagination = Boolean(total && totalPages > 1)
  const canPrev = page > 0
  const canNext = total !== null ? page < totalPages - 1 : false

  return (
    <main className="page">
      <header className="pageHeader">
        <h1>Pokédex</h1>
        <Link className="button secondary" to="/">
          Volver al inicio
        </Link>
      </header>

      <section className="search">
        <label htmlFor="search">Buscar Pokémon</label>
        <input
          id="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Ej. pikachu"
          autoComplete="off"
        />
      </section>

      {loading && <LoadingSpinner label="Cargando Pokémon…" />}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && (
        <>
          <section className="grid">
            {filtered.length === 0 ? (
              <p className="status">No se encontró ningún Pokémon para "{search}".</p>
            ) : (
              filtered.map((pokemon) => (
                <Link key={pokemon.id} to={`/pokemon/${pokemon.id}`} className="card">
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
                      {pokemon.types.map((type) => (
                        <span key={type} className={`typeBadge type-${type}`}>
                          {typeLabels[type] ?? type}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))
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
              <span className="pageIndicator">
                Página {page + 1} de {totalPages}
              </span>
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
