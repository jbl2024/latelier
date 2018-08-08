<template>
  <div class="choose-person">

    <md-dialog :md-active.sync="active">
      <md-dialog-title>Choisir une personne</md-dialog-title>

      <div class="content">
        <md-list>
          <md-list-item v-for="person in persons" :key="person._id">
            <md-avatar class="md-avatar-icon md-small">
                <md-ripple>{{ formatUserLetters(person) }}</md-ripple>
            </md-avatar>

            <span class="md-list-item-text">{{ formatUser(person)}}</span>

          </md-list-item>
        </md-list>
      </div>
      <md-dialog-actions>
        <md-button class="md-button" @click="closeDialog">Annuler</md-button>
        <md-button class="md-raised md-primary" @click="confirm">Choisir</md-button>
      </md-dialog-actions>
    </md-dialog>  

  </div>    
</template>

<script>
import { Meteor } from 'meteor/meteor'
import { Projects } from '/imports/api/projects/projects.js'

export default {
  props: {
    active: Boolean
  },
  data () {
    return {
    }
  },
  meteor: {
    persons () {
      return Meteor.users.find();
    }
  },
  methods: {
    closeDialog () {
      this.$emit('update:active', false);
    },

    confirm () {
      this.$emit('update:active', false);
      this.$emit('choose');
    },

    formatUserLetters (user) {
      var emailComponents = user.emails[0].address.split('@');
      return emailComponents[0][0] + emailComponents[1][0];
    },

    formatUser (user) {
      return user.emails[0].address;
    },


  }
}
</script>

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
  max-height: 300px;
  overflow-y: scroll;
}

</style>