<template>
  <div class="chat">
    <v-dialog
      v-model="showChatChannelDetail"
      eager
      class="detail"
      max-width="640"
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <chat-channel-detail
        ref="chatChannelDetail"
        @close="closeDetail()"
        @saved="findChatChannels()"
      />
    </v-dialog>
    <new-chat-channel ref="newChatChannel" @created="findChatChannels()" />
    <v-card class="center">
      <v-card-text>
        <v-container>
          <v-row>
            <v-col>
              <v-list subheader>
                <v-subheader inset>
                  {{ pagination.totalItems }} conversations
                  <v-btn text icon @click="$refs.newChatChannel.open()">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </v-subheader>
                <template v-for="channel in chatChannels">
                  <v-list-item :key="channel._id" @click="openDetail(channel)">
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ channel.name }}
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn icon ripple @click.stop="removeChatChannel(channel)">
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
import NewChatChannel from "./NewChatChannel";
import ChatChannelDetail from "./ChatChannelDetail";
export default {
  components: {
    NewChatChannel,
    ChatChannelDetail
  },
  data() {
    return {
      chatChannels: [],
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
    methods: {
    findChatChannels() {
      Meteor.call("admin.findChatChannels", {
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

    removeChatChannel(channel) {
      /*
      this.$confirm(this.$t("Delete chat?"), {
        title: user.emails[0].address,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call("admin.removeUser", user._id, (error) => {
            if (error) {
              this.$notifyError(error);
              return;
            }
            this.$notify(this.$t("User deleted"));
            this.findUsers();
          });
        }
      }); */
    },
    calculateTotalPages() {
      if (this.pagination.rowsPerPage == null || this.pagination.totalItems == null) {
        return 0;
      }
      return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
    },
    openDetail(channel) {
      this.$refs.chatChannelDetail.open(channel);
      this.showChatChannelDetail = true;
    },
    closeDetail() {
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