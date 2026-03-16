import { BrowserRouter, NavLink, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Pokedex from './pages/Pokedex'
import PokemonDetail from './pages/PokemonDetail'

import { useEffect, useRef } from 'react'

export default function App() {
  const auraRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (!auraRef.current) return
      const { clientX: x, clientY: y } = event
      auraRef.current.style.left = `${x}px`
      auraRef.current.style.top = `${y}px`
    }

    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  return (
    <BrowserRouter>
      <div className="app">
        <div ref={auraRef} className="mouseAura" />
        <nav className="topNav">
          <div className="brand">PokeStrat</div>
          <div className="navLinks">
            <NavLink to="/pokedex" className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}>
              Pokédex
            </NavLink>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pokedex" element={<Pokedex />} />
          <Route path="/pokemon/:id" element={<PokemonDetail />} />
          <Route path="*" element={<Home />} />
        </Routes>

        <footer className="footer">
          <span>
            Datos de <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a>
          </span>
        </footer>
      </div>
    </BrowserRouter>
  )
}
