import type {ComponentType} from 'react'
import {Entry} from './Entry'
import {Field} from './Field'
import {createId} from './Id'
import {Label} from './Label'
import {Section} from './Section'
import {Lazy} from './util/Lazy'
import {LazyRecord} from './util/LazyRecord'
import {Value} from './Value'
import {RecordValue} from './value/RecordValue'

export namespace Type {
  export type Of<T> = T extends Type<infer U> ? U : never
  export type Options = {
    /** Entries can be created as children of this entry */
    isContainer?: boolean
    /** Entries do not show up in the sidebar content tree */
    isHidden?: boolean
    contains?: Array<string>
    icon?: ComponentType
    view?: ComponentType
  }
}

const reserved = new Set(['id', 'type'])

export class Type<T = {}> {
  #fields: Record<string, Lazy<Field>> | undefined

  constructor(
    public label: Label,
    public sections: Array<Section>,
    public options: Type.Options = {}
  ) {}

  get fields() {
    if (this.#fields) return this.#fields
    const res = {}
    for (const section of this.sections)
      if (section.fields) Object.assign(res, Lazy.get(section.fields))
    return (this.#fields = res)
  }

  get valueType(): RecordValue {
    return Value.Record(
      Object.fromEntries(
        [
          ['id', Value.Scalar as Value],
          ['type', Value.Scalar as Value],
          ['workspace', Value.Scalar as Value],
          ['root', Value.Scalar as Value],
          // Todo: this should probably not be part of the schema but local state
          ['$status', Value.Scalar as Value]
        ].concat(
          Array.from(this)
            .filter(([, field]) => field.type)
            .map(([key, field]) => {
              return [key, field.type!]
            })
        )
      )
    )
  }

  [Symbol.iterator]() {
    return LazyRecord.iterate(this.fields)[Symbol.iterator]()
  }

  field(key: string) {
    const field = LazyRecord.get(this.fields, key)
    if (!field)
      throw new Error(`No such field: "${key}" in type "${this.label}"`)
    return field
  }

  empty() {
    return this.valueType.create()
  }

  create(name: string) {
    return {
      ...this.empty(),
      type: name,
      id: createId()
    } as Entry & T
  }

  configure(options: Type.Options) {
    return new Type(this.label, this.sections, {...this.options, ...options})
  }
}

export function type<T extends Array<Section.Input>>(
  label: Label,
  ...sections: T
): Type<Section.FieldsOf<T[number]>> {
  return new Type(label, sections.map(Section.from))
}