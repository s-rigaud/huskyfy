import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => {
        return {
            login: '',
            mail: '',
            isPremium: true,
        }
    },
})