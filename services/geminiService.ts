import { GoogleGenAI, Type } from "@google/genai";
import { Listing, ListingType, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    // Fallback data in case of API failure
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
        date: "This Friday",
        coordinates: { lat: 40, lng: 60 },
        tags: ["Music", "Jazz"]
      },
      {
        id: "2",
        type: ListingType.SPACE,
        title: "The White Cube",
        subtitle: "Minimalist Gallery",
        description: "Available for pop-up exhibitions and photo shoots.",
        imageUrl: "https://picsum.photos/seed/gallery/600/400",
        price: "R$ 200/hr",
        rating: 4.9,
        reviews: 85,
        coordinates: { lat: 30, lng: 30 },
        tags: ["Gallery", "Space"]
      }
    ];
  }
};