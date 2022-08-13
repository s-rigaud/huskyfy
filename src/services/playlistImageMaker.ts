import { PlaylistState, usePlaylistsStore } from '@/stores/playlists'
import { Store } from 'pinia'

const makeAndDownloadImage = (playlistId: string) => {
  // artistImageUrls is the urls for the top X artists in the playlist
  const playlistsStore = usePlaylistsStore()

  const top16Artists = playlistsStore.getTopArtists(playlistId, 16)
  const artistImageUrls = top16Artists.map(res => res.artist.images[0].url)

  artistImageUrls.unshift(require('@/assets/fiverr/basic.svg'))
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
          const url = createCanvas(images, playlistsStore, playlistId)
          downloadImage(url, playlistsStore, playlistId)
        }
      })
  )
}

const createCanvas = (
  images: HTMLImageElement[],
  playlistsStore: Store<'playlists', PlaylistState, {}>,
  playlistId: string
): string => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  canvas.width = 400
  canvas.height = 500

  let gridSize: number
  if (images.length <= 9) {
    gridSize = 2
  } else if (images.length <= 12) {
    gridSize = 3
  } else {
    gridSize = 4
  }

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

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

  const logo = images[0]
  ctx.drawImage(logo, 0, 440, 200, 60)

  addCanvasLegend(ctx, playlistsStore, playlistId)

  return canvas.toDataURL('image/jpeg', 1)
}

const addCanvasLegend = (
  ctx: CanvasRenderingContext2D,
  // Real type is Store<"playlists", PlaylistState, {}>
  playlistsStore: any,
  playlistId: string
) => {
  const playlist = playlistsStore.playlists[playlistId]
  ctx.font = '18px Arial'
  ctx.fillStyle = '#F39200'
  ctx.fillText(playlist.name, 10, 415)

  ctx.font = '13px Arial'
  const top5Genres = playlistsStore.getTopGenres(playlistId, 5)
  for (let i = 0; i < top5Genres.length; i++) {
    ctx.fillText(
      getEmojiForRank(i) + ' ' + top5Genres[i].value + '% ' + top5Genres[i].name,
      270, 435 + 14 * i
    )
  }
}

const getEmojiForRank = (rank: number): string => {
  if (rank == 0) return '🥇'
  if (rank == 1) return '🥈'
  if (rank == 2) return '🥉'
  return '🏅'
}

const downloadImage = (
  url: string,
  playlistsStore: Store<'playlists', PlaylistState, {}>,
  playlistId: string
) => {
  // Downloading the image
  const playlist = playlistsStore.playlists[playlistId]
  const a = document.createElement('a')
  a.download = `${playlist.name}.jpg`
  a.rel = 'noopener'
  a.target = '_blank'

  a.href = url
  a.click()
  // a.remove()
}

export default makeAndDownloadImage
