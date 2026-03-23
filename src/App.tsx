import { BrowserRouter, NavLink, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Pokedex from './pages/Pokedex'
import PokemonDetail from './pages/PokemonDetail'
import PokeType from './pages/PokeType'
import Auth from './pages/Auth'

import { useEffect, useRef, useState } from 'react'
import { getCurrentUser, onAuthStateChange } from './services/supabase'

export default function App() {
  const auraRef = useRef<HTMLDivElement | null>(null)
  const [user, setUser] = useState<{
    email?: string | null
    user_metadata?: { username?: string | null }
  } | null>(null)

  useEffect(() => {
    let isMounted = true
    async function loadUser() {
      try {
        const current = await getCurrentUser()
        if (isMounted) setUser(current)
      } catch {
        if (isMounted) setUser(null)
      }
    }

    loadUser()
    const cleanup = onAuthStateChange((_event, session) => {
      if (isMounted) setUser(session?.user ?? null)
    })

    return () => {
      isMounted = false
      cleanup()
    }
  }, [])

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
            <NavLink to="/tipos" className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}>
              Tipos
            </NavLink>
            {user ? (
              <span className="navLink" aria-live="polite">
                Hola, {user.user_metadata?.username ?? user.email ?? 'usuario'}
              </span>
            ) : (
              <NavLink to="/auth" className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}>
                Login / Registro
              </NavLink>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pokedex" element={<Pokedex />} />
          <Route path="/pokemon/:id" element={<PokemonDetail />} />
          <Route path="/tipos" element={<PokeType />} />
          <Route path="/auth" element={<Auth />} />
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
