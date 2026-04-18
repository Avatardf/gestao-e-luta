import { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import { useInView } from '../hooks/useInView'

export default function Contato() {
  const [form, setForm]     = useState({ nome: '', matricula: '', email: '', mensagem: '' })
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [headerRef, headerInView] = useInView()
  const [formRef, formInView]     = useInView()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setEnviado(true)
    setForm({ nome: '', matricula: '', email: '', mensagem: '' })
  }

  const inputCls = "w-full bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white px-4 py-3 text-sm focus:outline-none focus:border-gold-500 focus:shadow-[0_0_0_3px_rgba(201,162,39,0.1)] transition-all duration-200 placeholder-slate-400 dark:placeholder-navy-600"

  return (
    <section id="contato" className="py-28 bg-slate-50 dark:bg-navy-900 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-gold-500/4 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-700 ${headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <p className="font-heading text-gold-500 text-sm tracking-widest uppercase mb-2">Fale conosco</p>
          <h2 className="section-title">Contato</h2>
          <span className="gold-line mx-auto" />
          <p className="text-slate-600 dark:text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Sua opinião e suas dúvidas são importantes. Entre em contato diretamente com nossa equipe.
          </p>
        </div>

        <div
          ref={formRef}
          className={`max-w-2xl mx-auto transition-all duration-700 delay-200 ${formInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 p-8 md:p-10 shadow-xl shadow-black/5 dark:shadow-black/30">
            <h3 className="font-heading text-xl text-slate-900 dark:text-white tracking-widest mb-6">Envie uma mensagem</h3>

            {enviado ? (
              <div className="bg-gold-500/10 border border-gold-500/40 p-8 text-center">
                <CheckCircle2 className="text-gold-500 mx-auto mb-3" size={40} />
                <p className="font-heading text-slate-900 dark:text-white tracking-widest text-lg mb-2">Mensagem enviada!</p>
                <p className="text-slate-600 dark:text-gray-400 text-sm">Entraremos em contato em breve. Obrigado, companheiro!</p>
                <button onClick={() => setEnviado(false)} className="mt-6 btn-outline text-sm">
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-heading text-xs text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Nome completo *</label>
                    <input name="nome" value={form.nome} onChange={handleChange} required placeholder="Seu nome" className={inputCls} />
                  </div>
                  <div>
                    <label className="block font-heading text-xs text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Matrícula</label>
                    <input name="matricula" value={form.matricula} onChange={handleChange} placeholder="Opcional" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="block font-heading text-xs text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">E-mail *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="seu@email.com" className={inputCls} />
                </div>

                <div>
                  <label className="block font-heading text-xs text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Mensagem *</label>
                  <textarea name="mensagem" value={form.mensagem} onChange={handleChange} required rows={5}
                    placeholder="Escreva sua mensagem, sugestão ou dúvida..."
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-3">
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />Enviando...</>
                  ) : (
                    <><Send size={16} />Enviar Mensagem</>
                  )}
                </button>

                <p className="text-slate-400 dark:text-gray-600 text-xs text-center">
                  Suas informações são confidenciais e não serão compartilhadas.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
