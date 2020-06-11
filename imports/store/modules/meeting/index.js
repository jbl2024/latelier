import { Meteor } from "meteor/meteor";
import moment from "moment";


const formatMeetingsAsEvents = (meetings) => {
  const dateFormat = "YYYY-MM-DD HH:mm";
  return meetings.filter((meeting) => {
    return meeting.startDate && meeting.endDate;
  }).map((meeting) => {
    return {
      id: meeting._id,
      name: meeting.name,
      description: meeting.description,
      location: meeting.location,
      type: meeting.type ? meeting.type : null,
      start: moment(meeting.startDate).format(dateFormat),
      end: moment(meeting.endDate).format(dateFormat),
      color: meeting.color
    }
  });
}


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

const fetchMeetingTypes = () => {
  return new Promise((resolve, reject) => {
    Meteor.call(
      "meetings.getTypes",
      null,
      (error, types) => {
        resolve(types);
        if (error) {
          reject(error);
        }
      }
    );
  });
};

export default {
  namespaced: true,
  state: {
    meetingsResults: null,
    meetingTypes: null,
    selectedMeeting: null,
    selectedMeetingTypes: [],
    currentMeeting: null
  },
  mutations: {
    updateMeetingsResults(state, meetingsResults) {
      state.meetingsResults = meetingsResults;
    },
    updateMeetingTypes(state, meetingTypes) {
      state.meetingTypes = meetingTypes
    },
    updateSelectedMeetingTypes(state, selectedMeetingTypes) {
      state.selectedMeetingTypes = selectedMeetingTypes
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
      return formatMeetingsAsEvents(meetings);
    },
    filteredMeetingsEventsByProjectId: (state, getters) => (projectId) => {
      const meetingsEvent = getters.meetingsEventsByProjectId(projectId);
      return meetingsEvent.filter((meetingEvent) => {
        if (!state.selectedMeetingTypes || !state.selectedMeetingTypes.length) return true;
        return state.selectedMeetingTypes.includes(meetingEvent.type)
      });
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
    async fetchMeetingTypes(context) {
      const meetingTypes = await fetchMeetingTypes();
      context.commit("updateMeetingTypes", meetingTypes);
    },
    setSelectedMeeting(context, selectedMeeting) {
      context.commit("updateSelectedMeeting", selectedMeeting);
    },
    setSelectedMeetingTypes(context, selectedMeetingTypes) {
      context.commit("updateSelectedMeetingTypes", selectedMeetingTypes);
    }
  }
};