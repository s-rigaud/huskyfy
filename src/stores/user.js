import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => {
        // All infos about the user account
        return {
            id: '',
            username: '',
            profilePicture: '',
            isPremium: false,
            mail: '',
            country: '',
            connected: false,
        }
    },
})