import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { supabase } from '../lib/supabase'
import { diretores as diretoresFallback } from '../data/diretores'
import { acoesImediatas } from '../data/acoesImediatas'

const SITE_URL = 'https://gestao-e-luta.vercel.app/'

const cargoMap = {
  1:'Presidente', 2:'Vice-Presidente', 3:'Secretário', 4:'Tesoureira',
  5:'Diretor Jurídico', 6:'Rel. Institucionais', 7:'Diretor de Inativos',
  8:'Diretor do Interior', 9:'Cargos e Atribuições',
}

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
  } catch { return null }
}

function dirCard(d) {
  const initials = d.nome.split(' ').slice(0, 2).map(n => n[0]).join('')
  const cargo = cargoMap[d.id] || (d.cargo || '').replace(/^candidat[ao] a /i, '')
  const avatarInner = d.fotoData
    ? `<img src="${d.fotoData}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<span style="font-family:Oswald,sans-serif;font-weight:700;color:#d4af37;font-size:28px;">${initials}</span>`
  return `
    <div style="width:148px;text-align:center;flex-shrink:0;padding:0 4px;">
      <div style="width:108px;height:108px;margin:0 auto 8px;border-radius:50%;padding:3px;position:relative;
                  background:linear-gradient(135deg,#f4d06f 0%,#d4af37 50%,#a8821c 100%);
                  box-shadow:0 5px 18px rgba(15,23,42,0.2);">
        <div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid #0f172a;"></div>
        <div style="width:100%;height:100%;border-radius:50%;background:#0f172a;overflow:hidden;
                    display:flex;align-items:center;justify-content:center;">
          ${avatarInner}
        </div>
      </div>
      <div style="font-family:Oswald,sans-serif;font-weight:600;font-size:14px;letter-spacing:0.5px;color:#0f172a;line-height:1.15;">${d.nome}</div>
      <div style="font-size:10.5px;color:#64748b;font-weight:500;margin-top:2px;">${cargo}</div>
    </div>`
}

function dirRow(list, gap = '22px') {
  return `<div style="display:flex;justify-content:center;gap:${gap};margin-bottom:8px;">${list.map(dirCard).join('')}</div>`
}

function footerHTML(page) {
  return `
    <div style="padding:10px 36px 13px;background:linear-gradient(135deg,#0b1a2e 0%,#0f172a 50%,#1e293b 100%);
                display:flex;align-items:center;justify-content:space-between;gap:16px;
                border-top:3px solid #d4af37;flex-shrink:0;">
      <div style="display:inline-flex;align-items:center;gap:8px;padding:9px 18px;
                  background:linear-gradient(135deg,#f4d06f,#d4af37 55%,#a8821c);
                  color:#0f172a;font-family:Oswald,sans-serif;font-weight:700;font-size:15px;letter-spacing:2px;flex-shrink:0;">
        ★ VOTE CHAPA 3
      </div>
      <div style="flex:1;text-align:center;line-height:1.5;">
        <div style="font-family:Inter,sans-serif;font-size:11px;color:#94a3b8;margin-bottom:6px;">
          Acesse o nosso site e conheça os detalhes das propostas da Chapa 3 — Gestão e Luta
        </div>
        <div style="display:inline-block;padding:6px 18px;background:linear-gradient(135deg,#f4d06f,#d4af37 55%,#a8821c);
                    color:#0f172a;font-family:Oswald,sans-serif;font-size:12px;font-weight:700;
                    letter-spacing:2px;text-transform:uppercase;border-radius:2px;">
          CLIQUE AQUI PARA ACESSAR
        </div>
      </div>
      <div style="text-align:right;font-family:Oswald,sans-serif;flex-shrink:0;">
        <div style="font-size:13px;letter-spacing:2px;color:#d4af37;font-weight:600;">ELEIÇÃO: 09.05.2026</div>
        <div style="font-size:10px;letter-spacing:2px;color:#64748b;margin-top:1px;">PÁGINA ${page} DE 3</div>
      </div>
    </div>`
}

