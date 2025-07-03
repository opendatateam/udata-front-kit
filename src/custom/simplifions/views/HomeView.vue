<script setup lang="ts">
import config from '@/config'

const colorsBanner = config.website.home_banner_colors

const fournisseursDeService = [
  {
    title: 'Particuliers',
    emoji: '👱',
    tags: 'simplifions-users-particuliers',
    description: "Tous les cas d'usages concernant les particuliers"
  },
  {
    title: 'Entreprises',
    emoji: '💼',
    tags: 'simplifions-users-entreprises',
    description: "Tous les cas d'usages concernant les entreprises"
  },
  {
    title: 'Associations',
    emoji: '🤝',
    tags: 'simplifions-users-associations',
    description: "Tous les cas d'usages concernant les associations"
  },
  {
    title: 'Agents publics',
    emoji: '🧑‍💼',
    tags: 'simplifions-users-agents-publics',
    description: "Tous les cas d'usages concernant les agents publics"
  }
]

const budgets = [
  {
    title: "Vous n'avez ni équipe technique, ni éditeur",
    description:
      "Les cas d'usage accessibles avec des solutions clés en main, faciles à mettre en place par un agent non technique.",
    casUsagesTags: 'simplifions-budget-aucun-developpement',
    solutionsTags: 'simplifions-solutions-moyens-aucun',
    imageSrc: '/simplifions/assets/accueil-picto-contract.png'
  },
  {
    title: 'Vous passez par un éditeur',
    description:
      "Les cas d'usages et solutions portés par des éditeurs qui s'occupent de l'intégration.",
    casUsagesTags: 'simplifions-budget-solution-editeur',
    solutionsTags: 'simplifions-solutions-moyens-editeur',
    imageSrc: '/simplifions/assets/accueil-picto-self-training.png'
  },
  {
    title: 'Vous avez votre service informatique',
    description:
      "Les cas d'usages et solutions que vos services informatiques peuvent intégrer dans vos démarches et/ou votre système d'information.",
    casUsagesTags: 'spf-budget-aucun-developpement',
    solutionsTags: 'spf-budget-aucun-developpement,spf-moyens-aucun',
    imageSrc: '/simplifions/assets/accueil-picto-coding.png'
  }
]

const niveauxDeSimplification = [
  {
    title: 'Niveau 1 : ⭐️ Accès facile',
    description: "L'agent trouve facilement l'information",
    casUsagesTags: 'spf-simplification-acces-facile',
    solutionsTags: 'spf-simplification-acces-facile',
    buttonText: 'Solutions'
  },
  {
    title: 'Niveau 2 : ⭐️⭐️ Dîtes-le-nous une fois',
    description: "L'usager n'a plus à fournir de justificatifs",
    casUsagesTags: 'spf-simplification-dlnuf',
    solutionsTags: 'spf-simplification-dlnuf',
    buttonText: 'Solutions'
  },
  {
    title: 'Niveau 3 : ⭐️⭐️⭐️ Proactivité',
    description: "L'usager n'a plus de démarche à faire",
    casUsagesTags: 'spf-simplification-proactivite',
    solutionsTags: 'spf-simplification-proactivite',
    buttonText: 'Solution'
  }
]
</script>

