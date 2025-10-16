import type { Indicator } from '@/custom/ecospheres/model/indicator'
import { datasetFactory } from 'cypress/support/factories/datasets_factory'

// Helper to create an indicator from a dataset
export function createIndicator(overrides = {}): Indicator {
  const dataset = datasetFactory.one({
    overrides: {
      title: 'Test Indicator Title',
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

  // Build properly typed Indicator with extras nested under 'ecospheres-indicateurs'
  const indicator: Indicator = {
    ...dataset,
    extras: {
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
        ]
      }
    }
  }

  return indicator
}
