<script lang="ts" setup>
defineProps({
  groupName: {
    type: String,
    required: true,
    default: 'Regroupement XXX'
  }
})
const isDisclosureOpen: Ref<boolean> = ref(false)
const toggleDisclosure = () => {
  isDisclosureOpen.value = !isDisclosureOpen.value
}
</script>

<template>
  <div class="disclosure">
    <div class="disclosure__header">
      <button
        class="disclosure__trigger"
        :aria-expanded="isDisclosureOpen"
        aria-controls="disclosure-content"
        @click.prevent="toggleDisclosure"
      >
        <span class="fr-sr-only">ouvrir le regroupement</span>
        <span>{{ groupName }}</span>
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
      </button>
      <div class="disclosure__actions">
        <button class="disclosure__btn">
          <span class="fr-sr-only">éditer le regroupement {{ groupName }}</span>
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
        <button class="disclosure__btn">
          <span class="fr-sr-only"
            >supprimer le regroupement {{ groupName }}</span
          >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="none"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <path
              fill="#3458A2"
              fill-rule="evenodd"
              d="M12.665 10.667V9.334h6.667v1.333h3.333V12h-1.333v10a.667.667 0 0 1-.667.667h-9.333a.667.667 0 0 1-.667-.667V12H9.332v-1.333h3.333ZM12 12v9.334h8V12h-8Zm2 2h1.333v5.334H14V14Zm2.666 0H18v5.334h-1.334V14Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
    <div
      id="disclosure-content"
      :class="[{ isVisible: isDisclosureOpen }, 'disclosure__content']"
    >
      <p>disclosed content</p>
      <p>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fugiat, et
        incidunt? Id voluptatibus porro dolorum consequatur. Asperiores qui
        itaque, odio illum quam blanditiis eos eveniet laudantium fuga libero
        perspiciatis molestiae sunt dolore dicta dolores consequatur animi
        tenetur unde quos reprehenderit soluta nam. Voluptatum, praesentium
        quod. Accusantium fugit cumque dolore nam.
      </p>
    </div>
  </div>
</template>

<style scoped>
.disclosure {
  --padding-base: 1rem;
  margin-block: 40px;
  overflow: hidden;
}
.disclosure__header,
.disclosure__trigger,
.disclosure__actions {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--padding-base) / 2);
}
.disclosure__trigger,
.disclosure__actions {
  flex-wrap: nowrap;
}
.disclosure__header {
  padding-inline-end: var(--padding-base);
  border-block-end: 1px solid var(--border-default-grey);
}
.disclosure__trigger {
  padding-block: 12px;
  padding-inline: var(--padding-base) calc(var(--padding-base) / 2);
  flex-grow: 1;
  font-weight: bold;
}
.disclosure__btn {
  block-size: 32px;
  inline-size: 32px;
  display: grid;
  place-content: center;
  border: 1px solid grey;
  border-radius: 40px;
}
.disclosure__marker svg {
  rotate: 0deg;
  transition: rotate 0.4s ease;
}
.disclosure__content {
  padding: var(--padding-base);
  block-size: 0;
  visibility: hidden;
}
@supports (interpolate-size: allow-keywords) {
  .disclosure__content {
    transition:
      height 0.4s ease,
      visibility 0.4s;
  }
}
.disclosure__content.isVisible {
  block-size: auto;
  visibility: visible;
}
.disclosure__trigger[aria-expanded='true'] .disclosure__marker > svg {
  rotate: 180deg;
}
</style>
