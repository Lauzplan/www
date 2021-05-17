import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import AutoGrowInput from '@/components/inputs/AutoGrowInput.vue'

describe('AutoGrowInput', () => {
  test('should display an empty input', () => {
    const { getByRole } = render(AutoGrowInput)
    getByRole('input', { name: '' })
  })

  test('should display the given value', async () => {
    const { getByRole, updateProps } = render(AutoGrowInput, {
      propsData: { value: 'hello world' },
    })
    expect(getByRole('input')).toHaveTextContent('hello world')
    await updateProps({ value: 'foo' })
    expect(getByRole('input')).toHaveTextContent('foo')
  })

  test('should remove new line chars', () => {
    const { getByRole } = render(AutoGrowInput, {
      propsData: { value: 'hello\nworld' },
    })
    expect(getByRole('input')).toHaveTextContent('helloworld')
  })

  test('should show what is typed', () => {
    const { getByRole } = render(AutoGrowInput, {
      propsData: { value: 'hello world' },
    })
    const input = getByRole('input')
    expect(input).toHaveTextContent('hello world')
    userEvent.type(input, 'foo')

    expect(input).toHaveTextContent('foo')
  })

  test('should only allow single lines to be typed', () => {
    const { getByRole } = render(AutoGrowInput)
    const input = getByRole('input')
    userEvent.type(input, 'foo{enter}bar')
    expect(input).toHaveTextContent('foo')
  })

  test('should emit an input event after each keypress', () => {
    const { getByRole, emitted } = render(AutoGrowInput)
    const input = getByRole('input')
    userEvent.type(input, 'foo')
    const { input: inputEvents } = emitted()
    expect(inputEvents).toHaveLength(3)
    expect(inputEvents[0]).toEqual(['f'])
    expect(inputEvents[1]).toEqual(['fo'])
    expect(inputEvents[2]).toEqual(['foo'])
  })

  test('should emit a validate  event when enter is pressed', () => {
    const { getByRole, emitted } = render(AutoGrowInput)
    const input = getByRole('input')
    userEvent.type(input, 'foo{enter}bar')
    const { validate } = emitted()
    expect(validate).toHaveLength(1)
    expect(validate[0]).toEqual(['foo'])
  })

  test.skip('should adapt the width of the input to the text inside', async () => {})
})
