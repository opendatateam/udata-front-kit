<script setup lang="ts">
import { SearchableSelect } from '@datagouv/components-next'
import Catalog from '@gouvfr/dsfr/dist/artwork/pictograms/leisure/catalog.svg'
import config from '@/config'
import type { PageFilterValueConf } from '@/model/config'
import { usePageConf } from '@/utils/config'

const router = useRouter()
const colorsBanner = config.website.home_banner_colors

const casUsagesPage = usePageConf('cas-d-usages')
const targetUsersFilter = casUsagesPage.filters.find((f) => f.id === 'target-users')
const fournisseursFilter = casUsagesPage.filters.find((f) => f.id === 'fournisseurs-de-service')
const targetUsersOptions = targetUsersFilter?.values ?? []
const fournisseursOptions = fournisseursFilter?.values ?? []

const selectedTargetUsers = ref<PageFilterValueConf | null>(null)
const selectedFournisseurs = ref<PageFilterValueConf | null>(null)

const explore = () => {
  const query: Record<string, string> = {}
  if (selectedTargetUsers.value && targetUsersFilter)
    query[targetUsersFilter.id] = `${casUsagesPage.filter_prefix}-${targetUsersFilter.id}-${selectedTargetUsers.value.id}`
  if (selectedFournisseurs.value && fournisseursFilter)
    query[fournisseursFilter.id] = `${casUsagesPage.filter_prefix}-${fournisseursFilter.id}-${selectedFournisseurs.value.id}`
  router.push({ name: 'cas-d-usages', query })
}

const fournisseursDeService = [
  {
    title: 'Particuliers',
    emoji: '👱',
    filters: 'target-users=particuliers',
    description: "Tous les cas d'usages concernant les particuliers"
  },
  {
    title: 'Entreprises',
    emoji: '💼',
    filters: 'target-users=entreprises',
    description: "Tous les cas d'usages concernant les entreprises"
  },
  {
    title: 'Associations',
    emoji: '🤝',
    filters: 'target-users=associations',
    description: "Tous les cas d'usages concernant les associations"
  }
]

const categories_solution = [
  {
    title: 'Logiciels métiers "clé en main"',
    simplificationLevel: ['DLNUF 💠💠', 'Proactivité 💠💠💠'],
    description:
      'Des logiciels métiers prêts à l’emploi ont intégré les données utiles pour vos cas d’usages.',
    filters: 'categorie-de-solution=logiciel-metier',
    imageSrc: '/static/simplifions/assets/accueil-picto-self-training.png'
  },
  {
    title: 'Briques techniques',
    simplificationLevel: ['DLNUF 💠💠', 'Proactivité 💠💠💠'],
    description:
      'Des briques techniques permettent d’intégrer plus facilement les données.',
    filters: 'categorie-de-solution=brique-technique',
    imageSrc: '/static/simplifions/assets/accueil-picto-flow-settings.png'
  },
  {
    title: 'Portails de consultation',
    simplificationLevel: ['Accès facile 💠'],
    description: 'Des sites internet vous permettent de consulter la donnée.',
    filters: 'categorie-de-solution=portail-consultation',
    imageSrc: '/static/simplifions/assets/accueil-picto-search.png'
  }
]

const niveauxDeSimplification = [
  {
    title: 'Niveau 1 : 💠 Accès facile',
    description: "L'agent trouve facilement l'information",
    filters: 'types-de-simplification=acces-facile',
    buttonText: 'Solutions'
  },
  {
    title: 'Niveau 2 : 💠💠 Dites-le-nous une fois',
    description: "L'usager n'a plus à fournir de justificatifs",
    filters: 'types-de-simplification=dlnuf',
    buttonText: 'Solutions'
  },
  {
    title: 'Niveau 3 : 💠💠💠 Proactivité',
    description: "L'usager n'a plus de démarche à faire",
    filters: 'types-de-simplification=proactivite',
    buttonText: 'Solution'
  }
]
</script>

