import { AxiosResponse } from 'axios'

import { SpotifyProfile } from '../types/entities'
import request from '../request'

export default {
  /**
   * Return global info about the current logged user
   */
  getUserProfile (): Promise<AxiosResponse<SpotifyProfile, SpotifyProfile>> {
    return request.get('me')
  }
}
