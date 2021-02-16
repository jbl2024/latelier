import moment from "moment";
import i18n from "/imports/i18n/";

export default {
  nowDate(format) {
    return moment().format(format || "YYYY-MM-DD");
  },
  getWeekNumber(date) {
    return moment(date).format("w");
  },
  formatDate(date, format = null) {
    if (!date) return null;
    return moment(date).format(format || i18n.t("dates.format.date"));
  },
  formatDateTime(date, format = null) {
    if (!date) return null;
    return moment(date).format(format || i18n.t("dates.format.dateTime"));
  },
  formatDateDuration(date) {
    const now = moment();
    const noteDate = moment(date);
    const duration = moment
      .duration(now.diff(noteDate))
      .locale(i18n.t("dates.locale"));
    if (duration > 0) {
      return i18n.t("dates.duration.past", {
        duration: duration.humanize()
      });
    }
    return i18n.t("dates.duration.future", {
      duration: duration.humanize()
    });
  },
  displayDateInterval({ start, end, dateFormat, type }) {
    const format = dateFormat || i18n.t("dates.format.prettyDate");
    const dayFormat = "YYYY-MM-DD";
    const endDate = moment(end);
    const startDate = moment(start);
    const sameDay = moment(start).format(dayFormat) === moment(end).format(dayFormat);
    switch (type) {
      case "month": {
        return startDate.format(i18n.t("dates.format.prettyMonthAndDate"));
      }
      case "day": {
        return startDate.format(format);
      }
      case "hours": {
        return ` ${startDate.format("HH:mm")} - ${endDate.format("HH:mm")}`;
      }
      case "dateWithHours": {
        const intervalText = `dates.interval.dateWithHours.${sameDay ? "sameDay" : "differentDay"}`;
        return i18n.t(intervalText,
          {
            start: startDate.format(format),
            startHour: startDate.format("HH:mm"),
            end: endDate.format(format),
            endHour: endDate.format("HH:mm")
          });
      }
      default: {
        return i18n.t("dates.interval.date", { start: startDate.format(format), end: endDate.format(format) });
      }
    }
  }
};
