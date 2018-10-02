<template>
  <div class="organization-settings-manage-users">
    <select-user @select="onSelectUser" :active.sync="showSelectUserDialog"></select-user>
    <md-list>
      <md-subheader>Membres

        <md-button class="md-icon-button" @click="showSelectUserDialog = true">
        <md-icon>add</md-icon>
        <md-tooltip md-delay="300">Ajouter un utilisateur</md-tooltip>
        </md-button>
 
      </md-subheader>
      <div class="md-elevation-1">
        <div v-for="user in organizationUsers" :key="user._id">
          <md-list-item>
            <md-avatar class="md-avatar-icon" :class="isOnline(user)">
                <md-ripple>{{ formatUserLetters(user) }}</md-ripple>
            </md-avatar>

            <span class="md-list-item-text">{{ formatUser(user)}}</span>
            <md-button class="md-icon-button md-list-action" @click.stop="removeUser(user)">
              <md-icon>delete</md-icon>
              <md-tooltip md-delay="300">Supprimer</md-tooltip>
            </md-button>
          </md-list-item>
        </div>
      </div>
    </md-list>
  </div>    
</template>

<script>
import { Meteor } from 'meteor/meteor'
import { Organizations } from '/imports/api/organizations/organizations.js'
import usersMixin from '/imports/ui/mixins/UsersMixin.js';

export default {
  name: 'organization-settings-manage-users',
  mixins: [usersMixin],
  props: {
    organization: Object
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
    organizationUsers: {
      params () {
        return {
          organization: this.organization
        };
      },
      deep: false,
      update ({organization}) {
        if (organization) {
          var members = organization.members || [];
          return Meteor.users.find({_id: {$in: members}});
        }
      }
    }
  },
  methods: {
    onSelectUser (user) {
      Meteor.call('organizations.addMember', this.organization._id, user._id);
    },

    removeUser (user) {
      Meteor.call('organizations.removeMember', this.organization._id, user._id);
    }
  }
}
</script>

<style scoped>
.manage-user {
  overflow-y: scroll;
}

.toolbar {
  background-color: #2D6293;
}

.toolbar h3.md-title {
  color: white;
}

.online {
  background-color: red;
}

</style>