import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

// All infos about the user
export const useUserStore = defineStore('user', {
    state: () => ({
        id: useStorage('id', ''),
        username: useStorage('username', ''),
        profilePicture: useStorage('profilePicture', ''),
        isPremium: useStorage('isPremium', false),
        mail: useStorage('mail', ''),
        country: useStorage('country', ''),
        connected: useStorage('connected', false),
        locale: useStorage('locale', 'en')
    }),
    actions: {
        reset() {
            // Manually update state as localstorage and states are linked now
            this.id = ''
            this.username = ''
            this.profilePicture = ''
            this.isPremium = false
            this.mail = ''
            this.country = ''
            this.connected = false
            // Do not reset locale
        },
    }
})