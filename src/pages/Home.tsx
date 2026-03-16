import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <h1>Bienvenido a PokeStrat</h1>
        <p>
          Explora la Pokédex y descubre información básica de los Pokémon disponibles en la
          PokéAPI.
        </p>
        <Link className="button" to="/pokedex">
          Ir a la Pokédex
        </Link>
      </section>

      <section className="notes">
        <h2>¿Qué puedes hacer?</h2>
        <ul>
          <li>Ver los primeros 151 Pokémon con su imagen y nombre.</li>
          <li>Buscar rápidamente por nombre.</li>
          <li>Navegar entre las páginas usando la barra de navegación.</li>
        </ul>
      </section>
    </main>
  )
}
