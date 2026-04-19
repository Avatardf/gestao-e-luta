// Quebra texto em múltiplas linhas respeitando largura máxima
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

// Gradiente dourado horizontal reutilizável
function goldGrad(ctx, x, w) {
  const g = ctx.createLinearGradient(x, 0, x + w, 0)
  g.addColorStop(0,    '#7A5C10')
  g.addColorStop(0.25, '#C9A227')
  g.addColorStop(0.50, '#F0C84A')
  g.addColorStop(0.75, '#C9A227')
  g.addColorStop(1,    '#7A5C10')
  return g
}

// Linha fade dourada horizontal
function fadeLine(ctx, y, x0, x1) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0)
  g.addColorStop(0,   'rgba(201,162,39,0)')
  g.addColorStop(0.3, 'rgba(201,162,39,0.7)')
  g.addColorStop(0.7, 'rgba(201,162,39,0.7)')
  g.addColorStop(1,   'rgba(201,162,39,0)')
  ctx.save()
  ctx.strokeStyle = g; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke()
  ctx.restore()
}

const TEMA_LABEL = {
  salarial:    'Valorização Salarial',
  juridico:    'Proteção Jurídica',
  previdencia: 'Previdência e Legislação',
  estrutura:   'Estrutura e Representatividade',
}

