<template>
  <div class="empty-state">
    <div class="empty-state-container">
      <div>
        <v-icon class="icon" color="grey">{{icon}}</v-icon>
      </div>
      <div class="label">
        {{ label}}
      </div>
      <div class="description">
          {{ description}}
      </div>
      <slot></slot>
    </div>
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

.empty-state {
  text-align: center;
}
.icon {
  font-size: 140px;
}

.label {
  font-size: 26px;
  font-weight: 500;
  line-height: 40px;
}

.description {
  margin: 1em 0;
  font-size: 16px;
  line-height: 24px;
}

.empty-state-container {
}
</style>