<script lang="ts" setup>
import type { PageBloc } from '@datagouv/components-next'
import { defineAsyncComponent } from 'vue'

import AddBlocDropdown from './AddBlocDropdown.vue'
import BlocControls from './BlocControls.vue'
import DataservicesListBlocComponent from './blocks/DataservicesListBloc.vue'
import DatasetsListBlocComponent from './blocks/DatasetsListBloc.vue'
import HeroBlocComponent from './blocks/HeroBloc.vue'
import LinksListBlocComponent from './blocks/LinksListBloc.vue'
import MarkdownBlocComponent from './blocks/MarkdownBloc.vue'
import ReusesListBlocComponent from './blocks/ReusesListBloc.vue'

// loaded lazily to avoid a circular import with its own nested content
const AccordionListBlocComponent = defineAsyncComponent(
  () => import('./blocks/AccordionListBloc.vue')
)

const props = defineProps<{
  blocs: PageBloc[]
  edit: boolean
  // restricts which bloc types can be added here (e.g. no Hero in an accordion)
  allowed?: PageBloc['class'][]
  // true when already inside a contained layout, to avoid nesting fr-container
  nested?: boolean
}>()

const emit = defineEmits<{
  'update:blocs': [blocs: PageBloc[]]
}>()

const updateBloc = (index: number, updated: PageBloc) => {
  emit(
    'update:blocs',
    props.blocs.map((b, i) => (i === index ? updated : b))
  )
}

const removeBloc = (index: number) => {
  emit(
    'update:blocs',
    props.blocs.filter((_, i) => i !== index)
  )
}

const moveUp = (index: number) => {
  if (index === 0) return
  const updated = [...props.blocs]
  ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
  emit('update:blocs', updated)
}

const moveDown = (index: number) => {
  if (index === props.blocs.length - 1) return
  const updated = [...props.blocs]
  ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
  emit('update:blocs', updated)
}

const addBlocAt = (bloc: PageBloc, afterIndex: number) => {
  const updated = [...props.blocs]
  updated.splice(afterIndex + 1, 0, bloc)
  emit('update:blocs', updated)
}

const addBlocAtStart = (bloc: PageBloc) => {
  emit('update:blocs', [bloc, ...props.blocs])
}
</script>

<template>
  <div>
    <div v-if="edit" :class="nested ? '' : 'fr-container'">
      <AddBlocDropdown :allowed="allowed" @add="addBlocAtStart" />
    </div>

    <template v-for="(bloc, index) in blocs" :key="bloc.id">
      <!-- HeroBloc — full width when displayed, contained like other blocs while editing -->
      <template v-if="bloc.class === 'HeroBloc'">
        <div v-if="edit" :class="nested ? 'fr-py-3w' : 'fr-container fr-py-3w'">
          <HeroBlocComponent
            :model-value="bloc"
            :edit="edit"
            @update:model-value="updateBloc(index, $event)"
          />
          <div class="fr-mt-1w">
            <BlocControls
              :index="index"
              :total="blocs.length"
              :allowed="allowed"
              @move-up="moveUp"
              @move-down="moveDown"
              @remove="removeBloc"
              @add="addBlocAt"
            />
          </div>
        </div>
        <HeroBlocComponent
          v-else
          :model-value="bloc"
          :edit="edit"
          @update:model-value="updateBloc(index, $event)"
        />
      </template>

      <!-- other bloc types — contained -->
      <template v-else>
        <div :class="nested ? 'fr-py-3w' : 'fr-container fr-py-3w'">
          <MarkdownBlocComponent
            v-if="bloc.class === 'MarkdownBloc'"
            :model-value="bloc"
            :edit="edit"
            :nested="nested"
            @update:model-value="updateBloc(index, $event)"
          />
          <DatasetsListBlocComponent
            v-else-if="bloc.class === 'DatasetsListBloc'"
            :model-value="bloc"
            :edit="edit"
            :nested="nested"
            @update:model-value="updateBloc(index, $event)"
          />
          <DataservicesListBlocComponent
            v-else-if="bloc.class === 'DataservicesListBloc'"
            :model-value="bloc"
            :edit="edit"
            :nested="nested"
            @update:model-value="updateBloc(index, $event)"
          />
          <ReusesListBlocComponent
            v-else-if="bloc.class === 'ReusesListBloc'"
            :model-value="bloc"
            :edit="edit"
            :nested="nested"
            @update:model-value="updateBloc(index, $event)"
          />
          <LinksListBlocComponent
            v-else-if="bloc.class === 'LinksListBloc'"
            :model-value="bloc"
            :edit="edit"
            :nested="nested"
            @update:model-value="updateBloc(index, $event)"
          />
          <AccordionListBlocComponent
            v-else-if="bloc.class === 'AccordionListBloc'"
            :model-value="bloc"
            :edit="edit"
            @update:model-value="updateBloc(index, $event)"
          />

          <div v-if="edit" class="fr-mt-1w">
            <BlocControls
              :index="index"
              :total="blocs.length"
              :allowed="allowed"
              @move-up="moveUp"
              @move-down="moveDown"
              @remove="removeBloc"
              @add="addBlocAt"
            />
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
