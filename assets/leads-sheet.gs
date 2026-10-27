/* ForgeHype leads: Google Apps Script that receives website form submissions into this Sheet,
   emails an alert to the owner, and auto-replies to audit requests that include an email.

   SETUP (once, about 5 minutes, signed in as ForgeHypeqatar@gmail.com)
   1. Create a new Google Sheet named "ForgeHype leads".
   2. Extensions > Apps Script. Delete the sample code, paste this whole file, click Save.
   3. Deploy > New deployment > type: Web app.
        Description: ForgeHype leads
        Execute as: Me
        Who has access: Anyone
      Click Deploy, approve the permissions (Advanced > Go to project if Google warns it is unverified; it is your own script).
   4. Copy the Web app URL (ends in /exec) and send it to Claude. It goes into LEADS_URL in assets/js/main.js.
   Re-deploying after an edit: Deploy > Manage deployments > edit (pencil) > Version: New version > Deploy. The URL stays the same.

   Three sheets are kept: "Bookings" (consultation requests, which also open WhatsApp), "Audits" (free audit requests)
   and "Lead tools" (the free website check and the Growth Score quiz).
*/

const ALERT_TO = 'info@forgehype.qa';
const FROM_NAME = 'ForgeHype';
const H_BOOK = ['Received', 'Business type', 'Interests', 'Website', 'Notes', 'Consent', 'Page', 'Status', 'Follow-up'];
const H_TOOLS = ['Received', 'Source', 'Business type / score', 'Website / company', 'WhatsApp', 'Email', 'Details', 'Consent', 'Page', 'Status', 'Sent', 'Follow-up'];
const H_AUDIT = ['Received', 'Business type', 'Website', 'WhatsApp', 'Email', 'What is not working', 'Consent', 'Page', 'Status', 'Report sent', 'Meeting'];

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.botcheck) return out({ ok: true });                       // honeypot filled: silently ignore
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const now = new Date();
    const src = s(p.source);
    if (src === 'Free check' || src === 'Growth Score') {
      const t = sheet(ss, 'Lead tools', H_TOOLS);
      t.appendRow([now, src, c(p.type), c(p.website), c(p.whatsapp), c(p.email), c(p.online), p.consent ? 'Yes' : 'No', c(p.page), 'New', '', '']);
      MailApp.sendEmail({ to: ALERT_TO, name: FROM_NAME, subject: src + ': ' + (s(p.website) || s(p.type)),
        body: ['New ' + src.toUpperCase() + ' lead from the website', '', 'Business type / score: ' + s(p.type), 'Website / company: ' + s(p.website),
          'WhatsApp: ' + s(p.whatsapp), 'Email: ' + s(p.email), 'Details: ' + s(p.online), '',
          src === 'Free check' ? 'Promise: short report with the 3 biggest fixes within 48 hours.' : 'Promise: full report on WhatsApp within one working day.',
          'Sheet: ' + ss.getUrl()].join('\n') });
      if (src === 'Free check' && s(p.email)) checkReply(s(p.email), s(p.website));
      return out({ ok: true });
    }
    const audit = src === 'Free audit';
    const sh = sheet(ss, audit ? 'Audits' : 'Bookings', audit ? H_AUDIT : H_BOOK);
    let subject, body;
    if (audit) {
      sh.appendRow([now, c(p.type), c(p.website), c(p.whatsapp), c(p.email), c(p.online), p.consent ? 'Yes' : 'No', c(p.page), 'New', '', '']);
      subject = 'Website audit request: ' + (s(p.website) || s(p.type));
      body = ['New FREE WEBSITE AUDIT request', '', 'Business type: ' + s(p.type), 'Website: ' + s(p.website),
        'WhatsApp: ' + s(p.whatsapp), 'Email: ' + s(p.email), '', 'What is not working: ' + s(p.online),
        '', 'Next: review, send the report, then book the meeting.', 'Sheet: ' + ss.getUrl()].join('\n');
      if (s(p.email)) autoReply(s(p.email), s(p.website) || s(p.type));
    } else {
      sh.appendRow([now, c(p.type), c(p.interests), c(p.website), c(p.message), p.consent ? 'Yes' : 'No', c(p.page), 'New', '']);
      subject = 'Booking request: ' + s(p.type);
      body = ['New CONSULTATION booking from the website (the visitor was sent to WhatsApp)', '', 'Business type: ' + s(p.type), 'Interests: ' + s(p.interests),
        'Website: ' + s(p.website), 'Notes: ' + s(p.message), '', 'Sheet: ' + ss.getUrl()].join('\n');
    }
    MailApp.sendEmail({ to: ALERT_TO, subject: subject, body: body, name: FROM_NAME });
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

