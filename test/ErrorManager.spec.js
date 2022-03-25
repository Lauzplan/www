import '@testing-library/jest-dom'
import { fireEvent } from '@testing-library/vue'

import ErrorManager from '@/components/ErrorManager.vue'
import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRx from 'vue-rx'

import { renderWithVuetify } from './utils'

Vue.use(VueRx)
Vue.use(Vuetify)

describe('ErrorManager', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern')
  })

  test('should display the given error for 2s', async () => {
    const { updateProps, getByText, debug } = renderWithVuetify(ErrorManager)
    await updateProps({ error: { message: 'some error' } })
    expect(getByText('some error')).toBeVisible()
    jest.runTimersToTime(2000)
    await Vue.nextTick()
    debug()
    expect(getByText('some error')).not.toBeVisible()
  })

  test('sould stop showing the error message if the close button is closed', async () => {
    const { updateProps, getByText, getByRole } = renderWithVuetify(
      ErrorManager
    )
    await updateProps({ error: { message: 'some error' } })
    expect(getByText('some error')).toBeVisible()
    fireEvent.click(getByRole('button', { name: 'Close' }))
    await Vue.nextTick()
    expect(getByText('some error')).not.toBeVisible()
  })

  test('should show an error for 2s before showing a new one after 500ms', async () => {
    const { updateProps, getByText } = renderWithVuetify(ErrorManager)
    await updateProps({ error: { message: 'some error' } })
    await updateProps({ error: { message: 'another error' } })

    expect(getByText('some error')).toBeVisible()
    jest.runTimersToTime(2000)
    await Vue.nextTick()
    expect(getByText('some error')).not.toBeVisible()
    jest.runTimersToTime(500)
    await Vue.nextTick()
    expect(getByText('another error')).toBeVisible()
    jest.runTimersToTime(2000)
    await Vue.nextTick()
    expect(getByText('another error')).not.toBeVisible()
  })

  test.skip('should show the new error 500ms after the previous one is closed', async () => {
    const { updateProps, getByText, getByRole } = renderWithVuetify(
      ErrorManager
    )
    await updateProps({ error: { message: 'some error' } })
    await Vue.nextTick()
    await updateProps({ error: { message: 'another error' } })

    expect(getByText('some error')).toBeVisible()

    fireEvent.click(getByRole('button', { name: 'Close' }))

    jest.runTimersToTime(500)
    await Vue.nextTick()
    await Vue.nextTick()
    await Vue.nextTick()
    await Vue.nextTick()
    await Vue.nextTick()
    await Vue.nextTick()
    await Vue.nextTick()
    await Vue.nextTick()
    await Vue.nextTick()
    expect(getByText('another error')).toBeVisible()
    jest.runTimersToTime(2000)
    await Vue.nextTick()
    expect(getByText('another error')).not.toBeVisible()
  })
})
