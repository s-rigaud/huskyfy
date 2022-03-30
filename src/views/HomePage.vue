<template>
    <button @click="makeRequest">Connect with Spotify</button>
</template>

<script>
import api from "@/api"
import { useUserStore } from '../stores/modules/user'

export default {
    name: "HomePage",
    setup(){
        const userStore = useUserStore()
        return {userStore}
    },
    methods: {
        async makeRequest(){
            const response = await api.spotify.auth.makeOAuthRequest()
            console.log(response)
        }
    }
}
</script>