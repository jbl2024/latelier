<template>
  <div class="organization-title">
    <v-toolbar-title v-show="!editOrganizationName" class="align-left">
      <div>
        <slot />
        <v-btn icon text @click="goTo('dashboard-page')">
          <v-icon>mdi-home</v-icon>
        </v-btn>
        <span
          class="title hidden-xs-only"
          @click="startUpdateOrganizationName"
        >{{ organization.name }}</span>
      </div>
    </v-toolbar-title>
    <v-text-field
      v-show="!editOrganizationName"
      text
      solo-inverted
      color="primary"
      hide-details
      prepend-inner-icon="mdi-magnify"
      :label="$t('Search') + '...'"
      class="hidden-sm-and-down align-remaining"
      @input="debouncedFilter"
    />

    <div v-show="editOrganizationName" class="title edit align-left">
      <v-text-field
        ref="name"
        v-model="organization.name"
        style="width: 500px"
        text
        solo-inverted
        color="primary"
        hide-details
        prepend-inner-icon="mdi-pencil"
        label="Saisir un nom..."
        @focus="$event.target.select()"
        @keyup.enter="updateOrganizationName"
      />
      <v-btn icon @click="updateOrganizationName">
        <v-icon>mdi-check-circle</v-icon>
      </v-btn>
      <v-btn icon @click="cancelUpdateOrganizationName">
        <v-icon>mdi-close-circle</v-icon>
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
      default: ""
    }
  },
  data() {
    return {
      savedOrganizationName: "",
      editOrganizationName: false,
      debouncedFilter: ""
    };
  },
  created() {
    this.debouncedFilter = debounce((val) => {
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
  methods: {
    startUpdateOrganizationName() {
      this.savedOrganizationName = this.organization.name;
      this.editOrganizationName = true;
      this.$nextTick(() => this.$refs.name.focus());
    },

    updateOrganizationName() {
      this.editOrganizationName = false;
      Meteor.call("organizations.updateName", {
        organizationId: this.organization._id,
        name: this.organization.name
      });
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
