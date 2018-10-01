<template>

  <div class="organization-title md-layout md-gutter">
    <div class="md-layout-item md-toolbar-section-start">
      <span class="md-title" v-show="!editOrganizationName" @click="startUpdateOrganizationName">
        {{ organization.name }}
      </span>
      <span class="md-title edit-organization-name" v-show="editOrganizationName">
        <input @focus="$event.target.select()" type="text" ref="name" v-model="organization.name" v-on:keyup.enter="updateOrganizationName">
        <md-button class="md-icon-button" @click.native="updateOrganizationName">
          <md-icon>check_circle</md-icon>
        </md-button>

        <md-button class="md-icon-button" @click.native="cancelUpdateOrganizationName">
          <md-icon>cancel</md-icon>
        </md-button>
      </span>
    </div>

    <div class="md-layout-item md-toolbar-section-end search show-desktop">
      <md-icon>search</md-icon>
      <input placeholder="Rechercher..." v-on:input="debouncedFilter">
    </div>

  </div>

</template>

<script>
import { Organizations } from "/imports/api/organizations/organizations.js";
import debounce from "lodash/debounce";

export default {
  props: {
    organizationId: {
      type: String,
      default: 0
    }
  },
  meteor: {
    organization: {
      params() {
        return {
          id: this.organizationId
        };
      },
      deep: false,
      update({ id }) {
        return Organizations.findOne({ _id: id }) || {};
      }
    }
  },
  data() {
    return {
      savedOrganizationName: "",
      editOrganizationName: false,
      debouncedFilter: ""
    };
  },
  methods: {
    startUpdateOrganizationName() {
      this.savedOrganizationName = this.organization.name;
      this.editOrganizationName = true;
      this.$nextTick(() => this.$refs.name.focus());
    },

    updateOrganizationName() {
      this.editOrganizationName = false;
      Meteor.call("organizations.updateName", this.organization._id, this.organization.name);
    },

    cancelUpdateOrganizationName() {
      this.editOrganizationName = false;
      this.organization.name = this.savedOrganizationName;
    }
  }
};
</script>

<style scoped>
.edit-organization-name input {
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 0.02em;
  margin-top: 6px;
  padding: 0;
  font-family: Roboto, Noto Sans, -apple-system, BlinkMacSystemFont, sans-serif;
}

.edit-organization-name .md-button {
  margin: 0;
}

.search  {
  margin-left: 12px;
}


.search input {
  margin-left: -24px;
  padding-left: 32px;
  border: none;
  font-size: 16px;
  color: white;
  background-color: #448aff;
  border-bottom: 1px solid #eee;
}

</style>