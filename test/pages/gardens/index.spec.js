import { shallowMount, createLocalVue } from '@vue/test-utils'
import { createMockClient } from 'mock-apollo-client'
import VueApollo from 'vue-apollo'
import Index from '@/pages/gardens/index.vue'
import gardensIdsWithPreferences from '@/graphql/gardensIdsWithPreferences.gql'

describe('/gardens', () => {
  const localVue = createLocalVue()
  localVue.use(VueApollo)

  let mockClient
  let requestHandlers
  let replace
  function createComponent(handlers) {
    mockClient = createMockClient()
    requestHandlers = {
      gardensQueryHandler: jest.fn().mockResolvedValue({
        data: {
          gardens: [
            {
              id: 1,
              __type: 'GardenType',
            },
            {
              id: 2,
              __type: 'GardenType',
            },
          ],
          me: {
            __type: 'UserType',
            preferences: {
              __type: 'UserPreferences',
              selectedGarden: {
                id: 2,
              },
            },
          },
        },
      }),
      ...handlers,
    }

    mockClient.setRequestHandler(
      gardensIdsWithPreferences,
      requestHandlers.gardensQueryHandler
    )

    return shallowMount(Index, {
      mocks: {
        $router: {
          replace,
        },
      },
    })
  }
  test('should redirect to the users prefered garden', async () => {
    replace = jest.fn()
    const wrapper = createComponent()
    const redirect = jest.fn()
    await wrapper.vm.$options.middleware({
      app: {
        apolloProvider: new VueApollo({
          defaultClient: mockClient,
        }),
      },
      redirect,
    })

    await wrapper.vm.$nextTick()

    expect(redirect).toHaveBeenCalledWith({
      name: 'gardens-id',
      params: { id: 2 },
    })
  })

  test('should redirect to /no-gardens if there is no garden in the list', async () => {
    replace = jest.fn()
    const wrapper = createComponent({
      gardensQueryHandler: jest.fn().mockResolvedValue({
        data: {
          gardens: [],
          me: {
            __type: 'UserType',
          },
        },
      }),
    })
    const redirect = jest.fn()
    await wrapper.vm.$options.middleware({
      app: {
        apolloProvider: new VueApollo({
          defaultClient: mockClient,
        }),
      },
      redirect,
    })

    await wrapper.vm.$nextTick()

    expect(redirect).toHaveBeenCalledWith('/no-garden')
  })
})