function propostas() {
  const items = [
    { col: 'L', tema: null,          n:'1',  t:'Resgate da ACP das Promoções',    d:'Execução imediata da vitória judicial para regularizar as promoções atrasadas e pagar a correção monetária devida.' },
    { col: 'L', tema: null,          n:'2',  t:'Recomposição Salarial Já!',        d:'Pagamento integral das parcelas devidas da Lei 9.436/2021, com pressão permanente no TJ e na Alerj.' },
    { col: 'L', tema: null,          n:'3',  t:'Adequação das Carreiras',          d:'Comissário ao índice 1250, GHP no Triênio e Grat. Nível Superior ao Oficial de Polícia.' },
    { col: 'L', tema: null,          n:'4',  t:'Regulamentação dos Direitos',      d:'Adicional Noturno, Insalubridade, Auxílio-Saúde, Auxílio-Moradia e Horas Extras efetivados em lei.' },
    { col: 'L', tema: '🛡️ PREVIDÊNCIA E LEGISLAÇÃO', n:'5', t:'Plano de Saúde de Autogestão',  d:'Modelo similar ao PF Saúde — cobertura para ativos, aposentados e dependentes, com gestão autônoma.' },
    { col: 'L', tema: null,          n:'6',  t:'Regulamentação Pós-2013',          d:'Paridade previdenciária para todos os policiais, independente da data de ingresso na corporação.' },
    { col: 'R', tema: null,          n:'7',  t:'Efetivo Mínimo nos Plantões',      d:'Cumprimento da lei que garante o efetivo mínimo, pondo fim à sobrecarga que adoece o policial civil.' },
    { col: 'R', tema: null,          n:'8',  t:'Promoções por Bravura',            d:'Critérios claros, objetivos e transparentes — sem favorecimento, com reconhecimento real do mérito.' },
    { col: 'R', tema: null,          n:'9',  t:'Equipamentos e Segurança',         d:'Garantia dos meios necessários à função e proteção da integridade física de cada policial civil.' },
    { col: 'R', tema: '🏛️ ESTRUTURA E REPRESENTATIVIDADE', n:'10', t:'Reformas de Delegacias', d:'Parcerias público-privadas para modernização e melhores condições de trabalho em todo o estado.' },
    { col: 'R', tema: null,          n:'11', t:'Delegacias Sindicais no Interior', d:'Representatividade real — fim da desigualdade entre a capital e o interior do estado do Rio.' },
    { col: 'R', tema: null,          n:'12', t:'Cursos e Palestras',               d:'Capacitação profissional e jurídica para ativos e aposentados, com parcerias institucionais sérias.' },
  ]

  const temaHdr = (label) => `
    <div style="display:flex;align-items:center;gap:8px;padding:9px 14px;flex-shrink:0;
                background:linear-gradient(135deg,#0f172a,#1e293b);border-left:4px solid #d4af37;border-radius:4px;">
      <span style="font-size:17px;">${label.split(' ')[0]}</span>
      <span style="font-family:Oswald,sans-serif;font-weight:600;font-size:12px;letter-spacing:2px;color:#d4af37;text-transform:uppercase;">${label.split(' ').slice(1).join(' ')}</span>
    </div>`

  const card = (p) => `
    <div style="display:flex;align-items:stretch;flex:1;background:#fff;border:1px solid #cbd5e1;
                border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(15,23,42,0.07);min-height:0;">
      <div style="width:58px;flex-shrink:0;background:linear-gradient(180deg,#0f172a 0%,#1e293b 100%);
                  color:#d4af37;font-family:Oswald,sans-serif;font-weight:700;font-size:30px;
                  display:flex;align-items:center;justify-content:center;position:relative;">
        ${p.n}
        <div style="position:absolute;right:-11px;top:0;bottom:0;width:11px;
                    background:linear-gradient(180deg,#0f172a 0%,#1e293b 100%);
                    clip-path:polygon(0 0,100% 50%,0 100%);"></div>
      </div>
      <div style="flex:1;padding:10px 14px 10px 22px;display:flex;flex-direction:column;justify-content:center;">
        <div style="font-family:Oswald,sans-serif;font-weight:600;font-size:16px;letter-spacing:0.5px;
                    color:#0f172a;line-height:1.2;text-transform:uppercase;">${p.t}</div>
        <div style="font-size:12.5px;color:#475569;font-weight:500;margin-top:5px;line-height:1.5;">${p.d}</div>
      </div>
    </div>`

  const leftItems  = items.filter(i => i.col === 'L')
  const rightItems = items.filter(i => i.col === 'R')

  const colHTML = (list, topTema) => {
    let html = topTema ? temaHdr(topTema) : ''
    list.forEach(p => {
      if (p.tema) html += temaHdr(p.tema)
      html += card(p)
    })
    return `<div style="display:flex;flex-direction:column;gap:7px;min-height:0;">${html}</div>`
  }

  return `
    <div style="flex:1;padding:4px 28px 8px;display:grid;grid-template-columns:1fr 1fr;gap:7px 14px;min-height:0;">
      ${colHTML(leftItems,  '💰 VALORIZAÇÃO SALARIAL')}
      ${colHTML(rightItems, '⚖️ PROTEÇÃO JURÍDICA')}
    </div>`
}

