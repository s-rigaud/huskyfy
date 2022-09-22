import { RemovableRef, useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

export type UserState = {
  id: RemovableRef<string>;
  username: RemovableRef<string>;
  profilePicture: RemovableRef<string>;
  isPremium: RemovableRef<boolean>;
  country: RemovableRef<string>;
  connected: RemovableRef<boolean>;
  locale: RemovableRef<string>;
}

// All infos about the user
export const useUserStore = defineStore('user', {
  state: () => ({
    id: useStorage('id', ''),
    username: useStorage('username', ''),
    profilePicture: useStorage('profilePicture', ''),
    isPremium: useStorage('isPremium', false),
    country: useStorage('country', ''),
    connected: useStorage('connected', false),
    locale: useStorage('locale', 'en')
  } as UserState),
  actions: {
    reset () {
      // Manually update state as local storage and states are linked now
      this.id = ''
      this.username = ''
      this.profilePicture = ''
      this.isPremium = false
      this.country = ''
      this.connected = false
      // Do not reset locale
    }
  }
})
