<template>
  <div class="home">
    <login-widget></login-widget>
  </div>
</template>

<script>
export default {
  mounted () {
    this.$store.dispatch('setHideDrawer', true);    
  },
  beforeDestroy () {
    this.$store.dispatch('setHideDrawer', false);    
  },
  data () {
    return {
    }
  },
  methods: {
  }
}
</script>

<style scoped>

.login-widget {
  margin-top: 24px;
}

</style>