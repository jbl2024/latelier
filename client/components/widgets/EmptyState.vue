<template>
  <div class="empty-state">
    <div class="empty-state-container">
      <div>
        <v-img :src="getIllustrationUrl()" v-if="illustration" class="illustration"></v-img>
        <v-icon class="icon" color="grey" v-if="icon">{{icon}}</v-icon>
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
    illustration: String
  },
  data () {
    return {
    }
  },
  methods: {
    getIllustrationUrl () {
      return `/illustrations/${this.illustration}.svg`;
    }
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

.illustration {
  margin: 0 auto;
}
@media (min-width: 601px) {
  .illustration {
    width: 512px;
  }
}

@media (max-width: 600px) {
  .illustration {
    width: 100%;
  }
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