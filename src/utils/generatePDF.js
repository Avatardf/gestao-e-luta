import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { supabase } from '../lib/supabase'
import { diretores as diretoresFallback } from '../data/diretores'

const cargoMap = {
  1:'Presidente', 2:'Vice-Presidente', 3:'Secretário', 4:'Tesoureira',
  5:'Diretor Jurídico', 6:'Rel. Institucionais', 7:'Diretor de Inativos',
  8:'Diretor do Interior', 9:'Cargos e Atribuições',
}

const propostasData = [
  { n:'1',  icone:'⚖️', t:'Resgate da ACP',             d:'Execução das promoções atrasadas' },
  { n:'7',  icone:'🚔', t:'Efetivo Mínimo nos Plantões', d:'Fim da sobrecarga — cumprimento da lei' },
  { n:'2',  icone:'💰', t:'Recomposição Salarial',        d:'Parcelas da Lei 9.436/2021 já!' },
  { n:'8',  icone:'🏅', t:'Promoções por Bravura',        d:'Critérios claros, sem favorecimento' },
  { n:'3',  icone:'📊', t:'Adequação das Carreiras',      d:'Comissário 1250, GHP, Oficial nível superior' },
  { n:'9',  icone:'🏗️', t:'Reformas de Delegacias',       d:'Parcerias público-privadas' },
  { n:'4',  icone:'📋', t:'Regulamentação dos Direitos',  d:'Adicional Noturno, Insalubridade, Auxílios' },
  { n:'10', icone:'🏛️', t:'Delegacias no Interior',       d:'Fim da desigualdade capital × interior' },
  { n:'5',  icone:'🛡️', t:'Previdência Pós-2013',         d:'Paridade para todos os ingressos' },
  { n:'11', icone:'🎓', t:'Cursos e Palestras',            d:'Capacitação para ativos e aposentados' },
  { n:'6',  icone:'🏥', t:'Plano de Saúde Autogestão',    d:'Modelo similar ao PF Saúde' },
  { n:'12', icone:'🔒', t:'Equipamentos e Segurança',     d:'Proteção da integridade de cada policial' },
]

async function toDataURL(url) {
  try {
    const res = await fetch(url, { mode: 'cors' })
    const blob = await res.blob()
    return await new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onloadend = () => resolve(r.result)
      r.onerror = reject
      r.readAsDataURL(blob)
    })
  } catch (e) {
    console.warn('Falha ao carregar foto:', url, e)
    return null
  }
}

