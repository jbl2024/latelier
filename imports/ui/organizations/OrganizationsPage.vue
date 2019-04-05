<template>
  <div class="organization-page">
    <organizations></organizations>
  </div>
</template>

<script>

export default {
  mounted() {
    this.$store.dispatch("setWindowTitle", this.$t("Organizations"));
  },
  data () {
    return {
    }
  },
  methods: {
  },
  meteor: {
  },
}
</script>

<style scoped>

</style>