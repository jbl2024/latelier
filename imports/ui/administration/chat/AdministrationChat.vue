<template>
  <div class="chat">
    <!-- Création / Mise à jour d'une conversation -->
    <v-dialog
      v-model="showChatChannelDetail"
      eager
      class="detail"
      max-width="640"
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <chat-channel-detail
        :key="showChatChannelDetail"
        :chat-channel="selectedChatChannel"
        @close="closeChatChannelDetail()"
        @created="findChatChannels()"
        @saved="findChatChannels()"
      />
    </v-dialog>
    <v-card class="center">
      <v-card-text>
        <v-container>
          <v-row>
            <v-col>
              <v-list subheader>
                <v-subheader inset>
                  {{ pagination.totalItems }} conversations
                  <!-- Rajouter click new conversation -->
                  <v-btn text icon @click="saveChatChannel(null)">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </v-subheader>
                <template v-for="chatChannel in chatChannels">
                  <v-list-item :key="chatChannel._id" @click="saveChatChannel(chatChannel)">
                    <v-list-item-avatar>
                      <v-icon>mdi-chat</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ chatChannel.name }}
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn icon ripple @click.stop="removeChatChannel(chatChannel)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </template>
              </v-list>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="text-xs-center">
                <v-pagination
                  v-if="pagination.totalPages > 0"
                  v-model="page"
                  :length="pagination.totalPages"
                />
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import ChatChannelDetail from "./ChatChannelDetail";
export default {
  components: {
    ChatChannelDetail
  },
  data() {
    return {
      chatChannels: [],
      selectedChatChannel: null,
      showChatChannelDetail: false,
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      },
    };
  },
  watch: {
    page() {
      this.findChatChannels();
    },
    search() {
      if (this.page > 1) {
        this.page = 1;
      } else {
        this.findChatChannels();
      }
    }
  },
  i18n: {
    messages: {
      en: {
        "Delete chat channel?": "Delete chat channel?",
        "Chat channel deleted": "Chat channel deleted"
      },
      fr: {
        "Delete chat channel?": "Supprimer la conversation?",
        "Chat channel deleted": "Conversation supprimée"
      }
    }
  },
  methods: {
    findChatChannels() {
      Meteor.call("chatChannels.load", {
        page: this.page
      }, (error, result) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = this.calculateTotalPages();
          this.chatChannels = result.data;
        }
      );
    },

    removeChatChannel(chatChannel) {
      this.$confirm(this.$t("Delete chat channel?"), {
        title: chatChannel.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call("chatChannels.remove", {chatChannelId: chatChannel._id}, (error) => {
            if (error) {
              this.$notifyError(error);
              return;
            }
            this.$notify(this.$t("Chat channel deleted"));
            this.findChatChannels();
          });
        }
      });
    },
    calculateTotalPages() {
      if (this.pagination.rowsPerPage == null || this.pagination.totalItems == null) {
        return 0;
      }
      return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
    },
    saveChatChannel(chatChannel) {
      this.selectedChatChannel = chatChannel;
      this.showChatChannelDetail = true;
    },
    closeChatChannelDetail() {
      this.selectedChatChannel = null;
      this.showChatChannelDetail = false;
    },
  },
  mounted() {
    this.findChatChannels();
  },
}
</script>
<style scoped>
  .chat {
    background-color: #e5e5e5;
  }
  .center {
    max-width: 800px;
    margin: 0 auto;
    margin-top: 24px;
  }
</style>