<template>
  <div
    class="banner"
    :style="`background: linear-gradient(0.25turn, ${colorsBanner[0]}, ${colorsBanner[1]}, ${colorsBanner[2]})`"
  >
    <div class="fr-container fr-py-4w">
      <h1 class="title fr-mb-2w fr-text--regular">
        Le catalogue des données<br/>accessibles aux acteurs publics<br>
        <span class="fr-text--bold">pour simplifier les démarches de leurs usagers</span>
      </h1>
      <p class="fr-text--alt fr-mb-3w fr-text--lg" style="text-align: center"><i>
        Découvrez les API et bases de données utiles pour chaque démarche<br>
        et les solutions raccordées à ces données</i>
      </p>
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-lg-8">
          <div class="card fr-pb-4w fr-px-3w fr-pt-2w">
            <div class="fr-grid-row fr-grid-row--middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="fr-artwork fr-mr-1w"
                aria-hidden="true"
                width="60"
                height="60"
                viewBox="0 0 80 80"
              >
                <use class="fr-artwork-decorative" :href="`${Catalog}#artwork-decorative`" />
                <use class="fr-artwork-minor" :href="`${Catalog}#artwork-minor`" />
                <use class="fr-artwork-major" :href="`${Catalog}#artwork-major`" />
              </svg>
              <p class="fr-text--bold fr-mb-0 fr-text--xl">Explorer le catalogue :</p>
            </div>
            <div class="fr-grid-row fr-grid-row--gutters fr-my-0 fr-mb-3w">
              <div class="fr-col-12 fr-col-md-6">
                <SearchableSelect
                  v-model="selectedTargetUsers"
                  :options="targetUsersOptions"
                  :get-option-id="(opt) => opt.id"
                  :display-value="(opt) => opt.name"
                  placeholder="particuliers, entreprises, associations"
                  label="Démarches à destination des :"
                  :multiple="false"
                />
              </div>
              <div class="fr-col-12 fr-col-md-6">
                <SearchableSelect
                  v-model="selectedFournisseurs"
                  :options="fournisseursOptions"
                  :get-option-id="(opt) => opt.id"
                  :display-value="(opt) => opt.name"
                  placeholder="tous les types d'acteurs publics"
                  label="Démarches gérées par :"
                  :multiple="false"
                />
              </div>
            </div>
            <div class="fr-grid-row fr-grid-row--center">
              <DsfrButton
                label="Explorer les démarches référencées"
                icon="fr-icon-search-line"
                icon-right
                @click="explore"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="fr-container section">
    <h2
      class="fr-h1 fr-mt-15w fr-mb-5w"
      style="color: black; text-align: center"
    >
      Améliorer les services à destination :
    </h2>

    <p class="fr-text--lg" style="text-align: center">
      Le portail <i>simplifions.data.gouv.fr</i> vous accompagne pour
      simplifier, avec de la donnée, les démarches des citoyens.<br />Retrouvez
      tous les cas d'usages selon le public concerné :
    </p>

    <div class="fr-grid-row fr-grid-row--gutters">
      <div
        v-for="item in fournisseursDeService"
        :key="item.title"
        class="fr-col-12 fr-col-lg-4"
      >
        <div
          id="tile-sourcing"
          class="fr-tile fr-tile--horizontal fr-enlarge-link"
        >
          <div class="fr-tile__body">
            <div class="fr-tile__content">
              <h3 class="fr-tile__title fr-h3">
                <router-link :to="`/cas-d-usages?${item.filters}`"
                  >{{ item.title }}<br />{{ item.emoji }}</router-link
                >
              </h3>
              <p class="fr-tile__detail fr-h6">
                {{ item.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fr-mt-4w fr-col-md-12 fr-grid-row fr-grid-row--center">
      <router-link to="/cas-d-usages" class="button-link">
        <button
          class="fr-btn fr-btn--icon-left fr-btn--lg fr-icon-checkbox-circle-fill"
        >
          Tous les cas d'usages
        </button>
      </router-link>
    </div>
  </div>

  <div class="fr-container section">
    <h2
      class="fr-h1 fr-mt-15w fr-mb-5w"
      style="color: black; text-align: center"
    >
      Quelles que soient vos ressources, il existe des solutions !
    </h2>

    <p class="fr-text--lg" style="text-align: center">
      Ce portail s'adresse à l'ensemble des acteurs publics, qu'ils disposent ou
      non de ressources informatiques.
      <br />
      Filtrez les cas d'usages et les solutions selon vos possibilités
      d'intégration :
    </p>

    <div class="fr-grid-row fr-grid-row--gutters">
      <div
        v-for="categorie_solution in categories_solution"
        :key="categorie_solution.title"
        class="fr-col-12 fr-col-lg-4"
      >
        <div class="fr-card" style="background-color: #fafafa">
          <div class="fr-card__body">
            <div class="fr-card__content">
              <ul class="fr-tags-group">
                <li
                  v-for="level in categorie_solution.simplificationLevel"
                  :key="level"
                >
                  <p class="fr-tag fr-tag--sm">
                    {{ level }}
                  </p>
                </li>
              </ul>
              <h3 class="fr-card__title">
                {{ categorie_solution.title }}
              </h3>
              <p class="fr-card__desc">{{ categorie_solution.description }}</p>
            </div>
            <div class="fr-card__footer">
              <ul
                class="fr-btns-group fr-btns-group--inline-reverse fr-btns-group--inline-lg"
              >
                <li>
                  <router-link
                    class="fr-btn fr-btn--secondary"
                    :to="`/cas-d-usages?${categorie_solution.filters}`"
                    >Cas d'usages</router-link
                  >
                </li>
                <li>
                  <router-link
                    class="fr-btn"
                    :to="`/solutions?${categorie_solution.filters}`"
                    >{{ categorie_solution.title }}</router-link
                  >
                </li>
              </ul>
            </div>
          </div>
          <div class="fr-card__header">
            <div
              style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100px;
                overflow: hidden;
                margin-top: 10px;
              "
            >
              <img
                class="fr-responsive-img"
                :src="categorie_solution.imageSrc"
                alt=""
                style="max-height: 100%; width: auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="fr-container section">
    <h2
      class="fr-h1 fr-mt-15w fr-mb-5w"
      style="color: black; text-align: center"
    >
      Pourquoi simplifier vos démarches avec la donnée ?
    </h2>

    <p class="fr-text--lg" style="text-align: center">
      Administrations et collectivités, en intégrant des API ou des données dans
      vos démarches et/ou votre système d'information, de nombreux avantages
      s'offrent à vous et vos usagers :
    </p>

    <ul class="fr-mx-10w fr-grid-row fr-grid-row--gutters fr-text--lg">
      <li class="fr-col-12 fr-col-md-4">
        🗄 <b>Accéder facilement aux données administratives de vos usagers</b>,
        qu'elles soient publiques ou protégées.
      </li>
      <li class="fr-col-12 fr-col-md-4">
        ⏰ <b>Faire gagner du temps à vos agents instructeurs</b>. Ils n'ont pas
        de vérifications supplémentaires à réaliser, les informations obtenues
        sont certifiées 🔎.
      </li>
      <li class="fr-col-12 fr-col-md-4">
        🎢 <b>Augmenter le pourcentage des démarches finalisées</b> car la
        démarche est moins longue et moins complexe pour l'usager.
      </li>
      <li class="fr-col-12 fr-col-md-4">
        📜 <b>Vous conformer avec la législation</b> en mettant en oeuvre les
        principes de simplification tels que le <i>dites-le nous une fois</i> et
        la proactivité.
      </li>
      <li class="fr-col-12 fr-col-md-4">
        💌 <b>Réduire le taux de non recours</b>, plus particulièrement en
        mettant en place des démarches proactives.
      </li>
    </ul>

    <div class="fr-mt-4w fr-col-md-12 fr-grid-row fr-grid-row--center">
      <!--a href="https://guides.data.gouv.fr/guide-data.gouv.fr/api/outils-pour-les-administrations" class="button-link" -->
      <button
        class="fr-btn fr-btn--secondary fr-btn--icon-right fr-btn--lg fr-icon-arrow-right-line fr-text--lg"
        disabled
      >
        Consulter les ressources juridiques
      </button>
      <!--/a-->
    </div>
  </div>

  <div class="fr-container section">
    <h2
      class="fr-h1 fr-mt-15w fr-mb-5w"
      style="color: black; text-align: center"
    >
      La simplification en 3 niveaux
    </h2>

    <p class="fr-text--lg" style="text-align: center">
      Il y a
      <router-link to="/niveaux-simplification"
        >plusieurs niveaux de simplification</router-link
      >
      avec un effet positif croissant pour les usagers finaux. Pour chaque cas
      d'usage et solution référencés sur <i>simplifions.data.gouv.fr</i>, le ou
      les niveaux de simplification sont systématiquement indiqués :
    </p>

    <div class="fr-grid-row fr-grid-row--gutters">
      <div
        v-for="niveau in niveauxDeSimplification"
        :key="niveau.title"
        class="fr-col-12 fr-col-md-4"
      >
        <div class="fr-card" style="background-color: #fafafa">
          <div class="fr-card__body">
            <div class="fr-card__content">
              <h3 class="fr-card__title">
                <p class="fr-tag fr-text--lg">{{ niveau.title }}</p>
              </h3>
              <p class="fr-card__desc fr-h5">
                {{ niveau.description }}
              </p>
            </div>
            <div class="fr-card__footer">
              <ul
                class="fr-btns-group fr-btns-group--inline-reverse fr-btns-group--inline-lg"
              >
                <li>
                  <router-link
                    class="fr-btn"
                    :to="`/cas-d-usages?${niveau.filters}`"
                    >Cas d'usages</router-link
                  >
                </li>
                <li>
                  <router-link
                    class="fr-btn fr-btn--secondary"
                    :to="`/solutions?${niveau.filters}`"
                    >{{ niveau.buttonText }}</router-link
                  >
                </li>
              </ul>
            </div>
          </div>
          <div class="fr-card__header">
            <div
              style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 10px;
                overflow: hidden;
                margin-top: 0px;
              "
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="fr-mt-4w fr-col-md-12 fr-grid-row fr-grid-row--center">
      <router-link to="/niveaux-simplification" class="button-link">
        <button
          class="fr-btn fr-btn--secondary fr-btn--icon-right fr-btn--lg fr-icon-arrow-right-line fr-text--lg"
        >
          En savoir plus sur les niveaux de simplification
        </button>
      </router-link>
    </div>
  </div>
  <div
    class="fr-container section fr-mt-8w fr-py-8w"
    style="background-color: rgb(243, 243, 251)"
  >
    <h2
      id="redaction-contenu"
      class="fr-h1 fr-mb-5w"
      style="color: black; text-align: center"
    >
      Comment est rédigé le contenu sur <i>Simplifions.data</i> ?
    </h2>

    <div
      class="fr-grid-row fr-grid-row--gutters fr-ml-8w fr-mr-8w fr-grid-row--top"
    >
      <div class="fr-col-12 fr-col-md-6">
        <figure role="group" class="fr-content-media fr-content-media--sm">
          <div class="fr-content-media__img fr-col-4">
            <img
              class="fr-responsive-img"
              src="/static/simplifions/assets/accueil-picto-contenu-ligne-editoriale.png"
              alt=""
              style="width: auto; height: 100%"
            />
          </div>
        </figure>
        <h3 style="text-align: center">
          Ligne éditoriale <i>DLNUF/proactivité</i>
        </h3>
        <p class="fr-text--lg fr-text--bold">
          Un contenu rédigé au sein du Pôle Data de la DINUM pour tenir une
          ligne éditoriale :
        </p>
        <ul class="fr-text--lg">
          <li>
            focalisée sur la mise en oeuvre d'une simplification par la donnée,
            souvent via les deux principes que sont le "Dites-le nous une fois"
            et la "Proactivité" ;
          </li>
          <li>synthétisant les retours et les contributions ;</li>
          <li>lisible pour les usagers.</li>
        </ul>
      </div>
      <div class="fr-col-12 fr-col-md-6">
        <figure role="group" class="fr-content-media fr-content-media--sm">
          <div class="fr-content-media__img fr-col-3">
            <img
              class="fr-responsive-img"
              src="/static/simplifions/assets/accueil-picto-contenu-contributif.png"
              alt=""
              style="width: auto; height: 100%"
            />
          </div>
        </figure>
        <h3 style="text-align: center">Contenu collaboratif</h3>
        <p class="fr-text--lg fr-text--bold">
          De nombreux espaces sont disponibles sur le site pour permettre aux
          usagers de proposer des modifications dans l'objectif de construire
          une base de connaissance :
        </p>
        <ul class="fr-text--lg">
          <li>élaborée sur des expériences concrètes ;</li>
          <li>exhaustive ;</li>
          <li>mise à jour régulièrement.</li>
        </ul>
      </div>
    </div>

    <p
      class="fr-text--xl fr-text--bold fr-mx-2w fr-mt-4w"
      style="text-align: center"
    >
      📝 Proposez une modification, un cas d'usage ou une solution :
    </p>

    <div
      class="fr-mb-4w datagouv-components fr-grid-row fr-grid-row--center fr-grid-row--gutters"
    >
      <a
        href="https://www.demarches-simplifiees.fr/commencer/proposer-un-contenu-pour-le-site-simplifions"
        target="_blank"
        class="fr-btn fr-btn--icon-right fr-btn--lg fr-icon-arrow-right-line fr-text--lg fr-my-2w fr-mx-2w"
      >
        Formulaire pour proposer un contenu
      </a>
    </div>
    <p
      class="fr-text--xl fr-text--bold fr-mx-2w fr-mt-2w"
      style="text-align: center"
    >
      Consultez les règles utilisées par le pôle Data <br />pour identifier les
      contenus qui sont référencés dans <i>Simplifions.data</i> :
    </p>

    <div class="fr-mt-4w fr-grid-row fr-grid-row--center fr-grid-row--gutters">
      <router-link to="/doctrine-referencement-cas-usages" class="button-link">
        <button
          class="fr-btn fr-btn--secondary fr-btn--icon-right fr-btn--lg fr-icon-arrow-right-line fr-text--lg fr-my-2w fr-mx-2w"
        >
          Doctrine de référencement des cas d'usages
        </button>
      </router-link>
    </div>
    <div class="fr-mt-1w fr-grid-row fr-grid-row--center fr-grid-row--gutters">
      <router-link to="/doctrine-referencement-solutions" class="button-link">
        <button
          class="fr-btn fr-btn--secondary fr-btn--icon-right fr-btn--lg fr-icon-arrow-right-line fr-text--lg"
        >
          Doctrine de référencement des solutions
        </button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>


.fr-artwork-minor,
.fr-artwork-major {
  fill: var(--text-default-grey);
}

.fr-artwork-decorative {
  fill: var(--text-active-blue-france);
}

.banner {
  min-height: calc(100dvh - 220px); /* 220px ≈ hauteur totale header + bannière + nav */
}

.title {
  font-size: clamp(1.375rem, 4vw, 2rem);
  line-height: 1.25;
  text-align: center;
}

.card {
  background-color: var(--background-default-grey);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}

.section {
  margin-top: 30px;
  text-align: left;
}

.button-link {
  text-decoration: none;
  background: none;
}
</style>
