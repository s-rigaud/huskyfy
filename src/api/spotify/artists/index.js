import request from "./../request";

// Chunk list into smaller lists
function chunkArray(myArray, chunkSize) {
    let results = [];
    while (myArray.length) {
        results.push(myArray.splice(0, chunkSize));
    }
    return results;
}

export default {
    /* Spotify only returns a maximum of 50 artist detail at a time */
    async getMultipleArtists(artistIds) {
        const artists = []
        for (const artistIdsChunk of chunkArray(artistIds, 50)) {
            const ids = artistIdsChunk.join(",")
            let response = await request.get(`artists`, { params: { ids } });
            artists.push(...response.data.artists)
        }
        return artists;
    },
};
