// Builds the signed waiver PDF: booking info, terms, summary waiver, full release, and every signature.
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'npm:pdf-lib@1.17.1';
import { terms, waiverClosing, waiverFull, waiverFullIntro, waiverSummary } from './booking-texts.ts';

export interface WaiverData {
  bookingId: string; tourName: string; dateText: string; timeText: string; lang: 'en' | 'es';
  lead: { name: string; email: string; phone: string };
  emergency: { name: string; phone: string; email?: string };
  participants: { name: string; phone?: string; email?: string; minor: boolean; guardian?: string; signature: string }[];
  termsVersion: string; signedAt: string; ip: string; userAgent: string;
}

// Standard PDF fonts only support Latin-1 (WinAnsi). Keep Spanish accents, swap anything else.
const clean = (s: string) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...').replace(/[^\x0A\x20-\x7E\xA0-\xFF]/g, '');

export async function buildWaiverPdf(d: WaiverData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Tours Shaddai Waiver ${d.bookingId}`); pdf.setAuthor('Tours Shaddai');
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const navy = rgb(0.024, 0.169, 0.271), grey = rgb(0.35, 0.4, 0.42);
  const W = 612, H = 792, M = 50;
  let page: PDFPage = pdf.addPage([W, H]);
  let y = H - M;

  const ensure = (h: number) => { if (y - h < M) { page = pdf.addPage([W, H]); y = H - M; } };
  const lines = (text: string, f: PDFFont, size: number, width: number) => {
    const out: string[] = [];
    for (const para of clean(text).split('\n')) {
      let cur = '';
      for (const word of para.split(' ')) {
        const test = cur ? `${cur} ${word}` : word;
        if (f.widthOfTextAtSize(test, size) > width && cur) { out.push(cur); cur = word; } else cur = test;
      }
      out.push(cur);
    }
    return out;
  };
  const write = (text: string, opts: { f?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; indent?: number; gap?: number } = {}) => {
    const f = opts.f ?? font, size = opts.size ?? 9.5, indent = opts.indent ?? 0;
    for (const l of lines(text, f, size, W - 2 * M - indent)) { ensure(size + 3); page.drawText(l, { x: M + indent, y: y - size, size, font: f, color: opts.color ?? rgb(0.1, 0.14, 0.15) }); y -= size + 3.2; }
    y -= opts.gap ?? 4;
  };
  const heading = (text: string) => { y -= 6; ensure(30); write(text, { f: bold, size: 12, color: navy, gap: 6 }); };
  const list = (items: string[]) => items.forEach((it, i) => write(`${i + 1}. ${it}`, { indent: 8, gap: 3 }));

  write('TOURS SHADDAI', { f: bold, size: 18, color: navy, gap: 2 });
  write('Boat Passenger & In-Water Activities - Terms, Voluntary Release, Waiver and Assumption of Risk', { f: bold, size: 10.5, color: grey, gap: 10 });
  [
    ['Booking ID', d.bookingId], ['Excursion', d.tourName], ['Excursion date', `${d.dateText} - ${d.timeText}`],
    ['Main contact', `${d.lead.name} - ${d.lead.email} - ${d.lead.phone}`],
    ['Emergency contact', `${d.emergency.name} - ${d.emergency.phone}${d.emergency.email ? ` - ${d.emergency.email}` : ''}`],
    ['Passengers', String(d.participants.length)],
  ].forEach(([k, v]) => write(`${k}: ${v}`, { size: 9.5, gap: 1 }));

  heading(d.lang === 'es' ? 'Términos y condiciones' : 'Terms & Conditions');
  list(terms[d.lang]);
  heading('Waiver & Release (summary)');
  list(waiverSummary);
  heading('Voluntary Release, Waiver and Assumption of Risk');
  write(waiverFullIntro);
  list(waiverFull);
  write(waiverClosing, { f: bold });

  heading('Signatures');
  write('Each passenger (or the parent/guardian of a minor) accepted the Terms & Conditions and the Waiver & Release and signed electronically below.', { color: grey, gap: 8 });
  for (const [i, p] of d.participants.entries()) {
    ensure(120);
    const signer = p.minor ? `${p.guardian} (parent/guardian of minor ${p.name})` : p.name;
    write(`Participant ${i + 1}: ${p.name}${p.minor ? ' (minor)' : ''}`, { f: bold, size: 10, gap: 1 });
    const contact = [p.phone, p.email].filter(Boolean).join(' - ');
    if (contact) write(contact, { size: 8.5, color: grey, gap: 1 });
    try {
      const png = await pdf.embedPng(Uint8Array.from(atob(p.signature.split(',')[1]), c => c.charCodeAt(0)));
      const h = 55, w = Math.min(220, (png.width / png.height) * h);
      page.drawImage(png, { x: M, y: y - h, width: w, height: h }); y -= h + 2;
    } catch { write('[signature image unavailable]', { color: grey }); }
    page.drawLine({ start: { x: M, y }, end: { x: M + 240, y }, thickness: 0.6, color: grey }); y -= 4;
    write(`Signed by: ${signer} - Date: ${d.signedAt}`, { size: 8.5, gap: 10 });
  }
  heading('Electronic signature record');
  write(`Terms version: ${d.termsVersion}\nSigned at (UTC): ${d.signedAt}\nIP address: ${d.ip}\nDevice: ${d.userAgent.slice(0, 180)}`, { size: 8.5, color: grey });
  return await pdf.save();
}
