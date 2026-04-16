import { CheckCircle2 } from 'lucide-react'
import { propostas } from '../data/propostas'

export default function Propostas() {
  return (
    <section id="propostas" className="py-24 bg-slate-50 dark:bg-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="font-heading text-gold-500 text-sm tracking-widest uppercase mb-2">Nossa plataforma</p>
          <h2 className="section-title">Propostas</h2>
          <span className="gold-line mx-auto" />
          <p className="text-slate-600 dark:text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Não são apenas promessas. São compromissos com prazo, responsável e método claro de execução.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {propostas.map((p) => (
            <div key={p.id} className="card group hover:-translate-y-1 transition-all duration-300">
              {/* Icon + title */}
              <div className="flex items-start gap-4 mb-4">
                <span className="text-3xl">{p.icone}</span>
                <div>
                  <h3 className="font-heading text-lg text-slate-900 dark:text-white tracking-wide">{p.titulo}</h3>
                  <div className="w-8 h-0.5 bg-gold-500 mt-1.5 group-hover:w-16 transition-all duration-300" />
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed mb-4">{p.descricao}</p>

              {/* Points */}
              <ul className="space-y-2">
                {p.pontos.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-gray-300">
                    <CheckCircle2 size={14} className="text-gold-500 flex-shrink-0 mt-0.5" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Download CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block border border-gold-500/30 bg-gold-500/5 px-8 py-6">
            <p className="text-slate-700 dark:text-gray-300 text-sm mb-4">Conheça as Propostas da Chapa 3</p>
            <button className="btn-primary">
              Faça o Download
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
