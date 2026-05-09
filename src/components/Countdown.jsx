function pad(n) { return String(n).padStart(2, '0') }

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative bg-navy-900/80 dark:bg-navy-900 border border-gold-500/30 px-4 py-3 min-w-[68px] text-center
                      shadow-lg shadow-gold-500/10 overflow-hidden group">
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
  return <span className="text-gold-500/60 text-2xl font-heading mt-3 select-none">:</span>
}

export default function Countdown() {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-heading text-xs text-amber-400 tracking-widest uppercase">
        ⚖️ Eleição suspensa por decisão judicial
      </p>
      <div className="flex items-start gap-2 md:gap-4">
        <Unit value={0} label="Dias" />
        <Separator />
        <Unit value={0} label="Horas" />
        <Separator />
        <Unit value={0} label="Min" />
        <Separator />
        <Unit value={0} label="Seg" />
      </div>
    </div>
  )
}
