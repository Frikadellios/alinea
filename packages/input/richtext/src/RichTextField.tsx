import {Field, Label, Schema, TextDoc, Value} from '@alinea/core'

export type RichTextOptions<T> = {
  // Allow these blocks to be created between text fragments
  blocks?: Schema<T>
  help?: Label
  optional?: boolean
  inline?: boolean
  initialValue?: string
}

export interface RichTextField<T> extends Field<TextDoc<T>> {
  label: Label
  options: RichTextOptions<T>
}

export function createRichText<T>(
  label: Label,
  options: RichTextOptions<T> = {}
): {
  label: Label
  options: RichTextOptions<T>
} & Field<TextDoc<T>> {
  return {
    type: Value.RichText(options.blocks?.valueTypes),
    label,
    options
  }
}
