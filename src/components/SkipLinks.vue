<script lang="ts" setup>
interface SkipLinksProps {
  links: {
    id: string
    text: string
    ref?: string
  }[]
}

export type { SkipLinksProps }

defineProps<SkipLinksProps>()

const skipLinkList = useTemplateRef<HTMLElement>('skipLinkList')

defineExpose({
  skipLinkList
})

const handleSkipLink = (event: Event, id: string) => {
  event.preventDefault()

  let target: HTMLElement | null = document.getElementById(id)

  if (!target) {
    if (id === 'header-navigation') {
      target = document.querySelector('.fr-nav, nav')
    } else if (id === 'header-select-search') {
      target = document.querySelector(
        '.custom-search input, .fr-search-bar input, input[type="search"]'
      )
    } else if (id === 'main-footer') {
      target = document.querySelector('.fr-footer, footer')
    }
  }

  if (target) {
    const inputElement =
      target.tagName === 'INPUT' ? target : target.querySelector('input')
    const elementToFocus = (inputElement || target) as HTMLElement

    if (
      !['INPUT', 'A', 'BUTTON', 'TEXTAREA'].includes(elementToFocus.tagName)
    ) {
      elementToFocus.setAttribute('tabindex', '-1')
    }

    elementToFocus.scrollIntoView({ behavior: 'instant', block: 'start' })
    elementToFocus.focus({ preventScroll: true })
  }
}
</script>

<template>
  <div class="fr-skiplinks">
    <nav
      ref="skipLinkList"
      class="fr-container"
      role="navigation"
      aria-label="Accès rapides"
    >
      <ul class="fr-skiplinks__list">
        <li v-for="link of links" :key="link.id">
          <a
            class="fr-link"
            :href="`#${link.id}`"
            @click="(e) => handleSkipLink(e, link.id)"
            @keydown.enter="(e) => handleSkipLink(e, link.id)"
          >
            {{ link.text }}
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>
