import { RemovableRef, useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

import api from '@/api'
import { SimplifiedSpotifyPlaylist, SpotifyArtist, SpotifyPlaylist, SpotifyTrack, SpotifyTrackMetadata } from '@/api/spotify/types/entities'
import { Genre } from '@/genre'
import { t } from '@/i18n'
import { useUserStore } from '@/stores/user'
import { getRandomColor } from '@/utils/colors'
import { capitalize, getDefaultMap, range } from '@/utils/functions'

// Order matters as only first match will be used (trap before rap, ...)
// Sorting in length descending order to avoid this
const COMMON_GENRES = [
  'alternative', 'death metal', 'electropop', 'reggaeton', 'pop rock', 'hip hop',
  'electro', 'dubstep', 'country', 'trance', 'mellow', 'techno', 'reggae', 'drill',
  'grime', 'house', 'indie', 'psych', 'swing', 'metal', 'lo-fi', 'dance', 'blues',
  'disco', 'punk', 'rock', 'jazz', 'trap', 'soul', 'funk', 'pop', 'r&b', 'rap',
  'edm', 'dnb'
] as const

export const MY_MUSIC_PLAYLIST_ID = 'my-music'
const DEFAULT_MY_MUSIC_PLAYLIST: SimplifiedSpotifyPlaylist = {
  collaborative: false,
  description: '',
  id: MY_MUSIC_PLAYLIST_ID,
  images: [
    {
      url: new URL('./../assets/my-music.jpeg', import.meta.url).href
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
  alternative: '#20bf6b',
  'black metal': '#FFFFFF',
  disco: '#FFA500',
  dubstep: 'black',
  electro: '#C0C0C0',
  funk: '#FFA500',
  'heavy metal': '#BB0022',
  house: '#F89122',
  indie: '#00FF00',
  jazz: '#FFC0CB',
  opera: '#AD1131',
  pop: '#87CEEB',
  reggae: '#008000',
  rock: '#DC143C',
  soul: '#FFA500',
  techno: '#F36533'
}

export const usePlaylistsStore = defineStore('playlists', {
  state: () => ({
    playlists: useStorage('playlists', {}),
    genreColorMapping: useStorage('genreColorMapping', DEFAULT_GENRE_COLOR_MAPPING)
  } as PlaylistState),
  getters: {
    getTopArtists (state) {
      /**
       * Return the n most present artists for a playlist
       */
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
        let sortedArtists: [string, ArtistCount][] = Object.keys(artistCount).map((label) => [
          label,
          artistCount[label]
        ])

        sortedArtists.sort((a1, a2) => a2[1].count - a1[1].count)

        if (n) {
          sortedArtists = sortedArtists.slice(0, n)
        }
        return sortedArtists.map(a => a[1])
      }
    },
    getTopGenres (state) {
      /**
       * Returns the n most present genres in a playlist
       */
      return (playlistId: string, n?: number): Genre[] => {
        const genreCounter = getDefaultMap(0)
        for (const track of state.playlists[playlistId].tracks) {
          for (const genre of track.genres) {
            genreCounter[genre] += 1
          }
        }
        const trackNumber = state.playlists[playlistId].tracks.length

        let genreMapping: Genre[] = Object.keys(genreCounter).map((genre) => ({
          name: genre,
          cap_name: capitalize(genre),
          count: genreCounter[genre],
          percentage: ~~(genreCounter[genre] / trackNumber * 100)
        }))
        genreMapping.sort((g1, g2) => g2.count - g1.count)

        if (n) {
          genreMapping = genreMapping.slice(0, n)
        }
        return genreMapping
      }
    },
    getArtistsByName (state) {
      /**
       * Returns all artist names in a playlist
       */
      return (playlistId: string): string[] => {
        const names: Set<string> = new Set()
        state.playlists[playlistId].tracks.map(
          t => t.artists.map(a => names.add(a.name))
        )
        return Array.from(names).sort((a1, a2) => a1.localeCompare(a2))
      }
    },
    getIndiePercentage (state) {
      /**
       * Get the general playlist isIndie % from the mean of all tracks
       */
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
      /**
       * Compute full playlist duration
       */
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
    /**
     * Manually update state as local storage and states are linked now
     */
    reset () {
      this.playlists = {}
    },
    /**
     * Delete every track already saved except the given one.
     * Mainly useful to ensure max capacity of localStorage.
     */
    softReset (playlistIdToSave?: string) {
      console.log('Deleting all known tracks to save space on localStorage')

      const playlistIds = Object.keys(this.playlists).filter(id => id !== playlistIdToSave)
      for (const playlistId of playlistIds) {
        this.playlists[playlistId].tracks = []
        this.playlists[playlistId].offset = 0
      }
    },
    /**
     * Retrieve some playlists from the user account
     */
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

      const { data } = await api.spotify.playlists.getUserPlaylists(
        MAX_PLAYLISTS_LIMIT,
        offset
      )
      offset += MAX_PLAYLISTS_LIMIT
      const playlists = data.items
      playlists.unshift(this.getLikedSongPlaylist(username))

      // Update existing playlist or create it
      for (const requestPlaylist of playlists) {
        const cachedPlaylist = this.playlists[requestPlaylist.id]

        if (!requestPlaylist.images || requestPlaylist.images.length === 0) {
          requestPlaylist.images = [{ url: new URL('./../assets/default_cover.jpg', import.meta.url).href }]
        }

        if (cachedPlaylist) {
          // Pop cached tracks if playlist have changed
          if (cachedPlaylist.snapshot_id !== requestPlaylist.snapshot_id) {
            console.log(`Cache expired for playlist '${requestPlaylist.name}'. Snapshot id is different.`)
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
            tracks: [],
            offset: 0,
            containsEpisodes: false,
            containsLocalTracks: false,
            containsDuplicatedTracks: false
          }
        }
      }

      // When reloading for the first time
      if (offset === MAX_PLAYLISTS_LIMIT) {
        this.purgeDeletedPlaylists(playlists)
      }

      return {
        offset,
        total: data.total
      }
    },
    /**
     *  Delete cached playlists deleted by user
     */
    purgeDeletedPlaylists (playlists: SimplifiedSpotifyPlaylist[]) {
      const playlistRequestId = playlists.map(p => p.id)
      for (const key in this.playlists) {
        if (!playlistRequestId.includes(key)) {
          delete this.playlists[key]
        }
      }
    },
    /**
     * Special playlist from user liked song treated differently in Spotify API
     */
    getLikedSongPlaylist (username: string): SimplifiedSpotifyPlaylist {
      const myMusicPlaylist = DEFAULT_MY_MUSIC_PLAYLIST
      myMusicPlaylist.owner.display_name = username
      return myMusicPlaylist
    },
    /**
     * Special method to avoid a bug.
     * ! BUG: Spotify general Mix playlists between several peoples have their
     * total tracks set to 0 while there are currently tracks in the playlist
     */
    getTrackCount (requestPlaylist: SimplifiedSpotifyPlaylist, username: string): number {
      if (requestPlaylist.name.includes(username) && requestPlaylist.name.includes('+')) return 50
      return requestPlaylist.tracks.total
    },
    /**
     * Init playlist info or return already saved tracks
     */
    async downloadPlaylistTracks (playlistId: string, limit: number): Promise<void> {
      let { offset } = this.playlists[playlistId]
      if (!offset) {
        console.log('First time downloading playlist tracks')
        offset = 0
        this.playlists[playlistId] = {
          ...this.playlists[playlistId],
          offset,
          tracks: []
        }
      } else if (offset >= limit) {
        // Cached tracks
        console.log(`Asked ${limit} tracks - already saved ${offset}, no request`)
        return
      } else if (offset >= this.playlists[playlistId].total) {
        console.log('Full playlist already loaded, no request')
        return
      }

      const newTracksRawData: SpotifyTrackMetadata[] = []
      for (const requestOffset of range(offset, limit, API_TRACK_LIMIT)) {
        const response = await this.retrieveTracks(playlistId, requestOffset)
        const responseTracks = response.data.items

        if (responseTracks.filter(trackMeta => trackMeta.is_local).length > 0) {
          this.playlists[playlistId].containsLocalTracks = true
        }
        if (responseTracks.filter(trackMeta => trackMeta.track.type === 'episode').length > 0) {
          this.playlists[playlistId].containsEpisodes = true
        }

        // Filter deleted track appearing in API,episodes and local tracks
        const filteredTracks = responseTracks.filter(
          i => (i.track !== null && i.track.type === 'track' && !i.is_local)
        )
        newTracksRawData.push(...filteredTracks)

        this.playlists[playlistId].offset = (this.playlists[playlistId].offset as number) + API_TRACK_LIMIT
        this.playlists[playlistId].total = response.data.total
      }

      const formattedTracks = await this.formatPlaylistTracks(newTracksRawData)
      this.playlists[playlistId].tracks.push(...formattedTracks)

      const filterDuplicates = <T>(arr: T[]) => arr.filter((item, index) => arr.indexOf(item) !== index)
      if (filterDuplicates(this.playlists[playlistId].tracks.map(t => t.id)).length > 0) {
        this.playlists[playlistId].containsDuplicatedTracks = true
      }
    },
    /**
     * Retrieve data on artists (mainly genres & followers)
     */
    async formatPlaylistTracks (newTracks: SpotifyTrackMetadata[]): Promise<SpotifyTrack[]> {
      const artistIds: string[] = []
      for (const item of newTracks) {
        artistIds.push(...item.track.artists.map((a) => a.id))
      }

      const spotifyArtistInfo = await api.spotify.artists.getMultipleArtists(
        Array.from(new Set(artistIds))
      )

      type ArtistStatistics = {
        genres: string[];
        followers: number;
      }
      const artistMap: Record<string, ArtistStatistics> = {}
      for (const artist of spotifyArtistInfo) {
        artistMap[artist.id] = { genres: artist.genres, followers: artist.followers.total }
      }

      const formattedTracks: SpotifyTrack[] = []
      // Map each track to artist genres and popularity (indie or not)
      for (const item of newTracks) {
        const { track } = item
        const { artists } = track
        let allArtistIndie = true

        const trackGenres: Set<string> = new Set()
        for (let i = 0; i < artists.length; i++) {
          const artist = artists[i]

          const artistStatistics = artistMap[artist.id]
          artistStatistics.genres.forEach(t => trackGenres.add(t))
          if (artistStatistics.followers > 500_000) {
            allArtistIndie = false
          }

          // Update track artist as we retrieve more info in the specific artist call

          item.track.artists[i] = spotifyArtistInfo.find(a => a.id === artists[i].id) as SpotifyArtist
        }
        formattedTracks.push({
          ...track,
          isIndie: allArtistIndie,
          genres: this.filterUncommonGenres(Array.from(trackGenres))
        })
      }
      return formattedTracks
    },
    /**
     * Route request to standard playlist call or special "My music" one
     */
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
    /**
     * Create new empty playlist
     */
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
        description,

        offset: 0,
        containsEpisodes: false,
        containsLocalTracks: false,
        containsDuplicatedTracks: false
      }
      return playlist.id
    },
    async addTracksToPlaylist (newPlaylistId: string, tracks: SpotifyTrack[]) {
      const trackURIs = tracks.map((t) => t.uri)
      const lastSnapshotId = await api.spotify.playlists.addTracksToPlaylist(
        newPlaylistId,
        trackURIs
      )

      this.playlists[newPlaylistId].snapshot_id = lastSnapshotId as string
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
    /**
     * My Music is the Spotify playlist for 'liked' tracks.
     * ! We have to request some tracks to retrieve and update the total number of tracks
     */
    async refreshMyMusicTotalTrack () {
      const response = await api.spotify.playlists.getUserSavedTracks(1, 0)
      this.playlists[MY_MUSIC_PLAYLIST_ID].total = response.data.total
    },
    async sortPlaylistTracksByGenres (playlistId: string) {
      // 1. Save a copy of tracks
      let tracks = this.playlists[playlistId].tracks.toSorted(
        (t1, t2) => {
          return t1.genres.length - t2.genres.length ||
          t1.artists[0].name.localeCompare(t2.artists[0].name) ||
          t1.album.release_date.localeCompare(t2.album.release_date)
        }
      )

      const genres = this.getTopGenres(playlistId)

      // 2. Delete all playlist tracks (100 is the API limit)
      await this.deleteTracks(playlistId, tracks)

      // 3. Add tracks in genre order
      const sortedTracks: SpotifyTrack[] = []
      while (tracks.length > 0 && genres.length > 0) {
        const currentGenre = genres.shift() as Genre
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
        const currentArtistName = artistNames.shift() as string
        const artistTracks = tracks.filter(t => t.artists.map(a => a.name).includes(currentArtistName))
        sortedTracks.push(...artistTracks)

        tracks = tracks.filter(t => !t.artists.map(a => a.name).includes(currentArtistName))
      }

      this.addTracksToPlaylist(playlistId, sortedTracks)
    },
    /**
     * Format uncommon genres to more common and broader genres.
     * Also pick a specific color for each unknown genre.
     */
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

      return filteredGenres.sort((g1, g2) => g1.localeCompare(g2))
    },
    /**
     * Determine if some tracks are 'liked' by the other or not
     */
    async tracksAreLiked (tracks: SpotifyTrack[]): Promise<Record<string, boolean>> {
      const data = await api.spotify.playlists.tracksAreLiked(tracks.map(t => t.id))
      const trackPreferences: Record<string, boolean> = {}
      for (let i = 0; i < data.length; i++) {
        trackPreferences[tracks[i].id] = data[i]
      }
      return trackPreferences
    }
  }
})
