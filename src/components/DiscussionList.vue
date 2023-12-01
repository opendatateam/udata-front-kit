<template>
  <h2 class="fr-mt-4w">Discussions</h2>
  <div v-if="!discussions?.length">
    {{ emptyMessage }}
  </div>
  <DsfrAccordionsGroup>
    <li v-for="(discussion, index) in discussions">
      <DsfrAccordion
        :id="index"
        :title="discussion.title"
        :expanded-id="isExpanded[index]"
        @expand="isExpanded[index] = $event"
      >
        <template #default>
          <ul class="es__comment__container">
            <li v-for="comment in discussion.discussion">
              <div class="es__comment__metadata fr-mb-1v">
                <span class="es__comment__author"
                  >{{ comment.posted_by.first_name }}
                  {{ comment.posted_by.last_name }}</span
                >
                <span class="es__comment__date fr-ml-1v"
                  >le {{ formatDate(comment.posted_on) }}</span
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
import type { Discussion } from '../model'

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
