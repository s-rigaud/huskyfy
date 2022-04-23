import api from "@/api";
import { defineStore } from 'pinia';

export const usePlaylistsStore = defineStore('playlists', {
    state: () => {
        return {
            playlists: {},
            MAX_TRACKS_LIMIT: 50,
        }
    },
    actions: {
        async downloadPlaylistTracks(playlistId) {
            if (!this.playlists[playlistId]) {
                this.playlists[playlistId] = { offset: 0, tracks: [] }
            }
            const offset = this.playlists[playlistId].offset;
            const response = await this.callCorrespondingAPIEndpoint(playlistId, offset);

            this.playlists[playlistId] = {
                ...this.playlists[playlistId],
                tracksTotal: response.data.total,
                offset: offset + this.MAX_TRACKS_LIMIT,
            }

            const artistIds = [];
            for (const res of response.data.items) {
                artistIds.push(...res.track.artists.map((a) => a.id));
            }

            const spotifyArtistInfos = await api.spotify.artists.getMultipleArtists(
                Array.from(new Set(artistIds))
            );

            const artistMap = new Map();
            for (const artist of spotifyArtistInfos) {
                artistMap.set(artist.id, { "genres": artist.genres, "followers": artist.followers.total });
            }

            for (const res of response.data.items) {
                const artists = res.track.artists;
                let allArtistIndie = true;

                const trackGenres = []
                for (const artist of artists) {
                    trackGenres.push(...artistMap.get(artist.id).genres)
                    const followerCount = artistMap.get(artist.id).followers;
                    if (followerCount > 500_000) {
                        allArtistIndie = false;
                    }
                }
                this.playlists[playlistId].tracks.push({
                    id: res.track.id,
                    name: res.track.name,
                    image: res.track.album.images[0].url,
                    artists: res.track.artists,
                    isIndie: allArtistIndie,
                    genres: trackGenres
                });
            }
            return this.playlists[playlistId].tracks
        },
        async callCorrespondingAPIEndpoint(playlistId, offset) {
            if (playlistId == "liked-song") {
                return await api.spotify.playlists.getUserSavedTracks(
                    this.MAX_TRACKS_LIMIT,
                    offset
                );
            } else {
                return await api.spotify.playlists.getPlaylistTracks(
                    playlistId,
                    this.MAX_TRACKS_LIMIT,
                    offset
                );
            }
        },
    }
})

/* Playlist schema
    collaborative: Boolean
    description: String
    external_urls: {spotify: String}
    href: String
    id: String
    images: [{…}]
    name: String
    owner: {display_name: String, external_urls: {…}, href: String, id: String, type: String, …}
    primary_color: String
    public: Boolean
    snapshot_id: String
    tracks: {href: String, total: Number}
    type: String
    uri: String
*/

/* Track schema
    album: {album_type: String, artists: [...], available_markets: Array(183), external_urls: {…}, href: 'https://api.spotify.com/v1/albums/3DCxmnz8RuBOkwITe6PSpl', …}
    artists: (2) [{…}, {…}]
    available_markets: (183) ['AD', 'AE', 'AG', 'AL', 'AM', 'AO', 'AR', 'AT', 'AU', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BN', 'BO', 'BR', 'BS', 'BT', 'BW', 'BY', 'BZ', 'CA', 'CD', 'CG', 'CH', 'CI', 'CL', 'CM', 'CO', 'CR', 'CV', 'CW', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'ES', 'FI', 'FJ', 'FM', 'FR', 'GA', 'GB', 'GD', 'GE', 'GH', 'GM', 'GN', 'GQ', 'GR', 'GT', 'GW', 'GY', 'HK', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IN', 'IQ', 'IS', 'IT', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KR', 'KW', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', …]
    disc_number: 1
    duration_ms: 219898
    episode: false
    explicit: false
    external_ids: {isrc: 'CA6D21600124'}
    external_urls: {spotify: 'https://open.spotify.com/track/5bkYsnrf7j88oN1x510yMf'}
    href: "https://api.spotify.com/v1/tracks/5bkYsnrf7j88oN1x510yMf"
    id: "5bkYsnrf7j88oN1x510yMf"
    is_local: false
    name: "Checkpoint"
    popularity: 44
    preview_url: "https://p.scdn.co/mp3-preview/6f46ae1fd111741dd6a98c4905241432ad926a59?cid=0c26ab311d744f8faae1f5c8ccc4ae21"
    track: true
    track_number: 1
    type: "track"
    uri: "spotify:track:5bkYsnrf7j88oN1x510yMf"
*/