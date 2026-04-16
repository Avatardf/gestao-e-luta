import { useState, useEffect } from 'react'

// Data fictícia da eleição — ajuste conforme necessário
const ELECTION_DATE = new Date('2025-10-15T09:00:00')

function pad(n) {
  return String(n).padStart(2, '0')
}

function getTimeLeft() {
  const diff = ELECTION_DATE - new Date()
  if (diff <= 0) return null
  const days    = Math.floor(diff / 86400000)
  const hours   = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds }
}

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-navy-900 border border-navy-700 px-4 py-3 min-w-[64px] text-center">
        <span className="font-heading text-3xl md:text-4xl text-gold-400">{pad(value)}</span>
      </div>
      <span className="font-heading text-xs text-gray-500 tracking-widest uppercase mt-2">{label}</span>
    </div>
  )
}

export default function Countdown() {
  const [time, setTime] = useState(getTimeLeft())

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!time) {
    return (
      <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 px-6 py-3">
        <span className="text-gold-400 font-heading tracking-widest text-sm uppercase">Eleição em andamento!</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-heading text-xs text-gray-500 tracking-widest uppercase">Eleição começa em</p>
      <div className="flex items-start gap-3 md:gap-5">
        <Unit value={time.days}    label="Dias" />
        <span className="text-gold-500 text-2xl font-heading mt-3">:</span>
        <Unit value={time.hours}   label="Horas" />
        <span className="text-gold-500 text-2xl font-heading mt-3">:</span>
        <Unit value={time.minutes} label="Min" />
        <span className="text-gold-500 text-2xl font-heading mt-3">:</span>
        <Unit value={time.seconds} label="Seg" />
      </div>
    </div>
  )
}
