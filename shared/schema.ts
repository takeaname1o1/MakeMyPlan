import { z } from "zod";

export const itineraryRequestSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  duration: z.number().min(1).max(30),
  budget: z.enum(["Budget-friendly", "Moderate", "Luxury"]),
  interests: z.string().min(1, "Interests are required"),
});

export const itineraryResponseSchema = z.object({
  id: z.string(),
  destination: z.string(),
  duration: z.number(),
  budget: z.string(),
  interests: z.string(),
  itinerary: z.string(),
  createdAt: z.date(),
});

export type ItineraryRequest = z.infer<typeof itineraryRequestSchema>;
export type ItineraryResponse = z.infer<typeof itineraryResponseSchema>;
