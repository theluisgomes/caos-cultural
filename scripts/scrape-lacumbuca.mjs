#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const DEFAULT_URL = 'http://www.lacumbuca.com/';
const DEFAULT_OUT = 'data/lacumbuca-events.json';
const WEEKDAY_PATTERN = 'domingo|segunda-feira|segunda|terça-feira|terca-feira|terça|terca|quarta-feira|quarta|quinta-feira|quinta|sexta-feira|sexta|sábado|sabado';

function parseArgs(argv) {
  const args = {
    url: DEFAULT_URL,
    input: null,
    out: DEFAULT_OUT,
    csv: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--url') args.url = argv[++i];
    else if (arg === '--input') args.input = argv[++i];
    else if (arg === '--out') args.out = argv[++i];
    else if (arg === '--csv') args.csv = argv[++i];
    else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/scrape-lacumbuca.mjs [options]

Options:
  --url <url>       Source URL to fetch. Default: ${DEFAULT_URL}
  --input <path>    Read a saved Markdown/HTML capture instead of fetching.
  --out <path>      JSON output path. Default: ${DEFAULT_OUT}
  --csv <path>      Optional CSV output path.

Examples:
  node scripts/scrape-lacumbuca.mjs --input uploads/www.lacumbuca.com-0.md
  node scripts/scrape-lacumbuca.mjs --url http://www.lacumbuca.com/ --csv data/lacumbuca-events.csv
`);
}

async function readSource(args) {
  if (args.input) {
    const path = resolve(args.input);
    return {
      sourceUrl: null,
      sourceKind: 'file',
      text: await readFile(path, 'utf8'),
    };
  }

  const response = await fetch(args.url, {
    headers: {
      'user-agent': 'CAOS Cultural scraper/0.1 (+https://caos-cultural.web.app)',
      accept: 'text/html, text/plain;q=0.9, */*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${args.url}: ${response.status} ${response.statusText}`);
  }

  return {
    sourceUrl: args.url,
    sourceKind: 'url',
    text: await response.text(),
  };
}

function decodeHtmlEntities(text) {
  const named = {
    amp: '&',
    apos: "'",
    '#39': "'",
    quot: '"',
    lt: '<',
    gt: '>',
    nbsp: ' ',
    ndash: '-',
    mdash: '-',
  };

  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const key = entity.toLowerCase();
    if (key in named) return named[key];
    if (key.startsWith('#x')) return String.fromCodePoint(Number.parseInt(key.slice(2), 16));
    if (key.startsWith('#')) return String.fromCodePoint(Number.parseInt(key.slice(1), 10));
    return match;
  });
}

function htmlToReadableText(source) {
  if (!/<[a-z][\s\S]*>/i.test(source)) return source;

  return decodeHtmlEntities(
    source
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, text) => `\n**${text.trim()}**\n`)
      .replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, text) => `\n_${text.trim()}_\n`)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|blockquote|h[1-6])>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  );
}

function normalizeLines(source) {
  return htmlToReadableText(source)
    .split(/\r?\n/)
    .map(line => line.trim().replace(/^>\s?/, '').replace(/\s{2,}$/g, '').trim())
    .filter(line => line && line !== '**');
}

