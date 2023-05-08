import {Expand} from 'alinea/core'
import type {ComponentType} from 'react'
import {CMS} from './CMS.js'
import {Label} from './Label.js'
import {Root} from './Root.js'
import {getRandomColor} from './util/GetRandomColor.js'

export interface WorkspaceMeta {
  /**
   * Points to a Data.Source by passing a directory, it will be scanned
   * for files.
   */
  source: string
  /** The directory where media files are placed in case a file backend is used */
  mediaDir?: string
  /** The main theme color used in the dashboard */
  color?: string
  icon?: ComponentType
}

export interface WorkspaceData extends WorkspaceMeta {
  label: Label
  roots: Roots
  color: string
}

type Roots = Record<string, Root>

export interface WorkspaceDefinition {
  [key: string]: Root
  [Workspace.Meta]: WorkspaceMeta
}

export type Workspace<T extends Roots = Roots> = T & {
  [Workspace.Data]: WorkspaceData
  [CMS.Link]?: CMS
}

export namespace Workspace {
  export const Data = Symbol.for('@alinea/Workspace.Data')
  export const Meta = Symbol.for('@alinea/Workspace.Meta')

  export function data(workspace: Workspace): WorkspaceData {
    return workspace[Workspace.Data]
  }

  export function roots(workspace: Workspace): Roots {
    return workspace[Workspace.Data].roots
  }

  export function label(workspace: Workspace): Label {
    return workspace[Workspace.Data].label
  }
}

/** Create a workspace */
export function workspace<Definition extends WorkspaceDefinition>(
  /** The name of the workspace */
  label: Label,
  definition: Definition
): Workspace<Expand<Omit<Definition, typeof Workspace.Meta>>> {
  return {
    ...definition,
    [Workspace.Data]: {
      label,
      roots: definition,
      ...definition[Workspace.Meta],
      color:
        definition[Workspace.Meta].color ??
        getRandomColor(JSON.stringify(label))
    }
  }
}

export namespace workspace {
  export const meta: typeof Workspace.Meta = Workspace.Meta
}
