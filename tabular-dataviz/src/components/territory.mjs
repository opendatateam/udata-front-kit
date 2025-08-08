import {
  getCurrentMesh,
  getTerritoryDropdownContainer,
  getTerritorySelect
} from '../core/dom.mjs'
import { fetchData } from '../core/fetch.mjs'
import { COMMUNES } from '../data/territories/communes.mjs'
import { DEPARTEMENTS } from '../data/territories/departements.mjs'
import { EPCIS } from '../data/territories/epcis.mjs'
import { REGIONS } from '../data/territories/regions.mjs'
import { makeSearchDropDown } from './search.mjs'

export function makeTerritoryDropDown(indicator) {
  /**
   * Construction et ajout de la dropdown des territoires
   * les listes des territoires sont importées depuis des fichiers "en dur"
   */
  const choices = {
    region: {
      label: 'Région',
      values: REGIONS
    },
    departement: {
      label: 'Département',
      values: DEPARTEMENTS
    },
    epci: {
      label: 'EPCI',
      values: EPCIS
    },
    commune: {
      label: 'Commune',
      values: COMMUNES
    }
  }
  const mesh = getCurrentMesh(indicator)
  if (mesh !== 'fr') {
    if ((!mesh) in choices) {
      throw 'no territories for this mesh'
    }
    const container = getTerritoryDropdownContainer(indicator)
    makeSearchDropDown(
      container,
      `${mesh}-${indicator.id}`,
      choices[mesh].label,
      choices[mesh].values.map((r) => ({
        value: r[0],
        label: `${r[1]} - ${r[0]}`
      }))
    )
    const territorySelect = getTerritorySelect(indicator)
    territorySelect.addEventListener('change', () => {
      fetchData(indicator)
    })
  }
  fetchData(indicator)
}
