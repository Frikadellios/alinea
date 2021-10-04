import {docFromEntry, Draft, Entry, InputPath, Outcome} from '@alinea/core'
import {Value} from '@alinea/core/value/Value'
import {fromUint8Array, toUint8Array} from 'js-base64'
import {Observable} from 'lib0/observable'
import {Room, WebrtcProvider} from 'y-webrtc'
import * as Y from 'yjs'

const ROOT_KEY = 'root'

type Parent = Y.Map<any>

export enum EntryDraftStatus {
  Synced,
  Saving,
  Pending
}

export class EntryDraft extends Observable<'status'> implements Entry {
  public doc: Y.Doc
  private saveTimeout: any = null

  constructor(
    private entry: Entry,
    draft: Draft | null,
    protected saveDraft: (doc: string) => Promise<Outcome<void>>
  ) {
    super()
    this.doc = new Y.Doc()
    if (draft?.doc) Y.applyUpdate(this.doc, toUint8Array(draft.doc))
    else docFromEntry(entry, this.doc)
  }

  connect() {
    const provider = new WebrtcProvider(this.$id, this.doc)
    const watch = (
      update: Uint8Array,
      origin: Room | undefined,
      doc: Y.Doc,
      transaction: Y.Transaction
    ) => {
      if (origin) return
      this.emit('status', [EntryDraftStatus.Pending])
      clearTimeout(this.saveTimeout)
      this.saveTimeout = setTimeout(() => {
        this.saveTimeout = null
        this.emit('status', [EntryDraftStatus.Saving])
        this.saveDraft(fromUint8Array(Y.encodeStateAsUpdate(this.doc))).then(
          () => {
            if (this.saveTimeout === null)
              this.emit('status', [EntryDraftStatus.Synced])
          }
        )
      }, 3000)
    }
    this.doc.on('update', watch)
    return () => {
      provider.destroy()
      this.doc.off('update', watch)
    }
  }

  watchStatus(fun: (status: EntryDraftStatus) => void) {
    this.on('status', fun)
    return () => this.off('status', fun)
  }

  private get root() {
    return this.doc.getMap(ROOT_KEY)
  }

  get $id() {
    return this.root.get('$id') || this.entry.$id
  }

  get $channel() {
    return this.root.get('$channel') || this.entry.$channel
  }

  get title() {
    return this.root.get('title') || this.entry.title
  }

  get(target: Y.Map<any>, path: Array<string>): Parent {
    if (path.length === 0) return target as Parent
    return this.get(target.get(path[0]), path.slice(1))
  }

  getParent<T>(path: InputPath<T>): Parent {
    return this.get(this.root, path.slice(0, -1))
  }

  getInput<T>(path: InputPath<T>, type: Value) {
    const key = path[path.length - 1]
    const parent = this.getParent(path)
    const mutator = Value.mutator(type, parent, key)
    return {
      mutator,
      get value(): T {
        return Value.fromY(parent.get(key))
      },
      observe: Value.watch(type, parent, key)
    }
  }
}
