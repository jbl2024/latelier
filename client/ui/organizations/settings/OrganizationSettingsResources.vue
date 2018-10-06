<template>
  <div class="organization-settings-resources"> 

    <div v-if="!$subReady.resources">
      <md-progress-bar md-mode="indeterminate"></md-progress-bar>
    </div>
      
    <div v-if="$subReady.resources">

      <md-empty-state
        v-if="resources.length == 0"
        md-rounded
        md-icon="category"
        :md-description="`Aucune ressource définie`">
        <md-button class="md-primary md-raised" @click="newResource">Ajouter une ressource</md-button>
      </md-empty-state>

      <md-table v-if="resources.length > 0">
        <md-table-row>
          <md-table-head>Nom</md-table-head>
          <md-table-head md-numeric>Nombre</md-table-head>
        </md-table-row>

        <md-table-row v-for="resource in resources" :key='resource._id'>
          <md-table-cell>{{ resource.name}}</md-table-cell>
          <md-table-cell md-numeric>{{ resource.amount}}</md-table-cell>
        </md-table-row>
      </md-table>
    </div>
  </div>
</template>

<script>
import { Organizations } from '/imports/api/organizations/organizations.js'
import { Resources } from '/imports/api/resources/resources.js'

export default {
  name: 'organization-settings-resources',
  props: {
    organization: {
      type: Object,
      default: {}
    }
  },
  data () {
    return {
    }
  },
  methods: {
    newResource () {

    }
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      resources: function() {
        return [this.organizationId];
      }
    },
    resources() {
      return Resources.find({}, {sort: {name: 1}});
    },
  }
}
</script>

<style scoped>
</style>