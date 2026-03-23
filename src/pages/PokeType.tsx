import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './PokeType.css'

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

const typeEffectiveness: Record<
  string,
  {
    ataqueX2: string[]
    ataqueX0_5: string[]
    ataqueX0: string[]
    defensaX2: string[]
    defensaX0_5: string[]
    defensaX0: string[]
  }
> = {
  normal:{ataqueX2:[],ataqueX0_5:['rock','steel'],ataqueX0:['ghost'],defensaX2:['fighting'],defensaX0_5:[],defensaX0:['ghost']},
  fire:{ataqueX2:['grass','ice','bug','steel'],ataqueX0_5:['fire','water','rock','dragon'],ataqueX0:[],defensaX2:['water','ground','rock'],defensaX0_5:['fire','grass','ice','bug','steel','fairy'],defensaX0:[]},
  water:{ataqueX2:['fire','ground','rock'],ataqueX0_5:['water','grass','dragon'],ataqueX0:[],defensaX2:['electric','grass'],defensaX0_5:['fire','water','ice','steel'],defensaX0:[]},
  electric:{ataqueX2:['water','flying'],ataqueX0_5:['electric','grass','dragon'],ataqueX0:['ground'],defensaX2:['ground'],defensaX0_5:['electric','flying','steel'],defensaX0:[]},
  grass:{ataqueX2:['water','ground','rock'],ataqueX0_5:['fire','grass','poison','flying','bug','dragon','steel'],ataqueX0:[],defensaX2:['fire','ice','poison','flying','bug'],defensaX0_5:['water','electric','grass','ground'],defensaX0:[]},
  ice:{ataqueX2:['grass','ground','flying','dragon'],ataqueX0_5:['fire','water','ice','steel'],ataqueX0:[],defensaX2:['fire','fighting','rock','steel'],defensaX0_5:['ice'],defensaX0:[]},
  fighting:{ataqueX2:['normal','ice','rock','dark','steel'],ataqueX0_5:['poison','flying','psychic','bug','fairy'],ataqueX0:['ghost'],defensaX2:['flying','psychic','fairy'],defensaX0_5:['bug','rock','dark'],defensaX0:[]},
  poison:{ataqueX2:['grass','fairy'],ataqueX0_5:['poison','ground','rock','ghost'],ataqueX0:['steel'],defensaX2:['ground','psychic'],defensaX0_5:['grass','fighting','poison','bug','fairy'],defensaX0:[]},
  ground:{ataqueX2:['fire','electric','poison','rock','steel'],ataqueX0_5:['grass','bug'],ataqueX0:['flying'],defensaX2:['water','grass','ice'],defensaX0_5:['poison','rock'],defensaX0:['electric']},
  flying:{ataqueX2:['grass','fighting','bug'],ataqueX0_5:['electric','rock','steel'],ataqueX0:[],defensaX2:['electric','ice','rock'],defensaX0_5:['grass','fighting','bug'],defensaX0:['ground']},
  psychic:{ataqueX2:['fighting','poison'],ataqueX0_5:['psychic','steel'],ataqueX0:['dark'],defensaX2:['bug','ghost','dark'],defensaX0_5:['fighting','psychic'],defensaX0:[]},
  bug:{ataqueX2:['grass','psychic','dark'],ataqueX0_5:['fire','fighting','poison','flying','ghost','steel','fairy'],ataqueX0:[],defensaX2:['fire','flying','rock'],defensaX0_5:['grass','fighting','ground'],defensaX0:[]},
  rock:{ataqueX2:['fire','ice','flying','bug'],ataqueX0_5:['fighting','ground','steel'],ataqueX0:[],defensaX2:['water','grass','fighting','ground','steel'],defensaX0_5:['normal','fire','poison','flying'],defensaX0:[]},
  ghost:{ataqueX2:['psychic','ghost'],ataqueX0_5:['dark'],ataqueX0:['normal'],defensaX2:['ghost','dark'],defensaX0_5:['poison','bug'],defensaX0:['normal','fighting']},
  dragon:{ataqueX2:['dragon'],ataqueX0_5:['steel'],ataqueX0:['fairy'],defensaX2:['ice','dragon','fairy'],defensaX0_5:['fire','water','electric','grass'],defensaX0:[]},
  dark:{ataqueX2:['psychic','ghost'],ataqueX0_5:['fighting','dark','fairy'],ataqueX0:[],defensaX2:['fighting','bug','fairy'],defensaX0_5:['ghost','dark'],defensaX0:['psychic']},
  steel:{ataqueX2:['ice','rock','fairy'],ataqueX0_5:['fire','water','electric','steel'],ataqueX0:[],defensaX2:['fire','fighting','ground'],defensaX0_5:['normal','grass','ice','flying','psychic','bug','rock','dragon','steel','fairy'],defensaX0:['poison']},
  fairy:{ataqueX2:['fighting','dragon','dark'],ataqueX0_5:['fire','poison','steel'],ataqueX0:[],defensaX2:['poison','steel'],defensaX0_5:['fighting','bug','dark'],defensaX0:['dragon']}
}


