<template>
  <div>
    <new-example ref="newExample" @created="refresh()" />
    <edit-example ref="editExample" @updated="refresh()" />
    <v-container fluid>
      <v-row align="stretch" no-gutters>
        <v-col cols="12" xs="12" sm="4" md="4" class="pr-1 pl-1">
          <v-card>
            <v-toolbar dense dark color="primary">
              <span class="title">{{ $t("Examples") }}</span>
              <v-spacer />
              <template v-if="isAdmin">
                <v-btn icon @click="refresh()">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
                <v-btn icon @click="newExample()">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </template>
            </v-toolbar>
            <v-list two-line dense class="list">
              <v-text-field
                :label="$t('Search') + '...'"
                class="pr-6 pl-6"
                single-line
                append-icon="mdi-magnify"
                clearable
                @input="debouncedFilter"
              />
              <v-list-item-group>
                <v-list-item
                  v-for="example in examples"
                  :key="example._id"
                  @click="openExample(example)"
                >
                  <v-list-item-avatar>
                    <v-icon color="teal">
                      mdi-chart-donut
                    </v-icon>
                  </v-list-item-avatar>

                  <v-list-item-content class="pointer">
                    <v-list-item-title>{{ example.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ htmlToText(example.description) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>

                  <v-list-item-action v-if="isAdmin">
                    <v-menu bottom left class="menu">
                      <template v-slot:activator="{ on }">
                        <v-btn
                          icon
                          text
                          color="grey darken-1"
                          v-on="on"
                          @click.native.stop
                        >
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list dense>
                        <v-list-item @click.stop="editExample(example)">
                          <v-list-item-icon>
                            <v-icon>mdi-pencil</v-icon>
                          </v-list-item-icon>
                          <v-list-item-title>
                            {{ $t("Edit") }}
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="cloneExample(example)">
                          <v-list-item-icon>
                            <v-icon>mdi-content-copy</v-icon>
                          </v-list-item-icon>
                          <v-list-item-title>
                            {{ $t("Clone") }}
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteExample(example)">
                          <v-list-item-icon>
                            <v-icon>mdi-delete</v-icon>
                          </v-list-item-icon>
                          <v-list-item-title>
                            {{ $t("Delete") }}
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-list-item-action>
                </v-list-item>
              </v-list-item-group>
            </v-list>
            <div class="text-xs-center">
              <v-pagination
                v-if="pagination.totalPages > 1"
                v-model="page"
                :length="pagination.totalPages"
              />
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" xs="12" sm="8" md="8">
          <template v-if="selectedExample">
            <div class="wrapper">
              <example-editor :example="selectedExample" />
            </div>
          </template>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { Meteor } from "meteor/meteor";
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";
import * as htmlToText from "@mxiii/html-to-text";
import debounce from "lodash/debounce";
import NewExample from "./NewExample";
import EditExample from "./EditExample";
import ExampleEditor from "./ExampleEditor";

export default {
  name: "ExamplesList",
  components: {
    NewExample,
    EditExample,
    ExampleEditor
  },
  mixins: [TextRenderingMixin],
  data() {
    return {
      search: "",
      debouncedFilter: null,
      examples: [],
      selectedExample: null,
      selectedExampleIndex: null,
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      },
      filterOnline: false,
      filterAway: false,
      mode: "view"
    };
  },
  computed: {
    ...mapState(["isAdmin"])
  },
  watch: {
    page() {
      this.refresh();
    },
    search() {
      if (this.page > 1) {
        this.page = 1;
      } else {
        this.refresh();
      }
    }
  },
  mounted() {
    this.refresh();
  },
  created() {
    this.debouncedFilter = debounce((val) => {
      this.search = val;
    }, 400);
  },
  methods: {
    refresh() {
      Meteor.call(
        "bpmnExamples.find",
        {
          page: this.page,
          name: this.search
        },
        (error, result) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = result.totalPages;
          this.examples = result.data;
        }
      );
    },

    newExample() {
      this.$refs.newExample.open();
    },

    openExample(example) {
      this.selectedExample = example;
      this.$emit("select", example);
    },

    deleteExample(example) {
      this.$confirm(this.$t("Delete example?"), {
        title: example.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call(
            "bpmnExamples.remove",
            { exampleId: example._id },
            (error) => {
              if (error) {
                this.$notifyError(error);
                return;
              }
              this.$notify(this.$t("Diagram deleted"));
              this.refresh();
            }
          );
        }
      });
    },

    editExample(example) {
      this.$refs.editExample.open(example);
    },

    cloneExample(example) {
      this.$confirm(this.$t("Clone diagram?"), {
        title: example.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Clone")
      }).then((res) => {
        if (res) {
          Meteor.call(
            "bpmnExamples.clone",
            { exampleId: example._id },
            (error) => {
              if (error) {
                this.$notifyError(error);
                return;
              }
              this.$notify(this.$t("Diagram cloned"));
              this.refresh();
            }
          );
        }
      });
    },
    htmlToText(html) {
      return htmlToText.fromString(html);
    }
  }
};
</script>

<style scoped>
.empty {
  margin-top: 24px;
}

.wrapper {
  position: relative;
  height: 480px;
}

.list {
  min-height: 389px;
}

</style>
