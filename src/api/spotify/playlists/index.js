import { useUserStore } from '@/stores/user';
import axios from "axios";
import request from "./../request";
const Base64 = require('js-base64').Base64;

export default {
    // Retrieve playlists from the current logged user
    getUserPlaylists(limit, offset) {
        return request.get(`me/playlists`, {
            params: {
                limit,
                offset
            }
        });
    },
    // Return tracks for a playlist
    getPlaylistTracks(playlist_id, limit, offset) {
        return request.get(`playlists/${playlist_id}/tracks`, {
            params: {
                limit,
                offset
            }
        });
    },
    // Return tracks from the special "Your music" playlist
    async getUserSavedTracks(limit, offset) {
        return await request.get(`me/tracks`, {
            params: {
                limit,
                offset
            }
        });
    },
    // Create new empty playlist
    createPlaylist(name, public_, description, collaborative) {
        const userStore = useUserStore()
        const userId = userStore.id

        return request.post(`users/${userId}/playlists`, {
            name,
            "public": public_,
            collaborative,
            description,
        });
    },
    // Add new cover to a playlist
    async updatePlaylistCover(playlist_id, coverUrl) {
        let response = await axios.get(coverUrl, null, {
            headers: { 'Content-Type': 'image/jpeg' }
        })
        console.log("image download", response);
        const body = Base64.encode(response.data)

        return request.put(`playlists/${playlist_id}/images`, body, {
            headers: { 'Content-Type': 'image/jpeg' }
        });
    },
    // Unfollow a specific playlist
    unfollowPlaylist(playlistId) {
        return request.delete(`playlists/${playlistId}/followers`);
    },
    // Add multiple tracks to an existing playlist
    addTracksToPlaylist(playlistId, trackIds) {
        return request.post(`/playlists/${playlistId}/tracks`, {
            "uris": trackIds,
        });
    },
    // Update playlist privacy, the playlist is either public or private
    updatePlaylistPrivacy(playlistId, isPublic) {
        return request.put(`/playlists/${playlistId}`, { "public": isPublic });
    }
};
