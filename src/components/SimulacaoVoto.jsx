import { useState } from 'react'
import { CheckCircle2, Vote, RotateCcw, Share2 } from 'lucide-react'

const chapas = [
  { id: 1, nome: 'GESTÃO E LUTA', cor: 'gold',  descricao: 'Transparência · Compromisso · Resultado', destaque: true },
  { id: 2, nome: 'Chapa A',        cor: 'gray',  descricao: 'Outra proposta de gestão', destaque: false },
  { id: 3, nome: 'Chapa B',        cor: 'gray',  descricao: 'Outra proposta de gestão', destaque: false },
]

// Contadores iniciais (simulados)
const initialVotes = { 1: 1247, 2: 843, 3: 612 }
const total = Object.values(initialVotes).reduce((a, b) => a + b, 0)

export default function SimulacaoVoto() {
  const [selected, setSelected] = useState(null)
  const [voted, setVoted] = useState(false)
  const [votes, setVotes] = useState(initialVotes)
  const [myTotal, setMyTotal] = useState(total)

  const handleVote = () => {
    if (!selected) return
    const newVotes = { ...votes, [selected]: votes[selected] + 1 }
    setVotes(newVotes)
    setMyTotal(myTotal + 1)
    setVoted(true)
  }

  const handleReset = () => {
    setSelected(null)
    setVoted(false)
    setVotes(initialVotes)
    setMyTotal(total)
  }

  const pct = (id) => Math.round((votes[id] / myTotal) * 100)

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'GESTÃO E LUTA — Sindpol-RJ', url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado!')
    }
  }

  return (
    <section id="votacao" className="py-24 bg-navy-950 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
        <span className="font-heading text-[20rem] text-gold-500 leading-none">X</span>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="font-heading text-gold-500 text-sm tracking-widest uppercase mb-2">Participe</p>
          <h2 className="section-title">Simule seu Voto</h2>
          <span className="gold-line mx-auto" />
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Esta é uma simulação não-oficial para interação com os filiados. Seu voto real ocorrerá na urna durante o período eleitoral.
          </p>
        </div>

        {!voted ? (
          <div className="space-y-4 mb-8">
            {chapas.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full text-left p-5 border-2 transition-all duration-200 flex items-center gap-4 ${
                  selected === c.id
                    ? c.destaque
                      ? 'border-gold-500 bg-gold-500/10'
                      : 'border-navy-500 bg-navy-800'
                    : 'border-navy-700 bg-navy-900 hover:border-navy-500'
                }`}
              >
                {/* Radio */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selected === c.id
                    ? c.destaque ? 'border-gold-500' : 'border-gray-400'
                    : 'border-navy-600'
                }`}>
                  {selected === c.id && (
                    <div className={`w-2.5 h-2.5 rounded-full ${c.destaque ? 'bg-gold-500' : 'bg-gray-400'}`} />
                  )}
                </div>

                <div className="flex-1">
                  <div className={`font-heading text-lg tracking-widest ${c.destaque ? 'text-gold-400' : 'text-white'}`}>
                    {c.nome}
                  </div>
                  <div className="text-gray-400 text-xs mt-0.5">{c.descricao}</div>
                </div>

                {c.destaque && (
                  <span className="bg-gold-500 text-navy-950 font-heading text-xs px-2 py-0.5 tracking-wider">
                    NOSSA CHAPA
                  </span>
                )}
              </button>
            ))}

            <button
              onClick={handleVote}
              disabled={!selected}
              className={`w-full mt-4 flex items-center justify-center gap-3 py-4 font-heading text-sm uppercase tracking-widest transition-all duration-200 ${
                selected
                  ? 'bg-gold-500 text-navy-950 hover:bg-gold-400 cursor-pointer'
                  : 'bg-navy-800 text-navy-600 cursor-not-allowed'
              }`}
            >
              <Vote size={18} />
              Confirmar Voto
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {/* Success message */}
            <div className="bg-gold-500/10 border border-gold-500/40 p-5 flex items-center gap-3 mb-6">
              <CheckCircle2 className="text-gold-500 flex-shrink-0" size={22} />
              <div>
                <p className="font-heading text-white tracking-wide">Voto computado!</p>
                <p className="text-gray-400 text-xs mt-0.5">Obrigado pela participação. Lembre-se de votar na urna oficial!</p>
              </div>
            </div>

            {/* Results */}
            {chapas.map((c) => (
              <div key={c.id} className={`p-4 border ${c.id === selected ? 'border-gold-500/40 bg-gold-500/5' : 'border-navy-700 bg-navy-900'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-heading text-sm tracking-widest ${c.destaque ? 'text-gold-400' : 'text-white'}`}>
                    {c.nome}
                  </span>
                  <span className="font-heading text-lg text-white">{pct(c.id)}%</span>
                </div>
                <div className="h-2 bg-navy-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${c.destaque ? 'bg-gold-500' : 'bg-navy-500'}`}
                    style={{ width: `${pct(c.id)}%` }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">{votes[c.id].toLocaleString('pt-BR')} votos</p>
              </div>
            ))}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleShare}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                Compartilhar
              </button>
              <button
                onClick={handleReset}
                className="btn-outline flex items-center gap-2 px-5"
                title="Reiniciar simulação"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-gray-600 text-xs">
          * Simulação meramente ilustrativa. Não representa resultado eleitoral oficial.
        </p>
      </div>
    </section>
  )
}
