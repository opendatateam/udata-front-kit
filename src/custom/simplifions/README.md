# Simplifions.data.gouv.fr

## Topics data

Simplifions uses 2 kinds of topics, identified by the tags `simplifions-cas-d-usages` and `simplifions-solutions`.
These topics are regularly updated with data from a Grist database by a DAG (it's like a CRON).

- [The grist database](https://grist.numerique.gouv.fr/o/circulation/c5pt7QVcKWWe)
- [The DAG](https://github.com/datagouv/datagouvfr_data_pipelines/blob/main/verticales/simplifions/README.md)

You can see the topics created by requesting topics like this :

- https://demo.data.gouv.fr/api/2/topics/?tag=simplifions-cas-d-usages
- https://demo.data.gouv.fr/api/2/topics/?tag=simplifions-solutions
