import { AxiosResponse } from 'axios'
import { SpotifyArtist, SpotifyArtistResponse } from '../model'
import request from '../request'

// Chunk list into smaller lists
const chunkArray = (myArray: Array<string>, chunkSize: number): Array<Array<string>> => {
  const results: Array<Array<string>> = []
  while (myArray.length) {
    results.push(myArray.splice(0, chunkSize))
  }
  return results
}

export default {
  /* Spotify only returns a maximum of 50 artist detail at a time */
  async getMultipleArtists (artistIds: Array<string>) {
    const artists: Array<SpotifyArtist> = []
    for (const artistIdsChunk of chunkArray(artistIds, 50)) {
      const ids = artistIdsChunk.join(',')
      const response: AxiosResponse<SpotifyArtistResponse, SpotifyArtistResponse> = await request.get('artists', { params: { ids } })
      artists.push(...response.data.artists)
    }
    return artists
  }
}
