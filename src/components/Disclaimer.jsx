import { useState, useEffect } from 'react'
import { X, ShieldCheck } from 'lucide-react'

const STORAGE_KEY = 'gl-disclaimer-accepted'

export default function Disclaimer() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY)
    if (!accepted) setVisible(true)
  }, [])

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(7,12,24,0.80)', backdropFilter: 'blur(4px)' }}
    >
      <div className="relative w-full max-w-lg bg-navy-950 border border-navy-700 shadow-2xl shadow-black/60 overflow-hidden">
        {/* Gold top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-navy-800">
          <div className="w-8 h-8 bg-gold-500/10 border border-gold-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck size={15} className="text-gold-500" />
          </div>
          <p className="font-heading text-xs tracking-widest uppercase text-gold-500">
            Aviso de Transparência
          </p>

          {/* Close (sem salvar no localStorage — volta no próximo acesso) */}
          <button
            onClick={() => setVisible(false)}
            className="ml-auto text-navy-500 hover:text-gray-300 transition-colors"
            aria-label="Fechar temporariamente"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 text-gray-300 text-sm leading-relaxed">
          <p>
            Este site foi desenvolvido de forma{' '}
            <span className="text-white font-semibold">voluntária e com recursos próprios</span>{' '}
            pelo servidor{' '}
            <span className="text-white font-semibold">Marcello Barros</span>{' '}
            <span className="text-gray-400">(matrícula&nbsp;888.779-6)</span>, em apoio à{' '}
            <span className="text-gold-400 font-semibold">Chapa 3 — Gestão&nbsp;&amp;&nbsp;Luta</span>.
          </p>
          <p className="text-gray-400 text-xs leading-relaxed">
            Não representa comunicação oficial do SINDPOL-RJ nem foi financiado com recursos
            do sindicato ou de qualquer chapa. Todo o conteúdo é de responsabilidade exclusiva
            do seu autor.
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center gap-3 px-6 pb-5">
          <button
            onClick={handleAccept}
            className="w-full sm:w-auto flex-1 bg-gold-500 hover:bg-gold-400 text-navy-950 font-heading font-bold text-xs tracking-widest uppercase px-6 py-3 transition-colors duration-200"
          >
            Entendi — não mostrar novamente
          </button>
          <button
            onClick={() => setVisible(false)}
            className="w-full sm:w-auto text-gray-500 hover:text-gray-300 font-heading text-xs tracking-widest uppercase px-4 py-3 transition-colors duration-200"
          >
            Fechar
          </button>
        </div>

        {/* Gold bottom bar */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
      </div>
    </div>
  )
}
