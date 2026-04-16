export async function generateShareImage() {
  await document.fonts.ready

  const W = 900, H = 1200
  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // ── Background ──────────────────────────────────────────────
  ctx.fillStyle = '#0D1F3C'
  ctx.fillRect(0, 0, W, H)

  // Diagonal grid pattern
  ctx.save()
  ctx.strokeStyle = 'rgba(201,162,39,0.07)'
  ctx.lineWidth = 1
  for (let i = -H; i < W + H; i += 44) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke()
  }
  ctx.restore()

  // ── Topo: barra dourada ──────────────────────────────────────
  ctx.fillStyle = '#C9A227'
  ctx.fillRect(0, 0, W, 7)

  // ── Badge "EU APOIO" ─────────────────────────────────────────
  const bW = 310, bH = 48, bX = (W - bW) / 2, bY = 90
  ctx.fillStyle   = 'rgba(201,162,39,0.12)'
  ctx.strokeStyle = 'rgba(201,162,39,0.45)'
  ctx.lineWidth   = 1.5
  ctx.fillRect(bX, bY, bW, bH)
  ctx.strokeRect(bX, bY, bW, bH)

  ctx.fillStyle    = '#C9A227'
  ctx.font         = '600 19px "Oswald", sans-serif'
  ctx.textAlign    = 'center'
  ctx.letterSpacing = '0.25em'
  ctx.fillText('● EU APOIO ●', W / 2, bY + 32)
  ctx.letterSpacing = '0em'

  // ── GL monogram ───────────────────────────────────────────────
  ctx.fillStyle = '#C9A227'
  ctx.fillRect((W - 64) / 2, 170, 64, 64)
  ctx.fillStyle = '#0D1F3C'
  ctx.font      = 'bold 28px "Oswald", sans-serif'
  ctx.fillText('GL', W / 2, 213)

  // ── GESTÃO (branco) ───────────────────────────────────────────
  ctx.fillStyle    = '#FFFFFF'
  ctx.font         = 'bold 170px "Oswald", sans-serif'
  ctx.letterSpacing = '0.05em'
  ctx.fillText('GESTÃO', W / 2, 460)

  // ── & LUTA (dourado) ──────────────────────────────────────────
  ctx.fillStyle = '#C9A227'
  ctx.font      = 'bold 150px "Oswald", sans-serif'
  ctx.fillText('& LUTA', W / 2, 620)
  ctx.letterSpacing = '0em'

  // ── Divisor ───────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(201,162,39,0.35)'
  ctx.lineWidth   = 1
  ctx.beginPath(); ctx.moveTo(160, 672); ctx.lineTo(W - 160, 672); ctx.stroke()
  ctx.fillStyle = '#C9A227'
  ctx.font      = '22px serif'
  ctx.fillText('✦', W / 2, 694)

  // ── Slogan ────────────────────────────────────────────────────
  ctx.fillStyle    = '#9CA3AF'
  ctx.font         = '500 26px "Oswald", sans-serif'
  ctx.letterSpacing = '0.1em'
  ctx.fillText('TRANSPARÊNCIA · COMPROMISSO · RESULTADO', W / 2, 748)
  ctx.letterSpacing = '0em'

  // ── Sindpol box ───────────────────────────────────────────────
  ctx.fillStyle   = 'rgba(255,255,255,0.04)'
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth   = 1
  ctx.fillRect(180, 800, 540, 58)
  ctx.strokeRect(180, 800, 540, 58)
  ctx.fillStyle = '#FFFFFF'
  ctx.font      = '500 22px "Oswald", sans-serif'
  ctx.fillText('SINDPOL-RJ — ELEIÇÕES 2025', W / 2, 837)

  // ── CTA box ───────────────────────────────────────────────────
  ctx.fillStyle = '#C9A227'
  ctx.fillRect(175, 1010, 550, 62)
  ctx.fillStyle    = '#0D1F3C'
  ctx.font         = 'bold 24px "Oswald", sans-serif'
  ctx.letterSpacing = '0.12em'
  ctx.fillText('VENHA VOTAR TAMBÉM!', W / 2, 1050)
  ctx.letterSpacing = '0em'

  // ── URL ───────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(201,162,39,0.7)'
  ctx.font      = '18px Arial, sans-serif'
  ctx.fillText('gestao-e-luta.vercel.app', W / 2, 1110)

  // ── Rodapé: barra dourada ─────────────────────────────────────
  ctx.fillStyle = '#C9A227'
  ctx.fillRect(0, H - 7, W, 7)

  // Retorna como File para Web Share API
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], 'gestao-e-luta-apoio.png', { type: 'image/png' }))
    }, 'image/png')
  })
}
