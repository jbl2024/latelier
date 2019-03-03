<template>
  <div class="auto-edit">
    <div v-if="!edit" class="view">
      {{ localValue }}
    </div>
    <div v-if="edit">
      <input type="text" v-model="localValue" ref="edit">
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ""
    },
    edit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localValue: this.value,
    }
  },
  methods: {
  },
};
</script>

<style scoped>
.auto-edit {
  cursor: pointer;
  width: 100%;
}

.view {
  min-height: 24px;
  width: 100%;
}
input {
  width: 100%;
}
</style>