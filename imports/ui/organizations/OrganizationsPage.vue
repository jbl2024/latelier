<template>
  <div class="organization-page">
    <organizations />
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  mounted() {
    this.$store.dispatch("setWindowTitle", this.$t("Organizations"));
  },
  methods: {},
  meteor: {}
};
</script>

<style scoped>
</style>
