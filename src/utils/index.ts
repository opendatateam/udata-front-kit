import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { stripHtml } from 'string-strip-html'
import type { Ref } from 'vue'

const markedOptions = {
  gfm: true,
  breaks: true,
  mangle: false,
  headerIds: false
}

/**
 * Parse description from markdown to HTML
 */
export const descriptionFromMarkdown = (ref: Ref, attr = 'description') => {
  if (ref.value?.description) {
    return fromMarkdown(ref.value[attr])
  }
}

/**
 * Parse markdown to HTML
 */
export const fromMarkdown = (value: string | null, inline: boolean = false) => {
  if (!value) return ''
  const fn = inline ? marked.parseInline : marked.parse
  const parsed = fn(value, markedOptions)
  // type cast to string because we don't use async mode of marked
  return DOMPurify.sanitize(parsed as string, {
    ADD_TAGS: [
      'line-chart',
      'bar-chart',
      'pie-chart',
      'scatter-chart',
      'radar-chart',
      'gauge-chart',
      'bar-line-chart',
      'map-chart'
    ],
    ADD_ATTR: [
      'x',
      'y',
      'name',
      'unit-tooltip',
      'selected-palette',
      'databox-id',
      'databox-type'
    ]
  })
}

/**
 * Strip HTML tags from markdown
 */
export const stripFromMarkdown = (value: string) => {
  const html = marked.parse(value, markedOptions)
  // type cast to string because we don't use async mode of marked
  return stripHtml(html as string).result
}

/**
 * Format date
 */
export const formatDate = (dateString: string, short = false) => {
  const date = new Date(dateString)
  const params: Intl.DateTimeFormatOptions = short
    ? {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    : {
        dateStyle: 'full',
        timeStyle: 'short'
      }
  return new Intl.DateTimeFormat('default', params).format(date)
}

/**
 * Basic slugify function. Deletes special characters like numbers or diacritics instead of converting them.
 */
export const basicSlugify = (value: string) => {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '-')
}
