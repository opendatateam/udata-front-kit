<script setup lang="ts">
import DiscussionAuthor from '@/components/DiscussionAuthor.vue'
import type { Comment } from '@/model/discussion'
import { formatDate } from '@/utils'

defineProps<{
  comment: Comment
  isProducer: boolean
}>()
</script>

<template>
  <div class="discussion-subtitle">
    <DiscussionAuthor
      :owner="comment.posted_by"
      :organization="comment.posted_by_organization"
    />
    <span class="separator">—</span>
    <time
      :datetime="comment.last_modified_at ?? comment.posted_on"
      class="comment-date"
    >
      {{ comment.last_modified_at ? 'Mis à jour le' : 'Posté le' }}
      {{ formatDate(comment.last_modified_at ?? comment.posted_on, 'medium') }}
    </time>
    <template v-if="isProducer">
      <span class="separator">—</span>
      <DsfrBadge type="info" small no-icon label="Producteur" />
    </template>
  </div>
</template>

<style scoped>
.discussion-subtitle {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  column-gap: 0.5rem;
  row-gap: 0.25rem;
}
.comment-date,
.separator {
  color: #666;
  font-size: 0.75rem;
}
</style>
