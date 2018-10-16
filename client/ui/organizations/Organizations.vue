<template>
  <div class="organizations">
    <new-organization ref="newOrganization"></new-organization>  

    <md-dialog-confirm
      :md-active.sync="showConfirmDialog"
      md-title="Confirmer la suppression ?"
      md-content="L'organisation sera définitivement supprimée"
      md-confirm-text="Supprimer"
      md-cancel-text="Annuler"
      @md-cancel="onCancelDeleteOrganization"
      @md-confirm="onConfirmDeleteOrganization" />

    <div v-if="!$subReady.organizations">
      <md-progress-bar md-mode="indeterminate"></md-progress-bar>
    </div>
      
    <div v-if="$subReady.organizations">
      <md-empty-state
        v-if="organizations.length == 0"
        :md-description="`Aucune organisation disponible`">
        <md-button class="md-primary md-raised" @click="newOrganization">Créer une organisation</md-button>
      </md-empty-state>
      <md-list class="md-double-line fap-list" v-show="organizations.length != 0"> 
        <md-subheader>Organisations</md-subheader>

        <div class="md-elevation-1">
        <template v-for="item in organizations" >
          <md-list-item :key='item._id'>
            <md-icon>domain</md-icon>
            <div class="md-list-item-text pointer" @click="openOrganization(item._id)">
              <span>{{ item.name }}</span>
              <span>{{ item.description }}</span>
            </div>

            <md-button class="md-icon-button show-desktop" @click.stop="openOrganizationSettings(item._id)">
              <md-icon>settings</md-icon>
              <md-tooltip md-delay="300">Paramétrer</md-tooltip>
            </md-button>

            <md-button class="md-icon-button show-desktop" @click.stop="deleteOrganization(item._id)">
              <md-icon>delete</md-icon>
              <md-tooltip md-delay="300">Supprimer</md-tooltip>
            </md-button>


          </md-list-item>
          <md-divider></md-divider>
        </template>
        </div>
      </md-list>

      <div class="absolute-right">
        <md-button class="md-fab" @click="newOrganization">
            <md-icon>add</md-icon>          
            <md-tooltip md-delay="300">Ajouter une organisation</md-tooltip>
        </md-button>
      </div>
    </div>
  </div>
</template>

<script>
import { Organizations } from "/imports/api/organizations/organizations.js";

export default {
  data() {
    return {
      showConfirmDialog: false,
      organizationId: 0
    };
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      organizations: function() {
        return [];
      }
    },
    organizations() {
      return Organizations.find(
        {},
        {
          sort: { name: 1 }
        }
      );
    }
  },
  methods: {
    newOrganization() {
      this.$refs.newOrganization.open();
    },
    deleteOrganization(organizationId) {
      this.organizationId = organizationId;
      this.showConfirmDialog = true;
    },

    onConfirmDeleteOrganization() {
      this.showConfirmDialog = false;
      Meteor.call("organizations.remove", this.organizationId);
    },

    onCancelDeleteOrganization() {
      this.showConfirmDialog = false;
    },

    openOrganization(id) {
      this.$router.push({ name: "projects-page", params: { organizationId: id } });
    },

    openOrganizationSettings(id) {
      this.$router.push({
        name: "organization-settings",
        params: { organizationId: id }
      });
    }
  }
};
</script>

<style scoped>
.project-name {
  color: black !important;
  font-weight: normal;
}

.row {
  cursor: pointer;
}

.title {
  font-size: 20px;
  font-weight: normal;
  margin-right: 12px;
}

.pointer { 
  cursor: pointer;
}


@media (min-width: 601px) {
  .fap-list {
    margin-right: 92px;
    margin-left: 48px;
  }
}

@media (max-width: 600px) {
  .fap-list {
    margin-right: auto; 
    margin-left: auto;
  }
}

</style>