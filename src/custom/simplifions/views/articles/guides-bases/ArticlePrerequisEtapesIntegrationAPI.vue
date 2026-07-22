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
      <em>Pré-remplir automatiquement les informations d'une entreprise à partir
      de son numéro de SIRET&nbsp;? Connaître le statut boursier d'un
      étudiant qui demande une réduction de transport&nbsp;? C'est possible
      grâce aux API référencées dans le catalogue de Simplifions.data</em>.
    </p>
    <p class="fr-text-lg">
      Néanmoins, entre le moment où vous prenez connaissance de l'existence
      d'une API qui couvre votre besoin et le moment où elle est utilisée en
      production dans votre téléservice, plusieurs étapes sont à franchir. Ce
      guide s'adresse aux acteurs publics, et donne une vision détaillée des étapes et prérequis nécessaire à l'intégration de toute
      API visant à simplifier des démarches via la récupération des données
      de l'usager — <em>principe du «&nbsp;Dites-le-nous une fois&nbsp;»</em>.
    </p>

    <SimplifionsArticleReadMore
      to="/qu-est-ce-qu-une-api"
      description="Comprendre ce qu'est une API sans vocabulaire technique."
    />

    <ArticleSection id="types-api" label="Les différents types d'API">
      <p class="fr-text--lg">
        Dans l'écosystème des API utiles pour mettre en place le
        «&nbsp;Dites-le-nous une fois&nbsp;», il existe différents types pouvant se
        superposer :
      </p>


          <h3>Les bouquets d'API</h3> 
          <p>Ces API regroupent, derrière
          un seul point d'entrée et un seul point de contact, plusieurs API,
          généralement organisées autour d'un secteur ou d'un usage commun.
          Ces «&nbsp;bouquets d'API&nbsp;» permettent donc d'accéder à de
          nombreuses données à partir d'une même API ayant plusieurs
          «&nbsp;branches&nbsp;», appelées «&nbsp;endpoints&nbsp;». On
          distingue deux types de bouquets d'API, ceux :</p>
          <ul>
            <li>
              <strong>regroupant les API d'un même fournisseur</strong> : Il
              s'agit d'un regroupement des API d'une même administration,
              comme par exemple le bouquet des API de FranceTravail.
            </li>
            <li>
              <strong>regroupant différents fournisseurs d'API</strong> : Il
              s'agit d'un regroupement d'API issues de différentes
              administrations fournisseurs d'API. Cette mise en commun
              permet d'accélérer l'intégration d'API grâce notamment à une
              demande d'habilitation unique et une cohérence technique (même
              authentification, mêmes conventions de nommage et de réponse).
              <br/>
              <br/>
              <SimplifionsArticleTopicSpotlight
                :slugs="['bouquet-api-entreprise', 'bouquet-api-particulier']"
                page-key="solutions"
                :show-operateur-tag="true"
                :show-categorie-de-solution="true"
                :show-target-users="true"
                :show-arrow="true"
              >
                <p>
            <strong>L'API Entreprise et l'API Particulier sont des bouquets d'API multi-fournisseurs</strong> conçus pour mettre en oeuvre le «&nbsp;Dites-le-nous une fois&nbsp;». L'API Entreprise donne accès aux données des entreprises <em> - Insee, Inpi, DGFIP, URSSAF, caisses de retraite...-</em> ; l'API Particulier, aux données des particuliers <em>- CAF/MSA, France Travail, ministères de l'éducation nationale et de l'enseignement supérieur...-</em>. Les intégrer permet aussi de bénéficier du travail métier effectué pour proposer une offre en cohérence avec les démarches à simplifier.
                </p>
              </SimplifionsArticleTopicSpotlight>
            </li>
          </ul>


          <h3>Les API classiques, «&nbsp;à l'unité&nbsp;»</h3> 
          <p> Ces
          API sont propres à un seul fournisseur de données, comme l'API
          Impôt Particulier de la DGFiP ou l'API Statut étudiant du
          ministère de l'enseignement supérieur. Souvent très utiles et
          complémentaires aux bouquets, elles ont chacune leur propre
          formulaire d'habilitation, ainsi que leur propre gestion des accès
          et du support.</p>

          <SimplifionsArticleTopicSpotlight
            :slugs="['api-impot-particulier']"
            page-key="solutions"
            :show-operateur-tag="true"
            :show-categorie-de-solution="true"
            :show-target-users="true"
            :show-arrow="true"
          >
            <p>
              <strong>L'API Impôt Particulier de la DGFiP</strong> est un exemple d'API «&nbsp;à l'unité&nbsp;» : elle est propre à un seul fournisseur et dispose de sa propre demande d'habilitation, distincte de celle des bouquets d'API.
            </p>
          </SimplifionsArticleTopicSpotlight>

          <h3>Les API FranceConnectées</h3> 
          <p>Il s'agit d'une
          catégorie d'API qui ne concerne que les données des particuliers.
          Elles sont dites «&nbsp;FranceConnectées&nbsp;», car elles peuvent
          être appelées avec l'identité pivot FranceConnect plutôt qu'un
          simple identifiant. Ce niveau d'intégration supplémentaire
          simplifie le parcours de l'usager, sous conditions de quelques
          prérequis techniques spécifiques.</p>
  

      <SimplifionsArticleReadMore
        to="/apis-franceconnectees"
        description="Consulter la liste de toutes les API FranceConnectées"
      />
    </ArticleSection>

    <ArticleSection id="interlocuteurs" label="Les interlocuteurs">
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
                La DGFiP pour le revenu fiscal de référence ou une attestation
                fiscale, la CAF ou la MSA pour le quotient familial, le
                Cnous pour le statut boursier.
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
              <td>La CNAV pour le quotient familial.</td>
            </tr>
            <tr>
              <td><strong>L'opérateur du bouquet</strong></td>
              <td>
              Gère le bouquet d'API et tous ses endpoints. Si vous utilisez un bouquet d'API regroupant des API de
                plusieurs fournisseurs, il s'agit de votre interlocuteur
                unique pour l'habilitation, l'intégration technique et le
                support, pour toutes les API du bouquet.
              </td>
              <td>La DINUM pour l'API Particulier et l'API Entreprise.</td>
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

      <p class="fr-text--sm">
        <i
          >Par exemple, pour l'API Quotient familial CAF/MSA, les
          fournisseurs de la donnée sont la CAF et la MSA. L'opérateur de
          l'API est la caisse nationale d'assurance vieillesse pour des
          raisons internes aux systèmes d'informations de l'État. L'API est
          distribuée dans le bouquet API Particulier, l'opérateur du bouquet
          est donc la DINUM.</i
        >
      </p>
    </ArticleSection>

    <ArticleSection id="prerequis" label="Les prérequis avant de démarrer">
      <p class="fr-text--lg">
        Quatre familles de prérequis, à vérifier avant d'intégrer une API —
        les rassembler en amont peut vous faire gagner du temps :
      </p>

      <h3>1. Un prérequis de conception : penser au parcours de vos usagers</h3>

      <h4>Vérifier que l'API délivre les données dont vous avez besoin</h4>

      <p>
        Avant de vous engager dans une demande d'habilitation, prenez le
        temps de consulter la documentation technique de l'API (souvent un
        swagger ou une spécification OpenAPI) pour vérifier que les données
        renvoyées correspondent réellement à votre besoin. Trois points de
        vigilance reviennent régulièrement :
      </p>

      <ul class="fr-mb-3w">
        <li>
          <strong>La granularité de la réponse</strong>. Certaines API
          renvoient un simple statut ou une réponse par oui ou par non - <em>par exemple,
          «&nbsp;est demandeur d'emploi : oui/non&nbsp;»</em> -, tandis que
          d'autres renvoient un objet complet avec de nombreuses données
          associées <em> - état civil, coordonnées, dates d'inscription... -</em>. Dans le cas d'une API délivrant des données protégées, une
          API plus riche que nécessaire vous imposera de gérer, sécuriser et
          minimiser des données dont vous n'avez pas l'usage — au moment de votre demande d'habilitation, il vous sera demandé de
          veiller au respect du principe de minimisation des données.
        </li>
        <li>
          <strong>Le périmètre couvert</strong>. Une API peut comporter des
          exceptions géographiques, temporelles ou statutaires : par
          exemple, certains territoires ou situations particulières peuvent
          être exclus du périmètre. Vérifiez que votre public cible est bien couvert et anticipez des parcours alternatifs pour les usagers qui ne le sont pas.
        </li>
        <li>
          <strong>La fraîcheur des données</strong>. Selon l'API, la donnée
          peut être mise à jour en temps réel, quotidiennement, ou selon une
          fréquence propre au fournisseur.
          Assurez-vous que la fréquence de mise à jour est compatible avec
          votre cas d'usage.
        </li>
      </ul>

      <h4>
        Identifier comment récupérer les informations de l'usager qui
        permettront d'appeler l'API
      </h4>

      <p>
        Une API ne se déclenche jamais toute seule : pour l'appeler, il faut
        lui fournir un <strong>paramètre d'appel</strong> qui permet
        d'identifier l'entité dont on souhaite récupérer/pré-remplir les
        données. Selon l'API, ce paramètre peut être par exemple un numéro
        de SIRET/SIREN pour une association ou une entreprise, un numéro
        fiscal ou l'état civil pour un particulier.
      </p>

      <p>
        Avant d'intégrer une API, il faut donc décider à quel endroit et
        comment vous allez pouvoir obtenir ce paramètre auprès de l'usager
        ou de l'agent. C'est un choix de conception produit à part entière,
        détaillé dans la
        <a href="#parcours-usager"
          >section «&nbsp;Anticiper le parcours usager&nbsp;» ci-dessous</a
        >
        — il est déterminant pour la qualité de l'expérience usager.
      </p>

      <h4>Maquetter ou prototyper avant de développer</h4>

      <p>
        Il n'est pas nécessaire d'attendre l'accès aux API pour valider vos
        parcours. Au contraire, les anticiper en lisant les spécifications
        des API vous permettra de vous assurer que l'API correspond à votre
        besoin. Certaines API mettent à disposition des environnements de
        tests qui permettent même de concevoir tout votre produit avec de la
        donnée fictive.
      </p>

      <h3>
        2. Un prérequis juridique si l'API distribue des données protégées
      </h3>
      <h4>Cadre légal</h4>
      <p>
        L'accès aux API permettant la mise en œuvre du «&nbsp;Dites-le-nous une fois&nbsp;» et distribuant des données protégées requiert une habilitation.
      </p>

      <p>
        Chaque demande d'accès doit être justifiée par un
        <strong>cadre juridique précis</strong> : texte de loi ou
        règlementaire spécifiant que votre administration est habilitée à
        demander ces informations. Pour les collectivités, une
        <strong>délibération</strong> décrivant précisément les données
        nécessaires, <em>par exemple le barème tarifaire lié au quotient familial pour une
        tarification de cantine</em>, est souvent requise.
      </p>

           <p class="fr-mb-0">
          Simplifions.data vous aide dans l'identification de ce cadre
          juridique :
        </p>

      <SimplifionsArticleFigure
        src="/static/simplifions/assets/article-prerequis-etapes-integration-api-exemple-cadre-juridique-dans-simplifions.png"
        alt="Capture d'écran d'un exemple de cadre juridique affiché sur Simplifions.data"
      >
        Exemple de cadre juridique renseigné pour un cas d'usage sur Simplifions.data.
      </SimplifionsArticleFigure>

  
      <h4>Contacts</h4>
      <p class="fr-mt-3w">
        Une demande d'habilitation mobilise généralement plusieurs profils
        (qui peuvent parfois être la même personne) :
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
                Responsable de l'intégration technique et de la maintenance
                de l'API dans votre système d'information. C'est lui qui
                sera notifié des opérations de maintenance, des incidents et
                de l'expiration des accès techniques.
              </td>
            </tr>
            <tr>
              <td>
                <strong>Contact métier</strong>
                <br />
                <i>— contact moins fréquemment demandé</i>
              </td>
              <td>
                Point de contact pour les questions fonctionnelles/métier
                sur le service. Lorsqu'il est demandé, c'est lui qui est
                notifié des nouvelles API et des incidents majeurs. Distinct
                du contact technique, orienté usage plutôt qu'intégration.
              </td>
            </tr>
            <tr>
              <td><strong>Délégué à la protection des données</strong></td>
              <td>
                S'assure que l'organisation protège correctement les données
                personnelles conformément à la réglementation. Cette
                personne doit pouvoir exercer en toute indépendance en étant
                à l'abri des conflits d'intérêt. Ce sera le point de contact
                privilégié de la CNIL. Dans les collectivités, le DPD est
                souvent mutualisé avec d'autres collectivités.
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
        Le niveau d'exigence technique dépend de l'ouverture de l'API
        utilisée.
      </p>

      <p><strong>Pour les API en accès libre</strong>, les prérequis sont légers :</p>

      <ul class="fr-mb-3w">
        <li>
          gérer des appels HTTPS simples, sans authentification
          particulière ;
        </li>
        <li>
          pouvoir traiter du JSON et l'intégrer dans votre système
          d'information ou votre site.
        </li>
      </ul>

      <p>
        <strong>Pour les API à accès restreint</strong>, les exigences sont
        plus poussées. Pas besoin d'une grande DSI, mais votre équipe
        technique (interne, externe ou éditeur) doit être en mesure de :
      </p>

      <ul class="fr-mb-3w">
        <li>
          gérer des appels HTTPS sortants depuis un serveur back-end (jamais
          depuis un site en front-end : le jeton d'accès serait exposé) ;
        </li>
        <li>
          utiliser un langage et des bibliothèques à jour, compatibles avec
          un chiffrement TLS récent (les anciennes versions de TLS ne sont
          plus acceptées) ;
        </li>
        <li>
          autoriser, le cas échéant, l'adresse IP du service dans votre
          pare-feu ;
        </li>
        <li>
          selon le fournisseur, justifier d'un niveau de sécurité suffisant
          de votre système d'information (questionnaire ou homologation de
          sécurité) ;
        </li>
        <li>
          prévoir la maintenance dans la durée : gestion des montées de
          version, renouvellement des jetons, suivi des incidents.
        </li>
      </ul>

      <h3>4. Un prérequis budgétaire</h3>

      <p>
        L'utilisation des API référencées sur Simplifions.data et utiles
        pour le «&nbsp;Dites-le-nous une fois&nbsp;» est gratuite. Mais
        le raccordement (développement, tests, maintenance, montée de
        version de l'API) reste à votre charge, il est donc nécessaire de
        prévoir ces coûts de développement initial et de maintien en
        conditions opérationnelles.
      </p>
    </ArticleSection>

    <ArticleSection id="parcours-usager" label="Anticiper le parcours usager">
      <p class="fr-text--lg">
        Le parcours usager à concevoir est différent selon que la donnée
        transmise par l'API est publique ou protégée.
      </p>

      <h3>I. Données publiques : une simple saisie des paramètres d'appel suffit</h3>

      <ol class="fr-mb-3w">
        <li>
          L'usager débute sa démarche. Il n'a pas eu besoin de s'authentifier
          ni même de se connecter.
        </li>
        <li>Au début du parcours, il saisit le paramètre d'appel requis.</li>
        <li>
          Les données publiques issues de l'API pré-remplissent les champs
          connus. L'usager peut les modifier ou les compléter si besoin.
        </li>
      </ol>

      <blockquote class="fr-highlight">
        <p>
          💬 <i
            >Exemple concret : Un bénévole d'une association souhaite
            réserver la salle communale. Il se rend sur le site de la
            mairie, ouvre le formulaire dédié à cette démarche, saisit le
            numéro RNA de son association. Le nom, le régime, l'adresse et
            les activités principales de l'association sont automatiquement
            saisies dans le formulaire. Il s'aperçoit qu'une donnée n'est
            pas à jour, il peut modifier le champ pré-rempli.</i
          >
        </p>
      </blockquote>

      <div class="fr-callout fr-callout--beige-gris-galet">
        <p class="fr-callout__text fr-mb-0">
          ⚙️ <strong>Que s'est-il passé techniquement ?</strong> Le
          formulaire de la mairie intègre l'API Association du Ministère des
          Sports ou bien l'API données association en open data de l'API
          Entreprise. Le numéro RNA est le paramètre d'appel de cette API.
          Au moment où il est saisi par l'usager, un appel se déclenche.
        </p>
      </div>

      <p class="fr-mt-3w">
        Ce parcours est le plus rapide à mettre en œuvre, car il ne
        nécessite aucune brique d'authentification. En revanche, il ne
        s'applique qu'aux données non protégées (ex. la dénomination d'une
        entreprise) car rien n'empêche techniquement un tiers de saisir le
        même identifiant pour récupérer la donnée, voire faire des appels en
        masse pour récupérer toutes les données de l'API. Aucune donnée
        sensible ne doit être exposée par ce biais.
      </p>

      <h3>II. Données protégées : quatre parcours possibles</h3>

      <h4>
        A. Sans authentification de l'usager, via transmission des
        justificatifs directement aux instructeurs
      </h4>

      <ol class="fr-mb-3w">
        <li>L'usager débute sa démarche, sans s'authentifier.</li>
        <li>Il saisit son identifiant au début du parcours.</li>
        <li>
          <strong>Du côté de l'usager :</strong> Un message indique alors à
          l'usager le nombre de justificatifs ou données requis qui ont pu
          être transmis aux instructeurs. L'usager ne voit pas ces
          justificatifs car la donnée n'est pas publique. Il est en revanche
          informé du type de justificatif qui a été transmis. Si un
          justificatif n'a pas pu être récupéré, l'usager peut le déposer
          par lui-même.
          <br />
          <strong>Du côté de l'agent habilité :</strong> Les justificatifs
          et données protégés ont été mis à disposition dans le dossier de
          l'usager. L'agent est informé si les pièces ont été récupérées par
          API (donc directement à la source) ou si elles ont été déposées
          par l'usager.
        </li>
      </ol>

      <blockquote class="fr-highlight">
        <p>
          💬 <i>Exemple concret : Camille, agricultrice, et Nicolas, agent territorial</i>
          <br />
          <i
            >Camille a besoin d'un emplacement sur le marché de sa commune
            pour vendre sa production. Sur le portail de la commune, elle
            sélectionne la démarche et renseigne son numéro de SIRET. Les
            informations publiques de son entreprise sont aussitôt
            pré-remplies, modifiables si besoin.</i
          >
          <br />
          <i
            >Sur les cinq justificatifs requis, quatre sont automatiquement
            récupérés auprès des administrations compétentes : Camille n'a
            rien à chercher dans ses dossiers. Seul le cinquième document,
            hors périmètre de l'API, reste à sa charge — elle le dépose
            elle-même, sans que cela bloque sa démarche.</i
          >
          <br />
          <i
            >Nicolas, agent instructeur habilité, reçoit la demande. Depuis
            la fiche entreprise de Camille, il voit en un coup d'œil que
            toutes les pièces sont réunies : quatre certifiées récupérées à
            la source via API, une déposée manuellement. Il concentre son
            contrôle sur ce seul document restant, et valide la
            demande.</i
          >
        </p>
      </blockquote>

      <div class="fr-callout fr-callout--beige-gris-galet">
        <p class="fr-callout__text fr-mb-0">
          ⚙️ <strong>Que s'est-il passé techniquement ?</strong> Le portail
          de la commune intègre plusieurs API. Le SIRET saisi par Camille
          sert de paramètre d'appel. Les documents récupérés sont stockés
          côté back-office et associés au dossier de Camille, sans lui être
          directement exposés.
        </p>
      </div>

      <p class="fr-mt-3w">
        Ce parcours est le parcours à privilégier lorsqu'il n'est pas
        possible de s'assurer de l'identité réelle d'un individu s'étant
        créé un compte dans vos systèmes d'information. Il présente
        l'avantage de rendre la démarche plus découvrable car aucune
        authentification n'est requise. En revanche, l'usager ne voit pas
        les pièces justificatives qu'il transmet, ce qui peut être délicat
        dans certaines situations.
      </p>

      <h4>
        B. Sans authentification de l'usager, avec consultation par un agent
        en guichet
      </h4>

      <ol class="fr-mb-3w">
        <li>
          L'usager se présente en guichet, ou entre en contact avec un agent
          par un autre canal (téléphone, rendez-vous).
        </li>
        <li>
          L'agent habilité demande à l'usager les informations requises en
          paramètre d'appel. Il renseigne ces identifiants dans son outil
          métier.
        </li>
        <li>
          Les justificatifs et données protégés s'affichent directement dans
          l'outil de l'agent.
        </li>
      </ol>

      <blockquote class="fr-highlight">
        <p>
          💬 <i>Exemple concret : Mme Dubois, allocataire, et Karim, agent en CCAS</i>
          <br />
          <i
            >Mme Dubois se présente au guichet de son centre communal
            d'action sociale. Karim, agent habilité, ouvre le dossier de Mme
            Dubois et renseigne XXX pour récupérer les informations
            XXXX.</i
          >
          <br />
          <i
            >Les données XXXX de Mme Dubois s'affichent instantanément :
            Karim peut poursuivre l'instruction sans lui demander de
            justificatif.</i
          >
        </p>
      </blockquote>

      <div class="fr-callout fr-callout--beige-gris-galet">
        <p class="fr-callout__text fr-mb-0">
          ⚙️ <strong>Que s'est-il passé techniquement ?</strong> Le logiciel
          métier du CCAS intègre les API XXXX du bouquet API Particulier.
          Karim saisit l'identifiant XXX de Mme Dubois, connu grâce au
          dossier déjà ouvert à son nom : c'est ce paramètre d'appel qui
          déclenche la requête.
        </p>
      </div>

      <h4>C. Après authentification de l'usager, via la saisie des paramètres</h4>

      <ol class="fr-mb-3w">
        <li>
          L'usager se connecte à son compte, son identité réelle a été
          vérifiée lors de la création de son compte.
        </li>
        <li>
          Il saisit le paramètre d'appel nécessaire, à moins que celui-ci ne
          soit déjà disponible dans son compte (par exemple son prénom et
          son nom qui sont dans ce cas directement saisis).
        </li>
        <li>
          La donnée protégée est récupérée et affichée directement dans son
          espace usager. Il peut la consulter et la modifier.
        </li>
      </ol>

      <blockquote class="fr-highlight">
        <p>
          💬 <i>Exemple concret : Léa, étudiante</i>
          <br />
          <i
            >Léa souhaite renouveler son abonnement annuel de transport pour
            sa nouvelle année universitaire. Elle se connecte à son compte
            usager. Lors de la création de son compte, elle avait dû fournir
            un justificatif de son identité, en guichet, par courrier ou
            voie électronique. En résumé, l'organisme responsable des
            transports dans sa ville sait que le compte de Léa, enregistré
            dans ses systèmes d'information, est bien le compte de la vraie
            Léa.</i
          >
          <br />
          <i
            >Dans le formulaire, elle n'a qu'à revalider son numéro
            étudiant, déjà pré-rempli grâce aux informations de son compte
            renseigné l'année précédente. Son statut d'étudiante et de
            boursière est confirmé et affiché directement dans son espace,
            avec la tarification adéquate. Léa n'a ni à chercher ni à
            téléverser une attestation. Elle confirme et obtient son
            abonnement.</i
          >
        </p>
      </blockquote>

      <div class="fr-callout fr-callout--beige-gris-galet">
        <p class="fr-callout__text fr-mb-0">
          ⚙️ <strong>Que s'est-il passé techniquement ?</strong> Le portail
          de l'opérateur de transport dans sa ville intègre les API statut
          étudiant et statut étudiant boursier. Le numéro INE, paramètre
          d'appel de ces API, est déjà connu car saisi par Léa dans son
          compte l'année précédente. En confirmant son INE, Léa déclenche la
          requête auprès des API qui retournent son statut.
        </p>
      </div>

      <p class="fr-mt-3w">
        <i
          >Imaginons que la récupération automatique d'un des justificatifs
          n'ait pas fonctionné. Le statut boursier de Léa n'a pas pu être
          récupéré. Il lui est alors proposé de pouvoir déposer son document
          (qui sera traité par un agent) et même de pouvoir s'abonner sans
          bénéficier du tarif. L'important est de laisser un maximum de
          liberté à Léa et de ne pas la bloquer si la récupération
          automatique par API échoue.</i
        >
      </p>

      <p>
        Ce parcours implique de disposer d'un système d'authentification
        garantissant que la personne connectée est bien celle dont on va
        récupérer les données. 💡 Si votre compte usager contient déjà
        certaines informations (nom, prénom, date de naissance) suffisantes
        pour appeler l'API, évitez de les redemander à l'usager lors du
        parcours, permettez-lui simplement de les confirmer !
      </p>

      <div class="fr-callout">
        <p class="fr-callout__title">Démonstrateur de l'API Particulier</p>
        <div class="fr-callout__text">
          <p>
            Ce démonstrateur de l'API Particulier vous permet de découvrir
            l'usage des API sur ce type de parcours.
          </p>
          <ul class="fr-mb-0">
            <li>
              Démonstration avec Juliette, étudiante — Tarification
              transport :
              <a
                href="https://demonstrateur.particulier.api.gouv.fr/transport/souscription?user=2"
                target="_blank"
                rel="noopener noreferrer"
                >demonstrateur.particulier.api.gouv.fr</a
              >
            </li>
            <li>
              Démonstration avec Kevin — Tarification cantine pour ses
              enfants :
              <a
                href="https://demonstrateur.particulier.api.gouv.fr/cantine/souscription?user=4"
                target="_blank"
                rel="noopener noreferrer"
                >demonstrateur.particulier.api.gouv.fr</a
              >
            </li>
          </ul>
        </div>
      </div>

      <h4>D. Via FranceConnect</h4>

      <ol class="fr-mb-3w">
        <li>
          L'usager clique sur «&nbsp;S'identifier avec FranceConnect&nbsp;»
          et choisit son fournisseur d'identité. Il saisit l'identifiant et
          le mot de passe de ce fournisseur d'identité. Avant de retourner
          sur le site de la démarche, FranceConnect lui précise que des
          données le concernant vont être transmises à ce site. L'usager
          valide.
        </li>
        <li>
          L'usager est alors connecté sur son compte. Les données protégées
          sont pré-remplies, consultables et modifiables.
        </li>
      </ol>

      <blockquote class="fr-highlight">
        <p>
          💬 <i>Exemple concret : Malik, demandeur d'emploi</i>
          <br />
          <i
            >Malik souhaite inscrire ses enfants à la cantine municipale.
            Sur le portail de sa commune, il choisit de se connecter via
            FranceConnect en cliquant sur le bouton «&nbsp;S'identifier avec
            FranceConnect&nbsp;». Il choisit son fournisseur d'identité
            habituel, entre son identifiant et son mot de passe.
            FranceConnect lui demande de confirmer la transmission de ses
            données d'état civil, de son quotient familial, sa composition
            familiale (l'identité de ses enfants) et de son revenu fiscal de
            référence. Malik confirme.</i
          >
          <br />
          <i
            >Une fois FranceConnecté, il n'a rien de plus à saisir : son
            quotient familial, la liste de ses enfants, et son revenu
            fiscal de référence ont été automatiquement récupérés, il peut
            les consulter et les modifier si besoin avant d'envoyer son
            dossier.</i
          >
        </p>
      </blockquote>

      <div class="fr-callout fr-callout--beige-gris-galet">
        <p class="fr-callout__text fr-mb-0">
          ⚙️ <strong>Que s'est-il passé techniquement ?</strong> Le portail
          de la commune intègre FranceConnect et les API FranceConnectées
          Quotient familial CAF &amp; MSA du bouquet API Particulier et
          l'API Impôt Particulier de la DGFIP. Les paramètres d'appel de ces
          API n'ont pas à être saisis par Malik : en effet l'appel est
          déclenché avec l'identité pivot (leur état civil) connue de
          FranceConnect, au moment de la FranceConnexion. Au moment où Malik
          confirme la liste des données transmises au site, il lance à la
          fois sa connexion et l'appel aux API.
        </p>
      </div>

      <p class="fr-mt-3w">
        Ce parcours bénéficie de la sécurité apportée par FranceConnect.
        Avec FranceConnect, vous êtes sûr que le compte de Malik est celui
        du vrai Malik. Pour l'usager c'est aussi bien plus simple, la
        récupération des données protégées se fait sans besoin de ressaisir
        des paramètres.
        <br />
        Toutefois, comme tous les usagers n'utilisent pas FranceConnect,
        cette modalité doit au moins être combinée à A. ou C., pour couvrir
        l'ensemble des usagers.
      </p>

      <div class="fr-callout">
        <p class="fr-callout__title">Démonstrateur de l'API Particulier</p>
        <div class="fr-callout__text">
          <p>
            Ce démonstrateur de l'API Particulier vous permet de découvrir
            l'usage des API sur un parcours avec FranceConnexion.
          </p>
          <ul class="fr-mb-0">
            <li>
              Démonstration avec Nicolas, demandeur d'emploi — Tarification
              transport :
              <a
                href="https://demonstrateur.particulier.api.gouv.fr/fr/transport/souscription?user=1"
                target="_blank"
                rel="noopener noreferrer"
                >demonstrateur.particulier.api.gouv.fr</a
              >
            </li>
            <li>
              Démonstration avec Camille — Tarification cantine pour ses
              enfants :
              <a
                href="https://demonstrateur.particulier.api.gouv.fr/fr/cantine/souscription?user=3"
                target="_blank"
                rel="noopener noreferrer"
                >demonstrateur.particulier.api.gouv.fr</a
              >
            </li>
          </ul>
        </div>
      </div>

      <div class="fr-highlight fr-highlight--green-menthe fr-mt-4w">
        <p class="fr-mb-0">
          ⚠️
          <strong
            >Quel que soit le parcours retenu, prévoyez toujours des
            parcours alternatifs.</strong
          >
          Aucune API ne garantit une disponibilité à 100 % : en cas de panne
          ou de donnée manquante, l'usager doit pouvoir saisir l'information
          manuellement ou déposer le document lui-même, sans que sa
          démarche soit bloquée.
        </p>
      </div>
    </ArticleSection>

    <ArticleSection
      id="etapes-integration"
      label="Les étapes d'intégration d'une API"
    >
      <p class="fr-text--lg">
        Les étapes d'intégration d'une API dépendent de l'ouverture de
        l'API : une API en <strong>accès libre</strong> est appelable sans
        habilitation ni clé d'accès, tandis qu'une API en
        <strong>accès restreint</strong> (délivrant des données protégées)
        requiert plus d'étapes pour être utilisable dans vos systèmes
        d'information.
      </p>

      <h3>Étape 1 — Explorer la documentation et tester l'API</h3>

      <p>
        Après avoir
        <a href="#parcours-usager">réfléchi aux parcours de vos usagers</a>,
        il est utile de vérifier que l'API correspond bien à votre besoin en
        consultant ses spécifications via sa documentation et/ou son
        Swagger/OpenAPI.
      </p>

      <p>Cette étape est commune à toutes les API :</p>

      <ul class="fr-mb-3w">
        <li>
          Pour une <strong>API en accès libre</strong>, vous pouvez tester
          directement l'API en conditions réelles, sans attendre de
          validation préalable.
        </li>
        <li>
          Pour une <strong>API à accès restreint</strong>, la plupart
          proposent un <strong>environnement de test (bac à sable)</strong>
          avec des données fictives, ce qui permet à votre équipe technique
          de se familiariser avec les types de données renvoyés et les
          différentes situations d'usage possibles.
        </li>
      </ul>

      <div class="fr-callout fr-callout--beige-gris-galet">
        <p class="fr-callout__text fr-mb-0">
          Toutes les API référencées sur Simplifions.data ont une fiche API
          sur data.gouv. Cette page recense les informations essentielles
          pour vous permettre d'intégrer l'API.
        </p>
      </div>

      <h3>Étape 2 — Récupérer et, le cas échéant, sécuriser vos accès</h3>

      <p>
        <strong>Pour une API en libre accès</strong>, cette étape est
        généralement superflue : aucune clé n'est nécessaire, l'API est
        appelable directement, y compris depuis un site en ligne.
      </p>

      <p>
        <strong>Pour une API à accès restreint</strong>, une fois la demande
        d'habilitation validée, une clé d'accès technique —
        <i>un jeton, aussi appelé token, généralement au format JWT</i> —
        est délivrée à votre organisation. Selon l'API concernée, la
        récupération de ce jeton se fait dans un espace dédié du site de
        l'API, ou par échange sur une messagerie sécurisée.
        <strong
          >Ce jeton ne doit jamais être partagé à un tiers non autorisé, ni
          transiter par e-mail, ni être saisi dans un moteur de
          recherche.</strong
        >
        Il est propre à votre organisation et ne doit être donné qu'à des
        tiers habilités à le manipuler, c'est-à-dire votre direction des
        systèmes d'information ou votre éditeur si vous lui avez délégué la
        gestion technique. En cas de doute sur une fuite du jeton, même
        accidentelle, contactez immédiatement l'opérateur de l'API pour le
        faire révoquer.
      </p>

      <h3>Étape 3 — Intégrer techniquement l'API dans le parcours usager</h3>

      <p>
        L'équipe technique développe l'appel à l'API dans votre service, en
        implémentant le <a href="#parcours-usager">parcours décidé en amont</a>
        : développement du formulaire ou du service et interconnexion des
        champs de saisie (pour les paramètres d'appel) et des champs de
        saisie pré-remplis (pour les réponses de l'API) ; distinction entre
        données publiques (affichables sans authentification) et données
        protégées (réservées aux usagers authentifiés ou agents habilités).
      </p>

      <p>
        <strong>Pour une API en accès libre</strong>, l'intégration reste
        simple : il suffit de gérer les appels HTTPS, le traitement du JSON
        reçu, et les codes d'erreur HTTP standards — notamment le 429
        (limite de débit dépassée) ou un timeout en cas de lenteur du
        service. Pas de logique de jeton ni de traçabilité particulière à
        mettre en œuvre.
      </p>

      <p>
        <strong>Pour une API à accès restreint</strong>, aux erreurs HTTP
        standards s'ajoutent des codes propres à l'authentification (401 en
        cas de jeton invalide ou expiré, 403 en cas d'accès à une donnée
        hors du périmètre habilité) et le respect des limites de volumétrie
        propres à votre habilitation — au-delà, un bannissement temporaire
        peut intervenir. Il est également souvent requis de renseigner,
        dans chaque appel, des paramètres de traçabilité permettant
        d'identifier l'origine de la requête.
      </p>

      <div class="fr-highlight fr-highlight--green-menthe">
        <p class="fr-mb-0">
          💡 Aucune API ne s'engage sur une disponibilité à 100 %, qu'elle
          soit ouverte ou protégée, car elle dépend elle-même de systèmes
          d'information tiers. Or votre service doit continuer à
          fonctionner en cas de panne :
          <br />si l'API sert à <strong>pré-remplir un formulaire</strong>,
          prévoyez une saisie manuelle de secours ;
          <br />si l'API sert à
          <strong>récupérer un justificatif</strong>, prévoyez que l'usager
          puisse encore le déposer lui-même.
          <br />⚠️ Le «&nbsp;Dites-le-nous une fois&nbsp;» ne doit jamais
          devenir un obstacle. Un usager préférera souvent ressaisir une
          information plutôt que de ne pas pouvoir finaliser sa démarche.
        </p>
      </div>

      <h3>Étape 4 — Mettre en production, surveiller, faire évoluer</h3>

      <p>
        Après des tests concluants, l'accès en production peut démarrer.
        Quelques réflexes à prendre dès le lancement, communs aux deux types
        d'API :
      </p>

      <ul class="fr-mb-3w">
        <li>
          s'abonner aux pages de statut / notifications d'incident du
          fournisseur ;
        </li>
        <li>
          si disponibles, utiliser les
          <strong>routes de monitoring dédiées</strong> («&nbsp;ping&nbsp;»)
          plutôt que d'appeler les vraies routes de données pour surveiller
          la disponibilité ;
        </li>
        <li>
          s'abonner aux infolettres des fournisseurs, notamment pour être
          informé des montées en version de l'API.
        </li>
      </ul>
    </ArticleSection>

    <ArticleSection id="limites" label="Les limites d'une API">
      <p class="fr-text--lg">
        Intégrer des API dans vos démarches pour récupérer directement les
        informations déjà connues de l'administration est une étape requise
        pour simplifier vos démarches en profondeur — mais l'usage des API
        n'est pas une solution miracle. Comprendre les limites des API vous
        permet de mieux cerner ce qu'elles rendent possible et d'anticiper
        les solutions à mettre en œuvre pour contrebalancer leurs manques.
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
                La plupart des API ne couvrent pas la totalité des personnes
                ou des organisations cibles. En raison d'une absence de
                collecte de la donnée, certaines zones géographiques
                peuvent ne pas être couvertes, certaines entités non plus.
                Ce périmètre est aussi souvent lié au périmètre de
                l'administration fournisseur de la donnée elle-même.
              </td>
              <td>
                Le statut boursier n'est pas encore disponible pour tous les
                types d'études ou tous les régimes de bourse — un usager
                réellement boursier peut donc, dans certains cas, ne pas
                être détecté comme tel par l'API.
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
                permettre l'appel ne sont pas forcément évidents pour
                l'usager lui-même. L'interface utilisateur et l'explication
                des éléments à fournir est alors cruciale pour limiter les
                erreurs. De même, la gestion des messages d'erreur donnée à
                l'usager est également très importante pour lui permettre
                d'apporter des corrections.
              </td>
              <td>
                Un étudiant se trompe d'un chiffre dans son numéro INE :
                l'API Statut étudiant ne renvoie aucun résultat, alors qu'il
                est réellement inscrit. Un parent doit saisir le code COG de
                sa commune de naissance en plus d'autres informations pour
                récupérer son quotient familial. Il se trompe et renseigne
                le code postal de sa commune de naissance.
              </td>
            </tr>
            <tr>
              <td><strong>Fraîcheur de la donnée</strong></td>
              <td>
                Une modification très récente d'information concernant
                l'entité effectuant la démarche peut ne pas être
                immédiatement répercutée sur l'API (ex. changement de
                statut).
              </td>
              <td>
                Un usager vient d'obtenir son statut de demandeur d'emploi
                ce matin, mais l'API renvoie encore «&nbsp;false&nbsp;»
                quelques heures plus tard, le temps que la mise à jour se
                propage depuis le système source.
              </td>
            </tr>
            <tr>
              <td><strong>Indisponibilité ponctuelle de l'API</strong></td>
              <td>
                Aucune API ne garantit une disponibilité à 100 % : elle peut
                être en panne ou en maintenance, indépendamment de tout ce
                que vous avez bien anticipé côté conception ou technique.
                L'appel peut alors échouer totalement (timeout, erreur),
                sans lien avec le contenu de la demande.
              </td>
              <td>
                Une entreprise a besoin de transmettre son attestation
                fiscale mais le service de la DGFiP connaît un incident
                technique ce jour-là : l'appel renvoie une erreur, sans
                aucune donnée. L'entreprise doit pouvoir téléverser son
                propre document pour poursuivre sa démarche.
              </td>
            </tr>
            <tr>
              <td><strong>Volumétrie plafonnée</strong></td>
              <td>
                Les traitements de masse (ex. relance annuelle de milliers
                de dossiers) doivent être planifiés en heures creuses pour
                ne pas saturer les quotas partagés par habilitation.
              </td>
              <td>
                Un CCAS lance en pleine journée une vérification automatique
                de 5 000 dossiers d'un coup : le quota de 1000
                requêtes/minute est dépassé, l'habilitation se retrouve
                bannie pendant 12h en plein traitement, bloquant aussi les
                autres agents qui utilisent la même habilitation.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="fr-mt-3w">
        Dans tous les cas,
        <strong>gardez toujours un chemin de secours pour l'usager</strong>
        (ressaisie, dépôt manuel du justificatif). C'est ce qui transforme
        une limite technique en simple détail, plutôt qu'en blocage de
        service public.
      </p>
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
          <strong>Identifiez vos interlocuteurs.</strong> Fournisseur de la
          donnée, opérateur de l'API, opérateur du bouquet, éditeur métier :
          selon votre situation, un seul de ces acteurs est votre point de
          contact réel.
        </li>
        <li>
          <strong
            >Quatre prérequis avant de lancer un chantier d'intégration
            d'API.</strong
          >
          Un prérequis de conception, technique, budgétaire — et juridique
          si l'API délivre des données protégées.
        </li>
        <li>
          <strong>Anticipez le parcours usager.</strong> Si l'API délivre de
          la donnée publique, une simple saisie du paramètre d'appel est
          suffisante. En revanche si la donnée est protégée, il faut
          s'assurer qu'elle n'est visible que par la bonne personne : soit
          en la transmettant directement aux instructeurs sans la montrer à
          l'usager si son identité n'est pas vérifiée, soit en vérifiant
          l'identité de l'usager au préalable (via vos propres moyens ou via
          FranceConnect) avant de la lui afficher, soit en la réservant aux
          outils métiers utilisés par des agents habilités.
        </li>
        <li>
          <strong>Quatre étapes pour intégrer les API.</strong> Explorer et
          tester l'API, sécuriser vos accès si l'API est en accès restreint,
          intégrer les données dans le parcours de l'usager, puis surveiller
          en production.
        </li>
        <li>
          <strong>Connaissez les limites des API.</strong> Couverture
          partielle, erreurs de saisie, données pas toujours à jour, quotas
          limités, pannes ponctuelles — un usager doit toujours pouvoir
          ressaisir une information ou déposer un document lui-même, sans
          que sa démarche soit bloquée.
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
import SimplifionsArticleFigure from '../../../components/article/SimplifionsArticleFigure.vue'

const articleMeta = {
  h1: "Prérequis et étapes d'intégration d'une API",
  title: "Prérequis et étapes d'intégration d'une API",
  description:
    "Prérequis techniques, juridiques et d'usage, étapes d'intégration, limites à connaître : Acteurs publics, ce guide vous aide à comprendre ce qui vous attend lorsque vous vous engagez dans la simplification de vos démarches grâce aux API.",
  articleTags: [],
  heroBackdropGradient: 'linear-gradient(135deg, #1b3a5c 0%, #cfe0ef 100%)',
  heroPanelBackground: 'var(--background-alt-beige-gris-galet)'
}
</script>
