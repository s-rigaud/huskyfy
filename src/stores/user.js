import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

// All infos about the user
export const useUserStore = defineStore('user', {
    state: () => ({
        id: '',
        username: '',
        profilePicture: '',
        isPremium: false,
        mail: '',
        country: '',
        connected: false,
        locale: useStorage('locale', 'en')
    })
})