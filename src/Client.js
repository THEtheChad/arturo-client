import Debug from 'debug'
import nssocket from 'nssocket'

let id = 0
export default class Client {
  constructor(opts) {
    this._opts = Object.assign({
      port: 61681
    }, opts)

    this.uuid = `${this.constructor.name}-${process.pid}-${id++}`
    this.debug = Debug(`arturo:${this.uuid}`)

    this._connection = null
  }

  connection() {
    if (!this._connection) {
      this._connection = new Promise((resolve, reject) => {
        const connection = new nssocket.NsSocket()
        connection.on('error', reject)
        connection.on('close', err => err && reject(err))
        connection.on('timeout', () => connection.close())
        connection.data(['connected'], () => {
          this.debug('connected')
          resolve(connection)
        })
        connection.connect(this._opts.port)
      })
    }

    return this._connection
  }

  async _transmit(method, data) {
    const self = this
    const workers = Client.toArray(data)
    const connection = await this.connection()

    const operations = workers.map(worker => new Promise((resolve, reject) => {

      const successEvent = ['worker', method, 'success']
      connection.data(
        successEvent,
        function onSuccess(result) {
          if (result.route !== worker.route) return
          self.debug(`create worker ${result.route} success!`)
          connection.removeListener(successEvent, onSuccess)
          resolve()
        }
      )

      const errorEvent = ['worker', method, 'error']
      connection.data(
        errorEvent,
        function onError(result) {
          if (result.route !== worker.route) return
          self.debug(`create worker ${result.route} error.`)
          connection.removeListener(errorEvent, onError)
          reject()
        }
      )

      this.debug(`create worker ${worker.route}`)
      connection.send(['worker', method], worker)
    }).catch(err => console.error(err)))

    return Promise.all(operations)
  }

  async addWorker(workers) {
    return this._transmit('create', workers)
  }

  async removeWorker(data) {
    return this._transmit('destroy', workers)
  }

  async destroy() {
    return this.end()
  }

  async end() {
    const connection = await this.connection()
    connection.end()
  }

  static toArray(data) {
    return Array.isArray(data) ? data : [data]
  }
}