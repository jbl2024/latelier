<template>
  <v-card class="mx-auto search-results" outlined>
    <v-tabs grow show-arrows>
      <v-tabs-slider color="accent" />
      <v-tab id="tab-properties">
        {{ $t("Tasks") }}
      </v-tab>
      <v-tab id="tab-notes">
        {{ $t("Projects") }}
      </v-tab>
      <v-tab id="tab-notes">
        {{ $t("Organizations") }}
      </v-tab>
      <v-tab id="tab-notes">
        {{ $t("Users") }}
      </v-tab>

      <v-tab-item>
        1
      </v-tab-item>
      <v-tab-item>
        1
      </v-tab-item>
      <v-tab-item>
        1
      </v-tab-item>
      <v-tab-item>
        1
      </v-tab-item>
    </v-tabs>

    <v-list-item three-line>
      <v-list-item-content>
        <div class="overline mb-4">
          {{ $t("Search results") }}
        </div>
        <v-list-item-title class="headline mb-1">
          Headline 5
        </v-list-item-title>
        <v-list-item-subtitle>
          Greyhound divisely hello coldly fonwderfully
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-card-actions>
      <v-btn text>
        Button
      </v-btn>
      <v-btn text>
        Button
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {};
</script>

<style scoped></style>