async function buildPage1(diretores) {
  return `
  <div id="pdf-p1" style="width:794px;height:1123px;background:linear-gradient(180deg,#f1f5f9 0%,#e2e8f0 100%);
       color:#0f172a;position:relative;overflow:hidden;display:flex;flex-direction:column;font-family:Inter,sans-serif;">

    <!-- BANNER -->
    <div style="position:relative;height:155px;background:linear-gradient(135deg,#0b1a2e 0%,#0f172a 45%,#1e293b 55%,#0b1a2e 100%);overflow:hidden;flex-shrink:0;">
      <div style="position:absolute;top:0;bottom:0;left:0;width:90px;background:linear-gradient(135deg,#f4d06f,#d4af37 55%,#a8821c);clip-path:polygon(0 0,100% 0,70% 100%,0 100%);"></div>
      <div style="position:absolute;top:0;bottom:0;right:0;width:90px;background:linear-gradient(135deg,#f4d06f,#d4af37 55%,#a8821c);clip-path:polygon(30% 0,100% 0,100% 100%,0 100%);"></div>
      <div style="position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0 130px;text-align:center;gap:2px;">
        <div style="font-family:Oswald,sans-serif;font-weight:700;font-size:44px;letter-spacing:4px;color:#fff;line-height:1.1;">CHAPA 3</div>
        <div style="font-family:Oswald,sans-serif;font-weight:700;font-size:44px;letter-spacing:4px;color:#d4af37;line-height:1.1;">GESTÃO &amp; LUTA</div>
        <div style="margin-top:10px;font-family:Oswald,sans-serif;font-size:11px;letter-spacing:3px;color:#e2e8f0;background:rgba(212,175,55,0.15);border:1px solid rgba(212,175,55,0.5);padding:5px 18px;text-transform:uppercase;">
          GESTÃO PARA ORGANIZAR &nbsp;|&nbsp; LUTA PARA VENCER
        </div>
      </div>
    </div>

    <!-- DIRETORIA -->
    <div style="text-align:center;padding:14px 0 10px;flex-shrink:0;">
      <h2 style="font-family:Oswald,sans-serif;font-weight:700;font-size:24px;letter-spacing:4px;color:#0f172a;text-transform:uppercase;display:inline-block;padding:0 28px;">Diretoria Executiva</h2>
    </div>
    <div style="padding:0 28px;flex-shrink:0;">
      ${dirRow(diretores.slice(0, 4), '22px')}
      ${dirRow(diretores.slice(4, 9), '16px')}
    </div>

    <!-- CARD INSTITUCIONAL -->
    <div style="margin:10px 36px;padding:18px 22px;background:#fff;border:1px solid #cbd5e1;border-left:4px solid #d4af37;border-radius:4px;box-shadow:0 2px 6px rgba(15,23,42,0.07);flex-shrink:0;">
      <p style="font-size:13px;color:#334155;line-height:1.7;">A chapa <strong style="color:#0f172a;">GESTÃO &amp; LUTA</strong> foi construída contemplando todos os cargos e gerações da Polícia Civil. Aqui estão policiais mais novos e os mais experientes — todos reunidos num consenso sobre os rumos que o sindicato e a polícia devem seguir.</p>
    </div>

    <!-- PILARES -->
    <div style="text-align:center;padding:12px 0 8px;flex-shrink:0;">
      <h2 style="font-family:Oswald,sans-serif;font-weight:700;font-size:24px;letter-spacing:4px;color:#0f172a;text-transform:uppercase;display:inline-block;padding:0 28px;">Nossos Pilares</h2>
    </div>
    <div style="flex:1;padding:0 36px 10px;display:flex;flex-direction:column;gap:0;">
      ${['01:Integridade:Conduta ética e irretocável em cada decisão, sem favorecimento nem política — porque o sindicalizado merece representantes honestos.',
         '02:Compromisso:Cada proposta tem prazo e responsável definidos. Cobrança pública dos resultados a cada 6 meses.',
         '03:Resultado:Histórico comprovado de conquistas. Não promessas — entregas. O sindicalizado merece ver mudanças reais.']
        .map(s => {
          const [num, titulo, desc] = s.split(':')
          return `<div style="flex:1;display:flex;align-items:center;gap:18px;background:#fff;border:1px solid #cbd5e1;border-radius:5px;padding:0 20px;box-shadow:0 2px 6px rgba(15,23,42,0.06);margin-bottom:8px;">
            <div style="font-family:Oswald,sans-serif;font-weight:700;font-size:52px;color:#d4af37;opacity:0.35;line-height:1;flex-shrink:0;width:52px;">${num}</div>
            <div>
              <div style="font-family:Oswald,sans-serif;font-weight:700;font-size:18px;letter-spacing:2px;color:#0f172a;text-transform:uppercase;margin-bottom:5px;">${titulo}</div>
              <div style="font-size:13px;color:#475569;line-height:1.6;">${desc}</div>
            </div>
          </div>`
        }).join('')}
    </div>

    ${footerHTML(1)}
  </div>`
}

