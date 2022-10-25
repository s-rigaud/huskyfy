import { SpotifyPlaylist } from '@/api/spotify/types/entities'
import VueI18n from '@/i18n'
import { usePlaylistsStore } from '@/stores/playlists'
import { capitalize } from '@/utils/functions'
import drawRoundRect from './utils'

const makeAndDownloadImage = (playlistId: string, size: string | number, showTitle: boolean, showStats: boolean) => {
  const playlistsStore = usePlaylistsStore()
  const playlist = playlistsStore.playlists[playlistId]

  if (typeof size === 'string') {
    size = parseInt(size.charAt(0))
  }

  const topArtists = playlistsStore.getTopArtists(playlistId, size ** 2)
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
          const url = createCanvas(images, playlist, (size as number), showTitle, showStats)
          downloadImage(url, playlist.name)
        }
      })
  )
}

const createCanvas = (
  images: HTMLImageElement[],
  playlist: SpotifyPlaylist,
  gridSize: number,
  showTitle: boolean,
  showStats: boolean
): string => {
  // Canvas is as followed
  //
  // Title
  // X X (X X)
  // X X (X X)
  // (X X X X)
  // (X X X X)
  // Stats

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  const TITLE_HEIGHT = 50

  canvas.width = 400
  canvas.height = 400 + ((showTitle) ? TITLE_HEIGHT : 0) + ((showStats) ? 100 : 0)

  const heightStart = (showTitle) ? TITLE_HEIGHT : 0

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Adding pictures
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const imageIndex = i * gridSize + j
      ctx.drawImage(
        images[imageIndex],
        (i * canvas.width / gridSize) + gridSize,
        heightStart + (j * 400 / gridSize) + gridSize,
        (1 / gridSize * canvas.width) - 2 * gridSize,
        (1 / gridSize * 400) - 2 * gridSize
      )
    }
  }

  if (showTitle) {
    addCanvasTitle(ctx, playlist)
  }
  if (showStats) {
    addCanvasLegend(ctx, playlist, canvas.height - 100)
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

  const popularText = `${VueI18n.tc('track.popular', 1)} ${100 - percentage}%`
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

  const indieText = `${VueI18n.tc('track.indie', 1)} ${percentage}%`
  ctx.font = `bolder ${13}px Arial`

  const indieGradient = ctx.createLinearGradient(300, 40, 500, 40)
  indieGradient.addColorStop(0, '#2ecc71')
  indieGradient.addColorStop(1, '#27ae60')
  ctx.fillStyle = indieGradient
  ctx.fillText(indieText, 205, yStart + 20)

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

const downloadImage = (
  url: string,
  playlistName: string
) => {
  const a = document.createElement('a')
  a.download = `${playlistName}.jpg`
  a.rel = 'noopener'
  a.target = '_blank'

  a.href = url
  a.click()
  a.remove()
}

export default makeAndDownloadImage
