import { MessageCircle, Instagram, User } from 'lucide-react'
import { diretores } from '../data/diretores'

function Avatar({ nome }) {
  const initials = nome.split(' ').slice(0, 2).map(n => n[0]).join('')
  return (
    <div className="w-full h-48 bg-navy-800 flex items-center justify-center border-b border-navy-700">
      <div className="w-20 h-20 rounded-full bg-navy-700 border-2 border-gold-500/40 flex items-center justify-center">
        <span className="font-heading text-2xl text-gold-400">{initials}</span>
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {diretores.map((d) => (
            <div key={d.id} className="card p-0 overflow-hidden group flex flex-col">
              {/* Photo/Avatar */}
              {d.foto
                ? <img src={d.foto} alt={d.nome} className="w-full h-48 object-cover object-top" />
                : <Avatar nome={d.nome} />
              }

              {/* Info */}
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-3">
                  <span className="font-heading text-gold-500 text-xs tracking-widest uppercase">{d.cargo}</span>
                  <h3 className="font-heading text-lg text-white tracking-wide mt-0.5">{d.nome}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{d.delegacia}</p>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">{d.bio}</p>

                {/* Social links */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-navy-700">
                  <a
                    href={`https://wa.me/${d.whatsapp}?text=${encodeURIComponent(`Olá, ${d.nome.split(' ')[0]}! Vi o seu perfil no site da chapa Gestão e Luta e gostaria de conversar sobre a eleição do Sindpol-RJ. Conto com vocês!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-400 transition-colors font-heading tracking-wide"
                  >
                    <MessageCircle size={14} />
                    WhatsApp
                  </a>
                  <a
                    href={`https://instagram.com/${d.instagram.replace('@','')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-pink-400 transition-colors font-heading tracking-wide"
                  >
                    <Instagram size={14} />
                    {d.instagram}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
