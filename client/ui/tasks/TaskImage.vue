<template>

<div class="task-image">
    <md-card>
      <md-card-header>
        <div class="md-title">
          <span class="name">
          {{ task.name }}
          </span>
        </div>
      </md-card-header>

    </md-card>
</div>


</template>

<script>

export default {
  name: 'task-image',
  props: {
    task: {
      type: Object
    }
  },
  data() {
    return {
    };
  },
};
</script>

<style scoped>
.task h2 {
  text-align: left;
  background-color: #1f5c87;
  color: white;
  font-weight: normal;
  font-size: 14px;
  padding: 5px;
  padding-top: 12px;
  padding-bottom: 12px;
  margin-bottom: 0;
}

.md-checkbox {
  margin: 0;
  margin-right: 4px;
  top: 2px;
}


.dragup {
  background: linear-gradient(0deg, #fff 50%, #eee 50%);
}

.dragdown {
  background: linear-gradient(0deg, #eee 50%, #fff 50%);
}


.name:hover {
  background-color: rgb(48, 48, 48);
  cursor: pointer;
  color: white;
}

.edit .md-button {
  min-width: 24px;
  width: 24px;
  height: 20px;
  margin: 0;
  margin-top: 8px;
}

.edit-name {
  font-size: 14px;
  font-family: Roboto,Noto Sans,-apple-system,BlinkMacSystemFont,sans-serif;
  width: 75%;
  margin-left: -3px;
}

.task .md-card-header {
  padding: 12px;
}

.task .md-title {
  margin-top: 0 !important;
  font-size: 14px;
}

</style>