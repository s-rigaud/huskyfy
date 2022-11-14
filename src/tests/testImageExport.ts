import { SpotifyArtist, SpotifyTrack } from "@/api/spotify/types/entities"
import { makeImage, GridSize } from "@/services/playlistImageMaker"
import { usePlaylistsStore } from "@/stores/playlists"
import { range } from "@/utils/functions"

const generateRandomString = (length: number): string => {
    let text = ''
    const possible = 'abcdefghijklmnopqrstuvwxyz123456789 '

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}


export const testImageGeneration_generatePlenty = () => {
    const availableGridSizes: GridSize[] = [2, 3, 4]
    const empiricPopularityBreakpoints = range(0, 100, 10)
    const empiricPlaylistTitleLength = range(0, 40, 7)

    let imageNumber = 0
    for (const gridSize of availableGridSizes) {
        for (const indiePopularity of empiricPopularityBreakpoints) {
            for (const playlistTitleLength of empiricPlaylistTitleLength) {
                const playlistsStore = usePlaylistsStore()

                const playlistId = `test-image-${imageNumber}`
                playlistsStore.playlists[playlistId] = {
                    offset: 0,
                    total: 0,
                    collaborative: false,
                    description: `test-image-${imageNumber}`,
                    id: `test-image-${imageNumber}`,
                    name: generateRandomString(playlistTitleLength),
                    owner: {
                        display_name: "",
                        external_urls: { spotify: "" },
                        href: "",
                        id: "",
                        type: "",
                        uri: "",
                    },
                    public: true,
                    snapshot_id: "snapshot_id",
                    external_urls: { spotify: "" },
                    href: "",
                    type: "",
                    uri: "",
                    images: [],

                    tracks: createFakeTracks(gridSize, indiePopularity),
                }
                makeImage(playlistId, gridSize, true, true, console.error);
            }
        }
    }

}

const createFakeTracks = (gridSize: number, indiePopularity: number): SpotifyTrack[] => {
    const fakeTracks: SpotifyTrack[] = []
    for (let index = 0; index < gridSize ** 2; index++) {
        const currentGeneralIndieScore = fakeTracks.reduce((score, t) => score + +(t.isIndie), 0)

        fakeTracks.push({
            album: { images: [] },
            artists: [generateFakeArtist(index)],
            id: `artist-${index}`,
            is_local: false,
            name: `artist-${index}`,
            preview_url: "",
            track: true,
            type: "track",
            uri: "",
            duration_ms: 35,
            isIndie: currentGeneralIndieScore < indiePopularity,
            genres: ["pop", "groove", "indie", "rock"],
        })
    }
    return fakeTracks
}

const generateFakeArtist = (index: number): SpotifyArtist => {
    return {
        followers: { total: 2 },
        genres: ["pop", "groove", "indie", "rock"],
        id: `artist-${index}`,
        images: [require('@/assets/default_cover.jpg')],
        name: `artist-${index}`,
        uri: "",
    }
}
