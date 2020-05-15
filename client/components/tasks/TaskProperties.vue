<template>
  <div class="task-properties">
    <select-user
      :project="project"
      :active.sync="showChooseWatcherDialog"
      :is-admin="canManageProject(task)"
      @select="onChooseWatcher"
    />
    <select-user
      :project="project"
      :active.sync="showChooseAssignedToDialog"
      :is-admin="canManageProject(task)"
      @select="onChooseAssignedTo"
    />
    <select-date
      v-model="showSelectDueDate"
      reminder
      @select="onSelectDueDate"
    />
    <select-date
      v-model="showSelectStartDate"
      reminder
      @select="onSelectStartDate"
    />
    <v-subheader>{{ $t("Properties") }} </v-subheader>
    <div v-if="showProjectLink(taskObject)" class="project-link">
      <router-link
        :to="{
          name: 'project-task',
          params: {
            projectId: taskObject.project._id,
            taskId: taskObject._id
          }
        }"
      >
        [{{ taskObject.project.name }}]
      </router-link>
    </div>
    <author-line
      v-if="showCreatedBy(task)"
      :user-id="task.createdBy"
      :date="task.createdAt"
      class="author"
      :prefix="$t('Created by')"
    />
    <author-line
      v-if="showUpdatedBy(task)"
      :user-id="task.updatedBy"
      :date="task.updatedAt"
      class="author"
      :prefix="$t('Last update by')"
    />
    <v-layout row>
      <v-flex>
        <div v-if="task.completedAt" class="completed-date">
          {{ $t("Completed on") }}
          {{ formatDate(task.completedAt) }}
        </div>
      </v-flex>
    </v-layout>
    <v-subheader>{{ $t("Dates") }} </v-subheader>
    <v-list two-line class="elevation-1">
      <v-list-item @click="showSelectStartDate = true">
        <v-list-item-avatar>
          <v-icon>mdi-calendar-today</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ $t("Start date") }}</v-list-item-title>
          <v-list-item-subtitle>
            <span v-show="task.startDate">{{
              formatDate(task.startDate)
            }}</span>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action
          v-if="
            task.reminderStartDate !== 'never' && task.reminderStartDate != null
          "
        >
          <v-icon>mdi-alarm-check</v-icon>
        </v-list-item-action>
        <v-list-item-action>
          <v-btn text icon @click.stop="onSelectStartDate(null)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>

      <v-divider />

      <v-list-item @click="showSelectDueDate = true">
        <v-list-item-avatar>
          <v-icon>mdi-alarm</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ $t("End date") }}</v-list-item-title>
          <v-list-item-subtitle>
            <span v-show="task.dueDate">{{ formatDate(task.dueDate) }}</span>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action
          v-if="
            task.reminderDueDate !== 'never' && task.reminderDueDate != null
          "
        >
          <v-icon>mdi-alarm-check</v-icon>
        </v-list-item-action>
        <v-list-item-action>
          <v-btn text icon @click.stop="onSelectDueDate(null)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>

    <v-subheader>
      {{ $t("Duties") }}
      <v-btn color="grey lighten-1" text icon @click="addMeAsAssignedTo">
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
    </v-subheader>
    <v-list class="elevation-1">
      <v-list-item @click="showChooseAssignedToDialog = true">
        <v-list-item-avatar :color="isOnline(task.assignedTo)">
          <author-avatar :user-id="task.assignedTo" />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            <span>{{ formatUser(task.assignedTo) }}</span>
            <span v-show="!task.assignedTo">{{ $t("Unassigned") }}</span>
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn icon text @click.stop="removeAssignedTo">
            <v-icon color="grey">
              mdi-delete
            </v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>

    <v-subheader>
      {{ $t("Watchers") }}
      <v-btn color="grey lighten-1" text icon @click="addMeAsWatcher">
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
    </v-subheader>
    <v-list class="elevation-1">
      <v-list-item v-for="watcher in task.watchers" :key="watcher">
        <v-list-item-avatar :color="isOnline(watcher)">
          <author-avatar :user-id="watcher" />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            <span>{{ formatUser(watcher) }}</span>
            <span v-show="!watcher">{{ $t("Unassigned") }}</span>
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn icon text @click.stop="removeWatcher(watcher)">
            <v-icon color="grey">
              mdi-delete
            </v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>

      <v-list-item @click="showChooseWatcherDialog = true">
        <v-list-item-avatar>
          <v-icon>mdi-plus</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t("Add") }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <template v-if="isEstimationEnabled">
      <v-subheader>{{ $t("Estimations") }}</v-subheader>
      <task-estimations-in-detail :task="task" />
    </template>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { Projects } from "/imports/api/projects/projects.js";
