class MockApi {
  constructor () {
    this.resolver = () => {}
  }

  fetch () {
    return {xhr: 123, promise: new Promise(this.resolver)}
  }

  post () {
    return {xhr: 234, promise: new Promise(this.resolver)}
  }

  put () {
    return {xhr: 345, promise: new Promise(this.resolver)}
  }

  del () {
    return {xhr: 456, promise: new Promise(this.resolver)}
  }
}

export default MockApi
