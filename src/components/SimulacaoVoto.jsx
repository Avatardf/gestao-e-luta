import { useState, useEffect } from 'react'
import { CheckCircle2, Vote, Share2, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useVisitor } from '../hooks/useVisitor'

const META = 600

const chapas = [
  { id: 1, nome: 'GESTÃO E LUTA', descricao: 'Transparência · Compromisso · Resultado', destaque: true },
  { id: 2, nome: 'Chapa A',        descricao: 'Outra proposta de gestão', destaque: false },
  { id: 3, nome: 'Chapa B',        descricao: 'Outra proposta de gestão', destaque: false },
]

function Termometro({ total }) {
  const pct = Math.min(Math.round((total / META) * 100), 100)
  const cor = pct >= 100 ? 'bg-green-500' : pct >= 60 ? 'bg-gold-500' : 'bg-blue-500'
  return (
    <div className="mb-8 p-5 bg-navy-900 border border-navy-700">
      <div className="flex justify-between items-end mb-2">
        <span className="font-heading text-xs text-gray-400 tracking-widest uppercase">Termômetro da vitória</span>
        <span className="font-heading text-2xl text-gold-400">{total}<span className="text-gray-500 text-sm">/{META}</span></span>
      </div>
      <div className="h-3 bg-navy-800 overflow-hidden">
        <div className={`h-full transition-all duration-700 ${cor}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-gray-500 text-xs mt-2">
        {pct >= 100
          ? '✅ Meta atingida! Seguimos em frente!'
          : `Faltam ${META - total} votos para atingir a meta de ${META}`}
      </p>
    </div>
  )
}

export default function SimulacaoVoto() {
  const visitor = useVisitor()
  const [selected, setSelected]   = useState(null)
  const [voted, setVoted]         = useState(false)
  const [alreadyVoted, setAlready]= useState(false)
  const [loading, setLoading]     = useState(true)
  const [submitting, setSubmit]   = useState(false)
  const [counts, setCounts]       = useState({ 1: 0, 2: 0, 3: 0 })
  const [total, setTotal]         = useState(0)

  useEffect(() => {
    loadVotes()
  }, [])

  useEffect(() => {
    if (visitor?.ip) checkAlreadyVoted(visitor.ip)
  }, [visitor])

  async function loadVotes() {
    setLoading(true)
    const { data } = await supabase.from('votes').select('chapa_id')
    if (data) {
      const c = { 1: 0, 2: 0, 3: 0 }
      data.forEach(v => { c[v.chapa_id] = (c[v.chapa_id] || 0) + 1 })
      setCounts(c)
      setTotal(data.length)
    }
    setLoading(false)
  }

  async function checkAlreadyVoted(ip) {
    const { data } = await supabase.from('votes').select('id').eq('ip_address', ip).maybeSingle()
    if (data) {
      setAlready(true)
      setVoted(true)
    }
  }

  async function handleVote() {
    if (!selected || !visitor) return
    setSubmit(true)
    const chapa = chapas.find(c => c.id === selected)

    const { error } = await supabase.from('votes').insert({
      ip_address: visitor.ip,
      chapa_id:   selected,
      chapa_nome: chapa.nome,
      city:       visitor.city,
      region:     visitor.region,
      country:    visitor.country,
    })

    if (error) {
      alert('Erro ao registrar voto. Tente novamente.')
    } else {
      const newCounts = { ...counts, [selected]: (counts[selected] || 0) + 1 }
      setCounts(newCounts)
      setTotal(total + 1)
      setVoted(true)
    }
    setSubmit(false)
  }

  const pct = (id) => total > 0 ? Math.round((counts[id] / total) * 100) : 0

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
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
        <span className="font-heading text-[20rem] text-gold-500 leading-none">X</span>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="font-heading text-gold-500 text-sm tracking-widest uppercase mb-2">Participe</p>
          <h2 className="section-title">Simule seu Voto</h2>
          <span className="gold-line mx-auto" />
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Esta é uma simulação não-oficial para medir o apoio dos filiados. Seu voto real ocorrerá na urna durante o período eleitoral.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="text-gold-500 animate-spin" size={36} />
          </div>
        ) : (
          <>
            <Termometro total={total} />

            {!voted ? (
              <div className="space-y-4 mb-8">
                {chapas.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className={`w-full text-left p-5 border-2 transition-all duration-200 flex items-center gap-4 ${
                      selected === c.id
                        ? c.destaque ? 'border-gold-500 bg-gold-500/10' : 'border-navy-500 bg-navy-800'
                        : 'border-navy-700 bg-navy-900 hover:border-navy-500'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selected === c.id ? c.destaque ? 'border-gold-500' : 'border-gray-400' : 'border-navy-600'
                    }`}>
                      {selected === c.id && (
                        <div className={`w-2.5 h-2.5 rounded-full ${c.destaque ? 'bg-gold-500' : 'bg-gray-400'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`font-heading text-lg tracking-widest ${c.destaque ? 'text-gold-400' : 'text-white'}`}>{c.nome}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{c.descricao}</div>
                    </div>
                    {c.destaque && (
                      <span className="bg-gold-500 text-navy-950 font-heading text-xs px-2 py-0.5 tracking-wider">NOSSA CHAPA</span>
                    )}
                  </button>
                ))}

                <button
                  onClick={handleVote}
                  disabled={!selected || submitting || !visitor}
                  className={`w-full mt-4 flex items-center justify-center gap-3 py-4 font-heading text-sm uppercase tracking-widest transition-all duration-200 ${
                    selected && visitor ? 'bg-gold-500 text-navy-950 hover:bg-gold-400 cursor-pointer' : 'bg-navy-800 text-navy-600 cursor-not-allowed'
                  }`}
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Vote size={18} />}
                  {submitting ? 'Registrando...' : 'Confirmar Voto'}
                </button>

                {!visitor && (
                  <p className="text-center text-gray-600 text-xs">Detectando sua localização...</p>
                )}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                <div className={`p-5 flex items-center gap-3 mb-6 ${alreadyVoted ? 'bg-blue-500/10 border border-blue-500/40' : 'bg-gold-500/10 border border-gold-500/40'}`}>
                  {alreadyVoted
                    ? <AlertCircle className="text-blue-400 flex-shrink-0" size={22} />
                    : <CheckCircle2 className="text-gold-500 flex-shrink-0" size={22} />}
                  <div>
                    <p className="font-heading text-white tracking-wide">
                      {alreadyVoted ? 'Você já votou anteriormente!' : 'Voto registrado!'}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {alreadyVoted
                        ? 'Seu IP já consta na nossa base. Lembre-se de votar na urna oficial!'
                        : 'Obrigado! Lembre-se de votar na urna oficial no dia da eleição.'}
                    </p>
                  </div>
                </div>

                {chapas.map((c) => (
                  <div key={c.id} className={`p-4 border ${c.id === selected || (alreadyVoted && c.id === 1) ? 'border-gold-500/40 bg-gold-500/5' : 'border-navy-700 bg-navy-900'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-heading text-sm tracking-widest ${c.destaque ? 'text-gold-400' : 'text-white'}`}>{c.nome}</span>
                      <span className="font-heading text-lg text-white">{pct(c.id)}%</span>
                    </div>
                    <div className="h-2 bg-navy-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${c.destaque ? 'bg-gold-500' : 'bg-navy-500'}`}
                        style={{ width: `${pct(c.id)}%` }}
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">{(counts[c.id] || 0).toLocaleString('pt-BR')} votos</p>
                  </div>
                ))}

                <button onClick={handleShare} className="w-full btn-primary flex items-center justify-center gap-2">
                  <Share2 size={16} />
                  Compartilhar
                </button>
              </div>
            )}
          </>
        )}

        <p className="text-center text-gray-600 text-xs">
          * Simulação não-oficial. Cada IP pode votar uma vez. Não representa resultado eleitoral oficial.
        </p>
      </div>
    </section>
  )
}
