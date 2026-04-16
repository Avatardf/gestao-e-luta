import { ChevronDown } from 'lucide-react'
import Countdown from './Countdown'

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-navy-950">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #C9A227,
            #C9A227 1px,
            transparent 1px,
            transparent 40px
          )`
        }} />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 via-transparent to-navy-950" />

      {/* Gold accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 mb-8">
          <span className="w-2 h-2 bg-gold-500 rounded-full pulse-gold inline-block" />
          <span className="font-heading text-gold-400 text-xs tracking-widest uppercase">
            Eleição Sindpol-RJ · Chapa Nº 3
          </span>
        </div>

        {/* Main title */}
        <h1
          className="font-heading font-bold uppercase text-white leading-none mb-4"
          style={{ fontSize: 'clamp(3.5rem, 12vw, 9rem)', letterSpacing: '0.08em' }}
        >
          GESTÃO
          <span className="block text-gold-500" style={{ fontSize: '0.9em' }}>&amp; LUTA</span>
        </h1>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 my-6">
          <div className="h-px bg-gold-500/40 flex-1 max-w-32" />
          <span className="text-gold-500 text-lg">✦</span>
          <div className="h-px bg-gold-500/40 flex-1 max-w-32" />
        </div>

        {/* Slogan */}
        <p className="font-heading text-gray-300 tracking-widest text-sm md:text-base uppercase mb-12">
          Transparência · Compromisso · Resultado
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a href="#votacao" className="btn-primary inline-block text-center">
            Simular meu Voto
          </a>
          <a href="#propostas" className="btn-outline inline-block text-center">
            Ver Propostas
          </a>
        </div>

        {/* Countdown */}
        <Countdown />
      </div>

      {/* Scroll indicator */}
      <a
        href="#sobre"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gold-500/60 hover:text-gold-500 transition-colors animate-bounce"
      >
        <ChevronDown size={28} />
      </a>
    </section>
  )
}
