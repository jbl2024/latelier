<template>

<div class="task-properties">

  <select-user @select="onChooseWatcher" :project="project" :active.sync="showChooseWatcherDialog" :is-admin="canManageProject(task)"></select-user>
  <select-user @select="onChooseAssignedTo" :project="project" :active.sync="showChooseAssignedToDialog" :is-admin="canManageProject(task)"></select-user>
  <select-date @select="onSelectDueDate" reminder :active.sync="showSelectDueDate"></select-date>
  <select-date @select="onSelectStartDate" reminder :active.sync="showSelectStartDate"></select-date>
  
  <v-subheader>{{ $t('Dates') }} </v-subheader>
  <v-list two-line class="elevation-1">
      <v-list-item @click="showSelectStartDate = true">
        <v-list-item-avatar>
          <v-icon>calendar_today</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ $t('Start date') }}</v-list-item-title>
          <v-list-item-subtitle>
            <span v-show="task.startDate">{{ formatDate(task.startDate) }}</span>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action v-if="task.reminderStartDate">
          <v-icon>alarm_on</v-icon>
        </v-list-item-action>
        <v-list-item-action>
          <v-btn text icon @click.stop="onSelectStartDate(null)">
            <v-icon>delete</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item @click="showSelectDueDate = true">
        <v-list-item-avatar>
          <v-icon>alarm</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ $t('End date') }}</v-list-item-title>
          <v-list-item-subtitle>
            <span v-show="task.dueDate">{{ formatDate(task.dueDate) }}</span>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action v-if="task.reminderDueDate">
          <v-icon>alarm_on</v-icon>
        </v-list-item-action>
        <v-list-item-action>
          <v-btn text icon @click.stop="onSelectDueDate(null)">
            <v-icon>delete</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
  </v-list>

  <v-subheader>{{ $t('Duties') }}
    <v-btn color="grey lighten-1" text icon @click="addMeAsAssignedTo">
      <v-icon>account_circle</v-icon>
    </v-btn>
  </v-subheader>
  <v-list class="elevation-1">
    <v-list-item @click="showChooseAssignedToDialog = true">
      <v-list-item-avatar :color="isOnline(task.assignedTo)">
        <span class="">{{ formatUserLetters(task.assignedTo) }}</span>
      </v-list-item-avatar>
      <v-list-item-content>
      <v-list-item-title>
        <span>{{ formatUser(task.assignedTo) }}</span>
        <span v-show="!task.assignedTo">{{ $t('Unassigned')}}</span>
      </v-list-item-title>
      </v-list-item-content>
      <v-list-item-action>
        <v-btn icon text @click.stop="removeAssignedTo">
          <v-icon color="grey">delete</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
  </v-list>

  <v-subheader>{{ $t('Watchers') }}
    <v-btn color="grey lighten-1" text icon @click="addMeAsWatcher">
      <v-icon>account_circle</v-icon>
    </v-btn>
  </v-subheader>
  <v-list class="elevation-1">
    <v-list-item v-for="watcher in task.watchers" :key="watcher">
      <v-list-item-avatar :color="isOnline(watcher)">
        <span class="">{{ formatUserLetters(watcher) }}</span>
      </v-list-item-avatar>
      <v-list-item-content>
      <v-list-item-title>
        <span>{{ formatUser(watcher) }}</span>
        <span v-show="!watcher">{{ $t('Unassigned')}}</span>
      </v-list-item-title>
      </v-list-item-content>
      <v-list-item-action>
        <v-btn icon text @click.stop="removeWatcher(watcher)">
          <v-icon color="grey">delete</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>

    <v-list-item @click="showChooseWatcherDialog = true">
      <v-list-item-avatar>
        <v-icon>add</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
      <v-list-item-title>
        <span v-show="!task.assignedTo">{{ $t('Add')}}</span>
      </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>


  <template v-if="isEstimationEnabled">
    <v-subheader>{{ $t('Estimations') }}</v-subheader>
    <task-estimations-in-detail :task="task"></task-estimations-in-detail>
  </template>

</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import { Permissions } from "/imports/api/permissions/permissions"
import usersMixin from '/imports/ui/mixins/UsersMixin.js';
import moment from 'moment';
import 'moment/locale/fr'

export default {
  mixins: [usersMixin],
  props: {
    task: {
      type: Object
    }
  },
  watch: {
    task(task) {
      if (task) {
        this.loadEstimationFeature(task);
      }
    }
  },
  data() {
    return {
      showChooseAssignedToDialog: false,
      showChooseWatcherDialog: false,
      showSelectDueDate: false,
      showSelectStartDate: false,
      isEstimationEnabled: false,
    };
  },
  computed: {
     project() {
       if (!this.task) return;
       return Projects.findOne({_id: this.task.projectId});
    }
  },
  methods: {

    onChooseWatcher (user) {
      Meteor.call('tasks.addWatcher', this.task._id, user._id);
    },

    addMeAsWatcher () {
      Meteor.call('tasks.addWatcher', this.task._id, Meteor.userId());
    },

    removeWatcher (watcher) {
      Meteor.call('tasks.removeWatcher', this.task._id, watcher);
    },

    onChooseAssignedTo (user) {
      Meteor.call('tasks.assignTo', this.task._id, user._id);
    },

    addMeAsAssignedTo () {
      Meteor.call('tasks.assignTo', this.task._id, Meteor.userId());
    },

    removeAssignedTo () {
      if (this.task.assignedTo) Meteor.call('tasks.removeAssignedTo', this.task._id);
    },


    onSelectDueDate (date, reminder) {
      Meteor.call('tasks.setDueDate', this.task._id, date, reminder);
    },

    onSelectStartDate (date, reminder) {
      Meteor.call('tasks.setStartDate', this.task._id, date, reminder);
    },

    formatDate (date) {
      return moment(date).format('DD/MM/YYYY HH:mm');
    },

    canManageProject(task) {
      return Permissions.isAdmin(Meteor.userId(), task.projectId) || Permissions.isAdmin(Meteor.userId());
    },

    loadEstimationFeature(task) {
      Meteor.call("projects.hasFeature", {projectId: task.projectId, feature: "estimation"}, (error, result) => {
        this.isEstimationEnabled = result;
      })
    }
  }
};
</script>

<style scoped>
.task-properties {
  margin: 12px;
}

.cursor {
  cursor: pointer;
}

</style>