import { createCanvas, loadImage } from 'canvas'

interface Callback {
  (base64cover: any): void;
}

function getPictureContentFromURL (url: string, uploadCallback: Callback) {
  const xhRequest = new XMLHttpRequest()
  xhRequest.onload = function () {
    const reader = new FileReader()
    reader.onloadend = function () {
      uploadCallback(reader.result)
    }
    reader.readAsDataURL(xhRequest.response)
  }
  xhRequest.open('GET', url)
  xhRequest.responseType = 'blob'
  xhRequest.send()
}

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

async function makeImage (artistImageUrls: Array<string>) {
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
  context.fillStyle = '#000'
  context.fillRect(0, 0, width, height)

  const logo = await loadImage(require('@/assets/logo.svg'))

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      const callback = async (rawCoverContent: any) => {
        console.error(typeof rawCoverContent)

        const cover = await loadImage(rawCoverContent)
        console.error(cover)

        context.drawImage(
          cover,
          i * width / columns,
          j * height / rows,
          1 / rows * width,
          1 / columns * height
        )
      }
      const url = artistImageUrls[i * rows + j]
      getPictureContentFromURL(url, callback)

      // Not working
      /* const downloadedImg = new Image();
      downloadedImg.crossOrigin = "Anonymous";
      downloadedImg.src = url; */

      // Placeholder to try drawing images
      /* context.drawImage(
        logo,
        i * width / columns,
        j * height / rows,
        1 / rows * width,
        1 / columns * height
      ); */
    }
  }
  return canvas.toDataURL()
}

export default makeImage
