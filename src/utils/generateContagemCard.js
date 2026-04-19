function goldGrad(ctx, x, w) {
  const g = ctx.createLinearGradient(x, 0, x + w, 0)
  g.addColorStop(0,    '#7A5C10')
  g.addColorStop(0.25, '#C9A227')
  g.addColorStop(0.50, '#F0C84A')
  g.addColorStop(0.75, '#C9A227')
  g.addColorStop(1,    '#7A5C10')
  return g
}

function fadeLine(ctx, y, x0, x1, alpha = 0.7) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0)
  g.addColorStop(0,   `rgba(201,162,39,0)`)
  g.addColorStop(0.3, `rgba(201,162,39,${alpha})`)
  g.addColorStop(0.7, `rgba(201,162,39,${alpha})`)
  g.addColorStop(1,   `rgba(201,162,39,0)`)
  ctx.save()
  ctx.strokeStyle = g; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke()
  ctx.restore()
}

async function fetchAsDataURL(url) {
  const resp = await fetch(url, { mode: 'cors' })
  const blob = await resp.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload  = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// ─── Layout (1080 × 1920) ─────────────────────────────────────────────────────
//  y=   0–  16  barra dourada topo
//  y=  16– 296  header (navy overlay): SINDPOL / CHAPA 3 / GESTÃO & LUTA
//  y= 296– 720  contagem: FALTAM  •  número  •  DIAS  •  PARA A ELEIÇÃO
//  y= 720– 746  separador
//  y= 746–1380  fotos da chapa: label  •  2 círculos  •  nomes  •  cargo
//  y=1380–1600  CTA: botão dourado  •  URL grande
//  y=1600–1904  rodapé: data eleição  •  data geração  •  fade  •  barra
//  y=1904–1920  barra dourada base
// ─────────────────────────────────────────────────────────────────────────────

export async function generateContagemCard({ presidenteFotoUrl = null, vpFotoUrl = null } = {}) {
  await document.fonts.ready

  const W = 1080, H = 1920
  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // ── Background ───────────────────────────────────────────────────────────────
  const bgG = ctx.createLinearGradient(0, 0, 0, H)
  bgG.addColorStop(0,    '#112038')
  bgG.addColorStop(0.45, '#07111F')
  bgG.addColorStop(0.70, '#060E1C')
  bgG.addColorStop(1,    '#0D1D36')
  ctx.fillStyle = bgG
  ctx.fillRect(0, 0, W, H)

  ctx.save()
  ctx.strokeStyle = 'rgba(40,100,200,0.07)'
  ctx.lineWidth = 1
  for (let i = -H; i < W + H; i += 60) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke()
  }
  ctx.restore()

  ctx.fillStyle = goldGrad(ctx, 0, W)
  ctx.fillRect(0, 0, W, 16)
  ctx.fillRect(0, H - 16, W, 16)

  ctx.textAlign    = 'center'
  ctx.textBaseline = 'alphabetic'

  // ════════════════════════════════════════════════════════════════════════════
  // HEADER  (y=16…296)
  // ════════════════════════════════════════════════════════════════════════════
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.fillRect(0, 16, W, 280)

  ctx.fillStyle     = 'rgba(212,175,55,0.60)'
  ctx.font          = '500 24px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('SINDPOL-RJ  —  ELEIÇÕES 2026', W / 2, 58)
  ctx.letterSpacing = '0'

  const bW = 290, bH = 56, bX = (W - bW) / 2, bY = 74
  ctx.fillStyle    = goldGrad(ctx, bX, bW)
  ctx.fillRect(bX, bY, bW, bH)
  ctx.fillStyle     = '#07111F'
  ctx.font          = 'bold 42px "Oswald", sans-serif'
  ctx.letterSpacing = '0.22em'
  ctx.textBaseline  = 'middle'
  ctx.fillText('CHAPA  3', W / 2, bY + bH / 2 + 2)
  ctx.textBaseline  = 'alphabetic'
  ctx.letterSpacing = '0'

  const glG = ctx.createLinearGradient(0, 148, 0, 258)
  glG.addColorStop(0,    '#FDE99A')
  glG.addColorStop(0.40, '#D4AF37')
  glG.addColorStop(1,    '#8B6914')
  ctx.fillStyle     = glG
  ctx.font          = 'bold 108px "Oswald", sans-serif'
  ctx.letterSpacing = '0.05em'
  ctx.fillText('GESTÃO & LUTA', W / 2, 248)
  ctx.letterSpacing = '0'

  fadeLine(ctx, 270, 60, W - 60, 0.65)

  // ════════════════════════════════════════════════════════════════════════════
  // CONTAGEM  (y=296…720)
  // ════════════════════════════════════════════════════════════════════════════
  const hoje    = new Date()
  const eleicao = new Date('2026-05-09')
  const dias    = Math.max(0, Math.ceil((eleicao - hoje) / 86400000))

  ctx.fillStyle     = 'rgba(255,255,255,0.50)'
  ctx.font          = '500 36px "Oswald", sans-serif'
  ctx.letterSpacing = '0.22em'
  ctx.fillText('FALTAM', W / 2, 378)
  ctx.letterSpacing = '0'

  const numG = ctx.createLinearGradient(0, 370, 0, 560)
  numG.addColorStop(0,    '#FDE99A')
  numG.addColorStop(0.45, '#D4AF37')
  numG.addColorStop(1,    '#8B6914')
  ctx.fillStyle     = numG
  ctx.font          = 'bold 180px "Oswald", sans-serif'
  ctx.letterSpacing = '0.02em'
  ctx.fillText(String(dias), W / 2, 540)
  ctx.letterSpacing = '0'

  ctx.fillStyle     = '#D4AF37'
  ctx.font          = '600 50px "Oswald", sans-serif'
  ctx.letterSpacing = '0.25em'
  ctx.fillText('DIAS', W / 2, 600)
  ctx.letterSpacing = '0'

  fadeLine(ctx, 642, 100, W - 100, 0.55)

  ctx.fillStyle     = 'rgba(255,255,255,0.60)'
  ctx.font          = '500 32px "Oswald", sans-serif'
  ctx.letterSpacing = '0.10em'
  ctx.fillText('PARA A ELEIÇÃO DO SINDPOL-RJ', W / 2, 698)
  ctx.letterSpacing = '0'

  fadeLine(ctx, 734, 80, W - 80, 0.35)

  // ════════════════════════════════════════════════════════════════════════════
  // FOTOS DA CHAPA  (y=746…1380)
  // CY=1046, R=225 → ring top=815  ring bottom=1277
  // Nomes (48px, cap≈35px): y=1324 → cap top=1289 → gap de 12 px ✓
  // ════════════════════════════════════════════════════════════════════════════
  ctx.fillStyle     = 'rgba(212,175,55,0.55)'
  ctx.font          = '600 22px "Oswald", sans-serif'
  ctx.letterSpacing = '0.22em'
  ctx.fillText('NOSSA CHAPA', W / 2, 788)
  ctx.letterSpacing = '0'

  // Divisor vertical entre as fotos
  ctx.save()
  ctx.strokeStyle = 'rgba(212,175,55,0.20)'
  ctx.lineWidth   = 1.5
  ctx.beginPath()
  ctx.moveTo(W / 2, 796)
  ctx.lineTo(W / 2, 1360)
  ctx.stroke()
  ctx.restore()

  const photoCY = 1046, photoR = 225
  const leftCX  = W / 4          // 270
  const rightCX = (W * 3) / 4    // 810

  // Desenha um círculo de foto (com anel dourado)
  const drawFoto = async (fotoUrl, initials, cx, cy, r) => {
    const rg = ctx.createLinearGradient(cx - r - 6, 0, cx + r + 6, 0)
    rg.addColorStop(0,    '#7A5C10')
    rg.addColorStop(0.25, '#C9A227')
    rg.addColorStop(0.50, '#F0C84A')
    rg.addColorStop(0.75, '#C9A227')
    rg.addColorStop(1,    '#7A5C10')
    ctx.beginPath()
    ctx.arc(cx, cy, r + 6, 0, Math.PI * 2)
    ctx.fillStyle = rg
    ctx.fill()

    let loaded = false
    if (fotoUrl) {
      try {
        const dataURL = await fetchAsDataURL(fotoUrl)
        const img     = await loadImage(dataURL)
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.clip()
        const scale = Math.max((r * 2) / img.width, (r * 2) / img.height)
        ctx.drawImage(img, cx - img.width * scale / 2, cy - img.height * scale / 2, img.width * scale, img.height * scale)
        ctx.restore()
        loaded = true
      } catch (_) {}
    }

    if (!loaded) {
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      const ng = ctx.createRadialGradient(cx, cy - 50, 0, cx, cy, r)
      ng.addColorStop(0, '#1A3560')
      ng.addColorStop(1, '#07111F')
      ctx.fillStyle = ng
      ctx.fill()
      ctx.fillStyle     = 'rgba(212,175,55,0.90)'
      ctx.font          = `bold ${Math.round(r * 0.45)}px "Oswald", sans-serif`
      ctx.textAlign     = 'center'
      ctx.textBaseline  = 'middle'
      ctx.fillText(initials, cx, cy)
      ctx.textBaseline  = 'alphabetic'
    }
  }

  await drawFoto(presidenteFotoUrl, 'LC', leftCX,  photoCY, photoR)
  await drawFoto(vpFotoUrl,         'MB', rightCX, photoCY, photoR)

  // Nomes
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle    = '#FFFFFF'
  ctx.font         = 'bold 46px "Oswald", sans-serif'
  ctx.letterSpacing = '0.03em'
  ctx.fillText('LUIZ CLÁUDIO',   leftCX,  1324)
  ctx.fillText('MÁRCIA BEZERRA', rightCX, 1324)
  ctx.letterSpacing = '0'

  ctx.fillStyle     = '#D4AF37'
  ctx.font          = '600 24px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('PRESIDENTE',     leftCX,  1365)
  ctx.fillText('VICE-PRESIDENTE', rightCX, 1365)
  ctx.letterSpacing = '0'

  fadeLine(ctx, 1402, 80, W - 80, 0.40)

  // ════════════════════════════════════════════════════════════════════════════
  // CTA + URL  (y=1402…1640)
  // ════════════════════════════════════════════════════════════════════════════
  const ctaW = W - 140, ctaH = 82, ctaX = 70, ctaYpos = 1440
  ctx.fillStyle    = goldGrad(ctx, ctaX, ctaW)
  ctx.fillRect(ctaX, ctaYpos, ctaW, ctaH)
  ctx.fillStyle     = '#07111F'
  ctx.font          = 'bold 30px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.textBaseline  = 'middle'
  ctx.fillText('VOTE GESTÃO E LUTA!', W / 2, ctaYpos + ctaH / 2 + 1)
  ctx.textBaseline  = 'alphabetic'
  ctx.letterSpacing = '0'

  ctx.fillStyle     = 'rgba(212,175,55,0.65)'
  ctx.font          = '500 28px "Oswald", sans-serif'
  ctx.letterSpacing = '0.10em'
  ctx.fillText('ACESSE O NOSSO SITE E SAIBA MAIS', W / 2, 1570)
  ctx.letterSpacing = '0'

  ctx.fillStyle     = '#D4AF37'
  ctx.font          = 'bold 54px "Oswald", sans-serif'
  ctx.letterSpacing = '0.06em'
  ctx.fillText('bit.ly/chapa3_sindpol', W / 2, 1636)
  ctx.letterSpacing = '0'

  // ════════════════════════════════════════════════════════════════════════════
  // RODAPÉ  (y=1660…1904)
  // ════════════════════════════════════════════════════════════════════════════
  fadeLine(ctx, 1680, 80, W - 80, 0.45)

  ctx.fillStyle     = '#FFFFFF'
  ctx.font          = '600 28px "Oswald", sans-serif'
  ctx.letterSpacing = '0.14em'
  ctx.fillText('09 DE MAIO DE 2026  ·  9H30', W / 2, 1732)
  ctx.letterSpacing = '0'

  const dateStr = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  ctx.fillStyle     = 'rgba(212,175,55,0.45)'
  ctx.font          = '500 22px "Oswald", sans-serif'
  ctx.letterSpacing = '0.12em'
  ctx.fillText(`GERADO EM ${dateStr}`, W / 2, 1784)
  ctx.letterSpacing = '0'

  fadeLine(ctx, 1852, 120, W - 120, 0.25)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], 'contagem-chapa3.png', { type: 'image/png' }))
    }, 'image/png')
  })
}
