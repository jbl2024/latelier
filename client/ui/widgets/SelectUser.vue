<template>
  <div class="select-user">

    <v-dialog v-model="active" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-card-title class="headline">Sélectionner un utilisateur</v-card-title>
        <v-card-text>
          <v-list class="content"> 
            <template v-for="item in users" >
              <v-list-tile :key='item._id' @click="selectUser(item)">
                <v-list-tile-avatar>
                  <div class="avatar">
                    {{ formatUserLetters(item) }}
                  </div>
                </v-list-tile-avatar>            
                <v-list-tile-content class="pointer">
                  <v-list-tile-title>{{ formatUser(item) }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>     
          </v-list>   
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="closeDialog">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>



  </div>    
</template>

<script>
import { Meteor } from 'meteor/meteor'
import { Projects } from '/imports/api/projects/projects.js'
import { Organizations } from '/imports/api/organizations/organizations.js'
import usersMixin from '/imports/ui/mixins/UsersMixin.js';

export default {
  mixins: [usersMixin],
  props: {
    active: Boolean,
    project: Object
  },
  data () {
    return {
    }
  },
  meteor: {
    users () {
      if (this.project) {
        const organization = Organizations.findOne(this.project.organizationId);
        if (organization) {
          const members = organization.members || [];
          return Meteor.users.find({_id: {$in: members}});
        }
      }
      return Meteor.users.find();
    }
  },
  methods: {
    closeDialog () {
      this.$emit('update:active', false);
    },

    selectUser (user) {
      this.$emit('update:active', false);
      this.$emit('select', user);
    }

  }
}
</script>

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
  overflow-y: scroll;
  max-height: 300px;
}

.cursor {
  cursor: pointer;
}

.cursor:hover {
  background-color: #aaa;
}

.avatar {
  background-color: rgba(0, 0, 0, 0.14);
  border-radius: 50%;
  width: 38px;
  height: 38px;
  padding-top: 8px;
}

</style>