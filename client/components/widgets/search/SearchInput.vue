<template>
  <v-menu
    v-if="value"
    v-model="showMenu"
    class="search-input-menu"
    :nudge-bottom="10"
    offset-y
    :close-on-content-click="false"
    @click-outside="onClickOutside"
  >
    <template v-slot:activator="{ on }">
      <div class="search-input radius">
        <v-text-field
          ref="input"
          v-model="text"
          solo
          :light="!isContentDark"
          :dark="isContentDark"
          hide-details
          prepend-inner-icon="mdi-magnify"
          :label="$t('Search') + '...'"
          class="align-remaining"
          v-on="on"
          @focus="onFocus"
          @input="debouncedFilter"
          @keyup.esc="isEnabled = false"
          @keyup.enter="showMenu = true"
        >
          <template slot="append">
            <v-btn
              icon
              text
              small
              @click.stop="clearOrClose"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </div>
    </template>
    <search-results
      :filter="filter"
      :active.sync="showMenu"
      :width="width"
    />
  </v-menu>
</template>

<script>
import debounce from "lodash/debounce";
import vClickOutside from "v-click-outside";
import { mapGetters } from "vuex";

export default {
  directives: {
    clickOutside: vClickOutside.directive
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      text: "",
      debouncedFilter: "",
      filter: "",
      showMenu: false,
      width: 0
    };
  },
  computed: {
    ...mapGetters("ui", [
      "isNavigationColorDark",
      "isContentDark"
    ]),
    isEnabled: {
      get() {
        return this.value;
      },
      set(newValue) {
        this.$emit("input", newValue);
      }
    }
  },
  watch: {
    filter() {
      this.showMenu = this.filter && this.filter.length > 0;
      this.trackSearch(this.filter);
    },
    showMenu(showMenu) {
      if (showMenu) {
        this.width = this.$refs.input.$el.offsetWidth;
      }
    },
    isEnabled() {
      if (this.value !== true) return;
      setTimeout(() => {
        this.$refs.input.focus();
      });
    }
  },
  created() {
    this.debouncedFilter = debounce((val) => {
      this.filter = val;
    }, 400);
  },
  methods: {
    trackSearch(keyword) {
      if (this.$matomo) {
        this.$matomo.trackSiteSearch(keyword);
      }
    },
    onFocus() {
      if (this.filter && this.filter.length > 0) {
        setTimeout(() => {
          this.showMenu = true;
        }, 500);
      }
    },
    onClickOutside(event) {
      if (event.target.closest(".prevent-search-blur") !== null) {
        return false;
      }
      this.$emit("blur");
      this.showMenu = false;
      return true;
    },
    clearOrClose() {
      if (this.text && this.text.length > 0) {
        this.text = "";
      } else if (!this.text || !this.text.length) {
        this.isEnabled = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>

.v-menu__content {
  border-radius: 10px;
}
.search-input {
  width: 100%;
  display: flex;
  letter-spacing: normal;
  text-align: left;
  &.radius {
    border-radius: 40px;
    overflow: hidden;
    mask-image: -webkit-radial-gradient(white, black);
    -webkit-mask-image: -webkit-radial-gradient(white, black);
  }
}
.search-results {
  box-shadow: 0px 8px 8px rgba(0, 0, 0, 0.25);
}

</style>
