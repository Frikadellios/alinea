import {Collection, Store} from '@alineacms/store'
import {Doc, Home, Page, Pages} from '../../.alinea/web'
import {docPageQuery} from './DocPage.query'
import {homePageQuery} from './HomePage.query'
import {layoutQuery} from './layout/Layout.query'

export function pageViewQuery(pages: Pages, Page: Collection<Page>) {
  return {
    layout: layoutQuery(pages, Page),
    entry: Page.type.case(
      {
        Home: homePageQuery(pages, Page as Collection<Home>),
        Doc: docPageQuery(pages, Page as Collection<Doc>)
      },
      Page.fields
    )
  }
}

export type PageViewProps = Store.TypeOf<ReturnType<typeof pageViewQuery>>