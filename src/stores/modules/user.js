import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => {
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