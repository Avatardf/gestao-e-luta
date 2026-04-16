import { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'

export default function Contato() {
  const [form, setForm] = useState({ nome: '', matricula: '', email: '', mensagem: '' })
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulação de envio — integre com EmailJS, Formspree ou backend real
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setEnviado(true)
    setForm({ nome: '', matricula: '', email: '', mensagem: '' })
  }

  return (
    <section id="contato" className="py-24 bg-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="font-heading text-gold-500 text-sm tracking-widest uppercase mb-2">Fale conosco</p>
          <h2 className="section-title">Contato</h2>
          <span className="gold-line mx-auto" />
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Sua opinião e suas dúvidas são importantes. Entre em contato diretamente com nossa equipe.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Message form */}
          <div>
            <h3 className="font-heading text-xl text-white tracking-widest mb-6">Envie uma mensagem</h3>

            {enviado ? (
              <div className="bg-gold-500/10 border border-gold-500/40 p-8 text-center">
                <CheckCircle2 className="text-gold-500 mx-auto mb-3" size={40} />
                <p className="font-heading text-white tracking-widest text-lg mb-2">Mensagem enviada!</p>
                <p className="text-gray-400 text-sm">Entraremos em contato em breve. Obrigado, companheiro!</p>
                <button
                  onClick={() => setEnviado(false)}
                  className="mt-6 btn-outline text-sm"
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-heading text-xs text-gray-400 uppercase tracking-widest mb-1.5">Nome completo *</label>
                    <input
                      name="nome"
                      value={form.nome}
                      onChange={handleChange}
                      required
                      placeholder="Seu nome"
                      className="w-full bg-navy-950 border border-navy-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors placeholder-navy-600"
                    />
                  </div>
                  <div>
                    <label className="block font-heading text-xs text-gray-400 uppercase tracking-widest mb-1.5">Matrícula</label>
                    <input
                      name="matricula"
                      value={form.matricula}
                      onChange={handleChange}
                      placeholder="Opcional"
                      className="w-full bg-navy-950 border border-navy-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors placeholder-navy-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-heading text-xs text-gray-400 uppercase tracking-widest mb-1.5">E-mail *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="seu@email.com"
                    className="w-full bg-navy-950 border border-navy-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors placeholder-navy-600"
                  />
                </div>

                <div>
                  <label className="block font-heading text-xs text-gray-400 uppercase tracking-widest mb-1.5">Mensagem *</label>
                  <textarea
                    name="mensagem"
                    value={form.mensagem}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Escreva sua mensagem, sugestão ou dúvida..."
                    className="w-full bg-navy-950 border border-navy-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors placeholder-navy-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Enviar Mensagem
                    </>
                  )}
                </button>

                <p className="text-gray-600 text-xs text-center">
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
