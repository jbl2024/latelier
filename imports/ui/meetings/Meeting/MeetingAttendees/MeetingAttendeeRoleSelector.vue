<template>
  <v-menu
    offset-y
    class="meeting-attendee-role-selector"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        text
        class="meeting-attendee-role-selector__activator"
        v-on="on"
      >
        <v-icon v-if="selectedRole.icon" left>
          {{ selectedRole.icon }}
        </v-icon>
        <span>
          {{ selectedRole.text }}
        </span>
        <v-icon right>
          mdi-chevron-down
        </v-icon>
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item v-for="role in roles" :key="role.value" @click="selectedRole = role">
        <v-list-item-icon v-if="role.icon">
          <v-icon>
            {{ role.icon }}
          </v-icon>
        </v-list-item-icon>
        <v-list-item-title>
          {{ role.text }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
<script>
export default {
  props: {
    value: {
      type: String,
      default: "attendee"
    }
  },
  data() {
    return {
      roles: [
        { value: "attendee", text: this.$t("meetings.roles.attendee"), icon: "mdi-account" },
        { value: "organizer", text: this.$t("meetings.roles.organizer"), icon: "mdi-account-edit" }
      ]
    };
  },
  computed: {
    selectedRole: {
      get() {
        return this.roles.find((role) => role.value === this.value);
      },
      set(newRole) {
        if (!newRole?.value) return false;
        return this.$emit("input", newRole.value);
      }
    }
  }
};
</script>
<style lang="scss">
  .v-btn.meeting-attendee-role-selector__activator {
    text-transform: none;
  }
</style>
