/**
 * Integração com Google Agenda — MVP sem OAuth (plano, fase 3.3):
 * link "Adicionar ao Google Calendar" por evento + export `.ics` gerado
 * no cliente (string manual, sem dependência nova).
 */

export interface CalendarEventInput {
  id: string;
  title: string;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  description?: string | null;
  url?: string | null;
}

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;

function toUtcStamp(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

function resolveRange(input: CalendarEventInput): { start: Date; end: Date } | null {
  const start = new Date(input.startsAt);
  if (Number.isNaN(start.getTime())) return null;
  const parsedEnd = input.endsAt ? new Date(input.endsAt) : null;
  const end =
    parsedEnd && !Number.isNaN(parsedEnd.getTime())
      ? parsedEnd
      : new Date(start.getTime() + DEFAULT_DURATION_MS);
  return { start, end };
}

/** URL template do Google Agenda (não requer login prévio nem API). */
export function googleCalendarUrl(input: CalendarEventInput): string | null {
  const range = resolveRange(input);
  if (!range) return null;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: input.title,
    dates: `${toUtcStamp(range.start)}/${toUtcStamp(range.end)}`,
  });
  if (input.location) params.set('location', input.location);

  const details = [input.description, input.url].filter(Boolean).join('\n\n');
  if (details) params.set('details', details);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Dobra linhas em 75 octetos, como pede o RFC 5545. */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [line.slice(0, 75)];
  let rest = line.slice(75);
  while (rest.length > 74) {
    chunks.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  if (rest) chunks.push(` ${rest}`);
  return chunks.join('\r\n');
}

export function buildIcs(events: CalendarEventInput[], calendarName = 'Agenda CAOS'): string {
  const stamp = toUtcStamp(new Date());
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CAOS Cultural//Agenda//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcs(calendarName)}`,
  ];

  for (const event of events) {
    const range = resolveRange(event);
    if (!range) continue;
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@caos-cultural`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${toUtcStamp(range.start)}`,
      `DTEND:${toUtcStamp(range.end)}`,
      `SUMMARY:${escapeIcs(event.title)}`
    );
    if (event.location) lines.push(`LOCATION:${escapeIcs(event.location)}`);
    if (event.description) lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);
    if (event.url) lines.push(`URL:${escapeIcs(event.url)}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n');
}

/** Dispara o download do .ics no navegador. */
export function downloadIcs(events: CalendarEventInput[], filename = 'agenda-caos.ics'): void {
  const blob = new Blob([buildIcs(events)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
