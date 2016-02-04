import FetchPlease from 'fetch-please'

export default class API {

  /**
   * Constructor
   *
   * @params {Object} options
   * @option {String} host - mandatory
   * @option {String} resource - mandatory
   * @option {String} base - defaults to '/'
   */
  constructor ({
    host = null,
    base = '/',
    resource = ''
  } = {}) {
    if (!host) throw Error('No host given')
    if (!resource) throw Error('No resource given')

    const path = `${host}/${base}/${resource}`

    this.client = new FetchPlease(path)
  }

  fetch (path, params = {}) {
    return this.client.getRequest(path, params)
  }

  post (path, params = {}) {
    return this.client.postRequest(path, params)
  }

  put (path, params = {}) {
    return this.client.putRequest(path, params)
  }

  del (path, params = {}) {
    return this.client.deleteRequest(path, params)
  }
}
