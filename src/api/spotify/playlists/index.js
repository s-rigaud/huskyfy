import { useUserStore } from "@/stores/modules/user";
import request from "./../request";

export default {
    getUserPlaylists(limit = 10, offset = 0) {
        const userStore = useUserStore();
        // TODO paginate
        console.log(userStore.id)
        return request.get(`users/${userStore.id}/playlists`, {
            params: {
                limit,
                offset
            }
        });
    },
};
