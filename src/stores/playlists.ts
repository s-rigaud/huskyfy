import api from '@/api'
import { useUserStore } from '@/stores/user'
import { RemovableRef, useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import VueI18n from '../i18n'

type PlaylistState = {
  playlists: RemovableRef<object>; // TODO update
  MAX_TRACKS_LIMIT: RemovableRef<number>;
  MAX_PLAYLISTS_LIMIT: RemovableRef<number>;
  selectedPlaylistId: RemovableRef<null>;
}

export const usePlaylistsStore = defineStore('playlists', {
  state: () => ({
    playlists: useStorage('playlists', {}),
    MAX_TRACKS_LIMIT: useStorage('MAX_TRACKS_LIMIT', 50),
    MAX_PLAYLISTS_LIMIT: useStorage('MAX_PLAYLISTS_LIMIT', 50),
    selectedPlaylistId: useStorage('selectedPlaylistId', null)
  } as PlaylistState),
  actions: {
    reset () {
      // Manually update state as local storage and states are linked now
      this.playlists = {}
      this.selectedPlaylistId = null
    },
    // Retrieve playlists for user
    async getUserPlaylists (offset: number) {
      const userStore = useUserStore()

      const response = await api.spotify.playlists.getUserPlaylists(
        this.MAX_PLAYLISTS_LIMIT,
        offset
      )
      offset += this.MAX_PLAYLISTS_LIMIT
      const playlists = response.data.items
      playlists.unshift(this.getLikedSongPlaylist(userStore))

      // Update existing playlist or create it
      for (const requestPlaylist of playlists) {
        const cachedPlaylist = this.playlists[requestPlaylist.id]

        if (requestPlaylist.images.length === 0) {
          requestPlaylist.images = [{ url: require('@/assets/default_cover.jpg') }]
        }

        if (cachedPlaylist) {
          // Pop cached tracks if playlist have changed
          if (cachedPlaylist.snapshot_id !== requestPlaylist.snapshot_id) {
            cachedPlaylist.snapshot_id = requestPlaylist.snapshot_id
            cachedPlaylist.offset = 0
            cachedPlaylist.tracks = []
          }
          this.playlists[requestPlaylist.id] = {
            ...requestPlaylist,
            ...cachedPlaylist,
            name: requestPlaylist.name,
            description: requestPlaylist.description,
            images: requestPlaylist.images
          }
        } else {
          this.playlists[requestPlaylist.id] = {
            total: this.getTrackCount(requestPlaylist, userStore),
            ...requestPlaylist
          }
        }
      }

      // Delete cached playlists deleted by user
      const playlistRequestId = playlists.map(p => p.id)
      for (const key in this.playlists) {
        if (!playlistRequestId.includes(key)) {
          delete this.playlists[key]
        }
      }

      return {
        offset: offset,
        total: response.data.total
      }
    },
    // Special playlist from user liked song treated differently in Spotify API
    getLikedSongPlaylist (userStore: any) {
      const i18n = VueI18n.global
      return {
        collaborative: false,
        description: '',
        id: 'my-music',
        images: [
          {
            height: null,
            url: require('@/assets/my-music.jpeg'),
            width: null
          }
        ],
        name: i18n.t('playlist.your-music.name'),
        owner: { display_name: userStore.username },
        primary_color: null,
        public: false,
        tracks: [],
        snapshot_id: 42
      }
    },
    getTrackCount (requestPlaylist: any, userStore: any) {
      // Spotify general Mix playlists have their total tracks set
      // to 0 while there are currently tracks in the playlist
      // We have to fix this
      if (requestPlaylist.name.includes(userStore.username) && requestPlaylist.name.includes('+')) return 50
      return requestPlaylist.tracks.total
    },
    range (start: number, stop: number, step = 1) {
      return Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)
    },
    // Download more tracks for a specific playlist from previous offset
    async downloadPlaylistTracks (playlistId: string, limit: number) {
      // Init playlist info or return already saved tracks
      let offset = this.playlists[playlistId].offset
      if (!offset) {
        offset = 0
        this.playlists[playlistId] = { ...this.playlists[playlistId], offset: offset, tracks: [] }
      } else if (limit <= offset) {
        // Cached tracks
        console.log(`Asked ${limit} tracks - already saved ${offset}, no request`)
        return this.playlists[playlistId].tracks.slice(0, limit)
      } else if (offset >= this.playlists[playlistId].total) {
        console.log('full playlist already loaded, no request')
        return this.playlists[playlistId].tracks
      }

      const newTracks: Array<any> = []
      for (const requestOffset of this.range(offset, limit, this.MAX_TRACKS_LIMIT)) {
        // Save track infos
        const response = await this.callCorrespondingAPIEndpoint(playlistId, requestOffset)
        // Filter deleted track appearing in API
        response.data.items = response.data.items.filter(i => i.track != null && i.track.type === 'track')
        newTracks.push(...response.data.items)
        this.playlists[playlistId] = {
          ...response.data,
          ...this.playlists[playlistId],
          offset: this.playlists[playlistId].offset + this.MAX_TRACKS_LIMIT
        }
      }

      // Retrieve data on artists (mainly genres & followers)
      const artistIds: Array<any> = []
      for (const item of newTracks) {
        artistIds.push(...item.track.artists.map((a) => a.id))
      }

      const spotifyArtistInfos = await api.spotify.artists.getMultipleArtists(
        Array.from(new Set(artistIds))
      )
      const artistMap = new Map()
      for (const artist of spotifyArtistInfos) {
        artistMap.set(artist.id, { genres: artist.genres, followers: artist.followers.total })
      }

      // Map each track to artist genres and popularity (indie or not)
      for (const item of newTracks) {
        const track = item.track
        const trackImage = (track.album.images.length > 0) ? track.album.images[0].url : null
        const artists = track.artists
        let allArtistIndie = true

        const trackGenres = new Set()
        for (const artist of artists) {
          artistMap.get(artist.id).genres.map(t => trackGenres.add(t))
          const followerCount = artistMap.get(artist.id).followers
          if (followerCount > 500_000) {
            allArtistIndie = false
          }
        }
        this.playlists[playlistId].tracks.push({
          ...track,
          image: trackImage,
          isIndie: allArtistIndie,
          genres: Array.from(trackGenres)
        })
      }
      return this.playlists[playlistId].tracks
    },
    // Route request to standard playlist call or special "My music" one
    async callCorrespondingAPIEndpoint (playlistId: string, offset: number) {
      if (playlistId === 'my-music') {
        return await api.spotify.playlists.getUserSavedTracks(
          this.MAX_TRACKS_LIMIT,
          offset
        )
      } else {
        return await api.spotify.playlists.getPlaylistTracks(
          playlistId,
          this.MAX_TRACKS_LIMIT,
          offset
        )
      }
    },
    // Update playlist privacy
    async updatePlaylistPrivacy (playlistId: string, isPublic: boolean) {
      await api.spotify.playlists.updatePlaylistPrivacy(playlistId, isPublic)
      this.playlists[playlistId].public = isPublic
    },
    // Unfollow playlist
    async unfollowPlaylist (playlistId: string) {
      await api.spotify.playlists.unfollowPlaylist(playlistId)
      delete this.playlists[playlistId]
    },
    // Create new empty playlist
    async createPlaylist (name: string, public_: boolean, description: string, collaborative: boolean) {
      const response = await api.spotify.playlists.createPlaylist(
        name,
        public_,
        description,
        collaborative
      )
      const playlist = response.data
      this.playlists[playlist.id] = playlist
      return response
    },
    async addTracksToPlaylist (newPlaylistId: string, tracksId: Array<string>) {
      await api.spotify.playlists.addTracksToPlaylist(
        newPlaylistId,
        tracksId
      )
    },
    async updatePlaylistCover (playlistId: string, coverUrl: string) {
      await api.spotify.playlists.updatePlaylistCover(
        playlistId,
        coverUrl
      )
    }
  }
})
