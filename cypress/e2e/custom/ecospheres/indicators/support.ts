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

  // DatasetV2WithFullObject replaces license/frequency/spatial with richer objects; license/frequency default to null.
  return {
    ...dataset,
    license: null,
    frequency: null,
    spatial: { granularity: { id: 'fr:region', name: 'Région' }, zones: [] },
    extras
  }
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
