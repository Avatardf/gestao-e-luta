import { useState, useEffect, useCallback } from 'react'
import { Star, Trophy, Users, Loader2, Download, Share2, Zap } from 'lucide-react'
import { acoesImediatas } from '../data/acoesImediatas'
import { supabase } from '../lib/supabase'
import { useVisitor } from '../hooks/useVisitor'
import { generateChapaPDF } from '../utils/generatePDF'
import { generateAcaoShareImage } from '../utils/generateAcaoShareImage'
import Navbar from '../components/Navbar'

// ─── Persistência local ───────────────────────────────────────────────────────
function loadLocalRatings() {
  try { return JSON.parse(localStorage.getItem('gl-acao-ratings') || '{}') } catch { return {} }
}
function saveLocalRating(id, value) {
  const c = loadLocalRatings(); c[id] = value
  localStorage.setItem('gl-acao-ratings', JSON.stringify(c))
}

// ─── Estrelas somente leitura ─────────────────────────────────────────────────
function StarsDisplay({ value, size = 14 }) {
  const full = Math.floor(value)
  const frac = value - full
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

// ─── Avaliação interativa ─────────────────────────────────────────────────────
function StarRating({ acaoId, value, submitting, onChange }) {
  const [hover, setHover] = useState(0)
  const labels = ['', 'Pouco urgente', 'Urgente', 'Muito urgente', 'Essencial', 'Prioridade máxima']
  const active = hover || value

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-navy-700">
      <p className="font-heading text-xs text-slate-500 dark:text-gray-500 tracking-widest uppercase mb-2">
        {value > 0 ? 'Sua avaliação' : 'Avaliar urgência'}
      </p>
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(star => (
          <button
            key={star}
            onClick={() => !submitting && onChange(acaoId, star)}
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

// ─── Card de ação ─────────────────────────────────────────────────────────────
function AcaoCard({ acao, userRating, communityData, submitting, onRate }) {
  const { media, total, loading } = communityData
  const [sharing, setSharing] = useState(false)

  async function handleShare() {
    setSharing(true)
    try {
      const imageFile = await generateAcaoShareImage(acao)
      const url  = 'https://gestao-e-luta.vercel.app/acoes-imediatas'
      const text = `Ação imediata nº ${acao.id} da Chapa GESTÃO E LUTA: "${acao.titulo}". Conheça as propostas e ações imediatas!`

      if (navigator.share && navigator.canShare?.({ files: [imageFile] })) {
        await navigator.share({ title: acao.titulo, text, url, files: [imageFile] })
      } else if (navigator.share) {
        await navigator.share({ title: acao.titulo, text, url })
      } else {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(imageFile)
        a.download = imageFile.name
        a.click()
        await navigator.clipboard.writeText(url).catch(() => {})
        alert('Imagem baixada!')
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', e)
        alert('Não foi possível compartilhar. Tente novamente.')
      }
    }
    setSharing(false)
  }

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-6
                    hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-500/5 hover:border-gold-500/40
                    transition-all duration-300 group flex flex-col">

      {/* Número + emoji + nota */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-heading font-bold text-gold-500 text-2xl tabular-nums shrink-0 leading-none">
            {String(acao.id).padStart(2, '0')}
          </span>
          <span className="text-2xl leading-none shrink-0">{acao.icone}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-slate-900 dark:text-white tracking-wide leading-tight text-base">
              {acao.titulo}
            </h3>
            <div className="w-8 h-0.5 bg-gold-500 mt-1.5 group-hover:w-14 transition-all duration-300" />
          </div>
        </div>
        <NotaBadge media={media} total={total} loading={loading} />
      </div>

      {/* Barra de nota */}
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

      {/* Descrição */}
      <p className="text-slate-700 dark:text-amber-200/90 leading-relaxed mb-4 flex-1 text-sm">
        {acao.descricao}
      </p>

      {/* Botão compartilhar */}
      <button
        onClick={handleShare}
        disabled={sharing}
        className="w-full flex items-center justify-center gap-2 py-2.5 mt-1 mb-1
                   border border-gold-500/40 text-gold-600 dark:text-gold-400
                   hover:bg-gold-500 hover:text-navy-950 hover:border-gold-500
                   font-heading text-xs tracking-widest uppercase
                   transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
      >
        {sharing
          ? <><Loader2 size={13} className="animate-spin" /> Gerando imagem…</>
          : <><Share2 size={13} /> Compartilhar ação</>
        }
      </button>

      <StarRating
        acaoId={acao.id}
        value={userRating}
        submitting={submitting}
        onChange={onRate}
      />
    </div>
  )
}

// ─── Ranking comunitário ──────────────────────────────────────────────────────
function RankingComunidade({ communityMap }) {
  const ranked = acoesImediatas
    .filter(a => communityMap[a.id]?.total > 0)
    .sort((a, b) => (communityMap[b.id]?.media || 0) - (communityMap[a.id]?.media || 0))

  if (ranked.length === 0) return null

  return (
    <div className="bg-navy-950 dark:bg-navy-900 border border-gold-500/20 p-6 mt-12">
      <div className="flex items-center gap-3 mb-5">
        <Trophy size={18} className="text-gold-500" />
        <h3 className="font-heading text-gold-500 tracking-widest uppercase text-sm">
          Ranking de urgência — comunidade
        </h3>
      </div>
      <ol className="space-y-3">
        {ranked.map((a, i) => {
          const { media, total } = communityMap[a.id]
          return (
            <li key={a.id} className="flex items-center gap-3">
              <span className={`font-heading text-base w-6 text-right shrink-0 ${
                i === 0 ? 'text-gold-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-navy-600'
              }`}>{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-heading tracking-wide leading-tight truncate">
                  {a.icone} {a.titulo}
                </p>
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
export default function AcoesImediatasPage() {
  const [userRatings,  setUserRatings]  = useState(loadLocalRatings)
  const [communityMap, setCommunityMap] = useState(() =>
    Object.fromEntries(acoesImediatas.map(a => [a.id, { media: 0, total: 0, loading: true }]))
  )
  const [submitting,  setSubmitting]  = useState({})
  const [pdfLoading,  setPdfLoading]  = useState(false)
  const [pdfSharing,  setPdfSharing]  = useState(false)
  const [cachedPdf,   setCachedPdf]   = useState(null)
  const visitor = useVisitor()

  useEffect(() => { window.scrollTo(0, 0) }, [])

  // Pré-gera o PDF em background para que o share seja instantâneo (iOS/Android)
  useEffect(() => {
    let cancelled = false
    generateChapaPDF({ returnBlob: true })
      .then(file => { if (!cancelled) setCachedPdf(file) })
      .catch(() => {}) // falha silenciosa — gera no momento do share
    return () => { cancelled = true }
  }, [])

  // ── Carrega médias do Supabase ──────────────────────────────────────────────
  const loadCommunityRatings = useCallback(async () => {
    const { data, error } = await supabase
      .from('action_ratings')
      .select('action_id, rating')

    if (error || !data) {
      setCommunityMap(prev =>
        Object.fromEntries(Object.entries(prev).map(([id, v]) => [id, { ...v, loading: false }]))
      )
      return
    }

    const grouped = {}
    data.forEach(({ action_id, rating }) => {
      if (!grouped[action_id]) grouped[action_id] = []
      grouped[action_id].push(rating)
    })

    setCommunityMap(
      Object.fromEntries(
        acoesImediatas.map(a => {
          const list  = grouped[a.id] || []
          const media = list.length ? list.reduce((x, y) => x + y, 0) / list.length : 0
          return [a.id, { media, total: list.length, loading: false }]
        })
      )
    )
  }, [])

  // ── Carrega avaliação própria do Supabase (por IP) ──────────────────────────
  useEffect(() => {
    if (!visitor?.ip) return
    async function loadMyRatings() {
      const { data } = await supabase
        .from('action_ratings')
        .select('action_id, rating')
        .eq('ip_address', visitor.ip)
      if (data && data.length > 0) {
        const fromDb = Object.fromEntries(data.map(r => [r.action_id, r.rating]))
        const merged = { ...loadLocalRatings(), ...fromDb }
        setUserRatings(merged)
        localStorage.setItem('gl-acao-ratings', JSON.stringify(merged))
      }
    }
    loadMyRatings()
  }, [visitor])

  useEffect(() => { loadCommunityRatings() }, [loadCommunityRatings])

  // ── Submete avaliação ───────────────────────────────────────────────────────
  async function handleRate(id, value) {
    const novo = { ...userRatings, [id]: value }
    setUserRatings(novo)
    saveLocalRating(id, value)
    setSubmitting(s => ({ ...s, [id]: true }))

    if (visitor?.ip) {
      await supabase.from('action_ratings').upsert(
        { action_id: id, rating: value, ip_address: visitor.ip },
        { onConflict: 'action_id,ip_address' }
      )
      await loadCommunityRatings()
    }
    setSubmitting(s => ({ ...s, [id]: false }))
  }

  // ── PDF ─────────────────────────────────────────────────────────────────────
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

  async function handleSharePDF() {
    if (pdfSharing) return
    setPdfSharing(true)
    try {
      // Usa PDF pré-gerado (sem await = gesto preservado no iOS/Android)
      // Caso não esteja pronto ainda, gera agora (pode falhar no iOS)
      const file = cachedPdf ?? await generateChapaPDF({ returnBlob: true })
      const url  = 'https://gestao-e-luta.vercel.app/'
      const text = 'Conheça as propostas e as ações imediatas da Chapa 3 — GESTÃO E LUTA!'
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: 'Chapa 3 — Gestão e Luta', text, url, files: [file] })
      } else {
        alert('Seu dispositivo não suporta compartilhamento direto de arquivos. Use o botão "Baixar PDF" e compartilhe o arquivo manualmente.')
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        console.error('Erro ao compartilhar PDF:', e)
        alert('Não foi possível compartilhar. Tente novamente.')
      }
    } finally {
      setPdfSharing(false)
    }
  }

  const totalAvaliadas = Object.keys(userRatings).length

  return (
    <div className="min-h-screen bg-white dark:bg-navy-950">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative bg-navy-950 pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(45deg,#C9A227,#C9A227 1px,transparent 1px,transparent 40px)` }} />
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

        <div className="relative z-10 text-center px-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 px-4 py-1.5 mb-4">
            <Zap size={13} className="text-gold-500" />
            <span className="font-heading text-gold-500 text-xs tracking-widest uppercase">Chapa 3 — SINDPOL-RJ</span>
          </div>

          <h1 className="font-heading font-bold text-white text-5xl md:text-7xl tracking-widest uppercase mb-4">
            Ações Imediatas
          </h1>
          <div className="flex items-center justify-center gap-4 my-4">
            <div className="h-px bg-gold-500/40 flex-1 max-w-24" />
            <span className="text-gold-500">✦</span>
            <div className="h-px bg-gold-500/40 flex-1 max-w-24" />
          </div>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            <span className="text-gold-400 font-medium">Quem já fez e sabe o caminho não precisa prometer ilusões.</span>
            <br />
            Estas são as ações que executaremos nos primeiros dias de gestão — não promessas, mas compromissos com responsabilidade.
            <br className="hidden sm:block" />
            <span className="text-gold-400">Avalie de 1 a 5 quais ações são mais urgentes para você.</span>
          </p>

          {totalAvaliadas > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 px-4 py-2">
              <Star size={14} className="text-gold-500 fill-gold-500" />
              <span className="font-heading text-gold-400 text-xs tracking-widest uppercase">
                {totalAvaliadas} de {acoesImediatas.length} ações avaliadas por você
              </span>
            </div>
          )}

          {/* Botões PDF */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading || pdfSharing}
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-heading text-xs tracking-widest uppercase px-6 py-3 transition-all disabled:opacity-60 disabled:cursor-wait shadow-lg shadow-gold-500/20"
            >
              {pdfLoading
                ? <><Loader2 size={14} className="animate-spin" /> Gerando PDF…</>
                : <><Download size={14} /> Baixar PDF (Propostas + Ações)</>
              }
            </button>
            <button
              onClick={handleSharePDF}
              disabled={pdfLoading || pdfSharing}
              className="inline-flex items-center gap-2 border border-gold-500/60 text-gold-400 hover:bg-gold-500/10 font-heading text-xs tracking-widest uppercase px-6 py-3 transition-all disabled:opacity-60 disabled:cursor-wait"
            >
              {pdfSharing
                ? <><Loader2 size={14} className="animate-spin" /> Gerando PDF…</>
                : <><Share2 size={14} /> Compartilhar PDF</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Grid de Ações ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {acoesImediatas.map(a => (
            <AcaoCard
              key={a.id}
              acao={a}
              userRating={userRatings[a.id] || 0}
              communityData={communityMap[a.id] || { media: 0, total: 0, loading: false }}
              submitting={!!submitting[a.id]}
              onRate={handleRate}
            />
          ))}
        </div>

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
