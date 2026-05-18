import { google } from 'googleapis';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({ region: process.env.AWS_REGION ?? 'eu-north-1' });

const SESSION_LABELS = {
  photoshoot: 'Photoshoot',
  video: 'Video',
  both: 'Photoshoot + Video',
};

const CONTACT_LABELS = {
  phone: 'Phone',
  email: 'Email',
  instagram: 'Instagram',
};

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function getPrice(sessionType, durationMinutes, isStudio) {
  if (isStudio) return durationMinutes === 60 ? 150 : 300;
  const map = { 30: 30, 60: 50, 120: 80, 480: 150 };
  return map[durationMinutes] ?? 0;
}

function getDeliverables(sessionType, durationMinutes) {
  const photoMap = { 30: '50', 60: '100', 120: '200', 480: 'all' };
  const count = photoMap[durationMinutes];
  const photos = count === 'all' ? 'All edited photos' : `Minimum ${count} edited photos`;
  if (sessionType === 'video') return 'Video edit';
  if (sessionType === 'both') return `${photos} + video edit`;
  return photos;
}

function getDurationLabel(durationMinutes, isStudio) {
  const labels = { 30: '30 minutes', 60: '1 hour', 120: '2 hours', 480: 'Full day' };
  return `${isStudio ? 'Studio — ' : ''}${labels[durationMinutes] ?? `${durationMinutes} min`}`;
}

function formatDateDisplay(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(dateStr + 'T12:00:00');
  const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return `${weekdays[date.getDay()]} ${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

function format12h(time24) {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`;
}

function buildOAuth2Client() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return auth;
}

function validate(body) {
  const required = ['sessionType', 'durationMinutes', 'date', 'time', 'contactMethod', 'contactValue'];
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return `${field} is required`;
    }
  }
  if (!['photoshoot', 'video', 'both'].includes(body.sessionType)) return 'invalid sessionType';
  if (![30, 60, 120, 480].includes(Number(body.durationMinutes))) return 'invalid durationMinutes';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date)) return 'invalid date';
  if (!/^\d{2}:\d{2}$/.test(body.time)) return 'invalid time';
  if (!['phone', 'email', 'instagram'].includes(body.contactMethod)) return 'invalid contactMethod';
  return null;
}

export const handler = async (event) => {
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  let body;
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const validationError = validate(body);
  if (validationError) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: `Validation failed: ${validationError}` }),
    };
  }

  const {
    sessionType, durationMinutes, isStudio, date, time, contactMethod, contactValue, info,
  } = body;

  const durationNum = Number(durationMinutes);
  const price = getPrice(sessionType, durationNum, isStudio);
  const deliverables = getDeliverables(sessionType, durationNum);
  const durationLabel = getDurationLabel(durationNum, isStudio);
  const sessionLabel = SESSION_LABELS[sessionType];
  const contactLabel = CONTACT_LABELS[contactMethod];
  const dateDisplay = formatDateDisplay(date);
  const timeDisplay = format12h(time);

  const startDateTime = new Date(`${date}T${time}:00`);
  const endDateTime = new Date(startDateTime.getTime() + durationNum * 60000);

  const toISO = (d) => {
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  };

  const eventDescription = [
    `Contact: ${contactValue} (${contactLabel})`,
    info ? `Info: ${info}` : null,
    `Price: £${price}`,
    `Deliverables: ${deliverables} — within 7 days or full refund`,
  ].filter(Boolean).join('\n');

  const auth = buildOAuth2Client();
  const calendar = google.calendar({ version: 'v3', auth });

  let eventId;
  try {
    const res = await calendar.events.insert({
      calendarId: process.env.CALENDAR_ID,
      resource: {
        summary: `📸 Booking: ${sessionLabel} (${durationLabel})`,
        description: eventDescription,
        start: { dateTime: toISO(startDateTime), timeZone: 'Europe/London' },
        end: { dateTime: toISO(endDateTime), timeZone: 'Europe/London' },
      },
    });
    eventId = res.data.id;
  } catch (err) {
    console.error('Calendar insert error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Failed to create calendar event' }),
    };
  }

  const emailBody = [
    'New booking received!',
    '',
    `Session:      ${sessionLabel} (${durationLabel})`,
    `Date:         ${dateDisplay}`,
    `Time:         ${timeDisplay}`,
    `Price:        £${price}`,
    `Deliverables: ${deliverables} — within 7 days or full refund`,
    '',
    `Contact (${contactLabel}): ${contactValue}`,
    info ? `\nAdditional info:\n${info}` : '',
  ].join('\n');

  try {
    await ses.send(new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL,
      Destination: { ToAddresses: [process.env.NOTIFICATION_EMAIL] },
      Message: {
        Subject: { Data: `New Booking: ${sessionLabel} — ${dateDisplay}, ${timeDisplay}` },
        Body: { Text: { Data: emailBody } },
      },
    }));
  } catch (err) {
    console.error('SES send error:', err);
    // Booking was created in calendar — still return success but log the email failure
  }

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ success: true, eventId }),
  };
};

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? 'https://chevrota.in',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
