# Deep's Portfolio

A full-stack portfolio application built with React, TypeScript, Express, and Firebase.

The app supports authenticated portfolio management, public profile pages, GitHub repository integration, and AI-assisted README analysis for richer project descriptions.

## Tech Stack

- React 19 + TypeScript
- Vite (client bundling) + Express (Node server)
- Firebase Auth, Firestore, and Storage
- Tailwind CSS
- Google Gemini API (`@google/genai`) for README parsing

## Core Features

- OAuth sign-in (Google and GitHub)
- Profile setup with custom username routing (`/:username`)
- Dashboard for managing project entries
- Public portfolio/project display
- GitHub repository + README fetch endpoints
- AI-powered README parsing into structured project metadata

## Project Structure

- `src/pages` - App pages (`Home`, `Dashboard`, `Profile`, `SignIn`, `UsernameSetup`)
- `src/components` - Shared UI components
- `src/context` - Authentication state management
- `src/services` - Firestore and AI service helpers
- `src/lib/firebase.ts` - Firebase initialization
- `server.ts` - Express server, API routes, and Vite middleware

## Prerequisites

- Node.js 18+
- A Firebase project with Auth, Firestore, and Storage enabled
- A Gemini API key (required for AI README parsing)

## Environment Setup

Create a `.env` file in the project root with values such as:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
GITHUB_USERNAME=your_github_username
GITHUB_ACCOUNT_URL=https://github.com/your_github_username
```

Also ensure Firebase configuration files are present and valid:

- `firebase-applet-config.json`
- `firebase.json`
- `firestore.rules`
- `storage.rules`

## Local Development

1. Install dependencies:
   `npm install`
2. Start the development server:
   `npm run dev`
3. Open the app:
   `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start the Express + Vite development server
- `npm run build` - Build production assets with Vite
- `npm run preview` - Preview the built frontend
- `npm run start` - Start the server with `tsx server.ts`
- `npm run lint` - Type-check the project (`tsc --noEmit`)
- `npm run clean` - Remove the `dist` directory
