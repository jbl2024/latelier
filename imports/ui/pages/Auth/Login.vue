<template>
  <div class="login">
    <login-widget></login-widget>
  </div>
</template>

<script>
  export default {
    name: 'auth-login',
    mounted () {
      this.$store.dispatch('setHideDrawer', true);    
    },
    beforeDestroy () {
      this.$store.dispatch('setHideDrawer', false);    
    },
  }
</script>

<style scoped>
</style>