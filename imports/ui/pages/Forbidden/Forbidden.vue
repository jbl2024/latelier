<template>
  <div class="forbidden">
    <empty-state :description="$t('Access forbidden')" illustration="warning">
      <v-btn class="primary" @click="$router.go(-1)">
        {{ $t("Back") }}
      </v-btn>
    </empty-state>
  </div>
</template>

<script>
export default {
  name: "Forbidden"
};
</script>
<style scoped>
.forbidden {
  margin-top: 84px;
  text-align: center;
}
</style>
