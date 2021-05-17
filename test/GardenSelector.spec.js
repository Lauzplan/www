import '@testing-library/jest-dom'
import GardenSelector from '@/components/default_layout/GardenSelector.vue'
import Vue from 'vue'
import Vuetify from 'vuetify'
import { renderWithVuetify } from './utils'

Vue.use(Vuetify)

const basicGardenList = [
  {
    id: '1',
    name: 'Garden 1',
  },
  {
    id: '2',
    name: 'Garden 2',
  },
]

const routes = [{ name: 'gardens-id', path: '/gardens/:id' }]

describe('GardenSelector', () => {
  test('the menu button should display the current garden name', async () => {
    const { getByRole } = renderWithVuetify(
      GardenSelector,
      {
        props: {
          gardens: basicGardenList,
        },
        routes,
      },
      (vue, store, router) => {
        router.push('/gardens/1')
      }
    )
    await Vue.nextTick()
    getByRole('button', { name: 'G1 Garden 1' })
  })

  test('the avatar should display the first letter of the name if in one word', async () => {
    const { getByTestId } = renderWithVuetify(
      GardenSelector,
      {
        props: {
          gardens: [{ name: 'garden', id: '1' }],
        },
        routes,
      },
      (vue, store, router) => {
        router.push('/gardens/1')
      }
    )
    await Vue.nextTick()
    expect(getByTestId('avatar')).toHaveTextContent('G')
  })

  test('the avatar should display the two first initials of the name if two or more words', async () => {
    const { getByTestId } = renderWithVuetify(
      GardenSelector,
      {
        props: {
          gardens: [{ name: 'lauzel farm 2', id: '1' }],
        },
        routes,
      },
      (vue, store, router) => {
        router.push('/gardens/1')
      }
    )
    await Vue.nextTick()
    expect(getByTestId('avatar')).toHaveTextContent('LF')
  })

  test('the menu items must be the garden name', async () => {
    const { getAllByRole } = renderWithVuetify(
      GardenSelector,
      {
        props: {
          gardens: basicGardenList,
        },
        routes,
      },
      (vue, store, router) => {
        router.push('/gardens/1')
      }
    )
    await Vue.nextTick()
    const items = getAllByRole('option', { hidden: true })
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Garden 1')
    expect(items[1]).toHaveTextContent('Garden 2')
  })

  test('the menu content should have a create button at the end', async () => {
    const { getByRole } = renderWithVuetify(
      GardenSelector,
      {
        props: {
          gardens: basicGardenList,
        },
        routes,
      },
      (vue, store, router) => {
        router.push('/gardens/1')
      }
    )
    await Vue.nextTick()
    const createButton = getByRole('button', { hidden: true, name: 'Créer' })
    expect(getByRole('menu', { hidden: true }).lastChild).toBe(createButton)
  })
})
