<template>
  <div class="reco-solution fr-p-2w fr-mb-2w">
    <h4 class="fr-h4 fr-mb-2w">
      {{ reco_solution.Nom_de_la_solution_publique }}
    </h4>

    <p>
      <strong>
        <span
          aria-hidden="true"
          style="color: #27a658"
          class="fr-icon-success-fill"
        ></span>
        En quoi cette solution est utile pour ce cas d'usage ?
      </strong>
      <br />
      {{
        reco_solution.En_quoi_cette_solution_est_elle_utile_pour_ce_cas_d_usage_
      }}
    </p>

    <p>
      <strong>🧑 Concrètement, pour les usagers :</strong>
      <br />
      {{ reco_solution.Concretement_pour_les_usagers_ }}
    </p>

    <p>
      <strong>🧑‍💼 Concrètement, pour vos agents :</strong>
      <br />
      {{ reco_solution.Concretement_pour_vos_agents_ }}
    </p>

    <p>
      <strong>
        <span
          aria-hidden="true"
          style="color: #ff292f"
          class="fr-icon-error-fill"
        ></span>
        Ce que ne fait pas cette solution :
      </strong>
      <br />
      {{ reco_solution.Ce_que_ne_fait_pas_cette_solution_ }}
    </p>
  </div>
</template>

<style scoped>
.reco-solution {
  background-color: #f6f6f6;
  /* padding: 15px; */
  border-radius: 4px;
}
</style>

<script setup lang="ts">
const props = defineProps<{
  reco_solution: Record<string, any>
}>()

const reco_solution = props.reco_solution
</script>
