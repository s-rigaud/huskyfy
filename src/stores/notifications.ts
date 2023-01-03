import { RemovableRef, useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

export const NotificationType = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error'
} as const
export type NotificationType = typeof NotificationType[keyof typeof NotificationType]

type Notification = {
  message: string,
  type: NotificationType
}

type NotificationsState = {
  notifications: RemovableRef<Notification[]>;
}

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: useStorage('notifications', [])
  } as NotificationsState),
  actions: {
    reset () {
      // Manually update state as local storage and states are linked now
      this.notifications = []
    }
  }
})
