import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useNotificationStore = defineStore('notification', {
    state: () => {
        return {
            notifications: useStorage("notifications", [])
        }
    },
})