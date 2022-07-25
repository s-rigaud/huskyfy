import { createCanvas, loadImage } from 'canvas'

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

async function makeImage(artistImageUrls: Array<string>) {
  // artistImageUrls is the urls for the top X artists in the playlist
  const width = 400
  const height = 400
  let rows: number, columns: number
  if (artistImageUrls.length < 9) {
    rows = 2
    columns = 2
  } else if (artistImageUrls.length < 12) {
    rows = 3
    columns = 3
  } else {
    rows = 4
    columns = 4
  }

  const canvas = createCanvas(width, height)
  const context = canvas.getContext('2d')
  context.fillStyle = '#f00'
  context.fillRect(0, 0, width, height)

  const logo = await loadImage(require('@/assets/logo.svg'))

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      const image = await loadImage(artistImageUrls[i * rows + j])

      // image.setAttribute('crossorigin', 'anonymous')
      context.drawImage(
        image,
        i * width/columns,
        j * height/rows,
        1 / rows * width,
        1 / columns * height
      )
      console.error(context);
    }
  }
  return canvas.toDataURL()
}

export default makeImage
