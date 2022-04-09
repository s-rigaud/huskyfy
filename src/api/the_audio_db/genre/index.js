import request from "./../request";

export default {
    async getGenreForArtistAndTrackName(artist, trackName) {
        let response = await request.get(`searchtrack.php?s=${artist}&t=${trackName}`);
        console.log(response);
        const data = response.data
        if (data.track) {
            const genre = response.data.track[0].strGenre
            return (genre != null) ? genre : "data not in API"
        }
        return "Album not found";
    },
};
