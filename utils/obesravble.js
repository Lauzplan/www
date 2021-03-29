import { fromEventPattern } from 'rxjs'

export function fromOpenLayerEvent(target, event) {
  return fromEventPattern(
    (h) => target.on(event, h),
    (h) => target.un(event, h)
  )
}
