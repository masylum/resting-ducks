/* globals describe, beforeEach, it, context */
import assert from 'assert'
import Duck from '../src/duck'
import MockApi from './mocks/api'

const error = 'boom!'

describe('Duck', () => {
  let duck
  let state
  let client

  const resolve = (attr) => {
    return () => {
      client.resolver = (resolve) => resolve(attr)
    }
  }

  const reject = () => {
    client.resolver = (_resolve, reject) => reject(error)
  }

  beforeEach(() => {
    const resources = [{
      cid: 'c1',
      attributes: {a: 'b', id: 10},
      request: null,
      error: null
    }]

    state = {
      resources,
      request: null,
      error: null,
      indexes: {id: {10: resources}},
      cid: 'c1'
    }

    client = new MockApi()
    duck = Duck(client, {})('active_tasks')
  })

  const dispatch = (action) => {
    if (typeof action === 'function') {
      return action(dispatch, () => state)
    } else {
      state = duck.reducer(state, action)
      return state
    }
  }

  describe('set', () => {
    context('when including an id', () => {
      context('and the resource is not found', () => {
        it('throws an error', () => {
          assert.throws(() => { dispatch(duck.set({a: 'c'}, 999)) })
        })
      })

      context('and the resource is found', () => {
        it('updates the resource', () => {
          const attributes = {a: 'c', id: 11}
          const resource = {
            cid: 'c1',
            attributes,
            request: null,
            error: null
          }

          assert.deepEqual(dispatch(duck.set(attributes, 10)), {
            resources: [resource],
            indexes: {id: {11: [resource]}},
            request: null,
            error: null,
            cid: 'c1'
          })
        })
      })
    })

    context('when a cid was not given', () => {
      it('sets the resources', () => {
        const attributes = {b: 'c', id: 15}
        const resource = {
          attributes,
          cid: 'c1',
          request: null,
          error: null
        }

        assert.deepEqual(dispatch(duck.set([attributes])), {
          resources: [resource],
          indexes: {id: {15: [resource]}},
          cid: 'c1',
          request: null,
          error: null
        })
      })
    })
  })

  describe('patch', () => {
    context('and the resource is not found', () => {
      it('throws an error', () => {
        assert.throws(() => { dispatch(duck.patch({a: 'c'}, 999)) })
      })
    })

    context('and the resource is found', () => {
      it('patches the resource', () => {
        const attributes = {b: 'c', id: 11}
        const resource = {
          cid: 'c1',
          attributes: {a: 'b', b: 'c', id: 11},
          request: null,
          error: null
        }

        assert.deepEqual(dispatch(duck.patch(attributes, 10)), {
          resources: [resource],
          indexes: {id: {11: [resource]}},
          request: null,
          error: null,
          cid: 'c1'
        })
      })
    })
  })

  describe('request', () => {
    context('when a id is given', () => {
      context('and the resource is not found', () => {
        it('throws an error', () => {
          assert.throws(() => { dispatch(duck.request({a: 'c'}, 999)) })
        })
      })

      context('and the resource is found', () => {
        it('updates the resource', () => {
          const request = {label: 'foo', xhr: 123}
          const resource = {
            cid: 'c1',
            request,
            error: null,
            attributes: {a: 'b', id: 10}
          }

          assert.deepEqual(dispatch(duck.request(request, 10)), {
            resources: [resource],
            indexes: {id: {10: [resource]}},
            request: null,
            error: null,
            cid: 'c1'
          })
        })
      })
    })

    context('when no id is given', () => {
      it('updates the duck', () => {
        const request = {label: 'fooing', xhr: 123}
        const resource = {
          attributes: {a: 'b', id: 10},
          cid: 'c1',
          request: null,
          error: null
        }

        assert.deepEqual(dispatch(duck.request(request)), {
          resources: [resource],
          indexes: {id: {10: [resource]}},
          request,
          error: null,
          cid: 'c1'
        })
      })
    })
  })

  describe('error', () => {
    context('when a id is given', () => {
      context('and the resource is not found', () => {
        it('throws an error', () => {
          assert.throws(() => { dispatch(duck.error({a: 'c'}, 999)) })
        })
      })

      context('and the resource is found', () => {
        it('updates the resource', () => {
          const error = {label: 'foo', xhr: 123}
          const resource = {
            cid: 'c1',
            request: null,
            error,
            attributes: {a: 'b', id: 10}
          }

          assert.deepEqual(dispatch(duck.error(error, 10)), {
            resources: [resource],
            indexes: {id: {10: [resource]}},
            request: null,
            error: null,
            cid: 'c1'
          })
        })
      })
    })

    context('when no id is given', () => {
      it('updates the duck', () => {
        const error = {label: 'fooing', message: 'foo'}
        const resource = {
          attributes: {a: 'b', id: 10},
          cid: 'c1',
          request: null,
          error: null
        }

        assert.deepEqual(dispatch(duck.error(error)), {
          resources: [resource],
          indexes: {id: {10: [resource]}},
          error,
          request: null,
          cid: 'c1'
        })
      })
    })
  })

  describe('remove', () => {
    context('when the resource is not found', () => {
      it('throws an error', () => {
        assert.throws(() => { dispatch(duck.remove(999)) })
      })
    })

    context('when the resource is found', () => {
      it('updates the resource', () => {
        assert.deepEqual(dispatch(duck.remove(10)), {
          resources: [],
          indexes: {id: {}},
          request: null,
          error: null,
          cid: 'c1'
        })
      })
    })
  })

  describe('add', () => {
    it('add the resource to the resources list', () => {
      const resourceA = {
        attributes: {a: 'b', id: 10},
        cid: 'c1',
        request: null,
        error: null
      }
      const attributes = {b: 'c', id: 11}
      const resourceB = {
        attributes,
        cid: 'c2',
        request: null,
        error: null
      }

      assert.deepEqual(dispatch(duck.add(attributes)), {
        resources: [resourceA, resourceB],
        indexes: {id: {10: [resourceA], 11: [resourceB]}},
        request: null,
        error: null,
        cid: 'c2'
      })
    })
  })

  describe('fetch', () => {
    it('sets the current request', () => {
      const resource = {
        attributes: {a: 'b', id: 10},
        cid: 'c1',
        request: null,
        error: null
      }

      dispatch(duck.fetch())
      assert.deepEqual(state, {
        resources: [resource],
        indexes: {id: {10: [resource]}},
        request: {label: 'fetching', xhr: 123},
        error: null,
        cid: 'c1'
      })
    })

    context('when the request is a success', () => {
      beforeEach(resolve([{b: 'c', id: 11}]))

      it('sets the data', () => {
        const resource = {
          attributes: {b: 'c', id: 11},
          cid: 'c1',
          request: null,
          error: null
        }

        return dispatch(duck.fetch()).then(() => {
          assert.deepEqual(state, {
            resources: [resource],
            indexes: {id: {11: [resource]}},
            request: null,
            cid: 'c1',
            error: null
          })
        })
      })
    })

    context('when the request fails', () => {
      beforeEach(reject)

      it('marks the error', () => {
        const resource = {
          attributes: {a: 'b', id: 10},
          cid: 'c1',
          request: null,
          error: null
        }

        return dispatch(duck.fetch()).then(() => {
          assert.deepEqual(state, {
            resources: [resource],
            indexes: {id: {10: [resource]}},
            request: null,
            cid: 'c1',
            error: {label: 'fetching', error}
          })
        })
      })
    })
  })

  describe('create', () => {
    context('when optimistic (default)', () => {
      it('creates the resource with the ongoing request', () => {
        const resourceA = {
          attributes: {a: 'b', id: 10},
          cid: 'c1',
          request: null,
          error: null
        }
        const attributes = {b: 'c', id: 11}
        const resourceB = {
          attributes,
          cid: 'c2',
          request: {label: 'creating', xhr: 234},
          error: null
        }

        dispatch(duck.create(attributes))

        assert.deepEqual(state, {
          resources: [resourceA, resourceB],
          indexes: {id: {10: [resourceA], 11: [resourceB]}},
          request: null,
          error: null,
          cid: 'c2'
        })
      })

      context('and the request is a success', () => {
        let attributes = {c: 'd', id: 11}

        beforeEach(resolve(attributes))

        it('sets the data', () => {
          const resourceA = {
            attributes: {a: 'b', id: 10},
            cid: 'c1',
            request: null,
            error: null
          }
          const resourceB = {
            attributes,
            cid: 'c2',
            request: null,
            error: null
          }

          return dispatch(duck.create({b: 'c', id: 11})).then(() => {
            assert.deepEqual(state, {
              resources: [resourceA, resourceB],
              indexes: {id: {10: [resourceA], 11: [resourceB]}},
              request: null,
              error: null,
              cid: 'c2'
            })
          })
        })
      })

      context('and the request fails', () => {
        beforeEach(reject)

        it('marks the error', () => {
          const resourceA = {
            attributes: {a: 'b', id: 10},
            cid: 'c1',
            request: null,
            error: null
          }

          return dispatch(duck.create({b: 'c', id: 11})).then(() => {
            assert.deepEqual(state, {
              resources: [resourceA],
              indexes: {id: {10: [resourceA]}},
              request: null,
              error: {label: 'creating', error},
              cid: 'c2'
            })
          })
        })
      })
    })

    context('when `optimistic` option is `false`', () => {
      it('sets the ongoing request', () => {
        const resourceA = {
          attributes: {a: 'b', id: 10},
          cid: 'c1',
          request: null,
          error: null
        }
        const attributes = {b: 'c', id: 11}

        dispatch(duck.create(attributes, {optimistic: false}))

        assert.deepEqual(state, {
          resources: [resourceA],
          indexes: {id: {10: [resourceA]}},
          request: null,
          error: null,
          cid: 'c1'
        })
      })

      context('and the request is a success', () => {
        let attributes = {c: 'd', id: 11}

        beforeEach(resolve(attributes))

        it('sets the data', () => {
          const resourceA = {
            attributes: {a: 'b', id: 10},
            cid: 'c1',
            error: null,
            request: null
          }
          const resourceB = {
            attributes,
            cid: 'c2',
            error: null,
            request: null
          }

          return dispatch(duck.create({b: 'c'}, {optimistic: false})).then(() => {
            assert.deepEqual(state, {
              resources: [resourceA, resourceB],
              indexes: {id: {10: [resourceA], 11: [resourceB]}},
              request: null,
              error: null,
              cid: 'c2'
            })
          })
        })
      })

      context('and the request fails', () => {
        beforeEach(reject)

        it('sets the data', () => {
          const resourceA = {
            attributes: {a: 'b', id: 10},
            cid: 'c1',
            error: null,
            request: null
          }

          return dispatch(duck.create({b: 'c'}, {optimistic: false})).then(() => {
            assert.deepEqual(state, {
              resources: [resourceA],
              indexes: {id: {10: [resourceA]}},
              request: null,
              error: {label: 'creating', error},
              cid: 'c1'
            })
          })
        })
      })
    })
  })

  describe('update', () => {
    context('when optimistic (default)', () => {
      context('and patch is disabled', () => {
        it('optimistically updates the resource with the ongoing request', () => {
          const attributes = {b: 'c', id: 10}
          const resource = {
            attributes,
            cid: 'c1',
            request: {label: 'updating', xhr: 345},
            error: null
          }

          dispatch(duck.update(attributes, 10))

          assert.deepEqual(state, {
            resources: [resource],
            indexes: {id: {10: [resource]}},
            request: null,
            error: null,
            cid: 'c1'
          })
        })
      })

      context('and patch is enabled', () => {
        it('optimistically patches the resource with the ongoing request', () => {
          const attributes = {b: 'c', id: 10}
          const resource = {
            attributes: {a: 'b', b: 'c', id: 10},
            cid: 'c1',
            request: {label: 'updating', xhr: 345},
            error: null
          }

          dispatch(duck.update(attributes, 10, {patch: true}))

          assert.deepEqual(state, {
            resources: [resource],
            indexes: {id: {10: [resource]}},
            request: null,
            error: null,
            cid: 'c1'
          })
        })
      })

      context('and the request is a success', () => {
        let attributes = {c: 'd', id: 10}

        beforeEach(resolve(attributes))

        it('sets the data', () => {
          const resource = {
            attributes,
            cid: 'c1',
            request: null,
            error: null
          }

          return dispatch(duck.update({b: 'c', id: 10}, 10)).then(() => {
            assert.deepEqual(state, {
              resources: [resource],
              indexes: {id: {10: [resource]}},
              request: null,
              error: null,
              cid: 'c1'
            })
          })
        })
      })

      context('and the request fails', () => {
        let attributes = {b: 'c', id: 10}

        beforeEach(reject)

        it('marks the error', () => {
          const resource = {
            attributes,
            cid: 'c1',
            request: null,
            error: {label: 'updating', error}
          }

          return dispatch(duck.update(attributes, 10)).then(() => {
            assert.deepEqual(state, {
              resources: [resource],
              indexes: {id: {10: [resource]}},
              request: null,
              error: null,
              cid: 'c1'
            })
          })
        })
      })
    })

    context('when `optimistic` option is `false`', () => {
      it('does not update the resource but marks the ongoing request', () => {
        const attributes = {b: 'c', id: 10}
        const resource = {
          attributes: {a: 'b', id: 10},
          cid: 'c1',
          request: {label: 'updating', xhr: 345},
          error: null
        }

        dispatch(duck.update(attributes, 10, {optimistic: false}))

        assert.deepEqual(state, {
          resources: [resource],
          indexes: {id: {10: [resource]}},
          request: null,
          error: null,
          cid: 'c1'
        })
      })

      context('and the request is a success', () => {
        let attributes = {c: 'd', id: 10}

        beforeEach(resolve(attributes))

        it('sets the data', () => {
          const resource = {
            attributes,
            cid: 'c1',
            request: null,
            error: null
          }

          return dispatch(duck.update({b: 'c', id: 10}, 10, {optimistic: false})).then(() => {
            assert.deepEqual(state, {
              resources: [resource],
              indexes: {id: {10: [resource]}},
              request: null,
              error: null,
              cid: 'c1'
            })
          })
        })
      })

      context('and the request fails', () => {
        beforeEach(reject)

        it('marks the error', () => {
          const resource = {
            attributes: {a: 'b', id: 10},
            cid: 'c1',
            request: null,
            error: {label: 'updating', error}
          }

          return dispatch(duck.update({b: 'c', id: 10}, 10, {optimistic: false})).then(() => {
            assert.deepEqual(state, {
              resources: [resource],
              indexes: {id: {10: [resource]}},
              request: null,
              error: null,
              cid: 'c1'
            })
          })
        })
      })
    })
  })

  describe('destroy', () => {
    context('when optimistic (default)', () => {
      it('optimistically removes the resource with the ongoing request', () => {
        dispatch(duck.destroy(10))

        assert.deepEqual(state, {
          resources: [],
          indexes: {id: {}},
          request: null,
          error: null,
          cid: 'c1'
        })
      })

      context('and the request is a success', () => {
        beforeEach(resolve())

        it('keeps being removed', () => {
          return dispatch(duck.destroy(10)).then(() => {
            assert.deepEqual(state, {
              resources: [],
              indexes: {id: {}},
              request: null,
              error: null,
              cid: 'c1'
            })
          })
        })
      })

      context('and the request fails', () => {
        beforeEach(reject)

        it('marks the error', () => {
          return dispatch(duck.destroy(10)).then(() => {
            assert.deepEqual(state, {
              resources: [],
              indexes: {id: {}},
              request: null,
              error: {label: 'destroying', error},
              cid: 'c1'
            })
          })
        })
      })
    })

    context('when `optimistic` option is `false`', () => {
      it('marks the resource with the ongoing request', () => {
        const resource = {
          attributes: {a: 'b', id: 10},
          cid: 'c1',
          request: {label: 'destroying', xhr: 456},
          error: null
        }

        dispatch(duck.destroy(10, {optimistic: false}))

        assert.deepEqual(state, {
          resources: [resource],
          indexes: {id: {10: [resource]}},
          request: null,
          error: null,
          cid: 'c1'
        })
      })

      context('and the request is a success', () => {
        beforeEach(resolve())

        it('removes the resource', () => {
          return dispatch(duck.destroy(10, {optimistic: false})).then(() => {
            assert.deepEqual(state, {
              resources: [],
              indexes: {id: {}},
              request: null,
              error: null,
              cid: 'c1'
            })
          })
        })
      })

      context('and the request fails', () => {
        beforeEach(reject)

        it('marks the error', () => {
          const resource = {
            attributes: {a: 'b', id: 10},
            cid: 'c1',
            request: {label: 'destroying', xhr: 456},
            error: null
          }

          return dispatch(duck.destroy(10, {optimistic: false})).then(() => {
            assert.deepEqual(state, {
              resources: [resource],
              indexes: {id: {10: [resource]}},
              request: null,
              error: {label: 'destroying', error},
              cid: 'c1'
            })
          })
        })
      })
    })
  })
})
