<template>
  <div class="empty-state">
    <md-empty-state
      :md-description="description"
      :md-label="label"
      :md-rounded="rounded"
      :md-icon="icon">
      <slot></slot>
    </md-empty-state>
  </div>    
</template>

<script>

export default {
  props: {
    label: String,
    description: String,
    rounded: Boolean,
    icon: String,
  },
  data () {
    return {
    }
  },
  methods: {
  }
}
</script>

<style scoped>
</style>