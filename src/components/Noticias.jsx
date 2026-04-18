import { useState, useEffect } from 'react'
import { Loader2, Share2, Calendar, ChevronRight, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useInView } from '../hooks/useInView'

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function ModalNoticia({ noticia, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [])

  function compartilhar() {
    const texto = `${noticia.titulo} — Chapa Gestão e Luta\n\n${noticia.resumo}\n\nAcesse: ${window.location.href}`
    if (navigator.share) {
      navigator.share({ title: noticia.titulo, text: noticia.resumo, url: window.location.href })
    } else {
      navigator.clipboard.writeText(texto)
      alert('Link copiado para a área de transferência!')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}
      style={{ animation: 'scaleIn 0.2s ease' }}>
      <div
        className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'fadeInUp 0.3s ease' }}
      >
        {noticia.imagem_url && (
          <img src={noticia.imagem_url} alt={noticia.titulo} className="w-full h-56 object-cover" />
        )}
        <div className="p-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="text-slate-500 dark:text-gray-500 text-xs flex items-center gap-1.5">
              <Calendar size={12} /> {fmt(noticia.created_at)}
            </span>
            <div className="flex gap-2">
              <button onClick={compartilhar}
                className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 hover:text-gold-500 transition-colors font-heading text-xs uppercase tracking-widest">
                <Share2 size={13} /> Compartilhar
              </button>
              <button onClick={onClose} className="text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors ml-2 hover:rotate-90 transition-transform duration-200">
                <X size={18} />
              </button>
            </div>
          </div>
          <h2 className="font-heading text-slate-900 dark:text-white text-xl tracking-wide leading-snug mb-4">{noticia.titulo}</h2>
          <p className="text-slate-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{noticia.conteudo}</p>
        </div>
      </div>
    </div>
  )
}

function CardNoticia({ noticia, onClick, index }) {
  const [ref, inView] = useInView()

  function compartilhar(e) {
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({ title: noticia.titulo, text: noticia.resumo, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado!')
    }
  }

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700
                  hover:border-gold-500/50 hover:shadow-xl hover:shadow-gold-500/5 hover:-translate-y-1
                  transition-all duration-300 cursor-pointer group flex flex-col
                  ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * 100}ms`, transitionDuration: '0.6s' }}
    >
      {noticia.imagem_url && (
        <div className="overflow-hidden">
          <img src={noticia.imagem_url} alt={noticia.titulo} className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <span className="text-slate-500 dark:text-gray-500 text-xs flex items-center gap-1.5 mb-3">
          <Calendar size={11} /> {fmt(noticia.created_at)}
        </span>
        <h3 className="font-heading text-slate-900 dark:text-white tracking-wide text-base leading-snug mb-2 group-hover:text-gold-400 transition-colors duration-200">
          {noticia.titulo}
        </h3>
        <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed flex-1 line-clamp-3">{noticia.resumo}</p>
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-navy-700 flex items-center justify-between">
          <span className="font-heading text-gold-500 text-xs uppercase tracking-widest flex items-center gap-1 group-hover:gap-2.5 transition-all duration-200">
            Ler mais <ChevronRight size={12} />
          </span>
          <button onClick={compartilhar}
            className="text-slate-400 dark:text-gray-600 hover:text-gold-500 transition-colors hover:scale-110"
            title="Compartilhar">
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Noticias() {
  const [noticias, setNoticias]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [selecionada, setSelecionada] = useState(null)
  const [headerRef, headerInView] = useInView()

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from('noticias').select('*').order('created_at', { ascending: false })
      if (data) setNoticias(data)
      setLoading(false)
    }
    carregar()
  }, [])

  if (!loading && noticias.length === 0) return null

  return (
    <section id="noticias" className="py-28 bg-slate-50 dark:bg-navy-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-gold-500/4 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-700 ${headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <p className="font-heading text-gold-500 text-sm tracking-widest uppercase mb-2">Fique por dentro</p>
          <h2 className="section-title">Notícias</h2>
          <span className="gold-line mx-auto" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="text-gold-500 animate-spin" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticias.map((n, i) => (
              <CardNoticia key={n.id} noticia={n} onClick={() => setSelecionada(n)} index={i} />
            ))}
          </div>
        )}
      </div>

      {selecionada && <ModalNoticia noticia={selecionada} onClose={() => setSelecionada(null)} />}
      <div className="wave-sep" />
    </section>
  )
}
