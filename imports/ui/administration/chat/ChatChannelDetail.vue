<template>
  <v-card class="chat-channel-detail">
    <confirm-dialog
      v-if="!isNew"
      :active.sync="showConfirmDeleteChatChannelDialog"
      :title="$t('Confirm deletion?')"
      :content="$t('chat.channels.deleteConfirmContent')"
      :confirm-text="$t('Delete')"
      :cancel-text="$t('Cancel')"
      @cancel="onCancelDeleteChatChannel"
      @confirm="onConfirmDeleteChatChannel"
    />
    <v-toolbar dark color="primary">
      <v-btn
        v-shortkey="['esc']"
        icon
        text
        @click="close()"
        @shortkey="close()"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>
        <span>
          {{ name ? name : $t("chat.channels.new") }}
        </span>
      </v-toolbar-title>
      <!-- Menu (Suppression) -->
      <template v-if="!isNew">
        <v-spacer />
        <v-menu bottom left>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="showConfirmDeleteChatChannelDialog = true">
              <v-list-item-title>{{ this.$t("Delete") }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-toolbar>
    <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs12 sm6 md6>
              <v-text-field v-model="name" required :label="$t('chat.channels.fields.name')"/>
            </v-flex>
            <v-flex xs12 sm6 md6>
              <v-text-field v-model="channel" required :label="$t('chat.channels.fields.channel')"/>
            </v-flex>
            <v-flex xs12>
              <chat-project-autocomplete v-model="project">
              </chat-project-autocomplete>
            </v-flex>
          </v-layout>
        </v-container>
      <small>
        {{ $t("validation.requiredHint") }}
      </small>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn text @click.native="close()">
        {{ this.$t("Close") }}
      </v-btn>
      <v-btn color="primary" @click.native="save()">
        {{ isNew ? $t("Create") : $t('Update') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import ChatProjectAutocomplete from './ChatProjectAutocomplete';
export default {
  components: {
    ChatProjectAutocomplete
  },
  props: {
    chatChannel: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      name: this.chatChannel ? this.chatChannel.name : '',
      channel: this.chatChannel ? this.chatChannel.channel : '',
      projectId: this.chatChannel ? this.chatChannel.projectId : null,
      project: this.chatChannel && this.chatChannel.projectId ? {_id: this.chatChannel.projectId} : null,
      showConfirmDeleteChatChannelDialog: false
    };
  },
  computed: {
    isNew() {
      return this.chatChannel === null;
    }
  },
  methods: {
    close() {
      this.$emit("close");
    },
    save() {
      this.isNew ? this.create() : this.update();
    },
    create() {
      const newChatChannel = {
        name: this.name,
        channel: this.channel,
        projectId: this.project && this.project._id ? this.project._id : null
      };
      Meteor.call("chatChannels.create", newChatChannel, (error) => {
        if (error) {
          this.$notifyError(error);
          return;
        }
        this.$notify(this.$t("chat.channels.created"));
        this.close();
        this.$emit("created");
      });
    },
    update() {
      const updatedChatChannel = {
        id: this.chatChannel._id,
        name: this.name,
        channel: this.channel,
        projectId: this.project && this.project._id ?this.project._id : null
      };
      Meteor.call('chatChannels.update', updatedChatChannel, (error) => {
        if (error) {
          this.$notifyError(error);
          return;
        }
        this.$notify(this.$t("chat.channels.updated"));
        this.close();
        this.$emit("saved");
      });
    },
    remove() {

    },
    onCancelDeleteChatChannel() {},
    onConfirmDeleteChatChannel() {
      Meteor.call("chatChannels.remove", {chatChannelId: this.chatChannel._id}, (error) => {
        if (error) {
          this.$notifyError(error);
          return;
        }
        this.$notify(this.$t("chat.channels.deleted"));
        this.$emit("saved");
        this.$emit("close");
      });
    }
  }
};
</script>
<style scoped>
  .deactivated {
    font-weight: bold;
  }
</style>
