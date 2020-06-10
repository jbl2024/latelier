<template>
  <v-toolbar
    :flat="flat"
    :dense="dense"
    class="meeting-page-toolbar"
  >
    <div class="left-side">
      <v-btn>
        <v-icon>
          mdi-play
        </v-icon>
        Lancer la réunion
      </v-btn>
    </div>
    <div class="center">

    </div>
    <!-- Switch between 24h and 7h start interval -->
    <div class="right-side">

    </div>
  </v-toolbar>
</template>
<script>
export default {
  props: {
    flat: {
      type: Boolean,
      default: false
    },
    dense: {
      type: Boolean,
      default: true
    }
  }
}
</script>