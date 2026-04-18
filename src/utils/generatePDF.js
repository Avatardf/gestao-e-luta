import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { supabase } from '../lib/supabase'
import { diretores as diretoresFallback } from '../data/diretores'

const cargoMap = {
  1: 'PRESIDENTE', 2: 'VICE-PRESIDENTE', 3: 'SECRETÁRIO', 4: 'TESOUREIRA',
  5: 'DIR. JURÍDICO', 6: 'REL. INSTITUCIONAIS', 7: 'DIR. DE INATIVOS',
  8: 'DIR. DO INTERIOR', 9: 'CARGOS E ATRIBUIÇÕES',
}

const propostasData = [
  {
    tema: 'Valorização Salarial', icone: '💰',
    items: [
      { n:'01', t:'Resgate da ACP das Promoções',       d:'Execução imediata da vitória judicial para regularizar as promoções atrasadas.' },
      { n:'02', t:'Recomposição Salarial Já!',          d:'Pagamento integral das parcelas devidas da Lei 9.436/2021.' },
      { n:'03', t:'Adequação Salarial das Carreiras',   d:'Comissário índice 1250, GHP no Triênio e Grat. Nível Superior ao Oficial.' },
      { n:'04', t:'Regulamentação dos Direitos',        d:'Adicional Noturno, Insalubridade, Auxílios e Horas Extras efetivados.' },
    ],
  },
  {
    tema: 'Proteção Jurídica', icone: '⚖️',
    items: [
      { n:'05', t:'Efetivo Mínimo nos Plantões',         d:'Cumprimento da lei, fim da sobrecarga que adoece o policial civil.' },
      { n:'06', t:'Moralização das Promoções por Bravura', d:'Critérios claros, sem favorecimento, com reconhecimento real do mérito.' },
      { n:'07', t:'Equipamentos e Segurança',            d:'Meios adequados e proteção da integridade física de cada policial.' },
    ],
  },
  {
    tema: 'Previdência e Legislação', icone: '🛡️',
    items: [
      { n:'08', t:'Plano de Saúde de Autogestão',        d:'Modelo similar ao PF Saúde, gestão autônoma e custo justo.' },
      { n:'09', t:'Regulamentação Pós-2013',             d:'Paridade previdenciária para todos, independente da data de ingresso.' },
    ],
  },
  {
    tema: 'Estrutura e Representatividade', icone: '🏛️',
    items: [
      { n:'10', t:'Reformas de Delegacias',              d:'Parcerias público-privadas para modernização e dignidade no atendimento.' },
      { n:'11', t:'Delegacias Sindicais no Interior',    d:'Representatividade real — fim da desigualdade entre capital e interior.' },
      { n:'12', t:'Cursos e Palestras',                  d:'Capacitação profissional para ativos e aposentados, com parcerias sérias.' },
    ],
  },
]