/* automatic "received" reply to the visitor; edit the wording here */
function autoReply(to, name) {
  const subject = 'Your free website audit request is received';
  const body = ['Hi,', '',
    'Thanks for asking ForgeHype for a free audit of your website, ' + name + '.', '',
    'Here is what happens next:',
    '1. We review your website the way a customer would: speed on a phone, clarity, how easy it is to order or contact you, and how it shows up on Google.',
    '2. We send you the report the way you asked (WhatsApp or email).',
    '3. We invite you to a short meeting to go through it together and agree the next step.', '',
    'If you want to add anything in the meantime, reply to this email or message us on WhatsApp: +974 7006 9544.', '',
    'ForgeHype', 'Website design and digital growth consultancy, Doha', 'forgehype.qa'].join('\n');
  sendReply(to, subject, body);
}

function checkReply(to, link) {
  sendReply(to, 'Your free website check is on its way',
    ['Hi,', '', 'Thanks for asking ForgeHype to check ' + link + '.', '',
      'Within 48 hours we will send you a short report showing the three biggest things costing you customers, and what to fix first.', '',
      'Questions in the meantime? Reply to this email or WhatsApp us: +974 7006 9544.', '', 'ForgeHype', 'Website design and digital growth consultancy, Doha', 'forgehype.qa'].join('\n'));
}

/* Replies to visitors go out from info@forgehype.qa through Microsoft 365 (Microsoft Graph).
   Needs four Script Properties (Project Settings > Script Properties), never written in this file:
     M365_TENANT_ID, M365_CLIENT_ID, M365_CLIENT_SECRET, M365_SENDER (info@forgehype.qa)
   If they are missing or Microsoft refuses, the reply falls back to Gmail so the visitor still gets it. */
function sendReply(to, subject, body) {
  const pr = PropertiesService.getScriptProperties();
  const tenant = pr.getProperty('M365_TENANT_ID'), id = pr.getProperty('M365_CLIENT_ID'),
        secret = pr.getProperty('M365_CLIENT_SECRET'), sender = pr.getProperty('M365_SENDER');
  if (tenant && id && secret && sender) {
    try {
      const tok = JSON.parse(UrlFetchApp.fetch('https://login.microsoftonline.com/' + tenant + '/oauth2/v2.0/token', {
        method: 'post', muteHttpExceptions: true,
        payload: { client_id: id, client_secret: secret, scope: 'https://graph.microsoft.com/.default', grant_type: 'client_credentials' }
      }).getContentText()).access_token;
      const r = UrlFetchApp.fetch('https://graph.microsoft.com/v1.0/users/' + encodeURIComponent(sender) + '/sendMail', {
        method: 'post', contentType: 'application/json', muteHttpExceptions: true,
        headers: { Authorization: 'Bearer ' + tok },
        payload: JSON.stringify({ message: { subject: subject, body: { contentType: 'Text', content: body },
          toRecipients: [{ emailAddress: { address: to } }] }, saveToSentItems: true })
      });
      if (r.getResponseCode() === 202) return;
      console.warn('Graph sendMail refused: ' + r.getResponseCode() + ' ' + r.getContentText().slice(0, 300));
    } catch (err) { console.warn('Graph sendMail failed: ' + err); }
  }
  MailApp.sendEmail({ to: to, subject: subject, body: body, name: FROM_NAME, replyTo: ALERT_TO });
}

/* run once from the editor after adding the Script Properties: sends a test reply to info@ itself */
function testReply() { sendReply(ALERT_TO, 'ForgeHype test: reply from info@', 'If this arrived from info@forgehype.qa, the website replies are set up.'); }

function doGet() { return out({ ok: true, service: 'ForgeHype leads' }); }

function sheet(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(headers); sh.setFrozenRows(1); sh.getRange(1, 1, 1, headers.length).setFontWeight('bold'); }
  return sh;
}
function s(v) { return v == null ? '' : String(v).slice(0, 3000); }
/* for sheet cells only: a leading apostrophe keeps values such as +974 numbers as plain text
   and stops anything starting with = + - @ from being read as a formula */
function c(v) { const t = s(v); return /^[=+\-@]/.test(t) ? "'" + t : t; }
function out(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
