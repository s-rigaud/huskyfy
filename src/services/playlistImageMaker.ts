import { SpotifyPlaylist } from '@/api/spotify/types/entities'
import { t, tc } from '@/i18n'
import { usePlaylistsStore } from '@/stores/playlists'
import { capitalize } from '@/utils/functions'

export type GridSize = 2 | 3 | 4

/**
 * Display a web browser pop up to allow the user to download a playlist image export
 * @param url - url for the ressource to be downloaded
 * @param playlistName - playlist name from the image export
 */
export const downloadImage = (url: string, playlistName: string) => {
  const a = document.createElement('a')
  a.download = `${playlistName}.jpg`
  a.rel = 'noopener'
  a.target = '_blank'

  a.href = url
  a.click()
  a.remove()
}

/**
 * Create an image export base on most popular artists for a playlist
 * @param playlistId - id of the Spotify playlist
 * @param size - size of the image grid
 * @param showTitle - should the playlist title be displayed or not
 * @param showStats - should the playlist stats be displayed or not
 * @param callback - callback function called when the image has totally been created
 */
export const makeImage = (
  playlistId: string,
  size: GridSize,
  showTitle: boolean,
  showStats: boolean,
  callback: { (rawImageData: string): void; }
): string | void => {
  const playlistsStore = usePlaylistsStore()
  const playlist = playlistsStore.playlists[playlistId]

  const topArtists = playlistsStore.getTopArtists(playlistId, size ** 2)
  const artistNames = topArtists.map(res => res.artist.name)
  const artistImageUrls = topArtists.map(res => res.artist.images[0].url)

  // Logo should also be loaded asynchronously
  const images = artistImageUrls.map(src => {
    const image = new Image()
    image.crossOrigin = ''
    image.src = src
    return image
  })

  let imageLoadCounter = 0

  images.map(
    imageElement => (
      imageElement.onload = () => {
        imageLoadCounter++

        if (imageLoadCounter === images.length) {
          const rawImageData = createCanvas(artistNames, images, playlist, size, showTitle, showStats)
          // Had to use callback as HtmlImageElement.onload is asynchronous and can't be awaited
          callback(rawImageData)
        }
      }
    )
  )
}

/**
 * Image creation is made possible by using HTML canvas
 */
const createCanvas = (
  artistNames: string[],
  images: HTMLImageElement[],
  playlist: SpotifyPlaylist,
  gridSize: GridSize,
  showTitle: boolean,
  showStats: boolean
): string => {
  // Canvas is as followed
  //
  // ( Title )
  // X X (X X)
  // X X (X X)
  // (X X X X)
  // (X X X X)
  // ( Stats )
  const TITLE_HEIGHT = 50

  const ARTIST_NAME_HEIGHT = 20
  const IMAGE_BLOCK_HEIGHT_START = (showTitle) ? TITLE_HEIGHT : 0
  const IMAGE_BLOCK_HEIGHT = gridSize * ((400 / gridSize) + ARTIST_NAME_HEIGHT)

  const STATS_HEIGHT = 100

  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = (
    IMAGE_BLOCK_HEIGHT +
    (showTitle ? TITLE_HEIGHT : 0) +
    (showStats ? STATS_HEIGHT : 0)
  )

  // eslint-disable-next-line
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  showTitle && addCanvasTitle(ctx, playlist.name, gridSize)
  addCanvasArtistImages(ctx, artistNames, images, gridSize, IMAGE_BLOCK_HEIGHT_START, ARTIST_NAME_HEIGHT)
  showStats && addCanvasLegend(ctx, playlist.id, IMAGE_BLOCK_HEIGHT_START + IMAGE_BLOCK_HEIGHT)

  return canvas.toDataURL('image/jpeg', 1)
}

/**
 * Adding title row to canvas
 */
const addCanvasTitle = (
  ctx: CanvasRenderingContext2D,
  playlistName: string,
  gridSize: GridSize
) => {
  let fontSize: number
  const characterLength = playlistName.length
  if (characterLength < 10) fontSize = 35
  else if (characterLength < 20) fontSize = 25
  else if (characterLength < 30) fontSize = 25
  else if (characterLength < 40) fontSize = 20
  else fontSize = 15

  // Main title : Playlist name
  ctx.font = `bolder ${fontSize}px Oswald`
  ctx.textAlign = 'center'

  const txtWidth = ctx.measureText(playlistName).width
  const gradient = ctx.createLinearGradient(400 / 2, 40, txtWidth, 25)
  gradient.addColorStop(0, '#F39200')
  gradient.addColorStop(1, '#F9B621')
  ctx.fillStyle = gradient

  ctx.fillText(playlistName, 400 / 2, 25 + fontSize / 3)

  ctx.font = 'bolder 10px Arial'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#F9B621'

  const subText = t('generating-picture.subtitle', { count: gridSize ** 2 })
  ctx.fillText(subText, 400 / 2, 47 + gridSize)
}

/**
 * Adding artist images to canvas
 */
const addCanvasArtistImages = (
  ctx: CanvasRenderingContext2D,
  artistNames: string[],
  images: HTMLImageElement[],
  gridSize: GridSize,
  heightStart: number,
  artistNameHeight: number
) => {
  const imageWidthAndHeight = (400 / gridSize) - 2 * gridSize

  ctx.font = '15px Oswald'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#F9B621'

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const index = i * gridSize + j

      ctx.drawImage(
        images[index],
        (j * 400 / gridSize) + gridSize,
        heightStart + (i * 400 / gridSize) + gridSize + artistNameHeight * i,
        imageWidthAndHeight,
        imageWidthAndHeight
      )
      ctx.fillText(
        artistNames[index],
        (j * 400 / gridSize) + imageWidthAndHeight / 2 + gridSize,
        heightStart + (i * 400 / gridSize) + artistNameHeight * i + imageWidthAndHeight + artistNameHeight,
        imageWidthAndHeight
      )
    }
  }
}

