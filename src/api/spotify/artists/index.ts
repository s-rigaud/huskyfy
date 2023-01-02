import { AxiosResponse } from 'axios'

import { chunkArray } from '@/utils/functions'
import request from '../request'
import { SpotifyArtist } from '../types/entities'
import { SpotifyArtistResponse } from '../types/responses'

export default {
  /**
   * Return a list of known artist from Spotify API
   *
   * @param artistIds - list of unique Spotify ids for artists
   */
  async getMultipleArtists (artistIds: string[]): Promise<SpotifyArtist[]> {
    const artists: SpotifyArtist[] = []
    // Spotify only returns a maximum of 50 artist detail at a time
    for (const artistIdsChunk of chunkArray(artistIds, 50)) {
      const ids = artistIdsChunk.filter(a => a).join(',')
      const response: AxiosResponse<SpotifyArtistResponse, SpotifyArtistResponse> = await request.get('artists', { params: { ids } })
      artists.push(...response.data.artists)
    }
    return artists
  }
}
