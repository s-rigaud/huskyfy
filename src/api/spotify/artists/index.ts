import request from '../request'

// Chunk list into smaller lists
function chunkArray (myArray: Array<any>, chunkSize: number) {
  const results: Array<any> = []
  while (myArray.length) {
    results.push(myArray.splice(0, chunkSize))
  }
  return results
}

export default {
  /* Spotify only returns a maximum of 50 artist detail at a time */
  async getMultipleArtists (artistIds: Array<string>) {
    const artists: Array<any> = []
    for (const artistIdsChunk of chunkArray(artistIds, 50)) {
      const ids = artistIdsChunk.join(',')
      const response = await request.get('artists', { params: { ids } })
      artists.push(...response.data.artists)
    }
    return artists
  }
}
