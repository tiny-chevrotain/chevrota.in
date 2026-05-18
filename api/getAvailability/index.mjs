import { google } from 'googleapis';

const BUSINESS_START = 8;
const BUSINESS_END = 20;

function buildOAuth2Client() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return auth;
}

function generateSlots(year, month, day, durationMinutes) {
  const slots = [];
  const stepMinutes = 30;
  const endLimit = BUSINESS_END * 60 - durationMinutes;

  for (let minutes = BUSINESS_START * 60; minutes <= endLimit; minutes += stepMinutes) {
    const h = String(Math.floor(minutes / 60)).padStart(2, '0');
    const m = String(minutes % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
  }
  return slots;
}

function slotToDateTimes(dateStr, time, durationMinutes) {
  const start = new Date(`${dateStr}T${time}:00`);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return { start, end };
}

function eventsOverlapSlot(events, slotStart, slotEnd) {
  return events.filter(ev => {
    if (ev.transparency === 'transparent') return false;
    if (ev.status === 'cancelled') return false;
    const evStart = new Date(ev.start.dateTime ?? ev.start.date);
    const evEnd = new Date(ev.end.dateTime ?? ev.end.date);
    return evStart < slotEnd && evEnd > slotStart;
  });
}

function classifySlot(overlapping) {
  if (overlapping.length === 0) return { status: 'available' };
  const hasLocation = overlapping.some(ev => ev.location && ev.location.trim().length > 0);
  const allHaveLocation = overlapping.every(ev => ev.location && ev.location.trim().length > 0);
  if (allHaveLocation) {
    const location = overlapping.find(ev => ev.location)?.location ?? '';
    return { status: 'location-only', location };
  }
  return { status: 'busy' };
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

export const handler = async (event) => {
  const params = event.queryStringParameters ?? {};
  const year = parseInt(params.year, 10);
  const month = parseInt(params.month, 10);
  const durationMinutes = parseInt(params.durationMinutes, 10);

  if (!year || !month || !durationMinutes) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'year, month, and durationMinutes are required' }),
    };
  }

  const auth = buildOAuth2Client();
  const calendar = google.calendar({ version: 'v3', auth });

  const rangeStart = new Date(`${year}-${pad2(month)}-01T00:00:00Z`);
  const rangeEnd = new Date(year, month, 1);

  const calendarIds = [
    process.env.CALENDAR_ID,
    process.env.TIMMYBUBBLE_CALENDAR_ID,
  ].filter(Boolean);

  let allEvents = [];
  try {
    for (const calId of calendarIds) {
      const res = await calendar.events.list({
        calendarId: calId,
        timeMin: rangeStart.toISOString(),
        timeMax: rangeEnd.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        fields: 'items(start,end,status,transparency,location)',
      });
      allEvents = allEvents.concat(res.data.items ?? []);
    }
  } catch (err) {
    console.error('Calendar fetch error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Failed to fetch calendar data' }),
    };
  }

  const totalDays = daysInMonth(year, month);
  const now = new Date();
  const availability = {};

  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-${pad2(month)}-${pad2(day)}`;
    const times = generateSlots(year, month, day, durationMinutes);
    const daySlots = [];

    for (const time of times) {
      const { start, end } = slotToDateTimes(dateStr, time, durationMinutes);
      if (end <= now) continue;
      const overlapping = eventsOverlapSlot(allEvents, start, end);
      const { status, location } = classifySlot(overlapping);
      daySlots.push({ time, status, ...(location ? { location } : {}) });
    }

    if (daySlots.some(s => s.status !== 'busy')) {
      availability[dateStr] = daySlots;
    }
  }

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ availability }),
  };
};

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? 'https://chevrota.in',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
