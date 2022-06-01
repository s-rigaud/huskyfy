import request from '../request'

export default {
  // Return global info about the current logged user
  getUserProfile (): Promise<any> {
    return request.get('me')
  }
}
