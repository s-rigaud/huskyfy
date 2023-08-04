export const LOWEST_VALUE_COLOR = '#f35800'
export const HIGHEST_VALUE_COLOR = '#21f92e'

/**
 * German palette https://flatuicolors.com/palette/de
 */
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
/**
 * Get a random color from a predefined palette.
 */
export const getRandomColor = (): string => {
  return THEME_COLORS[Math.floor(Math.random() * THEME_COLOR_SIZE)]
}

/**
 * Get the average color given two colors.
 */
export const getAverageColor = (color1: string, color2: string, percentage: number): string => {
  const hexToRGB = (color: string): number[] => {
    return (color.replace('#', '').match(/.{1,2}/g) as RegExpMatchArray).map(hex => parseInt(hex, 16))
  }
  const rgbToHex = (rgb: number[]): string => {
    return (
      '#' +
      (~~(rgb[0])).toString(16).padStart(2, '0') +
      (~~(rgb[1])).toString(16).padStart(2, '0') +
      (~~(rgb[2])).toString(16).padStart(2, '0')
    )
  }

  const rgbColor1 = hexToRGB(color1)
  const rgbColor2 = hexToRGB(color2)

  const realPercentage = percentage / 100
  const rgbAverageColor = [
    (rgbColor1[0] * (1 - realPercentage) + rgbColor2[0] * realPercentage),
    (rgbColor1[1] * (1 - realPercentage) + rgbColor2[1] * realPercentage),
    (rgbColor1[2] * (1 - realPercentage) + rgbColor2[2] * realPercentage)
  ]

  return rgbToHex(rgbAverageColor)
}
