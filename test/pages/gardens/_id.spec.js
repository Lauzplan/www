import { createLocalVue, mount } from '@vue/test-utils'
import { createMockClient } from 'mock-apollo-client'
import VueApollo from 'vue-apollo'
import VueRouter from 'vue-router'
import Id from '@/pages/gardens/_id.vue'
import gardensIdsWithPreferences from '@/graphql/gardensIdsWithPreferences.gql'

describe('/gardens', () => {
  const localVue = createLocalVue()
  localVue.use(VueApollo)
  localVue.use(VueRouter)

  let mockClient
  let requestHandlers
  function createComponent(handlers) {
    const router = new VueRouter({
      routes: [
        {
          path: '/',
          redirect: '/gardens/1',
        },
        {
          path: '/gardens',
          name: 'gardens',
        },
        {
          path: '/gardens/:id',
          name: 'gardens-id',
          children: [
            {
              path: 'dashboard',
              name: 'gardens-id-dashboard',
            },
            {
              path: 'dashboard',
              name: 'gardens-id-map',
            },
          ],
        },
      ],
    })
    router.push('/gardens/1')

    mockClient = createMockClient()
    requestHandlers = {
      SelectGardenMutationHandler: jest.fn().mockResolvedValue({
        data: {},
      }),
      ...handlers,
    }

    mockClient.setRequestHandler(
      gardensIdsWithPreferences,
      requestHandlers.SelectGardenMutationHandler
    )

    localVue.component('gardens-id', Id)
    return mount(
      {
        template: `
          <keep-alive>
            <gardens-id />
          </keep-alive>
        `,
      },
      {
        stubs: ['nuxt-child'],
        apolloProvider: new VueApollo({
          defaultClient: mockClient,
        }),
        localVue,
        router,
      }
    )
  }

  test.skip('should redirect to the dashboard if no children is given', () => {
    createComponent()
    expect(window.location.hash).toEqual('#/gardens/1/dashboard')
  })
})