export default function PokeType() {

  const formatTypeList = (items: string[]) => {
    if (!items || items.length === 0) return '—'
    return items.map((type) => typeLabels[type] ?? type).join(', ')
  }

  const [selectedComboTypes, setSelectedComboTypes] = useState<string[]>([])

  const getMultiplier = (attackType: string, defenderTypes: string[]) => {
    const attacker = typeEffectiveness[attackType]
    if (!attacker) return 1

    let multiplier = 1

    for (const defType of defenderTypes) {
      if (attacker.ataqueX0.includes(defType)) return 0
      if (attacker.ataqueX2.includes(defType)) multiplier *= 2
      else if (attacker.ataqueX0_5.includes(defType)) multiplier *= 0.5
    }

    return multiplier
  }

  type MultiplierMap = {
    x0: string[]
    x05: string[]
    x1: string[]
    x2: string[]
  }

  const typesKeys = Object.keys(typeEffectiveness)

  const getAttackEffectiveness = (type: string): MultiplierMap => {
    const data = typeEffectiveness[type]

    const x0 = [...data.ataqueX0]
    const x2 = [...data.ataqueX2]
    const x05 = [...data.ataqueX0_5]

    const x1 = typesKeys.filter(
      (t) => !x0.includes(t) && !x2.includes(t) && !x05.includes(t)
    )

    return { x0, x05, x1, x2 }
  }

  const getDefenseEffectiveness = (type: string): MultiplierMap => {
    const data = typeEffectiveness[type]

    const x0 = [...data.defensaX0]
    const x2 = [...data.defensaX2]
    const x05 = [...data.defensaX0_5]

    const x1 = typesKeys.filter(
      (t) => !x0.includes(t) && !x2.includes(t) && !x05.includes(t)
    )

    return { x0, x05, x1, x2 }
  }

  const effectivenessSummary = useMemo(() => {
    const summary: Record<string, { attacking: MultiplierMap; defending: MultiplierMap }> = {}
    typesKeys.forEach((type) => {
      summary[type] = {
        attacking: getAttackEffectiveness(type),
        defending: getDefenseEffectiveness(type),
      }
    })
    return summary
  }, [])

  type MultiplierBuckets = {
    x0: string[]
    x025: string[]
    x05: string[]
    x1: string[]
    x2: string[]
    x4: string[]
  }

  const bucketize = (buckets: MultiplierBuckets, label: string, multiplier: number) => {
    if (multiplier <= 0) buckets.x0.push(label)
    else if (multiplier === 0.25) buckets.x025.push(label)
    else if (multiplier === 0.5) buckets.x05.push(label)
    else if (multiplier === 1) buckets.x1.push(label)
    else if (multiplier === 2) buckets.x2.push(label)
    else if (multiplier >= 4) buckets.x4.push(label)
  }

  const defenseResult = useMemo(() => {
    const buckets: MultiplierBuckets = {
      x0: [],
      x025: [],
      x05: [],
      x1: [],
      x2: [],
      x4: [],
    }

    if (selectedComboTypes.length === 0) return buckets

    const attackTypes = Object.keys(typeLabels)
    attackTypes.forEach((attackType) => {
      const multiplier = getMultiplier(attackType, selectedComboTypes)
      bucketize(buckets, typeLabels[attackType] ?? attackType, multiplier)
    })

    return buckets
  }, [selectedComboTypes])

  const offenseResult = useMemo(() => {
    const buckets: MultiplierBuckets = {
      x0: [],
      x025: [],
      x05: [],
      x1: [],
      x2: [],
      x4: [],
    }

    if (selectedComboTypes.length !== 2) return buckets

    const allTypes = Object.keys(typeLabels)
    allTypes.forEach((defType) => {
      const label = typeLabels[defType] ?? defType
      let best = 0
      selectedComboTypes.forEach((atkType) => {
        const m = getMultiplier(atkType, [defType])
        if (m > best) best = m
      })
      bucketize(buckets, label, best)
    })

    return buckets
  }, [selectedComboTypes])

  const dualHeaderStyle = selectedComboTypes.length === 2
    ? {
        background: `linear-gradient(to right, ${typeColors[selectedComboTypes[0]] ?? '#A8A77A'}CC 0%, ${typeColors[selectedComboTypes[1]] ?? '#A8A77A'}CC 100%)`,
        borderBottom: `2px solid transparent`,
        backgroundImage: `linear-gradient(to right, ${typeColors[selectedComboTypes[0]] ?? '#A8A77A'}CC 0%, ${typeColors[selectedComboTypes[1]] ?? '#A8A77A'}CC 100%)`,
        backgroundClip: 'padding-box',
      }
    : {
        background: 'linear-gradient(135deg, rgba(194, 105, 255, 0.92) 0%, rgba(80, 143, 255, 0.72) 100%)',
        borderBottom: '2px solid rgba(255,255,255,0.28)',
      }

  return (
    <main className="page">
      <header className="pageHeader">
        <h1>Tabla de Tipos</h1>
        <Link className="button secondary" to="/pokedex">
          Volver a Pokédex
        </Link>
      </header>

      <section className="filterZone">
        <div className="filterHeader" />


        <div className="comboChipList">
          {Object.entries(typeLabels).map(([typeKey, typeName]) => {
            const active = selectedComboTypes.includes(typeKey)
            const color = typeColors[typeKey] ?? '#A8A77A'
            return (
              <button
                key={typeKey}
                type="button"
                className={`comboChip ${active ? 'active' : ''}`}
                onClick={() => {
                  setSelectedComboTypes((prev) => {
                    if (prev.includes(typeKey)) return prev.filter((t) => t !== typeKey)
                    if (prev.length >= 2) return prev
                    return [...prev, typeKey]
                  })
                }}
                style={{
                  borderColor: active ? color : 'rgba(255,255,255,0.2)',
                  background: active ? `${color}aa` : 'rgba(255,255,255,0.08)',
                  color: active ? '#fff' : '#d6e5ff',
                }}
              >
                {typeName}
              </button>
            )
          })}
        </div>

      </section>

      <div style={{ display: 'none' }}>{JSON.stringify(effectivenessSummary)}</div>

      <section className="typeGrid">
        {selectedComboTypes.length === 2 ? (
          <article className="typeCard combinedCard" style={{ borderColor: 'rgba(255,255,255,0.35)' }}>
            <div className="typeCardHeader" style={dualHeaderStyle}>
              <span className="typeName" style={{ color: '#fff' }}>
                Combinación: {typeLabels[selectedComboTypes[0]]} / {typeLabels[selectedComboTypes[1]]}
              </span>
              <span className="typeKey">Dual</span>
            </div>
            <div className="typeCardBody twoCols">
              <div className="typeSection">
                <div className="typeSectionTitle">Ataque</div>
                <div className="typeItem">
                  <strong>Eficaz</strong>
                  <span><span className="multiplierBadge multiplier-x2">x2</span>{offenseResult.x2.length ? offenseResult.x2.join(', ') : 'Ninguna'}</span>
                </div>
                <div className="typeItem">
                  <strong>Neutro</strong>
                  <span><span className="multiplierBadge multiplier-x1">x1</span>{offenseResult.x1.length ? offenseResult.x1.join(', ') : 'Ninguna'}</span>
                </div>
                <div className="typeItem">
                  <strong>Poco eficaz</strong>
                  <span><span className="multiplierBadge multiplier-x05">x0.5</span>{offenseResult.x05.length ? offenseResult.x05.join(', ') : 'Ninguna'}</span>
                </div>
                <div className="typeItem">
                  <strong>Inmune</strong>
                  <span><span className="multiplierBadge multiplier-x0">x0</span>{offenseResult.x0.length ? offenseResult.x0.join(', ') : 'Ninguna'}</span>
                </div>
              </div>
              <div className="typeSection">
                <div className="typeSectionTitle">Defensa</div>
                <div className="typeItem">
                  <strong>Eficaz</strong>
                  <span><span className="multiplierBadge multiplier-x2">x2</span>{offenseResult.x2.length ? offenseResult.x2.join(', ') : 'Ninguna'}</span>
                </div>
                <div className="typeItem">
                  <strong>Neutro</strong>
                  <span><span className="multiplierBadge multiplier-x1">x1</span>{offenseResult.x1.length ? offenseResult.x1.join(', ') : 'Ninguna'}</span>
                </div>
                <div className="typeItem">
                  <strong>Poco eficaz</strong>
                  <span><span className="multiplierBadge multiplier-x05">x0.5</span>{offenseResult.x05.length ? offenseResult.x05.join(', ') : 'Ninguna'}</span>
                </div>
                <div className="typeItem">
                  <strong>Inmune</strong>
                  <span><span className="multiplierBadge multiplier-x0">x0</span>{offenseResult.x0.length ? offenseResult.x0.join(', ') : 'Ninguna'}</span>
                </div>
              </div>
            </div>
          </article>
        ) : selectedComboTypes.length === 1 ? (
          (() => {
            const typeKey = selectedComboTypes[0]
            const typeName = typeLabels[typeKey]
            const matched = typeEffectiveness[typeKey]
            const baseColor = typeColors[typeKey] ?? '#A8A77A'
            return (
              <article className="typeCard singleTypeCard" style={{ borderColor: `${baseColor}AF` }}>
                <div
                  className="typeCardHeader"
                  style={{
                    background: `linear-gradient(135deg, ${baseColor}bb 0%, ${baseColor}55 100%)`,
                    borderBottom: `2px solid ${baseColor}`,
                  }}
                >
                  <span className="typeName">{typeName}</span>
                  <span className="typeKey">{typeKey}</span>
                </div>
                <div className="typeCardBody twoCols">
                  <div className="typeSection">
                    <div className="typeSectionTitle">Ataque</div>
                    <div className="typeItem">
                      <strong>Eficaz:</strong>
                      <span><span className="multiplierBadge multiplier-x2">x2</span>{formatTypeList(matched.ataqueX2)}</span>
                    </div>
                    <div className="typeItem">
                      <strong>Poco eficaz:</strong>
                      <span><span className="multiplierBadge multiplier-x05">x0.5</span>{formatTypeList(matched.ataqueX0_5)}</span>
                    </div>
                    <div className="typeItem">
                      <strong>Inmune:</strong>
                      <span><span className="multiplierBadge multiplier-x0">x0</span>{formatTypeList(matched.ataqueX0)}</span>
                    </div>
                  </div>
                  <div className="typeSection">
                    <div className="typeSectionTitle">Defensa</div>
                    <div className="typeItem">
                      <strong>Débil:</strong>
                      <span><span className="multiplierBadge multiplier-x2">x2</span>{formatTypeList(matched.defensaX2)}</span>
                    </div>
                    <div className="typeItem">
                      <strong>Resiste:</strong>
                      <span><span className="multiplierBadge multiplier-x05">x0.5</span>{formatTypeList(matched.defensaX0_5)}</span>
                    </div>
                    <div className="typeItem">
                      <strong>Inmune:</strong>
                      <span><span className="multiplierBadge multiplier-x0">x0</span>{formatTypeList(matched.defensaX0)}</span>
                    </div>
                  </div>
                </div>
              </article>
            )
          })()
        ) : selectedComboTypes.length === 0 ? (
          <div className="typeCard noSelection">
            <div className="typeCardBody">
              <p>Selecciona al menos un tipo de Pokémon para ver su tabla de ataque/defensa.</p>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}
