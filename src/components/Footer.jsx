import { MessageCircle, Instagram, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-navy-950 border-t border-slate-100 dark:border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-2xl text-slate-900 dark:text-white tracking-widest mb-1">
              GESTÃO <span className="text-gold-500">&</span> LUTA
            </h3>
            <p className="text-slate-500 dark:text-gray-500 text-xs tracking-widest uppercase mt-1">Transparência · Compromisso · Resultado</p>
            <p className="text-slate-600 dark:text-gray-400 text-sm mt-4 leading-relaxed">
              Chapa candidata à eleição para a diretoria do Sindicato dos Policiais Civis do Estado do Rio de Janeiro.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heading text-sm text-gold-500 tracking-widest uppercase mb-4">Navegação</h4>
            <ul className="space-y-2">
              {[
                { href: '#sobre',     label: 'Sobre a Chapa' },
                { href: '#diretores', label: 'Nossos Diretores' },
                { href: '#propostas', label: 'Propostas' },
                { href: '#votacao',   label: 'Simulação de Voto' },
                { href: '#contato',   label: 'Contato' },
              ].map(l => (
                <li key={l.href}>
                  <a href={l.href} className="text-slate-600 dark:text-gray-400 text-sm hover:text-gold-500 transition-colors font-heading tracking-wide">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-heading text-sm text-gold-500 tracking-widest uppercase mb-4">Redes Sociais</h4>
            <div className="flex gap-3">
              <a
                href="https://wa.me/5521999990000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-slate-200 dark:border-navy-700 flex items-center justify-center text-slate-500 dark:text-gray-400 hover:text-green-500 hover:border-green-400/40 transition-all"
              >
                <MessageCircle size={16} />
              </a>
              <a
                href="https://instagram.com/gestaoluta_sindpol"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-slate-200 dark:border-navy-700 flex items-center justify-center text-slate-500 dark:text-gray-400 hover:text-pink-500 hover:border-pink-400/40 transition-all"
              >
                <Instagram size={16} />
              </a>
              <a
                href="mailto:contato@gestaoluta.com.br"
                className="w-10 h-10 border border-slate-200 dark:border-navy-700 flex items-center justify-center text-slate-500 dark:text-gray-400 hover:text-blue-500 hover:border-blue-400/40 transition-all"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-100 dark:border-navy-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-slate-400 dark:text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} Chapa GESTÃO &amp; LUTA — Sindpol-RJ
          </p>
          <p className="text-slate-300 dark:text-gray-700 text-xs">
            Material de campanha eleitoral sindical
          </p>
        </div>
      </div>
    </footer>
  )
}
