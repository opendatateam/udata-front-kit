import { getMeshDropdownContainer, getMeshSelect } from '../core/dom.mjs'
import { MESHES } from '../core/enums.mjs'
import { makeDropdown } from './basic.mjs'
import { makeTerritoryDropDown } from './territory.mjs'

export function makeMeshDropdown(indicator, possibleMeshes) {
  /*
   * Construction et ajout de la dropdown des mailles
   */
  const meshes = MESHES.filter((m) => possibleMeshes.includes(m[0]))
  if (meshes.length === 0) {
    throw 'no mesh'
  }
  const container = getMeshDropdownContainer(indicator)
  const html = makeDropdown(
    `mesh-${indicator.id}`,
    'Maille',
    meshes.map((m) => ({
      value: m[0],
      label: m[1]
    }))
  )
  container.innerHTML = html
  const meshSelect = getMeshSelect(indicator)
  meshSelect.addEventListener('change', () => {
    makeTerritoryDropDown(indicator)
  })
}
