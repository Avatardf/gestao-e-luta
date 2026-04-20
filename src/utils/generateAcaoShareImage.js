function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawWrapped(ctx, text, x, y, maxWidth, lineHeight) {
  const lines = wrapText(ctx, text, maxWidth)
  for (const ln of lines) { ctx.fillText(ln, x, y); y += lineHeight }
  return y
}

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

export async function generateAcaoShareImage(acao) {
  await document.fonts.ready

  const W = 1080
  const H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // ── Fundo navy ──────────────────────────────────────────────────────────────
  const bgG = ctx.createLinearGradient(0, 0, 0, H)
  bgG.addColorStop(0,    '#112038')
  bgG.addColorStop(0.45, '#07111F')
  bgG.addColorStop(0.70, '#060E1C')
  bgG.addColorStop(1,    '#0D1D36')
  ctx.fillStyle = bgG; ctx.fillRect(0, 0, W, H)

  // Textura diagonal sutil
  ctx.save()
  ctx.strokeStyle = 'rgba(40,100,200,0.07)'
  ctx.lineWidth = 1
  for (let i = -H; i < W + H; i += 60) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke()
  }
  ctx.restore()

  // Barras douradas topo e rodapé
  ctx.fillStyle = goldGrad(ctx, 0, W)
  ctx.fillRect(0, 0, W, 16)
  ctx.fillRect(0, H - 16, W, 16)

  // ── HEADER ──────────────────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.fillRect(0, 16, W, 330)

  ctx.textAlign    = 'center'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle     = 'rgba(212,175,55,0.60)'
  ctx.font          = '500 24px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('SINDPOL-RJ  —  ELEIÇÕES 2026', W / 2, 60)
  ctx.letterSpacing = '0'

  const bW = 310, bH = 60, bX = (W - bW) / 2, bY = 74
  ctx.fillStyle    = goldGrad(ctx, bX, bW)
  ctx.fillRect(bX, bY, bW, bH)
  ctx.fillStyle     = '#07111F'
  ctx.font          = 'bold 44px "Oswald", sans-serif'
  ctx.letterSpacing = '0.22em'
  ctx.textBaseline  = 'middle'
  ctx.fillText('CHAPA  3', W / 2, bY + bH / 2 + 2)
  ctx.textBaseline  = 'alphabetic'
  ctx.letterSpacing = '0'

  const glG = ctx.createLinearGradient(0, 150, 0, 270)
  glG.addColorStop(0,    '#FDE99A')
  glG.addColorStop(0.40, '#D4AF37')
  glG.addColorStop(1,    '#8B6914')
  ctx.fillStyle     = glG
  ctx.font          = 'bold 110px "Oswald", sans-serif'
  ctx.letterSpacing = '0.05em'
  ctx.fillText('GESTÃO & LUTA', W / 2, 268)
  ctx.letterSpacing = '0'

  ctx.fillStyle     = '#FFFFFF'
  ctx.font          = '600 28px "Oswald", sans-serif'
  ctx.letterSpacing = '0.14em'
  ctx.fillText('09 DE MAIO DE 2026  ·  9H30', W / 2, 314)
  ctx.letterSpacing = '0'

  fadeLine(ctx, 342, 60, W - 60, 0.65)

  // ── BLOCO AÇÃO ──────────────────────────────────────────────────────────────
  const PAD = 68
  let cY = 378

  // Número fantasma decorativo
  const numStr = String(acao.id).padStart(2, '0')
  ctx.font      = 'bold 180px "Oswald", sans-serif'
  ctx.fillStyle = 'rgba(212,175,55,0.06)'
  ctx.textAlign    = 'right'
  ctx.textBaseline = 'top'
  ctx.fillText(numStr, W - PAD + 10, cY - 4)
  ctx.textBaseline = 'alphabetic'

  // Badge "AÇÃO IMEDIATA Nº XX"
  ctx.font          = 'bold 22px "Oswald", sans-serif'
  ctx.letterSpacing = '0.14em'
  const numLabel = `AÇÃO IMEDIATA Nº ${numStr}`
  const numBW    = ctx.measureText(numLabel).width + 36
  const numBX    = W / 2 - numBW / 2
  ctx.fillStyle = goldGrad(ctx, numBX, numBW)
  ctx.fillRect(numBX, cY, numBW, 50)
  ctx.fillStyle     = '#07111F'
  ctx.textAlign     = 'center'
  ctx.textBaseline  = 'middle'
  ctx.fillText(numLabel, W / 2, cY + 25)
  ctx.textBaseline  = 'alphabetic'
  ctx.letterSpacing = '0'
  cY += 78

  // Ícone + Título
  ctx.textAlign = 'left'
  ctx.font      = '74px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(acao.icone, PAD, cY + 64)

  ctx.font          = 'bold 58px "Oswald", sans-serif'
  ctx.letterSpacing = '0.02em'
  ctx.fillStyle     = '#FFFFFF'
  const titleLines  = wrapText(ctx, acao.titulo.toUpperCase(), W - PAD * 2 - 94)
  let tY = cY
  for (const ln of titleLines) {
    ctx.fillText(ln, PAD + 94, tY + 68)
    tY += 76
  }
  cY = Math.max(cY + 84, tY) + 6
  ctx.letterSpacing = '0'

  // Linha ouro sob título
  ctx.strokeStyle = '#D4AF37'; ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(PAD, cY); ctx.lineTo(PAD + 110, cY); ctx.stroke()
  ctx.strokeStyle = 'rgba(212,175,55,0.30)'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(PAD + 122, cY); ctx.lineTo(PAD + 180, cY); ctx.stroke()
  cY += 46

  // Descrição — texto completo
  ctx.font          = '500 44px "Oswald", sans-serif'
  ctx.fillStyle     = 'rgba(255,218,130,0.95)'
  ctx.letterSpacing = '0.01em'
  cY = drawWrapped(ctx, acao.descricao, PAD, cY, W - PAD * 2, 60)
  ctx.letterSpacing = '0'

  // ── CANDIDATOS ──────────────────────────────────────────────────────────────
  const candH   = 210
  const footerH = 230
  const candY   = H - 16 - footerH - candH

  ctx.fillStyle = 'rgba(0,8,20,0.60)'
  ctx.fillRect(0, candY, W, candH)

  ctx.fillStyle = goldGrad(ctx, 0, W)
  ctx.fillRect(0, candY, W, 4)

  ctx.fillStyle     = 'rgba(212,175,55,0.70)'
  ctx.font          = '600 22px "Oswald", sans-serif'
  ctx.letterSpacing = '0.22em'
  ctx.textAlign     = 'center'
  ctx.fillText('NOSSA CHAPA', W / 2, candY + 34)
  ctx.letterSpacing = '0'

  ctx.strokeStyle = 'rgba(212,175,55,0.35)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(W / 2, candY + 44); ctx.lineTo(W / 2, candY + candH - 16); ctx.stroke()

  ctx.fillStyle     = '#FFFFFF'
  ctx.font          = 'bold 54px "Oswald", sans-serif'
  ctx.letterSpacing = '0.03em'
  ctx.fillText('LUIZ CLÁUDIO', W / 4, candY + 114)
  ctx.fillStyle     = '#D4AF37'
  ctx.font          = '600 26px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('PRESIDENTE', W / 4, candY + 150)
  ctx.letterSpacing = '0'

  ctx.fillStyle     = '#FFFFFF'
  ctx.font          = 'bold 54px "Oswald", sans-serif'
  ctx.letterSpacing = '0.03em'
  ctx.fillText('MÁRCIA BEZERRA', (W * 3) / 4, candY + 114)
  ctx.fillStyle     = '#D4AF37'
  ctx.font          = '600 26px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('VICE-PRESIDENTE', (W * 3) / 4, candY + 150)
  ctx.letterSpacing = '0'

  ctx.fillStyle = goldGrad(ctx, 0, W)
  ctx.fillRect(0, candY + candH - 4, W, 4)

  // ── CTA + URL ───────────────────────────────────────────────────────────────
  const siteY = candY + candH

  const ctaW = W - PAD * 2, ctaH2 = 78, ctaX = PAD, ctaY2 = siteY + 30
  ctx.fillStyle = goldGrad(ctx, ctaX, ctaW)
  ctx.fillRect(ctaX, ctaY2, ctaW, ctaH2)
  ctx.fillStyle     = '#07111F'
  ctx.font          = 'bold 30px "Oswald", sans-serif'
  ctx.letterSpacing = '0.14em'
  ctx.textBaseline  = 'middle'
  ctx.fillText('ACESSE O NOSSO SITE E SAIBA MAIS', W / 2, ctaY2 + ctaH2 / 2 + 1)
  ctx.textBaseline  = 'alphabetic'
  ctx.letterSpacing = '0'

  ctx.fillStyle     = '#D4AF37'
  ctx.font          = 'bold 36px "Oswald", sans-serif'
  ctx.letterSpacing = '0.08em'
  ctx.fillText('gestao-e-luta.vercel.app', W / 2, ctaY2 + ctaH2 + 60)
  ctx.letterSpacing = '0'

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], `acao-${acao.id}-chapa3.png`, { type: 'image/png' }))
    }, 'image/png')
  })
}
