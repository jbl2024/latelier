<template>
  <div class="canvas-item">
    <v-container>
      <v-row>
        <v-col cols="12" sm="4">
          <div slot="activator" class="canvas-title">
            {{ title }}
          </div>
          <div class="canvas-headline">
            <slot name="headline" />
          </div>
        </v-col>
        <v-col cols="12" sm="8" class="">
          <div
            v-if="!editContent"
            class="content tiptap-editor-view"
            @click="startUpdateContent"
            v-html="linkifyHtml(content)"
          />
          <div v-if="editContent" class="edit-content">
            <rich-editor
              v-model="content"
              autofocus
              @submit="updateContent"
              @click-outside="updateContent"
            />
            <v-btn icon text @click.native.stop="updateContent">
              <v-icon color="green">
                mdi-check-circle
              </v-icon>
            </v-btn>
            <v-btn icon text @click.native.stop="cancelUpdateContent">
              <v-icon color="red">
                mdi-close-circle
              </v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <v-divider class="divider" />
    </v-container>
  </div>
</template>

<script>
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";

export default {
  mixins: [TextRenderingMixin],
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
      savedContent: "",
      editContent: false
    };
  },
  watch: {
    item: {
      immediate: true,
      handler(item) {
        this.content = item;
      }
    }
  },
  methods: {
    startUpdateContent() {
      this.editContent = true;
      this.savedContent = this.content;
    },
    updateContent() {
      this.$emit("update:item", this.content);
      this.$emit("save");
      this.editContent = false;
    },
    cancelUpdateContent() {
      this.editContent = false;
      this.content = this.savedContent;
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
  color: #546e7a;
  min-height: 90px;
}

.content {
  width: 100%;
  min-height: 220px;
  cursor: text;
  background-color: white;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  transition: box-shadow 0.5s ease, opacity 0.5s ease,
    background-color 0.5s ease;
  padding: 24px;
  font-size: 16px;
}

.content:hover {
  box-shadow: 0px 8px 8px rgba(0, 0, 0, 0.25);
  cursor: text;
}

.edit-content {
  min-height: 220px;
  width: 100%;
  min-height: 220px;
  cursor: text;
  background-color: white;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  transition: box-shadow 0.5s ease, opacity 0.5s ease,
    background-color 0.5s ease;
   padding: 12px;
  font-size: 16px;
}

.divider {
  margin-top: 50px;
}
</style>
