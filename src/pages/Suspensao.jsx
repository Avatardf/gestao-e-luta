import { useVisitor } from '../hooks/useVisitor'

export default function Suspensao() {
  useVisitor() // mantém o rastreamento de visitas

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">

      {/* Faixa dourada topo */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

      {/* Glow de fundo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-gold-500/4 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">

        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 border border-gold-500/40 bg-gold-500/10 px-4 py-1.5">
            <div className="w-6 h-6 bg-gold-500 flex items-center justify-center flex-shrink-0">
              <span className="text-navy-950 font-heading font-bold text-[10px]">GL</span>
            </div>
            <span className="font-heading text-gold-400 text-xs tracking-widest uppercase">
              Chapa 3 · SINDPOL-RJ
            </span>
          </div>
        </div>

        {/* Card principal */}
        <div className="border border-navy-700 bg-navy-900 p-8 md:p-12">

          {/* Ícone + título */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-5">⚖️</div>
            <h1 className="font-heading text-white text-xl md:text-2xl tracking-widest uppercase mb-2">
              Nota Oficial
            </h1>
            <div className="h-px bg-gold-500/40 w-16 mx-auto" />
            <p className="font-heading text-gold-500 text-xs tracking-widest uppercase mt-3">
              Chapa 3 — Gestão &amp; Luta
            </p>
          </div>

          {/* Texto da nota */}
          <div className="text-gray-300 text-sm leading-relaxed space-y-4 text-justify">
            <p>
              Em virtude de decisão judicial que determinou a suspensão do processo eleitoral
              do <strong className="text-white">SINDPOL-RJ</strong>, estamos suspendendo a nossa
              página oficial e informamos que a{' '}
              <strong className="text-gold-400">Chapa 3 — Gestão e Luta</strong> não reconhece
              as alegações de nulidade dos atos que ensejaram a presente ação.
            </p>
            <p>
              Estamos acompanhando de perto a tramitação do processo e esperamos uma decisão
              favorável à continuidade do pleito eleitoral, onde a categoria poderá escolher
              livremente a sua nova diretoria.
            </p>
            <p>
              Retornaremos com a nossa página assim que a justiça proferir uma decisão sobre
              o caso.
            </p>
          </div>

          {/* Assinatura */}
          <div className="mt-10 pt-8 border-t border-navy-700">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                <span className="font-heading text-gold-400 text-xs">LC</span>
              </div>
              <div>
                <p className="font-heading text-white text-sm tracking-wide">Luiz Cláudio</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  Candidato à Presidência · Chapa 3 — Gestão &amp; Luta · SINDPOL-RJ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data */}
        <p className="text-center text-gray-700 text-xs mt-6 font-heading tracking-widest">
          Rio de Janeiro, {new Date().toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
          })}
        </p>

      </div>

      {/* Faixa dourada base */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
    </div>
  )
}
