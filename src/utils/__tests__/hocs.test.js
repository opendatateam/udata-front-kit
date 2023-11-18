/**
 * @vitest-environment happy-dom
 */

import { render } from '@testing-library/vue'
import { expect, test } from 'vitest'

import Test from './test-item.vue'

test('Test', () => {
  const { baseElement } = render(Test)
  expect(baseElement).toBe(document.body)
})
