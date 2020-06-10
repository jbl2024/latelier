import { Meteor } from "meteor/meteor";
import calendarUtil from "/imports/ui/utils/calendar";


const fetchMeetings = (params) => {
  return new Promise((resolve, reject) => {
    if (!params || !params.projectId) reject(new Error("Invalid project"));
    Meteor.call(
      "meetings.findMeetings",
      params,
      (error, datas) => {
        resolve(datas);
        if (error) {
          reject(error);
        }
      }
    );
  });
};

const fetchMeeting = (params) => {
  return new Promise((resolve, reject) => {
    if (!params || !params.meetingId) reject(new Error("Invalid meeting"));
    Meteor.call(
      "meetings.get",
      params,
      (error, meeting) => {
        resolve(meeting);
        if (error) {
          reject(error);
        }
      }
    )
  });
};

export default {
  namespaced: true,
  state: {
    meetingsResults: {},
    selectedMeeting: null,
    currentMeeting: null
  },
  mutations: {
    updateMeetingsResults(state, meetingsResults) {
      state.meetingsResults = meetingsResults;
    },
    updateSelectedMeeting(state, selectedMeeting) {
      state.selectedMeeting = selectedMeeting;
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
    async fetchMeetings(context, params) {
      const datas = await fetchMeetings(params);
      context.commit("updateMeetingsResults", datas);
    },
    async fetchSelectedMeeting(context, params) {
      const meeting = await fetchMeeting(params);
      context.commit("updateSelectedMeeting", meeting);
    },
    async fetchCurrentMeeting(context, params) {
      const meeting = await fetchMeeting(params);
      context.commit("updateCurrentMeeting", meeting);
    },
    setSelectedMeeting(context, selectedMeeting) {
      context.commit("updateSelectedMeeting", selectedMeeting);
    }
  }
};