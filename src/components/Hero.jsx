import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import Countdown from './Countdown'

function Particle({ style }) {
  return (
    <div
      className="absolute rounded-full bg-gold-500 opacity-0 animate-fade-in-up"
      style={style}
    />
  )
}

const particles = Array.from({ length: 18 }, (_, i) => ({
  width:  `${4 + (i % 5) * 3}px`,
  height: `${4 + (i % 5) * 3}px`,
  left:   `${5 + (i * 5.3) % 90}%`,
  top:    `${10 + (i * 7.1) % 80}%`,
  opacity: `${0.04 + (i % 4) * 0.025}`,
  animationDelay: `${i * 0.18}s`,
  animationDuration: `${3 + (i % 3)}s`,
  animationName: 'floatY',
  animationIterationCount: 'infinite',
  animationTimingFunction: 'ease-in-out',
}))

export default function Hero() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t) }, [])

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-navy-950 pt-16">

      {/* Diagonal grid */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg,#C9A227,#C9A227 1px,transparent 1px,transparent 44px)`
        }} />
      </div>

      {/* Radial glow center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-gold-500/5 blur-3xl" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((s, i) => <Particle key={i} style={s} />)}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-white dark:from-navy-950/70 dark:via-transparent dark:to-navy-950" />

      {/* Gold accent bar top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">

        {/* Badge */}
        <div className={`transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="inline-flex items-center gap-2 border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 mb-8 glow-pulse">
            <span className="w-2 h-2 bg-gold-500 rounded-full pulse-gold inline-block" />
            <span className="font-heading text-gold-400 text-xs tracking-widest uppercase">
              Eleição Sindpol-RJ · Chapa Nº 3
            </span>
          </div>
        </div>

        {/* Main title */}
        <div className={`transition-all duration-700 delay-100 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1
            className="font-heading font-bold uppercase text-slate-900 dark:text-white leading-none mb-4"
            style={{ fontSize: 'clamp(3.5rem, 12vw, 9rem)', letterSpacing: '0.08em' }}
          >
            GESTÃO
            <span className="block text-gold-500 shimmer-text" style={{ fontSize: '0.9em' }}>&amp; LUTA</span>
          </h1>
        </div>

        {/* Divider */}
        <div className={`flex items-center justify-center gap-4 my-6 transition-all duration-700 delay-200 ${loaded ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}>
          <div className="h-px bg-gold-500/40 flex-1 max-w-32" />
          <span className="text-gold-500 text-lg float-y">✦</span>
          <div className="h-px bg-gold-500/40 flex-1 max-w-32" />
        </div>

        {/* Slogan */}
        <div className={`transition-all duration-700 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="font-heading text-slate-600 dark:text-gray-300 tracking-widest text-sm md:text-base uppercase mb-12">
            GESTÃO PARA ORGANIZAR | LUTA PARA VENCER
          </p>
        </div>

        {/* CTAs */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-700 delay-400 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <a href="#votacao" className="btn-primary inline-block text-center">
            Simular meu Voto
          </a>
          <Link to="/propostas" className="btn-outline inline-block text-center">
            Ver Propostas
          </Link>
        </div>

        {/* Countdown */}
        <div className={`transition-all duration-700 delay-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Countdown />
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#sobre"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gold-500/60 hover:text-gold-500 transition-all duration-300 hover:scale-110"
        style={{ animation: 'fadeInDown 1s ease 1.2s both' }}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="font-heading text-xs tracking-widest uppercase text-gold-500/40">scroll</span>
          <ChevronDown size={28} className="animate-bounce" />
        </div>
      </a>

      {/* Gold accent bar bottom */}
      <div className="wave-sep" />
    </section>
  )
}
