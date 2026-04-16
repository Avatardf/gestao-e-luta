import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Shield, RefreshCw, Trash2, LogOut, Loader2, Users, Vote, MapPin, Clock, Edit2, Save, X, ChevronDown, ChevronUp, Camera } from 'lucide-react'

const META       = 600
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'gestao2025'

function fmt(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

// ── Editor de um diretor ────────────────────────────────────────
function DirectorEditor({ director, onSaved }) {
  const [open, setOpen]         = useState(false)
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState(false)
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

  async function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `director-${director.id}-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('director-photos')
      .upload(path, file, { upsert: true })
    if (upErr) { alert('Erro no upload: ' + upErr.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage
      .from('director-photos')
      .getPublicUrl(path)
    setForm(f => ({ ...f, foto: publicUrl }))
    setUploading(false)
  }

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('directors')
      .update(form)
      .eq('id', director.id)
    setSaving(false)
    if (error) { alert('Erro ao salvar: ' + error.message); return }
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

// ── Página Admin ────────────────────────────────────────────────
export default function Admin() {
  const [auth, setAuth]           = useState(false)
  const [pwd, setPwd]             = useState('')
  const [pwdError, setPwdError]   = useState(false)
  const [votes, setVotes]         = useState([])
  const [visits, setVisits]       = useState([])
  const [directors, setDirectors] = useState([])
  const [loading, setLoading]     = useState(false)
  const [resetting, setResetting] = useState(false)
  const [tab, setTab]             = useState('votos')

  useEffect(() => { if (auth) loadData() }, [auth])

  function handleLogin(e) {
    e.preventDefault()
    if (pwd === ADMIN_PASS) { setAuth(true); setPwdError(false) }
    else setPwdError(true)
  }

  async function loadData() {
    setLoading(true)
    const [{ data: v }, { data: vi }, { data: dir }] = await Promise.all([
      supabase.from('votes').select('*').order('created_at', { ascending: false }),
      supabase.from('visits').select('*').order('created_at', { ascending: false }),
      supabase.from('directors').select('*').order('ordem', { ascending: true }),
    ])
    if (v)   setVotes(v)
    if (vi)  setVisits(vi)
    if (dir) setDirectors(dir)
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
              {['votos', 'visitas', 'diretores'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`font-heading text-xs uppercase tracking-widest px-5 py-3 transition-colors border-b-2 -mb-px ${tab === t ? 'border-gold-500 text-gold-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                  {t === 'votos' ? `Votos (${votes.length})` : t === 'visitas' ? `Visitas (${visits.length})` : `Diretores (${directors.length})`}
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
