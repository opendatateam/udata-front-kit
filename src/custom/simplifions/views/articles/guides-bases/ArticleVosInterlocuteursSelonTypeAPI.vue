<template>
  <SimplifionsArticleLayout
    :h1="articleMeta.h1"
    :title="articleMeta.title"
    :lead="articleMeta.description"
    :article-tags="articleMeta.articleTags"
    :hero-backdrop-gradient="articleMeta.heroBackdropGradient"
    :hero-panel-background="articleMeta.heroPanelBackground"
  >
    <p class="fr-text--lg">
      Selon le type d'API que vous intégrez — bouquet mono ou
      multi-fournisseur, API à l'unité, API FranceConnectée — votre
      interlocuteur pour l'habilitation, l'intégration technique et le
      support n'est pas toujours le même. Ce guide vous aide à identifier qui
      contacter selon votre situation.
    </p>

     <SimplifionsArticleReadMore
      to="/qu-est-ce-qu-une-api"
      description="Comprendre ce qu'est une API sans vocabulaire technique."
    />

    <ArticleSection id="types-api" label="Types d'API">
      <p class="fr-text--lg">
        Dans l'écosystème des API utiles pour mettre en place le
        «&nbsp;Dites-le-nous une fois&nbsp;», il existe différents types pouvant se
        superposer :
      </p>

      <h3>Les bouquets d'API</h3>
      <p>
        Ces API regroupent, derrière un seul point d'entrée et un seul point
        de contact, plusieurs API, généralement organisées autour d'un
        secteur ou d'un usage commun. Ces «&nbsp;bouquets d'API&nbsp;»
        permettent donc d'accéder à de nombreuses données à partir d'une même
        API ayant plusieurs «&nbsp;branches&nbsp;», appelées
        «&nbsp;endpoints&nbsp;». On distingue deux types de bouquets d'API,
        ceux :
      </p>
      <ul>
        <li>
          <strong>regroupant les API d'un même fournisseur</strong> : Il
          s'agit d'un regroupement des API d'une même administration, comme
          par exemple le bouquet des API de FranceTravail.
        </li>
        <li>
          <strong>regroupant différents fournisseurs d'API</strong> : Il
          s'agit d'un regroupement d'API issues de différentes
          administrations fournisseurs d'API. Cette mise en commun permet
          d'accélérer l'intégration d'API grâce notamment à une demande
          d'habilitation unique et une cohérence technique (même
          authentification, mêmes conventions de nommage et de réponse).
          <br />
          <br />
          <SimplifionsArticleTopicSpotlight
            :slugs="['bouquet-api-entreprise', 'bouquet-api-particulier']"
            page-key="solutions"
            :show-operateur-tag="true"
            :show-categorie-de-solution="true"
            :show-target-users="true"
            :show-arrow="true"
          >
            <p>
              <strong
                >L'API Entreprise et l'API Particulier sont des bouquets
                d'API multi-fournisseurs</strong
              >
              conçus pour mettre en oeuvre le «&nbsp;Dites-le-nous une
              fois&nbsp;». L'API Entreprise donne accès aux données des
              entreprises <em> - Insee, Inpi, DGFIP, URSSAF, caisses de retraite...-</em> ; l'API Particulier, aux données des particuliers
              <em
                >- CAF/MSA, France Travail, ministères de l'éducation
                nationale et de l'enseignement supérieur...-</em
              >. Les intégrer permet aussi de bénéficier du travail métier
              effectué pour proposer une offre en cohérence avec les
              démarches à simplifier.
            </p>
          </SimplifionsArticleTopicSpotlight>
        </li>
      </ul>

      <h3>Les API classiques, «&nbsp;à l'unité&nbsp;»</h3>
      <p>
        Ces API sont propres à un seul fournisseur de données, comme l'API
        Impôt Particulier de la DGFiP ou l'API Statut étudiant du ministère
        de l'enseignement supérieur. Souvent très utiles et complémentaires
        aux bouquets, elles ont chacune leur propre formulaire
        d'habilitation, ainsi que leur propre gestion des accès et du
        support.
      </p>

      <SimplifionsArticleTopicSpotlight
        :slugs="['api-impot-particulier']"
        page-key="solutions"
        :show-operateur-tag="true"
        :show-categorie-de-solution="true"
        :show-target-users="true"
        :show-arrow="true"
      >
        <p>
          <strong>L'API Impôt Particulier de la DGFiP</strong> est un exemple
          d'API «&nbsp;à l'unité&nbsp;» : elle est propre à un seul
          fournisseur et dispose de sa propre demande d'habilitation,
          distincte de celle des bouquets d'API.
        </p>
      </SimplifionsArticleTopicSpotlight>

      <h3>Les API FranceConnectées</h3>
      <p>
        Il s'agit d'une catégorie d'API qui ne concerne que les données des
        particuliers. Elles sont dites «&nbsp;FranceConnectées&nbsp;», car
        elles peuvent être appelées avec l'identité pivot FranceConnect
        plutôt qu'un simple identifiant. Ce niveau d'intégration
        supplémentaire simplifie le parcours de l'usager, sous conditions de
        quelques prérequis techniques spécifiques.
      </p>

      <SimplifionsArticleReadMore
        to="/apis-franceconnectees"
        description="Consulter la liste de toutes les API FranceConnectées"
      />
    </ArticleSection>

    <ArticleSection id="interlocuteurs" label="Acteurs et interlocuteurs">
      <p class="fr-text--lg">
        Voici les différents acteurs et leurs implications au cours de
        l'intégration d'une API :
      </p>

      <div class="fr-table">
        <table>
          <thead>
            <tr>
              <th>Acteur</th>
              <th>Rôle</th>
              <th>Exemple</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Le fournisseur de la donnée</strong></td>
              <td>
                Détient et produit la donnée. C'est votre interlocuteur s'il
                est également l'opérateur de l'API ou du bouquet, autrement ce n'est pas votre point de contact.
              </td>
              <td>
                <em>La DGFiP pour pour une attestation
                fiscale, la CAF ou la MSA pour le quotient familial, le
                Cnous pour le statut boursier.</em>
              </td>
            </tr>
            <tr>
              <td><strong>L'opérateur de l'API</strong></td>
              <td>
               Gère l'API et la met à disposition. C'est
                votre interlocuteur, sauf si vous utilisez son API via un
                bouquet. Dans ce dernier cas, c'est alors l'opérateur du
                bouquet qui est votre interlocuteur.
              </td>
              <td><em>La Caisse nationale d'assurance vieillesse pour l'API quotient familial.</em></td>
            </tr>
            <tr>
              <td><strong>L'opérateur du bouquet</strong></td>
              <td>
              Gère le bouquet d'API et tous ses endpoints. Si vous utilisez un bouquet d'API regroupant des API de
                plusieurs fournisseurs, il s'agit de votre interlocuteur
                unique pour l'habilitation, l'intégration technique et le
                support, pour toutes les API du bouquet.
              </td>
              <td><em>La DINUM pour l'API Particulier et l'API Entreprise.</em></td>
            </tr>
            <tr>
              <td><strong>FranceConnect</strong>, le cas échéant</td>
              <td>
                Gère l'identité pivot utilisée comme paramètre d'appel des
                API FranceConnectées. C'est votre interlocuteur uniquement
                sur cet aspect, si vous intégrez la version FranceConnectée
                d'une API.
              </td>
              <td><em>FranceConnect, pour toute API FranceConnectée.</em></td>
            </tr>
            <tr>
              <td>
                <strong>Votre éditeur de logiciel métier</strong>, le cas
                échéant
              </td>
              <td>
                Gère votre ou vos logiciels métiers et intègre les API à
                l'intérieur. C'est votre interlocuteur privilégié. En cas de
                difficulté concernant une API, c'est lui que vous devez
                contacter en premier, notamment parce que le problème
                rencontré peut provenir du logiciel et non de l'API. Si
                l'éditeur constate que le problème provient bien de l'API,
                c'est à lui de contacter l'opérateur de l'API ou du bouquet
                d'API.
              </td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="">
        <b>Par exemple, pour l'API Quotient familial CAF/MSA</b> : 
      </p>
      <ul>
        <li>Les
          <b>fournisseurs de la donnée</b> sont la Caisse d'allocation familiale (CAF) et la Mutuelle sociale agricole (MSA) ;</li>
        <li>L'<b>opérateur de
          l'API</b> est la caisse nationale d'assurance vieillesse (CNAV) pour des
          raisons internes aux systèmes d'informations de l'État ;</li>
          <li>L'<b>opérateur du bouquet</b>
          est la DINUM car l'API est
          distribuée dans le bouquet API Particulier ; </li>
          <li><em>Si vous utilisez la version FranceConnectée de l'API Quotient familial</em>, FranceConnect est votre interlocuteur sur cet aspect via son API FranceConnect ;</li>
          <li><em>Si l'API Quotient familial CAF/MSA a été intégrée par votre éditeur</em>, cet éditeur reste votre interlocuteur privilégié à contacter en premier lieu en cas de difficulté.</li>
      </ul>
    </ArticleSection>

    <ArticleSection id="recapitulatif" label="Pour résumer">
      <SimplifionsArticleChecklist>
        <li>
          <strong>Trois familles d'API, à combiner selon vos besoins.</strong>
          Bouquets (un point d'entrée pour plusieurs API, mono ou
          multi-fournisseurs), API à l'unité, ou API FranceConnectées : ces
          catégories se complètent et répondent à des besoins différents.
        </li>
        <li>
          <strong>Identifiez vos interlocuteurs.</strong> Selon votre situation et le type d'API que vous utilisez, votre point de contact est différent.
        </li>
        <li>
          <strong>Votre éditeur est toujours votre premier point de contact,</strong> s'il a été en charge de l'intégration de l'API.
        </li>
      </SimplifionsArticleChecklist>
    </ArticleSection>
  </SimplifionsArticleLayout>
</template>

<script setup lang="ts">
import SimplifionsArticleLayout from '../../../components/article/SimplifionsArticleLayout.vue'
import ArticleSection from '../../../components/article/SimplifionsArticleSection.vue'
import SimplifionsArticleChecklist from '../../../components/article/SimplifionsArticleChecklist.vue'
import SimplifionsArticleTopicSpotlight from '../../../components/article/SimplifionsArticleTopicSpotlight.vue'
import SimplifionsArticleReadMore from '../../../components/article/SimplifionsArticleReadMore.vue'

const articleMeta = {
  h1: "Vos interlocuteurs selon le type d'API",
  title: "Vos interlocuteurs selon le type d'API",
  description:
    "Bouquet d'API mono ou multi-fournisseur, API à l'unité, API FranceConnectée : identifiez qui contacter — fournisseur de la donnée, opérateur de l'API ou du bouquet, éditeur métier — selon le type d'API que vous intégrez.",
  articleTags: [],
  heroBackdropGradient: 'linear-gradient(135deg, #2c5f8a 0%, #d2e2f6 100%)',
  heroPanelBackground: 'var(--background-alt-beige-gris-galet)'
}
</script>
