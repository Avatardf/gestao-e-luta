import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Quote, Send, CheckCircle2, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useInView } from '../hooks/useInView'

const LIMITE = 250

function Carrossel({ itens }) {
  const [idx, setIdx] = useState(0)
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef(null)
  const total = itens.length

  function goTo(newIdx) {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setIdx(newIdx)
      setAnimating(false)
    }, 250)
  }

  function avancar() { goTo((idx + 1) % total) }
  function voltar()  { goTo((idx - 1 + total) % total) }

  useEffect(() => {
    if (total <= 1) return
    timerRef.current = setInterval(() => goTo((idx + 1) % total), 6000)
    return () => clearInterval(timerRef.current)
  }, [total, idx])

  function reiniciarTimer() {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(avancar, 6000)
  }

  if (total === 0) return (
    <div className="text-center py-16 text-slate-500 dark:text-gray-500 text-sm">
      Nenhum depoimento ainda. Seja o primeiro!
    </div>
  )

  const d = itens[idx]

  return (
    <div className="relative">
      {/* Card */}
      <div className="relative bg-slate-50 border border-slate-200 dark:bg-navy-900 dark:border-navy-700
                      p-8 md:p-14 text-center min-h-[240px] flex flex-col justify-center
                      overflow-hidden transition-all duration-300 hover:border-gold-500/30 hover:shadow-xl hover:shadow-gold-500/5">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className="w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
        </div>

        <Quote className="text-gold-500/30 mx-auto mb-6 relative z-10" size={42} />

        <p className={`text-slate-700 dark:text-gray-200 text-base md:text-lg leading-relaxed italic max-w-2xl mx-auto relative z-10 transition-all duration-250 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          "{d.texto}"
        </p>

        <div className={`mt-6 relative z-10 transition-all duration-250 ${animating ? 'opacity-0' : 'opacity-100'}`}>
          <div className="w-8 h-px bg-gold-500/40 mx-auto mb-3" />
          <p className="font-heading text-slate-900 dark:text-white tracking-widest text-sm">{d.nome}</p>
          {d.lotacao && <p className="text-gold-500 text-xs font-heading tracking-widest uppercase mt-1">{d.lotacao}</p>}
        </div>
      </div>

      {/* Navegação */}
      {total > 1 && (
        <>
          <button
            onClick={() => { voltar(); reiniciarTimer() }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-slate-200 dark:bg-navy-800 dark:border-navy-700
                       hover:border-gold-500 hover:bg-gold-500/10 text-slate-500 dark:text-gray-400 hover:text-gold-500
                       flex items-center justify-center transition-all duration-200 hover:shadow-md hover:shadow-gold-500/10"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => { avancar(); reiniciarTimer() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-slate-200 dark:bg-navy-800 dark:border-navy-700
                       hover:border-gold-500 hover:bg-gold-500/10 text-slate-500 dark:text-gray-400 hover:text-gold-500
                       flex items-center justify-center transition-all duration-200 hover:shadow-md hover:shadow-gold-500/10"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {itens.map((_, i) => (
            <button
              key={i}
              onClick={() => { goTo(i); reiniciarTimer() }}
              className={`h-1.5 rounded-full transition-all duration-400 ${i === idx ? 'bg-gold-500 w-8' : 'bg-slate-300 dark:bg-navy-700 w-2 hover:bg-gold-500/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FormDepoimento({ onEnviado }) {
  const [form, setForm]     = useState({ nome: '', lotacao: '', texto: '' })
  const [loading, setLoading] = useState(false)
  const [erro, setErro]     = useState('')

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
      nome: form.nome, lotacao: form.lotacao || null, texto: form.texto,
      status: 'pending',
    })
    setLoading(false)
    if (error) { setErro('Erro ao enviar. Tente novamente.'); return }
    onEnviado()
  }

  const inputCls = "w-full bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white px-4 py-3 text-sm focus:outline-none focus:border-gold-500 focus:shadow-[0_0_0_3px_rgba(201,162,39,0.1)] transition-all duration-200 placeholder-slate-400 dark:placeholder-navy-600"

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-heading text-xs text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Nome *</label>
          <input name="nome" value={form.nome} onChange={handleChange} required placeholder="Seu nome" className={inputCls} />
        </div>
        <div>
          <label className="block font-heading text-xs text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Lotação</label>
          <input name="lotacao" value={form.lotacao} onChange={handleChange} placeholder="Ex: 10ª DP" className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block font-heading text-xs text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Depoimento *</label>
        <textarea name="texto" value={form.texto} onChange={handleChange} required rows={4}
          placeholder="Escreva seu apoio à chapa Gestão e Luta..."
          className={`${inputCls} resize-none`}
        />
        <p className={`text-xs mt-1 text-right transition-colors ${form.texto.length >= LIMITE ? 'text-red-400' : 'text-slate-400 dark:text-gray-600'}`}>
          {form.texto.length}/{LIMITE}
        </p>
      </div>
      {erro && <p className="text-red-400 text-xs text-center">{erro}</p>}
      <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-3">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {loading ? 'Enviando...' : 'Enviar depoimento'}
      </button>
    </form>
  )
}

export default function Depoimentos() {
  const [itens, setItens]   = useState([])
  const [loading, setLoading] = useState(true)
  const [enviado, setEnviado] = useState(false)
  const [headerRef, headerInView] = useInView()

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('depoimentos')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    if (data) setItens(data)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])
  function onEnviado() { setEnviado(true); carregar() }

  return (
    <section id="depoimentos" className="py-28 bg-white dark:bg-navy-950 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-700 ${headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <p className="font-heading text-gold-500 text-sm tracking-widest uppercase mb-2">Quem apoia</p>
          <h2 className="section-title">Depoimentos</h2>
          <span className="gold-line mx-auto" />
          <p className="text-slate-600 dark:text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
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
        <div className="mt-16 border-t border-slate-100 dark:border-navy-800 pt-16">
          <h3 className="font-heading text-xl text-slate-900 dark:text-white tracking-widest text-center mb-8">Deixe seu depoimento</h3>
          {enviado ? (
            <div className="bg-gold-500/10 border border-gold-500/40 p-8 text-center max-w-xl mx-auto">
              <CheckCircle2 className="text-gold-500 mx-auto mb-3" size={36} />
              <p className="font-heading text-slate-900 dark:text-white tracking-widest mb-2">Depoimento recebido!</p>
              <p className="text-slate-600 dark:text-gray-400 text-sm">
                Obrigado pelo seu apoio, companheiro!<br />
                <span className="text-slate-500 dark:text-gray-500 text-xs mt-1 block">
                  Seu depoimento será publicado após análise da administração.
                </span>
              </p>
              <button onClick={() => setEnviado(false)} className="mt-5 btn-outline text-sm">Enviar outro</button>
            </div>
          ) : (
            <FormDepoimento onEnviado={onEnviado} />
          )}
        </div>
      </div>

      <div className="wave-sep" />
    </section>
  )
}
