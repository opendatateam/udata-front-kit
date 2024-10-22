<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { ref } from 'vue'

import HomeThemes from '@/components/HomeThemes.vue'
import config from '@/config'

const homepageTitle = config.website.homepage.title

const activeAccordion = ref<string>()
const setActiveAccordion = (id) => {
  activeAccordion.value = id
}
const faqAccordionContents = [
  {
    id: 'faq_accordion_1',
    title: "Qu'est-ce que ecologie.data.gouv.fr ?",
    content: `<p>ecologie.data.gouv.fr est un catalogue permettant la centralisation des données de la transition écologique et leur renseignement par cas d'usage sous la forme de bouquets de données. <br/> Un bouquet est un ensemble de données contextualisées permettant de répondre à un cas d’usage lié à une politique publique. </p>`
  },
  {
    id: 'faq_accordion_2',
    title: "À qui s'adresse cette plateforme ?",
    content: 'WIP'
  }
]

useHead({
  meta: [
    { property: 'og:title', content: config.website.title },
    { name: 'description', content: config.website.homepage.meta_description },
    {
      property: 'og:description',
      content: config.website.homepage.meta_description
    }
  ],
  link: [{ rel: 'canonical', href: window.location.origin }]
})
</script>

<template>
  <div class="datagouv-components">
    <section class="fr-container fr-py-12v">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col">
          <h1>{{ homepageTitle }}</h1>
          <p>
            <i>ecologie</i><strong>.data.gouv</strong><i>.fr</i> référence et
            centralise les données de la transition écologique.
          </p>
          <p>
            Le catalogue rassemble les données utiles au déploiement des
            politiques publiques portées par le Ministère de la Transition
            écologique et de la Cohésion des territoires.
          </p>
        </div>
        <div class="fr-col-md-6 fr-hidden fr-unhidden-md fr-grid-row--center">
          <img
            src="../assets/home-global-schema.svg"
            alt=""
            class="illustration"
            width="441"
            height="290"
          />
        </div>
      </div>
    </section>
    <section class="fr-container--fluid bouquets">
      <div class="fr-container fr-py-12v">
        <div class="fr-grid-row fr-grid-row--gutters">
          <div class="fr-col">
            <h2>Bouquets de données</h2>
            <p>
              Retrouvez les données utiles à la mise en œuvre d'une politique
              publique spécifique sous forme de bouquets de données.
            </p>

            <a
              href="https://ecospheres.gitbook.io/doc/"
              target="_blank"
              rel="noopener noreferrer"
              class="fr-btn fr-btn--secondary fr-btn--md inline-flex"
              >Consulter la documentation</a
            >
          </div>
          <div class="fr-col-md-6 fr-hidden fr-unhidden-md fr-grid-row--center">
            <img
              src="../assets/home-bouquets-schema.svg"
              alt=""
              loading="lazy"
              class="illustration"
              width="441"
              height="290"
            />
          </div>
        </div>
        <div class="fr-mt-10v">
          <h3>Trouvez un bouquet par thématique</h3>
          <HomeThemes v-if="config.themes" />
        </div>
      </div>
    </section>
    <section class="fr-container--fluid faq">
      <div class="fr-container fr-py-12v faq">
        <h2>Foire aux questions</h2>
        <DsfrAccordionsGroup v-model="activeAccordion">
          <DsfrAccordion
            v-for="accordion in faqAccordionContents"
            :id="accordion.id"
            :key="accordion.id"
            :title="accordion.title"
            :expanded-id="activeAccordion"
            :class="{ active: activeAccordion == accordion.id }"
            @expand="setActiveAccordion($event)"
          >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="accordion.content"></div>
          </DsfrAccordion>
        </DsfrAccordionsGroup>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.bouquets,
.faq {
  background-color: #f6f6f6;
}
.illustration {
  max-width: 100%;
}

.faq {
  :deep(.fr-accordions-group) {
    .fr-accordion.active {
      .fr-accordion__title,
      .fr-accordion__title button:hover {
        background-color: var(--blue-france-925-125);
      }
    }
    .fr-accordion__title span {
      color: #000091; /*var(--blue-france-975-sun-113) not working*/
    }
    .fr-collapse {
      background-color: white;
      margin: 0;
    }
  }
}
</style>
