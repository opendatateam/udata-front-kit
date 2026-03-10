<script lang="ts" setup>
import type { HeroBloc } from '@datagouv/components-next'

const props = defineProps<{
  modelValue: HeroBloc
  edit: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: HeroBloc]
}>()

const colorOptions: Array<{ value: HeroBloc['color']; label: string }> = [
  { value: 'primary', label: 'Bleu' },
  { value: 'green', label: 'Vert' },
  { value: 'purple', label: 'Violet' }
]

const colorClasses: Record<HeroBloc['color'], string> = {
  primary:
    'fr-background-action-high--blue-france fr-text-inverted--blue-france',
  green: 'fr-background-flat--success fr-text-inverted--success',
  purple: 'fr-background-flat--purple-glycine fr-text-inverted--purple-glycine'
}

const update = (patch: Partial<HeroBloc>) => {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}
</script>

<template>
  <div
    v-if="!edit"
    :class="['fr-py-6w fr-px-4w', colorClasses[modelValue.color]]"
  >
    <div class="fr-container">
      <h1 class="fr-h2 fr-mb-2w">{{ modelValue.title }}</h1>
      <p v-if="modelValue.description" class="fr-text--lg fr-mb-3w">
        {{ modelValue.description }}
      </p>
      <a
        v-if="modelValue.main_link_title && modelValue.main_link_url"
        :href="modelValue.main_link_url"
        class="fr-btn fr-btn--secondary"
      >
        {{ modelValue.main_link_title }}
      </a>
    </div>
  </div>

  <div v-else class="fr-p-3w fr-background-alt--blue-france">
    <div class="fr-mb-2w">
      <label class="fr-label fr-mb-1w">Couleur de fond</label>
      <div class="fr-radios-group fr-radios-group--inline">
        <div
          v-for="opt in colorOptions"
          :key="opt.value"
          class="fr-radio-group"
        >
          <input
            :id="`hero-color-${modelValue.id}-${opt.value}`"
            type="radio"
            :value="opt.value"
            :checked="modelValue.color === opt.value"
            @change="update({ color: opt.value })"
          />
          <label :for="`hero-color-${modelValue.id}-${opt.value}`">{{
            opt.label
          }}</label>
        </div>
      </div>
    </div>
    <div class="fr-mb-2w">
      <label :for="`hero-title-${modelValue.id}`" class="fr-label">Titre</label>
      <input
        :id="`hero-title-${modelValue.id}`"
        type="text"
        class="fr-input"
        :value="modelValue.title"
        @input="update({ title: ($event.target as HTMLInputElement).value })"
      />
    </div>
    <div class="fr-mb-2w">
      <label :for="`hero-desc-${modelValue.id}`" class="fr-label"
        >Description</label
      >
      <textarea
        :id="`hero-desc-${modelValue.id}`"
        class="fr-input"
        rows="3"
        :value="modelValue.description ?? ''"
        @input="
          update({
            description: ($event.target as HTMLTextAreaElement).value || null
          })
        "
      />
    </div>
    <div class="fr-mb-2w">
      <label :for="`hero-link-title-${modelValue.id}`" class="fr-label">
        Titre du lien (optionnel)
      </label>
      <input
        :id="`hero-link-title-${modelValue.id}`"
        type="text"
        class="fr-input"
        :value="modelValue.main_link_title ?? ''"
        @input="
          update({
            main_link_title: ($event.target as HTMLInputElement).value || null
          })
        "
      />
    </div>
    <div>
      <label :for="`hero-link-url-${modelValue.id}`" class="fr-label">
        URL du lien (optionnel)
      </label>
      <input
        :id="`hero-link-url-${modelValue.id}`"
        type="url"
        class="fr-input"
        :value="modelValue.main_link_url ?? ''"
        @input="
          update({
            main_link_url: ($event.target as HTMLInputElement).value || null
          })
        "
      />
    </div>
  </div>
</template>
