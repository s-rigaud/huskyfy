import { RemovableRef, useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

export type UserState = {
  id: RemovableRef<string>;
  username: RemovableRef<string>;
  profilePicture: RemovableRef<string>;
  country: RemovableRef<string>;
  connected: RemovableRef<boolean>;
  locale: RemovableRef<string>;
  uri: RemovableRef<string>;
}

// All infos about the user
export const useUserStore = defineStore('user', {
  state: () => ({
    id: useStorage('id', ''),
    username: useStorage('username', ''),
    profilePicture: useStorage('profilePicture', ''),
    country: useStorage('country', ''),
    connected: useStorage('connected', false),
    locale: useStorage('locale', 'en'),
    uri: useStorage('uri', '')
  } as UserState),
  actions: {
    reset () {
      // Manually update state as local storage and states are linked now
      this.id = ''
      this.username = ''
      this.profilePicture = ''
      this.country = ''
      this.connected = false
      this.uri = ''
      // Do not reset locale
    }
  }
})
