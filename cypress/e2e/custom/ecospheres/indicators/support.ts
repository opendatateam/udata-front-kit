import type {
  Indicator,
  IndicatorExtras
} from '@/custom/ecospheres/model/indicator'
import { datasetFactory } from 'cypress/support/factories/datasets_factory'
import { resourceFactory } from 'cypress/support/factories/resources_factory'

// Helper to create an indicator from a dataset
export function createIndicator(
  overrides = {},
  extraOverrides = {}
): Indicator {
  const dataset = datasetFactory.one({
    overrides: {
      title: 'Test Indicator Title',
      description: 'This is the indicator description.',
      tags: [
        'ecospheres-indicateurs',
        'ecospheres-indicateurs-theme-mieux-consommer',
        'ecospheres-indicateurs-enjeu-biodiversite',
        'ecospheres-indicateurs-secteur-energie',
        'ecospheres-indicateurs-levier-biogaz'
      ],
      spatial: {
        granularity: 'fr:region',
        zones: []
      },
      ...overrides
    }
  })

  const extras: IndicatorExtras = {
    'ecospheres-indicateurs': {
      unite: 'kg CO2',
      mailles_geographiques: ['country', 'fr:region', 'fr:departement'],
      axes: {
        annee: ['2020', '2021', '2022'],
        secteur: ['transport', 'energie', 'agriculture']
      },
      calcul: {
        responsable: 'Responsable du calcul',
        methode: 'Méthode de calcul détaillée'
      },
      api: {
        id: 'api_id_1',
        description:
          'API permettant de récupérer les données de cet indicateur',
        noms_cubes: ['cube_1']
      },
      sources: [
        {
          nom: 'Source 1',
          url: 'https://example.com/source1',
          description: 'Description de la source 1',
          producteur: 'Producteur 1',
          distributeur: 'Distributeur 1',
          plage_temporelle: {
            start: '2020-01-01',
            end: '2022-12-31'
          }
        }
      ],
      ...extraOverrides
    }
  }

  const indicator: Indicator = {
    ...dataset,
    extras
  }

  return indicator
}

export function createIndicatorResource() {
  return resourceFactory.one({
    overrides: {
      extras: {
        'ecospheres-indicateurs': {
          maille: 'region',
          'value-column': 'value',
          axes: {
            annee: ['2020', '2021', '2022'],
            secteur: ['transport', 'energie']
          }
        }
      }
    }
  })
}
