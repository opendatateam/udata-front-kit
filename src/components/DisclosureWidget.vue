<script lang="ts" setup>
import type { DatasetProperties, DatasetsGroups } from '@/model/topic'
import { isAvailable } from '@/utils/bouquet'
import { NO_GROUP } from '@/utils/bouquetGroups'
import { getRandomId } from '@gouvminint/vue-dsfr'

const props = defineProps({
  groupName: {
    type: String,
    required: true
  },
  allGroups: {
    type: Object as () => DatasetsGroups,
    required: true
  },
  datasetsProperties: {
    type: Object as () => DatasetProperties[],
    required: true
  },
  headingLevel: {
    type: String,
    default: 'h3'
  }
})

const newGroupName: Ref<string> = ref(props.groupName)
const inputErrors: Ref<string[]> = ref([])

const isDisclosure = computed(() => props.groupName !== NO_GROUP)

const emit = defineEmits<{
  (e: 'editGroupName', oldGroupeName: string, newGroupeName: string): void
  (e: 'deleteGroup', groupeName: string): void
}>()

const isDisclosureOpen: Ref<boolean> = ref(!isDisclosure.value)
const toggleDisclosure = () => {
  isDisclosureOpen.value = !isDisclosureOpen.value
}
const widgetID = getRandomId('disclosure')

const opened = ref(false)
const modalType = ref('')
const modalContent = computed(() => {
  let modalFields = {
    title: '',
    confirmLabel: '',
    color: '',
    action: () => {}
  }
  switch (modalType.value) {
    case 'edit':
      modalFields = {
        title: `Renommer le regroupement ${props.groupName}`,
        confirmLabel: 'Valider',
        color: '',
        action: onValidateEdit
      }
      break
    case 'delete':
      modalFields = {
        title: `Supprimer le regroupement ${props.groupName}`,
        confirmLabel: 'Supprimer',
        color: '--background-flat-error',
        action: onDelete
      }
      break
  }
  return modalFields
})

const openModal = (type: string) => {
  modalType.value = type
  opened.value = true
}

const onValidateEdit = () => {
  // check if new group name already exists
  if (props.allGroups.has(newGroupName.value)) {
    inputErrors.value.push('Ce nom de regroupement existe déjà.')
  } else if (newGroupName.value && props.groupName !== newGroupName.value) {
    emit('editGroupName', props.groupName, newGroupName.value)
    opened.value = false
  }
}

const onDelete = () => {
  emit('deleteGroup', props.groupName)
}
const resetForm = () => {
  opened.value = false
  newGroupName.value = props.groupName
  inputErrors.value = []
}

const actions = computed(() => {
  return [
    {
      label: 'Annuler',
      tertiary: true,
      onClick() {
        resetForm()
      }
    },
    {
      label: modalContent.value.confirmLabel,
      onClick() {
        modalContent.value.action()
      }
    }
  ]
})
</script>

<template>
  <div class="disclosure">
    <div class="disclosure__header">
      <template v-if="isDisclosure">
        <button
          class="disclosure__trigger"
          :aria-expanded="isDisclosureOpen"
          :aria-controls="widgetID"
          @click.prevent="toggleDisclosure"
        >
          <span class="disclosure__btn disclosure__marker">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path
                fill="#3458A2"
                fill-rule="evenodd"
                d="m8 7.219-3.3 3.3-.942-.943L8 5.333l4.243 4.243-.943.943-3.3-3.3Z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          <span class="fr-sr-only">ouvrir le regroupement</span>
          <span class="disclosure__name fr-text--lg">{{ groupName }}</span>
        </button>
        <div class="disclosure__actions">
          <button class="disclosure__btn" @click="openModal('edit')">
            <span class="fr-sr-only fr-text--sm"
              >éditer le regroupement {{ groupName }}</span
            >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path
                fill="#3458A2"
                fill-rule="evenodd"
                d="m4.276 10.667 6.761-6.762-.942-.942-6.762 6.761v.943h.943ZM4.829 12H2V9.171l7.623-7.623c.26-.26.683-.26.943 0l1.886 1.886c.26.26.26.682 0 .943L4.829 12ZM2 13.333h12v1.334H2v-1.334Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <button class="disclosure__btn" @click="openModal('delete')">
            <span class="fr-sr-only fr-text--sm"
              >supprimer le regroupement {{ groupName }}</span
            >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="none"
              aria-hidden="true"
              viewBox="0 0 32 32"
            >
              <path
                fill="#3458A2"
                fill-rule="evenodd"
                d="M12.665 10.667V9.334h6.667v1.333h3.333V12h-1.333v10a.667.667 0 0 1-.667.667h-9.333a.667.667 0 0 1-.667-.667V12H9.332v-1.333h3.333ZM12 12v9.334h8V12h-8Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </template>
      <p v-else class="simple__name fr-text--lg">
        {{ groupName }}
      </p>
    </div>
    <div
      v-show="isDisclosureOpen"
      :id="widgetID"
      :class="[{ isVisible: isDisclosureOpen }, 'disclosure__content']"
    >
      <ul role="list" class="fr-m-0 fr-p-0">
        <li v-for="(dataset, index) in datasetsProperties" :key="index">
          <div class="dataset__header fr-px-2w fr-py-3v">
            <slot name="datasetTitle">
              <component :is="headingLevel" class="dataset__title">
                {{ dataset.title }}
              </component>
            </slot>
            <div v-if="$slots.datasetActions" class="dataset__actions">
              <DsfrTag
                v-if="
                  !isAvailable(dataset.availability) ||
                  dataset.remoteDeleted ||
                  dataset.remoteArchived
                "
                class="uppercase bold fr-text--xs fr-mr-2w"
                label="Non disponible"
              />
              <slot name="datasetActions" :dataset="dataset" :index="index" />
            </div>
          </div>
          <div v-if="$slots.datasetContent" class="dataset__content">
            <slot name="datasetContent" :dataset="dataset" />
          </div>
        </li>
      </ul>
    </div>
    <Teleport to="body">
      <DsfrModal
        v-model:opened="opened"
        :title="modalContent.title"
        :class="['modal-group', `modal-${modalType}`]"
        :style="{ '--modal-confirm-button-bg': `var(${modalContent.color})` }"
        size="lg"
        @close="resetForm"
      >
        <div v-if="modalType === 'edit'" class="form fr-input-group">
          <DsfrInput
            v-model="newGroupName"
            label="Nom du regroupement"
            label-visible
            :aria-invalid="inputErrors.length ? true : undefined"
            :description-id="inputErrors.length ? 'errors-name' : undefined"
            @keypress.prevent.enter="onValidateEdit"
          />
          <div v-if="inputErrors.length" id="errors-name" class="error">
            <p v-for="(error, index) in inputErrors" :key="index">
              <span class="fr-icon-error-fill" aria-hidden="true" />
              {{ error }}
            </p>
          </div>
        </div>
        <div v-else-if="modalType === 'delete'">
          <p>
            Ce regroupement contient un ou plusieurs jeux de données. En
            confirmant la suppression,
            <strong>
              tous les jeux de données associés seront retirés du bouquet.
            </strong>
          </p>
          <p>Êtes-vous sûr de vouloir supprimer ce regroupement&nbsp;?</p>
        </div>
        <slot name="footer">
          <DsfrButtonGroup
            align="right"
            :buttons="actions"
            inline-layout-when="large"
          />
        </slot>
      </DsfrModal>
    </Teleport>
  </div>
