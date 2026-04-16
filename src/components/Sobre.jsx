export default function Sobre() {
  const pilares = [
    { num: '01', titulo: 'Transparência', texto: 'Gestão aberta com prestação de contas mensal, atas públicas e portal de transparência online.' },
    { num: '02', titulo: 'Compromisso',   texto: 'Cada proposta tem prazo e responsável definidos. Cobrança pública dos resultados a cada 6 meses.' },
    { num: '03', titulo: 'Resultado',     texto: 'Histórico comprovado de conquistas. Não promessas — entregas. O sindicalizado merece ver mudanças reais.' },
  ]

  return (
    <section id="sobre" className="py-24 bg-slate-50 dark:bg-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <p className="font-heading text-gold-500 text-sm tracking-widest uppercase mb-2">Sobre a chapa</p>
            <h2 className="section-title">
              Uma nova era<br />para o Sindpol-RJ
            </h2>
            <span className="gold-line" />
            <p className="text-slate-700 dark:text-gray-300 leading-relaxed mb-4">
              A chapa <strong className="text-slate-900 dark:text-white font-heading tracking-wide">GESTÃO &amp; LUTA</strong> foi construída contemplando todos os cargos e gerações da Polícia Civil. Aqui estão policiais mais novos e os mais experientes — todos reunidos num consenso sobre os rumos que o sindicato e a polícia devem seguir.
            </p>
            <p className="text-slate-700 dark:text-gray-300 leading-relaxed mb-4">
              <span className="text-gold-400 font-heading tracking-wide">Você conhece o nosso trabalho. Você nos viu trabalhando.</span> O nosso compromisso agora é maior. Nós sabemos fazer, já fizemos, e vamos fazer muito mais agora que estamos melhor estruturados.
            </p>
            <p className="text-slate-700 dark:text-gray-300 leading-relaxed mb-8">
              Não adianta só apoiar — <span className="text-gold-400">venha votar</span>. Conte conosco.
            </p>
            <a href="#propostas" className="btn-primary inline-block">
              Ver todas as propostas
            </a>
          </div>

          {/* Pilares */}
          <div className="space-y-4">
            {pilares.map((p) => (
              <div key={p.num} className="card group flex gap-5 items-start">
                <span className="font-heading text-5xl text-gold-500/20 group-hover:text-gold-500/40 transition-colors leading-none flex-shrink-0">
                  {p.num}
                </span>
                <div>
                  <h3 className="font-heading text-xl text-slate-900 dark:text-white tracking-widest mb-1">{p.titulo}</h3>
                  <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">{p.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 dark:bg-navy-700">
          {[
            { valor: '4.000+',   label: 'Filiados atendidos' },
            { valor: '9',        label: 'Membros na chapa' },
            { valor: '+SINDPOL', label: 'Interior e Capital' },
            { valor: '100%',     label: 'Transparência' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-50 dark:bg-navy-900 px-8 py-8 text-center">
              <div className="font-heading text-3xl md:text-4xl text-gold-500 mb-1">{s.valor}</div>
              <div className="text-slate-500 dark:text-gray-400 text-xs uppercase tracking-widest font-heading">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
