import type { Pokemon } from '../types/pokemon'
import { Link } from 'react-router-dom'
import './PokemonCard.css'

interface Props {
  pokemon: Pokemon
}

export default function PokemonCard({ pokemon }: Props) {
  const typeColorMap: Record<string,string> = {
    fire:'#fddfdf',
    water:'#def3fd',
    grass:'#defde0',
    electric:'#fcf7de',
    psychic:'#eaeda1',
    ice:'#e0f5ff',
    dragon:'#97b3e6',
    dark:'#dcdcdc',
    fairy:'#fceaff',
    normal:'#f5f5f5',
    rock:'#d5d5d4',
    ground:'#f4e7da',
    poison:'#f5e0ff',
    bug:'#f0f9e4',
    ghost:'#dfd3ff',
    steel:'#f4f4f4',
    fighting:'#f5f5f5',
    flying:'#e6f0ff',
  };
  const primaryType = pokemon.types[0]?.type.name || '';
  const bgColor = typeColorMap[primaryType] || '#d3d3d3';

  return (
    <li>
      <Link to={`/pokedex/${pokemon.name}`} className="pokemon-card" style={{ '--screen-bg': bgColor } as any}>
        <span className="pokedex-number">#{pokemon.id.toString().padStart(3, '0')}</span>
        {/* speaker grill at top */}
        <div className="gb-speaker" />
        {/* directional pad */}
        <div className="gb-dpad" />
        {/* action buttons */}
        <div className="gb-buttons">
          <div className="btn a">A</div>
          <div className="btn b">B</div>
        </div>
        <div className="gb-screen">
          <img src={pokemon.sprites.front_default || ''} alt={pokemon.name} />
          <span className="name">{pokemon.name}</span>
          <div className="types">
            {pokemon.types.map(t => (
              <span key={t.slot} className={`type-badge type-${t.type.name}`}>
                {t.type.name}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </li>
  )
}
