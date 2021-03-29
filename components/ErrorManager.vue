<template>
  <v-snackbar
    v-stream:input="input$"
    :value="snackbar"
    :timeout="timeout"
    color="error"
    top
  >
    {{ message }}
    <template v-slot:action="{ attrs }">
      <v-btn v-stream:click="close$" icon v-bind="attrs">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { merge, NEVER, of } from 'rxjs'
import {
  concatMap,
  delay,
  filter,
  mapTo,
  pluck,
  takeUntil,
} from 'rxjs/operators'
export default {
  name: 'ErrorManager',
  props: {
    error: {
      type: String,
      default: () => null,
    },
  },
  data() {
    return {
      timeout: 2000,
    }
  },
  watch: {
    async error() {
      await this.$nextTick()
      this.$emit('update:error', '')
    },
  },
  domStreams: ['close$', 'input$'],
  subscriptions() {
    const snackbarClose$ = merge(
      this.close$.pipe(mapTo(false)),
      this.input$.pipe(
        pluck('event.msg'),
        filter((data) => !data)
      )
    )
    const message$ = this.$watchAsObservable('error').pipe(
      pluck('newValue'),
      filter((msg) => msg),
      concatMap((msg) =>
        merge(of(msg), NEVER.pipe(takeUntil(snackbarClose$.pipe(delay(500)))))
      )
    )

    const snackbar$ = merge(message$.pipe(mapTo(true)), snackbarClose$)

    return {
      message: message$,
      snackbar: snackbar$,
    }
  },
}
</script>

<style></style>
