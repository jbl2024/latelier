<template>
  <div class="canvas-item">
    <v-card>
      <v-card-title primary-title>
        <div>
            <div class="canvas-title" slot="activator">
              {{ title }}
            </div>
            <div class="canvas-headline">
              <slot name="headline"></slot>
            </div>
        </div>
      </v-card-title>
      <v-card-text>
        <div
          v-if="!editContent"
          @click="startUpdateContent"
          class="content"
          v-html="markDown(content)"
        ></div>
        <div v-if="editContent" class="edit-content">
          <v-textarea
            ref="content"
            @focus.native="$event.target.select()"
            label="Contenu"
            outline
            v-model="content"
            @keyup.ctrl.enter="updateContent"
          ></v-textarea>
          <v-btn icon flat @click.native="updateContent">
            <v-icon>check_circle</v-icon>
          </v-btn>
          <v-btn icon flat @click.native="cancelUpdateContent">
            <v-icon>cancel</v-icon>
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import MarkdownMixin from "/imports/ui/mixins/MarkdownMixin.js";

export default {
  mixins: [MarkdownMixin],
  watch: {
    item: {
      immediate: true,
      handler(item) {
        this.content = item;
      }
    }
  },
  props: {
    title: {
      type: String,
      default: "title"
    },
    headline: {
      type: String,
      default: ""
    },
    item: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      content: "",
      editContent: false
    };
  },
  methods: {
    startUpdateContent() {
      this.editContent = true;
      this.$nextTick(() => this.$refs.content.focus());
    },
    updateContent() {
      this.$emit("update:item", this.content);
      this.editContent = false;
    },
    cancelUpdateContent() {
      this.editContent = false;
    }
  }
};
</script>

<style scoped>
.canvas-title {
  font-size: 18px;
}

.canvas-headline {
  font-size: 12px;
  color: #546E7A;
  min-height: 90px;
}

.content {
  border: 1px solid #eee;
  width: 100%;
  min-height: 220px;
  cursor: text;
}
.edit-content {
  min-height: 220px;
}
</style>