import { Meteor } from "meteor/meteor";
import calendarUtil from "/imports/ui/utils/calendar";

export default {
  namespaced: true,
  state: {
    meetingsResults: {},
    currentMeeting: null
  },
  mutations: {
    updateMeetingsResults(state, meetingsResults) {
      state.meetingsResults = meetingsResults;
    },
    updateCurrentMeeting(state, currentMeeting) {
      state.currentMeeting = currentMeeting;
    }
  },
  getters: {
    meetingsByProjectId: (state) => (projectId) => {
      if (!Array.isArray(state?.meetingsResults?.data)) return [];
      return state.meetingsResults.data.filter((meeting) => meeting.projectId === projectId);
    },
    meetingsEventsByProjectId: (state, getters) => (projectId) => {
      const meetings = getters.meetingsByProjectId(projectId);
      return calendarUtil.formatMeetingsAsEvents(meetings);
    }
  },
  actions: {
    fetchMeetings(context, params) {
      return new Promise((resolve, reject) => {
        if (!params || !params.projectId) reject(new Error("Invalid project"));
        Meteor.call(
          "meetings.findMeetings",
          params,
          (error, datas) => {
            context.commit("updateMeetingsResults", datas);
            resolve(datas);
            if (error) {
              reject(error);
            }
          }
        );
      });
    },
    fetchCurrentMeeting(context, params) {
      return new Promise((resolve, reject) => {
        if (!params || !params.meetingId) reject(new Error("Invalid meeting"));
        Meteor.call(
          "meetings.get",
          params,
          (error, meeting) => {
            context.commit("updateCurrentMeeting", meeting);
            resolve(meeting);
            if (error) {
              reject(error);
            }
          }
        )
      });
    },
    setCurrentMeeting(context, currentMeeting) {
      context.commit("updateCurrentMeeting", currentMeeting);
    }
  }
};