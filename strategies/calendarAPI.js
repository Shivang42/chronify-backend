const axios = require('axios');

const fetchCalendars = async (token) => {
    let { data, status } = await axios.get('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        withCredentials: true
    });
    return { data: data.items, status };
}
const fetchCalendar = async (token, id) => {
    let { data, status } = await axios.get(`https://www.googleapis.com/calendar/v3/users/me/calendarList/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        withCredentials: true
    });
    return { data, status };
}
const fetchEvents = async (token, id) => {
    let { data, status } = await axios.get(`https://www.googleapis.com/calendar/v3/calendars/${id}/events`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        withCredentials: true
    });
    return { data: data.items, status };
}
const createEvent = async (token, calID, { sdatetime, edatetime, summary }) => {
    let { data, status } = await axios.post(`https://www.googleapis.com/calendar/v3/calendars/${calID}/events`, {
        start: {
            "dateTime": sdatetime
        },
        end: {
            "dateTime": edatetime
        },
        summary: summary
    }, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        withCredentials: true
    }
    );
    return { data: data.items, status };
}

module.exports = { fetchEvents, fetchCalendars, fetchCalendar, createEvent };