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

export async function generateVoteCard() {
  await document.fonts.ready

  const W = 1080, H = 1080
  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // ── Background navy gradient ────────────────────────────────────────────────
  const bgG = ctx.createLinearGradient(0, 0, W, H)
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

  // ── Badge CHAPA 3 ───────────────────────────────────────────────────────────
  const bW = 280, bH = 54, bX = (W - bW) / 2, bY = 32
  ctx.fillStyle    = goldGrad(ctx, bX, bW)
  ctx.fillRect(bX, bY, bW, bH)
  ctx.fillStyle    = '#07111F'
  ctx.font         = 'bold 40px "Oswald", sans-serif'
  ctx.letterSpacing = '0.22em'
  ctx.textBaseline = 'middle'
  ctx.fillText('CHAPA  3', W / 2, bY + bH / 2 + 2)
  ctx.textBaseline = 'alphabetic'
  ctx.letterSpacing = '0'

  // ── GESTÃO & LUTA ───────────────────────────────────────────────────────────
  const glG = ctx.createLinearGradient(0, 118, 0, 218)
  glG.addColorStop(0,    '#FDE99A')
  glG.addColorStop(0.40, '#D4AF37')
  glG.addColorStop(1,    '#8B6914')
  ctx.fillStyle    = glG
  ctx.font         = 'bold 96px "Oswald", sans-serif'
  ctx.letterSpacing = '0.05em'
  ctx.fillText('GESTÃO & LUTA', W / 2, 210)
  ctx.letterSpacing = '0'

  // Linha fade
  fadeLine(ctx, 230, 80, W - 80, 0.60)

  // ── VOTE EM ─────────────────────────────────────────────────────────────────
  ctx.fillStyle    = 'rgba(255,255,255,0.60)'
  ctx.font         = '500 50px "Oswald", sans-serif'
  ctx.letterSpacing = '0.20em'
  ctx.fillText('VOTE EM', W / 2, 310)
  ctx.letterSpacing = '0'

  // ── 09 grande ───────────────────────────────────────────────────────────────
  const numG = ctx.createLinearGradient(0, 300, 0, 480)
  numG.addColorStop(0,    '#FDE99A')
  numG.addColorStop(0.45, '#D4AF37')
  numG.addColorStop(1,    '#8B6914')
  ctx.fillStyle    = numG
  ctx.font         = 'bold 160px "Oswald", sans-serif'
  ctx.letterSpacing = '0.04em'
  ctx.fillText('09', W / 2, 460)
  ctx.letterSpacing = '0'

  // ── DE MAIO DE 2026 ─────────────────────────────────────────────────────────
  ctx.fillStyle    = 'rgba(255,255,255,0.90)'
  ctx.font         = '500 38px "Oswald", sans-serif'
  ctx.letterSpacing = '0.08em'
  ctx.fillText('DE MAIO DE 2026', W / 2, 500)
  ctx.letterSpacing = '0'

  // ── · 9H30 ──────────────────────────────────────────────────────────────────
  ctx.fillStyle    = '#D4AF37'
  ctx.font         = '500 32px "Oswald", sans-serif'
  ctx.letterSpacing = '0.10em'
  ctx.fillText('·  9H30', W / 2, 545)
  ctx.letterSpacing = '0'

  // Linha fade
  fadeLine(ctx, 580, 100, W - 100, 0.55)

  // ── Sede do SINDPOL-RJ ──────────────────────────────────────────────────────
  ctx.fillStyle    = 'rgba(255,255,255,0.50)'
  ctx.font         = '500 24px "Oswald", sans-serif'
  ctx.letterSpacing = '0.12em'
  ctx.fillText('SEDE DO SINDPOL-RJ', W / 2, 625)
  ctx.letterSpacing = '0'

  // Linha fade curta
  fadeLine(ctx, 660, 200, W - 200, 0.40)

  // ── Badge CTA "VOTE GESTÃO E LUTA!" ─────────────────────────────────────────
  const ctaW = 700, ctaH = 68, ctaX = (W - ctaW) / 2, ctaY = 685
  ctx.fillStyle = goldGrad(ctx, ctaX, ctaW)
  ctx.fillRect(ctaX, ctaY, ctaW, ctaH)
  ctx.fillStyle    = '#07111F'
  ctx.font         = 'bold 28px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.textBaseline = 'middle'
  ctx.fillText('VOTE GESTÃO E LUTA!', W / 2, ctaY + ctaH / 2 + 1)
  ctx.textBaseline = 'alphabetic'
  ctx.letterSpacing = '0'

  // ── bit.ly URL ──────────────────────────────────────────────────────────────
  ctx.fillStyle    = '#D4AF37'
  ctx.font         = 'bold 26px "Oswald", sans-serif'
  ctx.letterSpacing = '0.08em'
  ctx.fillText('bit.ly/chapa3_sindpol', W / 2, 796)
  ctx.letterSpacing = '0'

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], 'vote-chapa3.png', { type: 'image/png' }))
    }, 'image/png')
  })
}
