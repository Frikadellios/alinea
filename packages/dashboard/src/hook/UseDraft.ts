import {useEffect} from 'react'
import {useQuery} from 'react-query'
import {EntryDraft} from '../draft/EntryDraft'
import {useDrafts} from './UseDrafts'
import {useSession} from './UseSession'

export function useDraft(id: string | undefined) {
  const {hub} = useSession()
  const docs = useDrafts()
  const {data: draft, isLoading} = useQuery(
    ['draft', id],
    async () => {
      if (!id) return undefined
      const {type, parents, entry, doc} = await docs.get(id)
      return new EntryDraft(hub, type, entry, parents, doc)
    },
    {
      suspense: true,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )
  useEffect(() => {
    if (id && draft) {
      const cancel = [docs.connect(id, draft.doc), draft.connect()]
      return () => cancel.forEach(c => c())
    }
  }, [draft])
  return {draft, isLoading}
}