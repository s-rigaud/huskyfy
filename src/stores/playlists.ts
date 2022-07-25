import api from '@/api'
import { SimplifiedSpotifyPlaylist, SpotifyPlaylist, SpotifyTrack, SpotifyTrackMetadata } from '@/api/spotify/model'
import { UserState, useUserStore } from '@/stores/user'
import { RemovableRef, useStorage } from '@vueuse/core'
import { defineStore, Store } from 'pinia'
import VueI18n from '../i18n'

type KeyPlaylist = {
  [key: string]: SpotifyPlaylist
}

type PlaylistState = {
  playlists: RemovableRef<KeyPlaylist>;
  MAX_TRACKS_LIMIT: RemovableRef<number>;
  MAX_PLAYLISTS_LIMIT: RemovableRef<number>;

  selectedPlaylistId: RemovableRef<string | null>;
  filteredTracks: RemovableRef<Array<SpotifyTrack>>;
  selectedGenres: RemovableRef<Array<string>>;
}

function chunkArray (array: Array<string>, chunkSize: number): Array<Array<string>> {
  const results: Array<Array<string>> = []
  const copyArray = [...array]
  while (copyArray.length) {
    results.push(copyArray.splice(0, chunkSize))
  }
  return results
}

function range (start: number, stop: number, step = 1): Array<number> {
  return Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)
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
      return (n: number) => {
        const artistCount = {}
        for (const track of state.playlists[state.selectedPlaylistId!].tracks) {
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
        return Object.keys(artistCount).map((label) => [
          label,
          artistCount[label]
        ]).sort((a, b) => {
          return b[1].count - a[1].count
        }).slice(0, n).map(a => a[1])
      }
    }
  },
  actions: {
    reset () {
      // Manually update state as local storage and states are linked now
      this.playlists = {}
      this.selectedPlaylistId = null
      this.filteredTracks = []
      this.selectedGenres = []
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
    getLikedSongPlaylist (userStore: Store<'user', UserState>): SimplifiedSpotifyPlaylist {
      const i18n = VueI18n.global
      return {
        collaborative: false,
        description: '',
        id: 'my-music',
        images: [
          {
            url: require('@/assets/my-music.jpeg')
          }
        ],
        name: i18n.t('playlist.your-music.name'),
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
        uri: ''
      }
    },
    getTrackCount (requestPlaylist: SimplifiedSpotifyPlaylist, userStore: Store<'user', UserState>): number {
      // Spotify general Mix playlists have their total tracks set
      // to 0 while there are currently tracks in the playlist
      // We have to fix this
      if (requestPlaylist.name.includes(userStore.username) && requestPlaylist.name.includes('+')) return 50
      return requestPlaylist.tracks.total
    },
    // Download more tracks for a specific playlist from previous offset
    async downloadPlaylistTracks (playlistId: string, limit: number) {
      // Init playlist info or return already saved tracks
      let offset = this.playlists[playlistId].offset
      if (!offset) {
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
        // Save track infos
        const response = await this.retrieveTracks(playlistId, requestOffset)
        // Filter deleted track appearing in API
        response.data.items = response.data.items.filter(i => i.track != null && i.track.type === 'track')
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
    async retrieveTracks (playlistId: string, offset: number) {
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
    async createPlaylist (basePlaylistId: string, selectedGenres: Array<string>): Promise<string> {
      const i18n = VueI18n.global
      const basePlaylist = this.playlists[basePlaylistId]

      let newPlaylistName = `${i18n.t('playlist.duplicate.copy-of')} ${basePlaylist.name}`
      let newPlaylistDescription = ''
      if (selectedGenres.length !== 0) {
        newPlaylistName += ` • ${selectedGenres}`
        newPlaylistDescription += `'${basePlaylist.name}' • ${selectedGenres} •`
      } else {
        newPlaylistDescription += `${i18n.t('playlist.duplicate.copy-of')} "${basePlaylist.name}"`
      }
      newPlaylistDescription += ` ${i18n.t('playlist.duplicate.created-by')}`

      const name = newPlaylistName
      const description = newPlaylistDescription
      // const public_ = basePlaylist.public && !basePlaylist.collaborative
      // const collaborative = basePlaylist.collaborative

      const response = await api.spotify.playlists.createPlaylist(
        name,
        false,
        description,
        false
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
    async addTracksToPlaylist (originalPlaylistId: string, newPlaylistId: string, trackURIs: Array<string>) {
      let lastSnapshotId = ''
      for (const trackIdBatch of chunkArray(trackURIs, 100)) {
        const { data } = await api.spotify.playlists.addTracksToPlaylist(
          newPlaylistId,
          trackIdBatch
        )
        lastSnapshotId = data.snapshot_id
      }
      this.playlists[newPlaylistId].snapshot_id = lastSnapshotId
      this.playlists[newPlaylistId].tracks = this.playlists[originalPlaylistId].tracks.filter(t => trackURIs.includes(t.uri))
      this.playlists[newPlaylistId].offset = trackURIs.length
      this.playlists[newPlaylistId].total = trackURIs.length
    },
    updatePlaylistCover (playlistId: string, coverUrl: string) {
      api.spotify.playlists.updatePlaylistCover(
        playlistId,
        coverUrl
      )
    }
  }
})
