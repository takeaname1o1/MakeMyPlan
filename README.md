# Smart Itinerary Planner

## Overview

A full-stack web application that generates AI-powered travel itineraries. Users input their travel destination, duration, budget, and interests, and the application uses Google Gemini AI to create personalized day-by-day travel plans.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM (ready for integration)
- **AI Integration**: Google Gemini API
- **Session Storage**: In-memory storage (MemStorage class) with PostgreSQL support ready

### Key Components

#### Frontend Components
- **Home Page**: Main interface with travel form and itinerary display
- **UI Components**: Comprehensive shadcn/ui component library including buttons, forms, cards, toast notifications
- **Form Validation**: Zod schemas for type-safe form validation
- **API Client**: Custom query client with error handling

#### Backend Components
- **API Routes**: RESTful endpoint for itinerary generation (`/api/generate-itinerary`)
- **AI Service**: Google Gemini integration for natural language processing
- **Storage Layer**: Abstracted storage interface supporting both memory and database persistence
- **Request Validation**: Server-side validation using Zod schemas

#### Shared Components
- **Schema Definitions**: Shared TypeScript types and Zod validation schemas
- **Type Safety**: End-to-end type safety between frontend and backend

## Data Flow

1. **User Input**: User fills out travel form (destination, duration, budget, interests)
2. **Frontend Validation**: Client-side validation using Zod schemas
3. **API Request**: Form data sent to `/api/generate-itinerary` endpoint
4. **Server Processing**: Express server validates request and constructs AI prompt
5. **AI Generation**: Google Gemini API generates personalized itinerary
6. **Response Handling**: Server processes AI response and returns structured data
7. **UI Update**: Frontend displays generated itinerary with toast notification

## External Dependencies

### Core Dependencies
- **Google Gemini API**: AI-powered itinerary generation
- **Neon Database**: PostgreSQL hosting (configured but not yet active)
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework

### Development Tools
- **Vite**: Fast build tool and development server
- **TSX**: TypeScript execution for development
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React application to `dist/public`
- **Backend**: esbuild bundles TypeScript server to `dist/index.js`
- **Database**: Drizzle handles schema migrations

### Environment Configuration
- **Development**: Uses Vite dev server with Express API
- **Production**: Serves static files from Express with API routes
- **Database**: PostgreSQL connection via `DATABASE_URL` environment variable
- **AI API**: Requires `GEMINI_API_KEY` environment variable

### Key Architectural Decisions

#### Storage Abstraction
**Problem**: Need flexibility between development and production data storage
**Solution**: Abstract storage interface (`IStorage`) with memory-based development storage and PostgreSQL production storage
**Benefits**: Easy development setup, scalable production deployment

#### Shared Type System
**Problem**: Maintaining type consistency between frontend and backend
**Solution**: Shared schema definitions in `/shared` directory using Zod
**Benefits**: Compile-time type safety, reduced runtime errors, single source of truth

#### Component Library Choice
**Problem**: Need consistent, accessible UI components
**Solution**: shadcn/ui built on Radix UI primitives
**Benefits**: Accessible by default, customizable, TypeScript support

#### AI Integration Strategy
**Problem**: Secure API key management and reliable AI responses
**Solution**: Server-side AI calls with environment variable configuration
**Benefits**: API key security, server-side validation, error handling
