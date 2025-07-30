import { ItineraryResponse } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  saveItinerary(itinerary: ItineraryResponse): Promise<ItineraryResponse>;
  getItinerary(id: string): Promise<ItineraryResponse | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private itineraries: Map<string, ItineraryResponse>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.itineraries = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.currentId++;
    const user: any = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveItinerary(itinerary: ItineraryResponse): Promise<ItineraryResponse> {
    this.itineraries.set(itinerary.id, itinerary);
    return itinerary;
  }

  async getItinerary(id: string): Promise<ItineraryResponse | undefined> {
    return this.itineraries.get(id);
  }
}

export const storage = new MemStorage();
