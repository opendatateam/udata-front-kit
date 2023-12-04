<template>
  <h2 class="fr-mt-4w">Discussions</h2>
  <div v-if="!discussions?.length">
    {{ emptyMessage }}
  </div>
  <DsfrAccordionsGroup>
    <li v-for="(discussion, index) in discussions">
      <DsfrAccordion
        :id="index.toString()"
        :title="discussion.title"
        :expanded-id="isExpanded[index]"
        @expand="isExpanded[index] = $event"
      >
        <template #default>
          <ul class="es__comment__container">
            <li v-for="comment in discussion.discussion">
              <div class="es__comment__metadata fr-mb-1v">
                <span class="es__comment__author"
                  >{{ comment.postedBy.firstName }}
                  {{ comment.postedBy.lastName }}</span
                >
                <span class="es__comment__date fr-ml-1v"
                  >le {{ formatDate(comment.postedOn) }}</span
                >
              </div>
              <div class="es__comment__content">
                {{ comment.content }}
              </div>
            </li>
          </ul>
        </template>
      </DsfrAccordion>
    </li>
  </DsfrAccordionsGroup>
</template>

<script lang="ts">
import type { Discussion } from '@/model/discussion'

export default {
  name: 'DiscussionList',
  props: {
    discussions: {
      type: Array<Discussion>,
      default: []
    },
    emptyMessage: {
      type: String,
      default: 'Pas de discussion'
    }
  },
  data() {
    return {
      isExpanded: this.discussions.map(() => null)
    }
  },
  methods: {
    formatDate(dateString: string): string {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('default', {
        dateStyle: 'full',
        timeStyle: 'short'
      }).format(date)
    }
  }
}
</script>
