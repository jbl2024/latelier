<template>
  <div v-click-outside="onClickOutside" class="search-input">
    <v-text-field
      ref="input"
      solo-inverted
      color="primary"
      clearable
      hide-details
      prepend-inner-icon="mdi-magnify"
      :label="$t('Search') + '...'"
      class="hidden-sm-and-down align-remaining"
      @focus="onFocus"
      @input="debouncedFilter"
      @keyup.esc="showMenu = false"
      @keyup.enter="showMenu = true"
    />
    <search-results
      v-if="showMenu"
      :filter="filter"
      :active.sync="showMenu"
      :width="width"
    />
  </div>
</template>

<script>
import debounce from "lodash/debounce";
import vClickOutside from "v-click-outside";

export default {
  directives: {
    clickOutside: vClickOutside.directive
  },
  data() {
    return {
      debouncedFilter: "",
      filter: "",
      showMenu: false,
      width: 0
    };
  },
  watch: {
    filter() {
      this.showMenu = this.filter && this.filter.length > 0;
    },
    showMenu(showMenu) {
      if (showMenu) {
        this.width = this.$refs.input.$el.offsetWidth;
      }
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
    },
    onClickOutside() {
      this.showMenu = false;
    }
  }
};
</script>

<style scoped>
.search-input {
  align-items: flex-start;
  display: flex;
  flex: 1 1 auto;
  font-size: 16px;
  letter-spacing: normal;
  max-width: 100%;
  text-align: left;
}
.search-results {
  position: absolute;
  top: 58px;
  width: 500px;
  overflow-y: auto;
  max-height: calc(100vh - 58px);
  box-shadow: 0px 8px 8px rgba(0, 0, 0, 0.25);
}

</style>
