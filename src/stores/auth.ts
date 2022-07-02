import { RemovableRef, useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { LocationQueryValue } from 'vue-router'

type AuthState = {
  stateAuthorizationCode: RemovableRef<string>;
  temporaryToken: RemovableRef<string> | LocationQueryValue[];
  accessToken: RemovableRef<string>;
  refreshToken: RemovableRef<string>;
  codeVerifier:RemovableRef<string>;
  secretCodeChallenge:RemovableRef<string>;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    stateAuthorizationCode: useStorage('stateAuthorizationCode', ''),
    temporaryToken: useStorage('temporaryToken', ''),
    accessToken: useStorage('accessToken', ''),
    refreshToken: useStorage('refreshToken', ''),
    codeVerifier: useStorage('authState', ''),
    secretCodeChallenge: useStorage('authState', '')
  } as AuthState),
  actions: {
    reset () {
      // Manually update state as local storage and states are linked now
      this.stateAuthorizationCode = ''
      this.temporaryToken = ''
      this.accessToken = ''
      this.refreshToken = ''
    }
  }
})
