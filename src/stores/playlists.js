import api from "@/api";
import { defineStore } from 'pinia';

export const usePlaylistsStore = defineStore('playlists', {
    state: () => {
        return {
            playlists: {'liked-song': {}},
            MAX_TRACKS_LIMIT: 50,
        }
    },
    actions: {
        async downloadPlaylistTracks(playlistId) {
            if (!this.playlists[playlistId]) {
                this.playlists[playlistId] = { offset: 0, tracks: [] }
            } else if (this.playlists[playlistId].offset >= this.playlists[playlistId].tracksTotal) {
                console.log("playlist already loaded, no request");
                return this.playlists[playlistId].tracks
            }
            const offset = this.playlists[playlistId].offset;
            const response = await this.callCorrespondingAPIEndpoint(playlistId, offset);

            this.playlists[playlistId] = {
                ...response.data,
                ...this.playlists[playlistId],
                tracksTotal: response.data.tracks.total,
                offset: offset + this.MAX_TRACKS_LIMIT,
            }

            const artistIds = [];
            for (const res of response.data.tracks.items) {
                artistIds.push(...res.track.artists.map((a) => a.id));
            }

            const spotifyArtistInfos = await api.spotify.artists.getMultipleArtists(
                Array.from(new Set(artistIds))
            );

            const artistMap = new Map();
            for (const artist of spotifyArtistInfos) {
                artistMap.set(artist.id, { "genres": artist.genres, "followers": artist.followers.total });
            }

            for (const res of response.data.tracks.items) {
                const artists = res.track.artists;
                let allArtistIndie = true;

                const trackGenres = new Set()
                for (const artist of artists) {
                    artistMap.get(artist.id).genres.map(t => trackGenres.add(t))
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
                    genres: Array.from(trackGenres)
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
