<template>
  <SimplifionsArticleLayout
    :h1="article.h1"
    :title="article.title"
    :lead="article.description"
    :hero-image-src="article.imageSrc"
    :kicker="articleKicker"
    :article-tags="article.articleTags"
    :article-category="article.articleCategory"
    :show-no-development-badge="article.showNoDevelopmentBadge"
    :breadcrumb-links="breadcrumbLinks"
    :hero-backdrop-gradient="article.heroBackdropGradient"
    :hero-panel-background="article.heroPanelBackground"
  >


    <ArticleSection id="definition" label="Simplifier par la donnée, définition">
      <template #heading>
        Simplifier vos démarches par la donnée : de quoi parle-t-on ?
      </template>

    <p class="fr-text--lg">
      Lorsqu'un usager, particulier, entreprise ou association complète une
      démarche administrative, il est souvent requis qu'il fournisse des
      informations le concernant, qu'il a le plus souvent déjà transmises lors d'autres démarches ou auprès d'autres administrations.
    </p>

    <p class="italic">
      Par exemple, lorsqu'un parent inscrit son enfant à la cantine, il peut
      avoir à transmettre son quotient familial ou son revenu fiscal de
      référence pour obtenir le tarif adéquat. Ces informations sont pourtant
      déjà connues de la CAF, de la MSA ou de la direction générale des
      finances publiques.
    </p>

     <div class="fr-my-4w fr-highlight fr-highlight--green-menthe">
      <p class="fr-mb-0 fr-text--lg">
        Sur le site Simplifions.data, ce qu'on entend par
        <i>
          “simplifier vos démarches par la donnée”
        </i>
        ou
        <i>“récupérer les données utiles par démarche”</i>, c'est
        <b>aller chercher la donnée directement auprès de l'administration qui la
        détient</b> pour éviter de la demander à l'usager.
      </p>
    </div>

    <h3>Une obligation, le Dîtes-le nous une fois</h3>

      <p>
        Ce principe s'incarne dans l'obligation légale du
        <strong>Dites-le nous une fois</strong>, qui exige de l'administration
        qu'elle récupère les données administratives requises pour une démarche directement auprès de l'administration, si cela est possible.
      </p>

      <p>
        Ce principe est souvent plus connu et mis en oeuvre par les
        administrations ou collectivités de grande taille. Notamment parce qu'elles ont plus de ressources de développement pour intégrer les
        données via les tuyaux informatiques proposés par les administrations
        fournisseurs de la donnée.
      </p>

      <h3>Une opportunité accessible aussi aux petites collectivités</h3>

    <p >
      Pourtant, dans les petites collectivités, ce principe de récupération de la donnée à la source est souvent :
    </p>

    <ul class="fr-list guide-list">
      <li>
        <b>mis en oeuvre par les éditeurs de logiciels</b> qui
        sont déjà branchés à certains de ces tuyaux informatiques et en font bénéficier leurs clients publics ;
      </li>
      <li>
        <b>accessible sans ressources supplémentaires, via l'utilisation de sites en ligne</b> qui permettent à aux agents de consulter les données
        administratives des entreprises, des associations ou des particuliers.
      </li>
    </ul>
     <div class="fr-my-4w fr-highlight fr-highlight--green-menthe">
      <p class="fr-mb-0 fr-text--lg">
      L'objectif de simplifions.data.gouv.fr est de recenser les données
      accessibles et utiles par démarche administrative. Cela inclut les
      données brutes, mais aussi les sites de consultation utilisés par les
      agents et les logiciels métiers clés en main.
      </p>
    </div>

    </ArticleSection>

    <ArticleSection id="actions-rapides" label="À vérifier dès maintenant">
      <p class="fr-text--lead guide-section-lead">
        Pour s'assurer que votre collectivité utilise déjà bien les bases
        dont toute collectivité peut bénéficier, commencez par ces deux
        points :
      </p>

      <div class="fr-callout fr-callout--beige-gris-galet">
      <div class="fr-callout__text">
        <ul class="guide-bullets">
          <li>
            <b>
              Vérifier que vos agents connaissent bien les portails publics de
              consultation des données
            </b>
            <br />
            Gratuits et accessibles en quelques clics à tout agent public :
            <br />
            <a href="#sites-consultation" class="fr-link fr-icon-arrow-down-line fr-link--icon-right">En savoir plus</a>

          </li>
          <li>
            <b>
              Prendre connaissance des données déjà disponibles via vos
              éditeurs de logiciels
            </b>
            <br />
            Vous utilisez déjà sûrement des données récupérées à la source via
            vos différents logiciels éditeurs, redécouvrez lesquelles en
            recherchant votre éditeur.
            <br />
           <a href="#logiciels-editeurs" class="fr-link fr-icon-arrow-down-line fr-link--icon-right">En savoir plus</a>

          </li>
        </ul>
      </div>
      </div>
    </ArticleSection>

    <ArticleSection id="sites-consultation" label="Sites de consultation">
      <template #heading>Les sites de consultation, aucun développement ni budget requis</template>

    <p class="fr-text--lg">
    Il existe des sites en ligne accessibles aux agents publics permettant de consulter des données administratives des entreprises, associations et particuliers. Ces sites sont raccordés directement aux systèmes d'information de l'État et exposent donc des données récupérées à la source. 

    </p>
    <p>Voici trois sites publics, gratuits, accessibles aux agents publics et permettant aux agents publics de consulter des données protégées dans le strict cadre de leur mission :</p>

   
  <SimplifionsArticleTopicSpotlight :slugs="['formulaire-de-collecte-du-quotient-familial']" page-key="solutions" :show-image="false" :show-operateur-tag="true" :show-target-users="true" :show-arrow="true" >
    <p>
     <b>Votre collectivité applique certaines tarifications sur la base du quotient familial de la CAF ou de la MSA ?</b> Cet outil vous permet de collecter le QF de vos usagers utilisant FranceConnect. Ils n'ont qu'à se rendre sur le site, s'authentifier via FranceConnect et valider le transfert de leur quotient familial vers votre collectivité. Vos agents pourront alors récupérer le QF depuis un portail dédié (portail HubEE). 
    </p>
  </SimplifionsArticleTopicSpotlight>
  <SimplifionsArticleTopicSpotlight :slugs="['annuaire-des-entreprises']" page-key="solutions" :show-image="false" :show-operateur-tag="true" :show-target-users="true" :show-arrow="true" >
      <p>
        <b>Votre collectivité a besoin de données concernant les entreprises et les associations ?</b> L'annuaire des entreprises est le point d'entrée pour consulter ce type de données. Accessible gratuitement à tous pour les données en open data, il permet également à vos agents de consulter de la donnée protégée. La consultation de ce type de données se fait via un espace qui leur est dédié et uniquement dans le cadre de leurs missions.
      </p>
    </SimplifionsArticleTopicSpotlight>
      <SimplifionsArticleTopicSpotlight :slugs="['data-subvention']" page-key="solutions" :show-image="false" :show-operateur-tag="true" :show-target-users="true" :show-arrow="true" >
      <p>
        <b>Votre collectivité a besoin de connaître les subventions déjà versées à une association ?</b> Le portail Data.Subvention, uniquement accessibles aux agents publics, permet de consulter ce type d'informations.
      </p>
    </SimplifionsArticleTopicSpotlight>

    

    <div class="fr-my-4w fr-highlight fr-highlight--green-menthe">
      <p class="fr-mb-0 fr-text--lg">
        Tous ces sites sont accessibles aux agents publics, gratuitement, sous
        réserve d'une utilisation adaptée, dans le strict cadre de leurs
        missions.
      </p>
    </div>

    <p >
      Ils permettent notamment de couvrir une partie des besoins de nombreux
      cas d'usages. C'est un premier pas pour les agents pour récupérer les données. Les agents peuvent les consulter en ligne après s'être authentifiés. Les données sont tenues à jour
      le plus fréquemment possible. En revanche, la donnée n'est pas
      directement déposée dans les outils métiers des agents. C'est à eux de
      se rendre sur le site et de copier, coller ou télécharger les
      informations nécessaires pour instruire les démarches.
    </p>

    <div class="fr-grid-row fr-grid-row--center">
      <router-link
        class="fr-btn fr-btn--secondary fr-icon-arrow-right-line fr-btn--icon-right"
        to="/solutions?categorie-de-solution=portail-consultation"
      >
        Tous les portails de consultation référencés
      </router-link>
    </div>

    </ArticleSection>

  

    <ArticleSection id="logiciels-editeurs" label="Logiciels éditeurs">
      <template #heading>Les logiciels éditeurs : découvrez les données auxquelles vous avez déjà accès</template>

   
    <p class="fr-text--lg">
      Beaucoup de petites collectivités récupèrent déjà certaines informations et justificatifs de leurs usagers sans en avoir pleinement connaissance. En effet, parmi les logiciels éditeurs qu'elles utilisent, certains sont branchés sur les données de l'État pour justement mettre en oeuvre le dîtes-le nous une fois.
    </p>
     <h3 id="logiciels-editeurs-donnees-integrees">Les données disponibles par logiciel éditeur</h3>

        <div class="fr-my-4w fr-highlight fr-highlight--green-menthe">
      <p class="fr-mb-0 fr-text--lg">
   Simplifions.data.gouv.fr référence les logiciels métiers clés en main
      raccordés aux données utiles pour chaque démarche. Ainsi, vous pouvez,
      <b>depuis la page solution de chaque logiciel, vérifier les données
      auxquelles il est raccordé.</b>
      </p>
      <br/>
      <router-link
      class="fr-btn fr-btn--secondary fr-icon-seo-fill fr-btn--icon-right"
      to="/solutions"
            >
        Rechercher mon éditeur de logiciel
      </router-link>
    </div>
    <p >
      La liste des API et bases de données intégrées par logiciel éditeur se trouve, comme pour chaque solution, en bas de la page simplifions de la solution. Cette liste
      n'est pas exhaustive et sera complétée au fur et mesure. 
      <br/>
      <br/>
      Actuellement, la liste référence principalement les données fournies par deux
      API de l'État spécialisées pour la simplification des démarches : l'API Particulier
      et l'API Entreprise, qui distribuent respectivement de nombreuses données
      des particuliers ou des entreprises et associations.
    </p>


 <h3 id="logiciels-editeurs-api-particulier-et-entreprise">Les logiciels raccordés à l'API Entreprise et à l'API Particulier</h3>
    <p>
      Pour permettre aux administrations et collectivités de simplifier leurs démarches par la donnée, la direction interministerielle du numérique (DINUM) a mis en place deux briques informatiques chargées de regrouper et de distribuer par un même tuyau les données des particuliers et les données des entreprises et associations :
    </p>    
    <ul>
      <li>Le tuyau informatique chargé des <b>données de particuliers</b> est l'API Particulier ;</li>
      <li>Le tuyau informatique chargé des <b>données des entreprises</b> et des associations est l'API Entreprise.</li>
    </ul>
       <div class="fr-my-4w fr-highlight fr-highlight--green-menthe">
      <p class="fr-mb-0 fr-text--lg">
       Simplifions.data liste <b>tous les logiciels éditeurs raccordés aux données de l'API Entreprise et à l'API Particulier</b>, et indique pour chacun d'entre-eux, le nombre de données utiles
      et disponibles par type de démarche.
       <br/>
        <br/>
      <router-link
      class="fr-btn fr-btn--secondary fr-icon-arrow-right-line fr-btn--icon-right"
      to="/solutions/bouquet-api-particulier#solutions-integratices"
            >
       Logiciels éditeurs raccordés à l'API Particulier
      </router-link>
       <router-link
      class="fr-btn fr-mt-2w fr-btn--secondary fr-icon-arrow-right-line fr-btn--icon-right"
      to="/solutions/bouquet-api-entreprise#solutions-integratices"
            >
       Logiciels éditeurs raccordés à l'API Entreprise
      </router-link>
      </p>
    </div>
    </ArticleSection>

    <ArticleSection id="demarches-faciles-a-simplifier" label="Démarches faciles à simplifier">
      <template #heading>Les démarches faciles à simplifier, sans ressources supplémentaires</template>

      <p class="fr-text--lg">
     Voici quelques démarches où il vous est déjà possible de récupérer des données sans les demander aux usagers :
      </p>

      <SimplifionsArticleTopicSpotlight :slugs="['tarification-sociale-municipale-a-lenfance', 'tarification-cantine-scolaire-a-1-eur']" page-key="cas-d-usages" :show-arrow="true">
        <p><b>Vos tarifications municipales se basent sur le quotient familial de la CAF ou de la MSA ?</b> Celui-ci peut être récupéré facilement et sans ressources supplémentaires par les agents publics.</p>
      </SimplifionsArticleTopicSpotlight>
      <SimplifionsArticleTopicSpotlight :slugs="['subventions-des-associations-attribution', 'marches-publics-depot-et-instruction-des-candidatures']" page-key="cas-d-usages" :show-arrow="true">
        <p><b>Pour vos démarches auprès des entreprises et des associations</b> de nombreuses données sont déjà disponibles.</p>
      </SimplifionsArticleTopicSpotlight>
    </ArticleSection>

    <ArticleSection id="checklist" label="Récapitulatif">

    <p class="fr-text--lead guide-section-lead">
      Avant d'aller plus loin, vérifiez ces points dans votre collectivité.
    </p>

    <SimplifionsArticleChecklist>
       <li>
        Les agents chargés des <b>démarches des particuliers</b> basées sur le quotient familial connaissent
         <router-link
      class="fr-link"
      to="/solutions/formulaire-de-collecte-du-quotient-familial"
            >
      le formulaire de collecte du quotient familial
      </router-link>.
      </li>
      <li>
        Les agents chargés des <b>démarches des entreprises et associations</b> connaissent
         <router-link
      class="fr-link"
      to="/solutions/annuaire-des-entreprises"
            >
      l'annuaire des entreprises
      </router-link> et son espace agent.
      </li>
      <li>
        Les agents chargés de la délivrance des <b>subventions aux associations</b> connaissent
         <router-link
      class="fr-link"
      to="/solutions/data-subvention"
            >
      Data.Subvention
      </router-link>.
      </li>
      <li>
        Vous avez connaissance des <b>données auxquelles vos logiciels éditeurs sont raccordés</b>. <a href="#logiciels-editeurs-donnees-integrees" class=" fr-icon-arrow-up-line fr-link--icon-right">Lire la section concernée</a>.
      </li>
       <li>
        Pour bénéficier des données disponibles dans l'API Entreprise et l'API Particulier, vous avez consulté la liste des logiciels qui sont raccordés. <a href="#logiciels-editeurs-api-particulier-et-entreprise" class="fr-icon-arrow-up-line fr-link--icon-right">Lire la section concernée</a>.
      </li>
      <li>
        Vous avez passé en revue les démarches les plus faciles à simplifier. <a href="#demarches-faciles-a-simplifier" class=" fr-icon-arrow-up-line fr-link--icon-right">Lire la section concernée</a>.
      </li>
    </SimplifionsArticleChecklist>
    </ArticleSection>

    <ArticleSection id="cta" label="Pour aller plus loin">

    <p class="fr-text--lg">
      Pour aller plus loin, les prochaines étapes :
    </p>
    <ul class="fr-text--lg fr-mb-4w">
      <li>consulter les différentes démarches référencées sur Simplifions ;</li>
      <li>identifier de nouveaux logiciels métiers que vous pourriez utiliser ;</li>
      <li>vous familiariser avec les API et bases de données et peut-être en intégrer certaines directement dans votre système d'information.</li>
    </ul>

    <div class="fr-grid-row fr-grid-row--center">
      <router-link
        class="fr-btn fr-icon-arrow-right-line fr-btn--icon-right"
        to="/cas-d-usages"
      >
        Consulter le catalogue des démarches
      </router-link>
    </div>

    </ArticleSection>
  </SimplifionsArticleLayout>
