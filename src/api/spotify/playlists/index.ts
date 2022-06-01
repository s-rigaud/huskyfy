import { useUserStore } from '@/stores/user'
import axios from 'axios'
import request from '../request'
// eslint-disable-next-line
const Base64 = require('js-base64').Base64

export default {
  // Retrieve playlists from the current logged user
  getUserPlaylists (limit: number, offset: number) {
    return request.get('me/playlists', {
      params: {
        limit,
        offset
      }
    })
  },
  // Return tracks for a playlist
  getPlaylistTracks (playlistId: string, limit: number, offset: number) {
    return request.get(`playlists/${playlistId}/tracks`, {
      params: {
        limit,
        offset
      }
    })
  },
  // Return tracks from the special "Your music" playlist
  async getUserSavedTracks (limit: number, offset: number) {
    return await request.get('me/tracks', {
      params: {
        limit,
        offset
      }
    })
  },
  // Create new empty playlist
  createPlaylist (name: string, public_: boolean, description: string, collaborative: boolean) {
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
    const response = await axios.get(coverUrl, {
      headers: { 'Content-Type': 'image/jpeg' }
    })
    console.log('image download', response)
    const body = Base64.encode(response.data)

    return request.put(`playlists/${playlistId}/images`, body, {
      headers: { 'Content-Type': 'image/jpeg' }
    })
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
