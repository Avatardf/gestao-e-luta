import { MessageCircle, Instagram, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

const socialLinks = [
  { href: 'https://wa.me/5521999990000',          icon: MessageCircle, color: 'hover:text-green-400 hover:border-green-400/50 hover:bg-green-400/5',  label: 'WhatsApp' },
  { href: 'https://instagram.com/gestaoluta_sindpol', icon: Instagram,    color: 'hover:text-pink-400  hover:border-pink-400/50  hover:bg-pink-400/5',   label: 'Instagram' },
  { href: 'mailto:contato@gestaoluta.com.br',     icon: Mail,          color: 'hover:text-blue-400  hover:border-blue-400/50  hover:bg-blue-400/5',   label: 'E-mail' },
]

const navLinks = [
  { href: '#sobre',     label: 'Sobre a Chapa',    anchor: true },
  { href: '#diretores', label: 'Nossos Diretores', anchor: true },
  { href: '/propostas', label: 'Propostas',        anchor: false },
  { href: '#votacao',   label: 'Simulação de Voto',anchor: true },
  { href: '#contato',   label: 'Contato',          anchor: true },
]

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-navy-800 relative overflow-hidden">
      {/* Top gold accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-gold-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <h3 className="font-heading text-2xl text-white tracking-widest mb-1">
              GESTÃO <span className="text-gold-500">&</span> LUTA
            </h3>
            <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">GESTÃO PARA ORGANIZAR | LUTA PARA VENCER</p>
            <div className="w-10 h-px bg-gold-500/40 my-4" />
            <p className="text-gray-400 text-sm leading-relaxed">
              Chapa candidata à eleição para a diretoria do Sindicato dos Policiais Civis do Estado do Rio de Janeiro.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heading text-xs text-gold-500 tracking-widest uppercase mb-5">Navegação</h4>
            <ul className="space-y-2.5">
              {navLinks.map(l => (
                <li key={l.href}>
                  {l.anchor ? (
                    <a href={l.href}
                      className="text-gray-400 text-sm hover:text-gold-400 transition-colors duration-200 font-heading tracking-wide flex items-center gap-2 group">
                      <span className="w-0 h-px bg-gold-500 group-hover:w-3 transition-all duration-300" />
                      {l.label}
                    </a>
                  ) : (
                    <Link to={l.href}
                      className="text-gray-400 text-sm hover:text-gold-400 transition-colors duration-200 font-heading tracking-wide flex items-center gap-2 group">
                      <span className="w-0 h-px bg-gold-500 group-hover:w-3 transition-all duration-300" />
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-heading text-xs text-gold-500 tracking-widest uppercase mb-5">Redes Sociais</h4>
            <div className="flex gap-3">
              {socialLinks.map(({ href, icon: Icon, color, label }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  title={label}
                  className={`w-10 h-10 border border-navy-700 flex items-center justify-center text-gray-500 transition-all duration-300 hover:scale-110 hover:shadow-md ${color}`}>
                  <Icon size={16} />
                </a>
              ))}
            </div>

            {/* Eleição info */}
            <div className="mt-6 p-3 border border-gold-500/20 bg-gold-500/5">
              <p className="font-heading text-xs text-gold-500 tracking-widest uppercase">Data da eleição</p>
              <p className="text-white text-sm font-heading mt-0.5">09 de maio de 2026 · 9h30</p>
              <p className="text-gray-500 text-xs mt-0.5">Sindpol-RJ — Chapa 3</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-navy-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} Chapa GESTÃO &amp; LUTA — Sindpol-RJ
          </p>
          <p className="text-gray-700 text-xs">
            Material de campanha eleitoral sindical
          </p>
        </div>
      </div>
    </footer>
  )
}
