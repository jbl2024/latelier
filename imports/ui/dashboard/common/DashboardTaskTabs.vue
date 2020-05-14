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
    <v-tabs v-if="currentCategory === 'task'" v-model="taskTab">
      <v-tab>{{ $t("Recents") }}</v-tab>
      <v-tab>{{ $t("My tasks") }}</v-tab>
      <v-tab>{{ $t("Late") }}</v-tab>
      <v-tab-item :transition="false" :reverse-transition="false">
        <dashboard-task-list
          :user="user"
          type="recent"
          :organization-id="organizationId"
          :project-id="projectId"
          :key="key('recent')"
        />
      </v-tab-item>
      <v-tab-item :transition="false" :reverse-transition="false">
        <dashboard-task-list
          :user="user"
          type="assignedToMe"
          :organization-id="organizationId"
          :project-id="projectId"
          :key="key('assignedToMe')"
        />
      </v-tab-item>
      <v-tab-item :transition="false" :reverse-transition="false">
        <dashboard-task-list
          :user="user"
          type="late"
          empty-illustration="celebration"
          :organization-id="organizationId"
          :key="key('late')"
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
        if (this.projectId) return type + '-' + this.projectId;
        if (this.organizationId) return type + '-' + this.organizationId;
        return type;
      }
    }
  },
  methods: {
    cssCategoryClasses(category) {
      return ["category-title", this.currentCategory === category ? "selected" : null];
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
