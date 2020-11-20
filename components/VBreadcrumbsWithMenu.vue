<template>
  <v-breadcrumbs v-bind="$attrs">
    <template v-slot:item="{ item }">
      <v-breadcrumbs-item
        v-if="item.first"
        class="expand-breadcrumb-item text-center"
      >
        <v-menu v-model="item.menu" offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              elevation="0"
              small
              text
              v-bind="attrs"
              color="primary"
              v-on="on"
            >
              {{ item.text }}
              <v-icon right> mdi-unfold-more-horizontal </v-icon>
            </v-btn>
          </template>
          <slot name="menu-content" />
        </v-menu>
      </v-breadcrumbs-item>
      <v-breadcrumbs-item v-else :href="item.href" :disabled="item.disabled">
        {{ item.text }}
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>

<script>
export default {
  data() {
    return {
      fav: true,
      message: false,
      hints: true,
    }
  },
}
</script>
