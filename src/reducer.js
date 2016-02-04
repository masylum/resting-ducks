import _ from 'lodash'

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
    const indexes = {}

    for (const index of this.indexes) {
      indexes[index] = {}
    }

    for (const resource of state.resources) {
      for (const index of this.indexes) {
        const attr = resource.attributes[index]

        if (!attr) break
        indexes[index][attr] = indexes[index][attr] || []
        indexes[index][attr].push(resource)
      }
    }

    return Object.assign(state, {indexes})
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
      return {
        attributes: a,
        cid: this._boxCid(cid + i + 1),
        request: null,
        error: null
      }
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
      search = (r) => r.cid === id
    } else {
      search = (r) => r.attributes.id === id
    }

    return _.findIndex(this.state.resources, search)
  }

  /**
   * Updates the resource on the given id
   *
   * @param {Object} attributes
   * @param {String|Integer} id
   * @return {Object}
   */
  _update (attributes, id) {
    const new_state = _.clone(this.state)
    const index = this._find(id)

    if (index === -1) {
      throw Error(`Error updating resource: The resource with the id "${id}" was not found`)
    }

    new_state.resources.splice(
      index,
      1,
      Object.assign(new_state.resources[index], attributes)
    )

    return new_state
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
      return this._recalculateIndexes(Object.assign(this.state, {
        cid: this._boxCid(attributes.length),
        resources: this._serialize(0, attributes)
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
    const resource = this.state.resources[this._find(id)]

    attributes = Object.assign(resource.attributes, attributes)

    return this._recalculateIndexes(
      this._update(Object.assign(resource, {attributes}), attributes.id)
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
      return this._update({request}, id)
    } else {
      return Object.assign(this.state, {request})
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
      return this._update({error}, id)
    } else {
      return Object.assign(this.state, {error})
    }
  }

  /**
   * Removes the given resource
   *
   * @param {String|Integer} id
   * @return {Object}
   */
  remove (id) {
    const new_state = _.clone(this.state)
    const index = this._find(id)

    if (index === -1) {
      throw Error(`Error removing resource: The resource with the cid "${id}" was not found`)
    }

    new_state.resources.splice(index, 1)

    return this._recalculateIndexes(new_state)
  }

  add (attributes) {
    const numCid = this._unboxCid(this.state.cid)

    return this._recalculateIndexes(Object.assign(this.state, {
      cid: this._boxCid(numCid + 1),
      resources: [
        ...this.state.resources,
        ...this._serialize(numCid, [attributes])
      ]
    }))
  }
}

export default Reducer
