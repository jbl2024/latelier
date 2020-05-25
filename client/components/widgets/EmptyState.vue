<template>
  <div :class="['empty-state', fullPage ? 'full-page' : null]">
    <div class="empty-state-container">
      <img
        v-if="illustrationUrl"
        :src="illustrationUrl"
        :class="['illustration', size]"
      >
      <v-icon v-if="icon" class="icon" color="grey">
        {{ icon }}
      </v-icon>
      <div class="label">
        {{ label }}
      </div>
      <div class="description">
        {{ description }}
      </div>
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      default: ""
    },
    rounded: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: ""
    },
    illustration: {
      type: String,
      default: ""
    },
    small: {
      type: Boolean,
      default: false
    },
    xs: {
      type: Boolean,
      default: false
    },
    fullPage: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    illustrationUrl() {
      if (!this.illustration) return null;
      return Meteor.absoluteUrl(`/illustrations/${this.illustration}.svg`);
    },
    size() {
      if (this.xs) return "xs";
      if (this.small) return "small";
      return "large";
    }
  }
};
</script>

<style lang="scss" scoped>
@import "/imports/ui/styles/mixins/breakpoint";

.empty-state {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  @include media-query("sm-and-down") {
    padding: 2rem;
  }
  &.full-page {
    /* Full minus topbar+margin height */
    height: calc(100vh - 88px);
    @include media-query("sm-and-down") {
      height: calc(100vh - 112px);
    }
  }
  .icon {
    font-size: 140px;
  }

  .illustration {
    margin: 0 auto;
    width: 100%;
    height: auto;
    $sizes: (xs: 150px, small: 300px, large: 512px);
    @each $size, $max-width in $sizes {
      &.#{$size} {
        max-width: $max-width;
      }
    }
  }
  .label {
    font-size: 26px;
    margin-top: 1rem;
  }
  .description {
    font-size: 16px;
    & + * {
      margin-top: 1rem;
    }
  }
}
</style>
