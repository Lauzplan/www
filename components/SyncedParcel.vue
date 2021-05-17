<script>
import { filter, pluck, switchMap } from 'rxjs/operators'
import { from, merge, of } from 'rxjs'
import { Modify } from 'ol/interaction'
import { fromOpenLayerEvent } from '~/utils/obesravble'
import {
  deleteParcel,
  parcelsFromGardenId,
  createParcel,
  updateParcel,
} from '~/graphql/parcel.gql'
export default {
  name: 'SyncedParcel',
  props: {
    sync: {
      type: Boolean,
    },
    feature: {
      type: Object,
      required: true,
    },
    parcels: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  inject: ['getSourceInstance', 'getMapInstance'],
  data() {
    return {
      savedGeometry: null,
    }
  },
  computed: {
    sourceFormat() {
      return this.getSourceInstance().getFormat()
    },
    gardenId() {
      return this.$route.params.id
    },
    parcel() {
      return this.parcels.find((p) => p.id === this.feature.getId())
    },
    geometry() {
      return this.feature.getGeometry()
    },
  },
  mounted() {
    const interactions = this.getMapInstance().getInteractions()

    const drawInteraction$ = merge(
      fromOpenLayerEvent(interactions, 'change:length').pipe(pluck('target')),
      of(interactions)
    ).pipe(
      switchMap((interactions) => from(interactions.getArray())),
      filter((i) => i instanceof Modify)
    )
    const modifyend$ = drawInteraction$.pipe(
      switchMap((i) => fromOpenLayerEvent(i, 'modifyend'))
    )

    this.savedGeometry = this.feature.getGeometry().clone()

    this.$subscribeTo(modifyend$, () => {
      const format = this.sourceFormat
      this.$apollo
        .mutate({
          mutation: updateParcel,
          variables: {
            geometry: format.writeGeometryObject(this.feature.getGeometry()),
            id: this.feature.getId(),
          },
        })
        .then((_) => {
          this.savedGeometry = this.feature.getGeometry().clone()
        })
        .catch((error) => {
          const geometry = this.savedGeometry.clone()
          this.feature.setGeometry(geometry)
          this.feature.changed()
          this.$emit('error', { origin: 'updateParcel', error })
        })
    })

    if (this.sync) {
      const name = this.parcel?.name || `Parcel ${this.parcels.length + 1}`
      const format = this.sourceFormat
      const gardenId = this.gardenId
      const feature = this.feature

      this.$apollo
        .mutate({
          mutation: createParcel,
          variables: {
            name,
            geometry: format.writeGeometryObject(this.feature.getGeometry()),
            gardenId,
          },
          update(store, { data: { createParcel } }) {
            const query = parcelsFromGardenId
            const data = store.readQuery({
              query,
              variables: { id: gardenId },
            })
            feature.setId(createParcel.id)
            data.garden.parcels.push(createParcel)
            store.writeQuery({ query, data })
          },
        })
        .catch((error) => {
          this.getSourceInstance().removeFeature(this.feature)
          this.$emit('error', { origin: 'createParcel', error })
        })
    }
  },

  beforeDestroy() {
    if (this.sync) {
      const feature = this.feature
      const gardenId = this.gardenId

      this.$apollo.mutate({
        mutation: deleteParcel,
        variables: {
          id: feature.getId(),
        },
        update(store, { data: { deleteParcel } }) {
          if (deleteParcel.ok === true) {
            const query = parcelsFromGardenId
            const data = store.readQuery({
              query,
              variables: { id: gardenId },
            })
            data.garden.parcels = data.garden.parcels.filter(
              (p) => p.id !== feature.getId()
            )
            store.writeQuery({ query, data })
          }
        },
      })
    }
  },
  render() {
    return null
  },
}
</script>

<style></style>