async function buildTemplate(diretores) {
  const withPhotos = await Promise.all(diretores.map(async d => {
    const fotoData = d.foto ? await toDataURL(d.foto) : null
    return { ...d, fotoData }
  }))

  function dirCard(d) {
    const initials = d.nome.split(' ').slice(0, 2).map(n => n[0]).join('')
    const cargo = cargoMap[d.id] || (d.cargo || '').replace(/^candidat[ao] a /i, '')
    const avatarInner = d.fotoData
      ? `<img src="${d.fotoData}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
      : `<span style="font-family:Oswald,sans-serif;font-weight:700;color:#d4af37;font-size:28px;">${initials}</span>`
    return `
      <div style="width:130px;text-align:center;flex-shrink:0;">
        <div style="width:104px;height:104px;margin:0 auto 8px;border-radius:50%;padding:3px;
                    background:linear-gradient(135deg,#f4d06f 0%,#d4af37 50%,#a8821c 100%);
                    box-shadow:0 6px 18px rgba(15,23,42,0.25);position:relative;">
          <div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid #0f172a;"></div>
          <div style="width:100%;height:100%;border-radius:50%;background:#0f172a;overflow:hidden;
                      display:flex;align-items:center;justify-content:center;">
            ${avatarInner}
          </div>
        </div>
        <div style="font-family:Oswald,sans-serif;font-weight:600;font-size:14px;
                    letter-spacing:0.5px;color:#0f172a;line-height:1.1;">${d.nome}</div>
        <div style="font-size:10px;color:#64748b;font-weight:500;margin-top:2px;line-height:1.2;">${cargo}</div>
      </div>`
  }

  function row(list, gap = '22px') {
    return `<div style="display:flex;justify-content:center;gap:${gap};margin-bottom:14px;">
      ${list.map(dirCard).join('')}
    </div>`
  }

  function propCard(p) {
    return `
      <div style="display:flex;align-items:center;gap:10px;background:#fff;
                  border:1px solid #cbd5e1;border-radius:6px;padding:8px 12px 8px 0;
                  box-shadow:0 2px 6px rgba(15,23,42,0.06);overflow:hidden;">
        <div style="width:48px;align-self:stretch;
                    background:linear-gradient(180deg,#0f172a 0%,#1e293b 100%);
                    color:#d4af37;font-family:Oswald,sans-serif;font-weight:700;font-size:22px;
                    display:flex;align-items:center;justify-content:center;flex-shrink:0;
                    position:relative;">
          ${p.n}
          <div style="position:absolute;right:-10px;top:0;bottom:0;width:10px;
                      background:linear-gradient(180deg,#0f172a 0%,#1e293b 100%);
                      clip-path:polygon(0 0,100% 50%,0 100%);"></div>
        </div>
        <div style="font-size:22px;margin-left:14px;flex-shrink:0;">${p.icone}</div>
        <div style="flex:1;">
          <div style="font-family:Oswald,sans-serif;font-weight:600;font-size:12.5px;
                      letter-spacing:0.3px;color:#0f172a;line-height:1.2;text-transform:uppercase;">${p.t}</div>
          <div style="font-size:9.5px;color:#64748b;font-weight:500;margin-top:2px;line-height:1.3;">${p.d}</div>
        </div>
      </div>`
  }

  return `
  <div id="pdf-root" style="
    width:794px;height:1123px;
    background:linear-gradient(180deg,#f1f5f9 0%,#e2e8f0 100%);
    color:#0f172a;position:relative;overflow:hidden;display:flex;flex-direction:column;
    font-family:Inter,sans-serif;">

    <!-- BANNER -->
    <div style="position:relative;height:145px;background:linear-gradient(135deg,#0b1a2e 0%,#0f172a 45%,#1e293b 55%,#0b1a2e 100%);overflow:hidden;flex-shrink:0;">
      <div style="position:absolute;top:0;bottom:0;left:0;width:80px;background:linear-gradient(135deg,#f4d06f,#d4af37 55%,#a8821c);clip-path:polygon(0 0,100% 0,70% 100%,0 100%);"></div>
      <div style="position:absolute;top:0;bottom:0;right:0;width:80px;background:linear-gradient(135deg,#f4d06f,#d4af37 55%,#a8821c);clip-path:polygon(30% 0,100% 0,100% 100%,0 100%);"></div>
      <div style="position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0 120px;text-align:center;gap:4px;">
        <div style="font-family:Oswald,sans-serif;font-weight:700;font-size:36px;letter-spacing:3px;color:#fff;line-height:1.1;">CHAPA 3</div>
        <div style="font-family:Oswald,sans-serif;font-weight:700;font-size:36px;letter-spacing:3px;color:#d4af37;line-height:1.1;">GESTÃO &amp; LUTA</div>
        <div style="margin-top:10px;font-family:Oswald,sans-serif;font-size:13px;letter-spacing:4px;color:#e2e8f0;
                    background:rgba(212,175,55,0.15);border:1px solid rgba(212,175,55,0.5);padding:5px 18px;text-transform:uppercase;">
          EXPERIÊNCIA E COMPROMISSO COM A POLÍCIA CIVIL
        </div>
      </div>
    </div>

    <!-- DIRETORIA TITLE -->
    <div style="text-align:center;padding:18px 0 12px;">
      <h2 style="font-family:Oswald,sans-serif;font-weight:700;font-size:28px;letter-spacing:4px;color:#0f172a;text-transform:uppercase;display:inline-block;position:relative;padding:0 20px;">
        Diretoria Executiva
      </h2>
    </div>

    <!-- DIRETORIA ROWS -->
    <div style="padding:0 40px;flex-shrink:0;">
      ${row(withPhotos.slice(0, 4), '22px')}
      ${row(withPhotos.slice(4, 9), '16px')}
    </div>

    <!-- PROPOSTAS TITLE -->
    <div style="text-align:center;padding:14px 0 10px;">
      <h2 style="font-family:Oswald,sans-serif;font-weight:700;font-size:28px;letter-spacing:4px;color:#0f172a;text-transform:uppercase;display:inline-block;padding:0 20px;">
        Nossas 12 Propostas
      </h2>
    </div>

    <!-- PROPOSTAS GRID -->
    <div style="padding:0 28px 10px;flex:1;display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;">
      ${propostasData.map(propCard).join('')}
    </div>

    <!-- FOOTER -->
    <div style="padding:14px 36px 16px;background:linear-gradient(135deg,#0b1a2e 0%,#0f172a 50%,#1e293b 100%);
                color:#fff;display:flex;align-items:center;justify-content:space-between;
                border-top:3px solid #d4af37;flex-shrink:0;">
      <div style="display:inline-flex;align-items:center;gap:10px;padding:10px 22px;
                  background:linear-gradient(135deg,#f4d06f,#d4af37 55%,#a8821c);
                  color:#0f172a;font-family:Oswald,sans-serif;font-weight:700;font-size:18px;letter-spacing:3px;">
        ★ VOTE CHAPA 3
      </div>
      <div style="text-align:right;font-family:Oswald,sans-serif;">
        <div style="font-size:14px;letter-spacing:2px;color:#d4af37;font-weight:600;">ELEIÇÃO: 09.05.2026</div>
        <div style="font-size:11px;letter-spacing:2px;color:#94a3b8;margin-top:2px;">GESTAOLUTASINDPOL.COM.BR</div>
      </div>
    </div>
  </div>`
}

export async function generateChapaPDF() {
  let diretores
  try {
    const { data } = await supabase.from('directors').select('*').order('id')
    diretores = (data && data.length) ? data : diretoresFallback
  } catch {
    diretores = diretoresFallback
  }

  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'position:fixed;top:0;left:-9999px;z-index:-1;'
  wrapper.innerHTML = await buildTemplate(diretores)
  document.body.appendChild(wrapper)

  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready

    const node = wrapper.querySelector('#pdf-root')
    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f1f5f9',
      logging: false,
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297)
    pdf.save('Chapa-3-Gestao-e-Luta.pdf')
  } finally {
    document.body.removeChild(wrapper)
  }
}
