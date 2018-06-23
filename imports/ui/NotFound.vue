<template>
<div class="not-found">
  <div class="banner">
    <img src="/img/droids.jpg" />
  </div>
  <div class="hero">
    Not Found
  </div>
  <div>
    This is not the page you are looking for. <router-link :to="{name:'home'}">Return home</router-link>
  </div>
</div>
</template>

<style scoped>
.not-found {
  margin-top: 84px;
  text-align: center;
}
.not-found .hero {
  font-size: 2.5em;
  color: #666;
  margin: 12px;
}
.not-found .banner img {
  max-width: 100%;
  border-radius: 5px;
}
</style>