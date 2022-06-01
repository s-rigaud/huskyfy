import { RemovableRef, useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { LocationQueryValue } from 'vue-router'

type AuthState = {
  temporaryToken: RemovableRef<string> | LocationQueryValue[];
  accessToken: RemovableRef<string>;
  refreshToken: RemovableRef<string>;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    temporaryToken: useStorage('temporaryToken', ''),
    accessToken: useStorage('accessToken', ''),
    refreshToken: useStorage('refreshToken', '')
  } as AuthState),
  actions: {
    reset () {
      // Manually update state as localstorage and states are linked now
      this.temporaryToken = ''
      this.accessToken = ''
      this.refreshToken = ''
    }
  }
})
