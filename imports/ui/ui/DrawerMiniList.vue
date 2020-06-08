<template>
  <div v-if="items && items.length" class="drawer-mini-list">
    <v-list two-line subheader dense>
      <v-subheader class="subheader">
        <div>
          <v-btn icon @click.native="expanded = !expanded">
            <v-icon>
              {{ isExpanded ? "mdi-chevron-up" : "mdi-chevron-down" }}
            </v-icon>
          </v-btn>
          <span v-if="header">
            {{ header }}
          </span>
        </div>
        <div v-if="numberOfPages && numberOfPages > 1">
          <v-btn :disabled="page === 1" icon small @click="prevPage">
            <v-icon small>
              mdi-chevron-left
            </v-icon>
          </v-btn>
          <span>
            {{ `${page}/${numberOfPages}` }}
          </span>
          <v-btn :disabled="page >= numberOfPages" icon small @click="nextPage">
            <v-icon small>
              mdi-chevron-right
            </v-icon>
          </v-btn>
        </div>
      </v-subheader>
      <template v-if="isExpanded">
        <v-data-iterator
          :items="items"
          :items-per-page.sync="itemsPerPage"
          :page="page"
          hide-default-footer
        >
          <template v-slot:default="props">
            <slot name="items" :items="props.items" />
          </template>
        </v-data-iterator>
      </template>
    </v-list>
  </div>
</template>

<script>
import UsersMixin from "/imports/ui/mixins/UsersMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import { colors } from "/imports/colors.js";

export default {
  name: "DrawerMiniList",
  mixins: [UsersMixin, DatesMixin],
  props: {
    items: {
      type: Array,
      default: () => []
    },
    itemsPerPage: {
      type: Number,
      default: 5
    },
    header: {
      type: String,
      default: null
    },
    selectedTask: {
      type: Object,
      default: null
    },
    isExpanded: {
      type: Boolean,
      default: true
    },
    selectedColor: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      page: 1
    };
  },
  computed: {
    numberOfPages() {
      if (!this.items || !this.items.length) return 0;
      return Math.ceil(this.items.length / this.itemsPerPage);
    },
    expanded: {
      get() {
        return this.isExpanded;
      },
      set(newExpanded) {
        return this.$emit("update:is-expanded", newExpanded);
      }
    },
    selectedTaskId() {
      return this.selectedTask?._id;
    },
    selectedStyles() {
      return {
        color: this.selectedColor,
        borderLeft: `solid 5px ${colors.adjust(this.selectedColor, -40)}`
      };
    }
  },
  methods: {
    selectItem(item) {
      this.$emit("select-item", item);
    },
    nextPage() {
      if (this.page + 1 <= this.numberOfPages) this.page += 1;
    },
    prevPage() {
      if (this.page - 1 >= 1) this.page -= 1;
    }
  }
};
</script>

<style lang="scss">
.drawer-mini-list {
  .v-subheader.subheader {
    display: flex;
    justify-content: space-between;
  }
  .empty-state {
    padding: 2rem;
  }
  .no-wrap {
    white-space: normal;
  }
}
</style>
