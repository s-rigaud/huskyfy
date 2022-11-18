// Generic interface, each object is a Spotify genre name
// with the number of track of this genre in the specified playlist
export interface Genre {
    name: string;
    cap_name: string;
    count: number;
    percentage: number
}
