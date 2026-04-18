import { useState, useEffect } from 'react'

const ELECTION_DATE = new Date('2026-05-09T09:30:00')

function pad(n) { return String(n).padStart(2, '0') }

function getTimeLeft() {
  const diff = ELECTION_DATE - new Date()
  if (diff <= 0) return null
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative bg-navy-900/80 dark:bg-navy-900 border border-gold-500/30 px-4 py-3 min-w-[68px] text-center
                      shadow-lg shadow-gold-500/10 overflow-hidden group">
        {/* shine streak */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/8 to-transparent pointer-events-none" />
        <span className="font-heading text-3xl md:text-4xl text-gold-400 tabular-nums relative z-10 group-hover:text-gold-300 transition-colors">
          {pad(value)}
        </span>
      </div>
      <span className="font-heading text-xs text-slate-500 dark:text-gray-500 tracking-widest uppercase mt-2">{label}</span>
    </div>
  )
}

function Separator() {
  return <span className="text-gold-500/60 text-2xl font-heading mt-3 animate-pulse select-none">:</span>
}

export default function Countdown() {
  const [time, setTime] = useState(getTimeLeft())

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!time) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/50 px-6 py-3 glow-pulse">
          <span className="w-2.5 h-2.5 bg-gold-500 rounded-full animate-pulse inline-block" />
          <span className="text-gold-600 dark:text-gold-400 font-heading tracking-widest text-sm uppercase">Eleição em andamento!</span>
        </div>
        <p className="font-heading text-xs text-slate-500 dark:text-gray-500 tracking-widest uppercase">
          09 de maio de 2026 · a partir das 9h30
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-heading text-xs text-slate-500 dark:text-gray-500 tracking-widest uppercase">
        Eleição em <span className="text-gold-400">09/05/2026 às 9h30</span> · começa em
      </p>
      <div className="flex items-start gap-2 md:gap-4">
        <Unit value={time.days}    label="Dias" />
        <Separator />
        <Unit value={time.hours}   label="Horas" />
        <Separator />
        <Unit value={time.minutes} label="Min" />
        <Separator />
        <Unit value={time.seconds} label="Seg" />
      </div>
    </div>
  )
}
