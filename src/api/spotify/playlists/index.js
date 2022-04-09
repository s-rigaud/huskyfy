import request from "./../request";

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
        return request.get(`playlists/${playlist_id}/tracks`, {
            params: {
                limit,
                offset
            }
        });
    },
    getUserSavedTracks(limit, offset) {
        return request.get(`me/tracks`, {
            params: {
                limit,
                offset
            }
        });
    },
};
