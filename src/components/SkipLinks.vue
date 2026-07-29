<script lang="ts" setup>
interface SkipLinksProps {
  links: {
    id: string
    text: string
  }[]
}

export type { SkipLinksProps }

defineProps<SkipLinksProps>()

const skipLinkList = useTemplateRef<HTMLElement>('skipLinkList')

defineExpose({
  skipLinkList
})
</script>

<template>
  <div class="fr-skiplinks">
    <nav
      ref="skipLinkList"
      class="fr-container"
      role="navigation"
      aria-label="Accès rapides"
    >
      <ul class="fr-skiplinks__list" role="list">
        <li v-for="link of links" :key="link.id">
          <a class="fr-link" :href="`#${link.id}`">
            {{ link.text }}
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>
