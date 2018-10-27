<template>
  <div class="administration-page">
    <template v-if="$subReady.user">
      <template v-if="isAdmin()">
        coucou
      </template>
    </template>
  </div>
</template>

<script>
export default {
  props: {
  },

  data () {
    return {}
  },
  meteor: {
    $subscribe: {
      user: function() {
        return [];
      }
    },
  },
  methods: {
    isAdmin () {
      if (Roles.userIsInRole(Meteor.userId(), 'admin', Roles.GLOBAL_GROUP)) {
        return true;
      }
      return false;
    }
  },
}
</script>

<style scoped>
</style>