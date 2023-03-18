import { locale } from '@/i18n'
import { RemovableRef, useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

export type UserState = {
  id: RemovableRef<string>;
  username: RemovableRef<string>;
  profilePicture: RemovableRef<string>;
  connected: RemovableRef<boolean>;
  locale: RemovableRef<string>;
}

// All info about the user
export const useUserStore = defineStore('user', {
  state: () => ({
    id: useStorage('user.id', ''),
    username: useStorage('user.username', ''),
    profilePicture: useStorage('user.profilePicture', ''),
    connected: useStorage('user.connected', false),
    locale: useStorage('user.locale', locale)
  } as UserState),
  actions: {
    reset () {
      // Manually update state as local storage and states are linked now
      this.id = ''
      this.username = ''
      this.profilePicture = ''
      this.connected = false
      // Do not reset locale
    }
  }
})
