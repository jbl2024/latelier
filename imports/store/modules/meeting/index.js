import { Meteor } from "meteor/meteor";
import calendarUtil from "/imports/ui/utils/calendar";

export default {
  namespaced: true,
  state: {
    meetingsResults: {}
  },
  mutations: {
    updateMeetingsResults(state, meetingsResults) {
      state.meetingsResults = meetingsResults;
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
        console.log(params);
        Meteor.call(
          "meetings.findMeetings",
          params,
          (error, datas) => {
            console.log(datas);
            context.commit("updateMeetingsResults", datas);
            resolve(datas);
            if (error) {
              reject(error);
            }
          }
        );
    })
        
    }
  }
};