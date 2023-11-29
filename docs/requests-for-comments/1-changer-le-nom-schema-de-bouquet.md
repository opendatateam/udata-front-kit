# Changer le nom « schéma de bouquet »

## Contexte

Le périmètre d'Écosphères comprend la notion de « schéma de bouquet ».

Le terme renvoie à la notion d'un bouquet pré-rempli.

Par exemple, un bouquet type pour un cas d'utilisation particulier.

En extrapolant, si un bouquet était une lettre, un schéma serait un modèle de 
lettre d'attestation sur l'honneur.

## Problème

Si l'on prend un schema comme la spécification d'un modèle de données, 
l'utilisation du mot pour décrire la feature souhaitée ici est inappropriée.

Voir exemple en [annexe](#annexe).

## Discussion

Une discussion asynchrone a eu lieu sur Slack entre le 25/11/2023 et le
27/11/2023, où ont participé Gabriel, Johan, Martin, et Mauko.

De la discussion ont émergé les propositions décrites ci-dessous.

## Protocole

Aucun protocole n'a été établi pour ce RFC.

Malgré cela, les participants ont manifesté leurs préférences avec un 👍

## Choix

### Proposition 0 : garder le mot schéma

Un schéma comprend les valeurs possibles d'un modèle de données et peut donc, 
même si à contre-emploi, être utilisé pour décrire cette feature.

### Proposition 1 : utiliser le mot template

C'est un mot bien compris dans son sens courant, mais peut être confus pour 
les dévs (cf. template `vuejs`).

### Proposition 2 : utiliser le terme modèle de bouquet.

C'est un terme bien compris dans son sens administratif, mais peut être 
confondu avec - justement - schema de données.

### Proposition 3 : utiliser le terme bouquet type

C'est bien compris dans son sens courant, pas de contre-argument à signaler.

### Proposition 4 : utiliser le terme trame de bouquet

Schéma se réfère à plein d'autres choses qui ne ressemblent pas à ce que l'on 
souhaite exprimer ici, qui est une trame de bouquet liée à un cas d'usage.

## Conclusions

- Proposition 2 👍
- Proposition 4 👍👍👍

**La proposition 4 est adoptée.**

## Annexe

- [Exemple de schéma de données](https://schema.data.gouv.fr/schemas/etalab/schema-irve-statique/2.2.0/schema-statique.json)