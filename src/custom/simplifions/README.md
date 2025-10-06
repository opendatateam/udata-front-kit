# Simplifions.data.gouv.fr

## Topics data

Simplifions uses 2 kinds of topics, identified by the tags `simplifions-cas-d-usages` and `simplifions-solutions`.
These topics are regularly updated with data from a Grist database by a DAG (it's like a CRON).

- [The grist database](https://grist.numerique.gouv.fr/o/circulation/ofSVjCSAnMb6/Simplifions)
- [The DAG](https://github.com/datagouv/datagouvfr_data_pipelines/blob/main/verticales/simplifions/README.md)

You can see the topics created by requesting topics like this :

- https://demo.data.gouv.fr/api/2/topics/?tag=simplifions-cas-d-usages
- https://demo.data.gouv.fr/api/2/topics/?tag=simplifions-solutions

# Deployment

Use the Github Action "Deployment on datagouv domains with version bump".

## Preproduction

To deploy to https://simplifions.preprod.data.gouv.fr/, use the branch `simplifions-preprod`.

Keep the same config as the main branch. You can override `simplifions-preprod` with the `main`, no problem.

## Production

To deploy to https://simplifions.data.gouv.fr/, use the branch `simplifions-prod`.

**Don't override the branch**, because you need to keep these elements of config from the `simplifions-prod` branch :

```yaml
datagouvfr:
  base_url: https://www.data.gouv.fr

notice:
  display: false

matomo:
  siteId: 311

sentry:
  environment: 'production'
```

So merge the branch `main` into `simplifions-prod` before deploying.
