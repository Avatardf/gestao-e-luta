import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, Star, Trophy, Users, Loader2, Download, Share2 } from 'lucide-react'
import { propostas, temas } from '../data/propostas'
import { supabase } from '../lib/supabase'
import { useVisitor } from '../hooks/useVisitor'
import { generateChapaPDF } from '../utils/generatePDF'
import { generatePropostaShareImage } from '../utils/generatePropostaImage'
import Navbar from '../components/Navbar'

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

// ─── Escala de fontes por nível ───────────────────────────────────────────────
const FONTE = [
  { icone: 24, titulo: 16, descricao: 14, pontos: 14, check: 13 }, // nível 0 — normal
  { icone: 28, titulo: 19, descricao: 17, pontos: 16, check: 15 }, // nível 1 — médio
  { icone: 32, titulo: 22, descricao: 20, pontos: 19, check: 17 }, // nível 2 — grande
]

// ─── Card de proposta ─────────────────────────────────────────────────────────
function PropostaCard({ proposta, userRating, communityData, submitting, onRate, fonteLevel }) {
  const { media, total, loading } = communityData
  const f = FONTE[fonteLevel ?? 0]
  const [sharing, setSharing] = useState(false)

  async function handleShare() {
    setSharing(true)
    try {
      const imageFile = await generatePropostaShareImage(proposta)
      const url  = 'https://gestao-e-luta.vercel.app/propostas'
      const text = `Apoio essa proposta da Chapa GESTÃO E LUTA: "${proposta.titulo}". Conheça todas as propostas!`

      if (navigator.share && navigator.canShare?.({ files: [imageFile] })) {
        await navigator.share({ title: proposta.titulo, text, url, files: [imageFile] })
      } else if (navigator.share) {
        await navigator.share({ title: proposta.titulo, text, url })
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

      {/* Header: ícone + título + nota comunitária */}
      <div className="flex items-start gap-3 mb-4">
        <span style={{ fontSize: f.icone }} className="shrink-0 leading-none">{proposta.icone}</span>
        <div className="flex-1 min-w-0">
          <h3 style={{ fontSize: f.titulo }} className="font-heading text-slate-900 dark:text-white tracking-wide leading-tight">
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

      {/* Descrição — tom amarelado no dark mode para melhor leitura */}
      <p style={{ fontSize: f.descricao }} className="text-slate-700 dark:text-amber-200/90 leading-relaxed mb-4 flex-1">
        {proposta.descricao}
      </p>

      <ul className="space-y-1.5 mb-4">
        {proposta.pontos.map((pt, i) => (
          <li key={i} style={{ fontSize: f.pontos }} className="flex items-start gap-2 text-slate-700 dark:text-gray-300">
            <CheckCircle2 size={f.check} className="text-gold-500 shrink-0 mt-0.5" />
            {pt}
          </li>
        ))}
      </ul>

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
          : <><Share2 size={13} /> Compartilhar proposta</>
        }
      </button>

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
  const [pdfLoading,  setPdfLoading]  = useState(false)
  const [pdfSharing,  setPdfSharing]  = useState(false)
  const [fonteLevel, setFonteLevel] = useState(0) // 0 = normal, 1 = médio, 2 = grande
  const visitor = useVisitor()

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
      const file = await generateChapaPDF({ returnBlob: true })
      const url  = 'https://gestao-e-luta.vercel.app/'
      const text = 'Conheça as propostas e as ações imediatas da Chapa 3 — GESTÃO E LUTA!'

      // Tenta compartilhar com o arquivo; se não suportado, faz download
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ title: 'Chapa 3 — Gestão e Luta', text, url, files: [file] })
          return
        } catch (shareErr) {
          if (shareErr?.name === 'AbortError') return
          // Falhou o share — cai no download abaixo
        }
      }
      const blobUrl = URL.createObjectURL(file)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = file.name
      a.click()
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000)
    } catch (e) {
      console.error('Erro ao gerar PDF:', e)
      alert('Não foi possível gerar o PDF. Tente novamente.')
    } finally {
      setPdfSharing(false)
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
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative bg-navy-950 pt-36 pb-20 overflow-hidden">
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
            Não são apenas promessas. São compromissos com prazo, responsabilidade e método claro de execução.
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

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading || pdfSharing}
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-heading text-xs tracking-widest uppercase px-6 py-3 transition-all disabled:opacity-60 disabled:cursor-wait shadow-lg shadow-gold-500/20"
            >
              {pdfLoading ? (
                <><Loader2 size={14} className="animate-spin" /> Gerando PDF…</>
              ) : (
                <><Download size={14} /> Baixar PDF da Chapa</>
              )}
            </button>
            <button
              onClick={handleSharePDF}
              disabled={pdfLoading || pdfSharing}
              className="inline-flex items-center gap-2 border border-gold-500/60 text-gold-400 hover:bg-gold-500/10 font-heading text-xs tracking-widest uppercase px-6 py-3 transition-all disabled:opacity-60 disabled:cursor-wait"
            >
              {pdfSharing ? (
                <><Loader2 size={14} className="animate-spin" /> Gerando PDF…</>
              ) : (
                <><Share2 size={14} /> Compartilhar PDF</>
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

            {/* Botão 3 níveis de fonte */}
            <button
              onClick={() => setFonteLevel(l => (l + 1) % 3)}
              title={['Fonte normal — clique para aumentar', 'Fonte média — clique para aumentar mais', 'Fonte grande — clique para voltar ao normal'][fonteLevel]}
              className="flex-shrink-0 ml-auto flex items-center gap-0.5 px-3 py-2 border transition-all border-slate-200 dark:border-navy-700 hover:border-gold-500 hover:text-gold-500 text-slate-600 dark:text-gray-400"
            >
              {[0,1,2].map(i => (
                <span
                  key={i}
                  className="font-heading font-bold leading-none transition-colors"
                  style={{
                    fontSize: `${10 + i * 3}px`,
                    color: i <= fonteLevel ? '#d4af37' : undefined,
                  }}
                >A</span>
              ))}
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
                  fonteLevel={fonteLevel}
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
                      fonteLevel={fonteLevel}
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
