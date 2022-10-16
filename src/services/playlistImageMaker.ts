import { SpotifyPlaylist } from '@/api/spotify/types/entities'
import { usePlaylistsStore } from '@/stores/playlists'
const LOGO: string = require('@/assets/fiverr/basic.svg')

const makeAndDownloadImage = (playlistId: string) => {
  const playlistsStore = usePlaylistsStore()

  const top16Artists = playlistsStore.getTopArtists(playlistId, 16)
  const artistImageUrls = top16Artists.map(res => res.artist.images[0].url)

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
          const url = createCanvas(images, playlistId)
          downloadImage(url, playlistsStore.playlists[playlistId])
        }
      })
  )
}

const createCanvas = (
  images: HTMLImageElement[],
  playlistId: string
): string => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  canvas.width = 400
  canvas.height = 500

  let gridSize: number
  if (images.length < 9) {
    gridSize = 2
  } else if (images.length < 12) {
    gridSize = 3
  } else {
    gridSize = 4
  }

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Adding pictures
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const imageIndex = (i * gridSize + j) + 1
      ctx.drawImage(
        images[imageIndex],
        (i * canvas.width / gridSize) + gridSize,
        (j * 400 / gridSize) + gridSize,
        (1 / gridSize * canvas.width) - 2 * gridSize,
        (1 / gridSize * 400) - 2 * gridSize
      )
    }
  }

  // Adding logo to canvas
  const logo = images[0]
  ctx.drawImage(logo, 0, 440, 200, 60)

  addCanvasLegend(ctx, playlistId)

  return canvas.toDataURL('image/jpeg', 1)
}

const addCanvasLegend = (
  ctx: CanvasRenderingContext2D,
  // Real type is Store<"playlists", PlaylistState, {}>
  playlistId: string
) => {
  const playlistsStore = usePlaylistsStore()
  const playlist = playlistsStore.playlists[playlistId]

  // Logo already added

  // Add playlist name
  ctx.font = '18px Arial'
  ctx.fillStyle = '#F39200'
  ctx.fillText(playlist.name, 10, 415)

  // Adding INDIE %
  ctx.font = '13px Arial'
  const percentage = playlistsStore.getIndiePercentage(playlistId)
  ctx.fillText(
    `Indie score : ${percentage} %`,
    150, 450
  )

  // Adding TOP Genres
  ctx.font = '13px Arial'
  const top5Genres = playlistsStore.getTopGenres(playlistId, 5)
  for (let i = 0; i < top5Genres.length; i++) {
    ctx.fillText(
      `${getEmojiForRank(i)} ${top5Genres[i].value}% ${top5Genres[i].name}`,
      270, 435 + 14 * i
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
  playlist: SpotifyPlaylist
) => {
  const a = document.createElement('a')
  a.download = `${playlist.name}.jpg`
  a.rel = 'noopener'
  a.target = '_blank'

  a.href = url
  a.click()
  a.remove()
}

export default makeAndDownloadImage
