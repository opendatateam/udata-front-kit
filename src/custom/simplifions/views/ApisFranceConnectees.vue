<template>
  <div class="fr-container fr-mt-4w">
    <h1>Les APIs FranceConnectées</h1>

    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-lg-8">
      <p class="fr-text--lead">Les API FranceConnectées donnent accès à diverses données administratives des particuliers en proposant FranceConnect comme modalité d'appel.</p>
      <p class="fr-mb-4w fr-text--lg">Elles permettent de simplifier le parcours d'un particulier utilisant FranceConnect en récupérant d'autres informations administratives le concernant sans lui demander d'informations supplémentaires à celles obtenues via sa connexion
      </p>
      </div>

      <div class="fr-col-12 fr-col-lg-4">
      <nav class="fr-summary" role="navigation" aria-labelledby="fr-summary-title">
        <ol>
           <li>
                <a class="fr-summary__link" id="summary-link-2" href="#definition">Définition</a>
            </li>
            <li>
                <a class="fr-summary__link" id="summary-link-2" href="#possibilite-de-simplification">Possibilités de simplification</a>
            </li>
            <li>
                <a class="fr-summary__link" id="summary-link-2" href="#liste-des-api-franceconnectees">Liste des API FranceConnectées</a>
            </li>
        </ol>
      </nav>
      </div>
    </div>

 
      <h2 id="definition" class="fr-h4 fr-my-0w fr-mt-4w" style="color: black; background-color: rgb(167, 212, 205); padding: 2px 4px; display: inline-block;">Définition</h2>

      <p class="fr-text--lead">
      Dans l'administration, on parle d'<i>«&nbsp;API FranceConnectée&nbsp;»</i> : 
      </p>
    
    <div class="fr-grid-row fr-grid-row--gutters fr-ml-8w fr-mr-8w fr-grid-row--top">
    
      <div
        class="fr-col-12 fr-col-md-6">
         <h3 class="fr-text--lead" style="text-align: center">
         lorsqu'une API délivre des données administratives des particuliers ...
        </h3>
        <figure role="group" class="fr-content-media fr-content-media--sm ">
        <div class="fr-content-media__img ">
          <img
            class="fr-responsive-img"
            src="/static/simplifions/assets/api-franceconnectees-donnees-personnelles.png"
            alt=""
            style="width: auto; height: 100%"
          />
        </div>
      </figure>
      
        <p class="fr-text--lg">
           Les API FranceConnectées permettent de <b>transmettre des données administratives personnelles du citoyen</b>. Ces données sont fournies par diverses administrations, appelées <i>fournisseurs de données</i>. 
        </p>
      </div>
        <div class="fr-col-12 fr-col-md-6">
        <h3 class="fr-text--lead" style="text-align: center">
       ... et lorsqu'elle interrogée via le bouton FranceConnect.
        </h3>
        <figure role="group" class="fr-content-media fr-content-media--sm">
          <div class="fr-content-media__img">
            <img
              class="fr-responsive-img "
              src="/static/simplifions/assets/api-franceconnectees-bouton-france-connect.png"
              alt=""
              style="width: auto; height: 100%"
            />
          </div>
        </figure>
         <p class="fr-text--lg">Elles permettent d'<b>utiliser l'identité pivot fournie par FranceConnect comme modalité d'appel.</b>
         </p>
      </div>
      <div class="fr-col-12">
          <p class="fr-text--lg">Selon le cadre d'utilisation, elles proposent également de <b>récupérer l'identité pivot utilisée et fournie par FranceConnect</b>.</p>
      </div>

    </div>

    <p>
      <b>Elles sont opérées par différentes administrations</b>, telles que la caisse nationale des allocations familiales (CNAF), la direction de la Sécurité sociale, la direction générale des finances publiques (DGFIP), FranceTravail, le ministère de l'enseignement supérieur et de la recherche, le ministère de l'éducation nationale, le Cnous, etc.
    </p>
    
    <h2 id="possibilite-de-simplification" class="fr-h2 fr-my-0w fr-mt-4w" style="color: black; background-color: rgb(167, 212, 205); padding: 2px 4px; display: inline-block;">Possibilités de simplification</h2>


    <h3 class="fr-h4">Différences entre la modalité d'appel FranceConnect et les autres modalités</h3>

    <table class="fr-table">
      <thead>
        <tr>
          <th></th>
          <th>Modalité d'appel<br/>Identité pivot ou Indentifiant</th>
          <th>Modalité d'appel<br/>FranceConnect</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Action de l'usager</strong></td>
          <td>L'usager renseigne ses informations identifiantes</td>
          <td>L'usager se connecte à FranceConnect</td>
        </tr>
        <tr>
          <td><strong>Authentification de l'usager</strong></td>
          <td>❌ À vérifier par vos agents</td>
          <td>✅ Comprise avec la connexion</td>
        </tr>
        <tr>
          <td><strong>Délivrance instantanée de données administratives complémentaires issues des API FranceConnectées</strong></td>
          <td>❌ Uniquement après vérification de l'identité de l'internaute par vos agents</td>
          <td>✅ Oui</td>
        </tr>
        <tr>
          <td><strong>Moins de données personnelles dans votre système d'information</strong></td>
          <td>❌ Les données personnelles renseignées par l'usager pour appeler l'API transitent par votre SI</td>
          <td>✅ Il est possible de choisir que l'identité pivot ne transite pas par vos systèmes</td>
        </tr>
        <tr>
          <td><strong>Périmètre des usagers couverts</strong></td>
          <td>✅ La totalité</td>
          <td>⚠️ Seulement les usagers ayant FranceConnect</td>
        </tr>
      </tbody>
    </table>


    <h4>Pour les usagers :</h4>

    <p>Pour un usager se connectant à la démarche en ligne via FranceConnect :</p>
    <ul>
      <li><b>Sans les API FranceConnectées :</b>
        <ul>
          <li>L'usager se connecte via FranceConnect ;</li>
          <li>Au cours de sa démarche, il recherche les informations nécessaires pour permettre l'appel aux API ne proposant pas la modalité d'appel FranConnect ; comme par exemple son numéro fiscal, son état civil ou son identifiant FranceTravail ;</li>
          <li>Il saisit ces informations ;</li>
          <li>Sa démarche est complétée des données récupérées via les API.</li>
        </ul>
      </li>
      <li><b>Avec les API FranceConnectées :</b>
        <ul>
          <li>L'usager se connecte via FranceConnect ;</li>
          <li>La démarche est déjà pré-remplie des informations récupérées via les API.</li>
        </ul>
      </li>
    </ul>

  
    <h2 id="liste-des-api-franceconnectees" class="fr-h2 fr-my-0w fr-mt-4w" style="color: black; background-color: rgb(167, 212, 205); padding: 2px 4px; display: inline-block;">Liste des API FranceConnectées</h2>

    <p class="fr-text--lead">Voici la liste des API pouvant être requêtées via un token FranceConnect :</p>

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
