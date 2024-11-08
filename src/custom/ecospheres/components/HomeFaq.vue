<script setup lang="ts">
const activeAccordion = ref<string>()
const setActiveAccordion = (id: string) => {
  activeAccordion.value = id
}
const faqEcologieDataGouvHtml = `<span class="f-italic">ecologie.<span class="fr-text--bold">data.gouv</span>.fr</span>`
const faqDataGouvHtml = `<span class="f-italic"><span class="fr-text--bold">data.gouv</span>.fr</span>`
const faqMinisterLink = `<a href="https://www.ecologie.gouv.fr/" class="fr-link" target="_blank">Ministère de la Transition écologique, de l'Énergie, du Climat et de la Prévention des risques</a>`
const faqAccordionContents = [
  {
    title: "Qu'est-ce que ecologie.data.gouv.fr ?",
    content: `<p>${faqEcologieDataGouvHtml} est la plateforme publique mettant à disposition les données relatives à la transition écologique. Elle permet de rendre accessible au public des informations fiables et structurées, issues des institutions publiques et des acteurs privés. L'objectif est de rassembler les données utiles au déploiement des politiques publiques portées par le ${faqMinisterLink} dans des secteurs comme l'environnement, l'énergie, le transport et le logement.</p>`
  },
  {
    title:
      'Quel est le lien entre le lien ecologie.data.gouv.fr et data.gouv.fr ?',
    content: `<p>${faqEcologieDataGouvHtml} est une verticale thématique de ${faqDataGouvHtml}, la plateforme nationale de données, dédiée aux thématiques liées à la transition écologique.</p>
<p>Bien que présentant des contenus éditoriaux et des fonctionnalités spécifiques, les deux plateformes partagent le même catalogue, auquel nous contribuons avec les données du pôle ministériel <a href="https://www.ecologie.gouv.fr/" target="_blank" class="fr-link">ecologie.gouv.fr</a>. Toute modification sur ${faqDataGouvHtml} est donc immédiatement visible sur ${faqEcologieDataGouvHtml}, et inversement.</p>
<p>${faqEcologieDataGouvHtml} fait partie d'un écosystème naissant de verticales thématiques construites à partir d'un <a href="https://github.com/opendatateam/udata-front-kit" target="_blank">commun numérique</a> porté et co-développé par le CGDD et la DINUM.</p>`
  },
  {
    title: "À qui s'adresse cette plateforme ?",
    content: `<p>${faqEcologieDataGouvHtml} s'adresse principalement :</p>
<ul>
<li>aux producteurs de données souhaitant ouvrir et valoriser leurs données en lien avec la transition écologique</li>
<li>aux utilisateurs de données œuvrant à déployer les politiques publiques portées par le ${faqMinisterLink}</li>
<li>mais aussi à tout citoyen curieux souhaitant découvrir des données en lien avec les enjeux écologiques.</li>
</ul>
<p>Grâce à une approche par cas d'usage, la plateforme propose un accès structuré à des données environnementales organisées autour de problématiques précises, facilitant ainsi leur réutilisation et adaptation sur différents territoires.</p>
`
  },
  {
    title: "Qu'est-ce que le concept de guichet unique de la donnée ?",
    content: `<p>Le guichet unique de la donnée est un point d’accès centralisé permettant de regrouper et de simplifier l’accès aux données d’intérêt public.</p>

<p>${faqEcologieDataGouvHtml} centralise les données utiles au déploiement des politiques liées à la transition écologique, en les rendant accessibles et facilement réutilisables pour tous les acteurs, administrations, décideurs publics, citoyens ou chercheurs. La plateforme propose aux utilisateurs un portail unique pour consulter et exploiter des informations provenant de différentes sources institutionnelles, facilitant ainsi la recherche de données et renforçant la transparence.</p>`
  },
  {
    title: "Qu'est-ce que le concept de bouquet ?",
    content: `<p>Un bouquet de données désigne un ensemble cohérent de jeux de données regroupés autour d'une thématique ou d'un enjeu spécifique sur un territoire donné.</p>

<p>Un bouquet de données :</p>
<ul>
<li>s'insère dans le contexte d’une politique publique, nationale et/ou locale, et de ses objectifs,</li>
<li>pose une problématique claire autour des décisions à soutenir,</li>
<li>détaille les informations utiles à l’éclairage de ces décisions et les données disponibles qui les renseignent.</li>
</ul>
<p>Les bouquets de données répondent ainsi au besoin de centraliser et de référencer les données liées à la mise en œuvre d’une politique publique précise sur différents territoires.</p>`
  },
  {
    title: 'Quelles données sont accessibles depuis ecologie.data.gouv.fr ?',
    content: `<p>Les données présentées sur ${faqEcologieDataGouvHtml} sont une sélection du catalogue de données moissonnées ou publiées dans ${faqDataGouvHtml}. Elles sont produites par des organisations dont les données ont un intérêt en lien avec la transition écologique, ou qui sont en lien avec le ${faqMinisterLink}.</p>

<p>Lors de la création d'un bouquet de données, il est également possible d’inclure des jeux de données provenant de l'ensemble du catalogue de data.gouv.fr, permettant ainsi d’ajouter des données pertinentes pour une thématique, même si elles sont produites par des organisations non référencées sur ${faqEcologieDataGouvHtml}.</p>`
  },
  {
    title:
      'Comment rendre disponible un jeu de données sur ecologie.data.gouv.fr ?',
    content: `<p>Pour rendre disponible un jeu de données sur ${faqEcologieDataGouvHtml}, il est nécessaire de les publier via ${faqDataGouvHtml}, en utilisant les méthodes standards : vous pouvez passer par le parcours de publication web, l’API de ${faqDataGouvHtml}, ou par un processus de moissonnage. Vous trouverez des informations détaillées sur la publication dans le <a href="https://guides.data.gouv.fr/guide-data.gouv.fr/jeux-de-donnees/publier-un-jeu-de-donnees" class="fr-link" target="_blank">guide de data.gouv.fr</a> et les étapes pour <a href="https://www.data.gouv.fr/fr/pages/onboarding/producteurs/" class="fr-link" target="_blank">devenir producteur de données</a>.</p>

<p>Pour mettre en place un moissonnage spécifique, veuillez nous contacter directement afin que nous vous aidions à configurer les paramètres nécessaires pour que vos flux de données soient correctement synchronisés.</p>

<p>Une fois publiées sur ${faqDataGouvHtml}, vos données peuvent être intégrées dans un bouquet de données. Si vous souhaitez que votre jeu de données soit également directement accessible depuis l’onglet "Données" du site, veuillez nous contacter afin de référencer votre organisation.</p>
`
  },
  {
    title:
      "Je ne trouve pas le jeu de données dont j'ai besoin lors de la création d'un bouquet ?",
    content: `<p>Pour qu'un jeu de données puisse être ajouté à un bouquet, il est nécessaire qu'il soit au préalable présent dans le catalogue data.gouv.fr. Si il est bien présent sur ${faqDataGouvHtml} mais que vous ne le retrouvez pas malgré tout lors de la création d'un bouquet, veuillez nous contacter.</p>`
  },
  {
    title: `Je ne trouve pas un jeu de données dans l'onglet "Données" ?`,
    content: `Pour qu'un jeu de données soit présent dans l'onglet "Données", il est nécessaire que le jeu de données soit publié sur ${faqDataGouvHtml} et que l'organisation le produisant soit référencée par ${faqEcologieDataGouvHtml}. Si vous souhaitez que votre organisation soit référencée sur le site, veuillez nous contacter.`
  },
  {
    title: 'Un retour, une question ?',
    content: `Si vous avez une question ou souhaitez faire part de vos retours, vous pouvez contacter l'équipe d'${faqEcologieDataGouvHtml} via le formulaire de contact disponible sur le site. L'équipe est également à votre disposition pour répondre à vos suggestions`
  }
]
</script>

<template>
  <DsfrAccordionsGroup v-model="activeAccordion">
    <DsfrAccordion
      v-for="(accordion, index) in faqAccordionContents"
      :id="accordion.id"
      :key="`faq_accordion_${index}`"
      :title="accordion.title"
      :expanded-id="activeAccordion"
      :class="{ active: activeAccordion == index }"
      @expand="setActiveAccordion($event)"
    >
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="accordion.content"></div>
    </DsfrAccordion>
  </DsfrAccordionsGroup>
</template>

<style scoped>
.fr-accordion.active :deep(.fr-accordion__title button) {
  background-color: var(--blue-france-925-125);
  color: #000091;
}
:deep(.fr-collapse) {
  background-color: white;
  margin: 0;
}

:deep(.fr-accordion__btn:after) {
  content: url('../assets/arrow-down.svg');
  background-color: inherit;
  mask-image: inherit;
}

:deep(.fr-accordion.active .fr-accordion__btn:after) {
  content: url('../assets/arrow-up.svg');
}
</style>