function buildPage2() {
  return `
  <div id="pdf-p2" style="width:794px;height:1123px;background:linear-gradient(180deg,#f1f5f9 0%,#e2e8f0 100%);
       color:#0f172a;position:relative;overflow:hidden;display:flex;flex-direction:column;font-family:Inter,sans-serif;">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#0b1a2e 0%,#0f172a 50%,#1e293b 100%);padding:12px 36px;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #d4af37;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;background:linear-gradient(135deg,#f4d06f,#d4af37 55%,#a8821c);display:flex;align-items:center;justify-content:center;font-family:Oswald,sans-serif;font-weight:700;color:#0f172a;font-size:13px;">GL</div>
        <div style="font-family:Oswald,sans-serif;font-weight:600;letter-spacing:3px;font-size:14px;color:#fff;">GESTÃO <span style="color:#d4af37;">&amp;</span> LUTA</div>
      </div>
      <div style="font-family:Oswald,sans-serif;font-weight:700;font-size:20px;letter-spacing:3px;color:#d4af37;">CHAPA 3</div>
    </div>

    <!-- TITLE -->
    <div style="text-align:center;padding:14px 0 10px;flex-shrink:0;">
      <h2 style="font-family:Oswald,sans-serif;font-weight:700;font-size:24px;letter-spacing:4px;color:#0f172a;text-transform:uppercase;display:inline-block;padding:0 28px;">Nossas 12 Propostas</h2>
    </div>

    ${propostas()}
    ${footerHTML(2)}
  </div>`
}

