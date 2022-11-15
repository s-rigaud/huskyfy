// From https://stackoverflow.com/questions/1255512
export default function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | { tl: number, tr: number, br: number, bl: number } = 5,
  fill = false,
  stroke = true
) {
  if (typeof radius === 'number') {
    radius = { tl: radius, tr: radius, br: radius, bl: radius }
  } else {
    radius = { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...radius }
  }
  ctx.beginPath()
  ctx.moveTo(x + radius.tl, y)
  ctx.lineTo(x + width - radius.tr, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
  ctx.lineTo(x + width, y + height - radius.br)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
  ctx.lineTo(x + radius.bl, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
  ctx.lineTo(x, y + radius.tl)
  ctx.quadraticCurveTo(x, y, x + radius.tl, y)
  ctx.closePath()
  if (fill) {
    ctx.fill()
  }
  if (stroke) {
    ctx.stroke()
  }
}

// German palette https://flatuicolors.com/palette/de
const THEME_COLORS = [
  '#fc5c65', '#eb3b5a',
  '#fd9644', '#fa8231',
  '#fed330', '#f7b731',
  '#26de81', '#20bf6b',
  '#2bcbba', '#0fb9b1',
  '#45aaf2', '#2d98da',
  '#4b7bec', '#3867d6',
  '#a55eea', '#8854d0',
  '#d1d8e0', '#a5b1c2',
  '#778ca3', '#4b6584'
]
const THEME_COLOR_SIZE = THEME_COLORS.length
export const getRandomColor = (): string => {
  return THEME_COLORS[Math.floor(Math.random() * THEME_COLOR_SIZE)]
}