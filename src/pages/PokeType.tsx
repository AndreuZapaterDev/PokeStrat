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
    strong: string[]
    weak: string[]
    resistant: string[]
    immune: string[]
  }
> = {
  normal: {
    strong: [],
    weak: ['rock', 'steel'],
    resistant: ['ghost'],
    immune: ['ghost'],
  },
  fire: {
    strong: ['grass', 'ice', 'bug', 'steel'],
    weak: ['water', 'ground', 'rock'],
    resistant: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
    immune: [],
  },
  water: {
    strong: ['fire', 'ground', 'rock'],
    weak: ['electric', 'grass'],
    resistant: ['fire', 'water', 'ice', 'steel'],
    immune: [],
  },
  electric: {
    strong: ['water', 'flying'],
    weak: ['ground'],
    resistant: ['electric', 'flying', 'steel'],
    immune: [],
  },
  grass: {
    strong: ['water', 'ground', 'rock'],
    weak: ['fire', 'ice', 'poison', 'flying', 'bug'],
    resistant: ['water', 'electric', 'grass', 'ground'],
    immune: [],
  },
  ice: {
    strong: ['grass', 'ground', 'flying', 'dragon'],
    weak: ['fire', 'fighting', 'rock', 'steel'],
    resistant: ['ice'],
    immune: [],
  },
  fighting: {
    strong: ['normal', 'ice', 'rock', 'dark', 'steel'],
    weak: ['flying', 'psychic', 'fairy'],
    resistant: ['bug', 'rock', 'dark'],
    immune: ['ghost'],
  },
  poison: {
    strong: ['grass', 'fairy'],
    weak: ['ground', 'psychic'],
    resistant: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
    immune: [],
  },
  ground: {
    strong: ['fire', 'electric', 'poison', 'rock', 'steel'],
    weak: ['water', 'grass', 'ice'],
    resistant: ['poison', 'rock'],
    immune: ['electric'],
  },
  flying: {
    strong: ['grass', 'fighting', 'bug'],
    weak: ['electric', 'ice', 'rock'],
    resistant: ['grass', 'fighting', 'bug'],
    immune: ['ground'],
  },
  psychic: {
    strong: ['fighting', 'poison'],
    weak: ['bug', 'ghost', 'dark'],
    resistant: ['fighting', 'psychic'],
    immune: [],
  },
  bug: {
    strong: ['grass', 'psychic', 'dark'],
    weak: ['fire', 'flying', 'rock'],
    resistant: ['grass', 'fighting', 'ground'],
    immune: [],
  },
  rock: {
    strong: ['fire', 'ice', 'flying', 'bug'],
    weak: ['water', 'grass', 'fighting', 'ground', 'steel'],
    resistant: ['normal', 'fire', 'poison', 'flying'],
    immune: [],
  },
  ghost: {
    strong: ['psychic', 'ghost'],
    weak: ['ghost', 'dark'],
    resistant: ['poison', 'bug'],
    immune: ['normal', 'fighting'],
  },
  dragon: {
    strong: ['dragon'],
    weak: ['ice', 'dragon', 'fairy'],
    resistant: ['fire', 'water', 'electric', 'grass'],
    immune: [],
  },
  dark: {
    strong: ['psychic', 'ghost'],
    weak: ['fighting', 'bug', 'fairy'],
    resistant: ['ghost', 'dark'],
    immune: ['psychic'],
  },
  steel: {
    strong: ['ice', 'rock', 'fairy'],
    weak: ['fire', 'fighting', 'ground'],
    resistant: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'],
    immune: ['poison'],
  },
  fairy: {
    strong: ['fighting', 'dragon', 'dark'],
    weak: ['poison', 'steel'],
    resistant: ['fighting', 'bug', 'dark'],
    immune: ['dragon'],
  },
}

