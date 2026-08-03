<template>
  <SimplifionsArticleLayout
    :h1="articleMeta.h1"
    :title="articleMeta.title"
    :lead="articleMeta.description"
    :article-keywords="articleMeta.articleKeywords"
    :hero-backdrop-gradient="articleMeta.heroBackdropGradient"
    :hero-panel-background="articleMeta.heroPanelBackground"
    :breadcrumb-links="breadcrumbLinks"
  >
    <p class="fr-text--lg">
      Avant d'intégrer une API, il faut décider à quel endroit et comment vous
      allez récupérer le paramètre d'appel et afficher les données transmises
      par l'API. C'est un choix déterminant pour la qualité de l'expérience
      usager — d'autant plus lorsque l'API délivre des données protégées.
    </p>

    <SimplifionsArticleReadMore
      to="/articles/prerequis-et-etapes-integration-api"
      description="Découvrir les autres prérequis avant d'intégrer une API :"
    />

    <ArticleSection
      id="parcours-donnees-publiques"
      label="Parcours avec données publiques"
    >
      <template #heading>Parcours usager avec des données publiques</template>
      <p class="fr-text--lg">
        Lorsque la donnée délivrée par l'API est publique, une simple saisie du
        paramètre d'appel suffit à déclencher la récupération automatique.
      </p>

      <ol class="fr-mb-3w">
        <li>
          L'usager débute sa démarche. Il n'a pas eu besoin de s'authentifier ni
          même de se connecter.
        </li>
        <li>
          Au début du parcours, il saisit le ou les paramètres d'appel requis.
        </li>
        <li>
          Les données publiques transmises par l'API pré-remplissent les champs
          connus. Si l'usager identifie une erreur ou souhaite apporter une
          modification, un parcours dédié lui permet de le faire directement ou
          bien d'en faire la demande.
        </li>
      </ol>

      <div class="user-example fr-p-2w">
        <p class="fr-mb-0">
          💬
          <b
            >Exemple avec Gilles, bénévole d'une association, souhaitant
            réserver la salle communale</b
          >
        </p>
        <p class="fr-text--alt fr-text--lg">
          <i
            >Gilles se rend sur le site de la mairie, ouvre le formulaire dédié
            à cette démarche, saisit le numéro RNA de son association. Le nom,
            le régime, l'adresse et les activités principales de l'association
            sont automatiquement saisies dans le formulaire. S'il s'aperçoit
            qu'une donnée n'est pas à jour, il peut modifier le champ
            pré-rempli.</i
          >
        </p>

        <blockquote class="fr-highlight fr-highlight--grey-border">
          <p>
            ⚙️ <strong>Que s'est-il passé techniquement ?</strong> Le formulaire
            de la mairie intègre l'API Association du Ministère des Sports ou
            bien l'API données association en open data de l'API Entreprise. Le
            numéro RNA est le paramètre d'appel de cette API. Au moment où il
            est saisi par l'usager, un appel se déclenche.
          </p>
        </blockquote>
      </div>

      <p class="fr-mt-3w">
        <b>Ce parcours est le plus rapide à mettre en œuvre</b>, car il ne
        nécessite aucune brique d'authentification. En revanche, il ne
        s'applique qu'aux données non protégées (ex. la dénomination d'une
        entreprise) car rien n'empêche techniquement un tiers de saisir le même
        identifiant pour récupérer la donnée, voire faire des appels en masse
        pour récupérer toutes les données de l'API. Aucune donnée sensible ne
        doit être exposée par ce biais.
      </p>
    </ArticleSection>

    <ArticleSection
      id="parcours-donnees-protegees"
      label="Parcours avec données protégées"
    >
      <template #heading>Parcours usager avec des données protégées</template>
      <p class="fr-text--lg">
        Lorsque la donnée délivrée par l'API est protégée, quatre parcours sont
        possibles selon le niveau de confiance disponible sur l'identité de
        l'usager.
      </p>

      <h3>
        A. Sans authentification de l'usager, via transmission des justificatifs
        directement aux instructeurs
      </h3>

      <ol class="fr-mb-3w">
        <li>L'usager débute sa démarche, sans s'authentifier.</li>
        <li>
          Il saisit les informations le concernant qui permettent l'appel à
          l'API.
        </li>
        <li>
          <strong>Du côté de l'usager :</strong> Un message indique alors à
          l'usager le nombre de justificatifs ou données requis qui ont pu être
          transmis aux instructeurs. L'usager ne voit pas ces justificatifs car
          la donnée n'est pas publique. Il est en revanche informé du type de
          justificatif qui a été transmis. Si un justificatif n'a pas pu être
          récupéré, l'usager peut le déposer par lui-même.
          <br />
          <br />
          <strong>Du côté de l'agent habilité :</strong> Les justificatifs et
          données protégés ont été mis à disposition dans le dossier de
          l'usager. L'agent est informé si les pièces ont été récupérées par API
          (donc directement à la source) ou si elles ont été déposées par
          l'usager.
          <br />
          <blockquote class="fr-highlight fr-mt-2v">
            💡 Selon ce que l'agent est autorisé de consulter, vous pouvez
            adapter les informations que vous lui montrez. Par exemple, plutôt
            que de donner l'information précise telle que le quotient familial,
            vous pouvez plutôt indiquer la tranche de quotient familial.
          </blockquote>
        </li>
      </ol>

      <div class="user-example fr-p-2w">
        <p class="fr-mb-0">
          💬
          <b
            >Exemple avec Camille, agricultrice, et Nicolas, agent
            territorial</b
          >
        </p>
        <p class="fr-text--alt fr-text--lg">
          <br />
          <i
            >Camille a besoin d'un emplacement sur le marché de sa commune pour
            vendre sa production. Sur le portail de la commune, elle sélectionne
            la démarche et renseigne son numéro de SIRET. Les informations
            publiques de son entreprise sont aussitôt pré-remplies, modifiables
            si besoin.</i
          >
          <br />
          <i
            >Sur les cinq justificatifs requis, quatre sont automatiquement
            récupérés auprès des administrations compétentes : Camille n'a rien
            à chercher dans ses dossiers. Seul le cinquième document, hors
            périmètre de l'API, reste à sa charge — elle le dépose elle-même,
            sans que cela bloque sa démarche.</i
          >
          <br />
          <i
            >Nicolas, agent instructeur habilité, reçoit la demande. Depuis la
            fiche entreprise de Camille, il voit en un coup d'œil que toutes les
            pièces sont réunies : quatre sont récupérées à la source via API,
            une a été déposée manuellement. Il concentre son contrôle sur ce
            dernier document et valide la demande.</i
          >
        </p>

        <blockquote class="fr-highlight fr-highlight--grey-border">
          <p>
            ⚙️ <strong>Que s'est-il passé techniquement ?</strong> Le portail de
            la commune intègre plusieurs API. Le SIRET saisi par Camille sert de
            paramètre d'appel. Les documents récupérés sont stockés côté
            back-office et associés au dossier de Camille, sans lui être
            directement exposés.
          </p>
        </blockquote>
      </div>

      <p class="fr-mt-3w">
        <b
          >Ce parcours est le parcours à privilégier lorsqu'il n'est pas
          possible de s'assurer de l'identité réelle d'un individu</b
        >
        s'étant créé un compte dans vos systèmes d'information. Il présente
        l'avantage de rendre la démarche plus découvrable car aucune
        authentification n'est requise. En revanche, l'usager ne voit pas les
        pièces justificatives qu'il transmet, ce qui peut être délicat dans
        certaines situations.
      </p>

      <h3>
        B. Sans authentification de l'usager, avec consultation par un agent en
        guichet
      </h3>

      <ol class="fr-mb-3w">
        <li>
          L'usager se présente en guichet, ou entre en contact avec un agent par
          un autre canal.
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

      <div class="user-example fr-p-2w fr-mb-4w">
        <p class="fr-mb-0">
          💬
          <b>Exemple avec Élisabeth, allocataire, et Karim, agent en CCAS</b>
        </p>
        <p class="fr-text--alt fr-text--lg">
          <i
            >Élisabeth se présente au guichet de son centre communal d'action
            sociale. Karim, agent habilité, ouvre le dossier de Élisabeth et lui
            demande ses informations d'état civil. Élisabeth épelle son nom, son
            prénom et indique sa date et son lieu de naissance. Karim saisit ces
            informations dans le logiciel du CCAS pour récupérer la composition
            familiale, l'adresse et le quotient familial de Élisabeth.</i
          >
          <br />
          <i
            >Les données de Élisabeth s'affichent instantanément : Karim peut
            poursuivre l'instruction sans lui demander d'attestation de quotient
            familial, ni de justificatif d'adresse, ni de livret de famille.</i
          >
        </p>

        <blockquote class="fr-highlight fr-highlight--grey-border">
          <p>
            ⚙️ <strong>Que s'est-il passé techniquement ?</strong> Le logiciel
            métier du CCAS intègre l'API quotient familial du bouquet API
            Particulier. En saisissant les informations d'état civil
            d'Élisabeth, Karim renseigne en réalité les paramètres d'appel de
            l'API ce qui déclenche la requête.
          </p>
        </blockquote>
      </div>

      <h3>
        C. Après authentification de l'usager, via la saisie des paramètres
      </h3>

      <ol class="fr-mb-3w">
        <li>
          L'usager se connecte à son compte. Son identité a été vérifiée par
          l'administration en charge du service : elle sait que ce compte
          appartient bien à la bonne personne.
        </li>
        <li>
          L'usager saisit le ou les paramètres d'appel nécessaires, à moins que
          ceux-ci ne soient déjà disponibles dans son compte. Dans ce dernier
          cas, les informations déjà connues dans le compte ne sont pas
          redemandées (par exemple son prénom et son nom).
        </li>
        <li>
          La donnée protégée est récupérée et affichée directement dans son
          espace usager.
        </li>
        <li>
          Si l'usager identifie une erreur dans les données ou souhaite apporter
          une modification, l'interface lui permet.
          <router-link to="#parcours-alternatifs"
            >Plus d'informations sur parcours altenratifs</router-link
          >.
        </li>
      </ol>

      <div class="user-example fr-p-2w fr-mb-4w">
        <p class="fr-mb-0">
          💬
          <b
            >Exemple avec Léa, étudiante, ayant besoin d'une carte de
            transport</b
          >
        </p>
        <p class="fr-text--alt fr-text--lg">
          <i
            >Léa souhaite renouveler son abonnement annuel de transport pour sa
            nouvelle année universitaire. Elle se connecte à son compte usager.
            Lors de la création de son compte, elle avait dû fournir un
            justificatif de son identité, en guichet, par courrier ou voie
            électronique. En résumé, l'organisme responsable des transports dans
            sa ville sait que le compte de Léa, enregistré dans ses systèmes
            d'information, est bien le compte de la vraie Léa.</i
          >
          <br />
          <i
            >Dans le formulaire, elle n'a qu'à revalider son numéro étudiant,
            déjà pré-rempli grâce aux informations de son compte renseigné
            l'année précédente. Son statut d'étudiante et de boursière est
            confirmé et affiché directement dans son espace, avec la
            tarification adéquate. Léa n'a ni à chercher ni à téléverser une
            attestation. Elle confirme et obtient son abonnement.</i
          >
        </p>

        <blockquote class="fr-highlight fr-highlight--grey-border">
          <p>
            ⚙️ <strong>Que s'est-il passé techniquement ?</strong> Le portail de
            l'opérateur de transport dans sa ville intègre les API statut
            étudiant et statut étudiant boursier. Le numéro INE, un des
            paramètres d'appel de ces API, est déjà connu car saisi par Léa dans
            son compte l'année précédente. En confirmant son INE, Léa déclenche
            la requête auprès des API qui retournent son statut.
          </p>
        </blockquote>

        <p class="fr-text--alt fr-text--lg fr-mt-3v">
          <i
            >Imaginons que la récupération automatique d'un des justificatifs
            n'ait pas fonctionné. Le statut boursier de Léa n'a pas pu être
            récupéré. Il lui est alors proposé de pouvoir déposer son document
            (qui sera traité par un agent) et même de pouvoir s'abonner sans
            bénéficier du tarif. L'important est de laisser un maximum de
            liberté à Léa et de ne pas la bloquer si la récupération automatique
            par API échoue.</i
          >
        </p>
      </div>

      <div class="user-example fr-p-2w fr-mb-4w">
        <b>D'autres exemples avec le démonstrateur de l'API Particulier :</b>

        <ul class="fr-mb-0">
          <li>
            Démonstration avec Juliette, étudiante — Tarification transport :
            <a
              href="https://demonstrateur.particulier.api.gouv.fr/transport/souscription?user=2"
              target="_blank"
              rel="noopener noreferrer"
              >demonstrateur.particulier.api.gouv.fr</a
            >
          </li>
          <li>
            Démonstration avec Kevin — Tarification cantine pour ses enfants :
            <a
              href="https://demonstrateur.particulier.api.gouv.fr/cantine/souscription?user=4"
              target="_blank"
              rel="noopener noreferrer"
              >demonstrateur.particulier.api.gouv.fr</a
            >
          </li>
        </ul>
      </div>

      <p>
        <b>Ce parcours implique de disposer d'un système d'authentification</b>
        garantissant que la personne connectée est bien celle dont on va
        récupérer les données. Si votre compte usager contient déjà certaines
        informations (nom, prénom, date de naissance) suffisantes pour appeler
        l'API, évitez de les redemander à l'usager lors du parcours,
        permettez-lui simplement de les confirmer !
      </p>

      <h3>D. Via FranceConnect</h3>

      <ol class="fr-mb-3w">
        <li>
          L'usager clique sur «&nbsp;S'identifier avec FranceConnect&nbsp;» et
          choisit son fournisseur d'identité. Il saisit l'identifiant et le mot
          de passe de ce fournisseur d'identité. Avant de retourner sur le site
          de la démarche, FranceConnect lui précise que des données le
          concernant vont être transmises à ce site. L'usager valide.
        </li>
        <li>
          L'usager est alors connecté au compte du service en question. Les
          données protégées sont pré-remplies dans sa démarche.
        </li>
        <li>
          Si l'usager identifie une erreur dans les données ou souhaite apporter
          une modification, l'interface lui permet.
          <router-link to="#parcours-alternatifs"
            >Plus d'informations sur parcours altenratifs</router-link
          >.
        </li>
      </ol>

      <div class="user-example fr-p-2w fr-mb-4w">
        <p class="fr-mb-0">
          💬 <b>Exemple avec Malik, inscrivant ses enfants à la cantine</b>
        </p>
        <p class="fr-text--alt fr-text--lg">
          <i
            >Malik souhaite inscrire ses enfants à la cantine municipale. Sur le
            portail de sa commune, il choisit de se connecter via FranceConnect
            en cliquant sur le bouton «&nbsp;S'identifier avec
            FranceConnect&nbsp;». Il choisit son fournisseur d'identité
            habituel, entre son identifiant et son mot de passe. FranceConnect
            lui demande de confirmer la transmission de ses données d'état
            civil, de son quotient familial, sa composition familiale
            (l'identité de ses enfants) et de son revenu fiscal de référence.
            Malik confirme.</i
          >
          <br />
          <i
            >Une fois FranceConnecté, il n'a rien de plus à saisir : son
            quotient familial, la liste de ses enfants, et son revenu fiscal de
            référence ont été automatiquement récupérés, il peut les consulter
            avant d'envoyer son dossier. S'il identifie une erreur, Malik peut
            proposer une autre information et déposer un justificatif.</i
          >
        </p>

        <blockquote class="fr-highlight fr-highlight--grey-border">
          <p>
            ⚙️ <strong>Que s'est-il passé techniquement ?</strong> Le portail de
            la commune intègre FranceConnect et les API FranceConnectées
            Quotient familial CAF &amp; MSA du bouquet API Particulier et l'API
            Impôt Particulier de la DGFIP. Les paramètres d'appel de ces API
            n'ont pas à être saisis par Malik : en effet l'appel est déclenché
            avec l'identité pivot (son état civil) connue de FranceConnect, au
            moment de la FranceConnexion. Au moment où Malik confirme la liste
            des données transmises au site, il permet à la fois sa connexion et
            l'appel aux API.
          </p>
        </blockquote>
      </div>

      <div class="user-example fr-p-2w fr-mb-4w">
        <b>D'autres exemples avec le démonstrateur de l'API Particulier :</b>
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
            Démonstration avec Camille — Tarification cantine pour ses enfants :
            <a
              href="https://demonstrateur.particulier.api.gouv.fr/fr/cantine/souscription?user=3"
              target="_blank"
              rel="noopener noreferrer"
              >demonstrateur.particulier.api.gouv.fr</a
            >
          </li>
        </ul>
      </div>

      <p class="fr-mt-3w">
        <b>Ce parcours bénéficie de la sécurité apportée par FranceConnect</b>.
        Avec FranceConnect, vous êtes sûr que le compte d'une personne est bien
        celui de cette personne. Pour l'usager c'est aussi bien plus simple, la
        récupération des données protégées se fait sans besoin de ressaisir des
        paramètres.
        <br />
        Toutefois, comme tous les usagers n'utilisent pas FranceConnect, cette
        modalité doit au moins être combinée aux parcours A ou C pour couvrir
        l'ensemble des usagers.
      </p>
    </ArticleSection>

    <ArticleSection id="parcours-alternatifs" label="Parcours alternatifs">
      <template #heading>Parcours alternatifs</template>

      <p class="fr-text--lg">
        <strong
          >Quel que soit le parcours retenu, prévoyez toujours des parcours
          alternatifs.</strong
        >
        Aucune API n'est fiable à 100% : en cas de panne, de donnée manquante ou
        erronnée, l'usager doit pouvoir saisir l'information manuellement ou
        déposer le document lui-même, sans que sa démarche soit bloquée.
      </p>

      <SimplifionsArticleReadMore
        to="/articles/prerequis-et-etapes-integration-api#limites"
        description="En savoir plus sur les limites des API :"
        section-title="Les limites des API"
      />

      <h3>Pallier une panne ou une indisponibilité de l'API</h3>
      <p>
        Une API peut être indisponible, retourner une erreur, ou ne pas avoir la
        donnée recherchée. Le parcours doit alors permettre à l'usager de
        continuer sa démarche autrement : saisie manuelle de l'information, ou
        dépôt du justificatif par ses soins. Un incident technique ne doit
        jamais bloquer l'usager.
      </p>
      <h3 class="fr-mt-3w">Pallier une erreur de donnée</h3>
      <p>
        Un usager peut aussi constater que la donnée récupérée par API est
        erronée ou périmée. Le parcours alternatif à proposer dépend alors de la
        fiabilité de l'API :
      </p>
      <p>
        <strong
          >Pour les API dont la fraîcheur ou la qualité de la donnée n'est pas
          garantie</strong
        >, il peut être utile de permettre à l'usager de saisir directement
        l'information.
      </p>
      <p>
        <strong
          >Pour les API très fiables en termes de qualité et de fraîcheur de
          données</strong
        >, il est préférable de ne pas proposer à l'usager de "corriger" la
        donnée récupérée par API, mais plutôt de lui proposer un parcours
        alternatif dans lequel il peut suggérer sa correction, en déposant un
        élément qui justifie sa demande de correction.
      </p>
      <p>
        Dans les deux situations, assurez-vous de toujours indiquer à l'agent
        d'où provient l'information : est-elle récupérée par API ou indiquée par
        l'usager ? Pour lui permettre d'arbitrer, fournissez-lui les deux
        informations.
      </p>
    </ArticleSection>

    <ArticleSection id="recapitulatif" label="Pour résumer">
      <SimplifionsArticleChecklist>
        <li>
          <strong
            >Le choix du parcours dépend de l'ouverture de la donnée transmise
            par API.</strong
          >
          Lorsque la donnée est plubique, le parcours est facile car la réponse
          de l'API peut être affichée. En revanche lorsque la donnée est
          protégée, les parcours possibles sont construits de façon à s'assurer
          que la donnée protégée sera visible uniquement par les bonnes
          personnes.
        </li>
        <li>
          <strong
            >Quatre parcours possibles pour les données protégées :</strong
          >
          Transmission directe aux instructeurs sans montrer la donnée à
          l'usager si son identité n'est pas vérifiée, consultation par un agent
          en guichet, affichage à l'usager après vérification de son identité
          via son compte usager ou FranceConnect.
        </li>
        <li>
          <strong>Prévoyez toujours un parcours alternatif.</strong> En cas de
          panne, de donnée obsolète ou erronnée, l'usager doit pouvoir saisir
          l'information et déposer un justificatif.
        </li>
      </SimplifionsArticleChecklist>
    </ArticleSection>
  </SimplifionsArticleLayout>
</template>

<script setup lang="ts">
import SimplifionsArticleChecklist from '../../components/article/SimplifionsArticleChecklist.vue'
import SimplifionsArticleLayout from '../../components/article/SimplifionsArticleLayout.vue'
import SimplifionsArticleReadMore from '../../components/article/SimplifionsArticleReadMore.vue'
import ArticleSection from '../../components/article/SimplifionsArticleSection.vue'
import {
  articleAnticiperParcoursUsager as articleMeta,
  getArticleBreadcrumbLinks
} from '../../model/articles'

const breadcrumbLinks = getArticleBreadcrumbLinks(articleMeta.h1)
</script>

<style scoped>
.fr-highlight--grey-border {
  background-image: linear-gradient(
    0deg,
    var(--border-default-grey),
    var(--border-default-grey)
  );
}
.user-example {
  background-color: var(--background-alt-beige-gris-galet);
}
</style>
