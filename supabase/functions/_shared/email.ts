import { env } from './common.ts';

export interface Mail { to: string[]; subject: string; html: string; replyTo?: string; attachments?: { filename: string; content: string /* base64 */ }[] }

/** Sends through Resend. RESEND_FROM must be on a domain verified in Resend, e.g. "Tours Shaddai <reservas@toursshaddai.com>". */
/** Email is optional: without RESEND_API_KEY and RESEND_FROM it is skipped (returns false). */
export const mailConfigured = () => !!Deno.env.get('RESEND_API_KEY') && !!Deno.env.get('RESEND_FROM');
export async function sendMail(m: Mail): Promise<boolean> {
  if (!mailConfigured()) { console.log('Email skipped (Resend not configured):', m.subject); return false; }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env('RESEND_FROM'), to: m.to, subject: m.subject, html: m.html, reply_to: m.replyTo, attachments: m.attachments }),
  });
  if (!res.ok) throw new Error(`Email failed: ${res.status} ${await res.text()}`);
  return true;
}

export const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f3f6f7;font-family:Arial,Helvetica,sans-serif;color:#182326">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6f7;padding:24px 0"><tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:6px;overflow:hidden">
  <tr><td style="background:#062b45;color:#fff;padding:22px 28px;font-size:20px;font-family:Georgia,serif">Tours Shaddai</td></tr>
  <tr><td style="padding:28px"><h1 style="font-family:Georgia,serif;color:#062b45;font-size:24px;margin:0 0 16px">${esc(title)}</h1>${body}</td></tr>
  <tr><td style="background:#f8faf9;color:#6b7b82;font-size:12px;padding:16px 28px">Tours Shaddai · Captain Jorge Martinez · Puerto Rico · 939-471-4747</td></tr>
  </table></td></tr></table></body></html>`;
}

export const row = (k: string, v: string) => `<tr><td style="padding:8px 0;color:#6b7b82;border-bottom:1px solid #e6ecee;width:38%">${esc(k)}</td><td style="padding:8px 0;font-weight:bold;color:#062b45;border-bottom:1px solid #e6ecee">${v}</td></tr>`;
