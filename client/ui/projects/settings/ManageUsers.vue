<template>
  <div class="manage-users">
    <select-user @select="onSelectUser" :active.sync="showSelectUserDialog"></select-user>
    <md-button class="md-raised md-primary" @click="showSelectUserDialog = true">Ajouter</md-button>
    <md-list>
      <md-subheader></md-subheader>
      <md-list-item v-for="user in projectUsers" :key="user._id">
        <md-avatar class="md-avatar-icon" :class="isOnline(user)">
            <md-ripple>{{ formatUserLetters(user) }}</md-ripple>
        </md-avatar>

        <span class="md-list-item-text">{{ formatUser(user)}}</span>
        <md-button class="md-icon-button md-list-action" @click.stop="removeUser(user)">
          <md-icon>delete</md-icon>
          <md-tooltip md-delay="300">Supprimer</md-tooltip>
        </md-button>
      </md-list-item>
    </md-list>

  </div>    
</template>

<script>
import { Meteor } from 'meteor/meteor'
import { Projects } from '/imports/api/projects/projects.js'
import usersMixin from '/imports/ui/mixins/UsersMixin.js';

export default {
  name: 'project-settings-manage-users',
  mixins: [usersMixin],
  props: {
    project: Object
  },
  data () {
    return {
      showSelectUserDialog: false
    }
  },
  meteor: {
    $subscribe: {
      'users': function() {
        return [] ;
      }
    },
    projectUsers: {
      params () {
        return {
          project: this.project
        };
      },
      deep: false,
      update ({project}) {
        if (project) {
          var members = project.members || [];
          return Meteor.users.find({_id: {$in: members}});
        }
      }
    },    
    allUsers () {
      return Meteor.users.find();
    }
  },
  methods: {


    onSelectUser (user) {
      Meteor.call('projects.addMember', this.project._id, user._id);
    },

    removeUser (user) {
      Meteor.call('projects.removeMember', this.project._id, user._id);
    }
  }
}
</script>

<style scoped>
.manage-user {
  overflow-y: scroll;
}

.online {
  background-color: red;
}

</style>