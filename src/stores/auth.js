import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => {
        // All state info necessary to log in
        return {
            temporaryToken: useStorage('temporaryToken', ''),
            accessToken: useStorage('accessToken', ''),
            refreshToken: useStorage('refreshToken', ''),
        }
    }, actions: {
        reset() {
            // Manually update state as localstorage and states are linked now
            this.temporaryToken = ''
            this.accessToken = ''
            this.refreshToken = ''
        }
    }
})