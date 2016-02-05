# Resting Ducks

REST conventions for single tree stores.

[![Build Status](https://travis-ci.org/masylum/resting-ducks.svg?branch=master)](https://travis-ci.org/masylum/resting-ducks)

![](https://media.giphy.com/media/b9QBHfcNpvqDK/giphy.gif)

## Installation

```
npm install resting-ducks --save
```

## Example

```js
import { Duck, Api} from 'resting-ducks'

const client = new Api({host: 'http://localhost:8000', resource: 'tasks'})
const tasks = Duck(client, {})('myTasks')
const store = createStore(tasks.reducer)

store.dispatch(
  task.create({id: 10, name: 'Clean the windows', resolved: false})
).then(() => {
  task.update({resolved: true}, 10, {patch: true})
})
```

## Immutable

The state is stored using [immutable.js](https://facebook.github.io/immutable-js)

## API

### `Duck`

The constructor accepts two arguments:

  - `client` an API to interact with your server. You can use
  the one provided by default in `resting-ducks` wich uses [fetch-please](https://github.com/albburtsev/fetch-please)
  for promise and canceleable requests.
  - `options`
    - `indexes` An array of attributes you would like your model indexed by.
    Defaults to `['id']`

```js
import { Duck, Api} from 'resting-ducks'

const client = new Api({host: 'http://localhost:8000', resource: 'tasks'})
const tasks = Duck(client, {
  indexes: ['id', 'project_id']
})('myTasks')
const store = createStore(tasks.reducer)
```

### `Api`

Defines how you interact with your server.
Must implement `fetch`, `post`, `put`, and `del`.

Options:

  - `host` Mandatory. The host of your server
  - `resource` Mandatory. The name of your resource
  - `base` Defaults to `/`. The prefix (for instance versioning) of your API

```js
import { Api } from 'resting-ducks'

const client = new Api({
  host: 'http://localhost:3000',
  resource: 'users',
  base: '/v2'
})

const {xhr, promise} = client.fetch()

promise.then((data) => {
  console.log(data)
})

// Timeout of 500ms
setTimeout(() => {
  xhr.abort()
}, 500)
```

### `Duck API`

**Resting ducks** come with all the common *REST* actions so you don't
have to re-implement them over and over in your stores.

### Reducer

##### `reducer(state, action)`

The reducer for your resource. Add this one to your store and you are all set!

### Actions creators

##### `set(resources, id|cid = null)`

Replace the current resources with the given ones.

If a `id`/`cid` is given, it applies only to the given resource

##### `patch(attributes, id|cid)`

Patch the resource with the given attributes.

##### `request({label, xhr}, id|cid = null)`

Marks the current duck as having an
ongoing cancelable request. You can use this to represent a loading
transaction and cancel it if needed.

If a `id`/`cid` is given, it applies only to the given resource

##### `error({label, error}, id|cid = null)`

Marks the current duck as having an
error. You can use this to represent it.

If a `id`/`cid` is given, it applies only to the given resource.

##### `add(attributes)`

Append a new resource on the duck.

##### `remove(id|cid)`

Remove a resource.

##### `fetch()`

Retrieve your models from your server.

It marks the `request` object so you can track progress and cancel
it if needed.

In case of error it marks the `error` object.

##### `create(attributes, options)`

Send a new resource to your server. The new resource
is optimistically added on the client.

It marks the `request` object so you can track progress and cancel
it if needed.

In case of error it marks the `error` object.

##### `udpate(attributes, id, options)`

Send new attributes for your resource to your server.
The new attributes are optimistically set on the client.

It marks the `request` object so you can track progress and cancel
it if needed.

In case of error it marks the `error` object.

Extra options:

  - `patch`: Wether the attributes are a patch or a full representation
  of the resource. Defaults to false.

`TODO` Add support for `PATCH`

##### `destroy(id, options)`

Destroy a resource on your server. The resource is optimistically
removed on the client.

It marks the `request` object so you can track progress and cancel
it if needed.

In case of error it marks the `error` object.

### Options

`create`, `update` and `destroy` are optimistic by default. You can
disable that behaviour passing the `optimistic` flag to `false`.

## Tree schema

Your tree will have the following schema:

```js
resources: [
  {                    // Information at the resource level
    cid: String,       // Client side id. Used for optimistic updates
    request: {         // An ongoing request
      label: String,   // Examples: 'updating', 'creating', 'fetching', 'destroying' ...
      xhr: Object,     // The xhr object. You can abort it with `xhr.abort()`
    },
    error: {           // A failed request
      label: String,   // Examples: 'updating', 'creating', 'fetching', 'destroying' ...
      error: String,   // A string representing the error
    },
    attributes: Object // The resource attributes
  }
]                      // Information at the collection level
cid: String,           // The latest Client id generated
request: {             // An ongoing request
  label: String,       // Examples: 'updating', 'creating', 'fetching', 'destroying' ...
  xhr: Object,         // The xhr object. You can abort it with `xhr.abort()`
},
error: {               // A failed request
  label: String,       // Examples: 'updating', 'creating', 'fetching', 'destroying' ...
  error: Object,       // A string representing the error
}
```

## License

(The MIT License)

Copyright (c) 2016 Pau Ramon <masylum@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
