<template>
  <div class="fr-container fr-mt-4w">
    <h1>Les APIs FranceConnectées</h1>

    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-lg-8">
      <p class="fr-text--lead">Les API FranceConnectées donnent accès à diverses données administratives des particuliers en proposant FranceConnect comme modalité d'appel.</p>
      <p class="fr-mb-4w fr-text--lg">Elles permettent de simplifier le parcours d'un usager utilisant FranceConnect en récupérant d'autres informations administratives le concernant sans lui demander d'informations supplémentaires à celles obtenues via sa connexion
      </p>
      </div>

      <div class="fr-col-12 fr-col-lg-4">
      <nav class="fr-summary" role="navigation" aria-labelledby="fr-summary-title">
        <ol>
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



    <h2 id="possibilite-de-simplification" class="fr-h2 fr-my-0w fr-mt-4w" style="color: black; background-color: rgb(167, 212, 205); padding: 2px 4px; display: inline-block;">Possibilités de simplification</h2>

    <h3 class="fr-h4">Fonctionnement général :</h3>

    <p>
    Les API FranceConnectées utilisent l'identité pivot fournie par FranceConnect comme modalité d'appel. Ainsi, elles permettent de transmettre, <i>en plus des données d'identité transmises par FranceConnect</i>, d'autres données personnelles du citoyen lorsqu'il se connecte à la démarche en ligne via FranceConnect.
    </p>

    <p>
    <b>Elles sont opérées par différentes administrations</b>, telle que la caisse nationale des allocations familiales (CNAF), la direction de la Sécurité sociale, la direction générale des finances publiques (DGFIP), FranceTravail, le ministère de l'enseignement supérieur et de la recherche, le ministère de l'éducation nationale, le Cnous, etc.
    </p>

    <h3 class="fr-h4">Parcours usager :</h3>

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
