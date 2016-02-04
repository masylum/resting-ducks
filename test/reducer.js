/* globals describe, beforeEach, it, context */
import assert from 'assert'
import Reducer from '../src/reducer'

describe('Reducer', () => {
  let reducer
  let state

  beforeEach(() => {
    const resource = {
      cid: 'c__1',
      attributes: {a: 'b', id: 10},
      request: null,
      error: null
    }

    state = {
      cid: 'c__1',
      resources: [resource],
      indexes: {id: {10: [resource]}},
      request: null,
      error: null
    }

    reducer = new Reducer(state)
  })

  describe('set', () => {
    context('when including a cid', () => {
      context('and the resource is not found', () => {
        it('throws an error', () => {
          assert.throws(() => { reducer.set({a: 'c'}, 'c999') })
        })
      })

      context('and the resource is found', () => {
        it('updates the resource', () => {
          const resource = {
            cid: 'c__1',
            attributes: {a: 'c', id: 11},
            request: null,
            error: null
          }

          assert.deepEqual(reducer.set({a: 'c', id: 11}, 'c__1'), {
            resources: [resource],
            indexes: {id: {11: [resource]}},
            request: null,
            error: null,
            cid: 'c__1'
          })
        })
      })
    })

    context('when including a id', () => {
      context('and the resource is not found', () => {
        it('throws an error', () => {
          assert.throws(() => { reducer.set({a: 'c'}, 999) })
        })
      })

      context('and the resource is found', () => {
        it('updates the resource', () => {
          const resource = {
            cid: 'c__1',
            attributes: {a: 'c', id: 11},
            request: null,
            error: null
          }

          assert.deepEqual(reducer.set({a: 'c', id: 11}, 10), {
            resources: [resource],
            indexes: {id: {11: [resource]}},
            request: null,
            error: null,
            cid: 'c__1'
          })
        })
      })
    })

    context('when no id is given', () => {
      it('sets the resources', () => {
        const resource = {
          attributes: {b: 'c', id: 10},
          cid: 'c__1',
          request: null,
          error: null
        }

        assert.deepEqual(reducer.set([{b: 'c', id: 10}]), {
          resources: [resource],
          indexes: {id: {10: [resource]}},
          request: null,
          error: null,
          cid: 'c__1'
        })
      })
    })
  })

  describe('patch', () => {
    context('when including a cid', () => {
      context('and the resource is not found', () => {
        it('throws an error', () => {
          assert.throws(() => { reducer.patch({b: 'c'}, 'c999') })
        })
      })

      context('and the resource is found', () => {
        it('patches the resource', () => {
          const resource = {
            cid: 'c__1',
            attributes: {a: 'b', b: 'c', id: 11},
            request: null,
            error: null
          }

          assert.deepEqual(reducer.patch({b: 'c', id: 11}, 'c__1'), {
            resources: [resource],
            indexes: {id: {11: [resource]}},
            request: null,
            error: null,
            cid: 'c__1'
          })
        })
      })
    })

    context('when including a id', () => {
      context('and the resource is not found', () => {
        it('throws an error', () => {
          assert.throws(() => { reducer.patch({a: 'c'}, 999) })
        })
      })

      context('and the resource is found', () => {
        it('updates the resource', () => {
          const resource = {
            cid: 'c__1',
            attributes: {a: 'b', b: 'c', id: 11},
            request: null,
            error: null
          }

          assert.deepEqual(reducer.patch({b: 'c', id: 11}, 10), {
            resources: [resource],
            indexes: {id: {11: [resource]}},
            request: null,
            error: null,
            cid: 'c__1'
          })
        })
      })
    })
  })

  describe('request', () => {
    context('when a cid is given', () => {
      context('and the resource is not found', () => {
        it('throws an error', () => {
          assert.throws(() => { reducer.request({a: 'c'}, 'c999') })
        })
      })

      context('and the resource is found', () => {
        it('updates the resource', () => {
          const resource = {
            cid: 'c__1',
            request: {},
            error: null,
            attributes: {a: 'b', id: 10}
          }

          assert.deepEqual(reducer.request({}, 'c__1'), {
            resources: [resource],
            indexes: {id: {10: [resource]}},
            request: null,
            error: null,
            cid: 'c__1'
          })
        })
      })
    })

    context('when an id is given', () => {
      context('and the resource is not found', () => {
        it('throws an error', () => {
          assert.throws(() => { reducer.request({a: 'c'}, 999) })
        })
      })

      context('and the resource is found', () => {
        it('updates the resource', () => {
          const resource = {
            cid: 'c__1',
            request: {},
            error: null,
            attributes: {a: 'b', id: 10}
          }

          assert.deepEqual(reducer.request({}, 10), {
            resources: [resource],
            indexes: {id: {10: [resource]}},
            request: null,
            error: null,
            cid: 'c__1'
          })
        })
      })
    })

    context('when no id is given', () => {
      it('updates the reducer', () => {
        const resource = {
          attributes: {a: 'b', id: 10},
          cid: 'c__1',
          request: null,
          error: null
        }

        assert.deepEqual(reducer.request({a: 'b'}), {
          resources: [resource],
          indexes: {id: {10: [resource]}},
          request: {a: 'b'},
          error: null,
          cid: 'c__1'
        })
      })
    })
  })

  describe('error', () => {
    context('when a cid is given', () => {
      context('and the resource is not found', () => {
        it('throws an error', () => {
          assert.throws(() => { reducer.error({a: 'c'}, 'c999') })
        })
      })

      context('and the resource is found', () => {
        it('updates the resource', () => {
          const resource = {
            cid: 'c__1',
            request: null,
            error: {},
            attributes: {a: 'b', id: 10}
          }

          assert.deepEqual(reducer.error({}, 'c__1'), {
            resources: [resource],
            indexes: {id: {10: [resource]}},
            request: null,
            error: null,
            cid: 'c__1'
          })
        })
      })
    })

    context('when an id is given', () => {
      context('and the resource is not found', () => {
        it('throws an error', () => {
          assert.throws(() => { reducer.error({a: 'c'}, 999) })
        })
      })

      context('and the resource is found', () => {
        it('updates the resource', () => {
          const resource = {
            cid: 'c__1',
            request: null,
            error: {},
            attributes: {a: 'b', id: 10}
          }

          assert.deepEqual(reducer.error({}, 10), {
            resources: [resource],
            indexes: {id: {10: [resource]}},
            request: null,
            error: null,
            cid: 'c__1'
          })
        })
      })
    })

    context('when no id is given', () => {
      it('updates the reducer', () => {
        const resource = {
          attributes: {a: 'b', id: 10},
          cid: 'c__1',
          request: null,
          error: null
        }

        assert.deepEqual(reducer.error({a: 'b'}), {
          resources: [resource],
          indexes: {id: {10: [resource]}},
          request: null,
          error: {a: 'b'},
          cid: 'c__1'
        })
      })
    })
  })

  describe('remove', () => {
    context('when a cid is given', () => {
      context('and the resource is not found', () => {
        it('throws an error', () => {
          assert.throws(() => { reducer.remove('c999') })
        })
      })

      context('and the resource is found', () => {
        it('updates the resource', () => {
          assert.deepEqual(reducer.remove('c__1'), {
            resources: [],
            indexes: {id: {}},
            request: null,
            error: null,
            cid: 'c__1'
          })
        })
      })
    })

    context('when an id is given', () => {
      context('and the resource is not found', () => {
        it('throws an error', () => {
          assert.throws(() => { reducer.remove(999) })
        })
      })

      context('and the resource is found', () => {
        it('updates the resource', () => {
          assert.deepEqual(reducer.remove(10), {
            resources: [],
            indexes: {id: {}},
            request: null,
            error: null,
            cid: 'c__1'
          })
        })
      })
    })
  })

  describe('add', () => {
    it('add the resource to the resources list', () => {
      const resourceA = {
        attributes: {a: 'b', id: 10},
        cid: 'c__1',
        error: null,
        request: null
      }

      const resourceB = {
        attributes: {b: 'c', id: 10},
        cid: 'c__2',
        error: null,
        request: null
      }

      assert.deepEqual(reducer.add({b: 'c', id: 10}), {
        resources: [resourceA, resourceB],
        indexes: {
          id: {10: [resourceA, resourceB]}
        },
        request: null,
        error: null,
        cid: 'c__2'
      })
    })
  })
})
