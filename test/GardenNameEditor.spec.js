import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { fireEvent } from '@testing-library/vue'
import { createMockClient } from 'mock-apollo-client'
import VueApollo from 'vue-apollo'
import GardenNameEditor from '@/components/default_layout/GardenNameEditor.vue'
import updateGarden from '@/graphql/updateGarden.gql'
import Vue from 'vue'
import Vuetify from 'vuetify'

import { renderWithVuetify } from './utils'

Vue.use(VueApollo)
Vue.use(Vuetify)

let mockClient
let requestHandlers
function createComponent(handlers) {
  mockClient = createMockClient()
  requestHandlers = {
    updateGardenMutationHandler: jest.fn().mockResolvedValue({
      data: {
        updateGarden: {
          id: 1,
          name: 'New Name',
          __type: 'GardenType',
        },
      },
    }),
    ...handlers,
  }

  mockClient.setRequestHandler(
    updateGarden,
    requestHandlers.updateGardenMutationHandler
  )

  return renderWithVuetify(GardenNameEditor, {
    propsData: {
      garden: {
        name: 'A Garden',
        id: 1,
      },
    },
    apolloProvider: new VueApollo({
      defaultClient: mockClient,
    }),
  })
}

describe('GardenNameEditor', () => {
  jest.useFakeTimers('modern')
  test('should display the name of the given garden', () => {
    const { getByDisplayValue } = renderWithVuetify(GardenNameEditor, {
      propsData: {
        garden: {
          name: 'A Garden',
          id: 1,
        },
      },
    })

    getByDisplayValue('A Garden')
  })

  test('should not change the garden name when typing', () => {
    const garden = {
      name: 'A Garden',
      id: 1,
    }
    const { getByRole } = renderWithVuetify(GardenNameEditor, {
      propsData: {
        garden,
      },
    })

    userEvent.type(getByRole('textbox'), 'hello')
    expect(garden.name).toEqual('A Garden')
  })

  test('should display a tooltip when overed for at least 100 ms', async () => {
    const { getByRole, getByText } = renderWithVuetify(GardenNameEditor, {
      propsData: {
        garden: {
          name: 'A Garden',
          id: 1,
        },
      },
    })
    userEvent.hover(getByRole('textbox'))
    jest.runTimersToTime(100)
    await Vue.nextTick()
    getByText('Renommer')
  })

  test('should not display the tooltip when overed for less than 100 ms', () => {
    const { getByRole, queryByText } = renderWithVuetify(GardenNameEditor, {
      propsData: {
        garden: {
          name: 'A Garden',
          id: 1,
        },
      },
    })

    const input = getByRole('textbox')
    userEvent.hover(input)
    jest.runTimersToTime(100)
    userEvent.unhover(input)
    expect(queryByText('Renommer')).toBeNull()
  })

  test('should display the new name if the garden changes', async () => {
    const { getByDisplayValue, updateProps } = renderWithVuetify(
      GardenNameEditor,
      {
        propsData: {
          garden: {
            name: 'A Garden',
            id: 1,
          },
        },
      }
    )

    getByDisplayValue('A Garden')
    await updateProps({ garden: { name: 'new garden', id: 1 } })
    getByDisplayValue('new garden')
  })

  test('should request a name update when pressing enter', () => {
    const { getByRole } = createComponent()

    const input = getByRole('textbox')
    userEvent.clear(input)
    userEvent.type(input, 'hello{enter}')
    expect(requestHandlers.updateGardenMutationHandler).toHaveBeenCalledTimes(1)
    expect(requestHandlers.updateGardenMutationHandler).toHaveBeenCalledWith({
      id: 1,
      gardenName: 'hello',
    })
  })

  test('should request a name update when leaving the input', async () => {
    const { getByRole } = createComponent()

    const input = getByRole('textbox')
    userEvent.clear(input)
    userEvent.type(input, 'hello')
    await fireEvent.blur(input)
    expect(requestHandlers.updateGardenMutationHandler).toHaveBeenCalledTimes(1)
    expect(requestHandlers.updateGardenMutationHandler).toHaveBeenCalledWith({
      id: 1,
      gardenName: 'hello',
    })
  })

  test('should display loading when the request is beeing made', async () => {
    const { getByRole, queryByRole } = createComponent()
    userEvent.type(getByRole('textbox'), 'hello{enter}')
    await Vue.nextTick()
    getByRole('progressbar')

    await Vue.nextTick()
    await Vue.nextTick()
    await Vue.nextTick()
    expect(queryByRole('progressbar')).toBeNull()
  })

  test('should reset to the previous name if the request fails', async () => {
    const { getByRole, getByDisplayValue } = createComponent({
      updateGardenMutationHandler: jest
        .fn()
        .mockRejectedValue(new Error('GraphQL error')),
    })
    userEvent.type(getByRole('textbox'), 'hello{enter}')
    await Vue.nextTick()
    await Vue.nextTick()
    await Vue.nextTick()
    getByDisplayValue('A Garden')
  })

  test('should emit an error event when the request fails', async () => {
    const { getByRole, emitted } = createComponent({
      updateGardenMutationHandler: jest
        .fn()
        .mockRejectedValue(new Error('GraphQL error')),
    })
    userEvent.type(getByRole('textbox'), 'hello{enter}')
    await Vue.nextTick()
    await Vue.nextTick()
    await Vue.nextTick()

    const { error } = emitted()
    expect(error).toHaveLength(1)
    expect(error[0]).toEqual(['Impossible de sauver le nom'])
  })
})
