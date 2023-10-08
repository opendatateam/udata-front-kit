import { marked } from "marked";
import { stripHtml } from "string-strip-html";

/**
 * Parse description from markdown to HTML
 *
 * @param {ref} ref
 */
export const descriptionFromMarkdown = (ref, attr = "description") => {
  if (ref.value?.description) {
    return marked.parse(ref.value[attr], { mangle: false, headerIds: false });
  }
};

/**
 * Strip HTML tags from markdown
 *
 * @param {string} value
 * @returns {string}
 */
export const stripFromMarkdown = (value) => {
  const html = marked.parse(value, { mangle: false, headerIds: false });
  return stripHtml(html).result;
};