// Carrega imagem → dataURL (evita taint no canvas)
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
  // Pré-carrega fotos como dataURL
  const withPhotos = await Promise.all(diretores.map(async d => {
    const fotoData = d.foto ? await toDataURL(d.foto) : null
    return { ...d, fotoData }
  }))

  const diretoresHTML = withPhotos.map(d => {
    const initials = d.nome.split(' ').slice(0, 2).map(n => n[0]).join('')
    const cargo = cargoMap[d.id] || (d.cargo || '').replace(/^candidat[ao] a /i, '').toUpperCase()
    const avatarInner = d.fotoData
      ? `<img src="${d.fotoData}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
      : `<span style="font-family:Oswald,sans-serif;font-weight:700;color:#d4af37;font-size:22px;">${initials}</span>`
    return `
      <div style="display:flex;flex-direction:column;align-items:center;padding:10px 8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(212,175,55,0.18);border-radius:6px;text-align:center;">
        <div style="width:72px;height:72px;border-radius:50%;padding:2px;background:linear-gradient(135deg,#f4d06f,#d4af37,#a8821c);margin-bottom:8px;box-shadow:0 4px 12px rgba(212,175,55,0.25);">
          <div style="width:100%;height:100%;border-radius:50%;background:#1e293b;display:flex;align-items:center;justify-content:center;overflow:hidden;">
            ${avatarInner}
          </div>
        </div>
        <div style="font-family:Oswald,sans-serif;font-weight:600;font-size:12px;letter-spacing:1.5px;color:#fff;text-transform:uppercase;">${d.nome}</div>
        <div style="font-size:9px;color:#d4af37;letter-spacing:1px;margin-top:3px;font-family:Oswald,sans-serif;text-transform:uppercase;">${cargo}</div>
      </div>`
  }).join('')

  const temasHTML = propostasData.map(t => `
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(212,175,55,0.15);border-left:3px solid #d4af37;padding:8px 12px 10px;border-radius:3px;display:flex;flex-direction:column;">
      <div style="display:flex;align-items:center;gap:8px;padding-bottom:5px;margin-bottom:6px;border-bottom:1px solid rgba(212,175,55,0.18);">
        <span style="font-size:15px;">${t.icone}</span>
        <span style="font-family:Oswald,sans-serif;font-weight:600;font-size:10px;letter-spacing:2px;color:#d4af37;text-transform:uppercase;">${t.tema}</span>
      </div>
      ${t.items.map(p => `
        <div style="padding:3px 0;display:flex;gap:8px;">
          <span style="font-family:Oswald,sans-serif;font-weight:700;font-size:10px;color:#d4af37;min-width:20px;padding-top:1px;">${p.n}</span>
          <div style="flex:1;">
            <div style="font-size:10px;color:#f1f5f9;line-height:1.3;font-weight:600;font-family:Oswald,sans-serif;letter-spacing:0.5px;">${p.t}</div>
            <div style="font-size:8.5px;color:#94a3b8;line-height:1.35;margin-top:2px;">${p.d}</div>
          </div>
        </div>`).join('')}
    </div>`).join('')

  return `
  <div id="pdf-root" style="
    width:794px;height:1123px;
    background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%);
    color:#fff;position:relative;overflow:hidden;display:flex;flex-direction:column;
    font-family:Inter,sans-serif;">

    <!-- HEADER -->
    <div style="padding:18px 36px 14px;border-bottom:1px solid rgba(212,175,55,0.25);display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:40px;height:40px;background:linear-gradient(135deg,#f4d06f,#d4af37 55%,#a8821c);display:flex;align-items:center;justify-content:center;font-family:Oswald,sans-serif;font-weight:700;color:#0f172a;font-size:15px;letter-spacing:1px;">GL</div>
        <div style="font-family:Oswald,sans-serif;font-weight:600;letter-spacing:4px;font-size:14px;">GESTÃO <span style="color:#d4af37;">&amp;</span> LUTA</div>
      </div>
      <div style="text-align:right;font-family:Oswald,sans-serif;">
        <div style="font-size:22px;font-weight:700;letter-spacing:3px;color:#d4af37;">CHAPA 3</div>
        <div style="font-size:10px;letter-spacing:3px;color:#94a3b8;margin-top:2px;">ELEIÇÕES SINDPOL-RJ • 09.05.2026</div>
      </div>
    </div>

    <!-- TITLE -->
    <div style="padding:12px 40px 8px;text-align:center;">
      <h1 style="font-family:Oswald,sans-serif;font-weight:700;font-size:26px;letter-spacing:4px;color:#d4af37;margin:0;">UMA NOVA ERA PARA O SINDPOL-RJ</h1>
      <div style="font-family:Oswald,sans-serif;font-size:10px;letter-spacing:5px;color:#cbd5e1;margin-top:3px;">9 DIRETORES • 12 PROPOSTAS • 1 COMPROMISSO</div>
      <div style="width:50px;height:2px;background:linear-gradient(90deg,transparent,#d4af37,transparent);margin:6px auto 0;"></div>
    </div>

    <!-- DIRETORES LABEL -->
    <div style="display:flex;align-items:center;gap:10px;padding:10px 36px 4px;font-family:Oswald,sans-serif;font-size:10px;letter-spacing:4px;color:#d4af37;">
      <span>NOSSOS DIRETORES</span>
      <span style="flex:1;height:1px;background:linear-gradient(90deg,#d4af37 0%,transparent 100%);"></span>
    </div>

    <!-- DIRETORES GRID -->
    <div style="padding:4px 28px 8px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
      ${diretoresHTML}
    </div>

    <!-- PROPOSTAS LABEL -->
    <div style="display:flex;align-items:center;gap:10px;padding:10px 36px 4px;font-family:Oswald,sans-serif;font-size:10px;letter-spacing:4px;color:#d4af37;">
      <span>NOSSAS 12 PROPOSTAS</span>
      <span style="flex:1;height:1px;background:linear-gradient(90deg,#d4af37 0%,transparent 100%);"></span>
    </div>

    <!-- PROPOSTAS -->
    <div style="padding:4px 28px 10px;flex:1;display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
      ${temasHTML}
    </div>

    <!-- FOOTER -->
    <div style="padding:10px 36px 14px;border-top:1px solid rgba(212,175,55,0.25);display:flex;justify-content:space-between;align-items:center;">
      <div style="font-family:Oswald,sans-serif;font-size:10px;letter-spacing:3px;color:#94a3b8;">EU APOIO <strong style="color:#d4af37;">GESTÃO &amp; LUTA</strong></div>
      <div style="font-family:Oswald,sans-serif;font-size:10px;letter-spacing:3px;color:#94a3b8;text-align:right;">
        09.05.2026
        <span style="display:inline-block;padding:5px 14px;background:linear-gradient(135deg,#f4d06f,#d4af37 55%,#a8821c);color:#0f172a;font-family:Oswald,sans-serif;font-weight:700;font-size:11px;letter-spacing:3px;margin-left:10px;">VOTE CHAPA 3</span>
      </div>
    </div>
  </div>`
}

export async function generateChapaPDF() {
  // 1. Busca diretores
  let diretores
  try {
    const { data } = await supabase.from('directors').select('*').order('id')
    diretores = (data && data.length) ? data : diretoresFallback
  } catch {
    diretores = diretoresFallback
  }

  // 2. Monta template off-screen
  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'position:fixed;top:0;left:-9999px;z-index:-1;'
  wrapper.innerHTML = await buildTemplate(diretores)
  document.body.appendChild(wrapper)

  try {
    // aguarda fonts
    if (document.fonts && document.fonts.ready) await document.fonts.ready

    const node = wrapper.querySelector('#pdf-root')
    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0f172a',
      logging: false,
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    // A4: 210 x 297 mm
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297)
    pdf.save('Chapa-3-Gestao-e-Luta.pdf')
  } finally {
    document.body.removeChild(wrapper)
  }
}
