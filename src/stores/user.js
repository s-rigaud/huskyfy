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
    })
})