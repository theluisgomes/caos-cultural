import { describe, expect, it } from 'vitest';
import { buildIcs, googleCalendarUrl } from '../lib/calendarLinks';

const event = {
  id: 'evt_1',
  title: 'Sombras Digitais',
  startsAt: '2026-08-01T23:00:00.000Z',
  endsAt: '2026-08-02T03:00:00.000Z',
  location: 'Galeria Vermelho, Pinheiros',
  description: 'Exposição imersiva',
};

describe('googleCalendarUrl', () => {
  it('builds a TEMPLATE url with UTC stamps', () => {
    const url = googleCalendarUrl(event)!;
    expect(url).toContain('https://calendar.google.com/calendar/render');
    expect(url).toContain('action=TEMPLATE');
    expect(url).toContain('dates=20260801T230000Z%2F20260802T030000Z');
    expect(url).toContain('Sombras+Digitais');
  });

  it('defaults the end to two hours after the start', () => {
    const url = googleCalendarUrl({ ...event, endsAt: null })!;
    expect(url).toContain('dates=20260801T230000Z%2F20260802T010000Z');
  });

  it('returns null for an invalid start date', () => {
    expect(googleCalendarUrl({ ...event, startsAt: 'nope' })).toBeNull();
  });
});

describe('buildIcs', () => {
  it('emits a valid VCALENDAR with escaped fields', () => {
    const ics = buildIcs([event]);
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true);
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('UID:evt_1@caos-cultural');
    expect(ics).toContain('DTSTART:20260801T230000Z');
    expect(ics).toContain('SUMMARY:Sombras Digitais');
    // vírgulas precisam ser escapadas no LOCATION
    expect(ics).toContain('LOCATION:Galeria Vermelho\\, Pinheiros');
    expect(ics.split('\r\n').length).toBeGreaterThan(5);
  });

  it('skips events with unparseable dates', () => {
    const ics = buildIcs([{ ...event, startsAt: 'invalid' }]);
    expect(ics).not.toContain('BEGIN:VEVENT');
  });
});
