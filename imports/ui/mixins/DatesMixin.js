import moment from "moment";

export default {
  methods: {
    formatDate(date) {
      if (!date) return null;
      return moment(date).format(this.$t("dates.format.date"));
    },
    formatDateTime(date) {
      if (!date) return null;
      return moment(date).format(this.$t("dates.format.dateTime"));
    },
    formatDateDuration(date) {
      const now = moment();
      const noteDate = moment(date);
      const duration = moment
        .duration(now.diff(noteDate))
        .locale(this.$t("dates.locale"));
      if (duration > 0) {
        return this.$t("dates.duration.past", {
          duration: duration.humanize()
        });
      }
      return this.$t("dates.duration.future", {
        duration: duration.humanize()
      });
    }
  }
};
