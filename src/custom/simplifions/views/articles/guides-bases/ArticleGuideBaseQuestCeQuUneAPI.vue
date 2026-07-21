<template>
  <SimplifionsArticleLayout
    :h1="articleMeta.h1"
    :title="articleMeta.title"
    :lead="articleMeta.description"
    :article-tags="articleMeta.articleTags"
    :article-category="articleMeta.articleCategory"
    :show-no-development-badge="articleMeta.showNoDevelopmentBadge"
    :hero-backdrop-gradient="articleMeta.heroBackdropGradient"
    :hero-panel-background="articleMeta.heroPanelBackground"
  >
    <ArticleSection id="definition" label="Qu'est-ce qu'une API ?">
      <p class="fr-text--lead">
        API est un acronyme anglais — <em>Application Programming Interface</em> — qui
        désigne un mécanisme permettant à deux systèmes informatiques de
        communiquer entre eux. Derrière ce terme technique se cache une idée
        simple : deux ordinateurs qui s'échangent des informations, automatiquement,
        par internet.
      </p>

      <h3>Une analogie : le serveur au restaurant</h3>

      <p>
        Imaginez un restaurant. Vous êtes assis à table, la cuisine est
        en arrière-salle. Vous ne pouvez pas y entrer directement. Le serveur
        joue le <strong>rôle d'intermédiaire</strong> : vous lui donnez votre commande, il la
        transmet à la cuisine, et revient avec votre plat.
      </p>

      <p>
        <em>
          Une <strong>API</strong>, c'est <strong>ce serveur</strong> — mais entre deux ordinateurs.
          Elle transmet une demande d'un système à un autre, récupère la réponse,
          et la renvoie, sans que les deux systèmes aient besoin de se connaître
          directement.
        </em>
      </p>

      <h3>Un exemple concret</h3>

      <p>
        Lorsque vous utilisez une application météo sur votre téléphone, ce dernier ne dispose pas de capteurs pour mesurer la météo extérieure. Que fait l'application ? Elle envoie une demande, via une API, à un
        serveur météorologique, qui lui renvoie les données du moment. L'application
        affiche ensuite ces données — <i>sans que vous ayez eu à les chercher vous-même</i> —. Ce mécanisme de requête et d'affichage de données distantes est au cœur du fonctionnement de la majorité des applications connectées que vous utilisez au quotidien.
      </p>

      <div class="fr-my-4w fr-highlight fr-highlight--green-menthe">
        <p class="fr-mb-0 fr-text--lg">
          <b>C'est exactement ce qui peut se passer pour les démarches administratives</b> : par exemple, un formulaire en ligne peut être pré-rempli en interrogeant, via une API, un autre système informatique de l'État pour récupérer des informations, sans les demander à l'usager.
        </p>
      </div>
    </ArticleSection>

    <ArticleSection id="administration" label="API et Dîtes-le nous une fois">
      <template #heading>Les API du Dîtes-le nous une fois</template>

      <p class="fr-text--lg">
        L'administration française utilise de nombreuses données administratives : revenus fiscaux, quotient familial, statut d'une entreprise,
        attestations sociales… Ces données sont hébergées dans les systèmes
        informatiques des différentes administrations publiques.
      </p>

      <p>
        Dans le cas d'une démarche qui n'est pas simplifiée par l'utilisation d'API, lorsqu'un usager effectue la démarche, il lui est
        demandé de <strong>fournir lui-même</strong> ces informations sous forme de
        pièces justificatives : <i>avis d'imposition, certificat de scolarité,
        extrait Kbis…</i>
        <br />C'est sur lui que repose la charge de faire transiter ces données pourtant connues de l'administration.
      </p>

      <div class="fr-my-4w fr-highlight fr-highlight--green-menthe">
        <p class="fr-mb-0 fr-text--lg">
          <strong>Le principe du Dîtes-le nous une fois</strong>
          <br />
          La loi interdit désormais à une administration de demander à un usager
          une information qu'elle détient déjà ou qu'une autre administration peut
          lui communiquer. Les API sont le principal outil technique qui permet
          de mettre ce principe en pratique.
        </p>
      </div>

      <h3>Comment cela se concrétise pour les usagers et les agents ?</h3>

      <p>
        Lorsqu'une démarche requiert une information sur un particulier, une entreprise ou une association, le formulaire en ligne ou le logiciel de l'agent peut
        interroger directement le système de l'administration détentrice de cette
        donnée, via une API. La réponse arrive en quelques secondes, et peut pré-remplir le formulaire pour l'usager et/ou afficher les informations dans le logiciel de l'agent.
      </p>

      Par exemple :
      <ul class="fr-mb-3w">
        <li>
          Une commune qui traite une demande de tarification sociale peut récupérer le quotient familial directement auprès de la CAF, sans demander d'attestation à la famille. Elle n'est plus contrainte à une mise à jour annuelle — souvent liée à la difficulté de collecter les justificatifs — et peut choisir de recalculer la tarification aussi souvent qu'elle le souhaite, en s'appuyant sur un quotient familial toujours à jour.
        </li>
        <li>
          Une entreprise qui candidate à un marché public n'a plus besoin de saisir les informations générales de sa société — dénomination, adresse, code NAF, etc. Ces données sont pré-remplies automatiquement via une API qui interroge le répertoire Sirene de l'Insee. Cet exemple est justement illustré par le <a href="#demonstrateur">démonstrateur ci-dessous</a>.
        </li>
      </ul>
    </ArticleSection>

    <ArticleSection id="demonstrateur" label="Démonstrateur">
      <p>
        Pour ce démonstrateur, votre ordinateur utilise internet pour demander à un autre ordinateur des informations à propos des entreprises françaises.
        Pour cela, il utilise l'<a href="https://www.data.gouv.fr/dataservices/api-sirene-open-data">API Sirene de l'Insee</a> qui expose les données du répertoire Sirene.
      </p>
      <strong>Testez le fonctionnement de l'API en entrant le numéro de SIRET d'une entreprise ci-dessous :</strong>
      <p class="fr-text--sm">
        Par exemple, utilisez ce SIRET d'un établissement de La Poste : <strong>35600000000048</strong>
      </p>

      <ApiSireneDemo />

      <p>
        Ce mécanisme — une requête automatique vers une source de données distante,
        un affichage instantané du résultat — est exactement ce qui se passe lorsqu'une
        démarche administrative est simplifiée par une API.
      </p>
    </ArticleSection>

    <ArticleSection id="donnees-utilisees-par-l-api" label="Données utilisées par l'API">
      <template #heading>Données utilisées par l'API</template>

      <p class="fr-text--lg">
        Toute API utile pour simplifier une démarche repose sur un échange en deux temps :
        des <strong>données d'appel</strong> permettent d'identifier la personne ou l'entité concernée par la démarche,
        et des <strong>données de réponse</strong> la concernant sont renvoyées en retour.
      </p>

      <ul class="fr-mb-3w">
        <li>
          <strong>Données d'appel</strong> — informations transmises à l'API pour identifier
          la personne ou l'entité concernée.
          <SimplifionsArticleFigure
            src="/static/simplifions/assets/article-qu-est-ce-qu-une-api-donnees-appel.png"
            alt="Capture d'écran de la partie du démonstrateur d'API qui montre la donnée d'appel"
          >
            Exemple avec le <a href="#demonstrateur">démonstrateur</a> : le numéro SIRET de l'établissement est la donnée d'appel.
          </SimplifionsArticleFigure>
        </li>
        <li>
          <strong>Données de réponse</strong> — données renvoyées par l'API concernant l'entité ou la personne renseignée en appel. Ces données sont celles attendues dans la démarche usager et que l'on souhaite éviter de demander au particulier, à l'entreprise ou à l'association.
          <SimplifionsArticleFigure
            src="/static/simplifions/assets/article-qu-est-ce-qu-une-api-donnees-reponse.png"
            alt="Capture d'écran de la partie du démonstrateur d'API qui montre les données de réponse"
          >
            Exemple avec le <a href="#demonstrateur">démonstrateur</a> : adresse, code NAF, forme juridique, état administratif sont les données de réponse de l'API.
          </SimplifionsArticleFigure>
        </li>
      </ul>

      <h3>D'où proviennent les données d'appel ?</h3>

      <p>Pour interroger une API, il faut disposer d'au moins une information permettant d'identifier l'entité concernée. Cette information peut provenir de deux sources :</p>

      <ul class="fr-mb-3w">
        <li>
          <strong>L'usager lui-même</strong> — par exemple, en saisissant son SIRET, en s'authentifiant
          via FranceConnect, ou en communiquant son numéro fiscal lors de sa démarche.
        </li>
        <li>
          <strong>L'agent en charge du dossier</strong> — via le système informatique
          de son administration (dossier existant, base de bénéficiaires…) ou, en guichet,
          via les informations transmises directement par l'usager.
        </li>
      </ul>

      <h3>Les données d'appel et de réponse visibles sur Simplifions.data</h3>

      <p>
        Sur chaque API référencée par Simplifions comme étant utile pour une démarche, vous retrouverez
        ces deux types d'informations sous des libellés spécifiques :
      </p>

      <ul class="fr-mb-3w">
        <li><strong>«<span aria-hidden="true">✍️</span> Informations à saisir pour récupérer la donnée »</strong> correspond aux données d'appel ;</li>
        <li><strong>«<span aria-hidden="true" class="fr-icon-success-fill icon-green"></span> Données disponibles »</strong> correspond aux données de réponse.</li>
      </ul>

      <SimplifionsArticleFigure
        src="/static/simplifions/assets/article-qu-est-ce-qu-une-api-donnees-transmises-donnees-renvoyees-composant-api.png"
        alt="Capture d'écran d'un composant Simplifions montrant les données transmises à l'API et les données renvoyées"
      >
        Sur Simplifions, les données d'appel et de réponse sont présentées pour chaque API référencée.
      </SimplifionsArticleFigure>

      <br />

      <div class="fr-callout fr-callout--beige-gris-galet">
        <div class="fr-callout__text">
          <p class="fr-text--lead fr-text--bold">
            En résumé, avant de rechercher une API, posez-vous ces deux questions :
          </p>
          <ol class="fr-text--md fr-mt-2w">
            <li>
              <strong>De quelles informations disposez-vous pour appeler l'API ?</strong><br />
              Les données disponibles — côté agent ou côté usager — correspondent-elles
              aux paramètres d'appel acceptés par l'API ?<br />
              <i>Par exemple, si une API n'accepte que le numéro étudiant,
              elle ne pourra pas être utilisée si vous ne disposez que de l'état civil.</i>
            </li>
            <li>
              <strong>Quelles informations souhaitez-vous obtenir en retour ?</strong><br />
              Les données renvoyées par l'API couvrent-elles bien ce dont vous avez besoin
              pour instruire la démarche ?
            </li>
          </ol>
        </div>
      </div>
    </ArticleSection>

    <ArticleSection id="api-entreprise-particulier" label="Les API clés pour la simplification">
      <template #heading>Les API clés pour la simplification des démarches</template>

      <p class="fr-text--lg">
        La mise en œuvre du Dîtes-le nous une fois reposant en grande partie sur des échanges de données, différentes administrations mettent à disposition des API dédiées à cet objectif.
      </p>

      <SimplifionsArticleTopicSpotlight
        :slugs="['bouquet-api-entreprise', 'bouquet-api-particulier']"
        page-key="solutions"
        :show-image="false"
        :show-operateur-tag="true"
        :show-categorie-de-solution="true"
        :show-target-users="true"
        :show-arrow="true"
      >
        <p>
          Pour que les administrations n'aient pas à brancher des dizaines de
          connexions différentes à chaque source de données, <b>la direction
          interministérielle du numérique (DINUM) a créé deux API centralisatrices</b>,
          chacune spécialisée dans un type d'usager.
        </p>
      </SimplifionsArticleTopicSpotlight>

      <SimplifionsArticleTopicSpotlight
        :slugs="['api-impot-particulier', 'api-service-finances-publiques-sfip']"
        page-key="solutions"
        :show-image="false"
        :show-operateur-tag="true"
        :show-categorie-de-solution="true"
        :show-target-users="true"
        :show-arrow="true"
      >
        <p>
          <b>La direction générale des finances publiques a également mis en œuvre deux API dédiées à la simplification des démarches des particuliers</b>. Toutes deux délivrent les mêmes données en réponse, dont notamment le revenu fiscal de référence. C'est leurs données d'appel qui divergent : l'API Impôt particulier requiert le numéro fiscal ou une connexion via FranceConnect ; l'API SFIP requiert les données d'état civil du particulier.
        </p>
      </SimplifionsArticleTopicSpotlight>

      <SimplifionsArticleTopicSpotlight
        :slugs="['franceconnect-2']"
        page-key="solutions"
        :show-image="false"
        :show-operateur-tag="true"
        :show-categorie-de-solution="true"
        :show-target-users="true"
        :show-arrow="true"
      >
        <p>
          L'utilisation de l'<b>API FranceConnect permet d'utiliser en données d'appel une connexion de l'usager via FranceConnect</b>. Les API proposant ce paramètre d'appel sont prénommées des « API FranceConnectées ».
        </p>

        <router-link
          class="fr-btn fr-btn--secondary fr-icon-arrow-right-line fr-btn--icon-right"
          to="/apis-franceconnectees"
        >
          Les API FranceConnectées
        </router-link>
      </SimplifionsArticleTopicSpotlight>

      <h3>Qui peut utiliser ces API ?</h3>

      <p>
        Ces API sont en <strong>accès restreint</strong> : seules les administrations
        et les organismes chargés d'une mission de service public peuvent y accéder,
        après habilitation. Cela garantit que les données personnelles et
        confidentielles ne circulent qu'entre les entités qui ont un droit
        légal de les consulter.
      </p>

      <p>
        En pratique, l'accès se fait souvent de façon transparente pour les
        agents : c'est le <strong>logiciel métier</strong> qu'ils utilisent au
        quotidien qui est branché à ces API. Les agents bénéficient alors de l'accès à ces données sans même avoir connaissance de l'existence de ces API.
      </p>

      <div class="fr-my-4w fr-highlight fr-highlight--green-menthe">
        <p class="fr-mb-0">
          Simplifions.data.gouv.fr référence les logiciels métiers déjà raccordés
          à l'API Entreprise et à l'API Particulier. Si votre logiciel est dans
          la liste, vous bénéficiez peut-être déjà de ces données sans le savoir.
        </p>
        <br />
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
      </div>
    </ArticleSection>

    <ArticleSection id="recapitulatif" label="Récapitulatif">
      <SimplifionsArticleChecklist>
        <li>
          Une <strong>API</strong> est un intermédiaire qui permet à deux systèmes
          informatiques de s'échanger des données automatiquement, par internet.
        </li>
        <li>
          Les API sont un outil majeur pour appliquer le principe du <strong>Dîtes-le nous une fois</strong>.
        </li>
        <li>
          Toute API repose sur des <strong>données d'appel</strong> (pour identifier le particulier, l'association ou l'entreprise recherchée)
          et des <strong>données de réponse</strong> (les informations renvoyées).
        </li>
        <li>
          Avant de chercher une API, <strong>vérifiez que vous disposez des données d'appel nécessaires</strong> et que
          les données de réponse couvrent votre besoin.
        </li>
        <li>
          <router-link to="/solutions/bouquet-api-entreprise"><strong>L'API Entreprise</strong></router-link> et <router-link to="/solutions/bouquet-api-particulier"><strong>l'API Particulier</strong></router-link> (DINUM) centralisent de nombreuses données des entreprises,
          associations et particuliers auprès de multiples organismes.
        </li>
        <li>
          D'autres API spécialisées existent : <router-link to="/solutions/api-impot-particulier"><strong>l'API Impôt Particulier</strong></router-link> et
          <router-link to="/solutions/api-service-finances-publiques-sfip"><strong>l'API SFIP</strong></router-link> (DGFiP) pour les données fiscales,
          <router-link to="/solutions/franceconnect-2"><strong>FranceConnect</strong></router-link> pour utiliser une connexion usager comme donnée d'appel et accéder aux <router-link to="/apis-franceconnectees">API FranceConnectées</router-link>.
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
import SimplifionsArticleFigure from '../../../components/article/SimplifionsArticleFigure.vue'
import ApiSireneDemo from './ApiSireneDemo.vue'

const articleMeta = {
  h1: "Qu'est-ce qu'une API ?",
  title: "Qu'est-ce qu'une API ? Explication simple pour les non-techniciens",
  description:
    "Comprendre ce qu'est une API sans vocabulaire technique : comment ces outils permettent aux administrations d'échanger des données pour simplifier les démarches des entreprises, associations et particuliers.",
  articleCategory: 'guide' as const,
  showNoDevelopmentBadge: false,
  articleTags: [{}],
  heroBackdropGradient: 'linear-gradient(135deg, #5770be 0%, #d2e2f6 100%)',
  heroPanelBackground: 'var(--background-alt-beige-gris-galet)'
}
</script>

<style scoped>
.icon-green {
  color: var(--text-default-success);
}
</style>
