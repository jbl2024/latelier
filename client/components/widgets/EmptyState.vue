<template>
  <div class="empty-state">
    <div class="empty-state-container">
      <div>
        <v-img :src="getIllustrationUrl()" v-if="illustration" :class="getIllustrationClass()"></v-img>
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
    illustration: String,
    small: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
    }
  },
  methods: {
    getIllustrationUrl () {
      return Meteor.absoluteUrl(`/illustrations/${this.illustration}.svg`);
    },
    getIllustrationClass() {
      return `illustration ${this.small ? "small": ""}`;
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
  .illustration.small {
    width: 300px;
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

</style>