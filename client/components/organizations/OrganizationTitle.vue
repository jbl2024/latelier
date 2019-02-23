<template>
  <div class="organization-title">
    <v-toolbar-title class="align-left" v-show="!editOrganizationName">
      <div>
        <slot></slot>
        <v-btn icon flat @click="goTo('organizations-page')">
          <v-icon>home</v-icon>
        </v-btn>
        <span
          class="title hidden-xs-only"
          @click="startUpdateOrganizationName"
        >{{ organization.name }}</span>
      </div>
    </v-toolbar-title>
    <v-text-field
      v-show="!editOrganizationName"
      flat
      solo-inverted
      hide-details
      prepend-inner-icon="search"
      label="Rechercher..."
      class="hidden-sm-and-down align-remaining"
      v-on:input="debouncedFilter"
    ></v-text-field>

    <div class="title edit align-left" v-show="editOrganizationName">
      <v-text-field
        @focus="$event.target.select()"
        style="width: 500px"
        flat
        solo-inverted
        hide-details
        prepend-inner-icon="edit"
        label="Saisir un nom..."
        ref="name"
        v-model="organization.name"
        v-on:keyup.enter="updateOrganizationName"
      ></v-text-field>
      <v-btn icon @click="updateOrganizationName">
        <v-icon>check_circle</v-icon>
      </v-btn>
      <v-btn icon @click="cancelUpdateOrganizationName">
        <v-icon>cancel</v-icon>
      </v-btn>
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
  created() {
    this.debouncedFilter = debounce(val => {
      this.$events.fire("filter-projects", val);
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
      Meteor.call(
        "organizations.updateName",
        this.organization._id,
        this.organization.name
      );
    },

    cancelUpdateOrganizationName() {
      this.editOrganizationName = false;
      this.organization.name = this.savedOrganizationName;
    },

    goTo(link) {
      this.$router.push({ name: link });
    }
  }
};
</script>

<style scoped>
.organization-title {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex: 2;
}

.align-left {
  flex: 1;
}

.align-remaining {
  flex: 1;
}

.edit .v-text-field {
  float: left;
}

.title {
  position: relative;
  top: 3px;
}
</style>