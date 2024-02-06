import { AxiosResponse } from 'axios'

import { useUserStore } from '@/stores/user'
import { chunkArray } from '@/utils/functions'
import request from '../request'
import { SimplifiedSpotifyPlaylist, SpotifyTrack } from '../types/entities'
import { SpotifyGetPlaylistResponse, SpotifyTrackResponse } from '../types/responses'

type Callback = (base64cover: string) => void

/**
 *  Legacy code not optimized used to gather Spotify cover image content in base64
 */
const getPictureContentFromURL = (url: string, uploadCallback: Callback) => {
  const xhRequest = new XMLHttpRequest()
  xhRequest.onload = function () {
    const reader = new FileReader()
    reader.onloadend = function () {
      uploadCallback(reader.result + '')
    }
    reader.readAsDataURL(xhRequest.response)
  }
  xhRequest.open('GET', url)
  xhRequest.responseType = 'blob'
  xhRequest.send()
}

export default {
  /**
   *  Retrieve playlists from the current logged user
   */
  getUserPlaylists (limit: number, offset: number): Promise<AxiosResponse<SpotifyGetPlaylistResponse, SpotifyGetPlaylistResponse>> {
    return request.get('me/playlists', {
      params: {
        limit,
        offset
      }
    })
  },
  /**
   * Return tracks for a playlist
   */
  getPlaylistTracks (playlistId: string, limit: number, offset: number): Promise<AxiosResponse<SpotifyTrackResponse, SpotifyTrackResponse>> {
    return request.get(`playlists/${playlistId}/tracks`, {
      params: {
        limit,
        offset,
        additional_types: 'track,episode',
        fields: 'items(track(id,name,type,uri,duration_ms,album(images, release_date),artists(id, name, uri, followers, images, genres)),is_local),total,limit,offset'
      }
    })
  },
  /**
   * Return tracks from the special "Your music" playlist
   */
  async getUserSavedTracks (limit: number, offset: number): Promise<AxiosResponse<SpotifyTrackResponse, SpotifyTrackResponse>> {
    return await request.get('me/tracks', {
      params: {
        limit,
        offset
      }
    })
  },
  /**
   * Create new empty playlist
   */
  async createPlaylist (name: string, description: string, public_: boolean, collaborative: boolean): Promise<AxiosResponse<SimplifiedSpotifyPlaylist, SimplifiedSpotifyPlaylist>> {
    const userStore = useUserStore()
    const userId = userStore.id

    return request.post(`users/${userId}/playlists`, {
      name,
      public: public_,
      collaborative,
      description
    })
  },
  /**
   * Add new cover to a playlist
   */
  updatePlaylistCover (playlistId: string, coverUrl: string) {
    const uploadImage: Callback = (base64cover: string) => {
      const bytesNoMetadata = base64cover.split(',')[1]
      request.put(`playlists/${playlistId}/images`, bytesNoMetadata, {
        headers: { 'Content-Type': 'image/jpeg' }
      })
    }
    getPictureContentFromURL(coverUrl, uploadImage)
  },
  /**
   * Unfollow a specific playlist
   */
  unfollowPlaylist (playlistId: string): Promise<AxiosResponse<null, null>> {
    return request.delete(`playlists/${playlistId}/followers`)
  },
  /**
   * Add multiple tracks to an existing playlist
   * ! API limit is 100 tracks per request
   * @returns last snapshot id
   */
  async addTracksToPlaylist (playlistId: string, trackIds: string[]): Promise<string | undefined> {
    let response: AxiosResponse<{ snapshot_id: string }, { snapshot_id: string }> | null = null

    for (const trackBucket of chunkArray(trackIds, 100)) {
      response = await request.post(`/playlists/${playlistId}/tracks`, {
        uris: trackBucket
      })
    }
    return response?.data.snapshot_id
  },
  /**
   * Update playlist privacy, the playlist is either public or private
   */
  updatePlaylistPrivacy (playlistId: string, isPublic: boolean): Promise<AxiosResponse<null, null>> {
    return request.put(`/playlists/${playlistId}`, { public: isPublic })
  },
  /**
   * Update playlist name
   */
  updatePlaylistName (playlistId: string, name: string): Promise<AxiosResponse<null, null>> {
    return request.put(`/playlists/${playlistId}`, { name })
  },
  /**
   * Delete all specified tracks from a playlist
   * ! API limit is 100 tracks per request
   */
  async deleteTracks (playlistId: string, playlistTracks: SpotifyTrack[]) {
    const formattedTracks = []
    for (const track of playlistTracks) {
      formattedTracks.push({ uri: track.uri })
    }

    for (const tracks of chunkArray(formattedTracks, 100)) {
      await request.delete(`/playlists/${playlistId}/tracks`, { data: { tracks } })
    }
  },
  /**
   * Returns if given Spotify track ids are 'liked' (in the special My Music Spotify Playlist)
   * @returns for each provided track ids if the id is in the playlist as a boolean
   */
  async tracksAreLiked (trackIds: string[]): Promise<boolean[]> {
    const fullResponse: boolean[] = []
    for (const trackIdChunk of chunkArray(trackIds, 50)) {
      const { data } = await request.get('/me/tracks/contains', { params: { ids: trackIdChunk.join(',') } })
      fullResponse.push(...data)
    }
    return fullResponse
  }
}
