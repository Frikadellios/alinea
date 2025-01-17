import {Server} from 'alinea/backend'
import {Store, createStore} from 'alinea/backend/Store'
import {exportStore} from 'alinea/cli/util/ExportStore'
import {base64} from 'alinea/core/util/Encoding'
import {CMS, CMSApi} from '../CMS.js'
import {Client} from '../Client.js'
import {Config} from '../Config.js'
import {Connection} from '../Connection.js'
import {Realm} from '../pages/Realm.js'
import {Logger} from '../util/Logger.js'
import {join} from '../util/Paths.js'

export class DefaultDriver extends CMS {
  exportStore(outDir: string, data: Uint8Array): Promise<void> {
    return exportStore(data, join(outDir, 'store.js'))
  }

  async readStore(): Promise<Store> {
    // @ts-ignore
    const {storeData} = await import('@alinea/generated/store.js')
    return createStore(new Uint8Array(base64.parse(storeData)))
  }

  async connection(): Promise<Connection> {
    const devUrl = process.env.ALINEA_DEV_SERVER
    if (devUrl)
      return new Client({
        config: this.config,
        url: devUrl,
        resolveDefaults: {
          realm: Realm.Published
        }
      })
    const store = await this.readStore()
    return new Server(
      {
        config: this.config,
        store,
        media: undefined!,
        target: undefined!,
        previews: undefined!
      },
      {logger: new Logger('CMSDriver')}
    )
  }
}

export function createCMS<Definition extends Config>(
  config: Definition
): Definition & CMSApi {
  return new DefaultDriver(config) as any
}
