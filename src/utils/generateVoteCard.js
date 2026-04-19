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

// ─── Layout (1080 × 1080) ────────────────────────────────────────────────────
//  y=   0–  16  barra dourada topo
//  y=  16– 216  header: SINDPOL / CHAPA 3 / GESTÃO & LUTA
//  y= 216– 460  data: VOTE EM · 09 DE MAIO DE 2026 · 9H30
//  y= 460– 560  local: SEDE DO SINDPOL-RJ
//  y= 560– 740  candidatos: LUIZ CLÁUDIO | MÁRCIA BEZERRA
//  y= 740– 940  CTA: botão VOTE + URL
//  y= 940–1064  rodapé decorativo
//  y=1064–1080  barra dourada base
// ─────────────────────────────────────────────────────────────────────────────

export async function generateVoteCard() {
  await document.fonts.ready

  const W = 1080, H = 1080
  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // ── Background navy gradient ─────────────────────────────────────────────────
  const bgG = ctx.createLinearGradient(0, 0, W, H)
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

  // ── Barras topo e base ───────────────────────────────────────────────────────
  ctx.fillStyle = goldGrad(ctx, 0, W)
  ctx.fillRect(0, 0, W, 16)
  ctx.fillRect(0, H - 16, W, 16)

  ctx.textAlign    = 'center'
  ctx.textBaseline = 'alphabetic'

  // ════════════════════════════════════════════════════════════════════════════
  // HEADER  (y=16…216)
  // ════════════════════════════════════════════════════════════════════════════
  ctx.fillStyle = 'rgba(0,0,0,0.26)'
  ctx.fillRect(0, 16, W, 200)

  // SINDPOL-RJ — ELEIÇÕES 2026
  ctx.fillStyle     = 'rgba(212,175,55,0.60)'
  ctx.font          = '500 22px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('SINDPOL-RJ  —  ELEIÇÕES 2026', W / 2, 52)
  ctx.letterSpacing = '0'

  // Badge CHAPA 3  (y=66 → y=120)
  const bW = 280, bH = 54, bX = (W - bW) / 2, bY = 66
  ctx.fillStyle    = goldGrad(ctx, bX, bW)
  ctx.fillRect(bX, bY, bW, bH)
  ctx.fillStyle     = '#07111F'
  ctx.font          = 'bold 36px "Oswald", sans-serif'
  ctx.letterSpacing = '0.22em'
  ctx.textBaseline  = 'middle'
  ctx.fillText('CHAPA  3', W / 2, bY + bH / 2 + 2)
  ctx.textBaseline  = 'alphabetic'
  ctx.letterSpacing = '0'

  // Separador fino após badge
  fadeLine(ctx, 134, 200, W - 200, 0.22)

  // GESTÃO & LUTA
  const glG = ctx.createLinearGradient(0, 148, 0, 212)
  glG.addColorStop(0,    '#FDE99A')
  glG.addColorStop(0.40, '#D4AF37')
  glG.addColorStop(1,    '#8B6914')
  ctx.fillStyle     = glG
  ctx.font          = 'bold 76px "Oswald", sans-serif'
  ctx.letterSpacing = '0.05em'
  ctx.fillText('GESTÃO & LUTA', W / 2, 208)
  ctx.letterSpacing = '0'

  // ════════════════════════════════════════════════════════════════════════════
  // DATA  (y=216…462)
  // ════════════════════════════════════════════════════════════════════════════
  fadeLine(ctx, 222, 80, W - 80, 0.55)

  // ── Deslocamento de +32 px em relação à versão anterior ─────────────────────
  // Cria respiro entre o cabeçalho GESTÃO & LUTA e a seção da data

  // VOTE EM
  ctx.fillStyle     = 'rgba(255,255,255,0.55)'
  ctx.font          = '500 38px "Oswald", sans-serif'
  ctx.letterSpacing = '0.22em'
  ctx.fillText('VOTE EM', W / 2, 310)
  ctx.letterSpacing = '0'

  // 09 DE MAIO DE 2026 — LINHA ÚNICA, cor branca
  ctx.fillStyle     = 'rgba(255,255,255,0.95)'
  ctx.font          = 'bold 82px "Oswald", sans-serif'
  ctx.letterSpacing = '0.03em'
  ctx.fillText('09 DE MAIO DE 2026', W / 2, 424)
  ctx.letterSpacing = '0'

  // · 9H30 ·
  ctx.fillStyle     = '#D4AF37'
  ctx.font          = '600 38px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('·   9H30   ·', W / 2, 476)
  ctx.letterSpacing = '0'

  // ════════════════════════════════════════════════════════════════════════════
  // LOCAL
  // ════════════════════════════════════════════════════════════════════════════
  fadeLine(ctx, 498, 100, W - 100, 0.50)

  ctx.fillStyle     = 'rgba(255,255,255,0.50)'
  ctx.font          = '500 24px "Oswald", sans-serif'
  ctx.letterSpacing = '0.14em'
  ctx.fillText('SEDE DO SINDPOL-RJ', W / 2, 548)
  ctx.letterSpacing = '0'

  fadeLine(ctx, 582, 220, W - 220, 0.30)

  // ════════════════════════════════════════════════════════════════════════════
  // CANDIDATOS
  // ════════════════════════════════════════════════════════════════════════════

  ctx.fillStyle     = 'rgba(212,175,55,0.55)'
  ctx.font          = '600 20px "Oswald", sans-serif'
  ctx.letterSpacing = '0.22em'
  ctx.fillText('NOSSA CHAPA', W / 2, 624)
  ctx.letterSpacing = '0'

  ctx.save()
  ctx.strokeStyle = 'rgba(212,175,55,0.30)'
  ctx.lineWidth   = 1.5
  ctx.beginPath(); ctx.moveTo(W / 2, 632); ctx.lineTo(W / 2, 758); ctx.stroke()
  ctx.restore()

  // LUIZ CLÁUDIO — esquerda
  ctx.fillStyle     = '#FFFFFF'
  ctx.font          = 'bold 50px "Oswald", sans-serif'
  ctx.letterSpacing = '0.03em'
  ctx.fillText('LUIZ CLÁUDIO', W / 4, 694)
  ctx.fillStyle     = '#D4AF37'
  ctx.font          = '600 22px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('PRESIDENTE', W / 4, 730)
  ctx.letterSpacing = '0'

  // MÁRCIA BEZERRA — direita
  ctx.fillStyle     = '#FFFFFF'
  ctx.font          = 'bold 50px "Oswald", sans-serif'
  ctx.letterSpacing = '0.03em'
  ctx.fillText('MÁRCIA BEZERRA', (W * 3) / 4, 694)
  ctx.fillStyle     = '#D4AF37'
  ctx.font          = '600 22px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('VICE-PRESIDENTE', (W * 3) / 4, 730)
  ctx.letterSpacing = '0'

  fadeLine(ctx, 762, 80, W - 80, 0.45)

  // ════════════════════════════════════════════════════════════════════════════
  // CTA + URL
  // ════════════════════════════════════════════════════════════════════════════
  const ctaW = W - 140, ctaH = 82, ctaX = 70, ctaY = 790
  ctx.fillStyle    = goldGrad(ctx, ctaX, ctaW)
  ctx.fillRect(ctaX, ctaY, ctaW, ctaH)
  ctx.fillStyle     = '#07111F'
  ctx.font          = 'bold 30px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.textBaseline  = 'middle'
  ctx.fillText('VOTE GESTÃO E LUTA!', W / 2, ctaY + ctaH / 2 + 1)
  ctx.textBaseline  = 'alphabetic'
  ctx.letterSpacing = '0'

  ctx.fillStyle     = '#D4AF37'
  ctx.font          = 'bold 36px "Oswald", sans-serif'
  ctx.letterSpacing = '0.08em'
  ctx.fillText('bit.ly/chapa3_sindpol', W / 2, 932)
  ctx.letterSpacing = '0'

  // ════════════════════════════════════════════════════════════════════════════
  // RODAPÉ
  // ════════════════════════════════════════════════════════════════════════════
  fadeLine(ctx, 976, 200, W - 200, 0.25)

  ctx.fillStyle     = 'rgba(212,175,55,0.38)'
  ctx.font          = '500 18px "Oswald", sans-serif'
  ctx.letterSpacing = '0.22em'
  ctx.fillText('SINDPOL-RJ  ·  ELEIÇÕES 2026', W / 2, 1030)
  ctx.letterSpacing = '0'

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], 'vote-chapa3.png', { type: 'image/png' }))
    }, 'image/png')
  })
}
