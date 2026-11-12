import type { Discussion } from '@/model/discussion'
import { build, sequence } from 'mimicry-js'
import { UserReferenceFactory } from './users_factory'

export const discussionFactory = build<Discussion>({
  fields: {
    id: sequence((x) => `discussion-${x}`),
    title: sequence((x) => `Sample Discussion ${x}`),
    subject: { class: 'Dataset', id: 'default-subject-id' },
    permissions: { delete: false, edit: false, close: false },
    user: UserReferenceFactory.one(),
    organization: null,
    created: '2026-02-10T20:28:06.645000+00:00',
    closed: null,
    closed_by: null,
    closed_by_organization: null,
    discussion: [
      {
        id: sequence((x) => `comment-${x}`),
        content: 'Sample discussion comment',
        posted_by: UserReferenceFactory.one(),
        posted_by_organization: null,
        posted_on: '2026-02-10T20:28:06.645000+00:00',
        permissions: { delete: false, edit: false }
      }
    ]
  }
})
