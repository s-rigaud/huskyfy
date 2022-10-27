import { SpotifyPlaylist } from '@/api/spotify/types/entities'
import VueI18n from '@/i18n'
import { usePlaylistsStore } from '@/stores/playlists'
import { capitalize } from '@/utils/functions'
import drawRoundRect from './utils'

export const makeImage = (
  playlistId: string,
  size: string | number,
  showTitle: boolean,
  showStats: boolean,
  callback: Function
): string | void => {
  const playlistsStore = usePlaylistsStore()
  const playlist = playlistsStore.playlists[playlistId]

  if (typeof size === 'string') {
    size = parseInt(size.charAt(0))
  }

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
          const dataUrl = createCanvas(artistNames, images, playlist, (size as number), showTitle, showStats)
          // Had to use callback as HtmlImageElement.onload is asynchronous and can't be awaited
          callback(dataUrl)
        }
      }
    )
  )
}

const createCanvas = (
  artistNames: string[],
  images: HTMLImageElement[],
  playlist: SpotifyPlaylist,
  gridSize: number,
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
    ((showTitle) ? TITLE_HEIGHT : 0) +
    ((showStats) ? STATS_HEIGHT : 0)
  )

  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (showTitle) {
    addCanvasTitle(ctx, playlist)
  }
  addCanvasArtistImages(ctx, artistNames, images, gridSize, IMAGE_BLOCK_HEIGHT_START, ARTIST_NAME_HEIGHT)
  if (showStats) {
    addCanvasLegend(ctx, playlist, IMAGE_BLOCK_HEIGHT_START + IMAGE_BLOCK_HEIGHT)
  }

  return canvas.toDataURL('image/jpeg', 1)
}

const addCanvasTitle = (
  ctx: CanvasRenderingContext2D,
  playlist: SpotifyPlaylist
) => {
  let fontSize: number
  const characterLength = playlist.name.length
  if (characterLength < 10) fontSize = 40
  else if (characterLength < 20) fontSize = 30
  else if (characterLength < 30) fontSize = 25
  else if (characterLength < 40) fontSize = 20
  else fontSize = 15

  ctx.font = `bolder ${fontSize}px Arial`
  ctx.textAlign = 'center'

  const txtWidth = ctx.measureText(playlist.name).width
  const gradient = ctx.createLinearGradient(400 / 2, 40, txtWidth, 25)
  gradient.addColorStop(0, '#F39200')
  gradient.addColorStop(1, '#F9B621')
  ctx.fillStyle = gradient

  ctx.fillText(playlist.name, 400 / 2, 30 + fontSize / 3)
}

const addCanvasArtistImages = (
  ctx: CanvasRenderingContext2D,
  artistNames: string[],
  images: HTMLImageElement[],
  gridSize: number,
  heightStart: number,
  artistNameHeight: number
) => {
  const imageWidthAndHeight = (400 / gridSize) - 2 * gridSize

  ctx.font = '15px Arial'
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

const addCanvasLegend = (
  ctx: CanvasRenderingContext2D,
  playlist: SpotifyPlaylist,
  yStart: number
) => {
  const playlistsStore = usePlaylistsStore()

  // 1. INDIE PERCENTAGES
  const percentage = playlistsStore.getIndiePercentage(playlist.id)
  // 1.1 Popular
  ctx.fillStyle = '#e67e2277'
  drawRoundRect(ctx, 5, yStart + 3, 150, 25, 10, true, false)

  const popularText = `${VueI18n.tc('track.popular', 2)} ${100 - percentage}%`
  ctx.font = `bolder ${13}px Arial`
  ctx.textAlign = 'start'
  const popularGradient = ctx.createLinearGradient(300, 40, 500, 40)
  popularGradient.addColorStop(0, '#e74c3c')
  popularGradient.addColorStop(1, '#e67e22')
  ctx.fillStyle = popularGradient
  ctx.fillText(popularText, 10, yStart + 20)

  // 1.2 Indie
  ctx.fillStyle = '#27ae6077'
  drawRoundRect(ctx, 205, yStart + 3, 150, 25, 10, true, false)

  const indieText = `${VueI18n.tc('track.indie', 2)} ${percentage}%`
  ctx.font = `bolder ${13}px Arial`

  const indieGradient = ctx.createLinearGradient(300, 40, 500, 40)
  indieGradient.addColorStop(0, '#2ecc71')
  indieGradient.addColorStop(1, '#27ae60')
  ctx.fillStyle = indieGradient
  ctx.fillText(indieText, 210, yStart + 20)

  // 2. Adding TOP Genres
  // Genres
  // 1 -----  2 -----
  // 3 -----  4 -----
  ctx.font = 'bolder 17px Arial'
  ctx.fillStyle = '#F39200'
  ctx.fillText('TOP 4 GENRES', 10, yStart + 45)

  ctx.font = '13px Arial'
  ctx.fillStyle = '#EEE'
  const top4Genres = playlistsStore.getTopGenres(playlist.id, 4)
  let index: number
  for (let i = 0; i < 2; i++) {
    for (let y = 0; y < 2; y++) {
      index = i * 2 + y
      ctx.font = 'bold 13px Arial'
      ctx.fillText(`${getEmojiForRank(index)} ${top4Genres[i].value}%`, 10 + 200 * y, yStart + 65 + 20 * i)
      ctx.font = '13px Arial'
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

export const downloadImage = (url: string, playlistName: string) => {
  const a = document.createElement('a')
  a.download = `${playlistName}.jpg`
  a.rel = 'noopener'
  a.target = '_blank'

  a.href = url
  a.click()
  a.remove()
}
