import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Quote, Send, CheckCircle2, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const LIMITE = 250

function Carrossel({ itens }) {
  const [idx, setIdx] = useState(0)
  const timerRef = useRef(null)

  const total = itens.length

  function avancar() {
    setIdx(i => (i + 1) % total)
  }

  function voltar() {
    setIdx(i => (i - 1 + total) % total)
  }

  useEffect(() => {
    if (total <= 1) return
    timerRef.current = setInterval(avancar, 6000)
    return () => clearInterval(timerRef.current)
  }, [total])

  function reiniciarTimer() {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(avancar, 6000)
  }

  if (total === 0) return (
    <div className="text-center py-16 text-gray-500 text-sm">
      Nenhum depoimento ainda. Seja o primeiro!
    </div>
  )

  const d = itens[idx]

  return (
    <div className="relative">
      {/* Card */}
      <div className="bg-navy-900 border border-navy-700 p-8 md:p-12 text-center min-h-[220px] flex flex-col justify-center">
        <Quote className="text-gold-500/40 mx-auto mb-4" size={36} />
        <p className="text-gray-200 text-base md:text-lg leading-relaxed italic max-w-2xl mx-auto">
          "{d.texto}"
        </p>
        <div className="mt-6">
          <p className="font-heading text-white tracking-widest text-sm">{d.nome}</p>
          {d.lotacao && <p className="text-gold-500 text-xs font-heading tracking-widest uppercase mt-1">{d.lotacao}</p>}
        </div>
      </div>

      {/* Navegação */}
      {total > 1 && (
        <>
          <button
            onClick={() => { voltar(); reiniciarTimer() }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-navy-800 border border-navy-700 hover:border-gold-500 text-gray-400 hover:text-gold-500 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => { avancar(); reiniciarTimer() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-navy-800 border border-navy-700 hover:border-gold-500 text-gray-400 hover:text-gold-500 flex items-center justify-center transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {itens.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIdx(i); reiniciarTimer() }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === idx ? 'bg-gold-500 w-5' : 'bg-navy-700'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FormDepoimento({ onEnviado }) {
  const [form, setForm] = useState({ nome: '', lotacao: '', texto: '' })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'texto' && value.length > LIMITE) return
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const { error } = await supabase.from('depoimentos').insert({
      nome: form.nome,
      lotacao: form.lotacao || null,
      texto: form.texto,
    })
    setLoading(false)
    if (error) { setErro('Erro ao enviar. Tente novamente.'); return }
    onEnviado()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-heading text-xs text-gray-400 uppercase tracking-widest mb-1.5">Nome *</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
            placeholder="Seu nome"
            className="w-full bg-navy-900 border border-navy-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors placeholder-navy-600"
          />
        </div>
        <div>
          <label className="block font-heading text-xs text-gray-400 uppercase tracking-widest mb-1.5">Lotação</label>
          <input
            name="lotacao"
            value={form.lotacao}
            onChange={handleChange}
            placeholder="Ex: 10ª DP"
            className="w-full bg-navy-900 border border-navy-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors placeholder-navy-600"
          />
        </div>
      </div>
      <div>
        <label className="block font-heading text-xs text-gray-400 uppercase tracking-widest mb-1.5">Depoimento *</label>
        <textarea
          name="texto"
          value={form.texto}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Escreva seu apoio à chapa Gestão e Luta..."
          className="w-full bg-navy-900 border border-navy-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors placeholder-navy-600 resize-none"
        />
        <p className={`text-xs mt-1 text-right ${form.texto.length >= LIMITE ? 'text-red-400' : 'text-gray-600'}`}>
          {form.texto.length}/{LIMITE}
        </p>
      </div>
      {erro && <p className="text-red-400 text-xs text-center">{erro}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary flex items-center justify-center gap-3"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {loading ? 'Enviando...' : 'Enviar depoimento'}
      </button>
    </form>
  )
}

export default function Depoimentos() {
  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(true)
  const [enviado, setEnviado] = useState(false)

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('depoimentos')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setItens(data)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  function onEnviado() {
    setEnviado(true)
    carregar()
  }

  return (
    <section id="depoimentos" className="py-24 bg-navy-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="font-heading text-gold-500 text-sm tracking-widest uppercase mb-2">Quem apoia</p>
          <h2 className="section-title">Depoimentos</h2>
          <span className="gold-line mx-auto" />
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Policiais civis de todo o estado manifestando seu apoio à chapa Gestão e Luta.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="text-gold-500 animate-spin" size={32} />
          </div>
        ) : (
          <Carrossel itens={itens} />
        )}

        {/* Form */}
        <div className="mt-16 border-t border-navy-800 pt-16">
          <h3 className="font-heading text-xl text-white tracking-widest text-center mb-8">Deixe seu depoimento</h3>
          {enviado ? (
            <div className="bg-gold-500/10 border border-gold-500/40 p-8 text-center max-w-xl mx-auto">
              <CheckCircle2 className="text-gold-500 mx-auto mb-3" size={36} />
              <p className="font-heading text-white tracking-widest mb-2">Depoimento enviado!</p>
              <p className="text-gray-400 text-sm">Obrigado pelo seu apoio, companheiro!</p>
              <button onClick={() => setEnviado(false)} className="mt-5 btn-outline text-sm">
                Enviar outro
              </button>
            </div>
          ) : (
            <FormDepoimento onEnviado={onEnviado} />
          )}
        </div>
      </div>
    </section>
  )
}
