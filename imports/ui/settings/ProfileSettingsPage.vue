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
            v-if="!isUploading && !attachmentsDisabled()"
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
          {{ getEmail(user) }}
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Avatars } from "/imports/api/users/avatars";
import { UserUtils } from "/imports/api/users/utils";

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
    async refreshUser() {
      try {
        const result = await Meteor.callAsync("users.getProfile");
        this.user = result;
      } catch (error) {
        this.$notifyError(error);
      }
    },

    async onUpload(e) {
      const file = e.target.files[0];
      await this.uploadFile(file);
    },

    async uploadFile(file) {
      const that = this;
      const transport = Meteor.settings.public.uploadTransport || "ddp";
      const upload = Avatars.insert({
        file: file,
        chunkSize: "dynamic",
        transport: transport,
        meta: {
          userId: Meteor.userId(),
          createdBy: Meteor.userId()
        }
      }, false);

      upload.on("start", function() {
        that.isUploading = true;
      });

      upload.on("end", async function(uploadError, fileObj) {
        that.isUploading = false;
        if (uploadError) {
          this.$notifyError(uploadError);
        } else {
          try {
            await Meteor.callAsync("avatars.setAvatar", { avatarId: fileObj._id });
            that.refreshUser();
          } catch (error) {
            that.$store.dispatch("notifyError", error);
          }
          that.file = null;
        }
      });
      upload.start();
    },

    async remove() {
      try {
        await Meteor.callAsync("avatars.clear");
        this.refreshUser();
      } catch (error) {
        this.$notifyError(error);
      }
    },

    getEmail(user) {
      return UserUtils.getEmail(user);
    },

    attachmentsDisabled() {
      return Meteor.settings.public.disableAttachments;
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
