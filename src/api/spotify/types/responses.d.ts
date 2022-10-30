import { SimplifiedSpotifyPlaylist, SpotifyArtist, SpotifyPlaylist, SpotifyTrackMetadata } from './entities'

// Spotify API Response for /playlists
export interface SpotifyGetPlaylistResponse {
    href: string;
    items: SimplifiedSpotifyPlaylist[];
    limit: number;
    next?: string;
    offset: number;
    previous?: string;
    total: number;
}

// Spotify API Response for /playlist/:id
export interface SpotifyGetDetailedPlaylistResponse {
    href: string;
    items: SpotifyPlaylist[];
    limit: number;
    next?: string;
    offset: number;
    previous?: string;
    total: number;
}

// Spotify API Response for /tracks
export interface SpotifyTrackResponse {
    items: SpotifyTrackMetadata[];
    limit: number;
    offset: number;
    total: number;
}

// Spotify API Response for /artists
export interface SpotifyArtistResponse {
    artists: SpotifyArtist[];
}

export interface SpotifyAuthResponse {
    access_token: string;
    refresh_token: string;
}
