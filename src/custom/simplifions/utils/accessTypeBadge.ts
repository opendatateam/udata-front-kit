import type { AccessAudience, AccessType } from '@datagouv/components-next'

export type AccessTypeBadge = {
  label: string
  icon: string
  colorClass:
    | 'fr-badge--info'
    | 'fr-badge--success'
    | 'fr-badge--orange-terre-battue'
    | 'fr-badge--green-tilleul-verveine'
}

export function getAccessTypeBadge(
  accessType: AccessType | undefined,
  accessAudiences: Array<AccessAudience> | undefined,
  resourceLabel: 'API' | 'Base de données'
): AccessTypeBadge | null {
  switch (accessType) {
    case 'open':
      return {
        label: `${resourceLabel} ouverte`,
        icon: 'fr-icon-arrow-left-right-line',
        colorClass: 'fr-badge--info'
      }
    case 'open_with_account':
      // Ce statut d'accès n'existe pas pour les bases de données, pas de badge dans ce cas
      return resourceLabel === 'API'
        ? {
            label: `${resourceLabel} ouverte avec compte`,
            icon: 'fr-icon-user-line',
            colorClass: 'fr-badge--info'
          }
        : null
    case 'restricted': {
      const publicActorsAccess = accessAudiences?.find(
        (audience) => audience.role === 'local_authority_and_administration'
      )?.condition

      if (publicActorsAccess === 'yes') {
        return {
          label: `${resourceLabel} restreinte · accessible aux acteurs publics`,
          icon: 'fr-icon-lock-unlock-line',
          colorClass: 'fr-badge--success'
        }
      }

      if (publicActorsAccess === 'under_condition') {
        return {
          label: `${resourceLabel} restreinte · accessible aux acteurs publics sous conditions`,
          icon: 'fr-icon-lock-line',
          colorClass: 'fr-badge--green-tilleul-verveine'
        }
      }

      return {
        label: `${resourceLabel} en accès restreint`,
        icon: 'fr-icon-lock-line',
        colorClass: 'fr-badge--orange-terre-battue'
      }
    }
    default:
      return null
  }
}
