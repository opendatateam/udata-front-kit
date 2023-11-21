/**
 * @vitest-environment happy-dom
 */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved
} from '@testing-library/vue'
import { afterEach, test } from 'vitest'

import TestItemWithLoader from './test-item-with-loader.vue'

afterEach(() => {
  cleanup()
})

test('show and hide a loader', async () => {
  render(TestItemWithLoader)
  const button = screen.getByText('Doorbell')
  await fireEvent.click(button)
  const loader = screen.getByLabelText('Loading')
  await waitForElementToBeRemoved(loader).then(() =>
    screen.getByText('Police!')
  )
})
