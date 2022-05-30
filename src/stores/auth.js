import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useAuthStore = defineStore('auth', {
    state: () => {
        // All state info necessary to log in
        return {
            temporaryToken: useStorage('temporaryToken', ''),
            accessToken: useStorage('accessToken', ''),
            refreshToken: useStorage('refreshToken', ''),
        }
    },
})