import { createCanvas, loadImage } from 'canvas'

async function makeImage (artistImageUrls: Array<string>) {
  // artistImageUrls is the urls for the top 16 artists in the playlist
  // TODO upgrade for less than 16 artists
  const width = 400
  const height = 400

  const canvas = createCanvas(width, height)
  const context = canvas.getContext('2d')

  context.fillStyle = '#f00'
  context.fillRect(0, 0, width, height)
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const image = await loadImage(artistImageUrls[i * 4 + j])
      console.log(image)
      // image.setAttribute('crossorigin', 'anonymous')
      context.drawImage(image, 0, 0)
    }
  }

  return canvas.toDataURL()
}

export default makeImage
