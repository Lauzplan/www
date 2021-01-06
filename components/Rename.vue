<template>
  <div>
    <v-menu v-model="menu" offset-y>
      <template #activator="{ attrs, on }">
        <slot
          :attrs="attrs"
          :on="{
            ...on,
            click() {},
            contextmenu: ($event) => {
              $event.preventDefault()
              on.click($event)
            },
          }"
        >
        </slot>
      </template>
      <template>
        <v-list dense>
          <v-list-item @click="rename">
            <v-list-item-content>Renommer</v-list-item-content>
          </v-list-item>
        </v-list>
      </template>
    </v-menu>
    <v-menu
      v-model="renameMenu"
      :close-on-content-click="false"
      :position-x="x"
      :position-y="y"
      absolute
    >
      <template>
        <v-card>
          <v-card-text>
            <v-text-field v-model="innerValue">
              <template #append>
                <v-btn icon @click.stop="cancel">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-btn icon @click.stop="validate">
                  <v-icon>mdi-check</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </v-card-text>
        </v-card>
      </template>
    </v-menu>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  data(vm) {
    return {
      menu: false,
      renameMenu: false,
      innerValue: vm.value,
      initialValue: vm.value,
      x: 0,
      y: 0,
    }
  },
  watch: {
    value(val) {
      this.innerValue = val
      this.initialValue = val
    },
  },
  methods: {
    rename(e) {
      this.innerValue = this.initialValue

      this.x = e.clientX
      this.y = e.clientY

      this.renameMenu = true
    },
    validate() {
      this.$emit('input', this.innerValue)
      this.renameMenu = false
    },
    cancel() {
      this.renameMenu = false
    },
  },
}
</script>

<style></style>
