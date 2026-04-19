import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, Star, ArrowLeft, Trophy, Users, Loader2, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { propostas, temas } from '../data/propostas'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { useVisitor } from '../hooks/useVisitor'
import { Sun, Moon } from 'lucide-react'
import { generateChapaPDF } from '../utils/generatePDF'

// ─── Persistência local (fallback) ───────────────────────────────────────────
function loadLocalRatings() {
  try { return JSON.parse(localStorage.getItem('gl-ratings') || '{}') } catch { return {} }
}
function saveLocalRating(id, value) {
  const c = loadLocalRatings(); c[id] = value
  localStorage.setItem('gl-ratings', JSON.stringify(c))
}

// ─── Estrelas somente leitura (nota da comunidade) ───────────────────────────
function StarsDisplay({ value, size = 14 }) {
  const full  = Math.floor(value)
  const frac  = value - full
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <span key={s} className="relative inline-block" style={{ width: size, height: size }}>
          <Star size={size} className="text-slate-300 dark:text-navy-700 absolute inset-0" />
          {s <= full && <Star size={size} className="text-gold-500 fill-gold-500 absolute inset-0" />}
          {s === full + 1 && frac > 0 && (
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${frac * 100}%` }}>
              <Star size={size} className="text-gold-500 fill-gold-500" />
            </span>
          )}
        </span>
      ))}
    </div>
  )
}

// ─── Badge nota comunitária ───────────────────────────────────────────────────
function NotaBadge({ media, total, loading }) {
  if (loading) return (
    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 px-2.5 py-1.5 shrink-0">
      <Loader2 size={11} className="text-gold-500 animate-spin" />
    </div>
  )
  if (total === 0) return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 px-2.5 py-1.5 shrink-0">
      <Star size={11} className="text-slate-400 dark:text-navy-600" />
      <span className="font-heading text-xs text-slate-400 dark:text-gray-600 tracking-wide">Sem votos</span>
    </div>
  )
  return (
    <div className="flex flex-col items-end gap-0.5 shrink-0">
      <div className="flex items-center gap-1.5 bg-gold-500/10 border border-gold-500/30 px-2.5 py-1.5">
        <span className="font-heading text-sm text-gold-500 tabular-nums">{media.toFixed(1)}</span>
        <StarsDisplay value={media} size={11} />
      </div>
      <span className="flex items-center gap-1 text-slate-400 dark:text-gray-600 text-[10px] font-heading tracking-wide">
        <Users size={9} />{total} {total === 1 ? 'voto' : 'votos'}
      </span>
    </div>
  )
}

// ─── Avaliação interativa do usuário ─────────────────────────────────────────
function StarRating({ propostaId, value, submitting, onChange }) {
  const [hover, setHover] = useState(0)
  const labels = ['', 'Pouco importante', 'Importante', 'Muito importante', 'Essencial', 'Prioridade máxima']
  const active = hover || value

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-navy-700">
      <p className="font-heading text-xs text-slate-500 dark:text-gray-500 tracking-widest uppercase mb-2">
        {value > 0 ? 'Sua avaliação' : 'Avaliar importância'}
      </p>
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(star => (
          <button
            key={star}
            onClick={() => !submitting && onChange(propostaId, star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            disabled={submitting}
            className="transition-transform hover:scale-125 focus:outline-none disabled:opacity-50"
            title={labels[star]}
          >
            <Star
              size={22}
              className={`transition-colors duration-150 ${
                star <= active ? 'text-gold-500 fill-gold-500' : 'text-slate-300 dark:text-navy-600'
              }`}
            />
          </button>
        ))}
        {submitting && <Loader2 size={14} className="ml-2 text-gold-500 animate-spin" />}
        {!submitting && active > 0 && (
          <span className="ml-2 text-xs text-slate-500 dark:text-gray-400 font-heading tracking-wide">
            {labels[active]}
          </span>
        )}
      </div>
      {value > 0 && !submitting && (
        <p className="text-xs text-gold-500 mt-1 font-heading tracking-wide">✓ Avaliação registrada</p>
      )}
    </div>
  )
}

// ─── Card de proposta ─────────────────────────────────────────────────────────
function PropostaCard({ proposta, userRating, communityData, submitting, onRate, fonteLarge }) {
  const { media, total, loading } = communityData
  const txt  = fonteLarge ? 'text-base' : 'text-sm'
  const txt2 = fonteLarge ? 'text-base' : 'text-sm'

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-6
                    hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-500/5 hover:border-gold-500/40
                    transition-all duration-300 group flex flex-col">

      {/* Header: ícone + título + nota comunitária */}
      <div className="flex items-start gap-3 mb-4">
        <span className={`${fonteLarge ? 'text-3xl' : 'text-2xl'} shrink-0`}>{proposta.icone}</span>
        <div className="flex-1 min-w-0">
          <h3 className={`font-heading ${fonteLarge ? 'text-lg' : 'text-base'} text-slate-900 dark:text-white tracking-wide leading-tight`}>
            {proposta.titulo}
          </h3>
          <div className="w-8 h-0.5 bg-gold-500 mt-1.5 group-hover:w-14 transition-all duration-300" />
        </div>
        <NotaBadge media={media} total={total} loading={loading} />
      </div>

      {/* Barra de nota comunitária */}
      {!loading && total > 0 && (
        <div className="mb-3">
          <div className="h-1 bg-slate-100 dark:bg-navy-800 overflow-hidden rounded-full">
            <div
              className="h-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-700 rounded-full"
              style={{ width: `${(media / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Descrição — cor amarelada para melhor leitura no dark mode */}
      <p className={`${txt} text-amber-200/90 dark:text-amber-200/80 text-slate-700 dark:!text-amber-200/90 leading-relaxed mb-4 flex-1`}>
        {proposta.descricao}
      </p>

      <ul className="space-y-1.5 mb-2">
        {proposta.pontos.map((pt, i) => (
          <li key={i} className={`flex items-start gap-2 ${txt2} text-slate-700 dark:text-gray-300`}>
            <CheckCircle2 size={fonteLarge ? 15 : 13} className="text-gold-500 shrink-0 mt-0.5" />
            {pt}
          </li>
        ))}
      </ul>

      <StarRating
        propostaId={proposta.id}
        value={userRating}
        submitting={submitting}
        onChange={onRate}
      />
    </div>
  )
}

// ─── Ranking comunitário ──────────────────────────────────────────────────────
function RankingComunidade({ communityMap }) {
  const ranked = propostas
    .filter(p => communityMap[p.id]?.total > 0)
    .sort((a, b) => (communityMap[b.id]?.media || 0) - (communityMap[a.id]?.media || 0))

  if (ranked.length === 0) return null

  return (
    <div className="bg-navy-950 dark:bg-navy-900 border border-gold-500/20 p-6 mt-12">
      <div className="flex items-center gap-3 mb-5">
        <Trophy size={18} className="text-gold-500" />
        <h3 className="font-heading text-gold-500 tracking-widest uppercase text-sm">
          Ranking da comunidade
        </h3>
      </div>
      <ol className="space-y-3">
        {ranked.map((p, i) => {
          const { media, total } = communityMap[p.id]
          return (
            <li key={p.id} className="flex items-center gap-3">
              <span className={`font-heading text-base w-6 text-right shrink-0 ${
                i === 0 ? 'text-gold-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-navy-600'
              }`}>{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-heading tracking-wide leading-tight truncate">{p.titulo}</p>
                <div className="h-1 bg-navy-800 mt-1 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-700 rounded-full"
                    style={{ width: `${(media / 5) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StarsDisplay value={media} size={11} />
                <span className="font-heading text-gold-400 text-sm tabular-nums w-7 text-right">{media.toFixed(1)}</span>
              </div>
            </li>
          )
        })}
      </ol>
      <p className="text-navy-700 text-xs font-heading tracking-widest mt-5 text-right">
        Baseado nas avaliações de todos os usuários
      </p>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function PropostasPage() {
  const [temaAtivo, setTemaAtivo]   = useState('todos')
  const [userRatings, setUserRatings] = useState(loadLocalRatings)
  // communityMap: { [proposalId]: { media, total, loading } }
  const [communityMap, setCommunityMap] = useState(() =>
    Object.fromEntries(propostas.map(p => [p.id, { media: 0, total: 0, loading: true }]))
  )
  const [submitting, setSubmitting] = useState({}) // { [proposalId]: bool }
  const [pdfLoading, setPdfLoading] = useState(false)
  const [fonteLarge, setFonteLarge] = useState(false)
  const visitor = useVisitor()
  const { dark, toggle } = useTheme()

  async function handleDownloadPDF() {
    if (pdfLoading) return
    setPdfLoading(true)
    try {
      await generateChapaPDF()
    } catch (e) {
      console.error('Erro ao gerar PDF:', e)
      alert('Não foi possível gerar o PDF. Tente novamente.')
    } finally {
      setPdfLoading(false)
    }
  }

  useEffect(() => { window.scrollTo(0, 0) }, [])

  // ── Carrega médias do Supabase ──────────────────────────────────────────────
  const loadCommunityRatings = useCallback(async () => {
    const { data, error } = await supabase
      .from('proposal_ratings')
      .select('proposal_id, rating')

    if (error || !data) {
      // Tabela não existe ainda: zera loading
      setCommunityMap(prev =>
        Object.fromEntries(Object.entries(prev).map(([id, v]) => [id, { ...v, loading: false }]))
      )
      return
    }

    // Agrupa e calcula médias
    const grouped = {}
    data.forEach(({ proposal_id, rating }) => {
      if (!grouped[proposal_id]) grouped[proposal_id] = []
      grouped[proposal_id].push(rating)
    })

    setCommunityMap(
      Object.fromEntries(
        propostas.map(p => {
          const list = grouped[p.id] || []
          const media = list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0
          return [p.id, { media, total: list.length, loading: false }]
        })
      )
    )
  }, [])

  // ── Carrega avaliação própria do Supabase (por IP) ──────────────────────────
  useEffect(() => {
    if (!visitor?.ip) return
    async function loadMyRatings() {
      const { data } = await supabase
        .from('proposal_ratings')
        .select('proposal_id, rating')
        .eq('ip_address', visitor.ip)
      if (data && data.length > 0) {
        const fromDb = Object.fromEntries(data.map(r => [r.proposal_id, r.rating]))
        const merged = { ...loadLocalRatings(), ...fromDb }
        setUserRatings(merged)
        localStorage.setItem('gl-ratings', JSON.stringify(merged))
      }
    }
    loadMyRatings()
  }, [visitor])

  useEffect(() => { loadCommunityRatings() }, [loadCommunityRatings])

  // ── Submete avaliação ───────────────────────────────────────────────────────
  async function handleRate(id, value) {
    // Atualiza UI imediatamente
    const novo = { ...userRatings, [id]: value }
    setUserRatings(novo)
    saveLocalRating(id, value)
    setSubmitting(s => ({ ...s, [id]: true }))

    if (visitor?.ip) {
      await supabase.from('proposal_ratings').upsert(
        { proposal_id: id, rating: value, ip_address: visitor.ip },
        { onConflict: 'proposal_id,ip_address' }
      )
      await loadCommunityRatings()
    }
    setSubmitting(s => ({ ...s, [id]: false }))
  }

  const totalAvaliadas = Object.keys(userRatings).length
  const propostasFiltradas = temaAtivo === 'todos'
    ? propostas
    : propostas.filter(p => p.tema === temaAtivo)

  return (
    <div className="min-h-screen bg-white dark:bg-navy-950">

      {/* ── Topo ── */}
      <div className="bg-navy-950 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-gold-500 transition-colors font-heading text-xs tracking-widest uppercase">
            <ArrowLeft size={14} /> Voltar ao site
          </Link>
          <span className="font-heading text-white tracking-widest text-sm hidden sm:block">
            GESTÃO <span className="text-gold-500">&</span> LUTA
          </span>
          <button onClick={toggle} className="flex items-center gap-1.5 text-slate-400 hover:text-gold-500 transition-colors">
            {dark ? <Sun size={14} /> : <Moon size={14} />}
            <span className="font-heading text-xs tracking-widest uppercase">{dark ? 'Claro' : 'Escuro'}</span>
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="relative bg-navy-950 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(45deg,#C9A227,#C9A227 1px,transparent 1px,transparent 40px)` }} />
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
        <div className="relative z-10 text-center px-4">
          <p className="font-heading text-gold-500 text-sm tracking-widest uppercase mb-2">Nossa plataforma</p>
          <h1 className="font-heading font-bold text-white text-5xl md:text-7xl tracking-widest uppercase mb-4">Propostas</h1>
          <div className="flex items-center justify-center gap-4 my-4">
            <div className="h-px bg-gold-500/40 flex-1 max-w-24" />
            <span className="text-gold-500">✦</span>
            <div className="h-px bg-gold-500/40 flex-1 max-w-24" />
          </div>
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Não são apenas promessas. São compromissos com prazo, responsável e método claro de execução.
            <br />
            <span className="text-gold-400">Avalie de 1 a 5 quais propostas são mais importantes para você.</span>
          </p>
          {totalAvaliadas > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 px-4 py-2">
              <Star size={14} className="text-gold-500 fill-gold-500" />
              <span className="font-heading text-gold-400 text-xs tracking-widest uppercase">
                {totalAvaliadas} de {propostas.length} propostas avaliadas por você
              </span>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-heading text-xs tracking-widest uppercase px-6 py-3 transition-all disabled:opacity-60 disabled:cursor-wait shadow-lg shadow-gold-500/20"
            >
              {pdfLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Gerando PDF…
                </>
              ) : (
                <>
                  <Download size={14} />
                  Baixar PDF da Chapa
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-navy-950/95 backdrop-blur border-b border-slate-200 dark:border-navy-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-3">
            <button
              onClick={() => setTemaAtivo('todos')}
              className={`flex-shrink-0 font-heading text-xs tracking-widest uppercase px-4 py-2 transition-all ${
                temaAtivo === 'todos' ? 'bg-gold-500 text-navy-950' : 'text-slate-600 dark:text-gray-400 hover:text-gold-500 border border-slate-200 dark:border-navy-700'
              }`}
            >Todas</button>
            {temas.map(t => (
              <button
                key={t.id}
                onClick={() => setTemaAtivo(t.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 font-heading text-xs tracking-widest uppercase px-4 py-2 transition-all ${
                  temaAtivo === t.id ? 'bg-gold-500 text-navy-950' : 'text-slate-600 dark:text-gray-400 hover:text-gold-500 border border-slate-200 dark:border-navy-700'
                }`}
              >
                <span>{t.icone}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}

            {/* Botão aumento de fonte */}
            <button
              onClick={() => setFonteLarge(f => !f)}
              title="Aumentar / reduzir texto"
              className={`flex-shrink-0 ml-auto flex items-center gap-1.5 font-heading text-xs tracking-widest uppercase px-3 py-2 transition-all border ${
                fonteLarge
                  ? 'bg-gold-500 text-navy-950 border-gold-500'
                  : 'text-slate-600 dark:text-gray-400 hover:text-gold-500 border-slate-200 dark:border-navy-700'
              }`}
            >
              <span className="text-base font-bold leading-none">A</span>
              <span className="text-xs font-bold leading-none">A</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {temaAtivo !== 'todos' ? (
          <>
            <div className="mb-8">
              <h2 className="font-heading text-2xl text-slate-900 dark:text-white tracking-widest uppercase">
                {temas.find(t => t.id === temaAtivo)?.icone} {temas.find(t => t.id === temaAtivo)?.label}
              </h2>
              <div className="h-px bg-gold-500/40 mt-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propostasFiltradas.map(p => (
                <PropostaCard
                  key={p.id}
                  proposta={p}
                  userRating={userRatings[p.id] || 0}
                  communityData={communityMap[p.id] || { media: 0, total: 0, loading: false }}
                  submitting={!!submitting[p.id]}
                  onRate={handleRate}
                  fonteLarge={fonteLarge}
                />
              ))}
            </div>
          </>
        ) : (
          temas.map(tema => {
            const grupo = propostas.filter(p => p.tema === tema.id)
            if (!grupo.length) return null
            return (
              <div key={tema.id} className="mb-14">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{tema.icone}</span>
                  <div>
                    <h2 className="font-heading text-xl text-slate-900 dark:text-white tracking-widest uppercase">{tema.label}</h2>
                    <div className="h-0.5 bg-gold-500 w-12 mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {grupo.map(p => (
                    <PropostaCard
                      key={p.id}
                      proposta={p}
                      userRating={userRatings[p.id] || 0}
                      communityData={communityMap[p.id] || { media: 0, total: 0, loading: false }}
                      submitting={!!submitting[p.id]}
                      onRate={handleRate}
                    />
                  ))}
                </div>
              </div>
            )
          })
        )}

        <RankingComunidade communityMap={communityMap} />
      </div>

      {/* ── Rodapé ── */}
      <div className="border-t border-slate-100 dark:border-navy-800 py-6 text-center">
        <p className="text-slate-400 dark:text-gray-600 text-xs font-heading tracking-widest">
          &copy; {new Date().getFullYear()} Chapa GESTÃO &amp; LUTA — Sindpol-RJ
        </p>
      </div>
    </div>
  )
}
