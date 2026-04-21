import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Shield, RefreshCw, Trash2, LogOut, Loader2, Users, Vote, MapPin, Clock, Edit2, Save, X, ChevronDown, ChevronUp, Camera, Plus, Newspaper, MessageSquare, Crop, Check, Clock3 } from 'lucide-react'

const META       = 600
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'gestao2025'

function fmt(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

// ── Modal de recorte 1:1 ────────────────────────────────────────
function CropModal({ file, onConfirm, onCancel }) {
  const [imgSrc, setImgSrc] = useState(null)
  const [ready, setReady]   = useState(false)
  const [crop, setCrop]     = useState({ x: 0, y: 0, size: 200 })

  const imgRef  = useRef(null)
  const natRef  = useRef({ w: 0, h: 0 })
  const dispRef = useRef({ w: 0, h: 0 })
  const cropRef = useRef({ x: 0, y: 0, size: 200 })
  const dragRef = useRef(null)

  // Create object URL for selected file
  useEffect(() => {
    const url = URL.createObjectURL(file)
    setImgSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Attach / detach global drag listeners
  useEffect(() => {
    function onMove(e) {
      if (!dragRef.current) return
      if (e.cancelable) e.preventDefault()
      const cx = e.touches ? e.touches[0].clientX : e.clientX
      const cy = e.touches ? e.touches[0].clientY : e.clientY
      const dx = cx - dragRef.current.sx
      const dy = cy - dragRef.current.sy
      const { mode, ox, oy, os } = dragRef.current
      const { w: dW, h: dH }    = dispRef.current
      let nx = ox, ny = oy, ns = os

      if (mode === 'move') {
        nx = ox + dx
        ny = oy + dy
      } else {
        // diagonal delta per corner
        let d
        if      (mode === 'se') d =  (dx + dy) / 2
        else if (mode === 'nw') d = -(dx + dy) / 2
        else if (mode === 'ne') d =  (dx - dy) / 2
        else                    d = -(dx - dy) / 2   // sw
        ns = Math.max(40, os + d)
        ns = Math.min(ns, dW, dH)
        if      (mode === 'nw') { nx = ox + os - ns; ny = oy + os - ns }
        else if (mode === 'ne') { nx = ox;            ny = oy + os - ns }
        else if (mode === 'sw') { nx = ox + os - ns;  ny = oy }
        // se: nx/ny stay as ox/oy
      }

      nx = Math.max(0, Math.min(nx, dW - ns))
      ny = Math.max(0, Math.min(ny, dH - ns))

      const next = { x: nx, y: ny, size: ns }
      cropRef.current = next
      setCrop(next)
    }

    function onUp() { dragRef.current = null }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend',  onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend',  onUp)
    }
  }, [])

  function onImgLoad(e) {
    const img = e.currentTarget
    natRef.current  = { w: img.naturalWidth, h: img.naturalHeight }
    dispRef.current = { w: img.offsetWidth,  h: img.offsetHeight  }
    const { w, h }  = dispRef.current
    const size = Math.round(Math.min(w, h) * 0.8)
    const init = { x: Math.round((w - size) / 2), y: Math.round((h - size) / 2), size }
    cropRef.current = init
    setCrop(init)
    setReady(true)
  }

  function startDrag(e, mode) {
    e.preventDefault()
    e.stopPropagation()
    const cx = e.touches ? e.touches[0].clientX : e.clientX
    const cy = e.touches ? e.touches[0].clientY : e.clientY
    dragRef.current = { mode, sx: cx, sy: cy, ox: cropRef.current.x, oy: cropRef.current.y, os: cropRef.current.size }
  }

  async function handleConfirm() {
    if (!ready || !imgRef.current) return
    const OUT = 800
    const canvas = document.createElement('canvas')
    canvas.width  = OUT
    canvas.height = OUT
    const ctx = canvas.getContext('2d')
    const { w: dW, h: dH } = dispRef.current
    const { w: nW, h: nH } = natRef.current
    const sx = (crop.x    / dW) * nW
    const sy = (crop.y    / dH) * nH
    const sw = (crop.size / dW) * nW
    const sh = (crop.size / dH) * nH
    ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, OUT, OUT)
    canvas.toBlob(blob => onConfirm(blob), 'image/jpeg', 0.92)
  }

  const corners = [
    { mode: 'nw', style: { top: 0,    left: 0,    transform: 'translate(-50%,-50%)', cursor: 'nw-resize' } },
    { mode: 'ne', style: { top: 0,    right: 0,   transform: 'translate(50%,-50%)',  cursor: 'ne-resize' } },
    { mode: 'sw', style: { bottom: 0, left: 0,    transform: 'translate(-50%,50%)',  cursor: 'sw-resize' } },
    { mode: 'se', style: { bottom: 0, right: 0,   transform: 'translate(50%,50%)',   cursor: 'se-resize' } },
  ]

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/85 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-navy-900 border border-navy-700 w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-700">
          <div>
            <p className="font-heading text-white tracking-widest text-sm flex items-center gap-2">
              <Crop size={14} className="text-gold-500" /> RECORTAR FOTO — 1:1
            </p>
            <p className="text-gray-500 text-xs mt-0.5">Arraste o quadro para mover · Arraste os cantos para redimensionar</p>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors ml-4">
            <X size={18} />
          </button>
        </div>

        {/* Image + overlay */}
        <div className="px-4 pt-4">
          <div className="relative bg-black select-none" style={{ lineHeight: 0 }}>
            {imgSrc && (
              <img
                ref={imgRef}
                src={imgSrc}
                alt="recorte"
                className="block w-full h-auto"
                style={{ maxHeight: '55vh', objectFit: 'contain' }}
                onLoad={onImgLoad}
                draggable={false}
              />
            )}

            {ready && (
              <>
                {/* Darkened overlay — 4 panels around crop box */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute bg-black/60" style={{ top: 0, left: 0, right: 0, height: crop.y }} />
                  <div className="absolute bg-black/60" style={{ top: crop.y + crop.size, left: 0, right: 0, bottom: 0 }} />
                  <div className="absolute bg-black/60" style={{ top: crop.y, left: 0, width: crop.x, height: crop.size }} />
                  <div className="absolute bg-black/60" style={{ top: crop.y, left: crop.x + crop.size, right: 0, height: crop.size }} />
                </div>

                {/* Crop box */}
                <div
                  className="absolute border-2 border-gold-400 cursor-move"
                  style={{ top: crop.y, left: crop.x, width: crop.size, height: crop.size }}
                  onMouseDown={e => startDrag(e, 'move')}
                  onTouchStart={e => startDrag(e, 'move')}
                >
                  {/* Rule-of-thirds grid */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: [
                        'linear-gradient(rgba(255,215,0,.25) 1px, transparent 1px)',
                        'linear-gradient(90deg, rgba(255,215,0,.25) 1px, transparent 1px)',
                      ].join(','),
                      backgroundSize: `${Math.round(crop.size / 3)}px ${Math.round(crop.size / 3)}px`,
                    }}
                  />

                  {/* Corner handles */}
                  {corners.map(({ mode, style }) => (
                    <div
                      key={mode}
                      className="absolute w-4 h-4 bg-gold-500 rounded-[2px] z-10"
                      style={style}
                      onMouseDown={e => startDrag(e, mode)}
                      onTouchStart={e => startDrag(e, mode)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 mt-4 border-t border-navy-700 flex items-center justify-between">
          <p className="text-gray-600 text-xs font-heading">
            {Math.round(crop.size)} × {Math.round(crop.size)} px
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-heading text-xs uppercase tracking-widest px-4 py-2"
            >
              <X size={13} /> Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!ready}
              className="flex items-center gap-2 bg-gold-500 text-navy-950 font-heading text-xs uppercase tracking-widest px-5 py-2 hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera size={13} /> Aplicar recorte
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Editor de um diretor ────────────────────────────────────────
function DirectorEditor({ director, onSaved }) {
  const [open, setOpen]         = useState(false)
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [cropFile, setCropFile] = useState(null)
  const fileInputRef            = useRef(null)
  const [form, setForm]         = useState({
    nome:      director.nome      || '',
    cargo:     director.cargo     || '',
    delegacia: director.delegacia || '',
    resumo:    director.resumo    || director.bio || '',
    bio:       director.bio       || '',
    whatsapp:  director.whatsapp  || '',
    instagram: director.instagram || '',
    foto:      director.foto      || '',
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Step 1: file selected → open crop modal (do NOT upload yet)
  function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setCropFile(file)
    // reset input so the same file can be re-selected after cancelling
    e.target.value = ''
  }

  // Step 2: crop confirmed → upload the cropped JPEG blob to Supabase
  async function uploadCroppedBlob(blob) {
    setCropFile(null)
    setUploading(true)
    const path = `director-${director.id}-${Date.now()}.jpg`
    const { error: upErr } = await supabase.storage
      .from('director-photos')
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
    if (upErr) { alert('Erro no upload: ' + upErr.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage
      .from('director-photos')
      .getPublicUrl(path)
    setForm(f => ({ ...f, foto: publicUrl }))
    setUploading(false)
  }

  async function handleSave() {
    setSaving(true)
    // Envia somente os campos que sabemos que existem na tabela
    const payload = {
      nome:      form.nome,
      cargo:     form.cargo,
      delegacia: form.delegacia,
      resumo:    form.resumo,
      bio:       form.bio,
      whatsapp:  form.whatsapp,
      instagram: form.instagram,
      foto:      form.foto,
    }
    const { error } = await supabase
      .from('directors')
      .update(payload)
      .eq('id', director.id)
    setSaving(false)
    if (error) {
      console.error('Erro ao salvar diretor:', error)
      alert(`Erro ao salvar: ${error.message}\n\nCódigo: ${error.code || '—'}`)
      return
    }
    setOpen(false)
    onSaved()
  }

  const initials = director.nome.split(' ').slice(0,2).map(n=>n[0]).join('')

  return (
    <div className="border border-navy-700 bg-navy-950">
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-navy-900 transition-colors text-left"
      >
        <div className="w-10 h-10 bg-navy-800 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
          <span className="font-heading text-sm text-gold-400">{initials}</span>
        </div>
        <div className="flex-1">
          <p className="font-heading text-white tracking-wide text-sm">{director.nome}</p>
          <p className="text-gold-500 text-xs font-heading tracking-widest uppercase">{director.cargo}</p>
        </div>
        <Edit2 size={14} className="text-gray-500" />
        {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
      </button>

      {/* Crop modal — rendered outside the collapsible form so it always appears */}
      {cropFile && (
        <CropModal
          file={cropFile}
          onConfirm={uploadCroppedBlob}
          onCancel={() => setCropFile(null)}
        />
      )}

      {/* Edit form */}
      {open && (
        <div className="border-t border-navy-700 p-5 space-y-4">

          {/* Foto */}
          <div>
            <label className="block font-heading text-xs text-gray-500 uppercase tracking-widest mb-2">Foto</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-navy-800 border border-navy-700 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {form.foto
                  ? <img src={form.foto} alt="" className="w-full h-full object-cover object-top" />
                  : <span className="font-heading text-xl text-gold-400">{initials}</span>
                }
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 bg-navy-800 border border-navy-700 text-gray-300 hover:text-white hover:border-gold-500 transition-colors font-heading text-xs uppercase tracking-widest px-4 py-2"
                >
                  {uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
                  {uploading ? 'Enviando…' : 'Escolher foto'}
                </button>
                {form.foto && (
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, foto: '' }))}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors font-heading text-xs uppercase tracking-widest"
                  >
                    <X size={13} /> Remover foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-heading text-xs text-gray-500 uppercase tracking-widest mb-1.5">Nome</label>
              <input name="nome" value={form.nome} onChange={handleChange}
                className="w-full bg-navy-900 border border-navy-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-gold-500 transition-colors" />
            </div>
            <div>
              <label className="block font-heading text-xs text-gray-500 uppercase tracking-widest mb-1.5">Cargo</label>
              <input name="cargo" value={form.cargo} onChange={handleChange}
                className="w-full bg-navy-900 border border-navy-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-gold-500 transition-colors" />
            </div>
            <div>
              <label className="block font-heading text-xs text-gray-500 uppercase tracking-widest mb-1.5">Delegacia / Lotação</label>
              <input name="delegacia" value={form.delegacia} onChange={handleChange}
                className="w-full bg-navy-900 border border-navy-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-gold-500 transition-colors" />
            </div>
            <div>
              <label className="block font-heading text-xs text-gray-500 uppercase tracking-widest mb-1.5">WhatsApp (só números)</label>
              <input name="whatsapp" value={form.whatsapp} onChange={handleChange}
                className="w-full bg-navy-900 border border-navy-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-gold-500 transition-colors"
                placeholder="5521999999999" />
            </div>
            <div>
              <label className="block font-heading text-xs text-gray-500 uppercase tracking-widest mb-1.5">Instagram</label>
              <input name="instagram" value={form.instagram} onChange={handleChange}
                className="w-full bg-navy-900 border border-navy-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-gold-500 transition-colors"
                placeholder="@usuario" />
            </div>
          </div>

          <div>
            <label className="block font-heading text-xs text-gray-500 uppercase tracking-widest mb-1.5">
              Texto da frente <span className="text-gray-600 normal-case font-body tracking-normal">(resumo — aparece na frente do card)</span>
            </label>
            <textarea name="resumo" value={form.resumo} onChange={handleChange} rows={3}
              className="w-full bg-navy-900 border border-navy-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-gold-500 transition-colors resize-none" />
            <p className="text-gray-600 text-xs mt-1">{form.resumo.length} caracteres — recomendado até 160</p>
          </div>

          <div>
            <label className="block font-heading text-xs text-gray-500 uppercase tracking-widest mb-1.5">
              Texto do verso <span className="text-gray-600 normal-case font-body tracking-normal">(perfil completo — aparece no verso do card)</span>
            </label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={4}
              className="w-full bg-navy-900 border border-navy-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-gold-500 transition-colors resize-none" />
            <p className="text-gray-600 text-xs mt-1">{form.bio.length} caracteres — recomendado até 300</p>
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-heading text-xs uppercase tracking-widest px-4 py-2">
              <X size={14} /> Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-gold-500 text-navy-950 font-heading text-xs uppercase tracking-widest px-5 py-2 hover:bg-gold-400 transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Gerenciador de Notícias ─────────────────────────────────────
function NoticiaAdmin({ noticias, onRefresh }) {
  const empty = { titulo: '', resumo: '', conteudo: '', imagem_url: '' }
  const [form, setForm]     = useState(empty)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  function iniciarEdicao(n) {
    setForm({ titulo: n.titulo, resumo: n.resumo, conteudo: n.conteudo, imagem_url: n.imagem_url || '' })
    setEditId(n.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelar() {
    setForm(empty)
    setEditId(null)
    setShowForm(false)
  }

  async function salvar() {
    if (!form.titulo || !form.resumo || !form.conteudo) return alert('Preencha título, resumo e conteúdo.')
    setSaving(true)
    if (editId) {
      await supabase.from('noticias').update(form).eq('id', editId)
    } else {
      await supabase.from('noticias').insert(form)
    }
    setSaving(false)
    cancelar()
    onRefresh()
  }

  async function excluir(id) {
    if (!confirm('Excluir esta notícia?')) return
    await supabase.from('noticias').delete().eq('id', id)
    onRefresh()
  }

  return (
    <div className="space-y-4">
      {/* Botão nova notícia */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gold-500 text-navy-950 font-heading text-xs uppercase tracking-widest px-5 py-3 hover:bg-gold-400 transition-colors"
        >
          <Plus size={14} /> Nova notícia
        </button>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="border border-navy-700 bg-navy-950 p-6 space-y-4">
          <h4 className="font-heading text-white tracking-widest text-sm">{editId ? 'Editar notícia' : 'Nova notícia'}</h4>
          <div>
            <label className="block font-heading text-xs text-gray-500 uppercase tracking-widest mb-1.5">Título</label>
            <input name="titulo" value={form.titulo} onChange={handleChange}
              className="w-full bg-navy-900 border border-navy-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-gold-500 transition-colors" />
          </div>
          <div>
            <label className="block font-heading text-xs text-gray-500 uppercase tracking-widest mb-1.5">Resumo (aparece no card)</label>
            <textarea name="resumo" value={form.resumo} onChange={handleChange} rows={2}
              className="w-full bg-navy-900 border border-navy-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-gold-500 transition-colors resize-none" />
          </div>
          <div>
            <label className="block font-heading text-xs text-gray-500 uppercase tracking-widest mb-1.5">Conteúdo completo</label>
            <textarea name="conteudo" value={form.conteudo} onChange={handleChange} rows={6}
              className="w-full bg-navy-900 border border-navy-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-gold-500 transition-colors resize-none" />
          </div>
          <div>
            <label className="block font-heading text-xs text-gray-500 uppercase tracking-widest mb-1.5">URL da imagem (opcional)</label>
            <input name="imagem_url" value={form.imagem_url} onChange={handleChange} placeholder="https://..."
              className="w-full bg-navy-900 border border-navy-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-gold-500 transition-colors" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={cancelar}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-heading text-xs uppercase tracking-widest px-4 py-2">
              <X size={14} /> Cancelar
            </button>
            <button onClick={salvar} disabled={saving}
              className="flex items-center gap-2 bg-gold-500 text-navy-950 font-heading text-xs uppercase tracking-widest px-5 py-2 hover:bg-gold-400 transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {editId ? 'Salvar alterações' : 'Publicar'}
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {noticias.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-600">Nenhuma notícia publicada ainda.</div>
      )}
      {noticias.map(n => (
        <div key={n.id} className="border border-navy-700 bg-navy-950 p-5 flex gap-4 items-start">
          {n.imagem_url && (
            <img src={n.imagem_url} alt="" className="w-16 h-16 object-cover flex-shrink-0 border border-navy-700" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-heading text-white text-sm tracking-wide truncate">{n.titulo}</p>
            <p className="text-gray-400 text-xs mt-1 line-clamp-2">{n.resumo}</p>
            <p className="text-gray-600 text-xs mt-2">{new Date(n.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => iniciarEdicao(n)}
              className="text-gray-500 hover:text-gold-400 transition-colors" title="Editar">
              <Edit2 size={15} />
            </button>
            <button onClick={() => excluir(n.id)}
              className="text-red-500/50 hover:text-red-400 transition-colors" title="Excluir">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Página Admin ────────────────────────────────────────────────
export default function Admin() {
  const [auth, setAuth]           = useState(false)
  const [pwd, setPwd]             = useState('')
  const [pwdError, setPwdError]   = useState(false)
  const [votes, setVotes]         = useState([])
  const [visits, setVisits]       = useState([])
  const [directors, setDirectors] = useState([])
  const [messages, setMessages]     = useState([])
  const [depoimentos, setDepoimentos] = useState([])
  const [noticias, setNoticias]     = useState([])
  const [loading, setLoading]       = useState(false)
  const [resetting, setResetting]   = useState(false)
  const [tab, setTab]               = useState('votos')

  useEffect(() => { if (auth) loadData() }, [auth])

  function handleLogin(e) {
    e.preventDefault()
    if (pwd === ADMIN_PASS) { setAuth(true); setPwdError(false) }
    else setPwdError(true)
  }

  async function loadData() {
    setLoading(true)
    const [{ data: v }, { data: vi }, { data: dir }, { data: msg }, { data: dep }, { data: not }] = await Promise.all([
      supabase.from('votes').select('*').order('created_at', { ascending: false }),
      supabase.from('visits').select('*').order('created_at', { ascending: false }),
      supabase.from('directors').select('*').order('ordem', { ascending: true }),
      supabase.from('messages').select('*').order('created_at', { ascending: false }),
      supabase.from('depoimentos').select('*').order('created_at', { ascending: false }),
      supabase.from('noticias').select('*').order('created_at', { ascending: false }),
    ])
    if (v)   setVotes(v)
    if (vi)  setVisits(vi)
    if (dir) setDirectors(dir)
    if (msg) setMessages(msg)
    if (dep) setDepoimentos(dep)
    if (not) setNoticias(not)
    setLoading(false)
  }

  async function handleReset() {
    if (!confirm('Tem certeza? Isso apagará TODOS os votos registrados.')) return
    const pass = prompt('Digite a senha admin para confirmar:')
    if (pass !== ADMIN_PASS) { alert('Senha incorreta.'); return }
    setResetting(true)
    await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await loadData()
    setResetting(false)
  }

  const totalVotos = votes.filter(v => v.chapa_id === 1).length
  const pct        = Math.min(Math.round((totalVotos / META) * 100), 100)
  const porChapa   = votes.reduce((acc, v) => {
    acc[v.chapa_nome] = (acc[v.chapa_nome] || 0) + 1
    return acc
  }, {})

  if (!auth) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Shield className="text-gold-500 mx-auto mb-3" size={40} />
            <h1 className="font-heading text-2xl text-white tracking-widest">ÁREA ADMINISTRATIVA</h1>
            <p className="text-gray-500 text-sm mt-1">Chapa GESTÃO &amp; LUTA</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={pwd} onChange={e => { setPwd(e.target.value); setPwdError(false) }}
              placeholder="Senha de acesso"
              className={`w-full bg-navy-900 border px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors ${pwdError ? 'border-red-500' : 'border-navy-700'}`} />
            {pwdError && <p className="text-red-400 text-xs">Senha incorreta.</p>}
            <button type="submit" className="w-full btn-primary">Entrar</button>
          </form>
          <p className="text-center mt-6">
            <a href="/" className="text-gray-600 text-xs hover:text-gold-500 transition-colors">← Voltar ao site</a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Header */}
      <div className="bg-navy-900 border-b border-navy-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-gold-500" size={20} />
          <span className="font-heading text-white tracking-widest text-sm">PAINEL ADMINISTRATIVO</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="flex items-center gap-2 text-gray-400 hover:text-gold-500 transition-colors text-xs font-heading tracking-wide">
            <RefreshCw size={14} /> Atualizar
          </button>
          <button onClick={() => setAuth(false)} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-xs font-heading tracking-wide">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="text-gold-500 animate-spin" size={40} /></div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="card text-center">
                <Vote className="text-gold-500 mx-auto mb-2" size={22} />
                <div className="font-heading text-3xl text-gold-400">{totalVotos}</div>
                <div className="text-gray-500 text-xs uppercase tracking-widest font-heading mt-1">Votos GL</div>
              </div>
              <div className="card text-center">
                <Users className="text-blue-400 mx-auto mb-2" size={22} />
                <div className="font-heading text-3xl text-blue-400">{visits.length}</div>
                <div className="text-gray-500 text-xs uppercase tracking-widest font-heading mt-1">Visitas</div>
              </div>
              <div className="card text-center">
                <MapPin className="text-green-400 mx-auto mb-2" size={22} />
                <div className="font-heading text-3xl text-green-400">{new Set(votes.map(v => v.city)).size}</div>
                <div className="text-gray-500 text-xs uppercase tracking-widest font-heading mt-1">Cidades</div>
              </div>
              <div className="card text-center">
                <Clock className="text-purple-400 mx-auto mb-2" size={22} />
                <div className="font-heading text-3xl text-purple-400">{pct}%</div>
                <div className="text-gray-500 text-xs uppercase tracking-widest font-heading mt-1">Meta {META}</div>
              </div>
            </div>

            {/* Thermometer */}
            <div className="card mb-8">
              <div className="flex justify-between items-end mb-3">
                <h3 className="font-heading text-white tracking-widest">Termômetro — Meta: {META} votos</h3>
                <span className="font-heading text-2xl text-gold-400">{totalVotos}/{META}</span>
              </div>
              <div className="h-4 bg-navy-800 overflow-hidden mb-2">
                <div className={`h-full transition-all duration-700 ${pct >= 100 ? 'bg-green-500' : pct >= 60 ? 'bg-gold-500' : 'bg-blue-500'}`}
                  style={{ width: `${pct}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {Object.entries(porChapa).map(([nome, count]) => (
                  <div key={nome} className="text-center">
                    <div className="font-heading text-gold-400 text-xl">{count}</div>
                    <div className="text-gray-500 text-xs">{nome}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 border-b border-navy-700">
              {['votos', 'visitas', 'diretores', 'mensagens', 'depoimentos', 'noticias'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`font-heading text-xs uppercase tracking-widest px-4 py-3 transition-colors border-b-2 -mb-px whitespace-nowrap ${tab === t ? 'border-gold-500 text-gold-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                  {t === 'votos' ? `Votos (${votes.length})`
                    : t === 'visitas' ? `Visitas (${visits.length})`
                    : t === 'diretores' ? `Diretores (${directors.length})`
                    : t === 'mensagens' ? `Mensagens (${messages.length})`
                    : t === 'depoimentos' ? (
                      <span className="flex items-center gap-2">
                        {`Depoimentos (${depoimentos.length})`}
                        {depoimentos.filter(d => d.status === 'pending').length > 0 && (
                          <span className="bg-amber-500 text-navy-950 font-bold text-[10px] px-1.5 py-0.5 leading-none rounded-sm">
                            {depoimentos.filter(d => d.status === 'pending').length}
                          </span>
                        )}
                      </span>
                    )
                    : `Notícias (${noticias.length})`}
                </button>
              ))}
            </div>

            {/* Votes */}
            {tab === 'votos' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-navy-700">
                      {['#','IP','Chapa','Cidade','Estado','Data/Hora'].map(h => (
                        <th key={h} className="text-left font-heading text-xs text-gray-500 uppercase tracking-widest px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {votes.map((v, i) => (
                      <tr key={v.id} className="border-b border-navy-800 hover:bg-navy-900 transition-colors">
                        <td className="px-4 py-3 text-gray-600 text-xs">{votes.length - i}</td>
                        <td className="px-4 py-3 text-gray-300 font-mono text-xs">{v.ip_address}</td>
                        <td className="px-4 py-3">
                          <span className={`font-heading text-xs tracking-wide ${v.chapa_id === 1 ? 'text-gold-400' : 'text-gray-400'}`}>{v.chapa_nome}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{v.city || '—'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{v.region || '—'}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{fmt(v.created_at)}</td>
                      </tr>
                    ))}
                    {votes.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-600">Nenhum voto registrado ainda.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Visits */}
            {tab === 'visitas' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-navy-700">
                      {['#','IP','Cidade','Estado','País','Data/Hora'].map(h => (
                        <th key={h} className="text-left font-heading text-xs text-gray-500 uppercase tracking-widest px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visits.map((v, i) => (
                      <tr key={v.id} className="border-b border-navy-800 hover:bg-navy-900 transition-colors">
                        <td className="px-4 py-3 text-gray-600 text-xs">{visits.length - i}</td>
                        <td className="px-4 py-3 text-gray-300 font-mono text-xs">{v.ip_address || '—'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{v.city || '—'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{v.region || '—'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{v.country || '—'}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{fmt(v.created_at)}</td>
                      </tr>
                    ))}
                    {visits.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-600">Nenhuma visita registrada ainda.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Directors editor */}
            {tab === 'diretores' && (
              <div className="space-y-2">
                <p className="text-gray-500 text-xs mb-4">Clique em um diretor para editar nome, cargo, bio e contato. As alterações aparecem imediatamente no site.</p>
                {directors.map(d => (
                  <DirectorEditor key={d.id} director={d} onSaved={loadData} />
                ))}
                {directors.length === 0 && (
                  <div className="text-center py-12 text-gray-600">
                    <p>Tabela de diretores não encontrada no banco de dados.</p>
                    <p className="text-xs mt-2">Rode o SQL de criação da tabela no Supabase.</p>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {tab === 'mensagens' && (
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-12 text-gray-600">Nenhuma mensagem recebida ainda.</div>
                )}
                {messages.map((m, i) => (
                  <div key={m.id} className="border border-navy-700 bg-navy-950 p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-heading text-white text-sm tracking-wide">{m.nome}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{m.email}{m.matricula ? ` · Mat. ${m.matricula}` : ''}</p>
                      </div>
                      <span className="text-gray-600 text-xs flex-shrink-0">{fmt(m.created_at)}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{m.mensagem}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Depoimentos */}
            {tab === 'depoimentos' && (() => {
              const pending  = depoimentos.filter(d => d.status === 'pending')
              const approved = depoimentos.filter(d => d.status === 'approved')
              const rejected = depoimentos.filter(d => d.status === 'rejected')

              async function setStatus(id, status) {
                await supabase.from('depoimentos').update({ status }).eq('id', id)
                loadData()
              }
              async function excluir(id) {
                if (!confirm('Excluir este depoimento permanentemente?')) return
                await supabase.from('depoimentos').delete().eq('id', id)
                loadData()
              }

              function DepoCard({ d, actions }) {
                return (
                  <div className="border border-navy-700 bg-navy-950 p-5 flex gap-4 items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <p className="font-heading text-white text-sm tracking-wide">{d.nome}</p>
                        {d.lotacao && <span className="text-gold-500 text-xs font-heading tracking-widest uppercase">{d.lotacao}</span>}
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">"{d.texto}"</p>
                      <p className="text-gray-600 text-xs mt-2">{fmt(d.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">{actions(d)}</div>
                  </div>
                )
              }

              return (
                <div className="space-y-8">
                  {/* Pendentes */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock3 size={13} className="text-amber-400" />
                      <h4 className="font-heading text-xs text-amber-400 uppercase tracking-widest">
                        Aguardando aprovação ({pending.length})
                      </h4>
                    </div>
                    {pending.length === 0 && (
                      <div className="text-center py-8 text-gray-600 border border-navy-800 text-sm">Nenhum depoimento pendente.</div>
                    )}
                    <div className="space-y-3">
                      {pending.map(d => (
                        <DepoCard key={d.id} d={d} actions={d => (<>
                          <button
                            onClick={() => setStatus(d.id, 'approved')}
                            className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors font-heading text-xs uppercase tracking-widest px-3 py-2"
                            title="Aprovar"
                          >
                            <Check size={12} /> Aprovar
                          </button>
                          <button
                            onClick={() => setStatus(d.id, 'rejected')}
                            className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors font-heading text-xs uppercase tracking-widest px-3 py-2"
                            title="Rejeitar"
                          >
                            <X size={12} /> Rejeitar
                          </button>
                        </>)} />
                      ))}
                    </div>
                  </div>

                  {/* Aprovados */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Check size={13} className="text-green-400" />
                      <h4 className="font-heading text-xs text-green-400 uppercase tracking-widest">
                        Publicados ({approved.length})
                      </h4>
                    </div>
                    {approved.length === 0 && (
                      <div className="text-center py-8 text-gray-600 border border-navy-800 text-sm">Nenhum depoimento publicado.</div>
                    )}
                    <div className="space-y-3">
                      {approved.map(d => (
                        <DepoCard key={d.id} d={d} actions={d => (<>
                          <button
                            onClick={() => setStatus(d.id, 'pending')}
                            className="text-amber-500/60 hover:text-amber-400 transition-colors"
                            title="Mover para pendentes"
                          >
                            <Clock3 size={15} />
                          </button>
                          <button
                            onClick={() => excluir(d.id)}
                            className="text-red-500/50 hover:text-red-400 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>)} />
                      ))}
                    </div>
                  </div>

                  {/* Rejeitados */}
                  {rejected.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <X size={13} className="text-red-400" />
                        <h4 className="font-heading text-xs text-red-400 uppercase tracking-widest">
                          Rejeitados ({rejected.length})
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {rejected.map(d => (
                          <DepoCard key={d.id} d={d} actions={d => (<>
                            <button
                              onClick={() => setStatus(d.id, 'approved')}
                              className="text-green-500/60 hover:text-green-400 transition-colors"
                              title="Aprovar"
                            >
                              <Check size={15} />
                            </button>
                            <button
                              onClick={() => excluir(d.id)}
                              className="text-red-500/50 hover:text-red-400 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>)} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Notícias */}
            {tab === 'noticias' && <NoticiaAdmin noticias={noticias} onRefresh={loadData} />}

            {/* Reset */}
            <div className="mt-12 pt-8 border-t border-navy-800 flex items-center justify-between">
              <div>
                <p className="font-heading text-red-400 text-sm tracking-wide">Zona de perigo</p>
                <p className="text-gray-500 text-xs mt-1">Apaga todos os votos da simulação.</p>
              </div>
              <button onClick={handleReset} disabled={resetting}
                className="flex items-center gap-2 border-2 border-red-500/50 text-red-400 font-heading text-xs uppercase tracking-widest px-5 py-3 hover:bg-red-500/10 transition-all">
                {resetting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Resetar votos
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
