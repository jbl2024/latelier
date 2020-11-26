<template>
  <div v-if="isLoading">
    <v-progress-linear indeterminate />
  </div>
  <div v-else-if="isReady" class="project-import-wizard">
    <div class="project-wrapper">
      <div class="project">
        <v-stepper
          v-model="stepper"
          non-linear
          vertical
          class="stepper"
        >
          <v-stepper-step step="1" editable>
            {{ $t("project.import.wizard.project") }}
          </v-stepper-step>
          <v-stepper-content step="1">
            <v-list subheader two-line flat>
              <!-- Project name -->
              <v-list-item>
                <template>
                  <v-list-item-content>
                    <v-list-item-title>
                      <v-text-field
                        v-model="projectName"
                        :label="$t('project.import.projectName')"
                        hide-details="auto"
                        required
                      />
                    </v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-list-item>
              <!-- Organization -->
              <v-list-item>
                <template>
                  <v-list-item-content>
                    <v-list-item-title
                      v-if="!organizationId"
                    >
                      <v-select
                        v-model="projectOrganizationId"
                        :label="$t('project.import.projectOrganization')"
                        :items="organizations"
                        hide-details="auto"
                        item-text="name"
                        item-value="_id"
                      >
                        <template v-slot:prepend-item>
                          <v-list-item
                            ripple
                            @click.stop="projectOrganizationId = null"
                          >
                            <v-list-item-content>
                              <v-list-item-title>
                                {{ $t("project.import.withoutOrganization") }}
                              </v-list-item-title>
                            </v-list-item-content>
                          </v-list-item>
                          <v-divider />
                        </template>
                      </v-select>
                      <!-- Preselected organization -->
                    </v-list-item-title>
                    <v-list-item-title v-else-if="selectedOrganization">
                      <v-text-field
                        :label="$t('project.import.projectOrganization')"
                        :value="selectedOrganization.name"
                        :readonly="true"
                        hide-details="auto"
                      />
                    </v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-list-item>
            </v-list>
            <div class="pt-2">
              <v-btn
                color="primary"
                @click="stepper = 2"
              >
                {{ $t("Next") }}
              </v-btn>
            </div>
          </v-stepper-content>

          <v-stepper-step step="2" editable>
            {{ $t("project.import.itemsToImport") }}
          </v-stepper-step>

          <v-stepper-content step="2">
            <!-- Items to import -->
            <v-list subheader two-line flat>
              <v-list-item-group
                v-model="selectedItems"
                multiple
              >
                <v-list-item
                  v-for="item in items"
                  :key="item"
                  :value="item"
                >
                  <template
                    v-slot:default="{ active }"
                  >
                    <v-list-item-action>
                      <v-checkbox
                        :input-value="active"
                        color="accent"
                      />
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{
                          $t(
                            `project.import.items.${item}.title`
                          )
                        }}
                        <span v-if="getItemCount(item)">
                          {{ `(${getItemCount(item)})` }}
                        </span>
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        {{ $t(`project.import.items.${item}.description`)
                        }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </template>
                </v-list-item>
              </v-list-item-group>
            </v-list>
            <div class="pt-2">
              <v-btn
                v-if="organizationId"
                color="primary"
                @click="stepper = 3"
              >
                {{ $t("Next") }}
              </v-btn>
            </div>
          </v-stepper-content>

          <v-stepper-step v-if="organizationId" step="3" editable>
            {{ $t("Access rights") }}
          </v-stepper-step>

          <v-stepper-content v-if="organizationId" step="3">
            <v-list class="elevation-1">
              <v-list-item
                @click="allowOrganization = !allowOrganization"
              >
                <v-list-item-avatar>
                  <v-icon>
                    {{ getVisibilityIcon(allowOrganization) }}
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ getVisibilityText(allowOrganization) }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-switch
                    v-model="allowOrganization"
                    color="accent"
                    @click="allowOrganization = !allowOrganization"
                  />
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-stepper-content>
        </v-stepper>
      </div>
    </div>
  </div>
</template>
<script>
import { Organizations } from "/imports/api/organizations/organizations.js";
import deepCopy from "/imports/ui/utils/deepCopy";
import { items } from "/imports/api/projects/importExport/";

export default {
  props: {
    project: {
      type: Object,
      default: null
    },
    organizationId: {
      type: String,
      default: null
    },
    metadatas: {
      type: Object,
      default: null
    },
    importOptions: {
      type: Object,
      default() {
        return {
          organizations: null,
          project: {
            name: "",
            organizationId: null
          },
          items: []
        };
      }
    }
  },
  data() {
    return {
      items,
      projectName: "",
      projectOrganizationId: null,
      stepper: 1,
      allowOrganization: true,
      isLoading: false,
      metas: null,
      itemsToExport: [],
      selectedItems: []
    };
  },
  computed: {
    isReady() {
      return Boolean(
        !this.isLoading
        && this.project
        && Array.isArray(this.organizations)
      );
    },
    selectedImportedOptions() {
      return [
        this.selectedItems,
        this.projectName,
        this.projectOrganizationId,
        this.allowOrganization
      ];
    },
    selectedOrganization() {
      if (!this.organizations) return null;
      return this.organizations.find(
        (organization) => organization._id === this.organizationId
      );
    },
    attachmentsDisabled() {
      return Meteor.settings?.public?.disableAttachments;
    }
  },
  watch: {
    project: {
      immediate: true,
      async handler() {
        this.projectName = this.project.name;
        this.organizations = Organizations.find(
          {},
          {
            sort: { name: 1 }
          }
        ).fetch();
      }
    },
    metadatas: {
      immediate: true,
      async handler() {
        if (this?.metadatas?.items) {
          this.metas = this?.metadatas?.items;
          const availableItems = Object.keys(
            this.metadatas.items
          ).filter((key) => this.metadatas.items[key]?.count > 0);

          let foundItems = this.items.filter((item) => availableItems.includes(item));
          if (this.attachmentsDisabled) {
            foundItems = foundItems.filter(
              (item) => item !== "attachments"
            );
          }
          this.items = foundItems;
        }
        this.selectedItems = this.items.slice();
      }
    },
    organizationId: {
      immediate: true,
      handler(organizationId) {
        if (organizationId) {
          this.projectOrganizationId = organizationId;
        }
      }
    },
    selectedImportedOptions: {
      immediate: true,
      handler(selectedOptions) {
        const [
          selectedItems,
          projectName,
          projectOrganizationId,
          allowOrganization
        ] = selectedOptions;
        this.$emit("update:import-options", {
          ...deepCopy(this.importOptions),
          project: {
            name: projectName,
            organizationId: projectOrganizationId,
            allowOrganization: allowOrganization
          },
          items: selectedItems
        });
      }
    }
  },
  methods: {
    getItemCount(item) {
      if (
        !this?.metadatas?.items
        || !this.metadatas.items[item]
        || !this.metadatas.items[item]?.count
      ) return null;
      return this.metadatas.items[item].count;
    },
    getVisibilityIcon(allowOrganization) {
      if (allowOrganization) {
        return "mdi-eye";
      }
      return "mdi-eye-off";
    },
    getVisibilityText(allowOrganization) {
      if (allowOrganization) {
        return this.$t("Organization");
      }
      return this.$t("The project is private");
    }
  }
};
</script>
