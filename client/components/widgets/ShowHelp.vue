<template>
  <div>
    <generic-dialog
      v-model="showDialog"
      :close-label="$t('Close')"
      max-width="520"
      :title="$t('Keyboard shortcuts')"
    >
      <template v-slot:content>
        <v-simple-table dense class="pt-4">
          <template v-slot:default>
            <tbody>
              <tr
                v-for="item in keys"
                :key="item.label"
              >
                <td>{{ item.label }}</td>
                <td class="text-right">
                  <span v-if="item.key" class="swt-white-kbk">{{ item.key }}</span>
                  <div v-if="item.keys">
                    <template v-for="key in item.keys">
                      <div :key="key" class="mt-2 mb-2">
                        <span class="swt-white-kbk">{{ key }}</span>
                      </div>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </template>
    </generic-dialog>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      keys: [{
        label: this.$t("Help screen"),
        key: "?"
      }, {
        label: this.$t("Search bar"),
        keys: ["/", "s"]
      }, {
        label: this.$t("Projects search bar"),
        key: "p"
      }, {
        label: this.$t("Add label on task"),
        key: "l"
      }, {
        label: this.$t("Toggle task fullscreen"),
        key: "m"
      }]
    };
  },
  computed: {
    showDialog: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    }
  },
  watch: {
    showDialog(show) {
      if (show) {
        document.addEventListener("keydown", () => {
          this.showDialog = false;
        }, {
          capture: true,
          once: true
        });
      }
    }
  }
};
</script>

<style scoped>
.swt-white-kbk {/* White Keyboard Key Style by www.superwebtricks.com */
color:#000;
margin:0 5px;
padding:1px 5px;
font-family:courier new;
font-size:1.2em;
border:1px #fff;
-webkit-border-radius:3px;
   -moz-border-radius:3px;
        border-radius:3px;
background:-webkit-gradient(
  linear,
  left top,
  right top,
  color-stop(0%, #fff),
  color-stop(25%, #fff)
/* White Keyboard Key Style by Showeblogin */);
background:-o-linear-gradient(left, #fff 0%, #fff 25%);
background:-moz-linear-gradient(left, #fff 0%, #fff 25%);
background:-webkit-linear-gradient(left, #fff 0%, #fff 25%);
background:-ms-linear-gradient(left, #fff 0%, #fff 25%);
background:linear-gradient(left, #fff 0%, #fff 25%);
-webkit-box-shadow:1px 0 1px 0 #999, 0 2px 0 2px lightGray, 0 2px 0 3px #666;
    -moz-box-shadow:1px 0 1px 0 #999, 0 2px 0 2px lightGray, 0 2px 0 3px #666;
             box-shadow:1px 0 1px 0 #999, 0 2px 0 2px lightGray, 0 2px 0 3px #666;
/* White Keyboard Key Style by www.superwebtricks.com */}
.swt-white-kbk:hover {opacity:1;cursor:pointer}
</style>
