import lacumbucaPayload from '../../data/lacumbuca-events.json';
import { Listing, ListingType } from '../types';

interface LacumbucaEvent {
  id: string;
  title: string;
  date: string | null;
  dateLabel: string;
  time: string | null;
  timeLabel: string;
  startsAt: string | null;
  price: string | null;
  isFree: boolean;
  location: string;
  neighborhood: string | null;
  city: string;
  state: string;
}

interface LacumbucaPayload {
  events: LacumbucaEvent[];
}

const payload = lacumbucaPayload as LacumbucaPayload;

function titleSeed(value: string): number {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function rioCoordinate(seed: number): { lat: number; lng: number } {
  return {
    lat: -22.98 + ((seed % 120) / 1000),
    lng: -43.36 + (((seed * 7) % 220) / 1000),
  };
}

function formatDate(event: LacumbucaEvent): string {
  const day = event.date
    ? new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
      }).format(new Date(`${event.date}T12:00:00-03:00`))
    : event.dateLabel;
  return event.timeLabel ? `${day}, ${event.timeLabel}` : day;
}

export function getLacumbucaListings(): Listing[] {
  return payload.events.map((event, index) => {
    const seed = titleSeed(`${event.id}-${event.location}`);
    const neighborhood = event.neighborhood ?? 'Rio de Janeiro';
    const price = event.isFree ? 'Grátis' : event.price ? `R$ ${event.price}` : 'Consulte';

    return {
      id: event.id,
      type: ListingType.EVENT,
      title: event.title,
      subtitle: event.location,
      description: `Show/evento listado pelo La Cumbuca em ${neighborhood}, ${event.city}.`,
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(event.id)}/600/400`,
      price,
      rating: Number((4.4 + ((seed % 7) / 10)).toFixed(1)),
      reviews: 12 + (seed % 240),
      date: formatDate(event),
      coordinates: rioCoordinate(seed + index),
      tags: ['Música', 'Show', 'Rio de Janeiro', neighborhood, 'La Cumbuca'].filter(Boolean),
    };
  });
}
