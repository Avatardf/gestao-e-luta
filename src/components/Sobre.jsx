import { Link } from 'react-router-dom'
import { useInView, useCountUp } from '../hooks/useInView'

const pilares = [
  { num: '01', titulo: 'Integridade', texto: 'Conduta ética e irretocável em cada decisão, sem favorecimento nem política — porque o sindicalizado merece representantes honestos.' },
  { num: '02', titulo: 'Compromisso',   texto: 'Cada proposta tem prazo e responsável definidos. Cobrança pública dos resultados a cada 6 meses.' },
  { num: '03', titulo: 'Resultado',     texto: 'Histórico comprovado de conquistas. Não promessas — entregas. O sindicalizado merece ver mudanças reais.' },
]

const stats = [
  { valor: '4000', sufixo: '+', label: 'Filiados atendidos' },
  { valor: '9',    sufixo: '',  label: 'Membros na chapa' },
  { valor: '',     raw: '+SINDPOL', label: 'Interior e Capital' },
  { valor: '100',  sufixo: '%', label: 'Integridade' },
]

function StatItem({ stat, inView }) {
  const count = useCountUp(parseInt(stat.valor) || 0, 1400, inView)
  return (
    <div className="bg-white dark:bg-navy-950 px-8 py-8 text-center group hover:bg-gold-500/5 transition-colors duration-300">
      <div className="font-heading text-3xl md:text-4xl text-gold-500 mb-1 tabular-nums group-hover:scale-110 transition-transform duration-300 inline-block">
        {stat.raw ? stat.raw : `${count.toLocaleString('pt-BR')}${stat.sufixo}`}
      </div>
      <div className="text-slate-500 dark:text-gray-400 text-xs uppercase tracking-widest font-heading">{stat.label}</div>
    </div>
  )
}

export default function Sobre() {
  const [textRef, textInView]   = useInView()
  const [pilarRef, pilarInView] = useInView()
  const [statsRef, statsInView] = useInView()

  return (
    <section id="sobre" className="py-28 bg-slate-50 dark:bg-navy-900 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gold-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text */}
          <div
            ref={textRef}
            className={`transition-all duration-700 ${textInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
          >
            <p className="font-heading text-gold-500 text-sm tracking-widest uppercase mb-2">Sobre a chapa</p>
            <h2 className="section-title">
              Uma nova era<br />para o Sindpol-RJ
            </h2>
            <span className="gold-line" />
            <p className="text-slate-700 dark:text-gray-300 leading-relaxed mb-4">
              A chapa <strong className="text-slate-900 dark:text-white font-heading tracking-wide">GESTÃO &amp; LUTA</strong> foi construída contemplando todos os cargos e gerações da Polícia Civil. Aqui estão policiais mais novos e os mais experientes — todos reunidos num consenso sobre os rumos que o sindicato e a polícia devem seguir.
            </p>
            <p className="text-slate-700 dark:text-gray-300 leading-relaxed mb-4">
              <span className="text-gold-600 dark:text-gold-400 font-semibold">Você conhece o nosso trabalho. Você nos viu trabalhando.</span> O nosso compromisso agora é maior. Nós sabemos fazer, já fizemos, e vamos fazer muito mais agora que estamos melhor estruturados.
            </p>
            <p className="text-slate-700 dark:text-gray-300 leading-relaxed mb-8">
              Não adianta só apoiar — <span className="text-gold-600 dark:text-gold-400">venha votar</span>. Conte conosco.
            </p>
            <Link to="/propostas" className="btn-primary inline-block">
              Ver todas as propostas
            </Link>
          </div>

          {/* Pilares */}
          <div ref={pilarRef} className="space-y-4">
            {pilares.map((p, i) => (
              <div
                key={p.num}
                className={`card group flex gap-5 items-start transition-all duration-700 ${pilarInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <span className="font-heading text-5xl text-gold-500/20 group-hover:text-gold-500/50 transition-colors duration-300 leading-none flex-shrink-0 tabular-nums">
                  {p.num}
                </span>
                <div>
                  <h3 className="font-heading text-xl text-slate-900 dark:text-white tracking-widest mb-1 group-hover:text-gold-500 transition-colors duration-300">{p.titulo}</h3>
                  <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">{p.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div
          ref={statsRef}
          className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 dark:bg-navy-700 overflow-hidden transition-all duration-700 ${statsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="transition-all duration-500"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <StatItem stat={s} inView={statsInView} />
            </div>
          ))}
        </div>
      </div>

      <div className="wave-sep" />
    </section>
  )
}
