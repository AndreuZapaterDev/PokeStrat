import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchPokemonDetail } from '../services/pokeapi'
import type { PokemonDetail } from '../services/pokeapi'

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

const statLabels: Record<string, string> = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Ataque especial',
  'special-defense': 'Defensa especial',
  speed: 'Velocidad',
}

export default function PokemonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'moves' | 'stats' | 'evolution' | 'locations'>('info')

  const tabs = [
    { key: 'info', label: 'Info' },
    { key: 'stats', label: 'Estadísticas' },
    { key: 'moves', label: 'Movimientos' },
    { key: 'evolution', label: 'Evolución' },
    { key: 'locations', label: 'Dónde aparece' },
  ] as const

  useEffect(() => {
    if (!id) return

    setLoading(true)
    setError(null)
    setPokemon(null)

    fetchPokemonDetail(id)
      .then(setPokemon)
      .catch((err) => setError(err?.message ?? 'No se pudo cargar el Pokémon'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <main className="page">
      <header className="pageHeader">
        <h1>Detalles</h1>
        <Link className="button secondary" to="/pokedex">
          Volver a la Pokédex
        </Link>
      </header>

      {loading && <p className="status">Cargando datos…</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && pokemon && (
        <section className="detail wiki">
          <header className="detailHeader wikiHeader">
            <div className="detailMeta">
              <h2>{pokemon.name}</h2>
              <span className="badge">#{pokemon.id.toString().padStart(3, '0')}</span>
              <div className="typeList">
                {pokemon.types.map((type) => (
                  <span key={type} className={`typeBadge type-${type}`}>
                    {typeLabels[type] ?? type}
                  </span>
                ))}
              </div>
            </div>
            <img
              className="detailSprite"
              src={pokemon.spriteUrl}
              alt={pokemon.name}
              width={260}
              height={260}
              loading="lazy"
            />
          </header>

          <div className="wikiTabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`tabButton ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="wikiContent">
            <section className="wikiMain">
              {activeTab === 'info' && (
                <>
                  {pokemon.description && (
                    <article className="wikiSection">
                      <h3>Descripción</h3>
                      <p>{pokemon.description}</p>
                    </article>
                  )}

                  <article className="wikiSection">
                    <h3>Ficha</h3>
                    <div className="infoGrid">
                      <div>
                        <dl className="detailList">
                          <dt>Especie</dt>
                          <dd>
                            <a href={pokemon.species.url} target="_blank" rel="noreferrer">
                              {pokemon.species.name}
                            </a>
                          </dd>
                          {pokemon.genus && (
                            <>
                              <dt>Género</dt>
                              <dd>{pokemon.genus}</dd>
                            </>
                          )}
                          {pokemon.habitat && (
                            <>
                              <dt>Hábitat</dt>
                              <dd>{pokemon.habitat}</dd>
                            </>
                          )}
                          {pokemon.eggGroups && pokemon.eggGroups.length > 0 && (
                            <>
                              <dt>Grupos huevo</dt>
                              <dd>{pokemon.eggGroups.join(', ')}</dd>
                            </>
                          )}
                          {pokemon.captureRate != null && (
                            <>
                              <dt>Tasa de captura</dt>
                              <dd>{pokemon.captureRate}</dd>
                            </>
                          )}
                          {pokemon.baseHappiness != null && (
                            <>
                              <dt>Felicidad base</dt>
                              <dd>{pokemon.baseHappiness}</dd>
                            </>
                          )}
                        </dl>
                      </div>

                      <div>
                        <dl className="detailList">
                          <dt>Altura</dt>
                          <dd>{pokemon.height / 10} m</dd>
                          <dt>Peso</dt>
                          <dd>{pokemon.weight / 10} kg</dd>
                          <dt>Experiencia base</dt>
                          <dd>{pokemon.baseExperience}</dd>
                          {pokemon.gameIndices && pokemon.gameIndices.length > 0 && (
                            <>
                              <dt>Índice en juegos</dt>
                              <dd>
                                {pokemon.gameIndices.map((gi) => `${gi.game} (${gi.index})`).join(', ')}
                              </dd>
                            </>
                          )}
                          {pokemon.cries && (pokemon.cries.latest || pokemon.cries.legacy) && (
                            <>
                              <dt>Gritos</dt>
                              <dd>
                                {pokemon.cries.latest && (
                                  <a href={pokemon.cries.latest} target="_blank" rel="noreferrer">
                                    Latest
                                  </a>
                                )}
                                {pokemon.cries.legacy && (
                                  <span>
                                    {' '}|{' '}
                                    <a href={pokemon.cries.legacy} target="_blank" rel="noreferrer">
                                      Legacy
                                    </a>
                                  </span>
                                )}
                              </dd>
                            </>
                          )}
                        </dl>
                      </div>
                    </div>
                  </article>

                  {pokemon.abilities.length > 0 && (
                    <article className="wikiSection">
                      <h3>Habilidades</h3>
                      <ul className="wikiList">
                        {pokemon.abilities.map((ability) => (
                          <li key={ability.name}>
                            <strong>{ability.name}</strong> {ability.hidden ? '(oculta)' : ''}
                            {ability.effect ? <p className="smallText">{ability.effect}</p> : null}
                          </li>
                        ))}
                      </ul>
                    </article>
                  )}

                  {pokemon.heldItems.length > 0 && (
                    <article className="wikiSection">
                      <h3>Objetos</h3>
                      <ul className="wikiList">
                        {pokemon.heldItems.map((item) => (
                          <li key={item.name}>
                            <strong>{item.name}</strong>
                            {item.effect ? <p className="smallText">{item.effect}</p> : null}
                          </li>
                        ))}
                      </ul>
                    </article>
                  )}
                </>
              )}

              {activeTab === 'stats' && (
                <article className="wikiSection">
                  <h3>Estadísticas</h3>
                  <table className="statsTable">
                    <tbody>
                      {pokemon.stats.map((stat) => (
                        <tr key={stat.name}>
                          <td>{statLabels[stat.name] ?? stat.name}</td>
                          <td>{stat.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </article>
              )}

              {activeTab === 'moves' && (
                <article className="wikiSection">
                  <h3>Movimientos</h3>
                  <div className="moveList">
                    {pokemon.moves.map((move) => (
                      <div key={move.name} className="moveBadge">
                        <strong>{move.name}</strong>
                        <div className="moveMeta">
                          {move.type && <span className="moveMetaItem">{move.type}</span>}
                          {move.category && <span className="moveMetaItem">{move.category}</span>}
                          {move.power != null && <span className="moveMetaItem">PWR: {move.power}</span>}
                          {move.accuracy != null && <span className="moveMetaItem">ACC: {move.accuracy}</span>}
                          {move.pp != null && <span className="moveMetaItem">PP: {move.pp}</span>}
                        </div>
                        {move.effect ? <p className="smallText">{move.effect}</p> : null}
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {activeTab === 'evolution' && pokemon.evolutionChain && pokemon.evolutionChain.length > 0 && (
                <article className="wikiSection">
                  <h3>Evolución</h3>
                  <div className="evolutionChain">
                    {pokemon.evolutionChain.map((stage) => (
                      <Link key={stage.id} to={`/pokemon/${stage.id}`} className="evolutionLink">
                        {stage.name}
                      </Link>
                    ))}
                  </div>
                </article>
              )}

              {activeTab === 'locations' && pokemon.locationEncounters && pokemon.locationEncounters.length > 0 && (
                <article className="wikiSection">
                  <h3>Dónde aparece</h3>
                  <ul className="wikiList">
                    {pokemon.locationEncounters.slice(0, 10).map((loc, index) => (
                      <li key={`${loc.area}-${loc.version}-${index}`}>
                        <strong>{loc.area}</strong> ({loc.version})
                        {loc.method ? ` — ${loc.method}` : ''}
                        {loc.minLevel != null &&
                          ` — Lv. ${loc.minLevel}${loc.maxLevel ? `-${loc.maxLevel}` : ''}`}
                      </li>
                    ))}
                  </ul>
                </article>
              )}
            </section>

            <aside className="wikiSidebar">
              <section className="wikiSection">
                <h3>Ficha</h3>
                <dl className="detailList">
                  <dt>Especie</dt>
                  <dd>
                    <a href={pokemon.species.url} target="_blank" rel="noreferrer">
                      {pokemon.species.name}
                    </a>
                  </dd>
                  {pokemon.genus && (
                    <>
                      <dt>Género</dt>
                      <dd>{pokemon.genus}</dd>
                    </>
                  )}
                  {pokemon.habitat && (
                    <>
                      <dt>Hábitat</dt>
                      <dd>{pokemon.habitat}</dd>
                    </>
                  )}
                  {pokemon.eggGroups && pokemon.eggGroups.length > 0 && (
                    <>
                      <dt>Grupos huevo</dt>
                      <dd>{pokemon.eggGroups.join(', ')}</dd>
                    </>
                  )}
                  {pokemon.captureRate != null && (
                    <>
                      <dt>Tasa de captura</dt>
                      <dd>{pokemon.captureRate}</dd>
                    </>
                  )}
                  {pokemon.baseHappiness != null && (
                    <>
                      <dt>Felicidad base</dt>
                      <dd>{pokemon.baseHappiness}</dd>
                    </>
                  )}
                  <dt>Altura</dt>
                  <dd>{pokemon.height / 10} m</dd>
                  <dt>Peso</dt>
                  <dd>{pokemon.weight / 10} kg</dd>
                  <dt>Experiencia base</dt>
                  <dd>{pokemon.baseExperience}</dd>
                </dl>
              </section>

              {pokemon.abilities.length > 0 && (
                <section className="wikiSection">
                  <h3>Habilidades</h3>
                  <ul className="wikiList">
                    {pokemon.abilities.map((ability) => (
                      <li key={ability.name}>
                        <strong>{ability.name}</strong> {ability.hidden ? '(oculta)' : ''}
                        {ability.effect ? <p className="smallText">{ability.effect}</p> : null}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {pokemon.heldItems.length > 0 && (
                <section className="wikiSection">
                  <h3>Objetos</h3>
                  <ul className="wikiList">
                    {pokemon.heldItems.map((item) => (
                      <li key={item.name}>
                        <strong>{item.name}</strong>
                        {item.effect ? <p className="smallText">{item.effect}</p> : null}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {pokemon.forms && pokemon.forms.length > 0 && (
                <section className="wikiSection">
                  <h3>Formas</h3>
                  <ul className="wikiList">
                    {pokemon.forms.map((form) => (
                      <li key={form.name}>{form.name}</li>
                    ))}
                  </ul>
                </section>
              )}
            </aside>
          </div>
        </section>
      )}
    </main>
  )
}
