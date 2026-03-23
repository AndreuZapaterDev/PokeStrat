import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import './PokemonDetail.css'
import { fetchPokemonDetail, getPokemonSpriteUrl, getPokemonIdFromUrl } from '../services/pokeapi'
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

const statLabels: Record<string, string> = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Ataque especial',
  'special-defense': 'Defensa especial',
  speed: 'Velocidad',
}

const MAX_STAT = 255
const MAX_TOTAL_STATS = 780

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

function formatLocationArea(area?: string): string {
  if (!area) return 'Desconocido'
  return area.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatLocationVersion(version?: string): string {
  if (!version) return 'Desconocida'
  return version.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatLocationMethod(method?: string): string {
  if (!method) return 'Desconocido'
  const mapping: Record<string, string> = {
    walk: 'Caminar',
    surf: 'Surf',
    fish: 'Pescar',
    unspecified: 'No especificado',
  }
  return mapping[method.toLowerCase()] ?? method.replace(/[-_]/g, ' ')
}

export default function PokemonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'stats' | 'moves' | 'evolution' | 'locations'>('stats')

  const evolutionChain = pokemon?.evolutionChain ?? []

  const megaForms = useMemo(() => {
    if (!pokemon?.forms) return []
    return pokemon.forms.filter((form) => form.name?.toLowerCase().includes('mega'))
  }, [pokemon?.forms])

  const evolutionTree = useMemo(() => {
    if (evolutionChain.length === 0) return null

    const root = evolutionChain.find((s) => !s.parentId) ?? evolutionChain[0]
    const stage1 = evolutionChain.filter((s) => s.parentId === root.id)
    const stage2 = stage1.length === 1 ? evolutionChain.filter((s) => s.parentId === stage1[0].id) : []

    return { root, stage1, stage2 }
  }, [evolutionChain])

  const tabs = [
    { key: 'stats', label: 'Estadísticas' },
    { key: 'moves', label: 'Movimientos' },
    { key: 'evolution', label: 'Evolución' },
    { key: 'locations', label: 'Dónde aparece' },
  ] as const

  useEffect(() => {
    if (!id) return

    const pokemonId = id
    let isCancelled = false

    async function loadPokemon() {
      setLoading(true)
      setError(null)
      setPokemon(null)

      try {
        const data = await fetchPokemonDetail(pokemonId)
        if (!isCancelled) setPokemon(data)
      } catch (err) {
        if (!isCancelled) setError((err as Error)?.message ?? 'No se pudo cargar el Pokémon')
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    loadPokemon()

    return () => {
      isCancelled = true
    }
  }, [id])

  return (
    <main className="page">
      <header className="pageHeader">
        <h1>Detalles</h1>
        <Link className="button secondary" to="/pokedex">
          Volver a la Pokédex
        </Link>
      </header>

      {loading && <LoadingSpinner label="Cargando datos" />}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && pokemon && (
        <section className="detail wiki">
          <header className="detailHeader wikiHeader">
            <div className="detailMeta">
              <h2>{pokemon.name}</h2>
              <span className="badge">#{pokemon.id.toString().padStart(3, '0')}</span>
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

              <div className="detailQuick">
                <div className="detailQuickItem">
                  <span className="detailQuickLabel">Altura</span>
                  <span className="detailQuickValue">{pokemon.height / 10} m</span>
                </div>
                <div className="detailQuickItem">
                  <span className="detailQuickLabel">Peso</span>
                  <span className="detailQuickValue">{pokemon.weight / 10} kg</span>
                </div>
                <div className="detailQuickItem">
                  <span className="detailQuickLabel">Exp base</span>
                  <span className="detailQuickValue">{pokemon.baseExperience}</span>
                </div>
              </div>
            </div>

            <div className="detailImageWrapper">
              <img
                className="detailSprite"
                src={pokemon.spriteUrl}
                alt={pokemon.name}
                width={260}
                height={260}
                loading="lazy"
              />
            </div>
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

              {activeTab === 'stats' && (
                <article className="wikiSection">
                  <h3>Estadísticas</h3>
                  <div className="statSummary">
                    <div>
                      <strong>Total base</strong>: {pokemon.stats.reduce((sum, stat) => sum + stat.value, 0)} / {MAX_TOTAL_STATS}
                    </div>
                    <div>
                      <strong>Promedio</strong>: {Math.round(pokemon.stats.reduce((sum, stat) => sum + stat.value, 0) / pokemon.stats.length)}
                    </div>
                  </div>
                  <div className="statsGrid">
                    {pokemon.stats.map((stat) => {
                      const value = stat.value
                      const percent = Math.min(100, Math.round((value / MAX_STAT) * 100))
                      let barColor = '#E74C3C'
                      if (value >= 49) barColor = '#F1C40F'
                      if (value > 99) barColor = '#2ECC71'

                      return (
                        <div key={stat.name} className="statRow">
                          <div className="statHeader">
                            <span className="statName">{statLabels[stat.name] ?? stat.name}</span>
                            <span className="statValue">{value} ({percent}%)</span>
                          </div>
                          <div className="statBar" style={{ backgroundColor: '#ddd' }}>
                            <div
                              className="statFill"
                              style={{
                                width: `${percent}%`,
                                background: barColor,
                                boxShadow: `0 0 6px ${barColor}`,
                              }}
                            />
                          </div>
                          <div className="statDesc">
                            {value <= 49 ? 'Débil' : value <= 99 ? 'Medio' : 'Fuerte'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </article>
              )}

              {activeTab === 'moves' && (
                <article className="wikiSection">
                  {['level-up', 'machine', 'tutor', 'egg', 'trade', 'unknown'].map((groupMethod) => {
                    const group = pokemon.moves.filter((move) => (move.method ?? 'unknown') === groupMethod)
                    if (group.length === 0) return null

                    const titleMap: Record<string, string> = {
                      'level-up': 'Por nivel',
                      machine: 'Por MT/MO',
                      tutor: 'Por profesor',
                      egg: 'Por huevo',
                      trade: 'Por intercambio',
                      unknown: 'Otros',
                    }

                    return (
                      <div key={groupMethod} className="moveGroup">
                        <h4 className="moveGroupTitle">{titleMap[groupMethod]}</h4>
                        <ul className="moveList">
                          {group.map((move) => {
                            const moveType = move.type || 'normal'
                            const baseColor = typeColors[moveType] || '#A8A77A'
                            return (
                              <li
                                key={`${move.name}-${move.power ?? 'x'}-${move.accuracy ?? 'x'}-${move.pp ?? 'x'}`}
                                className="moveItem"
                                style={{
                                  borderColor: `${baseColor}bb`,
                                  background: `linear-gradient(145deg, ${baseColor}22, ${baseColor}10)`,
                                }}
                              >
                                <div className="moveTitle">
                                  <div className="moveInfo">
                                    <strong style={{ color: baseColor }}>{move.name}</strong>
                                    <div className="moveMeta">
                                      {move.category && <span className="moveMetaItem">{move.category}</span>}
                                      {move.level != null && move.level > 0 && (
                                        <span className="moveMetaItem">Lv: {move.level}</span>
                                      )}
                                      {move.method && (
                                        <span className="moveMetaItem">{localizeMoveMethod(move.method)}</span>
                                      )}
                                      {move.power != null && <span className="moveMetaItem">PWR: {move.power}</span>}
                                      {move.accuracy != null && <span className="moveMetaItem">ACC: {move.accuracy}</span>}
                                      {move.pp != null && <span className="moveMetaItem">PP: {move.pp}</span>}
                                    </div>
                                  </div>
                                  {move.type && (
                                    <span
                                      className="moveType"
                                      style={{
                                        background: `${baseColor}dd`,
                                        borderColor: baseColor,
                                      }}
                                    >
                                      {typeLabels[move.type] ?? move.type}
                                    </span>
                                  )}
                                </div>
                                {move.effect ? <p className="smallText">{move.effect}</p> : null}
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )
                  })}
                </article>
              )}

              {activeTab === 'evolution' && (
                <article className='wikiSection'>
                  <h3>Evolución</h3>
                  {!evolutionTree ? (
                    <p>Este Pokémon no tiene cadena de evolución conocida.</p>
                  ) : (
                    <div className='evolutionColumn'>
                      {/* Root */}
                      <div className='evolutionStageBlock'>
                        <div className='evolutionCardColumn'>
                          <Link to={`/pokemon/${evolutionTree.root.id}`} className='evolutionImageLink'>
                            <img
                              src={getPokemonSpriteUrl(evolutionTree.root.id)}
                              alt={evolutionTree.root.name}
                              width={100}
                              height={100}
                              className='evolutionImage'
                              loading='lazy'
                            />
                          </Link>
                          <div className='evolutionInfo'>
                            <strong>{evolutionTree.root.name}</strong>
                            <span className='evolutionMeta'>Origen</span>
                          </div>
                        </div>
                      </div>

                      {/* Stage 1 or root to children */}
                      {evolutionTree.stage1.length === 1 ? (
                        <>
                          <div className='evolutionArrowDown' role='presentation'>↓</div>
                          <div className='evolutionStageBlock'>
                            <div className='evolutionCardColumn'>
                              <Link to={`/pokemon/${evolutionTree.stage1[0].id}`} className='evolutionImageLink'>
                                <img
                                  src={getPokemonSpriteUrl(evolutionTree.stage1[0].id)}
                                  alt={evolutionTree.stage1[0].name}
                                  width={100}
                                  height={100}
                                  className='evolutionImage'
                                  loading='lazy'
                                />
                              </Link>
                              <div className='evolutionInfo'>
                                <strong>{evolutionTree.stage1[0].name}</strong>
                                <span className='evolutionMeta'>{evolutionTree.stage1[0].trigger ?? (evolutionTree.stage1[0].level ? `Lv. ${evolutionTree.stage1[0].level}` : 'Evolución')}</span>
                              </div>
                            </div>
                          </div>

                          {evolutionTree.stage2.length > 0 && (
                            <>
                              <div className='evolutionArrowDown' role='presentation'>↓</div>
                              <div className='evolutionBranch'>
                                {evolutionTree.stage2.map((stage) => (
                                  <div key={stage.id} className='evolutionCardColumn'>
                                    <Link to={`/pokemon/${stage.id}`} className='evolutionImageLink'>
                                      <img
                                        src={getPokemonSpriteUrl(stage.id)}
                                        alt={stage.name}
                                        width={100}
                                        height={100}
                                        className='evolutionImage'
                                        loading='lazy'
                                      />
                                    </Link>
                                    <div className='evolutionInfo'>
                                      <strong>{stage.name}</strong>
                                      <span className='evolutionMeta'>{stage.trigger ?? (stage.level ? `Lv. ${stage.level}` : 'Evolución')}</span>
                                      {stage.itemSprite && (
                                        <img
                                          className='evolutionItemIcon'
                                          src={stage.itemSprite}
                                          alt={stage.itemName ?? 'Objeto de evolución'}
                                          width={24}
                                          height={24}
                                          loading='lazy'
                                        />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className='evolutionBranch'>
                          {evolutionTree.stage1.map((stage) => (
                            <div key={stage.id} className='evolutionCardColumn'>
                              <Link to={`/pokemon/${stage.id}`} className='evolutionImageLink'>
                                <img
                                  src={getPokemonSpriteUrl(stage.id)}
                                  alt={stage.name}
                                  width={100}
                                  height={100}
                                  className='evolutionImage'
                                  loading='lazy'
                                />
                              </Link>
                              <div className='evolutionInfo'>
                                <strong>{stage.name}</strong>
                                <span className='evolutionMeta'>{stage.trigger ?? (stage.level ? `Lv. ${stage.level}` : 'Evolución')}</span>
                                {stage.itemSprite && (
                                  <img
                                    className='evolutionItemIcon'
                                    src={stage.itemSprite}
                                    alt={stage.itemName ?? 'Objeto de evolución'}
                                    width={24}
                                    height={24}
                                    loading='lazy'
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {megaForms.length > 0 && (
                        <div className='evolutionMegaSection'>
                          <h4>Mega Evoluciones</h4>
                          <div className='evolutionBranch'>
                            {megaForms.map((form) => {
                              const formId = getPokemonIdFromUrl(form.url)
                              return (
                                <div key={form.name} className='evolutionCardColumn'>
                                  <Link to={`/pokemon/${form.name}`} className='evolutionImageLink'>
                                    <img
                                      src={getPokemonSpriteUrl(formId || 0)}
                                      alt={form.name}
                                      width={100}
                                      height={100}
                                      className='evolutionImage'
                                      loading='lazy'
                                    />
                                  </Link>
                                  <div className='evolutionInfo'>
                                    <strong>{form.name.replace(/-/g, ' ')}</strong>
                                    <span className='evolutionMeta'>Mega</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              )}

              {activeTab === 'locations' && pokemon.locationEncounters && pokemon.locationEncounters.length > 0 && (
                <article className="wikiSection">
                  <h3>Dónde aparece</h3>
                  <p className="smallText">Se han encontrado {pokemon.locationEncounters.length} ubicaciones.</p>
                  <div className="locationGrid">
                    {pokemon.locationEncounters.map((loc, index) => (
                      <div key={`${loc.area}-${loc.version}-${index}`} className="locationCard">
                        <div className="locationHeader">
                          <strong>{formatLocationArea(loc.area)}</strong>
                          <span className="locationVersion">{formatLocationVersion(loc.version)}</span>
                        </div>
                        <p className="locationMeta">
                          Método: {formatLocationMethod(loc.method)}
                        </p>
                        <p className="locationMeta">
                          Nivel: {loc.minLevel != null ? loc.minLevel : '?'}{loc.maxLevel ? ` - ${loc.maxLevel}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              )}
            </section>

            <aside className="wikiSidebar">
              {pokemon.description && (
                <section className="wikiSection">
                  <h3>Descripción</h3>
                  <p>{pokemon.description}</p>
                </section>
              )}
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

            </aside>
          </div>
        </section>
      )}
    </main>
  )
}
