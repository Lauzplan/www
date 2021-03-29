import { Map } from 'ol'
import { merge, of } from 'rxjs'
import { map, pluck, switchMap } from 'rxjs/operators'
import { fromOpenLayerEvent } from '~/utils/obesravble'

const fromCollection = function (functionDef, object) {
  return of(functionDef.call(object)).pipe(
    switchMap((controls) =>
      merge(
        of(controls),
        fromOpenLayerEvent(controls, 'change:length').pipe(pluck('target'))
      )
    ),
    map((controls) => controls.getArray())
  )
}

const CollectionAccessors = ['getControls', 'getInteractions', 'getLayers']

for (const accesor in CollectionAccessors) {
  Map.prototype[`${accesor}$`] = function () {
    return fromCollection(Map.prototype[accesor], this)
  }
}
