import { useUserStore } from '@/stores/user';
import axios from "axios";
import request from "./../request";
const Base64 = require('js-base64').Base64;

export default {
    getUserPlaylists(limit, offset) {
        return request.get(`me/playlists`, {
            params: {
                limit,
                offset
            }
        });
    },
    getPlaylistTracks(playlist_id, limit, offset) {
        return request.get(`playlists/${playlist_id}`, {
            params: {
                limit,
                offset
            }
        });
    },
    async getUserSavedTracks(limit, offset) {
        // Special playlist, only way to retrieve it is track by track, no global playlist element
        let response = await request.get(`me/tracks`, {
            params: {
                limit,
                offset
            }
        });
        return {
            tracks: response.data.items,
            collaborative: false,
            description: "",
            id: "liked-songs",
            images: [
                { url: "https://community.spotify.com/t5/image/serverpage/image-id/104727iC92B541DB372FBC7?v=v2" }
            ],
            name: "liked-songs",
            public: false,
        }
    },
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
    async updatePlaylistCover(playlist_id, coverUrl) {
        let response = await axios.get(coverUrl)
        console.log(response);
        const body = Base64.encode(response.data)

        return request.put(`playlists/${playlist_id}/images`, body, {
            headers: { 'Content-Type': 'image/jpeg' }
        });
    },
};