export default function PokeType() {
  const types = Object.entries(typeLabels)

  const formatTypeList = (items: string[]) => {
    if (!items || items.length === 0) return '—'
    return items.map((type) => typeLabels[type] ?? type).join(', ')
  }

  const [selectedComboTypes, setSelectedComboTypes] = useState<string[]>([])

  const filteredTypes = types

  const getMultiplier = (attackType: string, defenderTypes: string[]) => {
    const attacker = typeEffectiveness[attackType]
    if (!attacker) return 1

    let multiplier = 1
    for (const defType of defenderTypes) {
      if (attacker.immune.includes(defType)) {
        return 0
      }
      if (attacker.strong.includes(defType)) {
        multiplier *= 2
      } else if (attacker.weak.includes(defType) || attacker.resistant.includes(defType)) {
        multiplier *= 0.5
      }
    }
    return multiplier
  }

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

  const comboResult = useMemo(() => {
    const weak: string[] = []
    const resist: string[] = []
    const immune: string[] = []
    const neutral: string[] = []

    if (selectedComboTypes.length !== 2) {
      return { weak, resist, immune, neutral }
    }

    Object.entries(typeLabels).forEach(([defType, defName]) => {
      const multiplier = getMultiplier(defType, selectedComboTypes)
      if (multiplier === 0) {
        immune.push(defName)
      } else if (multiplier === 0.25 || multiplier === 0.5) {
        resist.push(defName)
      } else if (multiplier === 1) {
        neutral.push(defName)
      } else if (multiplier === 2 || multiplier >= 4) {
        weak.push(defName)
      }
    })

    return { weak, resist, immune, neutral }
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

      <section className="typeGrid">
        {selectedComboTypes.length === 2 ? (
          <article className="typeCard combinedCard" style={{ borderColor: 'rgba(255,255,255,0.35)' }}>
            <div className="typeCardHeader" style={dualHeaderStyle}>
              <span className="typeName" style={{ color: '#fff' }}>
                Combinación: {typeLabels[selectedComboTypes[0]]} / {typeLabels[selectedComboTypes[1]]}
              </span>
              <span className="typeKey">Dual</span>
            </div>
            <div className="typeCardBody">
              <div className="typeItem">
                <strong>Debilidades</strong>
                <span>{comboResult.weak.length ? comboResult.weak.join(', ') : 'Ninguna'}</span>
              </div>
              <div className="typeItem">
                <strong>Resistencias</strong>
                <span>{comboResult.resist.length ? comboResult.resist.join(', ') : 'Ninguna'}</span>
              </div>
              <div className="typeItem">
                <strong>Inmunidades</strong>
                <span>{comboResult.immune.length ? comboResult.immune.join(', ') : 'Ninguna'}</span>
              </div>
              <div className="typeItem">
                <strong>Neutral</strong>
                <span>{comboResult.neutral.length ? comboResult.neutral.join(', ') : 'Ninguna'}</span>
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
              <article className="typeCard" style={{ borderColor: `${baseColor}88` }}>
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
                <div className="typeCardBody">
                  <div className="typeItem">
                    <strong>Fuerte contra</strong>
                    <span>{formatTypeList(matched.strong)}</span>
                  </div>
                  <div className="typeItem">
                    <strong>Débil contra</strong>
                    <span>{formatTypeList(matched.weak)}</span>
                  </div>
                  <div className="typeItem">
                    <strong>Resiste a</strong>
                    <span>{formatTypeList(matched.resistant)}</span>
                  </div>
                  <div className="typeItem">
                    <strong>Inmune a</strong>
                    <span>{formatTypeList(matched.immune)}</span>
                  </div>
                </div>
              </article>
            )
          })()
        ) : (
          filteredTypes.map(([typeKey, typeName]) => {
            const matched = typeEffectiveness[typeKey]
            const baseColor = typeColors[typeKey] ?? '#A8A77A'
            return (
              <article key={typeKey} className="typeCard" style={{ borderColor: `${baseColor}88` }}>
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
                <div className="typeCardBody">
                  <div className="typeItem">
                    <strong>Fuerte contra</strong>
                    <span>{formatTypeList(matched.strong)}</span>
                  </div>
                  <div className="typeItem">
                    <strong>Débil contra</strong>
                    <span>{formatTypeList(matched.weak)}</span>
                  </div>
                  <div className="typeItem">
                    <strong>Resiste a</strong>
                    <span>{formatTypeList(matched.resistant)}</span>
                  </div>
                  <div className="typeItem">
                    <strong>Inmune a</strong>
                    <span>{formatTypeList(matched.immune)}</span>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </section>
    </main>
  )
}