function buildPage3() {
  const acaoCard = (a) => `
    <div style="margin-bottom:4px;padding:5px 10px 5px 12px;background:#fff;
                border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;
                border-right:1px solid #e2e8f0;border-left:3px solid #d4af37;">
      <div style="font-family:Oswald,sans-serif;font-weight:700;font-size:11.5px;
                  color:#0f172a;text-transform:uppercase;line-height:1.3;">
        <span style="color:#d4af37;margin-right:5px;">${String(a.id).padStart(2,'0')}.</span>${a.titulo}
      </div>
      <div style="font-size:10.5px;color:#475569;line-height:1.4;margin-top:1px;">${a.descricao}</div>
    </div>`

  const col1 = acoesImediatas.filter(a => a.id <= 8)
  const col2 = acoesImediatas.filter(a => a.id > 8)

  return `
  <div id="pdf-p3" style="width:794px;height:1123px;background:#f1f5f9;
       color:#0f172a;overflow:hidden;font-family:Inter,sans-serif;display:flex;flex-direction:column;">

    <!-- HEADER (igual páginas 1 e 2) -->
    <div style="background:linear-gradient(135deg,#0b1a2e 0%,#0f172a 50%,#1e293b 100%);padding:12px 36px;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #d4af37;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;background:linear-gradient(135deg,#f4d06f,#d4af37 55%,#a8821c);display:flex;align-items:center;justify-content:center;font-family:Oswald,sans-serif;font-weight:700;color:#0f172a;font-size:13px;">GL</div>
        <div style="font-family:Oswald,sans-serif;font-weight:600;letter-spacing:3px;font-size:14px;color:#fff;">GESTÃO <span style="color:#d4af37;">&amp;</span> LUTA</div>
      </div>
      <div style="font-family:Oswald,sans-serif;font-weight:700;font-size:20px;letter-spacing:3px;color:#d4af37;">CHAPA 3</div>
    </div>

    <!-- TITLE -->
    <div style="text-align:center;padding:10px 36px 6px;flex-shrink:0;">
      <h2 style="font-family:Oswald,sans-serif;font-weight:700;font-size:22px;letter-spacing:4px;color:#0f172a;text-transform:uppercase;display:inline-block;margin:0;">Acoes Imediatas</h2>
      <p style="font-size:11px;color:#64748b;margin:4px 0 0;font-style:italic;">
        Quem ja fez e sabe o caminho nao precisa prometer ilusoes.
      </p>
    </div>

    <!-- COLUNAS via table (mais compativel com html2canvas) -->
    <div style="flex:1;padding:0 16px;">
      <table style="width:100%;border-collapse:collapse;border-spacing:0;">
        <tr style="vertical-align:top;">
          <td style="width:50%;padding-right:8px;">${col1.map(acaoCard).join('')}</td>
          <td style="width:50%;padding-left:8px;">${col2.map(acaoCard).join('')}</td>
        </tr>
      </table>
    </div>

    ${footerHTML(3)}
  </div>`
}

export async function generateChapaPDF({ returnBlob = false } = {}) {
  let diretores
  try {
    const { data } = await supabase.from('directors').select('*').order('id')
    diretores = (data && data.length) ? data : diretoresFallback
  } catch { diretores = diretoresFallback }

  // pré-carrega fotos
  const withPhotos = await Promise.all(diretores.map(async d => ({
    ...d,
    fotoData: d.foto ? await toDataURL(d.foto) : null,
  })))

  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'position:fixed;top:0;left:-9999px;z-index:-1;pointer-events:none;display:flex;flex-direction:column;gap:0;'
  wrapper.innerHTML = await buildPage1(withPhotos) + buildPage2() + buildPage3()
  document.body.appendChild(wrapper)

  try {
    if (document.fonts?.ready) await document.fonts.ready

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const scale = returnBlob ? 1.5 : 2
    // Escala px → mm: 794px = 210mm
    const pxToMm = 210 / 794

    for (const [i, id] of [['pdf-p1', 1], ['pdf-p2', 2], ['pdf-p3', 3]]) {
      const node = wrapper.querySelector(`#${i}`)
      const canvas = await html2canvas(node, {
        scale, useCORS: true, backgroundColor: '#f1f5f9',
        logging: false, width: 794, height: 1123,
        windowWidth: 794, windowHeight: 1123,
      })
      const imgData = canvas.toDataURL('image/jpeg', returnBlob ? 0.80 : 0.95)
      if (id > 1) pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297)

      // Link clicável sobre o botão "CLIQUE AQUI PARA ACESSAR" no rodapé
      // Botão centralizado em x=397px, largura ~170px, altura ~26px
      // Footer inicia em y=(1123-46)px, botão ~8px abaixo do texto de 11px (~18px) + 6px margin
      const btnW = 170 * pxToMm   // ~45mm
      const btnX = (397 - 85) * pxToMm  // ~82mm
      const btnY = (1123 - 38) * pxToMm // ~284mm
      const btnH = 26 * pxToMm    // ~7mm
      pdf.link(btnX, btnY, btnW, btnH, { url: SITE_URL })
    }

    if (returnBlob) {
      const buf  = pdf.output('arraybuffer')
      const blob = new Blob([buf], { type: 'application/pdf' })
      return new File([blob], 'Chapa-3-Gestao-e-Luta.pdf', { type: 'application/pdf' })
    }
    pdf.save('Chapa-3-Gestao-e-Luta.pdf')
  } finally {
    document.body.removeChild(wrapper)
  }
}
