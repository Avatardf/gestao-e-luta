import { useState, useEffect } from 'react'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const links = [
  { href: '#sobre',      label: 'Sobre' },
  { href: '#diretores',  label: 'Diretores' },
  { href: '#propostas',  label: 'Propostas' },
  { href: '#votacao',    label: 'Vote Agora' },
  { href: '#contato',    label: 'Contato' },
]

export default function Navbar() {
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { dark, toggle }        = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
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
          <a href="#hero" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gold-500 flex items-center justify-center">
              <span className="text-navy-950 font-heading font-bold text-xs">GL</span>
            </div>
            <span className="font-heading text-slate-900 dark:text-white tracking-widest text-sm hidden sm:block">
              GESTÃO <span className="text-gold-500">&</span> LUTA
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`font-heading text-xs uppercase tracking-widest transition-colors duration-200 ${
                  l.label === 'Vote Agora'
                    ? 'text-gold-500 hover:text-gold-400'
                    : 'text-slate-600 dark:text-gray-300 hover:text-gold-500 dark:hover:text-gold-500'
                }`}
              >
                {l.label}
              </a>
            ))}

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-500 transition-colors"
              title={dark ? 'Modo claro' : 'Modo escuro'}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* Mobile buttons */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggle}
              className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-gray-400 hover:text-gold-500 transition-colors"
              title={dark ? 'Modo claro' : 'Modo escuro'}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
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
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-6 py-3 font-heading text-sm uppercase tracking-widest text-slate-600 dark:text-gray-300 hover:text-gold-500 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors border-b border-slate-100 dark:border-navy-800"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
