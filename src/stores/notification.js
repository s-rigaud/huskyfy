import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
    state: () => {
        return {
            notifications: []
        }
    },
})