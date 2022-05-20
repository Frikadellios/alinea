import {useMemo} from 'react'
import {useLocation, useMatch} from 'react-router'
import {dashboardNav} from '../DashboardNav'
import {parseRootPath, useRoot} from './UseRoot'

const nav = dashboardNav({})

export function useLocale(): string | undefined {
  const location = useLocation()
  const root = useRoot()
  const match = useMatch(nav.matchRoot)
  return useMemo(() => {
    const {i18n} = root
    if (!i18n) return
    const params: Record<string, string | undefined> = match?.params ?? {}
    const {root: rootKey} = params
    if (rootKey) {
      const fromUrl = parseRootPath(rootKey)[1]
      if (fromUrl && i18n.locales.includes(fromUrl)) return fromUrl
    }
    return root.defaultLocale
  }, [root, location.pathname])
}