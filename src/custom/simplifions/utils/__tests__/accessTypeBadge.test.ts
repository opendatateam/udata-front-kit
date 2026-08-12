import { describe, expect, it } from 'vitest'
import { getAccessTypeBadge } from '../accessTypeBadge'

describe('getAccessTypeBadge', () => {
  it('returns no badge when access type is undefined', () => {
    expect(getAccessTypeBadge(undefined, undefined, 'API')).toBeNull()
  })

  it('returns an open badge for both resource labels', () => {
    expect(getAccessTypeBadge('open', undefined, 'API')).toMatchObject({
      colorClass: 'fr-badge--info'
    })
    expect(
      getAccessTypeBadge('open', undefined, 'Jeu de données')
    ).toMatchObject({
      colorClass: 'fr-badge--info'
    })
  })

  it('returns an open-with-account badge only for API', () => {
    expect(
      getAccessTypeBadge('open_with_account', undefined, 'API')
    ).toMatchObject({
      colorClass: 'fr-badge--info'
    })
    expect(
      getAccessTypeBadge('open_with_account', undefined, 'Jeu de données')
    ).toBeNull()
  })

  it('returns a success badge when restricted but open to public actors', () => {
    const badge = getAccessTypeBadge(
      'restricted',
      [{ role: 'local_authority_and_administration', condition: 'yes' }],
      'Jeu de données'
    )
    expect(badge).toMatchObject({ colorClass: 'fr-badge--success' })
  })

  it('returns a conditional badge when restricted access is conditional for public actors', () => {
    const badge = getAccessTypeBadge(
      'restricted',
      [
        {
          role: 'local_authority_and_administration',
          condition: 'under_condition'
        }
      ],
      'API'
    )
    expect(badge).toMatchObject({
      colorClass: 'fr-badge--green-tilleul-verveine'
    })
  })

  it('returns a restricted badge when public actors have no access', () => {
    const badge = getAccessTypeBadge(
      'restricted',
      [{ role: 'local_authority_and_administration', condition: 'no' }],
      'API'
    )
    expect(badge).toMatchObject({ colorClass: 'fr-badge--orange-terre-battue' })
  })

  it('returns a restricted badge when no audience information is available', () => {
    const badge = getAccessTypeBadge('restricted', undefined, 'API')
    expect(badge).toMatchObject({ colorClass: 'fr-badge--orange-terre-battue' })
  })
})
