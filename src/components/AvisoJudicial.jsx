import { useState } from 'react'
import { Scale, X } from 'lucide-react'

export default function AvisoJudicial() {
  const [closed, setClosed] = useState(false)
  if (closed) return null

  return (
    <div className="relative mt-16 z-40 bg-navy-950 border-b-2 border-amber-500/70">
      <div className="max-w-4xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-start gap-4">

          {/* Ícone */}
          <div className="flex-shrink-0 mt-0.5 w-9 h-9 bg-amber-500/15 border border-amber-500/40 flex items-center justify-center">
            <Scale size={18} className="text-amber-400" />
          </div>

          {/* Texto */}
          <div className="flex-1 min-w-0">
            <p className="font-heading text-amber-400 text-[10px] tracking-widest uppercase mb-2">
              ⚖️ Nota Oficial — Chapa 3 · Gestão &amp; Luta
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              Em virtude de decisão judicial que determinou a suspensão do processo eleitoral
              do SINDPOL-RJ, informamos que a Chapa 3 — Gestão e Luta{' '}
              <strong className="text-white">
                não reconhece as alegações de nulidade dos atos que ensejaram a presente ação.
              </strong>{' '}
              Estamos acompanhando de perto a tramitação do processo e esperamos uma decisão
              favorável à continuidade do pleito eleitoral, onde a categoria poderá escolher
              livremente a sua nova diretoria.
            </p>
            <p className="font-heading text-amber-400 text-[10px] tracking-widest uppercase mt-3">
              Luiz Cláudio &nbsp;·&nbsp; Candidato a Presidente &nbsp;·&nbsp; Chapa 3 — Gestão e Luta
            </p>
          </div>

          {/* Fechar */}
          <button
            onClick={() => setClosed(true)}
            aria-label="Fechar aviso"
            className="flex-shrink-0 text-amber-500/50 hover:text-amber-400 transition-colors duration-200 mt-0.5"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
