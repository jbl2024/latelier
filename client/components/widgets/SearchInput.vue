<template>
  <v-menu v-model="showMenu" offset-y :close-on-content-click="false">
    <template v-slot:activator="{ showMenu }">
      <v-text-field
        solo-inverted
        color="primary"
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
  created() {
    this.debouncedFilter = debounce((val) => {
      this.filter = val;
      if (this.filter.length > 0) {
        this.showMenu = true;
      } else {
        this.showMenu = false;
      }
    }, 400);
  },
  methods: {
    onFocus(e) {
      if (this.filter.length > 0) {
        this.showMenu = true;
      }
      /* eslint no-console: off */
      console.log({
        event: "onFocus",
        e: e,
        showMenu: this.showMenu
      });
    }
  }
};
</script>

<style scoped>
.v-menu__content {
  margin-top: 4px;
}
</style>
