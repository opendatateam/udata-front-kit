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
      <em
        >Pré-remplir automatiquement les informations d'une entreprise à partir
        de son numéro de SIRET&nbsp;? Connaître le statut boursier d'un étudiant
        qui demande une réduction de transport&nbsp;? C'est possible grâce aux
        API référencées dans le catalogue de Simplifions.data</em
      >. Néanmoins, entre le moment où vous prenez connaissance de l'existence
      d'une API et le moment où elle est utilisée en
      production dans votre service, plusieurs étapes se succèdent. 
    </p>
    <p class="fr-text-lg">
      <b>Ce
      guide s'adresse aux acteurs publics souhaitant intégrer des API</b> et donne une vision détaillée des
      étapes et prérequis nécessaires à l'intégration de toute API conçue pour
      simplifier des démarches via la récupération des données de l'usager —
      <em>principe du «&nbsp;Dites-le-nous une fois&nbsp;»</em>.
    </p>

    <div class="fr-highlight fr-highlight--green-menthe fr-my-4w">
      <p>
      <b>💡 Les informations de cet article s'appliquent si vous intégrez
      vous-même une API.</b> Si vous passez par un éditeur de logiciel métier, la
      charge est bien plus légère&nbsp;: il s'agit d'identifier vos
      cas d'usages, les données utiles et de prendre connaissance des logiciels éditeurs les ayant intégrées.
    </p>
    </div>

    <SimplifionsArticleReadMore
      to="/qu-est-ce-qu-une-api"
      description="Comprendre ce qu'est une API sans vocabulaire technique."
    />



    <ArticleSection id="prerequis" label="Prérequis">
       <template #heading>Les prérequis avant de démarrer</template>
      <p class="fr-text--lg">
        Voici quatre familles de prérequis que vous pouvez vérifier bien avant d'intégrer une API pour gagner du temps :
      </p>

      <h3>1. Un prérequis de conception : penser au parcours de vos usagers</h3>

      <h4>Vérifier que l'API délivre les données dont vous avez besoin</h4>

      <p>
        Avant de demander l'accès à une API ou de vous y raccorder, prenez le temps
        de consulter la documentation technique de l'API (souvent un <i>swagger</i> ou
        une spécification <i>OpenAPI</i>) pour vérifier que les données renvoyées
        correspondent réellement à votre besoin. Trois points de vigilance
        reviennent régulièrement :
      </p>

      <ul class="fr-mb-3w">
        <li>
          <strong>La granularité de la réponse</strong>. Certaines API renvoient
          un simple statut ou une réponse par oui ou par non -
          <em>par exemple, «&nbsp;est demandeur d'emploi : oui/non&nbsp;»</em>
          -, tandis que d'autres renvoient un objet complet avec de nombreuses
          données associées
          <em> - état civil, coordonnées, dates d'inscription... -</em>. Dans le
          cas d'une API délivrant des données protégées, une API plus riche que
          nécessaire vous imposera de gérer, sécuriser et minimiser des données
          dont vous n'avez pas l'usage — au moment de votre demande
          d'habilitation, il vous sera demandé de veiller au respect du principe
          de minimisation des données.
        </li>
        <li>
          <strong>Le périmètre couvert</strong>. Une API peut comporter des
          exceptions géographiques, temporelles ou statutaires : par exemple,
          certains territoires ou situations particulières peuvent être exclus
          du périmètre. Vérifiez que votre public cible est bien couvert et
          anticipez des parcours alternatifs pour les usagers qui ne le sont
          pas.
        </li>
        <li>
          <strong>La fraîcheur des données</strong>. Selon l'API, la donnée peut
          être mise à jour en temps réel, quotidiennement, ou selon une
          fréquence propre au fournisseur. Assurez-vous que la fréquence de mise
          à jour est compatible avec votre cas d'usage.
        </li>
      </ul>

      <h4>
        Identifier comment récupérer les informations de l'usager qui
        permettront d'appeler l'API
      </h4>

      <p>
        Pour appeler une API, il faut lui
        fournir un ou plusieurs <strong>paramètres d'appel</strong> qui permettent d'identifier
        l'entité dont on souhaite récupérer/pré-remplir les données. Selon
        l'API, ces paramètres peuvent être un numéro de SIRET/SIREN pour
        une association ou une entreprise, un numéro fiscal ou les données d'état civil pour
        un particulier.
      </p>

      <p>
        Avant d'intégrer une API, il faut donc décider à quel endroit et comment
        vous allez pouvoir obtenir ce paramètre auprès de l'usager ou de
        l'agent. C'est un choix de conception produit à part entière qui est déterminant pour la qualité de l'expérience usager.
      </p>

      <h4>Maquetter ou prototyper avant de développer</h4>

      <p>
        Il n'est pas nécessaire d'attendre l'accès aux API pour valider vos
        parcours. Au contraire, les anticiper en lisant les spécifications des
        API vous permettra de vous assurer que l'API correspond à votre besoin.
        Certaines API délivrant de la donnée protégée mettent à disposition des environnements de tests qui
        permettent même de concevoir tout votre produit avec de la donnée
        fictive en attendant d'obtenir l'accès.
      </p>

      <SimplifionsArticleReadMore
      to="/anticiper-le-parcours-usager-avant-d-integrer-vos-api"
      description="Découvrez comment utiliser les API au sein du parcours usager, selon que la donnée est publique ou protégée :"
      />

      <h3>
        2. Un prérequis juridique si l'API distribue des données protégées
      </h3>
      <h4>Cadre légal</h4>
      <p>
        L'accès aux API permettant la mise en œuvre du «&nbsp;Dites-le-nous une
        fois&nbsp;» et distribuant des données protégées requiert une
        habilitation.
      </p>

      <p>
        Chaque demande d'accès doit être justifiée par un
        <strong>cadre juridique précis</strong> : texte de loi ou règlementaire
        spécifiant que votre administration est habilitée à demander ces
        informations pour traiter une démarche usager. Pour les collectivités, une
        <strong>délibération</strong> décrivant précisément les données
        nécessaires,
        <em
          >par exemple le barème tarifaire lié au quotient familial pour une
          tarification de cantine</em
        >, est souvent requise.
      </p>

      <p class="fr-mb-0">
        Simplifions.data vous aide dans l'identification de ce cadre juridique :
      </p>

      <SimplifionsArticleFigure
        src="/static/simplifions/assets/article-prerequis-etapes-integration-api-exemple-cadre-juridique-dans-simplifions.png"
        alt="Capture d'écran d'un exemple de cadre juridique affiché sur Simplifions.data"
      >
        Exemple de cadre juridique renseigné pour un cas d'usage sur
        Simplifions.data.
      </SimplifionsArticleFigure>

      <h4>Contacts</h4>
      <p class="fr-mt-3w">
        Une demande d'habilitation mobilise généralement plusieurs contacts au sein de votre administrtation (qui
        peuvent parfois être la même personne) :
      </p>

      <div class="fr-table">
        <table>
          <thead>
            <tr>
              <th>Rôle</th>
              <th>Responsabilité</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Contact technique</strong></td>
              <td>
                Responsable de l'intégration technique et de la maintenance de
                l'API dans votre système d'information. C'est lui qui pourra récupérer les « clés d'accès techniques », en aura la gestion et devra s'assurer de leur validité. Il devra également s'informer des opérations de maintenance et des incidents. Certains services l'abonneront par défaut à ces informations.
              </td>
            </tr>
            <tr>
              <td>
                <strong>Contact métier</strong>
                <br />
                <i>— contact moins fréquemment demandé</i>
              </td>
              <td>
                Point de contact pour les questions fonctionnelles/métier sur le
                service. Lorsqu'il est demandé, c'est lui qui est informé des
                nouvelles API et des incidents majeurs. Distinct du contact
                technique, il est orienté usage plutôt qu'intégration.
              </td>
            </tr>
            <tr>
              <td><strong>Délégué à la protection des données</strong></td>
              <td>
                S'assure que l'organisation protège correctement les données
                personnelles conformément à la réglementation. Cette personne
                doit pouvoir exercer en toute indépendance en étant à l'abri des
                conflits d'intérêt, elle ne peut donc pas être ni le contact technique, ni le contact métier. C'est le point de contact de la
                CNIL en cas de problème. Dans les collectivités, le DPD est souvent mutualisé avec
                d'autres collectivités.
              </td>
            </tr>
            <tr>
              <td><strong>Responsable de traitement</strong></td>
              <td>
                Détermine seul ou conjointement les finalités et moyens du
                traitement des données personnelles. Dans les communes, le
                responsable de traitement est le ou la maire.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>3. Un prérequis technique minimal</h3>

      <p>
        Le niveau d'exigence technique dépend de l'ouverture de l'API utilisée.
      </p>

      <p>
        <strong>Pour les API en accès libre</strong>, les prérequis sont légers
        :
      </p>

      <ul class="fr-mb-3w">
        <li>
          gérer des appels HTTPS simples, sans authentification particulière ;
        </li>
        <li>
          pouvoir traiter du JSON et l'intégrer dans votre système d'information
          ou votre site.
        </li>
      </ul>

      <p>
        <strong>Pour les API à accès restreint</strong>, les exigences sont plus
        poussées. Votre équipe technique doit être en mesure de :
      </p>

      <ul class="fr-mb-3w">
        <li>
          gérer des appels HTTPS sortants depuis un serveur back-end (jamais
          depuis un site en front-end : le jeton d'accès serait exposé) ;
        </li>
        <li>
          autoriser, le cas échéant, l'adresse IP du service dans votre pare-feu
          ;
        </li>
        <li>
          selon le fournisseur, justifier d'un niveau de sécurité suffisant de
          votre système d'information (questionnaire ou homologation de
          sécurité) ;
        </li>
        <li>
          gérer le renouvellement des jetons d'accès à l'API.
        </li>
      </ul>

      <p><b>Que ce soit pour les API en accès libre ou restreint
