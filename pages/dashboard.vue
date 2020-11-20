<template>
  <div>coucou</div>
</template>
<script>
export default {
  data: () => ({
    items: [
      {
        text: 'Dashboard',
        disabled: false,
        href: 'breadcrumbs_dashboard',
        first: true,
      },
      {
        text: 'Dashboard',
        disabled: false,
        href: 'breadcrumbs_dashboard',
      },
      {
        text: 'Dashboard',
        disabled: false,
        href: 'breadcrumbs_dashboard',
      },
      {
        text: 'Link 1',
        disabled: false,
        href: 'breadcrumbs_link_1',
        first: true,
      },
      {
        text: 'Link 2',
        disabled: true,
        href: 'breadcrumbs_link_2',
        first: true,
      },
    ],
  }),
}
</script>
<style scoped>
.v-breadcrumbs >>> li.expand-breadcrumb-item {
  margin: 0 -12px;
}
.v-breadcrumbs >>> li:first-of-type {
  margin-left: 0;
}
.v-breadcrumbs >>> li:last-of-type {
  margin-right: 0;
}
</style>
