import type { Discussion } from '@/model/discussion'
import { build, sequence } from 'mimicry-js'
import { UserFactory } from './users_factory'

export const discussionFactory = build<Discussion>({
  fields: {
    id: sequence((x) => `discussion-${x}`),
    title: sequence((x) => `Sample Discussion ${x}`),
    subject: { class: 'Dataset', id: 'default-subject-id' },
    discussion: [
      {
        content: 'Sample discussion comment',
        posted_by: UserFactory.one(),
        posted_on: '2026-02-10T20:28:06.645000+00:00'
      }
    ]
  }
})
