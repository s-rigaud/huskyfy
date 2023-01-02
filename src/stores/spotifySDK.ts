import { SpotifyTrack } from '@/api/spotify/types/entities'
import { Spotify } from '@/api/spotify/types/sdk'
import { defineStore } from 'pinia'

export type SDKState = {
    player: Spotify.Player | null;
    isPaused: boolean;
    isActive: boolean;
    currentTrack: SpotifyTrack | null;
}

// All info about the user
export const useSDKStore = defineStore('spotifySDK', {
  state: () => ({
    player: null,
    isPaused: false,
    isActive: false,
    currentTrack: null
  } as SDKState)
})
