import { useUserStore } from '@/stores/user'
import { chunkArray } from '@/utils/functions'
import { AxiosResponse } from 'axios'

import request from '../request'
import { SimplifiedSpotifyPlaylist, SpotifyTrack } from '../types/entities'
import { SpotifyGetPlaylistResponse, SpotifyTrackResponse } from '../types/responses'

interface Callback {
  (base64cover: string): void;
}

// Legacy code not optimized used to gather Spotify cover img in base64
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
  // Retrieve playlists from the current logged user
  getUserPlaylists (limit: number, offset: number): Promise<AxiosResponse<SpotifyGetPlaylistResponse, SpotifyGetPlaylistResponse>> {
    return request.get('me/playlists', {
      params: {
        limit,
        offset
      }
    })
  },
  // Return tracks for a playlist
  getPlaylistTracks (playlistId: string, limit: number, offset: number): Promise<AxiosResponse<SpotifyTrackResponse, SpotifyTrackResponse>> {
    return request.get(`playlists/${playlistId}/tracks`, {
      params: {
        limit,
        offset
      }
    })
  },
  // Return tracks from the special "Your music" playlist
  async getUserSavedTracks (limit: number, offset: number): Promise<AxiosResponse<SpotifyTrackResponse, SpotifyTrackResponse>> {
    return await request.get('me/tracks', {
      params: {
        limit,
        offset
      }
    })
  },
  // Create new empty playlist
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
  // Add new cover to a playlist
  updatePlaylistCover (playlistId: string, coverUrl: string) {
    const callback: Callback = (base64cover: string) => {
      const bytesNoMetadata = base64cover.split(',')[1]
      request.put(`playlists/${playlistId}/images`, bytesNoMetadata, {
        headers: { 'Content-Type': 'image/jpeg' }
      })
    }
    getPictureContentFromURL(coverUrl, callback)
  },
  // Unfollow a specific playlist
  unfollowPlaylist (playlistId: string) {
    return request.delete(`playlists/${playlistId}/followers`)
  },
  // Add multiple tracks to an existing playlist
  // LIMIT is 100 tracks
  async addTracksToPlaylist (playlistId: string, trackIds: Array<string>): Promise<string> {
    let data = null
    for (const trackBucket of chunkArray(trackIds, 100)) {
      data = await request.post(`/playlists/${playlistId}/tracks`, {
        uris: trackBucket
      })
    }
    return data?.data.snapshot_id
  },
  // Update playlist privacy, the playlist is either public or private
  updatePlaylistPrivacy (playlistId: string, isPublic: boolean) {
    return request.put(`/playlists/${playlistId}`, { public: isPublic })
  },
  async deleteTracks (playlistId: string, playlistTracks: SpotifyTrack[]) {
    // LIMIT is 100 tracks
    const formattedTracks = []
    for (const track of playlistTracks) {
      formattedTracks.push({ uri: track.uri })
    }

    for (const tracks of chunkArray(formattedTracks, 100)) {
      await request.delete(`/playlists/${playlistId}/tracks`, { data: { tracks } })
    }
  }
}
