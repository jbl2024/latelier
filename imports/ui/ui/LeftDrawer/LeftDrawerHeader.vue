<template>
  <div
    v-scroll:[scrollTarget]="onScroll"
    :class="[
      'left-drawer-header',
      mini ? 'mini' : null,
      shouldStick ? 'sticky' : null,
    ]"
  >
    <div class="categories">
      <div
        v-for="category in categories"
        :key="category.id"
        :class="cssCategoryClasses(category.id)"
        @click="$emit('change-category', category.id)"
      >
        <v-icon>
          {{ category.icon }}
        </v-icon>
      </div>
    </div>
    <v-btn
      v-show="!mini"
      class="collapse"
      color="primary"
      icon
      @click="$emit('toggle-collapse')"
    >
      <v-icon>
        mdi-chevron-left
      </v-icon>
    </v-btn>
  </div>
</template>
<script>
export default {
  props: {
    currentCategory: {
      type: String,
      default: "tasks"
    },
    mini: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      scrollTarget: "#left-drawer > .v-navigation-drawer__content",
      shouldStick: false
    };
  },
  computed: {
    categories() {
      return Object.freeze(
        [
          {
            id: "tasks",
            text: this.$t("Tasks"),
            icon: "mdi-format-list-bulleted"
          },
          {
            id: "meetings",
            text: this.$t("meetings.meetings"),
            icon: "mdi-calendar-star"
          },
          this.currentProjectId
            ? { id: "history", text: this.$t("History"), icon: "mdi-history" }
            : null
        ].filter((category) => category)
      );
    }
  },
  methods: {
    cssCategoryClasses(category) {
      return [
        "category-title",
        this.currentCategory === category ? "selected" : null
      ];
    },
    onScroll(event) {
      this.shouldStick = event && event.target.scrollTop > 48;
    }
  }
};
</script>
<style lang="scss">
.left-drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px;
  &.mini {
    display: block;
    .categories {
      flex-direction: column;
    }
  }
  .categories {
    background-color: white;
    display: flex;
    flex-direction: row;
    .category-title {
      text-align: center;
      cursor: pointer;
      margin: 8px;
      flex: 0;
      &.selected,
      &.selected .v-icon,
      :hover {
        font-weight: bold;
        color: black;
      }
    }
  }
}
</style>
