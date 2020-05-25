<template>
  <div class="tasks">
    <div class="categories">
      <div
        v-for="category in categories"
        :key="category.id"
        :class="cssCategoryClasses(category.id)"
        @click="currentCategory = category.id"
      >
        {{ category.text }}
      </div>
    </div>
    <v-divider />
    <!-- Taches -->
    <v-tabs
      v-if="currentCategory === 'task'"
      v-model="taskTab"
      v-scroll:[scrollTarget]="onScroll"
      :class="tabsShouldStick ? 'sticky-tabs' : null"
    >
      <v-tabs-slider color="accent" />
      <v-tab>{{ $t("Recents") }}</v-tab>
      <v-tab>{{ $t("My tasks") }}</v-tab>
      <v-tab>{{ $t("Late") }}</v-tab>
      <v-tab-item :transition="false" :reverse-transition="false">
        <dashboard-task-list
          :key="key('recent')"
          type="recent"
          :organization-id="organizationId"
          :project-id="projectId"
        />
      </v-tab-item>
      <v-tab-item :transition="false" :reverse-transition="false">
        <dashboard-task-list
          :key="key('assignedToMe')"
          type="assignedToMe"
          :organization-id="organizationId"
          :project-id="projectId"
        />
      </v-tab-item>
      <v-tab-item :transition="false" :reverse-transition="false">
        <dashboard-task-list
          :key="key('late')"
          type="late"
          empty-illustration="celebration"
          :organization-id="organizationId"
        />
      </v-tab-item>
    </v-tabs>
    <!-- Historique et activité -->
    <div v-show="currentCategory === 'history'">
      <project-history v-if="projectId" :key="projectId" :project-id="projectId" />
    </div>
  </div>
</template>
<script>
import DashboardTaskList from "/imports/ui/dashboard/common/DashboardTaskList";

export default {
  components: {
    DashboardTaskList
  },
  props: {
    user: {
      type: Object,
      default: null
    },
    organizationId: {
      type: String,
      default: null
    },
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      currentCategory: "task",
      scrollTarget: "#left-drawer > .v-navigation-drawer__content",
      tabsShouldStick: false,
      taskTab: null
    };
  },
  computed: {
    categories() {
      const categories = [{ id: "task", text: this.$t("Tasks") }];
      if (this.projectId) {
        categories.push({ id: "history", text: this.$t("History") });
      }
      return Object.freeze(categories);
    },
    key() {
      return function(type) {
        return [this.projectId, this.organizationId, type].filter((part) => part).join("-");
      };
    }
  },
  methods: {
    cssCategoryClasses(category) {
      return ["category-title", this.currentCategory === category ? "selected" : null];
    },
    onScroll(event) {
      this.tabsShouldStick = event && event.target.scrollTop > 48;
    }
  }
};
</script>
<style lang="scss" scoped>

.categories {
  display: flex;

  .category-title {
    cursor: pointer;
    margin: 15.5px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    flex: 0;
    &.selected,
    :hover {
      font-weight: bold;
    }
  }

}
</style>
