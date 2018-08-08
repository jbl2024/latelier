<template>
  <div class="choose-person">

    <md-dialog :md-active.sync="active">
      <md-dialog-title>Choisir une personne</md-dialog-title>

      <div class="content">
        <md-list>
          <md-list-item v-for="person in persons" :key="person._id" class="cursor" @click="selectUser(person)">
            <md-avatar class="md-avatar-icon" :class="isOnline(person)">
                <md-ripple>{{ formatUserLetters(person) }}</md-ripple>
            </md-avatar>

            <span class="md-list-item-text">{{ formatUser(person)}}</span>

          </md-list-item>
        </md-list>
      </div>
      <md-dialog-actions>
        <md-button class="md-button" @click="closeDialog">Annuler</md-button>
      </md-dialog-actions>
    </md-dialog>  

  </div>    
</template>

<script>
import { Meteor } from 'meteor/meteor'
import { Projects } from '/imports/api/projects/projects.js'
import usersMixin from '/imports/ui/mixins/UsersMixin.js';

export default {
  mixins: [usersMixin],
  props: {
    active: Boolean,
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

    selectUser (user) {
      this.$emit('update:active', false);
      this.$emit('choose', user);
    }

  }
}
</script>

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
  overflow-y: scroll;
}

.cursor {
  cursor: pointer;
}

.cursor:hover {
  background-color: #aaa;
}

</style>