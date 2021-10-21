import * as Y from 'yjs'
import {ListType} from './type/ListType'
import {RecordType} from './type/RecordType'
import {ScalarType} from './type/ScalarType'
import {XmlFragmentType} from './type/XmlFragmentType'

type YType = Y.AbstractType<any>

export interface Type<T = any> {
  toY(value: T): any
  fromY(value: any): T
  watch(parent: YType, key: string): (fun: () => void) => void
  mutator(parent: YType, key: string): any // Todo: infer type
}

export namespace Type {
  export type Mutator<T> = any
  export const Scalar = ScalarType.inst
  export const XmlFragment = XmlFragmentType.inst
  export function List(shapes: Record<string, RecordType<any>>) {
    return new ListType(shapes)
  }
  export function Record(shape: Record<string, Type>) {
    return new RecordType(shape)
  }
}