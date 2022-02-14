import {createError, isSeparator, slugify} from '@alinea/core'
import {EntryProperty} from '@alinea/dashboard'
import {InputLabel, InputState, useInput} from '@alinea/editor'
import {fromModule} from '@alinea/ui'
import {useState} from 'react'
import {MdLink} from 'react-icons/md'
import {PathField} from './PathField'
import css from './PathInput.module.scss'

const styles = fromModule(css)

export type PathInputProps = {
  state: InputState<string>
  field: PathField
}

export function PathInput({state, field}: PathInputProps) {
  if (!(state instanceof EntryProperty))
    throw createError('State must be an Entry property')
  const {width, from = 'title', help, optional} = field.options
  const [focus, setFocus] = useState(false)
  const [source = ''] = useInput<string>(
    new EntryProperty(state.location.slice(0, -1).concat(from))
  )
  const [value = slugify(source), setValue] = useInput<string>(state)
  const [endsWithSeparator, setEndsWithSeparator] = useState(false)
  const inputValue = (value || '') + (endsWithSeparator ? '-' : '')
  const empty = value === ''
  return (
    <InputLabel
      asLabel
      label={field.label}
      help={help}
      optional={optional}
      width={width}
      focused={focus}
      icon={MdLink}
      empty={empty}
    >
      <input
        className={styles.root.input()}
        type="path"
        value={inputValue}
        onChange={e => {
          const value = e.currentTarget.value
          setEndsWithSeparator(isSeparator(value.charAt(value.length - 1)))
          setValue(slugify(value))
        }}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder={' '}
      />
    </InputLabel>
  )
}