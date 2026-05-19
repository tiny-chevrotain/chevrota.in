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
  const required = ['sessionType', 'durationMinutes', 'date', 'time', 'email', 'contactMethod', 'contactValue'];
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return `${field} is required`;
    }
  }
  if (!['photoshoot', 'video', 'both'].includes(body.sessionType)) return 'invalid sessionType';
  if (![30, 60, 120, 480].includes(Number(body.durationMinutes))) return 'invalid durationMinutes';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date)) return 'invalid date';
  if (!/^\d{2}:\d{2}$/.test(body.time)) return 'invalid time';
  if (!body.email.includes('@')) return 'invalid email';
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
    sessionType, durationMinutes, isStudio, date, time, email, contactMethod, contactValue, info,
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
    `Email: ${email}`,
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

  const sharedRows = [
    { label: 'Session', value: `${sessionLabel} (${durationLabel})` },
    { label: 'Date', value: dateDisplay },
    { label: 'Time', value: timeDisplay },
    { label: 'Price', value: `£${price}` },
    { label: 'Deliverables', value: `${deliverables} — within 7 days or full refund` },
  ];

  function buildHtmlEmail({ greeting, rows, footer }) {
    const rowsHtml = rows.map(r => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0ebe2;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#8a8499;width:38%;vertical-align:top">${r.label}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f0ebe2;font-size:0.9rem;color:#1a1625;vertical-align:top">${r.value}</td>
      </tr>`).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:28px">
      <div style="font-size:1.4rem;font-weight:700;letter-spacing:-0.02em;color:#1a1625">chevrota.in</div>
      <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:#8a8499;margin-top:4px">Photography &amp; Video</div>
    </div>
    <div style="background:#ffffff;border-radius:14px;padding:28px 28px 20px;box-shadow:0 2px 12px rgba(0,0,0,0.07)">
      <p style="margin:0 0 22px;font-size:1rem;color:#1a1625;line-height:1.55">${greeting}</p>
      <table style="width:100%;border-collapse:collapse">${rowsHtml}</table>
    </div>
    <p style="text-align:center;font-size:0.75rem;color:#b0a9bf;margin-top:20px">${footer}</p>
  </div>
</body>
</html>`;
  }

  function buildPlainEmail({ greeting, rows }) {
    return [greeting, '', ...rows.map(r => `${r.label.padEnd(14)}${r.value}`)].join('\n');
  }

  const ownerRows = [
    ...sharedRows,
    { label: 'Email', value: email },
    { label: contactLabel, value: contactValue },
    ...(info ? [{ label: 'Info', value: info }] : []),
  ];

  const ownerHtml = buildHtmlEmail({
    greeting: 'New booking received!',
    rows: ownerRows,
    footer: 'chevrota.in booking system',
  });

  const customerHtml = buildHtmlEmail({
    greeting: `Thanks for booking! Here's a summary of your session. Ollie will be in touch via ${contactLabel.toLowerCase()} to confirm everything.`,
    rows: sharedRows,
    footer: 'chevrota.in &mdash; questions? Reply to this email.',
  });

  try {
    await ses.send(new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL,
      Destination: { ToAddresses: [process.env.NOTIFICATION_EMAIL] },
      Message: {
        Subject: { Data: `New Booking: ${sessionLabel} — ${dateDisplay}, ${timeDisplay}` },
        Body: {
          Html: { Data: ownerHtml },
          Text: { Data: buildPlainEmail({ greeting: 'New booking received!', rows: ownerRows }) },
        },
      },
    }));
  } catch (err) {
    console.error('SES owner email error:', err);
  }

  try {
    await ses.send(new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: `Booking confirmed — ${sessionLabel}, ${dateDisplay}` },
        Body: {
          Html: { Data: customerHtml },
          Text: { Data: buildPlainEmail({ greeting: `Thanks for booking! Ollie will be in touch via ${contactLabel.toLowerCase()} to confirm.`, rows: sharedRows }) },
        },
      },
    }));
  } catch (err) {
    console.error('SES customer email error:', err);
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
