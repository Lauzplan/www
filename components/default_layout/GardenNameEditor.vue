<template>
  <v-tooltip bottom open-delay="100">
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="innerName"
        v-bind="attrs"
        hide-details
        :loading="isSaving"
        v-on="on"
        @keydown.enter="saveName"
        @blur="saveName"
      ></v-text-field>
    </template>
    <span>Renommer</span>
  </v-tooltip>
</template>

<script>
import updateGarden from '@/graphql/updateGarden.gql'
export default {
  name: 'GardenNameEditor',
  props: {
    garden: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      innerName: null,
      isSaving: false,
    }
  },
  watch: {
    garden: {
      handler(newVal) {
        this.innerName = newVal.name
      },
      immediate: true,
    },
  },
  methods: {
    saveName() {
      this.isSaving = true
      this.$apollo
        .mutate({
          mutation: updateGarden,
          variables: {
            id: this.garden.id,
            gardenName: this.innerName,
          },
        })
        .catch(() => {
          this.innerName = this.garden.name
          this.$emit('error', 'Impossible de sauver le nom')
        })
        .finally(() => {
          this.isSaving = false
        })
    },
  },
}
</script>

<style></style>
