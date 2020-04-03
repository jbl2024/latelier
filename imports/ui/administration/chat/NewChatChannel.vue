<template>
  <v-dialog
    v-model="showDialog"
    class="detail"
    max-width="640"
    :fullscreen="$vuetify.breakpoint.xsOnly"
  >
    <v-card class="new-chat-channel">
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
          <span>{{ $t("New chat channel") }}</span>
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form v-model="valid" class="form" @submit.prevent>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm6 md6>
                <v-text-field v-model="chatChannel.name" required label="Nom de la conversation*"/>
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field v-model="chatChannel.channel" required label="Groupe ou canal*"/>
              </v-flex>
              <v-flex xs12>
                <v-text-field v-model="chatChannel.projectId" label="Projet associé"/>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
        <small>*indique un champ obligatoire</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        {{ valid }}
        <v-btn text @click.native="close()">
          {{ this.$t("Close") }}
        </v-btn>
        <v-btn color="primary" :disabled="!valid" @click.native="create()">
          {{ $t("Create") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {},
  i18n: {
    messages: {
      en: {
        "New chat channel": "New chat channel",
        "Chat channel created": "Chat channel created"
      },
      fr: {
        "New chat channel": "Nouvelle conversation",
        "Chat channel created": "Conversation créée"
      }
    }
  },
  data() {
    return {
      valid: false,
      showDialog: false,
      chatChannel: {
        name: "",
        channel: "",
        projectId: null
      }
    };
  },
  methods: {
    open() {
      this.showDialog = true;
    },
    close() {
      this.showDialog = false;
    },
    create() {
      Meteor.call("chatChannels.create", this.chatChannel, (error) => {
        if (error) {
          this.$notifyError(error);
          return;
        }
        this.$notify(this.$t("Chat channel created"));
        this.close();
        this.$emit("created");
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
