/**
 * @vitest-environment happy-dom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { test } from 'vitest'

import TestItem from './test-item.vue'

test('ring the door', async () => {
  render(TestItem)
  screen.getByText('Knock, knock!')
  const button = screen.getByText('Doorbell')
  await fireEvent.click(button)
  await waitFor(() => screen.getByText('Who’s there?'))
  await fireEvent.click(button)
  await waitFor(() => screen.getByText('Go away!'))
})
