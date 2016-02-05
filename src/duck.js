import Reducer from './reducer'
import { Map, List } from 'immutable'

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

  const indexes = options.indexes || []

  const self = {
    reducer (state = {}, action = null) {
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
          return reducer.initialState()
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

    fetch (params) {
      return (dispatch, _getState) => {
        const label = 'fetching'
        const { xhr, promise } = client.fetch('', params)

        dispatch(self.request({label, xhr}))

        return promise
          .then(data => {
            dispatch(self.request(null))
            dispatch(self.set(data))
          })
          .catch(error => {
            dispatch(self.request(null))
            dispatch(self.error({label, error}))
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
      return (dispatch, getState) => {
        let cid
        const label = 'creating'
        const { xhr, promise } = client.post('', attributes)

        if (optimistic) {
          dispatch(self.add(attributes))
          cid = getState()[namespace].get('cid')

          dispatch(self.request({label, xhr}, cid))
        }

        return promise
          .then(data => {
            if (optimistic) {
              dispatch(self.set(data, cid))
              dispatch(self.request(null, cid))
            } else {
              dispatch(self.add(data))
            }
          })
          .catch(error => {
            if (optimistic) {
              dispatch(self.remove(cid))
            }
            dispatch(self.error({label, error}))
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
      return (dispatch, _getState) => {
        const label = 'updating'
        const { xhr, promise } = client.put(`/${id}`, attributes)

        if (optimistic) {
          const action = patch ? 'patch' : 'set'
          dispatch(self[action](attributes, id))
        }

        dispatch(self.request({label, xhr}, id))

        return promise
          .then(data => {
            dispatch(self.request(null, id))
            dispatch(self.set(data, id))
          })
          .catch(error => {
            dispatch(self.request(null, id))
            dispatch(self.error({label, error}, id))
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
          dispatch(self.remove(id))
        } else {
          dispatch(self.request({label, xhr}, id))
        }

        return promise
          .then(() => {
            if (!optimistic) {
              dispatch(self.remove(id))
            }
          })
          .catch(error =>
            dispatch(self.error({label, error}))
          )
      }
    }
  }

  return self
}
