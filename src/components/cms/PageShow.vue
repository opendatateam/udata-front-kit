<script lang="ts" setup>
import type { Page, PageBloc } from '@datagouv/components-next'

import AddBlocDropdown from './AddBlocDropdown.vue'
import DatasetsListBlocComponent from './blocks/DatasetsListBloc.vue'
import HeroBlocComponent from './blocks/HeroBloc.vue'
import MarkdownBlocComponent from './blocks/MarkdownBloc.vue'

const props = defineProps<{
  page: Page
  edit: boolean
}>()

const emit = defineEmits<{
  save: [page: Page]
}>()

const blocs = ref<PageBloc[]>([...props.page.blocs])

watch(
  () => props.page,
  (newPage) => {
    blocs.value = [...newPage.blocs]
  }
)

const isFullWidth = (bloc: PageBloc) => bloc.class === 'HeroBloc'

const updateBloc = (index: number, updated: PageBloc) => {
  blocs.value = blocs.value.map((b, i) => (i === index ? updated : b))
}

const removeBloc = (index: number) => {
  blocs.value = blocs.value.filter((_, i) => i !== index)
}

const moveUp = (index: number) => {
  if (index === 0) return
  const updated = [...blocs.value]
  ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
  blocs.value = updated
}

const moveDown = (index: number) => {
  if (index === blocs.value.length - 1) return
  const updated = [...blocs.value]
  ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
  blocs.value = updated
}

const addBlocAt = (bloc: PageBloc, afterIndex: number) => {
  const updated = [...blocs.value]
  updated.splice(afterIndex + 1, 0, bloc)
  blocs.value = updated
}

const addBlocAtStart = (bloc: PageBloc) => {
  blocs.value = [bloc, ...blocs.value]
}

const save = () => {
  emit('save', { ...props.page, blocs: blocs.value })
}
</script>

<template>
  <div>
    <template v-if="edit">
      <div class="fr-container fr-py-2w">
        <AddBlocDropdown @add="addBlocAtStart" />
      </div>
    </template>

    <template v-for="(bloc, index) in blocs" :key="bloc.id">
      <!-- HeroBloc — full width -->
      <template v-if="bloc.class === 'HeroBloc'">
        <HeroBlocComponent
          :model-value="bloc"
          :edit="edit"
          @update:model-value="updateBloc(index, $event)"
        />
        <div v-if="edit" class="fr-container fr-py-1w">
          <div class="fr-btns-group fr-btns-group--inline">
            <button
              type="button"
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-up-line"
              :disabled="index === 0"
              title="Déplacer vers le haut"
              @click="moveUp(index)"
            />
            <button
              type="button"
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-down-line"
              :disabled="index === blocs.length - 1"
              title="Déplacer vers le bas"
              @click="moveDown(index)"
            />
            <button
              type="button"
              class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-delete-line"
              title="Supprimer"
              @click="removeBloc(index)"
            />
          </div>
          <AddBlocDropdown @add="addBlocAt($event, index)" />
        </div>
      </template>

      <!-- MarkdownBloc — contained -->
      <template v-else-if="bloc.class === 'MarkdownBloc'">
        <div class="fr-container fr-py-3w">
          <MarkdownBlocComponent
            :model-value="bloc"
            :edit="edit"
            @update:model-value="updateBloc(index, $event)"
          />
          <div v-if="edit" class="fr-mt-1w">
            <div class="fr-btns-group fr-btns-group--inline">
              <button
                type="button"
                class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-up-line"
                :disabled="index === 0"
                title="Déplacer vers le haut"
                @click="moveUp(index)"
              />
              <button
                type="button"
                class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-down-line"
                :disabled="index === blocs.length - 1"
                title="Déplacer vers le bas"
                @click="moveDown(index)"
              />
              <button
                type="button"
                class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-delete-line"
                title="Supprimer"
                @click="removeBloc(index)"
              />
            </div>
            <AddBlocDropdown @add="addBlocAt($event, index)" />
          </div>
        </div>
      </template>

      <!-- DatasetsListBloc — contained -->
      <template v-else-if="bloc.class === 'DatasetsListBloc'">
        <div class="fr-container fr-py-3w">
          <DatasetsListBlocComponent
            :model-value="bloc"
            :edit="edit"
            @update:model-value="updateBloc(index, $event)"
          />
          <div v-if="edit" class="fr-mt-1w">
            <div class="fr-btns-group fr-btns-group--inline">
              <button
                type="button"
                class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-up-line"
                :disabled="index === 0"
                title="Déplacer vers le haut"
                @click="moveUp(index)"
              />
              <button
                type="button"
                class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-down-line"
                :disabled="index === blocs.length - 1"
                title="Déplacer vers le bas"
                @click="moveDown(index)"
              />
              <button
                type="button"
                class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-delete-line"
                title="Supprimer"
                @click="removeBloc(index)"
              />
            </div>
            <AddBlocDropdown @add="addBlocAt($event, index)" />
          </div>
        </div>
      </template>
    </template>

    <div v-if="edit" class="fr-container fr-py-2w">
      <button
        type="button"
        class="fr-btn fr-icon-save-line fr-btn--icon-left"
        @click="save"
      >
        Enregistrer
      </button>
    </div>
  </div>
</template>