import { Permissions } from "/imports/api/permissions/permissions";
import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import moment from "moment";
import "moment/locale/fr";

export default {
  mixins: [usersMixin],
  props: {
    task: {
      type: Object,
      default: () => {}
    },
    taskObject: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showChooseAssignedToDialog: false,
      showChooseWatcherDialog: false,
      showSelectDueDate: false,
      showSelectStartDate: false,
      isEstimationEnabled: false
    };
  },
  computed: {
    ...mapState("project", ["currentProjectId"]),
    ...mapGetters("project", ["hasProjectFeature"]),
    project() {
      if (!this.task) return null;
      return Projects.findOne({ _id: this.task.projectId });
    }
  },
  watch: {
    task(task) {
      if (task) {
        this.loadEstimationFeature(task);
      }
    }
  },
  methods: {
    showProjectLink(task) {
      return task && task.project;
    },
    showUpdatedBy(task) {
      return task.updatedAt && task.updatedBy;
    },
    showCreatedBy(task) {
      if (!task.updatedBy) {
        return true;
      }
      if (task.createdBy === task.updatedBy) {
        const dif = task.updatedAt.getTime() - task.createdAt.getTime();
        const seconds = Math.abs(dif / 1000);
        if (seconds > 60) {
          return true;
        }
        return false;
      }
      return true;
    },
    onChooseWatcher(user) {
      Meteor.call("tasks.addWatcher", this.task._id, user._id);
    },

    addMeAsWatcher() {
      Meteor.call("tasks.addWatcher", this.task._id, Meteor.userId());
    },

    removeWatcher(watcher) {
      Meteor.call("tasks.removeWatcher", this.task._id, watcher);
    },

    onChooseAssignedTo(user) {
      Meteor.call("tasks.assignTo", this.task._id, user._id);
    },

    addMeAsAssignedTo() {
      Meteor.call("tasks.assignTo", this.task._id, Meteor.userId());
    },

    removeAssignedTo() {
      if (this.task.assignedTo) {
        Meteor.call("tasks.removeAssignedTo", this.task._id);
      }
    },

    onSelectDueDate(date, reminder) {
      Meteor.call("tasks.setDueDate", this.task._id, date, reminder);
    },

    onSelectStartDate(date, reminder) {
      Meteor.call("tasks.setStartDate", this.task._id, date, reminder);
    },

    formatDate(date) {
      return moment(date).format("DD/MM/YYYY HH:mm");
    },

    canManageProject(task) {
      return (
        Permissions.isAdmin(Meteor.userId(), task.projectId)
        || Permissions.isAdmin(Meteor.userId())
      );
    },

    loadEstimationFeature(task) {
      if (!task.projectId) return;
      if (task.projectId === this.currentProjectId) {
        this.isEstimationEnabled = this.hasProjectFeature("estimation");
        return;
      }

      Meteor.call(
        "projects.hasFeature",
        { projectId: task.projectId, feature: "estimation" },
        (error, result) => {
          this.isEstimationEnabled = result;
        }
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.task-properties {
  margin: 12px;
  .v-subheader {
    font-size: 1rem;
    margin-top: 1rem;
    padding: 0;
  }
}

.cursor {
  cursor: pointer;
}
</style>