function stripMarkdown(text) {
  return text
    .replace(/^\*\*/, '')
    .replace(/\*\*$/, '')
    .replace(/^_/, '')
    .replace(/_$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function parsePtDate(value) {
  const clean = stripMarkdown(value).toLowerCase();
  const dateMatch = clean.match(/(?:(domingo|segunda-feira|segunda|terça-feira|terca-feira|terça|terca|quarta-feira|quarta|quinta-feira|quinta|sexta-feira|sexta|sábado|sabado),?\s*)?(\d{1,2})\/(\d{1,2})\/(\d{4})/i);
  if (!dateMatch) return { dateLabel: stripMarkdown(value), date: null, weekday: null };

  const [, weekdayRaw, day, month, year] = dateMatch;
  const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  return {
    dateLabel: stripMarkdown(value),
    date,
    weekday: weekdayRaw ? weekdayRaw.normalize('NFC') : null,
  };
}

function parseTime(value) {
  const clean = stripMarkdown(value).replace(/^horário:\s*/i, '').trim();
  const match = clean.match(/(\d{1,2})(?:h|:)(\d{2})?/i);
  if (!match) return { timeLabel: clean, time: null };
  return {
    timeLabel: clean,
    time: `${match[1].padStart(2, '0')}:${match[2] ?? '00'}`,
  };
}

function extractNeighborhood(location) {
  const parts = location.split(/\s+-\s+/).map(part => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts.at(-1) : null;
}

function parseEvents(source, sourceUrl = DEFAULT_URL) {
  const lines = normalizeLines(source);
  const events = [];

  for (let i = 0; i < lines.length; i += 1) {
    const compactEvent = parseCompactEventLine(lines[i], sourceUrl);
    if (compactEvent) {
      events.push(compactEvent);
      continue;
    }

    const titleMatch = lines[i].match(/^(?:\*\*)?(.+?)\*\*$/);
    if (!titleMatch) continue;

    const title = stripMarkdown(titleMatch[1]);
    const dateLine = lines[i + 1] ?? '';
    const priceLine = lines[i + 2] ?? '';
    const timeLine = lines[i + 3] ?? '';
    const locationLine = lines[i + 4] ?? '';
    const infoLine = lines[i + 5] ?? '';

    if (!new RegExp(`${WEEKDAY_PATTERN},?\\s*\\d{1,2}\\/\\d{1,2}\\/\\d{4}`, 'i').test(dateLine)) continue;
    if (!/^preço:/i.test(priceLine)) continue;
    if (!/^horário:/i.test(timeLine)) continue;

    const price = stripMarkdown(priceLine).replace(/^preço:\s*/i, '').trim();
    events.push(buildEvent({
      title,
      dateLine,
      price,
      timeLine,
      location: stripMarkdown(locationLine),
      infoLabel: /^informação/i.test(infoLine) ? stripMarkdown(infoLine) : null,
      sourceUrl,
      raw: {
        titleLine: lines[i],
        dateLine,
        priceLine,
        timeLine,
        locationLine,
        infoLine,
      },
    }));
  }

  return dedupeEvents(events);
}

function parseCompactEventLine(line, sourceUrl) {
  const clean = line.replace(/^>\s?/, '').trim();
  const compactPattern = new RegExp(
    `^(.+?)(${WEEKDAY_PATTERN}),?\\s*(\\d{1,2}\\/\\d{1,2}\\/\\d{4})Preço:\\s*(.*?)Horário:\\s*([0-9]{1,2}(?:h[0-9]{0,2}|:[0-9]{2})?)(.+?)(?:\\s+Informação)?$`,
    'i'
  );
  const match = clean.match(compactPattern);
  if (!match) return null;

  const [, title, weekday, date, price, time, location] = match;
  const dateLine = `_${weekday}, ${date}_`;
  const timeLine = `Horário: ${time}`;

  return buildEvent({
    title: stripMarkdown(title),
    dateLine,
    price: stripMarkdown(price),
    timeLine,
    location: stripMarkdown(location),
    infoLabel: /Informação$/i.test(clean) ? 'Informação' : null,
    sourceUrl,
    raw: {
      compactLine: line,
      dateLine,
      priceLine: `Preço: ${price}`,
      timeLine,
      locationLine: location,
    },
  });
}

function buildEvent({ title, dateLine, price, timeLine, location, infoLabel, sourceUrl, raw }) {
  const parsedDate = parsePtDate(dateLine);
  const parsedTime = parseTime(timeLine);
  const cleanPrice = (price ?? '').trim();
  const cleanLocation = (location ?? '').trim();
  const startsAt =
    parsedDate.date && parsedTime.time
      ? `${parsedDate.date}T${parsedTime.time}:00-03:00`
      : null;
  const idSeed = [title, parsedDate.date, parsedTime.time, cleanLocation].filter(Boolean).join('-');

  return {
    id: `lacumbuca-${slugify(idSeed)}`,
    source: 'La Cumbuca',
    sourceUrl,
    title,
    date: parsedDate.date,
    dateLabel: parsedDate.dateLabel,
    weekday: parsedDate.weekday,
    time: parsedTime.time,
    timeLabel: parsedTime.timeLabel,
    startsAt,
    price: cleanPrice || null,
    isFree: /gr[aá]tis/i.test(cleanPrice),
    location: cleanLocation,
    neighborhood: extractNeighborhood(cleanLocation),
    infoLabel,
    city: 'Rio de Janeiro',
    state: 'RJ',
    country: 'BR',
    raw,
  };
}

function dedupeEvents(events) {
  const seen = new Set();
  return events.filter(event => {
    if (seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
}

function toCsv(events) {
  const columns = [
    'id',
    'title',
    'date',
    'time',
    'startsAt',
    'price',
    'isFree',
    'location',
    'neighborhood',
    'city',
    'state',
    'sourceUrl',
  ];
  const escape = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  return [
    columns.join(','),
    ...events.map(event => columns.map(column => escape(event[column])).join(',')),
  ].join('\n');
}

async function writeOutput(path, contents) {
  const fullPath = resolve(path);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, contents);
  return fullPath;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const source = await readSource(args);
  const events = parseEvents(source.text, source.sourceUrl ?? DEFAULT_URL);
  const generatedAt = new Date().toISOString();
  const payload = {
    source: {
      name: 'La Cumbuca',
      url: source.sourceUrl ?? DEFAULT_URL,
      kind: source.sourceKind,
    },
    generatedAt,
    count: events.length,
    events,
  };

  const jsonPath = await writeOutput(args.out, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Scraped ${events.length} events from La Cumbuca.`);
  console.log(`JSON: ${jsonPath}`);

  if (args.csv) {
    const csvPath = await writeOutput(args.csv, `${toCsv(events)}\n`);
    console.log(`CSV:  ${csvPath}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
