<template>
  <v-menu
    v-model="showMenu"
    offset-y
    :close-on-content-click="false"
    :close-on-click="false"
    max-width="527px"
  >
    <template v-slot:activator="{ showMenu }">
      <v-text-field
        solo-inverted
        color="primary"
        clearable
        hide-details
        prepend-inner-icon="mdi-magnify"
        :label="$t('Search') + '...'"
        class="hidden-sm-and-down align-remaining"
        @focus="onFocus"
        @input="debouncedFilter"
      />
    </template>
    <search-results :filter="filter" :active.sync="showMenu" />
  </v-menu>
</template>

<script>
import debounce from "lodash/debounce";

export default {
  data() {
    return {
      debouncedFilter: "",
      filter: "",
      showMenu: false
    };
  },
  watch: {
    filter() {
      this.showMenu = this.filter && this.filter.length > 0;
    }
  },
  created() {
    this.debouncedFilter = debounce((val) => {
      this.filter = val;
    }, 400);
  },
  methods: {
    onFocus() {
      if (this.filter && this.filter.length > 0) {
        setTimeout(() => {
          this.showMenu = true;
        }, 500);
      }
    }
  }
};
</script>

<style scoped>
.v-menu__content {
  margin-top: 4px;
}
</style>
