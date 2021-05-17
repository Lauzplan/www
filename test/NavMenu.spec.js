import Vue from 'vue'
import Vuetify from 'vuetify'
import '@testing-library/jest-dom'
import { fireEvent } from '@testing-library/vue'

import NavMenu from '@/components/NavMenu.vue'

import { renderWithVuetify } from './utils'
Vue.use(Vuetify)

const routes = [
  {
    path: '/',
  },
  {
    path: '/path/:id',
    children: [
      {
        path: 'another',
      },
    ],
  },
]
const menuRoutes = [
  {
    to: { path: '/' },
    title: 'home',
  },
  {
    to: { path: '/path/1' },
    title: 'A route',
  },
]

const basicApp = {
  name: 'App',
  template: `
    <div>
      <div data-testid="location">{{$route.path}}</div>
      <nav-menu :routes="routes"/>
    </div>
      `,
  components: { NavMenu },
  props: {
    routes: {
      type: Array,
    },
  },
}

describe('NavMenu', () => {
  test('the menu displays the current route', async () => {
    const { getByRole } = renderWithVuetify(
      NavMenu,
      {
        props: {
          routes: menuRoutes,
        },
        routes,
      },
      (vue, store, router) => {
        router.push('/path/1/another')
      }
    )
    await Vue.nextTick()
    getByRole('button', { name: 'A route' })
  })

  test('the menu list should display all the given routes title', () => {
    const { getAllByRole } = renderWithVuetify(
      NavMenu,
      {
        props: {
          routes: menuRoutes,
        },
        routes,
      },
      (vue, store, router) => {
        router.push('/path/1/another')
      }
    )

    const listItems = getAllByRole('option', { hidden: true })

    expect(listItems.length).toBe(2)
    expect(listItems[0]).toHaveTextContent('home')
    expect(listItems[1]).toHaveTextContent('A route')
  })

  test('navigate to the cliked item', async () => {
    const { getByRole, getByTestId } = renderWithVuetify(
      { ...basicApp },
      {
        props: {
          routes: menuRoutes,
        },
        routes,
      },
      (vue, store, router) => {
        router.push('/path/1/another')
      }
    )

    expect(getByTestId('location')).toHaveTextContent('/path/1/another')
    await Vue.nextTick()
    const menu = getByRole('button', { name: 'A route' })
    await fireEvent.click(menu)
    const option = getByRole('option', { hidden: true, name: 'home' })
    await fireEvent.click(option)
    await Vue.nextTick()
    getByRole('button', { name: 'home' })
    expect(getByTestId('location')).toHaveTextContent('/')
  })

  test('set the default slot as the menu button', async () => {
    const { getByRole, getByTestId } = renderWithVuetify(
      {
        ...basicApp,
        template: `
    <nav-menu :routes="routes" v-slot="{route}">
      <div data-testid="default-slot">
        {{route.to.path}}
      </div>
    </nav-menu>
    `,
      },
      {
        props: {
          routes: menuRoutes,
        },
        routes,
      }
    )

    await Vue.nextTick()
    getByTestId('default-slot')
    getByRole('button', { name: '/' })
  })

  test('set the append slot at the end off the options', async () => {
    const { getByRole, getByTestId } = renderWithVuetify(
      {
        ...basicApp,
        template: `
    <nav-menu :routes="routes">
      <template #append>
        <div data-testid="append-slot" />
      </template>
    </nav-menu>
    `,
      },
      {
        props: {
          routes: menuRoutes,
        },
        routes,
      }
    )

    await Vue.nextTick()
    expect(getByRole('menu', { hidden: true }).lastChild).toBe(
      getByTestId('append-slot')
    )
  })

  test('set the prepend slot at the begining off the options', async () => {
    const { getByRole, getByTestId } = renderWithVuetify(
      {
        ...basicApp,
        template: `
    <nav-menu :routes="routes">
      <template #prepend>
        <div data-testid="prepend-slot" />
      </template>
    </nav-menu>
    `,
      },
      {
        props: {
          routes: menuRoutes,
        },
        routes,
      }
    )

    await Vue.nextTick()

    expect(
      getByRole('menu', { hidden: true }).querySelector('div:first-child')
    ).toEqual(getByTestId('prepend-slot'))
  })

  test('the menu button should be empty if there is no active route', async () => {
    const { getByRole } = renderWithVuetify(
      NavMenu,
      {
        props: {
          routes: menuRoutes,
        },
        routes,
      },
      (vue, store, router) => {
        router.push('/path/3')
      }
    )
    await Vue.nextTick()
    getByRole('button', { name: '' })
  })

  test('the menu should not be displayed if there is no routes', async () => {
    const { container } = renderWithVuetify(
      NavMenu,
      {
        props: {
          routes: [],
        },
        routes,
      },
      (vue, store, router) => {
        router.push('/path/3')
      }
    )
    await Vue.nextTick()
    expect(container).toHaveTextContent('')
  })
})
