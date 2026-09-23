<script setup lang="ts">
import AlbertChatPanel from '@/components/albert/AlbertChatPanel.vue'
import UniverseEditor from '@/components/universe/UniverseEditor.vue'
import { useAlbertChatStore } from '@/store/AlbertChatStore'
import { useUniverseStore } from '@/store/UniverseStore'

// Resolves the config/universe chicken-and-egg problem by imposing order:
// the universe (a data.gouv.fr Topic) is defined first, so the config step
// never has to guess a competing tag/filter — it just themes the site
// around a universe that already exists. Both /universe and /editor stay
// available standalone afterward for further iteration; this wizard only
// sequences them for the initial bootstrap.
const universeStore = useUniverseStore()
const albertChat = useAlbertChatStore()

const step = ref<'universe' | 'config'>('universe')
const wizardSteps = ["Définir l'univers", 'Configurer le site']
const currentStepNumber = computed(() => (step.value === 'universe' ? 1 : 2))

const buildWizardPrompt = () => {
  const topicName = universeStore.topic?.name ?? 'Univers'
  const topicDescription = universeStore.topic?.description
  const titles =
    universeStore.datasets.map((d) => d.title).join(', ') ||
    'aucun jeu de données pour le moment'
  return `Univers défini par l'utilisateur — nom : « ${topicName} »${topicDescription ? `, description : ${topicDescription}` : ''}. Jeux de données inclus : ${titles}.

L'utilisateur a précédemment défini l'univers d'un portail thématique data.gouv.fr, c'est à dire le contenu du portail, l'ensemble des données issues de data.gouv.fr qui seront découvrables sur le portail.

Tu dois maintenant configurer le contenant du portail : l'apparence, la mise en forme et les filtres de recherche de la page "datasets" (par type, organisation, etc.). Tout ce dont tu as besoin pour ça est déjà dans l'univers ci-dessus : n'interroge pas l'utilisateur champ par champ pour le lui faire confirmer.

Dès ton premier message, déduis directement une proposition complète et cohérente (titre du portail, URL sous la forme "{thématique}.data.gouv.fr", description, palette de 3 couleurs pastel en dégradé, filtres de recherche pertinents pour les jeux de données listés) et présente-la en texte libre, en français, de façon lisible. Ne demande pas de confirmation champ par champ : présente la proposition complète d'un coup, puis demande à l'utilisateur de la valider ou d'indiquer ce qu'il souhaite changer.

N'appelle l'outil propose_config qu'une fois que l'utilisateur a validé cette proposition (ou demandé des ajustements que tu as intégrés dans un nouveau résumé texte, validé à son tour) — jamais avant. Ton modèle ne peut pas produire à la fois un texte et un appel d'outil dans le même message : résume toujours d'abord en texte libre, appelle propose_config seulement ensuite, une fois validé.

Le site affiche par défaut un bandeau "site de démarrage généré automatiquement" (website.notice), pertinent tant qu'il n'a pas de thème. Une fois que l'utilisateur a validé ta proposition et que tu appelles propose_config, inclus systématiquement website.notice.display à false dans cet appel pour faire disparaître ce bandeau : le site a désormais un vrai thème, ce n'est plus un simple squelette.

Réserve l'outil ask_question aux seuls cas où un choix est vraiment impossible à déduire de l'univers (jamais pour faire valider un champ que tu peux raisonnablement deviner).

N'appelle jamais les deux outils dans la même réponse.`
}

// Seeds a fresh, dedicated conversation without touching the persisted
// default prompt used by the standalone /editor page. No dataset-scoping
// tool capability to drop here — propose_config never offers one, in
// either flow (see AlbertChatStore.ts).
const goToConfigStep = () => {
  albertChat.reset({ systemPrompt: buildWizardPrompt() })
  step.value = 'config'
}
</script>

<template>
  <div class="fr-container fr-my-4w">
    <h1>Assistant de démarrage</h1>
    <p class="fr-text--sm">
      Deux étapes : définissez d'abord les données de votre site (votre
      univers), puis générez sa présentation avec Albert à partir de cet
      univers.
      <RouterLink to="/universe">L'éditeur d'univers</RouterLink>
      et
      <RouterLink to="/editor">l'éditeur de configuration</RouterLink>
      restent disponibles séparément pour vos futures modifications.
    </p>

    <DsfrStepper
      :steps="wizardSteps"
      :current-step="currentStepNumber"
      class="fr-mb-3w"
    />

    <section v-if="step === 'universe'">
      <UniverseEditor />
      <div
        class="fr-btns-group fr-btns-group--inline fr-btns-group--right fr-mt-2w"
      >
        <button
          type="button"
          class="fr-btn"
          :disabled="!universeStore.topicId"
          @click="goToConfigStep"
        >
          Étape suivante : configurer le site
        </button>
      </div>
    </section>

    <section v-else>
      <button
        type="button"
        class="fr-btn fr-btn--secondary fr-mb-3w"
        @click="step = 'universe'"
      >
        ← Revenir à l'univers
      </button>
      <AlbertChatPanel :allow-start-without-input="true" />
    </section>
  </div>
</template>
