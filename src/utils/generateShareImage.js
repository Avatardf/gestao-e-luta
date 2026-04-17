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

  // ── "EU APOIO" grande centralizado ───────────────────────────
  ctx.fillStyle    = '#C9A227'
  ctx.font         = 'bold 110px "Oswald", sans-serif'
  ctx.textAlign    = 'center'
  ctx.letterSpacing = '0.15em'
  ctx.fillText('EU APOIO', W / 2, 200)
  ctx.letterSpacing = '0em'

  // linha decorativa sob EU APOIO
  ctx.strokeStyle = '#C9A227'
  ctx.lineWidth   = 3
  ctx.beginPath(); ctx.moveTo(160, 220); ctx.lineTo(W - 160, 220); ctx.stroke()

  // ── GL monogram ───────────────────────────────────────────────
  ctx.fillStyle = '#C9A227'
  ctx.fillRect((W - 56) / 2, 248, 56, 56)
  ctx.fillStyle = '#0D1F3C'
  ctx.font      = 'bold 18px "Oswald", sans-serif'
  ctx.fillText('CHAPA 3', W / 2, 283)

  // ── GESTÃO (branco) ───────────────────────────────────────────
  ctx.fillStyle    = '#FFFFFF'
  ctx.font         = 'bold 160px "Oswald", sans-serif'
  ctx.letterSpacing = '0.05em'
  ctx.fillText('GESTÃO', W / 2, 490)

  // ── & LUTA (dourado) ──────────────────────────────────────────
  ctx.fillStyle = '#C9A227'
  ctx.font      = 'bold 140px "Oswald", sans-serif'
  ctx.fillText('& LUTA', W / 2, 640)
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
  ctx.fillText('SINDPOL-RJ — ELEIÇÕES 2026', W / 2, 837)

  // ── Candidatos em destaque ────────────────────────────────────
  ctx.strokeStyle = 'rgba(201,162,39,0.25)'
  ctx.lineWidth   = 1
  ctx.beginPath(); ctx.moveTo(120, 878); ctx.lineTo(W - 120, 878); ctx.stroke()

  // Luiz Cláudio
  ctx.fillStyle    = '#FFFFFF'
  ctx.font         = 'bold 40px "Oswald", sans-serif'
  ctx.letterSpacing = '0.04em'
  ctx.fillText('LUIZ CLÁUDIO', W / 2, 924)
  ctx.letterSpacing = '0em'

  ctx.fillStyle    = '#C9A227'
  ctx.font         = '500 21px "Oswald", sans-serif'
  ctx.letterSpacing = '0.12em'
  ctx.fillText('PRESIDENTE', W / 2, 952)
  ctx.letterSpacing = '0em'

  // separador entre candidatos
  ctx.fillStyle = 'rgba(201,162,39,0.35)'
  ctx.fillRect((W - 48) / 2, 968, 48, 1)

  // Márcia Bezerra
  ctx.fillStyle    = '#FFFFFF'
  ctx.font         = 'bold 40px "Oswald", sans-serif'
  ctx.letterSpacing = '0.04em'
  ctx.fillText('MÁRCIA BEZERRA', W / 2, 1010)
  ctx.letterSpacing = '0em'

  ctx.fillStyle    = '#C9A227'
  ctx.font         = '500 21px "Oswald", sans-serif'
  ctx.letterSpacing = '0.12em'
  ctx.fillText('VICE-PRESIDENTE', W / 2, 1038)
  ctx.letterSpacing = '0em'

  ctx.strokeStyle = 'rgba(201,162,39,0.25)'
  ctx.lineWidth   = 1
  ctx.beginPath(); ctx.moveTo(120, 1056); ctx.lineTo(W - 120, 1056); ctx.stroke()

  // ── CTA box ───────────────────────────────────────────────────
  ctx.fillStyle = '#C9A227'
  ctx.fillRect(175, 1072, 550, 62)
  ctx.fillStyle    = '#0D1F3C'
  ctx.font         = 'bold 24px "Oswald", sans-serif'
  ctx.letterSpacing = '0.12em'
  ctx.fillText('VENHA VOTAR TAMBÉM!', W / 2, 1112)
  ctx.letterSpacing = '0em'

  // ── URL ───────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(201,162,39,0.7)'
  ctx.font      = '18px Arial, sans-serif'
  ctx.fillText('gestao-e-luta.vercel.app', W / 2, 1158)

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
