import { useState } from 'react'
import { MessageCircle, Instagram, RotateCcw, ChevronLeft, Loader2 } from 'lucide-react'
import { useDirectors } from '../hooks/useDirectors'
import { useInView } from '../hooks/useInView'

function FlipCard({ d, index }) {
  const [flipped, setFlipped] = useState(false)
  const [ref, inView] = useInView()
  const initials = d.nome.split(' ').slice(0, 2).map(n => n[0]).join('')

  return (
    <div
      ref={ref}
      className={`flip-card cursor-pointer transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${flipped ? 'flipped' : ''}`}
      style={{ height: '420px', transitionDelay: `${index * 80}ms` }}
      onClick={() => setFlipped(f => !f)}
    >
      <div className="flip-card-inner">

        {/* ── FRENTE ───────────────────────────────────────── */}
        <div className="flip-card-front bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700
                        flex flex-col overflow-hidden hover:border-gold-500/40 hover:shadow-xl hover:shadow-gold-500/5 transition-all duration-300">

          {/* Topo com avatar circular */}
          <div className="relative flex flex-col items-center pt-7 pb-4 px-5
                          bg-gradient-to-b from-slate-100 to-white dark:from-navy-800 dark:to-navy-900
                          border-b border-slate-200 dark:border-navy-700 flex-shrink-0">

            {/* Hint — canto superior direito */}
            <span className="absolute top-2 right-3 text-slate-400 dark:text-gray-600 text-[10px] font-heading tracking-wide select-none">
              toque para ver perfil →
            </span>

            {/* Avatar circular */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full p-[3px]
                              bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600
                              shadow-lg shadow-gold-500/20">
                {d.foto ? (
                  <img
                    src={d.foto}
                    alt={d.nome}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-navy-800 flex items-center justify-center">
                    <span className="font-heading text-3xl text-gold-400">{initials}</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-gold-500 border-2 border-white dark:border-navy-900 shadow" />
            </div>

            <h3 className="font-heading text-base text-slate-900 dark:text-white tracking-wide mt-3 text-center leading-tight">{d.nome}</h3>
            <span className="font-heading text-gold-500 text-xs tracking-widest uppercase mt-0.5">
              {d.cargo.replace(/^candidat[ao] a /i, '')}
            </span>
            {d.delegacia && <p className="text-slate-500 dark:text-gray-500 text-xs mt-1 text-center">{d.delegacia}</p>}
          </div>

          {/* Bio resumida */}
          <div className="p-5 flex flex-col flex-1">
            <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed flex-1 overflow-hidden">{d.resumo || d.bio}</p>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-navy-700 flex items-center justify-between">
              <span className="text-slate-400 dark:text-gray-600 text-xs font-heading tracking-wide">Passe o mouse ou toque</span>
              <RotateCcw size={14} className="text-gold-500/50" />
            </div>
          </div>
        </div>

        {/* ── VERSO ────────────────────────────────────────── */}
        <div className="flip-card-back bg-white dark:bg-navy-900 border border-gold-500/40 flex flex-col overflow-hidden
                        shadow-xl shadow-gold-500/10">
          {/* Cabeçalho dourado */}
          <div className="bg-gradient-to-r from-gold-500/15 to-gold-500/5 border-b border-gold-500/30 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-gold-400 to-gold-600 flex-shrink-0 shadow shadow-gold-500/20">
                {d.foto ? (
                  <img src={d.foto} alt={d.nome} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-navy-800 flex items-center justify-center">
                    <span className="font-heading text-lg text-gold-400">{initials}</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-heading text-slate-900 dark:text-white tracking-wide text-base leading-tight">{d.nome}</h3>
                <p className="text-gold-500 text-xs font-heading tracking-widest uppercase">{d.cargo.replace(/^candidat[ao] a /i, '')}</p>
              </div>
            </div>
          </div>

          {/* Bio completa */}
          <div className="p-5 flex flex-col flex-1 overflow-hidden">
            <p className="text-slate-700 dark:text-gray-300 text-sm leading-relaxed flex-1">{d.bio}</p>
            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-navy-700 space-y-2">
              {/* Botão voltar — visível apenas em touch (sem hover real) */}
              <button
                onClick={e => { e.stopPropagation(); setFlipped(false) }}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors font-heading text-xs uppercase tracking-widest py-1 md:hidden"
              >
                <ChevronLeft size={13} /> Voltar
              </button>
              {d.whatsapp && (
                <a
                  href={`https://wa.me/${d.whatsapp}?text=${encodeURIComponent(`Olá, ${d.nome.split(' ')[0]}! Vi o seu perfil no site da chapa Gestão e Luta e gostaria de conversar sobre a eleição do Sindpol-RJ. Conto com vocês!`)}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2.5 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-all duration-200 w-full hover:shadow-md hover:shadow-green-500/10"
                >
                  <MessageCircle size={15} />
                  <span className="font-heading text-xs tracking-widest uppercase">Enviar mensagem</span>
                </a>
              )}
              {d.instagram && (
                <a
                  href={`https://instagram.com/${d.instagram.replace('@','')}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-2 bg-pink-500/10 border border-pink-500/30 px-4 py-2.5 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 transition-all duration-200 w-full hover:shadow-md hover:shadow-pink-500/10"
                >
                  <Instagram size={15} />
                  <span className="font-heading text-xs tracking-widest uppercase">{d.instagram}</span>
                </a>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function Diretores() {
  const { directors, loading } = useDirectors()
  const [headerRef, headerInView] = useInView()

  return (
    <section id="diretores" className="py-28 bg-white dark:bg-navy-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-700 ${headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <p className="font-heading text-gold-500 text-sm tracking-widest uppercase mb-2">Nossa equipe</p>
          <h2 className="section-title">Os Diretores</h2>
          <span className="gold-line mx-auto" />
          <p className="text-slate-600 dark:text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Policiais civis comprometidos, com trajetória comprovada e prontos para representar cada servidor com dignidade e eficiência.
          </p>
          <p className="text-slate-400 dark:text-gray-600 text-xs mt-2">Passe o mouse ou toque no card para conhecer cada diretor.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="text-gold-500 animate-spin" size={36} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {directors.map((d, i) => (
              <FlipCard key={d.id} d={d} index={i} />
            ))}
          </div>
        )}
      </div>

      <div className="wave-sep" />
    </section>
  )
}
