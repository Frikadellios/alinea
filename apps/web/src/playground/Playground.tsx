'use client'

// @ts-ignore
import declarations from '!!raw-loader!./alinea.d.ts.txt'
import Editor, {Monaco} from '@monaco-editor/react'
import * as alinea from 'alinea'
import * as core from 'alinea/core'
import {Field, Type, outcome} from 'alinea/core'
import 'alinea/css'
import {ErrorBoundary} from 'alinea/dashboard/view/ErrorBoundary'
import {Toolbar} from 'alinea/dashboard/view/Toolbar'
import {Viewport} from 'alinea/dashboard/view/Viewport'
import {InputForm, useField} from 'alinea/editor'
import {useForm} from 'alinea/editor/hook/UseForm'
import {InputField} from 'alinea/editor/view/InputField'
import {
  HStack,
  Loader,
  Stack,
  TextLabel,
  Typo,
  VStack,
  fromModule
} from 'alinea/ui'
import {Main} from 'alinea/ui/Main'
import {Pane} from 'alinea/ui/Pane'
import lzstring from 'lz-string'
import Link from 'next/link'
import Script from 'next/script'
import * as React from 'react'
import {useEffect, useRef, useState} from 'react'
import type typescript from 'typescript'
import {useClipboard} from 'use-clipboard-copy'
import {Logo} from '../layout/branding/Logo'
import css from './Playground.module.scss'

const styles = fromModule(css)

const defaultValue = `export default alinea.type('Type', {
  title: alinea.text('Title', {width: 0.5}),
  path: alinea.path('Path', {width: 0.5})
})`

type PreviewTypeProps = {
  type: core.Type
}

function PreviewType({type}: PreviewTypeProps) {
  const state = useRef<any>()
  const form = useForm({type, initialValue: state.current}, [type])
  state.current = form()
  const label = core.Type.label(type)
  return (
    <>
      <Typo.H1>
        <TextLabel label={label} />
      </Typo.H1>

      <InputForm {...form} />
    </>
  )
}

type PreviewFieldProps = {
  field: Field<any, any>
}

function PreviewField({field}: PreviewFieldProps) {
  const input = useField(field, [field])
  return (
    <div style={{margin: 'auto', width: '100%'}}>
      <InputField {...input} />
    </div>
  )
}

function editorConfig(monaco: Monaco) {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    jsx: 'preserve'
  })
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    `declare var alinea: typeof import('alinea').alinea;` + declarations,
    '@types/alinea/index.d.ts'
  )
}

interface SourceEditorProps {
  resizeable: boolean
  code: string
  setCode: (code: string) => void
}

function SourceEditor({resizeable, code, setCode}: SourceEditorProps) {
  const inner = (
    <Editor
      // theme="vs-dark"
      path="alinea.config.tsx"
      defaultLanguage="typescript"
      value={code}
      beforeMount={editorConfig}
      onChange={value => {
        if (value) setCode(value)
      }}
      loading={<Loader absolute />}
    />
  )
  if (!resizeable) return inner
  return (
    <Pane
      id="editor"
      resizable="right"
      defaultWidth={window.innerWidth * 0.5}
      maxWidth={window.innerWidth * 0.8}
      className={styles.root.editor()}
    >
      {inner}
    </Pane>
  )
}

/*const init = esbuild.initialize({
  wasmURL: '/esbuild.wasm'
})*/

const ts = core.trigger<typeof typescript>()