export async function generatePropostaShareImage(proposta) {
  await document.fonts.ready

  const W = 1080
  const H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // ── Fundo navy com gradiente ────────────────────────────────────────────────
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

  // ── Barras douradas topo e rodapé (16px) ────────────────────────────────────
  ctx.fillStyle = goldGrad(ctx, 0, W)
  ctx.fillRect(0, 0, W, 16)
  ctx.fillRect(0, H - 16, W, 16)

  // ── BLOCO SUPERIOR: cabeçalho da chapa ─────────────────────────────────────
  // Fundo semitransparente para o header
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fillRect(0, 16, W, 340)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  // SINDPOL-RJ label
  ctx.fillStyle = 'rgba(201,162,39,0.55)'
  ctx.font = '500 26px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('SINDPOL-RJ  —  ELEIÇÕES 2026', W / 2, 72)
  ctx.letterSpacing = '0'

  // Badge CHAPA 3
  const bW = 320, bH = 64, bX = (W - bW) / 2, bY = 90
  ctx.fillStyle = goldGrad(ctx, bX, bW)
  ctx.fillRect(bX, bY, bW, bH)
  ctx.fillStyle = '#07111F'
  ctx.font = 'bold 46px "Oswald", sans-serif'
  ctx.letterSpacing = '0.22em'
  ctx.textBaseline = 'middle'
  ctx.fillText('CHAPA  3', W / 2, bY + bH / 2 + 2)
  ctx.textBaseline = 'alphabetic'
  ctx.letterSpacing = '0'

  // GESTÃO & LUTA — gradiente metálico
  const glG = ctx.createLinearGradient(0, 172, 0, 310)
  glG.addColorStop(0,    '#FDE99A')
  glG.addColorStop(0.40, '#D4AF37')
  glG.addColorStop(1,    '#8B6914')
  ctx.fillStyle = glG
  ctx.font = 'bold 118px "Oswald", sans-serif'
  ctx.letterSpacing = '0.05em'
  ctx.fillText('GESTÃO & LUTA', W / 2, 306)
  ctx.letterSpacing = '0'

  fadeLine(ctx, 340, 60, W - 60)

  // ── BLOCO PROPOSTA ──────────────────────────────────────────────────────────
  const PAD = 68
  let cY = 372

  // Número da proposta (grande, decorativo, alinhado à direita)
  const numStr = String(proposta.id).padStart(2, '0')
  ctx.font = 'bold 160px "Oswald", sans-serif'
  ctx.fillStyle = 'rgba(212,175,55,0.08)'
  ctx.textAlign = 'right'; ctx.textBaseline = 'top'
  ctx.fillText(numStr, W - PAD, cY - 10)
  ctx.textBaseline = 'alphabetic'

  // Badge "PROPOSTA Nº XX" — destaque dourado à direita
  const numLabel = `PROPOSTA Nº ${numStr}`
  ctx.font = 'bold 22px "Oswald", sans-serif'
  ctx.letterSpacing = '0.14em'
  const numBadgeW = ctx.measureText(numLabel).width + 36
  const numBadgeX = W - PAD - numBadgeW
  ctx.fillStyle = goldGrad(ctx, numBadgeX, numBadgeW)
  ctx.fillRect(numBadgeX, cY, numBadgeW, 46)
  ctx.fillStyle = '#07111F'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(numLabel, numBadgeX + numBadgeW / 2, cY + 23)
  ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '0'

  // Badge tema (à esquerda, na mesma altura)
  const temaLabel = TEMA_LABEL[proposta.tema] || proposta.tema
  ctx.font = '500 26px "Oswald", sans-serif'
  ctx.letterSpacing = '0.14em'
  const temaW = ctx.measureText(temaLabel.toUpperCase()).width + 48
  ctx.fillStyle = 'rgba(201,162,39,0.13)'
  ctx.strokeStyle = 'rgba(201,162,39,0.45)'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.rect(PAD, cY, temaW, 46); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#D4AF37'
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
  ctx.fillText(temaLabel.toUpperCase(), PAD + 24, cY + 23)
  ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '0'
  cY += 80

  // Ícone emoji (grande)
  ctx.font = '80px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'left'
  ctx.fillText(proposta.icone, PAD, cY + 72)

  // Título da proposta
  ctx.font = 'bold 72px "Oswald", sans-serif'
  ctx.letterSpacing = '0.02em'
  const titleLines = wrapText(ctx, proposta.titulo.toUpperCase(), W - PAD * 2 - 100)
  ctx.fillStyle = '#FFFFFF'
  let tY = cY
  for (const ln of titleLines) {
    ctx.fillText(ln, PAD + 100, tY + 76)
    tY += 84
  }
  cY = Math.max(cY + 90, tY) + 8
  ctx.letterSpacing = '0'

  // Linha ouro sob título (3 segmentos decorativos)
  ctx.strokeStyle = '#D4AF37'; ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(PAD, cY); ctx.lineTo(PAD + 120, cY); ctx.stroke()
  ctx.strokeStyle = 'rgba(212,175,55,0.35)'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(PAD + 132, cY); ctx.lineTo(PAD + 180, cY); ctx.stroke()
  cY += 44

  // Descrição — texto âmbar quente
  ctx.font = '400 38px "Oswald", sans-serif'
  ctx.fillStyle = 'rgba(255,218,130,0.92)'
  ctx.letterSpacing = '0.01em'
  cY = drawWrapped(ctx, proposta.descricao, PAD, cY, W - PAD * 2, 52)
  ctx.letterSpacing = '0'
  cY += 44

  // Separador antes dos pontos
  fadeLine(ctx, cY, PAD, W - PAD)
  cY += 44

  // Pontos com marcador quadrado dourado
  for (const pt of proposta.pontos) {
    // Quadrado dourado 14×14
    ctx.fillStyle = '#D4AF37'
    ctx.fillRect(PAD, cY - 28, 14, 14)

    ctx.fillStyle = '#DCE4EE'
    ctx.font = '400 36px "Oswald", sans-serif'
    ctx.letterSpacing = '0.01em'
    const ptLines = wrapText(ctx, pt, W - PAD * 2 - 36)
    for (let li = 0; li < ptLines.length; li++) {
      ctx.fillText(ptLines[li], PAD + 32, cY + li * 46 - (li > 0 ? 28 - 46 : 0))
    }
    ctx.letterSpacing = '0'
    cY += ptLines.length * 46 + 18
  }

  // ── BLOCO CANDIDATOS (faixa sólida) ────────────────────────────────────────
  const candY = H - 430  // posição fixa para a faixa de candidatos

  // Fundo da faixa candidatos
  ctx.fillStyle = 'rgba(0,0,0,0.40)'
  ctx.fillRect(0, candY, W, 220)

  // Linha ouro topo da faixa
  ctx.fillStyle = goldGrad(ctx, 0, W)
  ctx.fillRect(0, candY, W, 4)

  // Rótulo da faixa
  ctx.fillStyle = 'rgba(212,175,55,0.65)'
  ctx.font = '500 22px "Oswald", sans-serif'
  ctx.letterSpacing = '0.20em'
  ctx.textAlign = 'center'
  ctx.fillText('NOSSA CHAPA', W / 2, candY + 36)
  ctx.letterSpacing = '0'

  // Divisor vertical central
  ctx.strokeStyle = 'rgba(212,175,55,0.35)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(W / 2, candY + 50); ctx.lineTo(W / 2, candY + 200); ctx.stroke()

  // Presidente — coluna esquerda
  const c1X = W / 4
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 52px "Oswald", sans-serif'
  ctx.letterSpacing = '0.03em'
  ctx.fillText('LUIZ CLÁUDIO', c1X, candY + 114)
  ctx.fillStyle = '#D4AF37'
  ctx.font = '600 26px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('PRESIDENTE', c1X, candY + 148)
  ctx.letterSpacing = '0'

  // Vice-Presidente — coluna direita
  const c2X = (W * 3) / 4
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 52px "Oswald", sans-serif'
  ctx.letterSpacing = '0.03em'
  ctx.fillText('MÁRCIA BEZERRA', c2X, candY + 114)
  ctx.fillStyle = '#D4AF37'
  ctx.font = '600 26px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('VICE-PRESIDENTE', c2X, candY + 148)
  ctx.letterSpacing = '0'

  // Linha ouro base da faixa
  ctx.fillStyle = goldGrad(ctx, 0, W)
  ctx.fillRect(0, candY + 216, W, 3)

  // ── BLOCO RODAPÉ: data + URL + CTA ─────────────────────────────────────────
  const footY = candY + 228

  // Data
  ctx.fillStyle = 'rgba(212,175,55,0.75)'
  ctx.font = '500 26px "Oswald", sans-serif'
  ctx.letterSpacing = '0.14em'
  ctx.fillText('09 DE MAIO DE 2026  ·  9H30', W / 2, footY + 40)
  ctx.letterSpacing = '0'

  // URL
  ctx.fillStyle = 'rgba(212,175,55,0.55)'
  ctx.font = '400 24px "Oswald", sans-serif'
  ctx.letterSpacing = '0.05em'
  ctx.fillText('Acesse o nosso site e saiba mais:', W / 2, footY + 74)
  ctx.fillStyle = '#D4AF37'
  ctx.font = 'bold 30px "Oswald", sans-serif'
  ctx.letterSpacing = '0.10em'
  ctx.fillText('bit.ly/chapa3_sindpol', W / 2, footY + 110)
  ctx.letterSpacing = '0'

  // Botão CTA dourado
  const ctaW = 700, ctaH = 72, ctaX = (W - ctaW) / 2, ctaY = footY + 126
  ctx.fillStyle = goldGrad(ctx, ctaX, ctaW)
  ctx.fillRect(ctaX, ctaY, ctaW, ctaH)
  ctx.fillStyle = '#07111F'
  ctx.font = 'bold 32px "Oswald", sans-serif'
  ctx.letterSpacing = '0.16em'
  ctx.textBaseline = 'middle'
  ctx.fillText('VOTE GESTÃO E LUTA!', W / 2, ctaY + ctaH / 2 + 1)
  ctx.textBaseline = 'alphabetic'
  ctx.letterSpacing = '0'

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], `proposta-${proposta.id}-chapa3.png`, { type: 'image/png' }))
    }, 'image/png')
  })
}
