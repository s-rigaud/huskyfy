// Generic interface, each object is a Spotify genre name
// with the number of track of this genre in the specified playlist
export interface Genre {
    name: string;
    value: number;
    cap_name: string;
}
