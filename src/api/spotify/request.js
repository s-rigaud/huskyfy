import api from "@/api";
import { useAuthStore } from "@/stores/modules/auth";
import axios from "axios";

const request = axios.create({
    baseURL: "https://api.spotify.com/v1/"
});

request.interceptors.request.use(function (config) {
    const authStore = useAuthStore()

    if (authStore.accessToken) {
        config.headers.common["Authorization"] = `Bearer ${authStore.accessToken}`;
    }
    return config;
}, null);

// Handle access token refresh somewhere
request.interceptors.response.use(null, async (error) => {
    const { status, data } = error.response;
    const config = error.config;
    console.log(status, data)

    if (error.response && status === 401) {
        let res = await api.spotify.auth.requestNewAccessToken();
        if (res.data.access_token) {
            return request(config);
        }
    }
    return Promise.reject(error)
});

export default request;
