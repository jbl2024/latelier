<template>

  <div class="organization-title ml-0 pl-3">
    <slot></slot>

    <v-btn flat icon color="white" :to="{ name: 'organizations-page' }">
      <v-icon>home</v-icon>
    </v-btn>
    <span class="title ml-3 mr-5" v-show="!editOrganizationName" @click="startUpdateOrganizationName">
        {{ organization.name }}
    </span>
    <span class="title edit-organization-name" v-show="editOrganizationName">
      <input @focus="$event.target.select()" type="text" ref="name" v-model="organization.name" v-on:keyup.enter="updateOrganizationName">
      <v-btn icon @click="updateOrganizationName">
        <v-icon>check_circle</v-icon>
      </v-btn>
      <v-btn icon @click="cancelUpdateOrganizationName">
        <v-icon>cancel</v-icon>
      </v-btn>
    </span>
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
  created() {
    this.debouncedFilter = debounce(val => {
    }, 400);
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

</style>