<template>
  <div
    class="banner"
    :style="
      'background: linear-gradient(0.25turn, ' +
      colorsBanner[0] +
      ', ' +
      colorsBanner[1] +
      ', ' +
      colorsBanner[2] +
      ');'
    "
  >
    <div class="fr-container">
      <h1 class="main-title fr-mb-3v">
        Acteurs publics, utilisez la donnée pour simplifier vos services !
      </h1>
      <div class="fr-mt-5w">
        <div class="subtitle fr-text--alt fr-mb-10w">
          <div class="fr-grid-row fr-grid-row--gutters">
            <div class="fr-content-media__img fr-col-lg-2 fr-col-4">
              <img
                class="fr-responsive-img"
                src="/simplifions/assets/accueil-picto-ecosystem.png"
                alt=""
                style="display: block; width: 100%; height: auto"
              />
            </div>
            <div
              class="fr-col-lg-8 fr-col-12"
              style="
                font-family: Marianne, arial, sans-serif !important;
                font-style: normal;
              "
            >
              <p class="fr-text--lead">
                Simplifiez les démarches et services des citoyens, entreprises
                et associations en récupérant pour eux leurs informations
                administratives grâce aux API et aux données ! Vous gagnerez
                aussi du temps !
              </p>

              <router-link
                class="fr-btn fr-mt-1v fr-mr-2w fr fr-btn--lg"
                to="/cas-d-usages"
                >Tous les cas d'usages</router-link
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="fr-container hero-text">
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
        class="fr-col-12 fr-col-lg-3"
        v-for="item in fournisseursDeService"
        :key="item.title"
      >
        <div
          class="fr-tile fr-tile--horizontal fr-enlarge-link"
          id="tile-sourcing"
        >
          <div class="fr-tile__body">
            <div class="fr-tile__content">
              <h3 class="fr-tile__title fr-h3">
                <router-link :to="`/cas-d-usages?tags=${item.tags}`"
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
    <div
      class="fr-mt-4w fr-col-md-12 datagouv-components fr-grid-row fr-grid-row--center"
    >
      <router-link to="/cas-d-usages" class="button-link">
        <button
          class="fr-btn fr-btn--icon-left fr-btn--lg fr-icon-checkbox-circle-fill"
        >
          Tous les cas d'usages
        </button>
      </router-link>
    </div>
  </div>

  <div class="fr-container hero-text">
    <h2
      class="fr-h1 fr-mt-15w fr-mb-5w"
      style="color: black; text-align: center"
    >
      Quelques soient vos ressources, il existe des solutions !
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
        class="fr-col-12 fr-col-lg-4"
        v-for="budget in budgets"
        :key="budget.title"
      >
        <div class="fr-card" style="background-color: #fafafa">
          <div class="fr-card__body">
            <div class="fr-card__content">
              <h3 class="fr-card__title">
                {{ budget.title }}
              </h3>
              <p class="fr-card__desc">{{ budget.description }}</p>
            </div>
            <div class="fr-card__footer">
              <ul
                class="fr-btns-group fr-btns-group--inline-reverse fr-btns-group--inline-lg"
              >
                <li>
                  <router-link
                    class="fr-btn"
                    :to="`/cas-d-usages?tags=${budget.casUsagesTags}`"
                    >Cas d'usages</router-link
                  >
                </li>
                <li>
                  <router-link
                    class="fr-btn fr-btn--secondary"
                    :to="`/solutions?tags=${budget.solutionsTags}`"
                    >Solutions</router-link
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
                :src="budget.imageSrc"
                alt=""
                style="max-height: 100%; width: auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="fr-container hero-text">
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
        principes de simplification tels que le <i>dîtes-le nous une fois</i> et
        la proactivité.
      </li>
      <li class="fr-col-12 fr-col-md-4">
        💌 <b>Réduire le taux de non recours</b>, plus particulièrement en
        mettant en place des démarches proactives.
      </li>
    </ul>

    <div
      class="fr-mt-4w fr-col-md-12 datagouv-components fr-grid-row fr-grid-row--center"
    >
      <router-link to="" class="button-link">
        <button
          class="fr-btn fr-btn--secondary fr-btn--icon-left fr-btn--lg fr-icon-checkbox-circle-fill"
        >
          Consulter les ressources juridiques
        </button>
      </router-link>
    </div>
  </div>

  <div class="fr-container hero-text">
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
        class="fr-col-12 fr-col-md-4"
        v-for="niveau in niveauxDeSimplification"
        :key="niveau.title"
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
                    :to="`/cas-d-usages?tags=${niveau.casUsagesTags}`"
                    >Cas d'usages</router-link
                  >
                </li>
                <li>
                  <router-link
                    class="fr-btn fr-btn--secondary"
                    :to="`/solutions?tags=${niveau.solutionsTags}`"
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

    <div
      class="fr-mt-4w fr-col-md-12 datagouv-components fr-grid-row fr-grid-row--center"
    >
      <router-link to="/niveaux-simplification" class="button-link">
        <button
          class="fr-btn fr-btn--secondary fr-btn--icon-left fr-btn--lg fr-icon-checkbox-circle-fill"
        >
          En savoir plus sur les niveaux de simplification
        </button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.fr-container {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}
.banner {
  padding-top: 5%;
  padding-bottom: 5%;
  position: relative;
}
.main-title {
  text-align: left;
  font-size: 48px;
  line-height: 50px;
  font-weight: 800;
}
.subtitle {
  text-align: left;
  font-style: italic;
  font-size: 20px;
  line-height: 28px;
}
.hero-text {
  margin-top: 30px;
  text-align: left;
}

.button-link {
  text-decoration: none;
  background: none;
}
</style>
