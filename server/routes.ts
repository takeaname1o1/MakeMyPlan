import { GoogleGenAI } from "@google/genai";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { fromZodError } from "zod-validation-error";
import { storage } from "./storage";
import { itineraryRequestSchema, type ItineraryRequest, type ItineraryResponse } from "@shared/schema";
import 'dotenv/config'; // Loads .env if present

export async function registerRoutes(app: Express): Promise<Server> {
  app.post('/api/generate-itinerary', async (req, res) => {
    try {
      // Validate request body  
      const validationResult = itineraryRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({
          error: `Validation failed: ${validationError.message}`
        });
      }

      const { destination, duration, budget, interests }: ItineraryRequest = validationResult.data;

      // Check API key
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'Server configuration error: AI API key is missing.'
        });
      }

      // Gemini SDK client
      const genAI = new GoogleGenAI({ apiKey });

      // Build the prompt as before
      const prompt = `
        You are an expert local guide for Shillong, known for creating vibrant, detailed, and practical travel itineraries. Your tone is friendly, insightful, and enthusiastic.

        Generate a comprehensive day-by-day travel plan based on the following user request.

        **User Request:**
        - **Destination:** ${destination}
        - **Trip Duration:** ${duration} days
        - **Budget Style:** ${budget}
        - **Primary Interests:** ${interests}

        **Your Task:**
        Create a rich itinerary that goes beyond basic suggestions. The final output must be a single Markdown block and must include the following sections:

        1.  **Quick Overview:** A brief, exciting summary of the trip you've planned.
        2.  **Good to Know:**
            * Mention the likely weather. For Shillong, assume potential for scattered thunderstorms and advise packing accordingly (e.g., rain jacket, umbrella).
            * Include 2-3 fascinating "Fun Facts" about the destination. Examples: Shillong is the "Rock Music Capital of India," its connection to the "Scotland of the East" nickname, or Meghalaya's unique matrilineal society.
        3.  **Pro-Tips for Travelers:**
            * Provide actionable advice. Examples: "Carry cash for local markets," "Hire a reliable local taxi for day trips," "Always ask for permission before photographing people."
        4.  **Your Detailed Itinerary:**
            * Structure the plan day-by-day (e.g., "**Day 1: Arrival and City Vibes**").
            * For each day, suggest a mix of activities that match the user's interests. Include both popular attractions (like Ward's Lake, Elephant Falls) and unique, offbeat experiences (like Laitlum Canyons, Mawphlang Sacred Forest, or a visit to a local market like Iewduh).
            * Provide vivid, brief descriptions for each suggestion.
            * Include practical details like estimated costs (in INR), travel times for day trips, and food recommendations (mentioning specific local dishes like Jadoh or Dohneiiong).
            * Ensure the entire response is a single, clean Markdown text block. Do not include any introductory or concluding text outside of this structure.
      `;

      // Generate content via SDK
      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash-latest",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      });

      const itineraryText = result.text;

      if (!itineraryText || itineraryText.trim() === '') {
        throw new Error('Empty response from AI service');
      }

      // Create response object
      const itineraryResponse: ItineraryResponse = {
        id: Math.random().toString(36).substring(7),
        destination,
        duration,
        budget,
        interests,
        itinerary: itineraryText,
        createdAt: new Date(),
      };

      await storage.saveItinerary(itineraryResponse);

      res.json(itineraryResponse);

    } catch (error: any) {
  // Log the full error details for debugging purposes
  console.error('Error in /api/generate-itinerary:', {
    message: error.message,
    status: error.status,
    stack: error.stack,
    response: error.response, // If error is from HTTP client
  });
  // ... (error response as below)
}
  });

  const httpServer = createServer(app);
  return httpServer;
}