</b>, il est indispensable de prévoir de la maintenance dans la durée pour gérer les montées de version des API, suivre les accidents, etc...</p>

      <h3>4. Un prérequis budgétaire</h3>

      <p>
        L'utilisation des API référencées sur Simplifions.data et utiles pour le
        «&nbsp;Dites-le-nous une fois&nbsp;» est gratuite. Mais le raccordement
        (développement, tests, maintenance, montée de version de l'API) reste à
        votre charge, il est donc nécessaire de prévoir ces coûts de
        développement initial et de maintien en conditions opérationnelles.
      </p>
    </ArticleSection>



    <ArticleSection
      id="etapes-integration"
      label="Étapes d'intégration"
    >
       <template #heading>Les étapes d'intégration d'une API</template>
      <p class="fr-text--lg">
        Les étapes d'intégration d'une API dépendent de l'ouverture de l'API :
        une API en accès libre est appelable sans habilitation
        ni clé d'accès, tandis qu'une API en
        accès restreint (délivrant des données protégées)
        requiert plus d'étapes pour être utilisable dans vos systèmes
        d'information.
      </p>

      <h3>Étape 1 — Explorer la documentation et tester l'API</h3>

      <p>
        Après avoir
        <router-link to="/anticiper-le-parcours-usager-avant-d-integrer-vos-api"
          >réfléchi aux parcours de vos usagers</router-link
        >, il est utile de vérifier que l'API correspond bien à votre besoin en
        consultant ses spécifications via sa documentation et son
        <em>swagger</em> ou fichier <em>OpenAPI</em>.
      </p>

      <p>Cette étape est commune à toutes les API :</p>

      <ul class="fr-mb-3w">
        <li>
          <strong>Pour une API en accès libre</strong>, vous pouvez tester
          directement l'API en conditions réelles, sans attendre de validation
          préalable.
        </li>
        <li>
          <strong>Pour une API à accès restreint</strong>, la plupart proposent
          un environnement de test (bac à sable)
          avec des données fictives, ce qui permet à votre équipe technique de
          se familiariser avec les types de données renvoyés et les différentes
          situations d'usage possibles. Si les exemples proposés ne répondent pas à tous les cas de figure possibles de votre cas d'usage, certains opérateurs proposent une option permettant de contribuer à l'environnement de bac à sable afin de l'enrichir.
        </li>
      </ul>

       <div class="fr-highlight fr-highlight--green-menthe fr-mb-4w">
        <p>          
          Toutes les API référencées sur Simplifions.data sont aussi <b>cataloguées dans Data.gouv.fr</b> où elles ont leur propre page d'information. Cette page recense les éléments essentiels pour vous permettre d'intégrer l'API.
          <br/>
          <br/>
          Cette page data.gouv.fr est toujours mise en lien sur simplifions.data lorsqu'une API ou un jeu de donnée est référencé.
        </p>
      </div>

      <h3>Étape 2 — Récupérer et, le cas échéant, sécuriser vos accès</h3>

      <p>
        <strong>Pour une API en libre accès</strong>, cette étape est généralement superflue : aucune clé n'est nécessaire, l'API est appelable directement depuis une page web, sans avoir à sécuriser l'appel.

      </p>

      <p>
        <strong>Pour une API à accès restreint</strong>, une fois la demande
        d'habilitation validée, une clé d'accès technique —
        <i>un jeton, aussi appelé token, généralement au format JWT</i> — est
        délivrée à votre organisation. Selon l'API concernée, la récupération de
        ce jeton se fait dans un espace dédié du site de l'API, ou par échange
        sur une messagerie sécurisée.
        <strong
          >Ce jeton ne doit jamais être partagé à un tiers non autorisé, ni
          transiter par e-mail, ni être saisi dans un moteur de
          recherche.</strong
        >
        Il est propre à votre organisation et ne doit être donné qu'à des tiers
        habilités à le manipuler, c'est-à-dire votre direction des systèmes
        d'information ou votre éditeur si vous lui avez délégué la gestion
        technique. En cas de doute sur une fuite du jeton, même accidentelle,
        contactez immédiatement l'opérateur de l'API pour le faire révoquer.
      </p>

      <h3>Étape 3 — Intégrer techniquement l'API dans le parcours usager</h3>

      <p>
        L'équipe technique développe l'appel à l'API dans votre service, en
        implémentant le
        <router-link to="/anticiper-le-parcours-usager-avant-d-integrer-vos-api"
          >parcours décidé en amont</router-link
        >
        : développement du formulaire ou du service et interconnexion des champs
        de saisie (pour les paramètres d'appel) et des champs de saisie
        pré-remplis (pour les réponses de l'API) ; distinction entre données
        publiques (affichables sans authentification) et données protégées
        (réservées aux usagers authentifiés ou agents habilités).
      </p>

      <p>
        <strong>Pour une API en accès libre</strong>, l'intégration reste simple : il suffit de gérer les appels HTTPS, le traitement du JSON reçu, et les codes d'erreur HTTP standards — notamment le 429 (limite de débit dépassée) ou un timeout en cas de lenteur du service. Pas de logique de jeton ni de traçabilité particulière à mettre en œuvre.

      </p>

      <p>
        <strong>Pour une API à accès restreint</strong>, aux erreurs HTTP standards s'ajoutent des codes propres à l'authentification (401 en cas de jeton invalide ou expiré, 403 en cas d'accès à une donnée hors du périmètre habilité) et le respect des limites de volumétrie propres à votre habilitation — au-delà, un bannissement temporaire peut intervenir. Il est également souvent requis de renseigner, dans chaque appel, des paramètres de traçabilité permettant d'identifier l'origine de la requête.
      </p>


        <p><b>Aucune API n'est fiable à 100 %. Or votre service doit continuer à fonctionner en
          cas de panne :</b>
        </p>
        <ul><li>si l'API sert à <strong>pré-remplir un formulaire</strong>,
          prévoyez une saisie manuelle de secours ;</li><li>si l'API sert à
          <strong>récupérer un justificatif</strong>, prévoyez que l'usager
          puisse encore le déposer lui-même.</li></ul>
        <div class="fr-highlight fr-highlight--green-menthe fr-mb-4w">
          <p>⚠️ Le «&nbsp;Dites-le-nous
          une fois&nbsp;» ne doit jamais devenir un obstacle. Un usager
          préférera souvent ressaisir une information plutôt que de ne pas
          pouvoir finaliser sa démarche.</p>
      </div>

      <SimplifionsArticleReadMore
      to="/anticiper-le-parcours-usager-avant-d-integrer-vos-api"
      description="Découvrez comment utiliser les API au sein du parcours usager, selon que la donnée est publique ou protégée :"
      />

      <h3>Étape 4 — Mettre en production, surveiller, faire évoluer</h3>

      <p>
       Après des tests concluants, l'accès en production peut démarrer. Quelques bonnes pratiques à mettre en place dès le lancement lorqu'elles sont rendues possibles par l'opérateur de l'API :
      </p>

      <ul class="fr-mb-3w">
        <li>utiliser les <b>kits de développement</b> (SDK) officiels ;</li>
        <li>
          s'abonner aux <b>pages de statut / notifications d'incidents</b> ;
        </li>
        <li>
          s'abonner aux actualités de l'API indiquant les <b>nouveautés, les montées en version et le changelog</b> ;
        </li>
        <li>
          utiliser les <b>routes de monitoring dédiées</b> ("ping"), plutôt que d'appeler les vraies routes de données, pour surveiller la disponibilité.
        </li>
      </ul>

    <SimplifionsArticleReadMore
      to="/vos-interlocuteurs-selon-le-type-d-api"
      description="Durant l'intégration et l'usage d'une API, identifiez les acteurs pour savoir qui sont vos interlocuteurs :"
    />
    </ArticleSection>

    <ArticleSection id="limites" label="Limites des API">
      <template #heading>Les limites des API</template>
      <p class="fr-text--lg">
       Comprendre les limites des API vous permet d'anticiper les solutions à
        mettre en œuvre pour contrebalancer leurs manques.
      </p>

      <div class="fr-table">
        <table>
          <thead>
            <tr>
              <th>Limite d'une API</th>
              <th>Explication</th>
              <th>Exemple concret</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong
                  >Couverture partielle des structures et du périmètre
                  visés</strong
                >
              </td>
              <td>
                La plupart des API ne couvrent pas la totalité des personnes ou
                des organisations cibles. En raison d'une absence de collecte de
                la donnée, certaines zones géographiques peuvent ne pas être
                couvertes, certaines entités non plus. Ce périmètre est aussi
                souvent lié au périmètre de l'administration fournisseur de la
                donnée elle-même.
              </td>
              <td>
                Le statut boursier n'est pas encore disponible pour tous les
                types d'études ou tous les régimes de bourse — un usager
                réellement boursier peut donc, dans certains cas, ne pas être
                détecté comme tel par l'API.
              </td>
            </tr>
            <tr>
              <td><strong>Qualité de la donnée</strong></td>
              <td>
                La donnée renvoyée par l'API peut elle-même être erronée ou 
                incomplète. L'API ne fait que refléter la
                qualité de la donnée détenue par l'administration qui la
                fournit.
              </td>
              <td>
                Cas d'une donnée déclarative : Une adresse postale contient une erreur car cette donnée a été saisie par l'usager qui a fait une faute de frappe.
              </td>
            </tr>
            <tr>
              <td><strong>Fraîcheur de la donnée</strong></td>
              <td>
                Une modification très récente d'information concernant l'entité
                effectuant la démarche peut ne pas être immédiatement répercutée
                sur l'API (ex. changement de statut).
              </td>
              <td>
                Un usager vient d'obtenir son statut de demandeur d'emploi ce
                matin, mais l'API renvoie encore «&nbsp;false&nbsp;» quelques
                heures plus tard, le temps que la mise à jour se propage depuis
                le système source.
              </td>
            </tr>
            <tr>
              <td><strong>Indisponibilité ponctuelle de l'API</strong></td>
              <td>
                Aucune API ne garantit une disponibilité à 100 % : elle peut
                être en panne ou en maintenance, indépendamment de tout ce que
                vous avez bien anticipé côté conception ou technique. L'appel
                peut alors échouer totalement (timeout, erreur), sans lien avec
                le contenu de la demande.
              </td>
              <td>
                Une entreprise a besoin de transmettre son attestation fiscale
                mais le service de la DGFiP connaît un incident technique ce
                jour-là : l'appel renvoie une erreur, sans aucune donnée.
                L'entreprise doit pouvoir téléverser son propre document pour
                poursuivre sa démarche.
              </td>
            </tr>
            <tr>
              <td><strong>Volumétrie plafonnée</strong></td>
              <td>
                Les traitements de masse (ex. relance annuelle de milliers de
                dossiers) doivent être planifiés en heures creuses pour ne pas
                saturer les quotas partagés par habilitation.
              </td>
              <td>
                Un CCAS lance en pleine journée une vérification automatique de
                5 000 dossiers d'un coup : le quota de 1000 requêtes/minute est
                dépassé, l'habilitation se retrouve bannie pendant 12h en plein
                traitement, bloquant aussi les autres agents qui utilisent la
                même habilitation.
              </td>
            </tr>
            <tr>
              <td><strong>Paramètres d'appel incorrects</strong></td>
              <td>
                Toutes les API, sauf les API FranceConnectées, supposent que
                l'usager saisisse correctement ses informations ; en cas
                d'erreur de saisie, aucune donnée n'est retournée. Cette
                difficulté est parfois plus complexe qu'une simple erreur de
                saisie. Parfois les éléments identifiants à donner pour
                permettre l'appel ne sont pas forcément évidents pour l'usager
                lui-même. L'interface utilisateur et l'explication des éléments
                à fournir est alors cruciale pour limiter les erreurs. De même,
                la gestion des messages d'erreur donnée à l'usager est également
                très importante pour lui permettre d'apporter des corrections.
              </td>
              <td>
                Un étudiant se trompe d'un chiffre dans son numéro INE : l'API
                Statut étudiant ne renvoie aucun résultat, alors qu'il est
                réellement inscrit. Un parent doit saisir le code COG de sa
                commune de naissance en plus d'autres informations pour
                récupérer son quotient familial. Il se trompe et renseigne le
                code postal de sa commune de naissance.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="fr-mt-3w">
        Dans tous les cas,
        <strong>gardez toujours un chemin de secours pour l'usager</strong>
        (ressaisie, dépôt manuel du justificatif). 
      </p>

    <SimplifionsArticleReadMore
      to="/anticiper-le-parcours-usager-avant-d-integrer-vos-api#parcours-alternatifs"
      description="En savoir plus sur les parcours alternatifs à proposer :"
    />

    </ArticleSection>

    <ArticleSection id="recapitulatif" label="Pour résumer">
      <SimplifionsArticleChecklist>
        <li>
          <strong
            >Quatre prérequis avant de lancer un chantier d'intégration
            d'API :</strong
          >
        conception, technique, budget — et juridique si
          l'API délivre des données protégées.
        </li>
        <li>
          <strong>Quatre étapes pour intégrer les API.</strong> Explorer et
          tester l'API, sécuriser vos accès si l'API est en accès restreint,
          intégrer les données dans le parcours de l'usager, puis surveiller en
          production.
        </li>
        <li>
          <strong>Anticipez les limites des API.</strong> Couverture partielle,
          erreurs de saisie, données pas toujours à jour, quotas limités, pannes
          ponctuelles — un usager doit toujours pouvoir ressaisir une
          information ou déposer un document lui-même, sans que sa démarche soit
          bloquée.
        </li>
      </SimplifionsArticleChecklist>
    </ArticleSection>
  </SimplifionsArticleLayout>
</template>

<script setup lang="ts">
import SimplifionsArticleChecklist from '../../../components/article/SimplifionsArticleChecklist.vue'
import SimplifionsArticleFigure from '../../../components/article/SimplifionsArticleFigure.vue'
import SimplifionsArticleLayout from '../../../components/article/SimplifionsArticleLayout.vue'
import SimplifionsArticleReadMore from '../../../components/article/SimplifionsArticleReadMore.vue'
import ArticleSection from '../../../components/article/SimplifionsArticleSection.vue'

const articleMeta = {
  h1: "Prérequis et étapes d'intégration d'une API",
  title: "Prérequis et étapes d'intégration d'une API",
  description:
    "Prérequis techniques, juridiques et d'usage, étapes d'intégration, limites à connaître : Acteurs publics, ce guide vous aide à comprendre ce qui vous attend lorsque vous vous engagez dans la simplification de vos démarches grâce aux API.",
  articleTags: [],
  heroBackdropGradient: 'linear-gradient(135deg, #decdbd 0%, #a3afce 100%)',
  heroPanelBackground: 'var(--background-alt-beige-gris-galet)'
}
</script>
