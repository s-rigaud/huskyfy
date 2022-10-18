import { SpotifyPlaylist } from '@/api/spotify/types/entities'
import { usePlaylistsStore } from '@/stores/playlists'
const LOGO: string = require('@/assets/Huskyfy.png')

const makeAndDownloadImage = (playlistId: string, size: string | number, showTitle: boolean, showStats: boolean) => {
  const playlistsStore = usePlaylistsStore()
  const playlist = playlistsStore.playlists[playlistId]

  console.error(size)

  if (typeof size === 'string') {
    size = parseInt(size.charAt(0))
  }

  console.error(size)

  const topArtists = playlistsStore.getTopArtists(playlistId, size ** 2)
  const artistImageUrls = topArtists.map(res => res.artist.images[0].url)

  // Logo should also be loaded asynchronously
  artistImageUrls.unshift(LOGO)
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
      const imageIndex = (i * gridSize + j) + 1
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
    // Adding logo to canvas
    const logo = images[0]
    ctx.drawImage(logo, 0, heightStart + 400 + 30, 200, 60)
    addCanvasLegend(ctx, playlist)
  }

  return canvas.toDataURL('image/jpeg', 1)
}

const addCanvasTitle = (
  ctx: CanvasRenderingContext2D,
  playlist: SpotifyPlaylist
) => {
  ctx.font = '18px Arial'
  ctx.fillStyle = '#F39200'
  ctx.fillText(playlist.name, 10, 10)
}

const addCanvasLegend = (
  ctx: CanvasRenderingContext2D,
  playlist: SpotifyPlaylist
) => {
  const playlistsStore = usePlaylistsStore()

  // Logo already added

  // Add playlist name
  ctx.font = '18px Arial'
  ctx.fillStyle = '#F39200'
  ctx.fillText(playlist.name, 10, 515)

  // Adding INDIE %
  ctx.font = '13px Arial'
  const percentage = playlistsStore.getIndiePercentage(playlist.id)
  ctx.fillText(
    `Indie score : ${percentage} %`,
    150, 550
  )

  // Adding TOP Genres
  ctx.font = '13px Arial'
  const top5Genres = playlistsStore.getTopGenres(playlist.id, 5)
  for (let i = 0; i < top5Genres.length; i++) {
    ctx.fillText(
      `${getEmojiForRank(i)} ${top5Genres[i].value}% ${top5Genres[i].name}`,
      270, 535 + 14 * i
    )
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
