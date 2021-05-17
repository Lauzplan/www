import { mount } from '@vue/test-utils'
import Login from '@/pages/callback/login.vue'

describe('Login callback page', () => {
  test('should redirect to the correct url if the login is correct', async () => {
    const replace = jest.fn()

    const wrapper = mount(Login, {
      mocks: {
        $router: {
          replace,
        },
        $auth: {
          handleRedirectCallback: jest
            .fn()
            .mockResolvedValue({ appState: '/dashboard' }),
        },
      },
    })

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(replace).toHaveBeenCalledWith('/dashboard')
  })

  test('should redirect to the home page if the login does not succeed', async () => {
    const replace = jest.fn()

    const wrapper = mount(Login, {
      mocks: {
        $router: {
          replace,
        },
        $auth: {
          handleRedirectCallback: jest.fn().mockRejectedValue(),
        },
      },
    })

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(replace).toHaveBeenCalledWith('/')
  })
})
