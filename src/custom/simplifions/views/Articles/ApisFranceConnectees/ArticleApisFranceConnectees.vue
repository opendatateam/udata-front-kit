<template>
  <div class="fr-container fr-mt-4w">
    <h1>Les APIs FranceConnectées</h1>

    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-lg-8">
        <p class="fr-text--lead">
          Les API FranceConnectées donnent accès à diverses données
          administratives des particuliers en proposant FranceConnect comme
          modalité d'appel.
        </p>
        <p class="fr-mb-4w fr-text--lg">
          Elles permettent de simplifier les démarches d'un particulier
          utilisant FranceConnect en récupérant automatiquement d'autres
          informations administratives le concernant.
        </p>
      </div>

      <div class="fr-col-12 fr-col-lg-4">
        <nav
          class="fr-summary"
          role="navigation"
          aria-labelledby="fr-summary-title"
        >
          <ol>
            <li>
              <a id="summary-link-2" class="fr-summary__link" href="#definition"
                >Définition</a
              >
            </li>
            <li>
              <a id="summary-link-2" class="fr-summary__link" href="#acteurs"
                >Acteurs</a
              >
            </li>
            <li>
              <a
                id="summary-link-2"
                class="fr-summary__link"
                href="#possibilite-de-simplification"
                >Possibilités de simplification</a
              >
            </li>
            <li>
              <a
                id="summary-link-2"
                class="fr-summary__link"
                href="#liste-des-api-franceconnectees"
                >Liste des API FranceConnectées</a
              >
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <h2
      id="definition"
      class="fr-h2 fr-my-0w fr-mt-4w"
      style="
        color: black;
        background-color: rgb(167, 212, 205);
        padding: 2px 4px;
        display: inline-block;
      "
    >
      Définition
    </h2>

    <p class="fr-text--lead" style="text-align: center">
      Dans l'administration, on parle d'<i>«&nbsp;API FranceConnectée&nbsp;»</i>
      :
    </p>

    <div
      class="fr-grid-row fr-grid-row--gutters fr-ml-8w fr-mr-8w fr-mb-4w fr-grid-row--top"
    >
      <div class="fr-col-12 fr-col-md-6">
        <p class="fr-text--lead fr-text--bold" style="text-align: center">
          Lorsqu'une API est interrogée via le bouton FranceConnect ...
        </p>
        <figure role="group" class="fr-content-media fr-content-media--sm">
          <div class="fr-content-media__img">
            <img
              class="fr-responsive-img"
              src="/static/simplifions/assets/api-franceconnectees-bouton-france-connect.png"
              alt=""
              style="width: auto; height: 100%"
            />
          </div>
        </figure>
        <p class="fr-text--lg">
          Les API FranceConnectées permettent d'<b
            >utiliser l'identité pivot fournie par
            <a target="_blank" href="https://franceconnect.gouv.fr/partenaires"
              >FranceConnect</a
            >
            comme modalité d'appel.</b
          >
        </p>
      </div>
      <div class="fr-col-12 fr-col-md-6">
        <p class="fr-text--lead fr-text--bold" style="text-align: center">
          ... et lorsqu'elle délivre des données administratives des
          particuliers.
        </p>
        <figure role="group" class="fr-content-media fr-content-media--sm">
          <div class="fr-content-media__img">
            <img
              class="fr-responsive-img"
              src="/static/simplifions/assets/api-franceconnectees-donnees-personnelles.png"
              alt=""
              style="width: auto; height: 100%"
            />
          </div>
        </figure>
        <p class="fr-text--lg">
          Elles permettent de
          <b>transmettre des données administratives personnelles du citoyen</b
          >.
        </p>
      </div>

      <div class="fr-col-12">
        <p class="fr-text--lg">
          Selon le cadre d'utilisation, elles proposent également de
          <b>récupérer l'identité pivot utilisée et fournie par FranceConnect</b
          >.
        </p>
      </div>
    </div>

    <h2
      id="acteurs"
      class="fr-h2 fr-my-0w fr-mt-4w"
      style="
        color: black;
        background-color: rgb(167, 212, 205);
        padding: 2px 4px;
        display: inline-block;
      "
    >
      Les acteurs des API FranceConnectées
    </h2>

    <h3 class="fr-h4">FranceConnect et les fournisseurs d'identité :</h3>

    <p>
      Lors de l'intégration d'une API FranceConnectée dans votre service, il est
      pré-requis d'intégrer la
      <a href="/solutions/franceconnect-2">solution FranceConnect</a> car le
      bouton "FranceConnect" sera la modalité d'appel utilisée par l'API pour
      renvoyer les données à l'usager.
    </p>

    <p>
      En proposant le bouton FranceConnect sur votre service, vous permettez à
      vos usagers d'utiliser le <i>fournisseur d'identité</i> qu'il souhaitent
      pour s'authentifier (impots.gouv.fr, ameli.fr, l'Identité Numérique La
      Poste, etc.).
    </p>

    <blockquote class="fr-highlight">
      <p>
        💬 <strong>Rôle de FranceConnect :</strong><br />
        FranceConnect est votre interlocuteur pour intégrer le bouton
        FranceConnect, de l'habilitation à l'homologation, en passant par
        l'intégration. Par contre FranceConnect n'est pas en mesure de répondre
        à vos questions sur les données distribuées via les API
        FranceConnectées.
        <br /><br />
        💬 <strong>Rôle des fournisseurs d'identité :</strong><br />
        Les fournisseurs d'identité ne seront jamais vos interlocuteurs. En
        intégrant FranceConnect, tous les fournisseurs d'identité seront
        proposés à vos usagers quand ils cliqueront sur le bouton FranceConnect.
      </p>
    </blockquote>

    <h3 class="fr-h4">Les fournisseurs de données :</h3>
    <p>
      Différentes administrations mettent à disposition, après habilitation et
      via des API FranceConnectées, les données administratives des particuliers
      dont elles ont la charge. Dans l'univers des API FranceConnectées, ces
      administrations sont nommées <i>fournisseurs de données</i>.
    </p>

    <p>
      <b>En voici la liste :</b> Caisse nationale des allocations familiales
      (CNAF), Direction de la Sécurité sociale, Direction générale des finances
      publiques (DGFIP), France Travail, Ministère de l'Enseignement supérieur
      et de la Recherche, Ministère de l'Éducation nationale et Cnous.
    </p>

    <blockquote class="fr-highlight">
      <p>
        💬 <strong>Rôle des fournisseurs d'identité :</strong><br />
        Les fournisseurs de données sont vos interlocuteurs concernant la
        délivrance des accès, l'intégration et la maintenance des API
        FranceConnectées. C'est eux qui sont en mesure de répondre à vos
        questions concernant les données distribuées et le fonctionnement des
        API qu'ils opèrent.
        <br />
        <i>Si vous utilisez l'API Particulier</i>, ce service sera votre
        interlocuteur unique.
      </p>
    </blockquote>

    <p>
      <b>Afin de simplifier l'intégration des API FranceConnectées</b>, la
      <a href="/solutions/bouquet-api-particulier">solution API Particulier</a>
      regroupe dans un même bouquet d'API une grande partie des API
      FranceConnectées.
    </p>

    <blockquote class="fr-highlight">
      <p>
        💬 <strong>Rôle de l'API Particulier :</strong><br />
        Si vous accédez aux API FranceConnectées via ce bouquet d'API, API
        Particulier est votre interlocuteur unique pour l'habilitation,
        l'intégration et la maintenance des API FranceConnectées du bouquet. API
        Particulier est en mesure de répondre à vos questions concernant les
        données distribuées et le fonctionnement des API qu'il propose. En cas
        de difficulté, API Particulier se charge des échanges avec les
        fournisseurs de données.
      </p>
    </blockquote>

    <h2
      id="possibilite-de-simplification"
      class="fr-h2 fr-my-0w fr-mt-4w"
      style="
        color: black;
        background-color: rgb(167, 212, 205);
        padding: 2px 4px;
        display: inline-block;
      "
    >
      Possibilités de simplification
    </h2>

    <p class="fr-text--lead">
      Voici un comparatif entre une API appelée via une modalité d'appel
      classique <i>identifiant ou état civil</i> et une API appelée en mode
      "FranceConnectée", c'est-à-dire via l'identité pivot FranceConnect :
    </p>

    <table class="fr-table">
      <thead>
        <tr>
          <th></th>
          <th style="width: 40%">
            Modalité d'appel<br />Identité pivot ou Identifiant
          </th>
          <th style="width: 40%">Modalité d'appel<br />FranceConnect</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Étapes du parcours de l'usager</strong></td>
          <td>
            <ol>
              <li>
                L'usager se connecte via son compte personnel authentifié ou via
                FranceConnect ;
              </li>
              <li>
                Au cours de sa démarche, il recherche les informations
                nécessaires pour permettre l'appel aux API ne proposant pas la
                modalité d'appel FranConnect ; comme par exemple son numéro
                fiscal, son état civil ou son identifiant FranceTravail ;
              </li>
              <li>Il saisit ces informations ;</li>
              <li>
                Sa démarche est complétée des données récupérées via les API.
              </li>
            </ol>
          </td>
          <td>
            <ol>
              <li>L'usager se connecte via FranceConnect ;</li>
              <li>
                La démarche est déjà pré-remplie des informations récupérées via
                les API.
              </li>
            </ol>
          </td>
        </tr>
        <tr>
          <td><strong>Authentification de l'usager</strong></td>
          <td>❌ À vérifier par vos agents</td>
          <td>✅ Comprise avec la connexion</td>
        </tr>
        <tr>
          <td>
            <strong
              >Délivrance instantanée de données administratives complémentaires
              issues des API FranceConnectées</strong
            >
          </td>
          <td>
            ❌ Uniquement après vérification de l'identité de l'internaute par
            vos agents
          </td>
          <td>✅ Oui</td>
        </tr>
        <tr>
          <td>
            <strong
              >Moins de données personnelles dans votre système
              d'information</strong
            >
          </td>
          <td>
            ❌ Les données personnelles renseignées par l'usager pour appeler
            l'API transitent par votre système d'information
          </td>
          <td>
            ✅ Il est possible de choisir que l'identité pivot ne transite pas
            par votre système d'information
          </td>
        </tr>
        <tr>
          <td><strong>Périmètre des usagers couverts</strong></td>
          <td>✅ La totalité</td>
          <td>⚠️ Seulement les usagers ayant FranceConnect</td>
        </tr>
      </tbody>
    </table>

    <h2
      id="liste-des-api-franceconnectees"
      class="fr-h2 fr-my-0w fr-mt-4w"
      style="
        color: black;
        background-color: rgb(167, 212, 205);
        padding: 2px 4px;
        display: inline-block;
      "
    >
      Liste des API FranceConnectées
    </h2>

    <p class="fr-text--lead">
      Voici la liste des API pouvant être requêtées via un token FranceConnect :
    </p>

    <div v-if="apisLoading" class="fr-mt-4w">
      <p>Chargement des APIs en cours...</p>
    </div>

    <div v-else-if="apisFranceConnectees.length === 0" class="fr-mt-4w">
      <p>Aucune API FranceConnectée trouvée.</p>
    </div>

    <ul v-else class="fr-grid-row fr-grid-row--gutters list-none">
      <li
        v-for="apiOrDataset in apisFranceConnectees"
        :key="apiOrDataset.UID_datagouv"
        class="fr-col-12 fr-py-0 fr-mt-4w fr-px-0"
      >
        <SimplifionsDataApi :api-or-dataset="apiOrDataset" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import SimplifionsDataApi from '../components/SimplifionsDataApi.vue'
import { grist } from '../grist'
import type { ApiOrDataset } from '../model/grist'

const apisLoading = ref(true)
const apisFranceConnectees = ref<ApiOrDataset[]>([])

grist
  .getRecords('APIs_et_datasets', { API_FranceConnectee: [true] })
  .then((data) => {
    apisFranceConnectees.value = (
      data.map((record) => record.fields) as ApiOrDataset[]
    ).filter(
      (apiOrDataset) =>
        apiOrDataset.Visible_sur_simplifions && apiOrDataset.Type === 'API'
    )
    apisLoading.value = false
  })
  .catch((error) => {
    console.error('Failed to fetch APIs FranceConnectées:', error)
    apisLoading.value = false
  })
</script>

<style scoped>
.list-none {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