/**
 * Adding legend row to canvas. Mainly 4 most present genres and the according %.
 */
const addCanvasLegend = (
  ctx: CanvasRenderingContext2D,
  playlistId: string,
  yStart: number
) => {
  const playlistsStore = usePlaylistsStore()
  ctx.textAlign = 'start'

  const INDIE_BACKGROUND_COLOR = '#27ae6077'
  const INDIE_TEXT_COLOR = '#27ae60'
  const POPULAR_BACKGROUND_COLOR = '#e67e2277'
  const POPULAR_TEXT_COLOR = '#e74c3c'

  // 1. INDIE PERCENTAGES
  const indiePercentage = playlistsStore.getIndiePercentage(playlistId)
  if (indiePercentage > 65) {
    // Only indie percentage
    ctx.fillStyle = '#fff'
    drawRoundRect(ctx, 5, yStart + 3, 395, 25, 10, true, false)
    ctx.fillStyle = INDIE_BACKGROUND_COLOR
    drawRoundRect(ctx, 5, yStart + 3, 395 * indiePercentage / 100, 25, 10, true, false)

    const indieText = `${tc('track.indie', 2)} ${indiePercentage}%`
    ctx.font = 'bolder 13px Arial'
    ctx.fillStyle = INDIE_TEXT_COLOR
    ctx.fillText(indieText, 10, yStart + 20)
  } else if (indiePercentage < 35) {
    // Only popular percentage
    ctx.fillStyle = '#fff'
    drawRoundRect(ctx, 5, yStart + 3, 395, 25, 10, true, false)
    ctx.fillStyle = POPULAR_BACKGROUND_COLOR
    drawRoundRect(ctx, 5, yStart + 3, 395 * (100 - indiePercentage) / 100, 25, 10, true, false)

    const popularText = `${tc('track.popular', 2)} ${100 - indiePercentage}%`
    ctx.font = 'bolder 13px Arial'
    ctx.fillStyle = POPULAR_TEXT_COLOR
    ctx.fillText(popularText, 10, yStart + 20)
  } else {
    const getMostCommonPopularityTextSize = (popularity: 'indie' | 'popular'): 10 | 11 | 12 => {
      if (popularity === 'indie') return 12
      else return (indiePercentage < 50) ? 12 : 10
    }
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#000'
    drawRoundRect(ctx, 5, yStart + 3, 390, 25, 10, true, false)

    // Popular
    ctx.fillStyle = POPULAR_BACKGROUND_COLOR
    drawRoundRect(ctx, 5, yStart + 3,
      (395 * (100 - indiePercentage) / 100) - 3,
      25,
      { tr: 0, br: 0, tl: 10, bl: 10 },
      true, true
    )
    const popularText = `${tc('track.popular', 2)} ${100 - indiePercentage}%`
    ctx.font = `bolder ${getMostCommonPopularityTextSize('popular')}px Righteous`
    ctx.textAlign = 'start'
    ctx.fillStyle = POPULAR_TEXT_COLOR
    ctx.fillText(popularText, 10, yStart + 20)

    // Indie
    ctx.fillStyle = INDIE_BACKGROUND_COLOR
    ctx.strokeStyle = '#000'
    drawRoundRect(ctx, 390 * (100 - indiePercentage) / 100 + 5, yStart + 3,
      390 * indiePercentage / 100,
      25,
      { tr: 10, br: 10, tl: 0, bl: 0 },
      true,
      true
    )
    const indieText = `${tc('track.indie', 2)} ${indiePercentage}%`
    ctx.font = `bolder ${getMostCommonPopularityTextSize('indie')}px Righteous`
    ctx.textAlign = 'end'
    ctx.fillStyle = INDIE_TEXT_COLOR
    ctx.fillText(indieText, 388, yStart + 20)
  }

  // 2. Adding TOP Genres
  // Genres
  // 1 -----  2 -----
  // 3 -----  4 -----
  ctx.font = 'bolder 17px Oswald'
  ctx.fillStyle = '#F39200'
  ctx.textAlign = 'start'
  ctx.fillText('TOP 4 GENRES', 10, yStart + 47)

  ctx.font = '13px Arial'
  ctx.fillStyle = '#EEE'
  const top4Genres = playlistsStore.getTopGenres(playlistId, 4)
  let index: number
  for (let i = 0; i < 2; i++) {
    for (let y = 0; y < 2; y++) {
      index = i * 2 + y
      ctx.font = 'bold 13px Righteous'
      ctx.fillText(`${getEmojiForRank(index)} ${top4Genres[index].percentage}%`, 10 + 200 * y, yStart + 65 + 20 * i)
      ctx.font = '13px Righteous'
      ctx.fillText(capitalize(top4Genres[index].name), 10 + 200 * y + 55, yStart + 65 + 20 * i)
    }
  }
}

const getEmojiForRank = (rank: number): string => {
  if (rank === 0) return '🥇'
  if (rank === 1) return '🥈'
  if (rank === 2) return '🥉'
  return '🏅'
}

/**
 * Draw a rectangle on a canvas
 * From https://stackoverflow.com/questions/1255512
 */
function drawRoundRect (
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
