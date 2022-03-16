import {Collection, Store} from '@alinea/store'
import {Home, Page} from '../../.alinea/web'

export function homePageQuery(Home: Collection<Home>) {
  const action = Home.action.each()
  const Action = Page.as('Action')
  return Home.fields.with({
    action: action
      .where(action.type.is('entry'))
      .select({
        url: action
          .join(Action, Action.id.is(action.entry))
          .select(Action.url)
          .first(),
        label: action.label
      })
      .first()
  })
}

export type HomePageProps = Store.TypeOf<ReturnType<typeof homePageQuery>>
