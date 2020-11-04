<template>
  <div v-if="isLoading">
    Chargement
  </div>  
  <div v-else-if="isReady" class="project-import-wizard">
   <v-list
      subheader
      two-line
      flat
    >
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
            <v-list-item-title>
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
                        {{ $t('project.import.withoutOrganization') }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider></v-divider>
                </template>
              </v-select>
            </v-list-item-title>
          </v-list-item-content>
        </template>
      </v-list-item>
    </v-list>
    <!-- Items to import -->
    <v-list
      subheader
      two-line
      flat
    >
      <v-subheader>
        {{ $t("project.import.itemsToImport") }}
      </v-subheader>
      <v-list-item-group
        v-model="selectedItems"
        multiple
      >
        <v-list-item v-for="item in itemsToExport" :value="item" :key="item">
          <template v-slot:default="{ active, }">
            <v-list-item-action>
              <v-checkbox
                :input-value="active"
                color="accent"
              ></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t(`project.import.items.${item}.title`) }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ $t(`project.import.items.${item}.description`) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </template>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>
<script>
import { Organizations } from "/imports/api/organizations/organizations.js";
import { Permissions } from "/imports/api/permissions/permissions";
import ZipProject from "/imports/api/projects/importExport/ZipProject";
import deepCopy from "/imports/ui/utils/deepCopy";

export default {
  props: {
    zippedProject: {
      type: ZipProject,
      default: null
    },
    importOptions: {
      type: Object,
      default() {
        return {
          project: {
            name: "",
            organizationId: null
          },
          items: []
        };
      }
    }
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      organizations() {
        return [];
      }
    },
    organizations() {
      return Organizations.find(
        {},
        {
          sort: { name: 1 }
        }
      );
    }
  },
  data () {
    return {
      projectName: "",
      projectOrganizationId: null,
      isLoading: false,
      project: null,
      itemsToExport: [],
      selectedItems: [],
    }
  },
  computed: {
    isReady() {
      return Boolean(
        !this.isLoading &&
        this.zippedProject && 
        Array.isArray(this.organizations)
      );
    },
    selectedImportedOptions() {
      return [this.selectedItems, this.projectName, this.projectOrganizationId];
    }
  },
  methods: {
    canImport(type) {
      return this.itemsToExport.includes(type);
    }
  },
  watch: {
    zippedProject: {
      immediate: true,
      async handler(zippedProject) {
        this.project = await zippedProject.getProject();
        this.itemsToExport = zippedProject.getItemsToExport();
        this.selectedItems = this.itemsToExport.slice();
        this.projectName = this.project.name;
      }
    },
    selectedImportedOptions: {
      immediate: true,
      handler(selectedOptions) {
        const [selectedItems, projectName, projectOrganizationId] = selectedOptions;
        this.$emit("update:import-options", Object.assign({}, deepCopy(this.importOptions), {
          project: {
            name: projectName,
            organizationId: projectOrganizationId
          },
          items: selectedItems
        }));
      }
    }
  }
}
</script>