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

function getInitials(nome) {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

export async function generateDiretorCard(diretor) {
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

  // ── Header (bg escuro) ──────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fillRect(0, 16, W, 190)

  ctx.textAlign    = 'center'
  ctx.textBaseline = 'alphabetic'

  // SINDPOL-RJ — ELEIÇÕES 2026
  ctx.fillStyle    = 'rgba(212,175,55,0.60)'
  ctx.font         = '500 24px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('SINDPOL-RJ — ELEIÇÕES 2026', W / 2, 64)
  ctx.letterSpacing = '0'

  // Badge CHAPA 3
  const bW = 290, bH = 54, bX = (W - bW) / 2, bY = 80
  ctx.fillStyle    = goldGrad(ctx, bX, bW)
  ctx.fillRect(bX, bY, bW, bH)
  ctx.fillStyle    = '#07111F'
  ctx.font         = 'bold 34px "Oswald", sans-serif'
  ctx.letterSpacing = '0.22em'
  ctx.textBaseline = 'middle'
  ctx.fillText('CHAPA  3', W / 2, bY + bH / 2 + 2)
  ctx.textBaseline = 'alphabetic'
  ctx.letterSpacing = '0'

  // GESTÃO & LUTA
  const glG = ctx.createLinearGradient(0, 148, 0, 222)
  glG.addColorStop(0,    '#FDE99A')
  glG.addColorStop(0.40, '#D4AF37')
  glG.addColorStop(1,    '#8B6914')
  ctx.fillStyle    = glG
  ctx.font         = 'bold 80px "Oswald", sans-serif'
  ctx.letterSpacing = '0.05em'
  ctx.fillText('GESTÃO & LUTA', W / 2, 200)
  ctx.letterSpacing = '0'

  // ── Foto circular ───────────────────────────────────────────────────────────
  const CX = W / 2, CY = 490, R = 200

  // Anel dourado de fundo
  const ringG = ctx.createLinearGradient(CX - R - 6, 0, CX + R + 6, 0)
  ringG.addColorStop(0,    '#7A5C10')
  ringG.addColorStop(0.25, '#C9A227')
  ringG.addColorStop(0.50, '#F0C84A')
  ringG.addColorStop(0.75, '#C9A227')
  ringG.addColorStop(1,    '#7A5C10')
  ctx.beginPath()
  ctx.arc(CX, CY, R + 6, 0, Math.PI * 2)
  ctx.fillStyle = ringG
  ctx.fill()

  // Tenta carregar foto
  let fotoLoaded = false
  if (diretor.foto_url) {
    try {
      const dataURL = await fetchAsDataURL(diretor.foto_url)
      const img     = await loadImage(dataURL)
      ctx.save()
      ctx.beginPath()
      ctx.arc(CX, CY, R, 0, Math.PI * 2)
      ctx.clip()
      // Escala proporcional, centralizada
      const scale = Math.max((R * 2) / img.width, (R * 2) / img.height)
      const dw    = img.width  * scale
      const dh    = img.height * scale
      ctx.drawImage(img, CX - dw / 2, CY - dh / 2, dw, dh)
      ctx.restore()
      fotoLoaded = true
    } catch (_) {
      fotoLoaded = false
    }
  }

  if (!fotoLoaded) {
    // Círculo navy com iniciais douradas
    ctx.beginPath()
    ctx.arc(CX, CY, R, 0, Math.PI * 2)
    const navyG = ctx.createRadialGradient(CX, CY - 40, 0, CX, CY, R)
    navyG.addColorStop(0, '#1A3560')
    navyG.addColorStop(1, '#07111F')
    ctx.fillStyle = navyG
    ctx.fill()

    ctx.fillStyle    = 'rgba(212,175,55,0.90)'
    ctx.font         = 'bold 80px "Oswald", sans-serif'
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(getInitials(diretor.nome), CX, CY)
    ctx.textBaseline = 'alphabetic'
  }

  // ── Nome do diretor ─────────────────────────────────────────────────────────
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle    = '#FFFFFF'
  ctx.font         = 'bold 56px "Oswald", sans-serif'
  ctx.letterSpacing = '0.04em'
  ctx.fillText(diretor.nome.toUpperCase(), W / 2, 730)
  ctx.letterSpacing = '0'

  // ── Cargo ───────────────────────────────────────────────────────────────────
  ctx.fillStyle    = '#D4AF37'
  ctx.font         = '600 30px "Oswald", sans-serif'
  ctx.letterSpacing = '0.16em'
  ctx.fillText(diretor.cargo.toUpperCase(), W / 2, 772)
  ctx.letterSpacing = '0'

  // ── Linha fade ──────────────────────────────────────────────────────────────
  fadeLine(ctx, 800, 100, W - 100, 0.65)

  // ── Data da eleição ─────────────────────────────────────────────────────────
  ctx.fillStyle    = 'rgba(212,175,55,0.70)'
  ctx.font         = '500 22px "Oswald", sans-serif'
  ctx.letterSpacing = '0.14em'
  ctx.fillText('09 DE MAIO DE 2026  ·  9H30', W / 2, 838)
  ctx.letterSpacing = '0'

  // ── URL ─────────────────────────────────────────────────────────────────────
  ctx.fillStyle    = '#D4AF37'
  ctx.font         = 'bold 26px "Oswald", sans-serif'
  ctx.letterSpacing = '0.08em'
  ctx.fillText('bit.ly/chapa3_sindpol', W / 2, 872)
  ctx.letterSpacing = '0'

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], `diretor-${diretor.id}-chapa3.png`, { type: 'image/png' }))
    }, 'image/png')
  })
}
