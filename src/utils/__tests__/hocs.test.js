/**
 * @vitest-environment happy-dom
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/vue'
import { afterEach, test } from 'vitest'

import TestItemWithToaster from './test-item-with-toaster.vue'
import TestItem from './test-item.vue'

afterEach(() => {
  cleanup()
})

test('ring the door', async () => {
  render(TestItem)
  screen.getByText('Knock, knock!')
  const button = screen.getByText('Doorbell')
  await fireEvent.click(button)
  await screen.findByText('Who’s there?')
  await fireEvent.click(button)
  await screen.findByText('Go away!')
})

test('hook a toaster on error', async () => {
  render(TestItemWithToaster)
  const button = screen.getByText('Doorbell')
  await fireEvent.click(button)
  await fireEvent.click(button)
  await screen.findByTestId('toast-content')
  screen.getByText('Go away!')
})
