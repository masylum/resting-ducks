import { Map, List, fromJS } from 'immutable'

const cid_prefix = 'c__'
const cid_regex = new RegExp(`${cid_prefix}(.*)`)

class Reducer {

  /**
   * Constructor
   *
   * @param {Object} state
   * @param {Array<String>} indexes
   */
  constructor (state, indexes) {
    this.indexes = (indexes || []).concat(['id'])
    this.state = state
  }

  /**
   * Namespaces the cid
   */
  _boxCid (id) {
    return `${cid_prefix}${id}`
  }

  /**
   * Namespaces the cid
   */
  _unboxCid (cid) {
    return parseInt(cid.match(cid_regex)[1], 10)
  }

  /**
   * Wether the given id is a cid
   */
  _isCid (id) {
    return cid_regex.test(id)
  }

  _recalculateIndexes (state) {
    let indexes = Map()

    for (const index of this.indexes) {
      indexes = indexes.set(index, Map())
    }

    state.get('resources').forEach((resource) => {
      for (const index of this.indexes) {
        const attr = resource.getIn(['attributes', index])

        if (!attr) break
        const path = [index, attr]
        const resources = indexes.getIn(path) || List()
        indexes = indexes.setIn(path, resources.push(resource))
      }
    })

    return state.merge({indexes})
  }

  initialState () {
    return fromJS(this._recalculateIndexes({
      resources: [],
      cid: 'c0',
      request: null,
      error: null
    }))
  }

  /**
   * Maps an array of attributes to the
   * resource tree shape
   *
   * @param {Integer} cid
   * @param {Array<Object>} attributes
   * @return {Object}
   */
  _serialize (cid, attributes) {
    return attributes.map((a, i) => {
      return fromJS({
        attributes: a,
        cid: this._boxCid(cid + i + 1),
        request: null,
        error: null
      })
    })
  }

  /**
   * Find from id or cid
   *
   * @param {String|Integer} id
   * @return {Maybe<Object>}
   */
  _find (id) {
    let search

    if (this._isCid(id)) {
      search = (r) => r.get('cid') === id
    } else {
      search = (r) => r.getIn(['attributes', 'id']) === id
    }

    return this.state.get('resources').findIndex(search)
  }

  /**
   * Updates the resource on the given id
   *
   * @param {Object} resource
   * @param {String|Integer} id
   * @return {Object}
   */
  _update (resource, id) {
    const index = this._find(id)

    if (index === -1) {
      throw Error(`Error updating resource: The resource with the id "${id}" was not found`)
    }

    const resources = this.state.get('resources')
      .mergeIn([index], resource)

    return this.state.merge({resources: resources})
  }

  /**
   * Sets the resource/s
   *
   * @param {Object} attributes
   * @param {Maybe<String|Integer>} id
   * @return {Object}
   */
  set (attributes, id = null) {
    if (id) {
      return this._recalculateIndexes(this._update({attributes}, id))
    } else {
      return this._recalculateIndexes(this.state.merge({
        cid: this._boxCid(attributes.length),
        resources: this._serialize(0, fromJS([].concat(attributes)))
      }))
    }
  }

  /**
   * Patches the resource
   *
   * @param {Object} attributes
   * @param {Maybe<String|Integer>} id
   * @return {Object}
   */
  patch (attributes, id) {
    const index = this._find(id)

    if (index === -1) {
      throw Error(`Error updating resource: The resource with the id "${id}" was not found`)
    }

    const resource = this.state.getIn(['resources', index])

    return this._recalculateIndexes(
      this._update(
        resource.mergeIn(['attributes'], attributes),
        resource.getIn(['attributes', 'id'])
      )
    )
  }

  /**
   * Marks the resource/s requests
   *
   * @param {Object} request
   * @param {Maybe<String|Integer>} id
   * @return {Object}
   */
  request (request, id = null) {
    if (id) {
      return this._recalculateIndexes(this._update({request}, id))
    } else {
      return this.state.merge({request: request})
    }
  }

  /**
   * Marks the resource/s errors
   *
   * @param {Object} error
   * @param {Maybe<String|Integer>} id
   * @return {Object}
   */
  error (error, id = null) {
    if (id) {
      return this._recalculateIndexes(this._update({error}, id))
    } else {
      return this.state.merge({error: error})
    }
  }

  /**
   * Removes the given resource
   *
   * @param {String|Integer} id
   * @return {Object}
   */
  remove (id) {
    const index = this._find(id)

    if (index === -1) {
      throw Error(`Error removing resource: The resource with the cid "${id}" was not found`)
    }

    return this._recalculateIndexes(this.state.deleteIn(['resources', index]))
  }

  add (attributes) {
    const numCid = this._unboxCid(this.state.get('cid'))
    const resource = this._serialize(numCid, fromJS([attributes]))
    const resources = this.state.get('resources').concat(resource)
    const state = this.state.merge({
      cid: this._boxCid(numCid + 1),
      resources
    })

    return this._recalculateIndexes(state)
  }
}

export default Reducer
