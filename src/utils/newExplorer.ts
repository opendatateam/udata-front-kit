import { ref } from 'vue'

// Feature flag for the new resource navigation, shared across consumers and persisted in a cookie (mirrors cdata's own useNewExplorer).

const COOKIE_NAME = 'new_explorer'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function writeCookie(name: string, value: string | null) {
  document.cookie =
    value === null
      ? `${name}=; path=/; max-age=0`
      : `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}`
}

const enabled = ref(readCookie(COOKIE_NAME) === '1')

export function useNewExplorer() {
  function setEnabled(value: boolean) {
    enabled.value = value
    writeCookie(COOKIE_NAME, value ? '1' : null)
  }

  return { enabled, setEnabled }
}
