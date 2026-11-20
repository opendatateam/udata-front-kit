// TODO: use upstream ObjectStatusBadge/DatasetBadge/DataserviceBadge once released in @datagouv/components-next (> 1.5.0)
export type StatusBadge = {
  label: string
  type?: 'error' | 'warning'
}

// same precedence as data.gouv.fr: deleted > archived > private
export const getStatusBadge = (status: {
  deleted: unknown
  archived: unknown
  private: boolean
}): StatusBadge | null => {
  if (status.deleted) return { label: 'Supprimé', type: 'error' }
  if (status.archived) return { label: 'Archivé', type: 'warning' }
  if (status.private) return { label: 'Brouillon' }
  return null
}
