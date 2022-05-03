import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => {
        // All state info necessary to log in
        return {
            temporaryToken: '',
            accessToken: '',
            refreshToken: '',
        }
    },
})