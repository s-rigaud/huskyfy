import { RemovableRef, useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

import api from '@/api'
import { SimplifiedSpotifyPlaylist, SpotifyArtist, SpotifyPlaylist, SpotifyTrack, SpotifyTrackMetadata } from '@/api/spotify/types/entities'
import { t } from '@/i18n'
import { Genre } from '@/model'
import { getRandomColor } from '@/services/utils'
import { useUserStore } from '@/stores/user'
import { capitalize, getDefaultMap, range } from '@/utils/functions'

// Order matters as only first match will be used (trap before rap, ...)
// Sorting in length descending order to avoid this
const COMMON_GENRES = [
  'alternative', 'death metal', 'electropop', 'pop rock', 'hip hop',
  'drill', 'house', 'indie', 'psych', 'swing', 'metal', 'dance', 'rock',
  'jazz', 'trap', 'lo-fi', 'soul', 'funk', 'pop', 'r&b', 'rap', 'edm'
]

export const MY_MUSIC_PLAYLIST_ID = 'my-music'
const DEFAULT_MY_MUSIC_PLAYLIST: SimplifiedSpotifyPlaylist = {
  collaborative: false,
  description: '',
  id: MY_MUSIC_PLAYLIST_ID,
  images: [
    {
      url: require('@/assets/my-music.jpeg')
    }
  ],
  name: t('playlist.your-music.name'),
  owner: {
    display_name: '',
    external_urls: { spotify: '' },
    href: '',
    id: '',
    type: 'user',
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

export const API_TRACK_LIMIT = 50
const MAX_PLAYLISTS_LIMIT = 50

export type PlaylistState = {
  playlists: RemovableRef<Record<string, SpotifyPlaylist>>;
  genreColorMapping: RemovableRef<Record<string, string>>;
}

type ArtistCount = {
  artist: SpotifyArtist
  count: number
}

const DEFAULT_GENRE_COLOR_MAPPING: Record<string, string> = {
  rock: 'red',
  indie: 'green',
  funk: 'yellow'
}

export const usePlaylistsStore = defineStore('playlists', {
  state: () => ({
    playlists: useStorage('playlists', {}),
    genreColorMapping: useStorage('genreColorMapping', DEFAULT_GENRE_COLOR_MAPPING)
  } as PlaylistState),
  getters: {
    getTopArtists (state) {
      return (playlistId: string, n?: number): ArtistCount[] => {
        const artistCount: Record<string, ArtistCount> = {}
        const ARTIST_UNIQUE_FIELD = 'id'

        for (const track of state.playlists[playlistId].tracks) {
          for (const artist of track.artists) {
            const artistKey = artist[ARTIST_UNIQUE_FIELD]
            if (artistCount[artistKey]) {
              artistCount[artistKey].count += 1
            } else {
              artistCount[artistKey] = { artist, count: 1 }
            }
          }
        }

        // Use mapping object to sort result in DESC order and returns the top n
        let sortedArtists = (Object.keys(artistCount).map((label) => [
          label,
          artistCount[label]
        ]) as [string, ArtistCount][])

        sortedArtists.sort((a, b) => {
          return b[1].count - a[1].count
        })

        if (n) {
          sortedArtists = sortedArtists.slice(0, n)
        }
        return sortedArtists.map(a => a[1])
      }
    },
    getTopGenres (state) {
      return (playlistId: string, n?: number): Genre[] => {
        const genreCounter = getDefaultMap(0)
        for (const track of state.playlists[playlistId].tracks) {
          for (const genre of track.genres) {
            genreCounter[genre] += 1
          }
        }
        let genreMapping: [string, number][] = Object.keys(genreCounter).map((label) => [
          label,
          genreCounter[label]
        ])

        // DESC sort
        genreMapping.sort((a, b) => {
          return b[1] - a[1]
        })

        if (n) {
          genreMapping = genreMapping.slice(0, n)
        }

        // Sampling & formatting
        const trackNumber = state.playlists[playlistId].tracks.length
        return genreMapping.map((genre) => ({
          name: genre[0],
          cap_name: capitalize(genre[0]),
          count: genre[1],
          percentage: ~~(genre[1] / trackNumber * 100)
        }))
      }
    },
    getArtistsByName (state) {
      return (playlistId: string): string[] => {
        const names: Set<string> = new Set()
        state.playlists[playlistId].tracks.map(
          t => t.artists.map(a => names.add(a.name))
        )
        return Array.from(names).sort((a1, a2) => a1.localeCompare(a2))
      }
    },
    getIndiePercentage (state) {
      // Get the general playlist isIndie % from the mean of all tracks

      return (playlistId: string): number => {
        const tracks = state.playlists[playlistId].tracks
        let indieTracks = 0
        for (const track of tracks) {
          indieTracks += track.isIndie ? 1 : 0
        }
        return ~~(indieTracks / tracks.length * 100)
      }
    },
    getPlaylistFullLength (state) {
      return (playlistId: string): string => {
        const durationInMS = state.playlists[playlistId].tracks.reduce(
          (duration, nexTrack) => duration + nexTrack.duration_ms,
          0
        )
        const durationInSeconds = ~~(durationInMS / 1000)
        const seconds = durationInSeconds % 60
        const hours = ~~(durationInSeconds / (60 * 60))
        const minutes = (durationInSeconds - hours * (60 * 60) - seconds) / 60
        if (hours) return `${hours} h ${minutes} min`
        return `${minutes} min ${seconds}s`
      }
    }
  },
  actions: {
    reset () {
      // Manually update state as local storage and states are linked now
      this.playlists = {}
    },
    softReset (playlistIdToSave?: string) {
      // Delete every track already saved. Mainly useful to ensure max capacity of localStorage
      console.log('Deleting all known tracks to save space on localeStorage')

      const playlistIds = Object.keys(this.playlists).filter(id => id !== playlistIdToSave)
      for (const playlistId of playlistIds) {
        this.playlists[playlistId].tracks = []
      }
    },
    // Retrieve playlists for user
    async getUserPlaylists (offset: number) {
      const username = useUserStore().username

      // Delete playlist tracks if too many playlists already loaded
      let playlistsAlreadyLoaded = 0
      for (const playlistId of Object.keys(this.playlists)) {
        playlistsAlreadyLoaded += +(this.playlists[playlistId].tracks.length > 10)
      }
      if (playlistsAlreadyLoaded > 10) {
        this.softReset()
      }

      const response = await api.spotify.playlists.getUserPlaylists(
        MAX_PLAYLISTS_LIMIT,
        offset
      )
      offset += MAX_PLAYLISTS_LIMIT
      const playlists = response.data.items
      playlists.unshift(this.getLikedSongPlaylist(username))

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
            total: this.getTrackCount(requestPlaylist, username),
            tracks: []
          }
        }
      }

      // When reloading for the first time
      if (offset === MAX_PLAYLISTS_LIMIT) {
        this.purgeDeletedPlaylists(playlists)
      }

      return {
        offset,
        total: response.data.total
      }
    },
    // Delete cached playlists deleted by user
    purgeDeletedPlaylists (playlists: SimplifiedSpotifyPlaylist[]) {
      const playlistRequestId = playlists.map(p => p.id)
      for (const key in this.playlists) {
        if (!playlistRequestId.includes(key)) {
          delete this.playlists[key]
        }
      }
    },
    // Special playlist from user liked song treated differently in Spotify API
    getLikedSongPlaylist (username: string): SimplifiedSpotifyPlaylist {
      const myMusicPlaylist = DEFAULT_MY_MUSIC_PLAYLIST
      myMusicPlaylist.owner.display_name = username
      return myMusicPlaylist
    },
    getTrackCount (requestPlaylist: SimplifiedSpotifyPlaylist, username: string): number {
      // BUG: Spotify general Mix playlists between several peoples have their
      // total tracks set to 0 while there are currently tracks in the playlist
      if (requestPlaylist.name.includes(username) && requestPlaylist.name.includes('+')) return 50
      return requestPlaylist.tracks.total
    },
    // Download more tracks for a specific playlist from previous offset
    async downloadPlaylistTracks (playlistId: string, limit: number): Promise<SpotifyTrack[]> {
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

      const newTracks: SpotifyTrackMetadata[] = []
      for (const requestOffset of range(offset, limit, API_TRACK_LIMIT)) {
        const response = await this.retrieveTracks(playlistId, requestOffset)
        // Filter deleted track appearing in API
        response.data.items = response.data.items.filter(
          i => (i.track !== null && i.track.type === 'track' && !i.is_local)
        )
        // Save track infos
        newTracks.push(...response.data.items)

        // Delete items infos to save space, a duplicate from SpotifyPlaylist.tracks
        response.data.items = []

        this.playlists[playlistId] = {
          ...response.data,
          ...this.playlists[playlistId],
          offset: (this.playlists[playlistId].offset as number) + API_TRACK_LIMIT,
          total: response.data.total
        }
      }

      // Retrieve data on artists (mainly genres & followers)
      const artistIds: string[] = []
      for (const item of newTracks) {
        artistIds.push(...item.track.artists.map((a) => a.id))
      }

      const spotifyArtistInfos = await api.spotify.artists.getMultipleArtists(
        Array.from(new Set(artistIds))
      )

      type ArtistStatistics = {
        genres: string[];
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

          const artistStatistics = (artistMap.get(artist.id) as ArtistStatistics)
          artistStatistics.genres.forEach(t => trackGenres.add(t))
          if (artistStatistics.followers > 500_000) {
            allArtistIndie = false
          }

          // Update track artist as we retrieve more info in the specific artist call
          // eslint-disable-next-line
          item.track.artists[i] = spotifyArtistInfos.find(a => a.id === artists[i].id)!
        }
        this.playlists[playlistId].tracks.push({
          ...track,
          isIndie: allArtistIndie,
          genres: this.filterUncommonGenres(Array.from(trackGenres))
        })
      }

      return this.playlists[playlistId].tracks
    },
    // Route request to standard playlist call or special "My music" one
    async retrieveTracks (playlistId: string, offset: number) {
      if (playlistId === MY_MUSIC_PLAYLIST_ID) {
        return await api.spotify.playlists.getUserSavedTracks(
          API_TRACK_LIMIT,
          offset
        )
      } else {
        return await api.spotify.playlists.getPlaylistTracks(
          playlistId,
          API_TRACK_LIMIT,
          offset
        )
      }
    },
    async updatePlaylistPrivacy (playlistId: string, isPublic: boolean) {
      await api.spotify.playlists.updatePlaylistPrivacy(playlistId, isPublic)
      this.playlists[playlistId].public = isPublic
    },
    async unfollowPlaylist (playlistId: string) {
      await api.spotify.playlists.unfollowPlaylist(playlistId)
      delete this.playlists[playlistId]
    },
    // Create new empty playlist
    async createPlaylist (basePlaylistId: string, name: string, description: string, public_: boolean, collaborative: boolean): Promise<string> {
      const basePlaylist = this.playlists[basePlaylistId]

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
        images: basePlaylist.images,
        // There is currently a bug in the Spotify API when description is sometimes null for returns
        description
      }
      return playlist.id
    },
    async addTracksToPlaylist (newPlaylistId: string, tracks: SpotifyTrack[]) {
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
    async deleteTracks (playlistId: string, tracks: SpotifyTrack[]) {
      await api.spotify.playlists.deleteTracks(playlistId, tracks)
      const deletedTrackIds = tracks.map(t => t.id)
      this.playlists[playlistId].tracks = this.playlists[playlistId].tracks.filter(t => !deletedTrackIds.includes(t.id))
    },
    updatePlaylistCover (playlistId: string, coverUrl: string) {
      api.spotify.playlists.updatePlaylistCover(
        playlistId,
        coverUrl
      )
    },
    async updatePlaylistName (playlistId: string, name: string) {
      await api.spotify.playlists.updatePlaylistName(
        playlistId,
        name
      )
      this.playlists[playlistId].name = name
    },
    async refreshMyMusicTotalTrack () {
      // My Music is a special Spotify playlist
      const response = await api.spotify.playlists.getUserSavedTracks(1, 0)
      this.playlists[MY_MUSIC_PLAYLIST_ID].total = response.data.total
    },
    async sortPlaylistTracksByGenres (playlistId: string) {
      // 1. Save a copy of tracks
      let tracks = this.playlists[playlistId].tracks.slice()
      const genres = this.getTopGenres(playlistId)

      // 2. Delete all playlist tracks (100 is the API limit)
      await this.deleteTracks(playlistId, tracks)

      // 3. Add tracks in genre order
      const sortedTracks: SpotifyTrack[] = []
      while (tracks.length > 0 && genres.length > 0) {
        const currentGenre = (genres.shift() as Genre)
        const genreTracks = tracks.filter(t => t.genres.includes(currentGenre.name))
        sortedTracks.push(...genreTracks)

        tracks = tracks.filter(t => !t.genres.includes(currentGenre.name))
      }
      await this.addTracksToPlaylist(playlistId, sortedTracks)
    },
    async sortPlaylistTracksByArtistTrackInPlaylist (playlistId: string) {
      // 1. Save tracks
      let tracks = this.playlists[playlistId].tracks
      const artists = this.getTopArtists(playlistId)

      // 2. Delete all playlist tracks (100 is the API limit)
      await this.deleteTracks(playlistId, tracks)

      // 3. Add tracks in artist order
      const sortedTracks: SpotifyTrack[] = []
      while (tracks.length > 0 && artists.length > 0) {
        const currentArtistName = (artists.shift() as ArtistCount).artist.name
        const genreTracks = tracks.filter(t => t.artists.map(a => a.name).includes(currentArtistName))
        sortedTracks.push(...genreTracks)

        tracks = tracks.filter(t => !t.artists.map(a => a.name).includes(currentArtistName))
      }

      await this.addTracksToPlaylist(playlistId, sortedTracks)
    },
    async sortPlaylistTracksByArtistName (playlistId: string) {
      // 1. Save tracks
      let tracks = this.playlists[playlistId].tracks
      const artistNames = this.getArtistsByName(playlistId)

      // 2. Delete all playlist tracks (100 is the API limit)
      await this.deleteTracks(playlistId, tracks)

      // 3. Add tracks in artist order
      const sortedTracks: SpotifyTrack[] = []
      while (tracks.length > 0 && artistNames.length > 0) {
        const currentArtistName = (artistNames.shift() as string)
        const artistTracks = tracks.filter(t => t.artists.map(a => a.name).includes(currentArtistName))
        sortedTracks.push(...artistTracks)

        tracks = tracks.filter(t => !t.artists.map(a => a.name).includes(currentArtistName))
      }

      this.addTracksToPlaylist(playlistId, sortedTracks)
    },
    filterUncommonGenres (trackGenres: string[]): string[] {
      for (let i = 0; i < trackGenres.length; i++) {
        for (const commonGenre of COMMON_GENRES) {
          if (trackGenres[i].includes(commonGenre)) {
            trackGenres[i] = commonGenre
            break
          }
        }
      }

      const filteredGenres = Array.from(new Set(trackGenres))
      // Assign a color for each genre
      for (const genre of filteredGenres) {
        if (!this.genreColorMapping[genre]) {
          this.genreColorMapping[genre] = getRandomColor()
        }
      }

      return filteredGenres.sort()
    }
  }
})
