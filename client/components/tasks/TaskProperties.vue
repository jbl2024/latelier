<template>

<div class="task-properties">

  <select-user @select="onChooseWatcher" :project="project" :active.sync="showChooseWatcherDialog" :is-admin="canManageProject(task)"></select-user>
  <select-user @select="onChooseAssignedTo" :project="project" :active.sync="showChooseAssignedToDialog" :is-admin="canManageProject(task)"></select-user>
  <select-date @select="onSelectDueDate" reminder :active.sync="showSelectDueDate"></select-date>
  <select-date @select="onSelectStartDate" reminder :active.sync="showSelectStartDate"></select-date>
  
  <v-subheader>{{ $t('Dates') }} </v-subheader>
  <v-list two-line class="elevation-1">
      <v-list-tile @click="showSelectStartDate = true">
        <v-list-tile-avatar>
          <v-icon>calendar_today</v-icon>
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title>{{ $t('Start date') }}</v-list-tile-title>
          <v-list-tile-sub-title>
            <span v-show="task.startDate">{{ formatDate(task.startDate) }}</span>
          </v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action v-if="task.reminderStartDate">
          <v-icon>alarm_on</v-icon>
        </v-list-tile-action>
        <v-list-tile-action>
          <v-btn flat icon @click.stop="onSelectStartDate(null)">
            <v-icon>delete</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>

      <v-divider></v-divider>

      <v-list-tile @click="showSelectDueDate = true">
        <v-list-tile-avatar>
          <v-icon>alarm</v-icon>
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title>{{ $t('End date') }}</v-list-tile-title>
          <v-list-tile-sub-title>
            <span v-show="task.dueDate">{{ formatDate(task.dueDate) }}</span>
          </v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action v-if="task.reminderDueDate">
          <v-icon>alarm_on</v-icon>
        </v-list-tile-action>
        <v-list-tile-action>
          <v-btn flat icon @click.stop="onSelectDueDate(null)">
            <v-icon>delete</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>
  </v-list>

  <v-subheader>{{ $t('Duties') }}
    <v-btn color="grey lighten-1" flat icon @click="addMeAsAssignedTo">
      <v-icon>account_circle</v-icon>
    </v-btn>
  </v-subheader>
  <v-list class="elevation-1">
    <v-list-tile @click="showChooseAssignedToDialog = true">
      <v-list-tile-avatar :color="isOnline(task.assignedTo)">
        <span class="">{{ formatUserLetters(task.assignedTo) }}</span>
      </v-list-tile-avatar>
      <v-list-tile-content>
      <v-list-tile-title>
        <span>{{ formatUser(task.assignedTo) }}</span>
        <span v-show="!task.assignedTo">{{ $t('Unassigned')}}</span>
      </v-list-tile-title>
      </v-list-tile-content>
      <v-list-tile-action>
        <v-btn icon flat @click.stop="removeAssignedTo">
          <v-icon color="grey">delete</v-icon>
        </v-btn>
      </v-list-tile-action>
    </v-list-tile>
  </v-list>

  <v-subheader>{{ $t('Watchers') }}
    <v-btn color="grey lighten-1" flat icon @click="addMeAsWatcher">
      <v-icon>account_circle</v-icon>
    </v-btn>
  </v-subheader>
  <v-list class="elevation-1">
    <v-list-tile v-for="watcher in task.watchers" :key="watcher">
      <v-list-tile-avatar :color="isOnline(watcher)">
        <span class="">{{ formatUserLetters(watcher) }}</span>
      </v-list-tile-avatar>
      <v-list-tile-content>
      <v-list-tile-title>
        <span>{{ formatUser(watcher) }}</span>
        <span v-show="!watcher">{{ $t('Unassigned')}}</span>
      </v-list-tile-title>
      </v-list-tile-content>
      <v-list-tile-action>
        <v-btn icon flat @click.stop="removeWatcher(watcher)">
          <v-icon color="grey">delete</v-icon>
        </v-btn>
      </v-list-tile-action>
    </v-list-tile>

    <v-list-tile @click="showChooseWatcherDialog = true">
      <v-list-tile-avatar>
        <v-icon>add</v-icon>
      </v-list-tile-avatar>
      <v-list-tile-content>
      <v-list-tile-title>
        <span v-show="!task.assignedTo">{{ $t('Add')}}</span>
      </v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
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