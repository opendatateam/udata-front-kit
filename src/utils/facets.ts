import type { FacetBucket, Facets } from '@/model/api'
import type { FilterOption } from '@/model/filter'

/**
 * Parse an organization facet value in the format "org_id|org_name"
 */
export function parseOrganizationFacetValue(raw: string): {
  id: string
  name: string
} | null {
  if (!raw || !raw.includes('|')) {
    return null
  }
  const [id, ...nameParts] = raw.split('|')
  const name = nameParts.join('|') // Handle names containing pipes
  if (!id || !name) {
    return null
  }
  return { id, name }
}

/**
 * Convert facet buckets to FilterOption array
 */
export function facetBucketsToFilterOptions(
  buckets: FacetBucket[],
  parser: (name: string) => { id: string; name: string } | null
): FilterOption[] {
  const options: FilterOption[] = []
  for (const bucket of buckets) {
    if (bucket.name === 'all') continue
    const parsed = parser(bucket.name)
    if (!parsed) continue
    options.push({
      id: parsed.id,
      name: parsed.name,
      count: bucket.count
    })
  }
  return options
}

/**
 * Extract organization options from facets
 */
export function getOrganizationOptionsFromFacets(
  facets: Facets | undefined
): FilterOption[] {
  if (!facets?.organization_id_with_name) {
    return []
  }
  return facetBucketsToFilterOptions(
    facets.organization_id_with_name,
    parseOrganizationFacetValue
  )
}
