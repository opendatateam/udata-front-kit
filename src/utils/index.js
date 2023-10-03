import { marked } from "marked"

/**
 * Parse description from markdown to HTML
 *
 * @param {ref} ref
 */
export const descriptionFromMarkdown = (ref, attr = "description") => {
  if (ref.value?.description) {
    return marked.parse(ref.value.description, {mangle: false, headerIds: false})
  }
}
