<template>
  <v-card v-if="channel" class="chat-channel-detail">
    <confirm-dialog
      :active.sync="showConfirmDeleteChatChannelDialog"
      title="Confirmer la suppression ?"
      content="La conversation sera définitivement supprimé"
      confirm-text="Supprimer"
      cancel-text="Annuler"
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
        <span>{{ channel.name }}</span>
      </v-toolbar-title>
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
    </v-toolbar>
    <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs12 sm6 md6>
              <v-text-field v-model="channel.name" required label="Nom de la conversation*"/>
            </v-flex>
            <v-flex xs12 sm6 md6>
              <v-text-field v-model="channel.channel" required label="Groupe ou canal*"/>
            </v-flex>
            <v-flex xs12>
              <v-text-field v-model="channel.projectId" label="Projet associé"/>
            </v-flex>
          </v-layout>
        </v-container>
      <small>*indique un champ obligatoire</small>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn text @click.native="close()">
        {{ this.$t("Close") }}
      </v-btn>
      <v-btn color="primary" @click.native="save()">
        Mettre à jour
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  i18n: {
    messages: {
      en: {
        "Chat channel updated": "Chat channel updated"
      },
      fr: {
        "Chat channel updated": "Conversation mise à jour"
      }
    }
  },
  data() {
    return {
      channel: null,
      showConfirmDeleteChatChannelDialog: false
    };
  },
  methods: {
    open(channel) {
      this.channel = channel;
    },
    close() {
      this.$emit("close");
    },
    save() {
      Meteor.call('chatChannels.update', this.channel, (error) => {
        if (error) {
          this.$notifyError(error);
          return;
        }
        this.$notify(this.$t("Chat channel updated"));
        this.$emit("saved");
        this.$emit("close");
      })
    },
    onCancelDeleteChatChannel() {},
    onConfirmDeleteChatChannel() {
      // Meteor.call('chatChannels.remove', this.chatChannel_id)
      this.$emit("saved");
      this.$emit("close");
    }
  }
};
</script>
<style scoped>
  .deactivated {
    font-weight: bold;
  }
</style>
