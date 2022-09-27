import api from '@/api'
import { SimplifiedSpotifyPlaylist, SpotifyArtist, SpotifyPlaylist, SpotifyTrack, SpotifyTrackMetadata } from '@/api/spotify/types/entities'
import VueI18n from '@/i18n'
import { Genre } from '@/model'
import { UserState, useUserStore } from '@/stores/user'
import { capitalize, range } from '@/utils/functions'
import { RemovableRef, useStorage } from '@vueuse/core'
import { defineStore, Store } from 'pinia'

export type PlaylistState = {
  playlists: RemovableRef<{ [key: string]: SpotifyPlaylist }>;
  MAX_TRACKS_LIMIT: RemovableRef<number>;
  MAX_PLAYLISTS_LIMIT: RemovableRef<number>;

  selectedPlaylistId: RemovableRef<string | null>;
  filteredTracks: RemovableRef<Array<SpotifyTrack>>;
  selectedGenres: RemovableRef<Array<string>>;
}

export const usePlaylistsStore = defineStore('playlists', {
  state: () => ({
    playlists: useStorage('playlists', {}),
    MAX_TRACKS_LIMIT: useStorage('MAX_TRACKS_LIMIT', 50),
    MAX_PLAYLISTS_LIMIT: useStorage('MAX_PLAYLISTS_LIMIT', 50),

    selectedPlaylistId: useStorage('selectedPlaylistId', null),
    filteredTracks: useStorage('filteredTracks', []),
    selectedGenres: useStorage('selectedGenres', [])
  } as PlaylistState),
  getters: {
    getTopArtists: (state) => {
      type TupleArtistCount = {
        artist: SpotifyArtist
        count: number
      }
      type ArtistCount = {
        [artistName: string]: TupleArtistCount
      }

      return (playlistId: string, n?: number): TupleArtistCount[] => {
        const artistCount: ArtistCount = {}
        for (const track of state.playlists[playlistId].tracks) {
          for (const artist of track.artists) {
            const artistsDictKey = artist.name
            if (artistCount[artistsDictKey]) {
              artistCount[artistsDictKey].count += 1
            } else {
              artistCount[artistsDictKey] = { artist, count: 1 }
            }
          }
        }

        // Use mapping object to sort result in DESC order and returns the top n
        let sortedArtists = Object.keys(artistCount).map((label) => [
          label,
          artistCount[label]
        ]).sort((a, b) => {
          return (b[1] as TupleArtistCount).count - (a[1] as TupleArtistCount).count
        })

        if (n) {
          sortedArtists = sortedArtists.slice(0, n)
        }
        return sortedArtists.map(a => (a[1] as TupleArtistCount))
      }
    },
    getTopGenres: (state) => {
      type GenreCount = {
        [genre: string]: number
      }

      return (playlistId: string, n?: number): Genre[] => {
        const genreCounter: GenreCount = new Proxy(
          {},
          {
            get: (target: GenreCount, name: string) => (name in target ? target[name] : 0)
          }
        )
        for (const track of state.playlists[playlistId].tracks) {
          for (const genre of track.genres) {
            genreCounter[genre] += 1
          }
        }
        let genreMapping = Object.keys(genreCounter).map((label) => [
          label,
          genreCounter[label]
        ])

        // DESC sort
        genreMapping.sort((a, b) => {
          return (b[1] as number) - (a[1] as number)
        })

        if (n) {
          genreMapping = genreMapping.slice(0, n)
        }

        // Sampling & formatting
        return genreMapping.map((genre) => ({
          name: (genre[0] as string),
          value: (genre[1] as number),
          cap_name: capitalize((genre[0] as string))
        }))
      }
    },
    getArtistsByName(state) {
      return (playlistId: string): string[] => {
        const names: Set<string> = new Set()
        state.playlists[playlistId].tracks.map(
          t => t.artists.map(a => names.add(a.name))
        )
        return Array.from(names).sort((a1, a2) => a1.localeCompare(a2))
      }
    },
    getIndiePercentage(state) {
      // Get the general playlist isIndie % from the mean of all tracks

      return (playlistId: string): number => {
        const tracks = state.playlists[playlistId].tracks
        let indieTracks = 0
        for (const track of tracks) {
          indieTracks += track.isIndie ? 1 : 0
        }
        return ~~(indieTracks / tracks.length * 100)
      }
    }

  },
  actions: {
    reset() {
      // Manually update state as local storage and states are linked now
      this.playlists = {}
      this.selectedPlaylistId = null
      this.filteredTracks = []
      this.selectedGenres = []
    },
    // Retrieve playlists for user
    async getUserPlaylists(offset: number) {
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
            ...requestPlaylist,
            total: this.getTrackCount(requestPlaylist, userStore),
            tracks: []
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
        offset,
        total: response.data.total
      }
    },
    // Special playlist from user liked song treated differently in Spotify API
    getLikedSongPlaylist(userStore: Store<'user', UserState>): SimplifiedSpotifyPlaylist {
      return {
        collaborative: false,
        description: '',
        id: 'my-music',
        images: [
          {
            url: require('@/assets/my-music.jpeg')
          }
        ],
        name: VueI18n.t('playlist.your-music.name'),
        owner: {
          display_name: userStore.username,
          external_urls: { spotify: '' },
          href: '',
          id: '0',
          type: 'playlist',
          uri: ''
        },
        primary_color: undefined,
        public: false,
        snapshot_id: '42',
        tracks: { href: '', total: 1 },
        external_urls: { spotify: '' },
        href: '',
        type: 'playlist',
        uri: 'spotify:collection:tracks'
      }
    },
    getTrackCount(requestPlaylist: SimplifiedSpotifyPlaylist, userStore: Store<'user', UserState>): number {
      // Spotify general Mix playlists have their total tracks set
      // to 0 while there are currently tracks in the playlist
      // We have to fix this
      if (requestPlaylist.name.includes(userStore.username) && requestPlaylist.name.includes('+')) return 50
      return requestPlaylist.tracks.total
    },
    // Download more tracks for a specific playlist from previous offset
    async downloadPlaylistTracks(playlistId: string, limit: number) {
      // Init playlist info or return already saved tracks
      let offset = this.playlists[playlistId].offset
      if (!offset) {
        console.log('First time downloading playlist tracks')
        offset = 0
        this.playlists[playlistId] = { ...this.playlists[playlistId], offset, tracks: [] }
      } else if (limit <= offset) {
        // Cached tracks
        console.log(`Asked ${limit} tracks - already saved ${offset}, no request`)
        return this.playlists[playlistId].tracks.slice(0, limit)
      } else if (offset >= this.playlists[playlistId].total) {
        console.log('full playlist already loaded, no request')
        return this.playlists[playlistId].tracks
      }

      const newTracks: Array<SpotifyTrackMetadata> = []
      for (const requestOffset of range(offset, limit, this.MAX_TRACKS_LIMIT)) {
        const response = await this.retrieveTracks(playlistId, requestOffset)
        // Filter deleted track appearing in API
        response.data.items = response.data.items.filter(
          i => i.track != null &&
            i.track.type === 'track' &&
            !i.is_local
        )
        // Save track infos
        newTracks.push(...response.data.items)
        this.playlists[playlistId] = {
          ...response.data,
          ...this.playlists[playlistId],
          offset: this.playlists[playlistId].offset! + this.MAX_TRACKS_LIMIT,
          total: response.data.total
        }
      }

      // Retrieve data on artists (mainly genres & followers)
      const artistIds: Array<string> = []
      for (const item of newTracks) {
        artistIds.push(...item.track.artists.map((a) => a.id))
      }

      const spotifyArtistInfos = await api.spotify.artists.getMultipleArtists(
        Array.from(new Set(artistIds))
      )

      type ArtistStatistics = {
        genres: Array<string>;
        followers: number;
      }
      const artistMap: Map<string, ArtistStatistics> = new Map()
      for (const artist of spotifyArtistInfos) {
        artistMap.set(artist.id, { genres: artist.genres, followers: artist.followers.total })
      }

      // Map each track to artist genres and popularity (indie or not)
      for (const item of newTracks) {
        const track = item.track
        const artists = track.artists
        let allArtistIndie = true

        const trackGenres: Set<string> = new Set()
        for (let i = 0; i < artists.length; i++) {
          const artist = artists[i]
          artistMap.get(artist.id)!.genres.map(t => trackGenres.add(t))
          const followerCount = artistMap.get(artist.id)!.followers
          if (followerCount > 500_000) {
            allArtistIndie = false
          }

          // Update track artist as we retrieve more info in the specific artist call
          item.track.artists[i] = spotifyArtistInfos.find(a => a.id === artists[i].id)!
        }
        this.playlists[playlistId].tracks.push({
          ...track,
          isIndie: allArtistIndie,
          genres: Array.from(trackGenres)
        })
      }
      return this.playlists[playlistId].tracks
    },
    // Route request to standard playlist call or special "My music" one
    async retrieveTracks(playlistId: string, offset: number) {
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
    async updatePlaylistPrivacy(playlistId: string, isPublic: boolean) {
      await api.spotify.playlists.updatePlaylistPrivacy(playlistId, isPublic)
      this.playlists[playlistId].public = isPublic
    },
    // Unfollow playlist
    async unfollowPlaylist(playlistId: string) {
      await api.spotify.playlists.unfollowPlaylist(playlistId)
      delete this.playlists[playlistId]
    },
    // Create new empty playlist
    async createPlaylist(basePlaylistId: string, selectedGenres: Array<string>, public_: boolean, collaborative: boolean): Promise<string> {
      const translate = VueI18n.t
      const basePlaylist = this.playlists[basePlaylistId]

      let newPlaylistName = `${translate('playlist.duplicate.copy-of')} ${basePlaylist.name}`
      let newPlaylistDescription = ''
      if (selectedGenres.length !== 0) {
        newPlaylistName += ` • ${selectedGenres}`
        newPlaylistDescription += `'${basePlaylist.name}' • ${selectedGenres} •`
      } else {
        newPlaylistDescription += `${translate('playlist.duplicate.copy-of')} "${basePlaylist.name}"`
      }
      newPlaylistDescription += ` ${translate('playlist.duplicate.created-by')}`

      const name = newPlaylistName
      const description = newPlaylistDescription
      // const public_ = basePlaylist.public && !basePlaylist.collaborative
      // const collaborative = basePlaylist.collaborative

      const response = await api.spotify.playlists.createPlaylist(
        name,
        description,
        public_,
        collaborative
      )
      const playlist = response.data
      this.playlists[playlist.id] = {
        ...playlist,
        total: 0,
        tracks: [],
        images: basePlaylist.images
      }
      return playlist.id
    },
    async addTracksToPlaylist(newPlaylistId: string, tracks: Array<SpotifyTrack>) {
      const trackURIs = tracks.map((t) => t.uri)
      const lastSnapshotId = await api.spotify.playlists.addTracksToPlaylist(
        newPlaylistId,
        trackURIs
      )
      this.playlists[newPlaylistId].snapshot_id = lastSnapshotId
      this.playlists[newPlaylistId].tracks.push(...tracks)
      this.playlists[newPlaylistId].offset = trackURIs.length
      this.playlists[newPlaylistId].total = trackURIs.length
    },
    async deleteTracks(playlistId: string, tracks: Array<SpotifyTrack>) {
      await api.spotify.playlists.deleteTracks(playlistId, tracks)
      const deletedTrackIds = tracks.map(t => t.id)
      this.playlists[playlistId].tracks = this.playlists[playlistId].tracks.filter(t => !deletedTrackIds.includes(t.id))
    },
    updatePlaylistCover(playlistId: string, coverUrl: string) {
      api.spotify.playlists.updatePlaylistCover(
        playlistId,
        coverUrl
      )
    },
    async refreshMyMusicTotalTrack() {
      // My Music is a special Spotify playlist
      const response = await api.spotify.playlists.getUserSavedTracks(1, 0)
      this.playlists['my-music'].total = response.data.total
    },
    async sortPlaylistTracksByGenres(playlistId: string) {
      // 1. Save a copy of tracks
      // ALL tracks LOADED ?!?
      let tracks = this.playlists[playlistId].tracks.slice()
      const genres = this.getTopGenres(playlistId)

      // 2. Delete all playlist tracks (100 is the API limit)
      await this.deleteTracks(playlistId, tracks)

      // 3. Add tracks in genre order
      const sortedTracks: SpotifyTrack[] = []
      while (tracks.length > 0 && genres.length > 0) {
        const currentGenre = genres[0]
        const genreTracks = tracks.filter(t => t.genres.includes(currentGenre.name))
        sortedTracks.push(...genreTracks)

        genres.shift()
        tracks = tracks.filter(t => !t.genres.includes(currentGenre.name))
      }
      await this.addTracksToPlaylist(playlistId, sortedTracks)
      this.playlists[playlistId].tracks = sortedTracks
    },
    async sortPlaylistTracksByArtistPopularity(playlistId: string) {
      // 1. Save tracks
      // WHAT IF NOT ALL tracks LOADED ?!?
      let tracks = this.playlists[playlistId].tracks
      const artists = this.getTopArtists(playlistId)

      // 2. Delete all playlist tracks (100 is the API limit)
      await this.deleteTracks(playlistId, tracks)

      // 3. Add tracks in artist order
      const sortedTracks: SpotifyTrack[] = []
      while (tracks.length > 0 && artists.length > 0) {
        const currentArtistName = artists[0].artist.name
        const genreTracks = tracks.filter(t => t.artists.map(a => a.name).includes(currentArtistName))
        sortedTracks.push(...genreTracks)

        artists.shift()
        tracks = tracks.filter(t => !t.artists.map(a => a.name).includes(currentArtistName))
      }

      await this.addTracksToPlaylist(playlistId, sortedTracks)
      this.playlists[playlistId].tracks = sortedTracks
    },
    async sortPlaylistTracksByArtistName(playlistId: string) {
      // 1. Save tracks
      // WHAT IF NOT ALL tracks LOADED ?!?
      let tracks = this.playlists[playlistId].tracks
      const artistNames = this.getArtistsByName(playlistId)

      // 2. Delete all playlist tracks (100 is the API limit)
      await this.deleteTracks(playlistId, tracks)

      // 3. Add tracks in artist order
      const sortedTracks: SpotifyTrack[] = []
      while (tracks.length > 0 && artistNames.length > 0) {
        const currentArtistName = artistNames[0]
        const genreTracks = tracks.filter(t => t.artists.map(a => a.name).includes(currentArtistName))
        sortedTracks.push(...genreTracks)

        artistNames.shift()
        tracks = tracks.filter(t => !t.artists.map(a => a.name).includes(currentArtistName))
      }

      this.addTracksToPlaylist(playlistId, sortedTracks)
      this.playlists[playlistId].tracks = sortedTracks
    }
  }
})