</template>

<script lang="ts">
export const articleMeta = {
  id: 'guide-base-petites-collectivites',
  h1: 'Guide de base pour les petites collectivités',
  title: 'Guide de base pour les petites communes : simplification des démarches en récupérant les données à la source, sans développements',
  description:
    `Petites collectivités, simplifiez vos démarches administratives sans développement : portails publics gratuits et logiciels éditeurs déjà raccordés aux données vous permettent d'éviter de les redemander aux usagers.`,
  imageSrc: '/static/simplifions/assets/image-guide-de-base-collectivites-guichet-mairie-2.jpg',
  articleTags: [{ label: 'Petites communes' }, { label: 'Maires et adjoints' }, { label: 'Agent informaticien' }],
  articleCategory: 'guide',
  showNoDevelopmentBadge: true,
  heroBackdropGradient: 'linear-gradient(135deg, #34BAB5 0%, #d2e2f6 100%)',
  heroPanelBackground: 'var(--background-alt-beige-gris-galet)'
} as const
</script>

<script setup lang="ts">
import SimplifionsArticleLayout from '../../../components/article/SimplifionsArticleLayout.vue'
import SimplifionsArticleChecklist from '../../../components/article/SimplifionsArticleChecklist.vue'
import SimplifionsArticleTopicSpotlight from '../../../components/article/SimplifionsArticleTopicSpotlight.vue'
import ArticleSection from '../../../components/article/SimplifionsArticleSection.vue'
import { buildSimplifionsArticlePageMeta } from '../../../model/articles'
import { guidesMeta } from '../meta'
import { themeMeta } from './index'



const { article, articleKicker, breadcrumbLinks } = buildSimplifionsArticlePageMeta(
  themeMeta,
  articleMeta,
  [{ to: `/${guidesMeta.id}`, text: guidesMeta.title }],
  `/${guidesMeta.id}`
)


</script>

<style scoped>
.guide-card-skeleton {
  height: 200px;
  background: var(--background-alt-grey);
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.guide-card {
  height: 100%;
  background: var(--background-alt-grey);
}

.guide-card__label {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-mention-grey);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.guide-list {
  padding-left: 1.25rem;
  max-width: 72ch;
}

.guide-list li + li {
  margin-top: 0.5rem;
}

.guide-bullets {
  padding-left: 1.25rem;
  max-width: 72ch;
}

.guide-bullets li + li {
  margin-top: 1rem;
}


</style>
