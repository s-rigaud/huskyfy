import api from "@/api";
import { defineStore } from 'pinia';

export const usePlaylistsStore = defineStore('playlists', {
    state: () => {
        return {
            playlists: {},
            MAX_TRACKS_LIMIT: 50,
            MAX_PLAYLISTS_LIMIT: 50,
        }
    },
    getters: {
        getPlaylist(state) {
            return (playlistId) => state.playlists.find((p) => p.id === playlistId)
        },
    },
    actions: {
        // Retrieve playlists for user
        async getUserPlaylists(currentUserUsername, offset) {
            const response = await api.spotify.playlists.getUserPlaylists(
                this.MAX_PLAYLISTS_LIMIT,
                offset
            );
            offset += this.MAX_PLAYLISTS_LIMIT
            const playlists = response.data.items
            playlists.unshift(this.getLikedSongPlaylist(currentUserUsername))

            // Update existing playlist or create it
            for (const requestPlaylist of playlists) {
                const knownPlaylist = this.playlists[requestPlaylist.id]
                if (knownPlaylist) {
                    // Override data with new cover added to the playlist
                    const images = requestPlaylist.images
                    this.playlists[requestPlaylist.id] = {
                        ...requestPlaylist,
                        ...knownPlaylist,
                        images: images
                    }
                } else {
                    this.playlists[requestPlaylist.id] = requestPlaylist
                }
            }

            return {
                offset: offset,
                total: response.data.total,
            }
        },
        // Special playlist from user liked song treated differently in Spotify API
        getLikedSongPlaylist(currentUserUsername) {
            return {
                collaborative: false,
                description: "",
                id: "my-music",
                images: [
                    {
                        "height": null,
                        "url": require("@/assets/my-music.jpeg"),
                        "width": null
                    }
                ],
                name: "",
                owner: {
                    "display_name": currentUserUsername
                },
                primary_color: null,
                public: false,
                tracks: []
            }
        },
        // Download more tracks for a specific playlist from previous offset
        async downloadPlaylistTracks(playlistId) {
            let offset = this.playlists[playlistId].offset;
            if (!offset) {
                offset = 0
                this.playlists[playlistId] = { ...this.playlists[playlistId], offset: offset, tracks: [] }
            } else if (offset >= this.playlists[playlistId].total) {
                console.log("playlist already loaded, no request");
                return this.playlists[playlistId].tracks
            }

            const response = await this.callCorrespondingAPIEndpoint(playlistId, offset);
            this.playlists[playlistId] = {
                ...response.data,
                ...this.playlists[playlistId],
                offset: offset + this.MAX_TRACKS_LIMIT,
            }

            const artistIds = [];
            for (const item of response.data.items) {
                artistIds.push(...item.track.artists.map((a) => a.id));
            }

            // Retrieve data on artists (mainly genres & followers)
            const spotifyArtistInfos = await api.spotify.artists.getMultipleArtists(
                Array.from(new Set(artistIds))
            );
            const artistMap = new Map();
            for (const artist of spotifyArtistInfos) {
                artistMap.set(artist.id, { "genres": artist.genres, "followers": artist.followers.total });
            }

            // Map each track to artist genres and popularity (indie or not)
            for (const item of response.data.items) {
                const track = item.track
                const trackImage = (track.album.images.length > 0) ? track.album.images[0].url : null
                const artists = track.artists;
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
                    ...track,
                    image: trackImage,
                    isIndie: allArtistIndie,
                    genres: Array.from(trackGenres)
                });
            }
            return this.playlists[playlistId].tracks
        },
        // Route request to standard playlist call or special "My music" one
        async callCorrespondingAPIEndpoint(playlistId, offset) {
            if (playlistId == "my-music") {
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
        // Update playlist privacy
        async updatePlaylistPrivacy(playlistId, isPublic) {
            await api.spotify.playlists.updatePlaylistPrivacy(playlistId, isPublic);
            this.playlists[playlistId].public = isPublic
        },
        // Unfollow playlist
        async unfollowPlaylist(playlistId) {
            await api.spotify.playlists.unfollowPlaylist(playlistId);
            delete this.playlists[playlistId]
        },
        // Create new empty playlist
        async createPlaylist(name, public_, description, collaborative) {
            const response = await api.spotify.playlists.createPlaylist(
                name,
                public_,
                description,
                collaborative
            );
            const playlist = response.data
            this.playlists[playlist.id] = playlist
            return response
        },
        async addTracksToPlaylist(newPlaylistId, tracksId) {
            await api.spotify.playlists.addTracksToPlaylist(
                newPlaylistId,
                tracksId
            );
        },
        async updatePlaylistCover(playlistId, coverUrl) {
            await api.spotify.playlists.updatePlaylistCover(
                playlistId,
                coverUrl
            );
        }
    }
})
