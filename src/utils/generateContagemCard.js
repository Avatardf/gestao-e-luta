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

export async function generateContagemCard() {
  await document.fonts.ready

  const W = 1080, H = 1920
  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // ── Background navy gradient ────────────────────────────────────────────────
  const bgG = ctx.createLinearGradient(0, 0, 0, H)
  bgG.addColorStop(0,    '#112038')
  bgG.addColorStop(0.45, '#07111F')
  bgG.addColorStop(0.70, '#060E1C')
  bgG.addColorStop(1,    '#0D1D36')
  ctx.fillStyle = bgG
  ctx.fillRect(0, 0, W, H)

  // Textura diagonal sutil
  ctx.save()
  ctx.strokeStyle = 'rgba(40,100,200,0.07)'
  ctx.lineWidth = 1
  for (let i = -H; i < W + H; i += 60) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke()
  }
  ctx.restore()

  // ── Barras topo e base ──────────────────────────────────────────────────────
  ctx.fillStyle = goldGrad(ctx, 0, W)
  ctx.fillRect(0, 0, W, 16)
  ctx.fillRect(0, H - 16, W, 16)

  ctx.textAlign    = 'center'
  ctx.textBaseline = 'alphabetic'

  // ── Header (bg escuro) ──────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.fillRect(0, 16, W, 280)

  // SINDPOL-RJ
  ctx.fillStyle    = 'rgba(212,175,55,0.60)'
  ctx.font         = '500 24px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('SINDPOL-RJ  —  ELEIÇÕES 2026', W / 2, 58)
  ctx.letterSpacing = '0'

  // Badge CHAPA 3
  const bW = 290, bH = 56, bX = (W - bW) / 2, bY = 74
  ctx.fillStyle    = goldGrad(ctx, bX, bW)
  ctx.fillRect(bX, bY, bW, bH)
  ctx.fillStyle    = '#07111F'
  ctx.font         = 'bold 42px "Oswald", sans-serif'
  ctx.letterSpacing = '0.22em'
  ctx.textBaseline = 'middle'
  ctx.fillText('CHAPA  3', W / 2, bY + bH / 2 + 2)
  ctx.textBaseline = 'alphabetic'
  ctx.letterSpacing = '0'

  // GESTÃO & LUTA
  const glG = ctx.createLinearGradient(0, 148, 0, 258)
  glG.addColorStop(0,    '#FDE99A')
  glG.addColorStop(0.40, '#D4AF37')
  glG.addColorStop(1,    '#8B6914')
  ctx.fillStyle    = glG
  ctx.font         = 'bold 108px "Oswald", sans-serif'
  ctx.letterSpacing = '0.05em'
  ctx.fillText('GESTÃO & LUTA', W / 2, 248)
  ctx.letterSpacing = '0'

  // Linha fade
  fadeLine(ctx, 270, 60, W - 60, 0.65)

  // ── Seção contagem ──────────────────────────────────────────────────────────
  // Calcular dias restantes
  const hoje      = new Date()
  const eleicao   = new Date('2026-05-09')
  const diffMs    = eleicao - hoje
  const dias      = Math.max(0, Math.ceil(diffMs / 86400000))

  // "FALTAM"
  ctx.fillStyle    = 'rgba(255,255,255,0.50)'
  ctx.font         = '500 36px "Oswald", sans-serif'
  ctx.letterSpacing = '0.22em'
  ctx.fillText('FALTAM', W / 2, 380)
  ctx.letterSpacing = '0'

  // Número de dias
  const numG = ctx.createLinearGradient(0, 370, 0, 560)
  numG.addColorStop(0,    '#FDE99A')
  numG.addColorStop(0.45, '#D4AF37')
  numG.addColorStop(1,    '#8B6914')
  ctx.fillStyle    = numG
  ctx.font         = 'bold 180px "Oswald", sans-serif'
  ctx.letterSpacing = '0.02em'
  ctx.fillText(String(dias), W / 2, 540)
  ctx.letterSpacing = '0'

  // "DIAS"
  ctx.fillStyle    = '#D4AF37'
  ctx.font         = '600 50px "Oswald", sans-serif'
  ctx.letterSpacing = '0.25em'
  ctx.fillText('DIAS', W / 2, 600)
  ctx.letterSpacing = '0'

  // Linha fade
  fadeLine(ctx, 645, 100, W - 100, 0.55)

  // "PARA A ELEIÇÃO DO SINDPOL-RJ"
  ctx.fillStyle    = 'rgba(255,255,255,0.60)'
  ctx.font         = '500 32px "Oswald", sans-serif'
  ctx.letterSpacing = '0.10em'
  ctx.fillText('PARA A ELEIÇÃO DO SINDPOL-RJ', W / 2, 700)
  ctx.letterSpacing = '0'

  // ── Seção candidatos (faixa escura) ─────────────────────────────────────────
  const candY = 760, candH = 210
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.fillRect(0, candY, W, candH)

  // Linha gold topo
  ctx.fillStyle = goldGrad(ctx, 0, W)
  ctx.fillRect(0, candY, W, 4)

  // "NOSSA CHAPA"
  ctx.fillStyle    = 'rgba(212,175,55,0.65)'
  ctx.font         = '600 20px "Oswald", sans-serif'
  ctx.letterSpacing = '0.20em'
  ctx.fillText('NOSSA CHAPA', W / 2, candY + 45)
  ctx.letterSpacing = '0'

  // Divisor vertical central
  ctx.save()
  ctx.strokeStyle = 'rgba(212,175,55,0.35)'
  ctx.lineWidth   = 1.5
  ctx.beginPath()
  ctx.moveTo(W / 2, candY + 54)
  ctx.lineTo(W / 2, candY + candH - 16)
  ctx.stroke()
  ctx.restore()

  // Presidente — esquerda
  ctx.fillStyle    = '#FFFFFF'
  ctx.font         = 'bold 46px "Oswald", sans-serif'
  ctx.letterSpacing = '0.03em'
  ctx.fillText('LUIZ CLÁUDIO', W / 4, candY + 130)
  ctx.fillStyle    = '#D4AF37'
  ctx.font         = '600 22px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('PRESIDENTE', W / 4, candY + 162)
  ctx.letterSpacing = '0'

  // Vice-Presidente — direita
  ctx.fillStyle    = '#FFFFFF'
  ctx.font         = 'bold 46px "Oswald", sans-serif'
  ctx.letterSpacing = '0.03em'
  ctx.fillText('MÁRCIA BEZERRA', (W * 3) / 4, candY + 130)
  ctx.fillStyle    = '#D4AF37'
  ctx.font         = '600 22px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('VICE-PRESIDENTE', (W * 3) / 4, candY + 162)
  ctx.letterSpacing = '0'

  // Linha gold base
  ctx.fillStyle = goldGrad(ctx, 0, W)
  ctx.fillRect(0, candY + candH - 4, W, 4)

  // ── Rodapé ──────────────────────────────────────────────────────────────────
  // Badge CTA "VOTE GESTÃO E LUTA!"
  const ctaW = 800, ctaH = 74, ctaX = (W - ctaW) / 2, ctaYpos = 1000
  ctx.fillStyle    = goldGrad(ctx, ctaX, ctaW)
  ctx.fillRect(ctaX, ctaYpos, ctaW, ctaH)
  ctx.fillStyle    = '#07111F'
  ctx.font         = 'bold 30px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.textBaseline = 'middle'
  ctx.fillText('VOTE GESTÃO E LUTA!', W / 2, ctaYpos + ctaH / 2 + 1)
  ctx.textBaseline = 'alphabetic'
  ctx.letterSpacing = '0'

  // "Acesse o nosso site e saiba mais:"
  ctx.fillStyle    = 'rgba(212,175,55,0.55)'
  ctx.font         = '500 24px "Oswald", sans-serif'
  ctx.letterSpacing = '0.10em'
  ctx.fillText('ACESSE O NOSSO SITE E SAIBA MAIS:', W / 2, 1098)
  ctx.letterSpacing = '0'

  // "bit.ly/chapa3_sindpol"
  ctx.fillStyle    = '#D4AF37'
  ctx.font         = 'bold 32px "Oswald", sans-serif'
  ctx.letterSpacing = '0.08em'
  ctx.fillText('bit.ly/chapa3_sindpol', W / 2, 1136)
  ctx.letterSpacing = '0'

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], 'contagem-chapa3.png', { type: 'image/png' }))
    }, 'image/png')
  })
}
