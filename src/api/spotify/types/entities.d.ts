// Some models have been simplified as Spotify API
// allows to exclude and filter some fields when querying
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

    filter_enabled: boolean;

    filter_locked: boolean;
}

interface SpotifyOwner {

    display_name: string;

    external_urls: SpotifyExternalUrls;
    href: string;
    id: string;
    type: string;
    uri: string;
}

// Artist Model
export interface SpotifyArtist {
    followers: SpotifyFollowers;
    genres: string[];
    id: string;
    images: SpotifyImage[];
    name: string;
    uri: string;
}

// Profile Model
export interface SpotifyProfile {

    display_name: string;

    explicit_content: SpotifyExplicitContent;

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
    images: SpotifyImage[];
}

// Track Model
export interface SpotifyTrack {
    album: SpotifyAlbum;
    artists: SpotifyArtist[];
    id: string;

    is_local: boolean;
    name: string;

    preview_url: string;
    track: boolean;
    type: string;
    uri: string;
    duration_ms: number;

    // Fields added by Huskyfy
    isIndie: boolean;
    genres: string[];
}

// Spotify API Track embedded with metadata
export interface SpotifyTrackMetadata {

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

    primary_color?: string;
    public: boolean;

    snapshot_id: string;

    external_urls: SpotifyExternalUrls;
    href: string;
    type: string;
    uri: string;
}

export interface SpotifyPlaylist extends _BasePlaylistAttributes {
    tracks: SpotifyTrack[];
    total: number;

    // Only used by Huskyfy
    offset: number;
    containsEpisodes: boolean;
    containsLocalTracks: boolean;
    containsDuplicatedTracks: boolean;
}

export interface SimplifiedSpotifyPlaylist extends _BasePlaylistAttributes {
    tracks: SimplifiedSpotifyTracks;
}