export default function Playground() {
  const [view, setView] = useState<'both' | 'preview' | 'source'>(() => {
    const url = new URL(location.href)
    return (url.searchParams.get('view') as any) || 'both'
  })
  const persistenceId = '@alinea/web/playground'
  const [code, storeCode] = useState<string>(() => {
    const [fromUrl] = outcome(() =>
      lzstring.decompressFromEncodedURIComponent(
        location.hash.slice('#code/'.length)
      )
    )
    if (fromUrl) return fromUrl
    const [fromStorage] = outcome(() =>
      window.localStorage.getItem(persistenceId)
    )
    if (fromStorage) return fromStorage
    return defaultValue
  })
  function setCode(code: string) {
    outcome(() => window.localStorage.setItem(persistenceId, code))
    storeCode(code)
  }
  const [state, setState] = useState<{
    result?: Type | Field<any, any>
    error?: Error
  }>({})
  const clipboard = useClipboard({
    copiedTimeout: 1200
  })
  async function compile(code: string) {
    try {
      const {transpileModule, JsxEmit} = await ts
      const body = transpileModule(code, {
        compilerOptions: {jsx: JsxEmit.React}
      })
      const exec = new Function(
        'require',
        'exports',
        'React',
        'alinea',
        body.outputText
      )
      const exports = Object.create(null)
      const pkgs = {alinea, React}
      const require = (name: string) => pkgs[name]
      exec(require, exports, React, alinea.alinea)
      setState({result: exports.default})
    } catch (error) {
      setState({error})
    }
  }
  function handleShare() {
    window.location.hash =
      '#code/' + lzstring.compressToEncodedURIComponent(code)
    clipboard.copy(window.location.href)
  }
  function handleReset() {
    setCode(defaultValue)
    window.location.hash = ''
  }
  useEffect(() => {
    compile(code)
  }, [code])
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/typescript@5.1.3/lib/typescript.min.js"
        onLoad={() => {
          ts.resolve((window as any).ts)
        }}
      />
      <Viewport
        attachToBody
        contain
        color="#5661E5"
        className={styles.root(view)}
      >
        <Toolbar.Provider>
          {clipboard.copied && (
            <div className={styles.root.flash()}>
              <p className={styles.root.flash.msg()}>URL copied to clipboard</p>
            </div>
          )}
          <VStack style={{height: '100%'}}>
            <HStack style={{height: '100%', minHeight: 0}}>
              {view !== 'preview' && (
                <SourceEditor
                  code={code}
                  setCode={setCode}
                  resizeable={view === 'both'}
                />
              )}

              <div
                style={{
                  position: 'relative',
                  flex: '1 0 0',
                  display: view === 'source' ? 'none' : 'block',
                  overflow: 'auto'
                }}
              >
                <VStack style={{height: '100%'}}>
                  <div className={styles.root.header()}>
                    <Toolbar.Portal />
                  </div>
                  <ErrorBoundary dependencies={[state.result]}>
                    <Main>
                      <Main.Container
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          paddingTop: 0
                        }}
                      >
                        {!state.result ? (
                          state.error && <Loader absolute />
                        ) : Type.isType(state.result) ? (
                          <PreviewType type={state.result} />
                        ) : (
                          <PreviewField field={state.result} />
                        )}
                      </Main.Container>
                    </Main>
                  </ErrorBoundary>
                  {state.error && (
                    <div className={styles.root.errors()}>
                      <VStack gap={20}>
                        <Typo.Monospace as="div">
                          <p>{state.error.message}</p>
                        </Typo.Monospace>
                      </VStack>
                    </div>
                  )}
                </VStack>
              </div>
            </HStack>

            <footer className={styles.root.footer()}>
              <Link href="/" className={styles.root.logo()} target="_top">
                <Logo />
              </Link>
              <button
                className={styles.root.footer.button({
                  active: view === 'source'
                })}
                onClick={() => setView('source')}
              >
                Editor
              </button>
              <button
                className={styles.root.footer.button({
                  active: view === 'preview'
                })}
                onClick={() => setView('preview')}
              >
                Preview
              </button>
              <button
                className={styles.root.footer.button({
                  active: view === 'both'
                })}
                onClick={() => setView('both')}
              >
                Both
              </button>
              <Stack.Center />
              <button
                className={styles.root.footer.button()}
                onClick={handleShare}
              >
                Copy url
              </button>
              {window.top === window.self ? (
                <button
                  className={styles.root.footer.button()}
                  onClick={handleReset}
                >
                  Reset
                </button>
              ) : (
                <a
                  className={styles.root.footer.button()}
                  href={location.href}
                  target="_blank"
                >
                  Open in new tab
                </a>
              )}
            </footer>
          </VStack>
        </Toolbar.Provider>
      </Viewport>
    </>
  )
}
