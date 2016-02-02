# Resting Ducks

REST conventions for single tree stores.

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

## API

### Constructor

The `Duck` constructor accepts two arguments:

  - `client` an API to interact with your server. You can use
  the one provided by default in `resting-ducks` wich uses [fetch-please](https://github.com/albburtsev/fetch-please)
  for promise and canceleable requests.
  - `options`
    - `indexes` An array of attributes you would like your model indexed by.
    Defaults to `['id']`

### API

Defines how you interact with your server.
Must implement `fetch`, `post`, `put`, and `del`.

Options:

  - `host` Mandatory. The host of your server
  - `resource` Mandatory. The name of your resource
  - `base` Defaults to `/`. The prefix (for instance versioning) of your API

### Actions

**Resting ducks** come with all the common REST actions so you don't
have to re-implement them over and over in your stores.

  - **set** `duck.reset(resources, id|cid = null)`

Replaces the current resources with the given ones.

If a id/cid is given, it applies only to the given resource

  - **request** `duck.request(xhr, id|cid = null)`

The **request** method marks the current duck as having an
ongoing cancelable request. You can use this to represent a loading
transaction and cancel it if needed.

If a id/cid is given, it applies only to the given resource

  - **add** `duck.add(attributes)`

Append a new resource on the duck.

  - **remove** `duck.remove(id|cid)`

Remove a new resource on the duck.

  - **fetch** `duck.fetch()`

Retrieve your models from your server.
It sets a *request* object so you can track progress and cancel
it if needed.

  - **create** `duck.create(attributes, options)`

Send a new resource to your server. The new resource
is optimistically added on the client.
It sets a *request* object so you can track progress and cancel
it if needed.

  - **update** `duck.udpate(attributes, id, options)`

Send new attributes for your resource to your server.
The new attributes are optimistically set on the client.
It sets a *request* object so you can track progress and cancel
it if needed.

Extra options:

  - `patch`: Wether the attributes are a patch or a full representation
  of the resource. Defaults to false.

`TODO` Add support for `PATCH`

  - **destroy** `duck.destroy(id, options)`

Destroy a resource on your server. The resource is optimistically
removed on the client.
It sets a *request* object so you can track progress and cancel
it if needed.

### Options

`create`, `update` and `destroy` are optimistic by default. You can
disable that behaviour passing the `optimistic` flag to false.

## Tree schema

Your tree will have the following schema:

```js
resources: [
  {
    cid: String,
    request: {
      label: String,
      request: Object,
    },
    error: {
      label: String,
      error: Object,
    },
    attributes: Object
  }
]
cid: String,
request: {
  label: String,
  request: Object,
},
error: {
  label: String,
  error: Object,
}
```
