<template>
  <div>
    <generic-dialog
      v-model="showDialog"
      :title="title"
      :css-classes="['new-meeting']"
      max-width="1000px"
    >
      <template v-slot:content>
        <pre v-if="meeting">
          {{ meeting }}
        </pre>
      </template>
    </generic-dialog>
  </div>
</template>
<script>
export default {
  props: {
    meeting: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showDialog: false
    }
  },
  computed: {
    title() {
      return this.meeting?.name;
    }
  },
  methods: {
    open() {
      this.showDialog = true;
    },
    close() {
      this.showDialog = false;
    }
  }
}
</script>