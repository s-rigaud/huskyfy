import request from '../request'

const APP_ID = '0c26ab311d744f8faae1f5c8ccc4ae21'

export default {
  async getAppStats () {
    await request.get(`appstats/${APP_ID}`)
  }
}
