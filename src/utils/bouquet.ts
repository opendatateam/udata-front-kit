import type { DatasetProperties } from '@/model'

export const getDatasetListTitle = (
  datasets: DatasetProperties[],
  title: string = 'Composition du bouquet'
): string => {
  const numberOfDatasets = datasets.length
  switch (numberOfDatasets) {
    case 0: {
      return title
    }
    case 1: {
      return `${title} ( 1 jeu de données )`
    }
    default: {
      return `${title} ( ${numberOfDatasets} jeux de données )`
    }
  }
}
