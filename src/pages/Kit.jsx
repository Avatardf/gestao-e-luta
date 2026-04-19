import { useState, useEffect } from 'react'
import { ArrowLeft, Download, Share2, Loader2, ImageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { generateShareImage }         from '../utils/generateShareImage'
import { generatePropostaShareImage } from '../utils/generatePropostaImage'
import { generateDiretorCard }        from '../utils/generateDiretorCard'
import { generateVoteCard }           from '../utils/generateVoteCard'
import { generateContagemCard }       from '../utils/generateContagemCard'
import { generateChapaPDF }           from '../utils/generatePDF'
import { propostas }                  from '../data/propostas'
import { supabase }                   from '../lib/supabase'

const cargoMap = {
  1: 'Presidente',
  2: 'Vice-Presidente',
  3: 'Secretário',
  4: 'Tesoureira',
  5: 'Dir. Jurídico',
  6: 'Rel. Institucionais',
  7: 'Dir. de Inativos',
  8: 'Dir. do Interior',
  9: 'Cargos e Atribuições',
}

function getInitials(nome = '') {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

// A tabela 'directors' pode ter o campo como 'foto' ou 'foto_url'
function fotoSrc(dir) {
  return dir.foto_url || dir.foto || null
}

function DiretorAvatar({ dir }) {
  const src = fotoSrc(dir)
  if (src) {
    return (
      <img
        src={src}
        alt={dir.nome}
        className="w-12 h-12 rounded-full object-cover border border-gold-500/40 flex-shrink-0"
      />
    )
  }
  return (
    <div className="w-12 h-12 rounded-full bg-navy-800 border border-gold-500/40 flex items-center justify-center flex-shrink-0">
      <span className="font-heading text-gold-400 font-bold text-base leading-none">
        {getInitials(dir.nome)}
      </span>
    </div>
  )
}

// ─── KitCard ─────────────────────────────────────────────────────────────────
function KitCard({ title, subtitle, format, emoji, avatarEl, onDownload, onShare, loading, downloadLabel = 'Baixar PNG', shareLabel = 'Compartilhar' }) {
  return (
    <div className="bg-navy-900 border border-navy-700 hover:border-gold-500/40 transition-all duration-300 p-6 flex flex-col gap-4">
      {/* Topo: emoji/avatar + badge de formato */}
      <div className="flex items-start justify-between">
        {avatarEl
          ? <div className="leading-none select-none">{avatarEl}</div>
          : <span style={{ fontSize: 48 }} className="leading-none select-none">{emoji}</span>
        }
        <span className="bg-gold-500/10 border border-gold-500/30 text-gold-400 font-heading text-xs tracking-widest px-2.5 py-1 uppercase">
          {format}
        </span>
      </div>

      {/* Texto */}
      <div>
        <h3 className="font-heading text-white tracking-wide text-base leading-tight mb-1">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{subtitle}</p>
      </div>

      {/* Botões */}
      {loading ? (
        <div className="flex items-center justify-center py-3">
          <Loader2 size={20} className="text-gold-500 animate-spin" />
        </div>
      ) : (
        <div className="flex gap-2 mt-auto">
          <button
            onClick={onDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5
                       border border-gold-500/50 text-gold-400 font-heading text-xs tracking-widest uppercase
                       hover:bg-gold-500 hover:text-navy-950 transition-all duration-200"
          >
            <Download size={13} />
            {downloadLabel}
          </button>
          <button
            onClick={onShare}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5
                       bg-gold-500 text-navy-950 font-heading text-xs tracking-widest uppercase
                       hover:bg-gold-400 transition-all duration-200"
          >
            <Share2 size={13} />
            {shareLabel}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Página Kit ───────────────────────────────────────────────────────────────
export default function KitPage() {
  const [diretores,   setDiretores]   = useState([])
  const [loadingDirs, setLoadingDirs] = useState(true)
  const [generating,  setGenerating]  = useState({})

  useEffect(() => {
    window.scrollTo(0, 0)
    supabase
      .from('directors')
      .select('*')
      .order('id')
      .then(({ data }) => {
        setDiretores(data || [])
        setLoadingDirs(false)
      })
      .catch(() => setLoadingDirs(false))
  }, [])

  // ── Handlers ────────────────────────────────────────────────────────────────
  async function handleDownload(key, generatorFn) {
    setGenerating(g => ({ ...g, [key]: true }))
    try {
      const file = await generatorFn()
      const a    = document.createElement('a')
      a.href     = URL.createObjectURL(file)
      a.download = file.name
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e) {
      alert('Erro ao gerar imagem.')
    }
    setGenerating(g => ({ ...g, [key]: false }))
  }

  async function handleShare(key, generatorFn, shareText) {
    setGenerating(g => ({ ...g, [key]: true }))
    try {
      const file = await generatorFn()
      const url  = 'https://gestao-e-luta.vercel.app/'
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: 'GESTÃO E LUTA — Chapa 3', text: shareText, url, files: [file] })
      } else if (navigator.share) {
        await navigator.share({ title: 'GESTÃO E LUTA — Chapa 3', text: shareText, url })
      } else {
        const a    = document.createElement('a')
        a.href     = URL.createObjectURL(file)
        a.download = file.name
        a.click()
        URL.revokeObjectURL(a.href)
      }
    } catch (e) {
      if (e?.name !== 'AbortError') alert('Erro ao compartilhar.')
    }
    setGenerating(g => ({ ...g, [key]: false }))
  }

  // ── Seções âncoras ───────────────────────────────────────────────────────────
  const navLinks = [
    { href: '#divulgacao', label: 'Divulgação' },
    { href: '#propostas',  label: 'Propostas'  },
    { href: '#diretores',  label: 'Diretores'  },
    { href: '#eleicao',    label: 'Eleição'    },
  ]

  return (
    <div className="min-h-screen bg-navy-950">

      {/* ── Topo ─────────────────────────────────────────────────────────────── */}
      <div className="bg-navy-950 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-400 hover:text-gold-500 transition-colors font-heading text-xs tracking-widest uppercase"
          >
            <ArrowLeft size={14} /> Voltar ao site
          </Link>
          <span className="font-heading text-white tracking-widest text-sm hidden sm:block">
            GESTÃO <span className="text-gold-500">&</span> LUTA
          </span>
          <Link
            to="/propostas"
            className="font-heading text-xs tracking-widest uppercase text-slate-400 hover:text-gold-500 transition-colors"
          >
            Propostas
          </Link>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="relative bg-navy-950 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: `repeating-linear-gradient(45deg,#C9A227,#C9A227 1px,transparent 1px,transparent 40px)` }}
          />
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
        <div className="relative z-10 text-center px-4">
          <p className="font-heading text-gold-500 text-sm tracking-widest uppercase mb-2">Chapa 3 — SINDPOL-RJ</p>
          <h1 className="font-heading font-bold text-white text-5xl md:text-7xl tracking-widest uppercase mb-4">
            Kit de Divulgação
          </h1>
          <div className="flex items-center justify-center gap-4 my-4">
            <div className="h-px bg-gold-500/40 flex-1 max-w-24" />
            <span className="text-gold-500">✦</span>
            <div className="h-px bg-gold-500/40 flex-1 max-w-24" />
          </div>
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Baixe e compartilhe materiais oficiais da Chapa 3.
            <br />
            <span className="text-gold-400">Ajude a divulgar a eleição do SINDPOL-RJ — 09 de maio de 2026.</span>
          </p>
        </div>
      </div>

      {/* ── Nav sticky com âncoras ──────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-navy-950/95 backdrop-blur border-b border-navy-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-3">
            {navLinks.map(nl => (
              <a
                key={nl.href}
                href={nl.href}
                className="flex-shrink-0 font-heading text-xs tracking-widest uppercase px-4 py-2 transition-all text-gray-400 hover:text-gold-500 border border-navy-700 hover:border-gold-500/40"
              >
                {nl.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Conteúdo ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">

        {/* ── Seção: Divulgação da Chapa ───────────────────────────────────── */}
        <section id="divulgacao">
          <SectionHeader
            label="Material de Divulgação"
            title="Divulgação da Chapa"
            subtitle="Materiais para apoiar e divulgar a Chapa 3."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            <KitCard
              title="EU APOIO — Chapa 3"
              subtitle="Card de apoio 3:4 para stories e feed. Ideal para mostrar que você apoia a Gestão & Luta."
              format="3:4"
              emoji="🤝"
              loading={!!generating['apoio']}
              onDownload={() => handleDownload('apoio', generateShareImage)}
              onShare={() => handleShare('apoio', generateShareImage, 'Eu apoio a Chapa 3 — GESTÃO E LUTA! Vote em 09 de maio.')}
            />
            <KitCard
              title="Contagem Regressiva"
              subtitle="Card 9:16 com os dias que faltam para a eleição. Perfeito para stories."
              format="9:16"
              emoji="⏳"
              loading={!!generating['contagem-div']}
              onDownload={() => handleDownload('contagem-div', () => {
                const pres = diretores.find(d => d.id === 1)
                const vp   = diretores.find(d => d.id === 2)
                return generateContagemCard({ presidenteFotoUrl: fotoSrc(pres ?? {}), vpFotoUrl: fotoSrc(vp ?? {}) })
              })}
              onShare={() => handleShare('contagem-div', () => {
                const pres = diretores.find(d => d.id === 1)
                const vp   = diretores.find(d => d.id === 2)
                return generateContagemCard({ presidenteFotoUrl: fotoSrc(pres ?? {}), vpFotoUrl: fotoSrc(vp ?? {}) })
              }, `Faltam poucos dias para a eleição do SINDPOL-RJ! Vote na Chapa 3 — GESTÃO E LUTA em 09 de maio.`)}
            />
          </div>
        </section>

        {/* ── Seção: Propostas ─────────────────────────────────────────────── */}
        <section id="propostas">
          <SectionHeader
            label="Plataforma"
            title="Nossas Propostas"
            subtitle="Compartilhe o PDF completo ou cada proposta individualmente com um card 9:16."
          />

          {/* PDF da Chapa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 mb-6">
            <KitCard
              title="PDF Completo da Chapa"
              subtitle="Documento com as 12 propostas e a diretoria da Chapa 3. Ideal para enviar via WhatsApp ou e-mail."
              format="PDF"
              emoji="📄"
              downloadLabel="Baixar PDF"
              shareLabel="Compartilhar"
              loading={!!generating['pdf-propostas']}
              onDownload={() => handleDownload('pdf-propostas', () => generateChapaPDF({ returnBlob: true }))}
              onShare={() => handleShare(
                'pdf-propostas',
                () => generateChapaPDF({ returnBlob: true }),
                'Conheça as propostas da Chapa 3 — GESTÃO E LUTA!'
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {propostas.map(p => (
              <KitCard
                key={p.id}
                title={p.titulo}
                subtitle={p.descricao.substring(0, 80) + '…'}
                format="9:16"
                emoji={p.icone}
                loading={!!generating[`proposta-${p.id}`]}
                onDownload={() => handleDownload(`proposta-${p.id}`, () => generatePropostaShareImage(p))}
                onShare={() => handleShare(
                  `proposta-${p.id}`,
                  () => generatePropostaShareImage(p),
                  `Apoio essa proposta da Chapa GESTÃO E LUTA: "${p.titulo}". Conheça todas as propostas!`
                )}
              />
            ))}
          </div>
        </section>

        {/* ── Seção: Diretores ─────────────────────────────────────────────── */}
        <section id="diretores">
          <SectionHeader
            label="Nossa Chapa"
            title="Diretores"
            subtitle="Card individual 1:1 de cada membro da diretoria da Chapa 3."
          />
          {loadingDirs ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="text-gold-500 animate-spin" />
            </div>
          ) : diretores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
              <ImageIcon size={32} />
              <p className="font-heading text-sm tracking-widest">Nenhum diretor encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
              {diretores.map(dir => {
                const rawCargo   = String(dir.cargo || '')
                const cargoLabel = cargoMap[dir.cargo]
                  || rawCargo.replace(/^Candidat[oa] a /i, '').trim()
                  || 'Diretor'
                // Normaliza o campo de foto (DB pode usar 'foto' ou 'foto_url')
                const diretorObj = { ...dir, cargo: cargoLabel, foto_url: fotoSrc(dir) }
                return (
                  <KitCard
                    key={dir.id}
                    title={dir.nome}
                    subtitle={cargoLabel}
                    format="1:1"
                    avatarEl={<DiretorAvatar dir={dir} />}
                    loading={!!generating[`diretor-${dir.id}`]}
                    onDownload={() => handleDownload(`diretor-${dir.id}`, () => generateDiretorCard(diretorObj))}
                    onShare={() => handleShare(
                      `diretor-${dir.id}`,
                      () => generateDiretorCard(diretorObj),
                      `Conheça ${dir.nome}, ${cargoLabel} da Chapa 3 — GESTÃO E LUTA! Vote em 09 de maio.`
                    )}
                  />
                )
              })}
            </div>
          )}
        </section>

        {/* ── Seção: Eleição ───────────────────────────────────────────────── */}
        <section id="eleicao">
          <SectionHeader
            label="09 de Maio de 2026"
            title="Eleição"
            subtitle="Materiais para mobilizar os policiais a votarem na data da eleição."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            <KitCard
              title="Vote Agora — Chapa 3"
              subtitle="Card 1:1 com a data e hora da eleição. Ideal para feed e grupos de WhatsApp."
              format="1:1"
              emoji="🗳️"
              loading={!!generating['vote']}
              onDownload={() => handleDownload('vote', generateVoteCard)}
              onShare={() => handleShare('vote', generateVoteCard, 'Vote na Chapa 3 — GESTÃO E LUTA! Eleição SINDPOL-RJ: 09 de maio de 2026 · 9H30.')}
            />
            <KitCard
              title="Contagem Regressiva"
              subtitle="Card 9:16 com os dias que faltam para a eleição. Perfeito para stories."
              format="9:16"
              emoji="⏳"
              loading={!!generating['contagem-el']}
              onDownload={() => handleDownload('contagem-el', () => {
                const pres = diretores.find(d => d.id === 1)
                const vp   = diretores.find(d => d.id === 2)
                return generateContagemCard({ presidenteFotoUrl: fotoSrc(pres ?? {}), vpFotoUrl: fotoSrc(vp ?? {}) })
              })}
              onShare={() => handleShare('contagem-el', () => {
                const pres = diretores.find(d => d.id === 1)
                const vp   = diretores.find(d => d.id === 2)
                return generateContagemCard({ presidenteFotoUrl: fotoSrc(pres ?? {}), vpFotoUrl: fotoSrc(vp ?? {}) })
              }, `Faltam poucos dias para a eleição do SINDPOL-RJ! Vote na Chapa 3 — GESTÃO E LUTA em 09 de maio.`)}
            />
          </div>
        </section>

      </div>

      {/* ── Rodapé ───────────────────────────────────────────────────────────── */}
      <div className="border-t border-navy-800 py-6 text-center">
        <p className="text-gray-600 text-xs font-heading tracking-widest">
          &copy; {new Date().getFullYear()} Chapa GESTÃO &amp; LUTA — Sindpol-RJ
        </p>
      </div>
    </div>
  )
}

// ─── Componente auxiliar de cabeçalho de seção ────────────────────────────────
function SectionHeader({ label, title, subtitle }) {
  return (
    <div>
      <p className="font-heading text-gold-500 text-xs tracking-widest uppercase mb-1">{label}</p>
      <h2 className="font-heading text-white text-3xl md:text-4xl tracking-widest uppercase mb-2">{title}</h2>
      <div className="flex items-center gap-3 mb-3">
        <div className="h-0.5 w-10 bg-gold-500" />
        <div className="h-px flex-1 bg-navy-800" />
      </div>
      {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
    </div>
  )
}
