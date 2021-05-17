import { render } from '@testing-library/vue'
import VMap from '@/components/open_layer/VMap.vue'

describe('VMap', () => {
  test('should render the map viewport', () => {
    const { container } = render(VMap)
    expect(container).toMatchSnapshot()
  })

  test.skip('should provide a map instance', () => {
    const { container } = render(VMap, {
      slots: {
        default: {
          render() {
            return null
          },
          inject: ['getMapInstance'],
        },
      },
    })

    expect(container).toMatchSnapshot()
  })
})
