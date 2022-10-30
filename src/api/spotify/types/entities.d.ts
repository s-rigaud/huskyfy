interface SpotifyExternalUrls {
    spotify: string;
}

interface SpotifyFollowers {
    href?: string;
    total: number;
}

export interface SpotifyImage {
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
    id: string;
    // eslint-disable-next-line
    is_local: boolean;
    name: string;
    // eslint-disable-next-line
    preview_url: string;
    track: boolean;
    type: string;
    uri: string;
    isIndie: boolean;
    genres: string[];
}

// Spotify API Track embedded with metadata
export interface SpotifyTrackMetadata {
    // eslint-disable-next-line
    is_local: boolean;
    track: SpotifyTrack;
}

interface SimplifiedSpotifyTracks {
    href: string;
    total: number;
    items?: string[];
    limit?: number;
    next?: string;
    offset?: number;
    previous?: string;
}

interface _BasePlaylistAttributes {
    collaborative: boolean;
    description: string;
    id: string;
    images: SpotifyImage[];
    name: string;
    owner: SpotifyOwner;
    // eslint-disable-next-line
    primary_color?: string;
    public: boolean;
    // eslint-disable-next-line
    snapshot_id: string;
    // eslint-disable-next-line
    external_urls: SpotifyExternalUrls;
    href: string;
    type: string;
    uri: string;
}

export interface SpotifyPlaylist extends _BasePlaylistAttributes {
    tracks: SpotifyTrack[];
    offset?: number;
    total: number;
}

export interface SimplifiedSpotifyPlaylist extends _BasePlaylistAttributes {
    tracks: SimplifiedSpotifyTracks;
}