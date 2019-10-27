<template>
  <div class="dashboard-title">
    <v-text-field
      v-model="savedValue"
      text
      solo-inverted
      color="primary"
      hide-details
      clearable
      prepend-inner-icon="mdi-magnify"
      :label="$t('Search') + '...'"
      class="hidden-sm-and-down align-remaining"
      @input="debouncedFilter"
    />
  </div>
</template>

<script>
import debounce from "lodash/debounce";

export default {
  data() {
    return {
      savedValue: "",
      debouncedFilter: ""
    };
  },
  created() {
    this.debouncedFilter = debounce((val) => {
      this.$store.dispatch("setDashboardFilter", val);
    }, 400);
  },
  beforeDestroy() {
    this.$store.dispatch("setDashboardFilter", "");
  }
};
</script>

<style scoped>
.dashboard-title {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex: 1;
}
</style>
