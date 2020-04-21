<template>
    <div class="container-wrapper">
        <div v-show="$vuetify.breakpoint.lgAndUp" class="left">
            <slot name="left">
            </slot>
        </div>
        <div class="right">
            <slot name="right">
            </slot>
        </div>
    </div>
</template>

<style scoped>
.container-wrapper {
  overflow-y: scroll;
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: row;
}

@media (max-width: 600px) {
  .container-wrapper {
    min-height: 100vh;
  }
}

.left {
  flex-direction: column;
  overflow-y: auto;
  width: 360px;
  background-color: white;
  border-left: 1px solid #ddd;
  display: flex;
  position: relative;
}

.right {
  padding: 3rem;
  flex: 1;
}
</style>