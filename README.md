# arturo-client [![NPM version](https://badge.fury.io/js/arturo-client.svg)](https://npmjs.org/package/arturo-client)

## Installation

```sh
$ yarn add arturo-client
```

## Usage

```js
const ArturoClient = require('arturo-client')

const client = new ArturoClient(port)

async function main(){
  try{
    await client
      .addWorker({route: '/route', path: 'asbolute/path/to/worker'})

    await client
      .removeWorker({route: '/route', path: 'asbolute/path/to/worker'})
  }
  catch(err){
    console.error('Whoopsies!')
  }
}
main()
  .catch(err => { throw err })
```

## License

MIT © [Chad Elliott]()
