import { useState } from 'react'
import { MessageCircle, Instagram, RotateCcw } from 'lucide-react'
import { diretores } from '../data/diretores'

function FlipCard({ d }) {
  const [flipped, setFlipped] = useState(false)
  const initials = d.nome.split(' ').slice(0, 2).map(n => n[0]).join('')

  return (
    <div
      className={`flip-card cursor-pointer ${flipped ? 'flipped' : ''}`}
      style={{ height: '420px' }}
      onClick={() => setFlipped(f => !f)}
    >
      <div className="flip-card-inner">

        {/* ── FRENTE ─────────────────────────────────────────────── */}
        <div className="flip-card-front bg-navy-900 border border-navy-700 flex flex-col overflow-hidden">
          {/* Avatar */}
          <div className="w-full h-48 bg-navy-800 flex items-center justify-center border-b border-navy-700 flex-shrink-0 relative">
            {d.foto
              ? <img src={d.foto} alt={d.nome} className="w-full h-full object-cover object-top" />
              : (
                <div className="w-20 h-20 rounded-full bg-navy-700 border-2 border-gold-500/40 flex items-center justify-center">
                  <span className="font-heading text-2xl text-gold-400">{initials}</span>
                </div>
              )
            }
            {/* hint */}
            <div className="absolute bottom-2 right-3 text-gray-600 text-xs font-heading tracking-wide select-none">
              toque para ver perfil →
            </div>
          </div>

          {/* Info */}
          <div className="p-5 flex flex-col flex-1">
            <span className="font-heading text-gold-500 text-xs tracking-widest uppercase">{d.cargo}</span>
            <h3 className="font-heading text-lg text-white tracking-wide mt-0.5">{d.nome}</h3>
            {d.delegacia && <p className="text-gray-500 text-xs mt-0.5">{d.delegacia}</p>}

            <p className="text-gray-400 text-sm leading-relaxed mt-3 flex-1 line-clamp-3">{d.bio}</p>

            <div className="mt-4 pt-4 border-t border-navy-700 flex items-center justify-between">
              <span className="text-gray-600 text-xs font-heading tracking-wide">Passe o mouse ou toque</span>
              <RotateCcw size={14} className="text-gold-500/50" />
            </div>
          </div>
        </div>

        {/* ── VERSO ──────────────────────────────────────────────── */}
        <div className="flip-card-back bg-navy-900 border border-gold-500/40 flex flex-col overflow-hidden">
          {/* Cabeçalho dourado */}
          <div className="bg-gold-500/10 border-b border-gold-500/30 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-navy-800 border-2 border-gold-500 flex items-center justify-center flex-shrink-0">
                <span className="font-heading text-lg text-gold-400">{initials}</span>
              </div>
              <div>
                <h3 className="font-heading text-white tracking-wide text-base leading-tight">{d.nome}</h3>
                <p className="text-gold-500 text-xs font-heading tracking-widest uppercase">{d.cargo}</p>
              </div>
            </div>
          </div>

          {/* Bio completa */}
          <div className="p-5 flex flex-col flex-1 overflow-hidden">
            <p className="text-gray-300 text-sm leading-relaxed flex-1">{d.bio}</p>

            {/* Contatos */}
            <div className="mt-auto pt-4 border-t border-navy-700 space-y-2">
              {d.whatsapp && (
                <a
                  href={`https://wa.me/${d.whatsapp}?text=${encodeURIComponent(`Olá, ${d.nome.split(' ')[0]}! Vi o seu perfil no site da chapa Gestão e Luta e gostaria de conversar sobre a eleição do Sindpol-RJ. Conto com vocês!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2.5 text-green-400 hover:bg-green-500/20 transition-colors w-full"
                >
                  <MessageCircle size={15} />
                  <span className="font-heading text-xs tracking-widest uppercase">Enviar mensagem</span>
                </a>
              )}
              {d.instagram && (
                <a
                  href={`https://instagram.com/${d.instagram.replace('@','')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-2 bg-pink-500/10 border border-pink-500/30 px-4 py-2.5 text-pink-400 hover:bg-pink-500/20 transition-colors w-full"
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
  return (
    <section id="diretores" className="py-24 bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="font-heading text-gold-500 text-sm tracking-widest uppercase mb-2">Nossa equipe</p>
          <h2 className="section-title">Os Diretores</h2>
          <span className="gold-line mx-auto" />
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Policiais civis comprometidos, com trajetória comprovada e prontos para representar cada servidor com dignidade e eficiência.
          </p>
          <p className="text-gray-600 text-xs mt-2">Passe o mouse ou toque no card para conhecer cada diretor.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {diretores.map((d) => (
            <FlipCard key={d.id} d={d} />
          ))}
        </div>
      </div>
    </section>
  )
}
