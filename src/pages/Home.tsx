import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPokemonList } from '../services/pokeapi'
import './Home.css'

export default function Home() {
  const [pokemonNames, setPokemonNames] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [searchLoading, setSearchLoading] = useState(true)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPokemonNames() {
      setSearchLoading(true)
      setSearchError(null)

      try {
        const listData = await fetchPokemonList(151, 0)
        setPokemonNames(listData.results.map((item) => item.name))
      } catch {
        setSearchError('No se pudo cargar la lista de búsqueda. Intenta recargar.')
      } finally {
        setSearchLoading(false)
      }
    }

    void loadPokemonNames()
  }, [])

  useEffect(() => {
    const query = searchTerm.trim().toLowerCase()
    if (query.length === 0) {
      setSearchResults([])
      return
    }

    const matches = pokemonNames
      .filter((name) => name.toLowerCase().includes(query))
      .slice(0, 12)

    setSearchResults(matches)
  }, [searchTerm, pokemonNames])

  return (
    <main className="page home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Bienvenido a PokeCore</h1>
          <p>
            Explora, compara y domina la estrategia Pokémon con datos completos de la PokéAPI.
            Usa la Pokédex, construye tu equipo ideal y calcula el daño en combate.
          </p>

          <div className="quick-features">
            <article className="feature-item">
              <h3>🔍 Búsqueda rápida</h3>
              <p>Filtra por nombre, tipo y estadísticas para encontrar tu Pokémon ideal.</p>
            </article>
            <article className="feature-item">
              <h3>🧠 Estrategia</h3>
              <p>Consulta habilidades, movimientos y sinergias para plantear un plan ganador.</p>
            </article>
            <article className="feature-item">
              <h3>⚔️ Combates</h3>
              <p>Calculadora de daño, resistencias y consejos para superar enfrentamientos difíciles.</p>
            </article>
            <article className="feature-item">
              <h3>📈 Estadísticas</h3>
              <p>Visualiza los stats clave para elegir tu equipo con ventaja competitiva.</p>
            </article>
          </div>
        </div>

      </section>

      <section className="quick-search">
        <h2>Búsqueda directa</h2>
        <p>Escribe un nombre de Pokémon para encontrarlo en la Pokédex.</p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar Pokémon..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <span className="search-status">
            {searchLoading ? 'Cargando...' : searchError ?? `${searchResults.length} resultado(s)`}
          </span>
        </div>

        {searchResults.length > 0 && (
          <ul className="search-results">
            {searchResults.map((name) => (
              <li key={name}>
                <Link to={`/pokemon/${name}`}>{name}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="discover-world">
        <h2>Descubre el mundo de Pokémon</h2>
        <p>Explore las herramientas principales con un resumen rápido y accesos directos.</p>

        <div className="discover-cards">
          <article className="discover-card">
            <div className="discover-tag">🗺️</div>
            <h3>Pokédex</h3>
            <p>Consulta todos los datos de cada Pokémon: tipos, estadísticas, habilidades y más.</p>
            <Link className="button ghost" to="/pokedex">
              Ir a Pokédex
            </Link>
          </article>

          <article className="discover-card">
            <div className="discover-tag">🔥</div>
            <h3>Tipos</h3>
            <p>Estudia fortalezas y debilidades para dominar cualquier enfrentamiento.</p>
            <Link className="button ghost" to="/tipos">
              Ir a Tipos
            </Link>
          </article>

          <article className="discover-card">
            <div className="discover-tag">💥</div>
            <h3>Ataques</h3>
            <p>Explora movimientos con poder, precisión y efectos para tu estrategia.</p>
            <Link className="button ghost" to="/ataques">
              Ir a Ataques
            </Link>
          </article>

          <article className="discover-card">
            <div className="discover-tag">🧩</div>
            <h3>Habilidades</h3>
            <p>Revisa efectos especiales y mejoras pasivas que cambian cada combate.</p>
            <Link className="button ghost" to="/habilidades">
              Ir a Habilidades
            </Link>
          </article>

          <article className="discover-card">
            <div className="discover-tag">🎒</div>
            <h3>Objetos</h3>
            <p>Descubre objetos clave que potencian tu equipo y respuestas en batalla.</p>
            <Link className="button ghost" to="/objetos">
              Ir a Objetos
            </Link>
          </article>

          <article className="discover-card">
            <div className="discover-tag">⚖️</div>
            <h3>Damage Calculator</h3>
            <p>Calcula impactos exactos y optimiza tu rendimiento por combinación de tipos.</p>
            <Link className="button ghost" to="/damage-calculator">
              Ir a calculadora
            </Link>
          </article>

          <article className="discover-card">
            <div className="discover-tag">🛡️</div>
            <h3>Team Builder</h3>
            <p>Arma y guarda tu mejor equipo con fortalezas y roles balanceados.</p>
            <Link className="button ghost" to="/team-builder">
              Ir a Team Builder
            </Link>
          </article>
        </div>
      </section>
    </main>
  )
}
