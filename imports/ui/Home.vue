<template>
  <div class="home">
      {{ $t("message.hello") }}
    <login-widget></login-widget>
  </div>
</template>

<script>
export default {
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