</template>

<style scoped>
.disclosure {
  --padding-base: 1rem;
  --icon-size: 32px;
  container-type: inline-size;
  container-name: disclosure;
}
.disclosure__header,
.disclosure__trigger,
.disclosure__actions,
.dataset__actions {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--padding-base) / 2);
}

.disclosure__header {
  flex-wrap: wrap;
  gap: 0;
}
.disclosure__header {
  --text-spacing: 0;
  border-block-end: 1px solid var(--border-default-grey);
}
.disclosure__trigger,
.simple__name {
  padding: calc(var(--padding-base) / 2);
  flex-grow: 1;
  align-items: start;
  text-align: left;
}
.disclosure__name,
.simple__name {
  flex: 1 1 auto;
  align-self: center;
  font-weight: 500;
}
.disclosure__btn,
.dataset__actions :where(button, :deep(button)) {
  block-size: var(--icon-size);
  inline-size: var(--icon-size);
  box-shadow: inset 0 0 0 1px var(--blue-cumulus-sun-368-moon-732);
}
.disclosure__btn {
  flex: 0 0 var(--icon-size);
  display: grid;
  place-content: center;
  /* border: 1px solid var(--blue-cumulus-sun-368-moon-732); */
  border-radius: 40px;
}
.disclosure__marker svg {
  rotate: 0deg;
  transition: rotate 0.4s ease;
}
.disclosure__actions,
.dataset__actions {
  margin-inline-start: auto;
}
.disclosure__actions {
  padding-block: calc(var(--padding-base) / 2);
  padding-inline: calc(var(--padding-base) / 2) var(--padding-base);
}
.disclosure__content.isVisible {
  padding-block: var(--padding-base);
}
.disclosure__content ul > li + li {
  margin-block-start: var(--padding-base);
}
.disclosure__content ul > li {
  background: var(--background-default-grey-hover);
}
.disclosure__trigger[aria-expanded='true'] .disclosure__marker > svg {
  rotate: 180deg;
}

/* DATASETS */
.dataset__header {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: var(--background-action-low-blue-france);
}
.dataset__title {
  padding: 0;
  margin: 0;
  font-weight: 500;
  font-size: 1.1rem;
}

.fr-tag {
  color: var(--purple-glycine-sun-319-moon-630, #6e445a);
  background-color: var(--purple-glycine-950-100, #fee7fc);
  border-radius: 0;
}
.dataset__content {
  padding-block: var(--padding-base) calc(var(--padding-base) / 2);
  padding-inline: calc(var(--padding-base) / 2);
}

/* DESKTOP styles */
@container disclosure (width >= 42rem) {
  .disclosure__content.isVisible {
    padding-inline: var(--padding-base);
  }
  .disclosure__trigger {
    /* half padding on right to harmonize with other icons */
    padding-inline: var(--padding-base) calc(var(--padding-base) / 2);
    padding-block: calc(var(--padding-base) * 0.75);
  }
  .disclosure__actions {
    gap: var(--padding-base);
  }
  .dataset__content {
    padding-inline: var(--padding-base);
  }
}

/* MODAL */
.modal-group :deep(h1) {
  font-size: clamp(1.375rem, 1.3319rem + 0.2155vw, 1.5rem);
}
.modal-group form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-delete :deep(.fr-btns-group :last-child button) {
  background-color: var(--modal-confirm-button-bg);
}
</style>
