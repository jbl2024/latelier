<template>
  <div class="user-page">
    <template v-if="isConnected && isAdmin && user">
      <v-card class="center">
        <v-card-title>{{ getEmail(user) }}</v-card-title>
        <v-card-text>
          <
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>

<script>
import { UserUtils } from "/imports/api/users/utils";
import { mapGetters } from "vuex";

export default {
  props: {
    userId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      user: null
    };
  },
  computed: {
    ...mapGetters(["isConnected", "isAdmin"])
  },
  watch: {
    userId: {
      immediate: true,
      handler() {
        console.log(this.userId)
        if (this.userId) {
          this.refresh();
        }
      }
    }
  },
  methods: {
    getEmail(user) {
      return UserUtils.getEmail(user);
    },

    refresh() {
      Meteor.call("admin.getUser", { userId: this.userId }, (error, result) => {
        if (error) {
          this.$notifyError(error);
        }
        this.user = result;
      });
    }
  }
};
</script>

<style scoped>
.user-page {
  background-color: #e5e5e5;
}

.deleted {
  text-decoration: line-through;
}

.center {
  max-width: 800px;
  margin: 0 auto;
  margin-top: 24px;
}
</style>
