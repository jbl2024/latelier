<template>
  <div class="dashboard-title">
    <v-text-field
      v-model="savedValue"
      text
      solo-inverted
      hide-details
      clearable
      prepend-inner-icon="search"
      :label="$t('Search') + '...'"
      class="hidden-sm-and-down align-remaining"
      v-on:input="debouncedFilter"
    ></v-text-field>
  </div>
</template>

<script>
import debounce from "lodash/debounce";

export default {
  created() {
    this.debouncedFilter = debounce(val => {
      this.$store.dispatch("setDashboardFilter", val);
    }, 400);
  },
  beforeDestroy() {
    this.$store.dispatch("setDashboardFilter", "");
  },
  data() {
    return {
      savedValue: "",
      debouncedFilter: "",
    }
  },
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