<template>
  <div>
    <template v-if="user">
      <v-subheader>{{ $t("Profile") }}</v-subheader>

      <div class="elevation-1 card">
        <div class="center pa-8">
          <author-avatar big :user-id="user" />
        </div>
        <div class="pa-4">
          <input
            v-if="!isUploading"
            type="file"
            :disabled="isUploading"
            @change="onUpload"
          >
        </div>
        <div v-if="user.profile.avatar" class="pa-4 center">
          <v-btn text @click="remove()">
            {{ $t("Delete") }}
          </v-btn>
        </div>
        <v-divider />
        <div class="center title pa-8">
          {{ user.emails[0].address }}
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { Avatars } from "/imports/api/users/avatars";

export default {
  props: {},

  data() {
    return {
      user: null,
      isUploading: false
    };
  },
  mounted() {
    this.refreshUser();
  },
  methods: {
    refreshUser() {
      Meteor.call("users.getProfile", (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.user = result;
      });
    },

    onUpload(e) {
      const file = e.target.files[0];
      this.uploadFile(file);
    },

    uploadFile(file) {
      const that = this;
      const transport = Meteor.settings.public.uploadTransport || "ddp";
      const upload = Avatars.insert(
        {
          file: file,
          streams: "dynamic",
          chunkSize: "dynamic",
          transport: transport,
          meta: {
            userId: Meteor.userId(),
            createdBy: Meteor.userId()
          }
        },
        false
      );

      upload.on("start", function() {
        that.isUploading = true;
      });

      upload.on("end", function(uploadError, fileObj) {
        that.isUploading = false;
        if (uploadError) {
          this.$store.dispatch("notifyError", uploadError);
        } else {
          Meteor.call(
            "avatars.setAvatar",
            { avatarId: fileObj._id },
            (error) => {
              if (error) {
                that.$store.dispatch("notifyError", error);
                return;
              }
              that.refreshUser();
            }
          );
          that.file = null;
        }
      });
      upload.start();
    },

    remove() {
      Meteor.call("avatars.clear", (error) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.refreshUser();
      });
    }
  }
};
</script>

<style scoped>
.card {
  background-color: white;
  margin: 16px;
  max-width: 400px;
}
.title {
  font-size: 16px;
}
.center {
  text-align: center;
}
</style>
