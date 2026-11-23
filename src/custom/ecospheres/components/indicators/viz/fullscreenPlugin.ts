import type { Plugin } from 'chart.js'

export const fullscreenPlugin: Plugin = {
  id: 'fullscreen',
  afterRender(chart) {
    const container = chart.canvas.parentElement
    if (!container || container.querySelector('.chart-fullscreen-btn')) return

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className =
      'chart-fullscreen-btn fr-btn fr-btn--sm fr-icon-fullscreen-line fr-btn--tertiary-no-outline fr-ratio-1x1'
    btn.title = 'Afficher en plein écran'
    btn.onclick = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        container.requestFullscreen()
      }
    }
    container.appendChild(btn)
  }
}
