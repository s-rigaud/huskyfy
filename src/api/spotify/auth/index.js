import axios from "axios";

const CLIENT_ID = "0c26ab311d744f8faae1f5c8ccc4ae21"
// const CLIENT_SECRET = "144c002f948a438a958b25783f2835fe"

const PARAMS = {
    response_type: "code",
    client_id: CLIENT_ID,
    scope: 'user-read-private user-read-email',
    redirect_uri: "http://localhost:8080",
    state: "22222222222222222222222222222222222222222222222",
}

export default {
    // https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
    makeOAuthRequest() {
        console.log(PARAMS);
        console.log("https://accounts.spotify.com/authorize?response_type=code&client_id=0c26ab311d744f8faae1f5c8ccc4ae21&scope=user-read-private%20user-read-email&redirect_uri=http://localhost:8080")
        axios.get('https://accounts.spotify.com/authorize', {
            params: PARAMS
        }).then(function (response) {
            return response;
        })
    }
};
