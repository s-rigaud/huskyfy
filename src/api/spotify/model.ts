interface SpotifyExternalUrls {
    spotify: string;
}

interface SpotifyFollowers {
    href?: string;
    total: number;
}

interface SpotifyImage {
    height?: number;
    url: string;
    width?: number;
}

interface SpotifyExplicitContent {
    // eslint-disable-next-line
    filter_enabled: boolean;
    // eslint-disable-next-line
    filter_locked: boolean;
}

interface SpotifyOwner {
    // eslint-disable-next-line
    display_name: string;
    // eslint-disable-next-line
    external_urls: SpotifyExternalUrls;
    href: string;
    id: string;
    type: string;
    uri: string;
}

interface SpotifyVideoThumbnail {
    url?: string;
}

interface SpotifyAddedBy {
    // eslint-disable-next-line
    external_urls: SpotifyExternalUrls;
    href: string;
    id: string;
    type: string;
    uri: string;
}

interface SpotifyExternalIds {
    isrc: string;
}

// Artist Model
export interface SpotifyArtist {
    // eslint-disable-next-line
    external_urls: SpotifyExternalUrls;
    followers: SpotifyFollowers;
    genres: string[];
    href: string;
    id: string;
    images: SpotifyImage[];
    name: string;
    popularity: number;
    type: string;
    uri: string;
}

// Profile Model
export interface SpotifyProfile {
    country: string;
    // eslint-disable-next-line
    display_name: string;
    email: string;
    // eslint-disable-next-line
    explicit_content: SpotifyExplicitContent;
    // eslint-disable-next-line
    external_urls: SpotifyExternalUrls;
    followers: SpotifyFollowers;
    href: string;
    id: string;
    images: SpotifyImage[];
    product: string;
    type: string;
    uri: string;
}

// Album Model
export interface SpotifyAlbum {
    // eslint-disable-next-line
    album_type: string;
    artists: SpotifyArtist[];
    // eslint-disable-next-line
    available_markets: string[];
    // eslint-disable-next-line
    external_urls: SpotifyExternalUrls;
    href: string;
    id: string;
    images: SpotifyImage[];
    name: string;
    // eslint-disable-next-line
    release_date: string;
    // eslint-disable-next-line
    release_date_precision: string;
    // eslint-disable-next-line
    total_tracks: number;
    type: string;
    uri: string;
}

// Track Model
export interface SpotifyTrack {
    album: SpotifyAlbum;
    artists: SpotifyArtist[];
    // eslint-disable-next-line
    available_markets: string[];
    // eslint-disable-next-line
    disc_number: number;
    // eslint-disable-next-line
    duration_ms: number;
    episode: boolean;
    explicit: boolean;
    // eslint-disable-next-line
    external_ids: SpotifyExternalIds;
    // eslint-disable-next-line
    external_urls: SpotifyExternalUrls;
    href: string;
    id: string;
    // eslint-disable-next-line
    is_local: boolean;
    name: string;
    popularity: number;
    // eslint-disable-next-line
    preview_url: string;
    track: boolean;
    // eslint-disable-next-line
    track_number: number;
    type: string;
    uri: string;
}

// Spotify API Track embedded with metadata
export interface SpotifyTrackMetadata {
    // eslint-disable-next-line
    added_at: Date;
    // eslint-disable-next-line
    added_by: SpotifyAddedBy;
    // eslint-disable-next-line
    is_local: boolean;
    // eslint-disable-next-line
    primary_color?: any;
    track: SpotifyTrack;
    // eslint-disable-next-line
    video_thumbnail: SpotifyVideoThumbnail;
}

// Playlist Model
export interface SpotifyPlaylist {
    collaborative: boolean;
    description: string;
    id: string;
    images: SpotifyImage[];
    name: string;
    owner: SpotifyOwner;
    // eslint-disable-next-line
    primary_color?: any;
    public: boolean;
    tracks: Array<SpotifyTrackMetadata>;
    // eslint-disable-next-line
    snapshot_id: any;
    // eslint-disable-next-line
    external_urls: SpotifyExternalUrls;
    href: string;
    type: string;
    uri: string;
}

// Spotify API Response for /playlists
export interface SpotifyGetPlaylistResponse {
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
    href: string;
    items: SpotifyTrackMetadata[];
    limit: number;
    next?: string;
    offset: number;
    previous?: string;
    total: number;
}

// Spotify API Response for /artists
export interface SpotifyArtistResponse {
    artists: Array<SpotifyArtist>;
}

// Spotify API Response for /artists
export interface SpotifyAuthResponse {
    // eslint-disable-next-line
    access_token: string;
    // eslint-disable-next-line
    refresh_token: string;
}
