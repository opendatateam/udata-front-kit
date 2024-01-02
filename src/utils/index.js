import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { stripHtml } from 'string-strip-html'

/**
 * Parse description from markdown to HTML
 *
 * @param {ref} ref
 */
export const descriptionFromMarkdown = (ref, attr = 'description') => {
  if (ref.value?.description) {
    return fromMarkdown(ref.value[attr])
  }
}

/**
 * Parse markdown to HTML
 *
 * @param {string} value
 */
export const fromMarkdown = (value) => {
  if (!value) return ''
  const parsed = marked.parse(value, { mangle: false, headerIds: false })
  return DOMPurify.sanitize(parsed)
}

/**
 * Strip HTML tags from markdown
 *
 * @param {string} value
 * @returns {string}
 */
export const stripFromMarkdown = (value) => {
  const html = marked.parse(value, { mangle: false, headerIds: false })
  return stripHtml(html).result
}

/**
 * Format date
 *
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('default', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(date)
}
