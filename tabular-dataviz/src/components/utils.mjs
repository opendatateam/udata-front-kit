export function makeDropdown(dropdownId, label, options) {
  /**
   * Select basique du DSFR
   */
  const optionsHtlm = options
    .map(
      (option, index) =>
        `<option value="${option.value}" ${index == 0 ? 'selected' : ''}>${option.label}</option>`
    )
    .join(' ')
  return `<div class="fr-select-group">
            <label class="fr-label" for="select-${dropdownId}">${label}</label>
            <select class="fr-select" aria-describedby="select-${dropdownId}-messages" id="select-${dropdownId}">
                ${optionsHtlm}
            </select>
            <div class="fr-messages-group" id="select-${dropdownId}-messages" aria-live="polite">
            </div>
          </div>`
}
