import Reducer from './reducer'

/**
 * Configure and return a duck object
 *
 * @param {API} client
 * @param {Object} options
 * @option {Array<String>} indexes
 */
export default (client, options = {}) => namespace => {
  const RESET = `${namespace}/RESET`
  const SET = `${namespace}/SET`
  const PATCH = `${namespace}/PATCH`
  const REQUEST = `${namespace}/REQUEST`
  const ERROR = `${namespace}/ERROR`
  const ADD = `${namespace}/ADD`
  const REMOVE = `${namespace}/REMOVE`

  const INITIAL_STATE = {
    resources: [],
    cid: 'c0',
    request: null,
    error: null
  }

  const indexes = options.indexes || []

  return {
    reducer (state = INITIAL_STATE, action = null) {
      const reducer = new Reducer(state, indexes)

      switch (action.type) {
        case RESET:
          return reducer.reset(action.resources)
        case REQUEST:
          return reducer.request(action.request, action.id)
        case ERROR:
          return reducer.error(action.error, action.id)
        case SET:
          return reducer.set(action.attributes, action.id)
        case PATCH:
          return reducer.patch(action.attributes, action.id)
        case ADD:
          return reducer.add(action.attributes)
        case REMOVE:
          return reducer.remove(action.id)
        default:
          return state
      }
    },

    reset (resources) {
      return {type: RESET, resources}
    },

    request (request, id = null) {
      return {type: REQUEST, request, id}
    },

    error (error, id = null) {
      return {type: ERROR, error, id}
    },

    set (attributes, id = null) {
      return {type: SET, attributes, id}
    },

    patch (attributes, id) {
      return {type: PATCH, attributes, id}
    },

    add (attributes) {
      return {type: ADD, attributes}
    },

    remove (id) {
      return {type: REMOVE, id}
    },

    // Server Sync

    fetch () {
      return (dispatch, _getState) => {
        const label = 'fetching'
        const { xhr, promise } = client.fetch('')

        dispatch(this.request({label, xhr}))

        return promise
          .then(data => {
            dispatch(this.request(null))
            dispatch(this.set(data))
          })
          .catch(error => {
            dispatch(this.request(null))
            dispatch(this.error({label, error}))
          })
      }
    },

    /**
     * Saves a new resource to the server
     *
     * @param {Object} attributes
     * @param {Object} options
     * @option {Boolean} optimistic
     */
    create (attributes, {optimistic = true} = {}) {
      return (dispatch, _getState) => {
        let cid
        const label = 'creating'
        const { xhr, promise } = client.post('', attributes)

        if (optimistic) {
          cid = dispatch(this.add(attributes)).cid

          dispatch(this.request({label, xhr}, cid))
        }

        return promise
          .then(data => {
            if (optimistic) {
              dispatch(this.set(data, cid))
              dispatch(this.request(null, cid))
            } else {
              dispatch(this.add(data))
            }
          })
          .catch(error => {
            if (optimistic) {
              dispatch(this.remove(cid))
            }
            dispatch(this.error({label, error}))
          })
      }
    },

    /**
     * Updates a given resource to the server
     *
     * @param {Object} attributes
     * @param {Integer} id
     * @param {Object} options
     * @option {Boolean} optimistic
     */
    update (
      attributes,
      id,
      {
        optimistic = true,
        patch = false
      } = {}
    ) {
      return (dispatch, getState) => {
        const label = 'updating'
        const { xhr, promise } = client.put(`/${id}`, attributes)

        if (optimistic) {
          const action = patch ? 'patch' : 'set'
          dispatch(this[action](attributes, id))
        }

        dispatch(this.request({label, xhr}, id))

        return promise
          .then(data => {
            dispatch(this.request(null, id))
            dispatch(this.set(data, id))
          })
          .catch(error => {
            dispatch(this.request(null, id))
            dispatch(this.error({label, error}, id))
          })
      }
    },

    /**
     * Destroy a given resource on the server
     *
     * @param {Integer} id
     * @param {Object} options
     * @option {Boolean} optimistic
     */
    destroy (id, {optimistic = true} = {}) {
      return (dispatch, _getState) => {
        const label = 'destroying'
        const { promise, xhr } = client.del(`/${id}`)

        if (optimistic) {
          dispatch(this.remove(id))
        } else {
          dispatch(this.request({label, xhr}, id))
        }

        return promise
          .then(() => {
            if (!optimistic) {
              dispatch(this.remove(id))
            }
          })
          .catch(error =>
            dispatch(this.error({label, error}))
          )
      }
    }
  }
}
