// From https://stackoverflow.com/questions/1255512
function drawRoundRect (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 5,
  fill = false,
  stroke = true
) {
  const r = { tl: radius, tr: radius, br: radius, bl: radius }
  ctx.beginPath()
  ctx.moveTo(x + r.tl, y)
  ctx.lineTo(x + width - r.tr, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr)
  ctx.lineTo(x + width, y + height - r.br)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height)
  ctx.lineTo(x + r.bl, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl)
  ctx.lineTo(x, y + r.tl)
  ctx.quadraticCurveTo(x, y, x + r.tl, y)
  ctx.closePath()
  if (fill) {
    ctx.fill()
  }
  if (stroke) {
    ctx.stroke()
  }
}

export default drawRoundRect
