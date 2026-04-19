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

  // ────────────────────────────────────────────────────────────────────────────
  // BLOCO SUPERIOR — cabeçalho da chapa
  // ────────────────────────────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.fillRect(0, 16, W, 370)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  // SINDPOL-RJ
  ctx.fillStyle = 'rgba(212,175,55,0.60)'
  ctx.font = '500 24px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('SINDPOL-RJ  —  ELEIÇÕES 2026', W / 2, 60)
  ctx.letterSpacing = '0'

  // Badge CHAPA 3
  const bW = 310, bH = 60, bX = (W - bW) / 2, bY = 74
  ctx.fillStyle = goldGrad(ctx, bX, bW)
  ctx.fillRect(bX, bY, bW, bH)
  ctx.fillStyle = '#07111F'
  ctx.font = 'bold 44px "Oswald", sans-serif'
  ctx.letterSpacing = '0.22em'
  ctx.textBaseline = 'middle'
  ctx.fillText('CHAPA  3', W / 2, bY + bH / 2 + 2)
  ctx.textBaseline = 'alphabetic'
  ctx.letterSpacing = '0'

  // GESTÃO & LUTA
  const glG = ctx.createLinearGradient(0, 150, 0, 280)
  glG.addColorStop(0,    '#FDE99A')
  glG.addColorStop(0.40, '#D4AF37')
  glG.addColorStop(1,    '#8B6914')
  ctx.fillStyle = glG
  ctx.font = 'bold 110px "Oswald", sans-serif'
  ctx.letterSpacing = '0.05em'
  ctx.fillText('GESTÃO & LUTA', W / 2, 278)
  ctx.letterSpacing = '0'

  // Data da eleição — logo abaixo do título principal
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '600 28px "Oswald", sans-serif'
  ctx.letterSpacing = '0.14em'
  ctx.fillText('09 DE MAIO DE 2026  ·  9H30', W / 2, 322)
  ctx.letterSpacing = '0'

  fadeLine(ctx, 352, 60, W - 60, 0.65)

  // ────────────────────────────────────────────────────────────────────────────
  // BLOCO PROPOSTA
  // ────────────────────────────────────────────────────────────────────────────
  const PAD = 68
  let cY = 384

  // Número fantasma decorativo (fundo)
  const numStr = String(proposta.id).padStart(2, '0')
  ctx.font = 'bold 180px "Oswald", sans-serif'
  ctx.fillStyle = 'rgba(212,175,55,0.06)'
  ctx.textAlign = 'right'; ctx.textBaseline = 'top'
  ctx.fillText(numStr, W - PAD + 10, cY - 4)
  ctx.textBaseline = 'alphabetic'

  // Badge tema (esq) + Badge nº proposta (dir) — mesma linha
  ctx.font = '500 24px "Oswald", sans-serif'
  ctx.letterSpacing = '0.14em'

  // Tema
  const temaLabel = TEMA_LABEL[proposta.tema] || proposta.tema
  const temaW = ctx.measureText(temaLabel.toUpperCase()).width + 44
  ctx.fillStyle = 'rgba(201,162,39,0.13)'
  ctx.strokeStyle = 'rgba(201,162,39,0.45)'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.rect(PAD, cY, temaW, 48); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#D4AF37'
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
  ctx.fillText(temaLabel.toUpperCase(), PAD + 22, cY + 24)
  ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '0'

  // Nº proposta
  const numLabel = `PROPOSTA Nº ${numStr}`
  ctx.font = 'bold 22px "Oswald", sans-serif'
  ctx.letterSpacing = '0.14em'
  const numBW = ctx.measureText(numLabel).width + 36
  const numBX = W - PAD - numBW
  ctx.fillStyle = goldGrad(ctx, numBX, numBW)
  ctx.fillRect(numBX, cY, numBW, 48)
  ctx.fillStyle = '#07111F'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(numLabel, numBX + numBW / 2, cY + 24)
  ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '0'
  cY += 76

  // Ícone + Título (título reduzido para 58px)
  ctx.textAlign = 'left'
  ctx.font = '74px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(proposta.icone, PAD, cY + 64)

  ctx.font = 'bold 58px "Oswald", sans-serif'
  ctx.letterSpacing = '0.02em'
  ctx.fillStyle = '#FFFFFF'
  const titleLines = wrapText(ctx, proposta.titulo.toUpperCase(), W - PAD * 2 - 94)
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

  // Descrição — aumentada para 42px, peso 500
  ctx.font = '500 42px "Oswald", sans-serif'
  ctx.fillStyle = 'rgba(255,218,130,0.95)'
  ctx.letterSpacing = '0.01em'
  cY = drawWrapped(ctx, proposta.descricao, PAD, cY, W - PAD * 2, 56)
  ctx.letterSpacing = '0'
  cY += 46

  // Separador
  fadeLine(ctx, cY, PAD, W - PAD, 0.25)
  cY += 46

  // Pontos — aumentados para 40px
  for (const pt of proposta.pontos) {
    // Quadrado dourado marcador
    ctx.fillStyle = '#D4AF37'
    ctx.fillRect(PAD, cY - 30, 14, 14)

    ctx.fillStyle = '#D8E2EE'
    ctx.font = '400 40px "Oswald", sans-serif'
    ctx.letterSpacing = '0.01em'
    const ptLines = wrapText(ctx, pt, W - PAD * 2 - 38)
    for (let li = 0; li < ptLines.length; li++) {
      ctx.fillText(ptLines[li], PAD + 34, cY + li * 50)
    }
    ctx.letterSpacing = '0'
    cY += ptLines.length * 50 + 20
  }

  // ────────────────────────────────────────────────────────────────────────────
  // BLOCO CANDIDATOS — faixa fixa no rodapé
  // ────────────────────────────────────────────────────────────────────────────
  const candH   = 210
  const footerH = 230   // altura do bloco site + CTA
  const candY   = H - 16 - footerH - candH  // posição Y da faixa de candidatos

  // Fundo da faixa candidatos
  ctx.fillStyle = 'rgba(0,8,20,0.60)'
  ctx.fillRect(0, candY, W, candH)

  // Linha ouro no topo da faixa
  ctx.fillStyle = goldGrad(ctx, 0, W)
  ctx.fillRect(0, candY, W, 4)

  // Rótulo "NOSSA CHAPA"
  ctx.fillStyle = 'rgba(212,175,55,0.70)'
  ctx.font = '600 22px "Oswald", sans-serif'
  ctx.letterSpacing = '0.22em'
  ctx.textAlign = 'center'
  ctx.fillText('NOSSA CHAPA', W / 2, candY + 34)
  ctx.letterSpacing = '0'

  // Divisor vertical central
  ctx.strokeStyle = 'rgba(212,175,55,0.35)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(W / 2, candY + 44); ctx.lineTo(W / 2, candY + candH - 16); ctx.stroke()

  // Presidente — esquerda
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 54px "Oswald", sans-serif'
  ctx.letterSpacing = '0.03em'
  ctx.fillText('LUIZ CLÁUDIO', W / 4, candY + 114)
  ctx.fillStyle = '#D4AF37'
  ctx.font = '600 26px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('PRESIDENTE', W / 4, candY + 150)
  ctx.letterSpacing = '0'

  // Vice-Presidente — direita
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 54px "Oswald", sans-serif'
  ctx.letterSpacing = '0.03em'
  ctx.fillText('MÁRCIA BEZERRA', (W * 3) / 4, candY + 114)
  ctx.fillStyle = '#D4AF37'
  ctx.font = '600 26px "Oswald", sans-serif'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('VICE-PRESIDENTE', (W * 3) / 4, candY + 150)
  ctx.letterSpacing = '0'

  // Linha ouro na base da faixa
  ctx.fillStyle = goldGrad(ctx, 0, W)
  ctx.fillRect(0, candY + candH - 4, W, 4)

  // ────────────────────────────────────────────────────────────────────────────
  // BLOCO SITE — botão CTA + URL abaixo
  // ────────────────────────────────────────────────────────────────────────────
  const siteY = candY + candH  // início do bloco site

  // Botão "ACESSE O NOSSO SITE E SAIBA MAIS"
  const ctaW = W - PAD * 2
  const ctaH2 = 78
  const ctaX  = PAD
  const ctaY2 = siteY + 30
  ctx.fillStyle = goldGrad(ctx, ctaX, ctaW)
  ctx.fillRect(ctaX, ctaY2, ctaW, ctaH2)
  ctx.fillStyle = '#07111F'
  ctx.font = 'bold 30px "Oswald", sans-serif'
  ctx.letterSpacing = '0.14em'
  ctx.textBaseline = 'middle'
  ctx.fillText('ACESSE O NOSSO SITE E SAIBA MAIS', W / 2, ctaY2 + ctaH2 / 2 + 1)
  ctx.textBaseline = 'alphabetic'
  ctx.letterSpacing = '0'

  // URL abaixo do botão
  ctx.fillStyle = '#D4AF37'
  ctx.font = 'bold 36px "Oswald", sans-serif'
  ctx.letterSpacing = '0.08em'
  ctx.fillText('bit.ly/chapa3_sindpol', W / 2, ctaY2 + ctaH2 + 60)
  ctx.letterSpacing = '0'

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], `proposta-${proposta.id}-chapa3.png`, { type: 'image/png' }))
    }, 'image/png')
  })
}
