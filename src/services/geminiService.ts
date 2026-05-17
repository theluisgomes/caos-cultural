import { GoogleGenAI, Type } from "@google/genai";
import { Listing, ListingType, UserProfile } from "../types";

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const fetchUserProfile = async (): Promise<UserProfile> => {
  // Simulate fetching the currently logged in user
  return {
    id: "u1",
    name: "Lívia K.",
    handle: "@liviak_art",
    role: "ARTIST",
    bio: "Explorando a dissonância cognitiva através da luz e som. Artista multimídia baseada em São Paulo. Criadora do coletivo NOITE.",
    location: "São Paulo, SP",
    avatarUrl: "https://picsum.photos/seed/avatar2/200/200",
    coverUrl: "https://picsum.photos/seed/coverArt/1200/400",
    disciplines: ["Visual Arts", "Projection Mapping", "Techno"],
    stats: {
      followers: 1204,
      following: 450,
      eventsAttended: 89,
      projectsCreated: 12
    },
    joinDate: "Membro desde 2022"
  };
};

export const fetchCulturalListings = async (category: string): Promise<Listing[]> => {
  // In a real scenario, this might fetch from a DB, but we use Gemini to generate cool mock data
  // to make the prototype feel alive with "real" artistic content.

  if (!ai) {
    console.warn("No Gemini API key found — using fallback data.");
    return getFallbackListings();
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Generate a list of 8 cultural listings for a web app called CAOS (Cultural Artistic Organization System).
    The category filter is currently: ${category || 'All'}.

    Include a mix of:
    - Events (concerts, exhibitions, plays)
    - Spaces (studios, galleries, theaters)
    - Artists (painters, musicians, performers offering services)
    - Experiences (workshops, tours)

    For the image URL, use https://picsum.photos/seed/{id}/600/400.
    Make the titles and descriptions sound artistic, hipster, and culturally relevant to a vibrant city like São Paulo or Berlin.
    Coordinates should be relative generic floats between 0 and 100 for a mock map (e.g., lat: 20-80, lng: 20-80).
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["EVENT", "SPACE", "ARTIST", "EXPERIENCE"] },
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              description: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              price: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              reviews: { type: Type.INTEGER },
              date: { type: Type.STRING },
              coordinates: {
                type: Type.OBJECT,
                properties: {
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER }
                }
              },
              tags: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    
    // Post-process to ensure valid types and image urls
    return data.map((item: any) => ({
      ...item,
      imageUrl: `https://picsum.photos/seed/${item.id}/600/400`, // Ensure image works
      type: item.type as ListingType
    }));

  } catch (error) {
    console.error("Failed to fetch content from Gemini:", error);
    return getFallbackListings();
  }
};

function getFallbackListings(): Listing[] {
  return [
    {
      id: "1",
      type: ListingType.EVENT,
      title: "Neon Jazz Night",
      subtitle: "Underground Bunker",
      description: "An immersive jazz experience with neon lights.",
      imageUrl: "https://picsum.photos/seed/jazz/600/400",
      price: "R$ 50",
      rating: 4.8,
      reviews: 124,
      date: "Esta Sexta",
      coordinates: { lat: 40, lng: 60 },
      tags: ["Music", "Jazz"]
    },
    {
      id: "2",
      type: ListingType.SPACE,
      title: "The White Cube",
      subtitle: "Galeria Minimalista",
      description: "Disponível para exposições pop-up e ensaios fotográficos.",
      imageUrl: "https://picsum.photos/seed/gallery/600/400",
      price: "R$ 200/hr",
      rating: 4.9,
      reviews: 85,
      coordinates: { lat: 30, lng: 30 },
      tags: ["Galeria", "Espaço"]
    },
    {
      id: "3",
      type: ListingType.ARTIST,
      title: "Lua Voss",
      subtitle: "Artista Multimídia",
      description: "Instalações sonoras e visuais que desafiam a percepção.",
      imageUrl: "https://picsum.photos/seed/artist3/600/400",
      price: "Consulte",
      rating: 4.7,
      reviews: 56,
      coordinates: { lat: 55, lng: 45 },
      tags: ["Arte Visual", "Instalação"]
    },
    {
      id: "4",
      type: ListingType.EXPERIENCE,
      title: "Workshop: Mapping 101",
      subtitle: "Sesc Pompéia",
      description: "Aprenda projeção mapeada com os melhores do underground.",
      imageUrl: "https://picsum.photos/seed/workshop4/600/400",
      price: "R$ 80",
      rating: 4.6,
      reviews: 38,
      date: "Sáb, 22 Nov",
      coordinates: { lat: 65, lng: 35 },
      tags: ["Workshop", "Projeção"]
    },
    {
      id: "5",
      type: ListingType.EVENT,
      title: "Exposição: Sombras Digitais",
      subtitle: "Galeria Vermelho",
      description: "Arte digital que habita o espaço entre o real e o virtual.",
      imageUrl: "https://picsum.photos/seed/expo5/600/400",
      price: "Grátis",
      rating: 5.0,
      reviews: 201,
      date: "Hoje, 20:00",
      coordinates: { lat: 35, lng: 70 },
      tags: ["Arte Digital", "Exposição"]
    },
    {
      id: "6",
      type: ListingType.SPACE,
      title: "Bunker Studio",
      subtitle: "Vila Madalena",
      description: "Estúdio subterrâneo para gravações e performances ao vivo.",
      imageUrl: "https://picsum.photos/seed/bunker6/600/400",
      price: "R$ 150/hr",
      rating: 4.8,
      reviews: 72,
      coordinates: { lat: 48, lng: 55 },
      tags: ["Estúdio", "Música"]
    },
    {
      id: "7",
      type: ListingType.ARTIST,
      title: "Coletivo NOITE",
      subtitle: "Arte Coletiva",
      description: "Performances de rua que transformam o cotidiano em arte.",
      imageUrl: "https://picsum.photos/seed/noite7/600/400",
      price: "Grátis",
      rating: 4.9,
      reviews: 145,
      coordinates: { lat: 25, lng: 62 },
      tags: ["Performance", "Arte de Rua"]
    },
    {
      id: "8",
      type: ListingType.EVENT,
      title: "Noite Techno: Rave Abstrata",
      subtitle: "Galpão Industrial, Brás",
      description: "Uma noite de techno experimental com DJs do underground europeu.",
      imageUrl: "https://picsum.photos/seed/techno8/600/400",
      price: "R$ 60",
      rating: 4.7,
      reviews: 318,
      date: "Sáb, 29 Nov",
      coordinates: { lat: 70, lng: 25 },
      tags: ["Techno", "Rave", "Música"]
    },
  ];
}