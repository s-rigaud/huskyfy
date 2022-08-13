// H is Horus logo
// X is an artist cover

// For 12 Artists
// X X X X
// X X X X
// X X H H
// X X H H

// For 9 artists
// X X X
// X X X
// X X H

// For 3 Artists
// X X
// X H

const makeAndDownloadImage = (artistImageUrls: Array<string>, filename: string): any => {
  // artistImageUrls is the urls for the top X artists in the playlist

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
          const url = createCanvas(images)
          downloadImage(url, filename)
        }
      })
  )
}

const createCanvas = (images: HTMLImageElement[]): string => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  canvas.width = 400
  canvas.height = 500

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.drawImage(images[1], 0, 0, 400, 400)

  const logo = images[0]
  ctx.drawImage(logo, 200, 400, 200, 60)

  addCanvasText(ctx)

  return canvas.toDataURL('image/jpeg', 1)
}

const addCanvasText = (ctx: CanvasRenderingContext2D) => {

}

const downloadImage = (url: string, filename: string) => {
  // Downloading the image
  const a = document.createElement('a')
  a.download = `${filename}.jpg`
  a.rel = 'noopener'
  a.target = '_blank'

  a.href = url
  a.click()
  // a.remove()
}

export default makeAndDownloadImage
