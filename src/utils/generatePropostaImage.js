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

// Desenha texto com quebra automática e retorna Y final
function drawWrapped(ctx, text, x, y, maxWidth, lineHeight) {
  const lines = wrapText(ctx, text, maxWidth)
  for (const ln of lines) {
    ctx.fillText(ln, x, y)
    y += lineHeight
  }
  return y
}

// Mapa de temas → rótulo
const TEMA_LABEL = {
  salarial:   'Valorização Salarial',
  juridico:   'Proteção Jurídica',
  previdencia:'Previdência e Legislação',
  estrutura:  'Estrutura e Representatividade',
}

export async function generatePropostaShareImage(proposta) {
  await document.fonts.ready

  const W = 1080
  const H = 1920
  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // ── Gradiente de fundo navy ─────────────────────────────────────────────────
  const bgG = ctx.createLinearGradient(0, 0, 0, H)
  bgG.addColorStop(0,    '#0F2340')
  bgG.addColorStop(0.40, '#07111F')
  bgG.addColorStop(0.65, '#060E1C')
  bgG.addColorStop(1,    '#0D1D36')
  ctx.fillStyle = bgG
  ctx.fillRect(0, 0, W, H)

  // Textura diagonal sutil
  ctx.save()
  ctx.strokeStyle = 'rgba(30,80,160,0.08)'
  ctx.lineWidth = 1
  for (let i = -H; i < W + H; i += 54) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke()
  }
  ctx.restore()

  // ── Barras douradas topo/rodapé ─────────────────────────────────────────────
  const barG = ctx.createLinearGradient(0, 0, W, 0)
  barG.addColorStop(0,   '#7A5C10')
  barG.addColorStop(0.25,'#C9A227')
  barG.addColorStop(0.5, '#F0C84A')
  barG.addColorStop(0.75,'#C9A227')
  barG.addColorStop(1,   '#7A5C10')
  ctx.fillStyle = barG
  ctx.fillRect(0,   0, W, 10)
  ctx.fillRect(0, H-10, W, 10)

  // ── Cabeçalho: CHAPA 3 + GESTÃO & LUTA ─────────────────────────────────────
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  // Badge SINDPOL
  ctx.fillStyle = 'rgba(201,162,39,0.07)'
  ctx.strokeStyle = 'rgba(201,162,39,0.30)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.rect(200, 28, 680, 54)
  ctx.fill(); ctx.stroke()

  ctx.fillStyle = '#FFFFFF'
  ctx.font = '500 22px "Oswald", sans-serif'
  ctx.letterSpacing = '0.12em'
  ctx.fillText('SINDPOL-RJ  —  ELEIÇÕES 2026', W/2, 63)
  ctx.letterSpacing = '0'

  // Badge CHAPA 3
  const bW = 280, bH = 58, bX = (W - bW) / 2, bY = 100
  const bG = ctx.createLinearGradient(bX, 0, bX + bW, 0)
  bG.addColorStop(0,   '#7A5C10')
  bG.addColorStop(0.35,'#C9A227')
  bG.addColorStop(0.5, '#F0C84A')
  bG.addColorStop(0.65,'#C9A227')
  bG.addColorStop(1,   '#7A5C10')
  ctx.fillStyle = bG
  ctx.fillRect(bX, bY, bW, bH)
  ctx.fillStyle = '#0B1929'
  ctx.font = 'bold 40px "Oswald", sans-serif'
  ctx.letterSpacing = '0.20em'
  ctx.textBaseline = 'middle'
  ctx.fillText('CHAPA  3', W/2, bY + bH / 2 + 2)
  ctx.textBaseline = 'alphabetic'
  ctx.letterSpacing = '0'

  // GESTÃO & LUTA
  const glG = ctx.createLinearGradient(0, 175, 0, 290)
  glG.addColorStop(0,    '#FBE89A')
  glG.addColorStop(0.45, '#C9A227')
  glG.addColorStop(1,    '#8B6914')
  ctx.fillStyle = glG
  ctx.font = 'bold 100px "Oswald", sans-serif'
  ctx.letterSpacing = '0.06em'
  ctx.fillText('GESTÃO & LUTA', W/2, 278)
  ctx.letterSpacing = '0'

  // Linha divisória fina
  const div1G = ctx.createLinearGradient(80, 0, W - 80, 0)
  div1G.addColorStop(0,   'rgba(201,162,39,0)')
  div1G.addColorStop(0.3, 'rgba(201,162,39,0.6)')
  div1G.addColorStop(0.7, 'rgba(201,162,39,0.6)')
  div1G.addColorStop(1,   'rgba(201,162,39,0)')
  ctx.strokeStyle = div1G; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(80, 304); ctx.lineTo(W - 80, 304); ctx.stroke()

  // ── Área da proposta ────────────────────────────────────────────────────────
  const PAD = 72   // padding lateral
  let cY = 340     // cursor vertical

  // Badge de tema
  const temaLabel = TEMA_LABEL[proposta.tema] || proposta.tema
  ctx.font = '500 22px "Oswald", sans-serif'
  ctx.letterSpacing = '0.12em'
  const temaW = ctx.measureText(temaLabel.toUpperCase()).width + 40
  const temaX = PAD
  ctx.fillStyle = 'rgba(201,162,39,0.12)'
  ctx.strokeStyle = 'rgba(201,162,39,0.35)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.rect(temaX, cY, temaW, 38); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#C9A227'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(temaLabel.toUpperCase(), temaX + 20, cY + 19)
  ctx.textBaseline = 'alphabetic'
  ctx.letterSpacing = '0'
  cY += 68

  // Ícone + Título
  ctx.font = `bold 70px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`
  ctx.textAlign = 'left'
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(proposta.icone, PAD, cY + 60)

  ctx.font = 'bold 62px "Oswald", sans-serif'
  ctx.letterSpacing = '0.02em'
  const titleMaxW = W - PAD - PAD - 90
  const titleLines = wrapText(ctx, proposta.titulo.toUpperCase(), titleMaxW)
  ctx.fillStyle = '#FFFFFF'
  let tY = cY
  for (const ln of titleLines) {
    ctx.fillText(ln, PAD + 90, tY + 66)
    tY += 72
  }
  cY = Math.max(cY + 80, tY) + 12

  // Linha ouro sob título
  ctx.strokeStyle = '#C9A227'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(PAD, cY); ctx.lineTo(PAD + 100, cY); ctx.stroke()
  cY += 36

  // Descrição
  ctx.font = '400 34px "Oswald", sans-serif'
  ctx.fillStyle = 'rgba(255,220,140,0.90)'
  ctx.letterSpacing = '0.01em'
  cY = drawWrapped(ctx, proposta.descricao, PAD, cY, W - PAD * 2, 46)
  ctx.letterSpacing = '0'
  cY += 40

  // Separador fino
  ctx.strokeStyle = 'rgba(201,162,39,0.20)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(PAD, cY); ctx.lineTo(W - PAD, cY); ctx.stroke()
  cY += 36

  // Pontos
  for (const pt of proposta.pontos) {
    // Checkmark dourado
    ctx.fillStyle = '#C9A227'
    ctx.font = 'bold 32px "Oswald", sans-serif'
    ctx.fillText('✓', PAD, cY)

    ctx.fillStyle = '#E8ECF0'
    ctx.font = '400 32px "Oswald", sans-serif'
    ctx.letterSpacing = '0.01em'
    const ptLines = wrapText(ctx, pt, W - PAD - PAD - 50)
    const ptX = PAD + 50
    for (let li = 0; li < ptLines.length; li++) {
      ctx.fillText(ptLines[li], ptX, cY + li * 40)
    }
    ctx.letterSpacing = '0'
    cY += ptLines.length * 40 + 20
  }

  // ── Rodapé: candidatos + site ───────────────────────────────────────────────
  const footerY = H - 320

  // Linha separadora antes do rodapé
  const spG = ctx.createLinearGradient(80, 0, W - 80, 0)
  spG.addColorStop(0,   'rgba(201,162,39,0)')
  spG.addColorStop(0.3, 'rgba(201,162,39,0.5)')
  spG.addColorStop(0.7, 'rgba(201,162,39,0.5)')
  spG.addColorStop(1,   'rgba(201,162,39,0)')
  ctx.strokeStyle = spG; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(80, footerY); ctx.lineTo(W - 80, footerY); ctx.stroke()

  // Candidatos: esquerda (Presidente) e direita (Vice)
  ctx.textAlign = 'center'

  // Coluna esquerda — Presidente
  const col1X = W / 4
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 38px "Oswald", sans-serif'
  ctx.letterSpacing = '0.04em'
  ctx.fillText('LUIZ CLÁUDIO', col1X, footerY + 64)
  ctx.fillStyle = '#C9A227'
  ctx.font = '500 18px "Oswald", sans-serif'
  ctx.letterSpacing = '0.16em'
  ctx.fillText('PRESIDENTE', col1X, footerY + 90)
  ctx.letterSpacing = '0'

  // Divisor vertical entre candidatos
  ctx.strokeStyle = 'rgba(201,162,39,0.30)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(W/2, footerY + 16); ctx.lineTo(W/2, footerY + 106); ctx.stroke()

  // Coluna direita — Vice-Presidente
  const col2X = (W * 3) / 4
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 38px "Oswald", sans-serif'
  ctx.letterSpacing = '0.04em'
  ctx.fillText('MÁRCIA BEZERRA', col2X, footerY + 64)
  ctx.fillStyle = '#C9A227'
  ctx.font = '500 18px "Oswald", sans-serif'
  ctx.letterSpacing = '0.16em'
  ctx.fillText('VICE-PRESIDENTE', col2X, footerY + 90)
  ctx.letterSpacing = '0'

  // Linha abaixo dos candidatos
  ctx.strokeStyle = spG; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(80, footerY + 116); ctx.lineTo(W - 80, footerY + 116); ctx.stroke()

  // Data da eleição
  ctx.fillStyle = 'rgba(201,162,39,0.70)'
  ctx.font = '500 22px "Oswald", sans-serif'
  ctx.letterSpacing = '0.12em'
  ctx.fillText('09 DE MAIO DE 2026  ·  9H30', W/2, footerY + 164)
  ctx.letterSpacing = '0'

  // URL do site
  ctx.fillStyle = 'rgba(201,162,39,0.60)'
  ctx.font = '500 20px "Oswald", sans-serif'
  ctx.letterSpacing = '0.04em'
  ctx.fillText('Acesse o nosso site e saiba mais:', W/2, footerY + 188)
  ctx.fillStyle = '#C9A227'
  ctx.font = 'bold 24px "Oswald", sans-serif'
  ctx.letterSpacing = '0.08em'
  ctx.fillText('bit.ly/chapa3_sindpol', W/2, footerY + 216)
  ctx.letterSpacing = '0'

  // Botão CTA
  const ctaW = 640, ctaH = 66, ctaX2 = (W - ctaW) / 2, ctaY2 = footerY + 240
  const ctaG2 = ctx.createLinearGradient(ctaX2, 0, ctaX2 + ctaW, 0)
  ctaG2.addColorStop(0,   '#7A5C10')
  ctaG2.addColorStop(0.3, '#C9A227')
  ctaG2.addColorStop(0.5, '#F0C84A')
  ctaG2.addColorStop(0.7, '#C9A227')
  ctaG2.addColorStop(1,   '#7A5C10')
  ctx.fillStyle = ctaG2
  ctx.fillRect(ctaX2, ctaY2, ctaW, ctaH)
  ctx.fillStyle = '#0B1929'
  ctx.font = 'bold 26px "Oswald", sans-serif'
  ctx.letterSpacing = '0.14em'
  ctx.textBaseline = 'middle'
  ctx.fillText('VOTE GESTÃO E LUTA!', W/2, ctaY2 + ctaH / 2 + 1)
  ctx.textBaseline = 'alphabetic'
  ctx.letterSpacing = '0'

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], `proposta-${proposta.id}-chapa3.png`, { type: 'image/png' }))
    }, 'image/png')
  })
}
