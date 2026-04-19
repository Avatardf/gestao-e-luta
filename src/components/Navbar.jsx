import { useState, useEffect } from 'react'
import { Menu, X, Sun, Moon, Eye } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'

const links = [
  { href: '#sobre',      label: 'Sobre',      page: true },
  { href: '#diretores',  label: 'Diretores',  page: true },
  { href: '/propostas',  label: 'Propostas',  page: false },
  { href: '/kit',        label: 'Kit',        page: false },
  { href: '#votacao',    label: 'Vote Agora', page: true },
  { href: '#contato',    label: 'Contato',    page: true },
]

export default function Navbar() {
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [visitors, setVisitors] = useState(null)
  const { dark, toggle }        = useTheme()
  const location                = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    supabase
      .from('visits')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => { if (count !== null) setVisitors(count) })
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 dark:bg-navy-950/95 backdrop-blur shadow-lg shadow-black/10 dark:shadow-black/50'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-gold-500 flex items-center justify-center">
                <span className="text-navy-950 font-heading font-bold text-xs">GL</span>
              </div>
              <span className="font-heading text-slate-900 dark:text-white tracking-widest text-sm hidden sm:block">
                GESTÃO <span className="text-gold-500">&</span> LUTA
              </span>
            </Link>

            {/* Contador de visitantes */}
            {visitors !== null && (
              <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-300 dark:border-navy-700 pl-4">
                <Eye size={11} className="text-gold-500/70" />
                <span className="font-heading text-[10px] tracking-widest text-slate-500 dark:text-gray-500 tabular-nums">
                  {visitors.toLocaleString('pt-BR')}
                </span>
              </div>
            )}
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) =>
              l.page ? (
                <a
                  key={l.href}
                  href={location.pathname === '/' ? l.href : `/${l.href}`}
                  className={`font-heading text-xs uppercase tracking-widest transition-colors duration-200 ${
                    l.label === 'Vote Agora'
                      ? 'text-gold-500 hover:text-gold-400'
                      : 'text-slate-600 dark:text-gray-300 hover:text-gold-500 dark:hover:text-gold-500'
                  }`}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.href}
                  to={l.href}
                  className="font-heading text-xs uppercase tracking-widest transition-colors duration-200 text-slate-600 dark:text-gray-300 hover:text-gold-500 dark:hover:text-gold-500"
                >
                  {l.label}
                </Link>
              )
            )}

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-500 transition-colors"
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
              <span className="font-heading text-xs tracking-widest uppercase">
                {dark ? 'Claro' : 'Escuro'}
              </span>
            </button>
          </div>

          {/* Mobile buttons */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggle}
              className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 hover:text-gold-500 transition-colors"
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
              <span className="font-heading text-xs tracking-widest uppercase">
                {dark ? 'Claro' : 'Escuro'}
              </span>
            </button>
            <button
              className="text-slate-700 dark:text-white hover:text-gold-500 transition-colors"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-700">
          {links.map((l) =>
            l.page ? (
              <a
                key={l.href}
                href={location.pathname === '/' ? l.href : `/${l.href}`}
                onClick={() => setOpen(false)}
                className="block px-6 py-3 font-heading text-sm uppercase tracking-widest text-slate-600 dark:text-gray-300 hover:text-gold-500 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors border-b border-slate-100 dark:border-navy-800"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setOpen(false)}
                className="block px-6 py-3 font-heading text-sm uppercase tracking-widest text-slate-600 dark:text-gray-300 hover:text-gold-500 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors border-b border-slate-100 dark:border-navy-800"
              >
                {l.label}
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  )
}
