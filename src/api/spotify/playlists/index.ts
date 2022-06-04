import { useUserStore } from '@/stores/user'
import { AxiosResponse } from 'axios'
import { SimplifiedSpotifyPlaylist, SpotifyGetPlaylistResponse, SpotifyTrackResponse } from '../model'
import request from '../request'
// eslint-disable-next-line
const Base64 = require('js-base64').Base64

interface Callback {
  (base64cover: string): void;
}

// Legacy code not optimised used to gather Spotify cover img in base64
function toDataURL (url: string, uploadCallback: Callback) {
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
  createPlaylist (name: string, public_: boolean, description: string, collaborative: boolean): Promise<AxiosResponse<SimplifiedSpotifyPlaylist, SimplifiedSpotifyPlaylist>> {
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
  async updatePlaylistCover (playlistId: string, coverUrl: string) {
    const response = await fetch(coverUrl).then(
      res => res.text()
    )

    const callback: Callback = (base64cover: string) => {
      const bytesNoMetadata = base64cover.split(',')[1]
      request.put(`playlists/${playlistId}/images`, bytesNoMetadata, {
        headers: { 'Content-Type': 'image/jpeg' }
      })
    }
    toDataURL(coverUrl, callback)
  },
  // Unfollow a specific playlist
  unfollowPlaylist (playlistId: string) {
    return request.delete(`playlists/${playlistId}/followers`)
  },
  // Add multiple tracks to an existing playlist
  addTracksToPlaylist (playlistId: string, trackIds: Array<string>) {
    return request.post(`/playlists/${playlistId}/tracks`, {
      uris: trackIds
    })
  },
  // Update playlist privacy, the playlist is either public or private
  updatePlaylistPrivacy (playlistId: string, isPublic: boolean) {
    return request.put(`/playlists/${playlistId}`, { public: isPublic })
  }
}
