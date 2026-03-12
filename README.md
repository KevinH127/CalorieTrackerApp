# CalorieTracker

## Story

Like many others starting a fitness journey, I found calorie counting to be tedious and frustrating. The existing apps on the market were either cluttered with ads, hidden behind paywalls, or required navigating through endless search menus just to log a simple meal. I wanted a frictionless way to track my macros, hit my goals, and stay accountable without the friction.

There was just one problem: I didn't know most of the modern tech stack required to build a full-stack, authenticated web application. 

Instead of letting that hold me back, I leaned into AI as a collaborative pair-programmer. By breaking down the features I wanted and guiding the AI through the development process, I was able to architect, build, and deploy a robust Next.js application from scratch. This project is a testament to my ability to leverage cutting-edge AI tools to learn quickly, problem-solve complex architectural challenges, and execute a vision from concept to production.

## App Description

An AI-powered web application that helps users intuitively track their daily calorie intake and protein macros using Google's multimodal Gemini AI. 

Users can upload photos of their meals or type natural language descriptions (e.g., "6 oz chicken breast and 1 cup of white rice"), and the underlying AI will analyze the input, ground it in live Google Search data for accuracy, and instantly log the exact nutritional macros to a secure database.

## Core Features

- **Multimodal AI Logging**: Upload images of food or type what was eaten. The app uses `gemini-3-flash-preview` to identify the food and `googleSearch` grounding to retrieve accurate macro estimations.
- **Automated Macro Calculation**: Automatically calculates and tracks both **Calories** and **Protein** metrics.
- **Isolated User History**: Full authentication system ensures entries are private. 
- **Interactive Calendar**: A dedicated `/history` dashboard to visually review past login streaks and daily calorie/protein summaries.
- **Historical Backfilling**: Select a past date on the calendar to manually backfill old data and keep tracking streaks alive.
- **Responsive Design**: Purpose-built mobile-first UI using Tailwind CSS with glassmorphic aesthetics and smooth Framer Motion animations.

## Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion
- **Backend**: Next.js Server Actions, NextAuth.js v5
- **Database**: Prisma ORM + PostgreSQL (via Supabase)
- **AI Integration**: @google/generative-ai SDK (Structured JSON Outputs + Native Search Grounding)

## How it was Built

This project was built iteratively with a focus on seamless user experience:
1. **The UI Shell**: Started with a sleek, dark-themed, glassmorphic UI spanning a Main Dashboard and a Food Input form.
2. **AI Integration**: Hooked up Google's Gemini API to parse natural language and images. Configured the AI generation to strictly adhere to a mathematical JSON schema (`SchemaType.OBJECT`) so it reliably outputs `foodName`, `calories`, and `protein` properties without hallucinating formats. Injected a Google Search tool directly into the API call to let the AI search the internet for accurate nutrition facts before guessing.
3. **Data Layer**: Replaced early `localStorage` prototypes with a robust server-side Postgres database using Prisma ORM. 
4. **Authentication**: Secured the endpoints and database relations with NextAuth `Credentials` routing and `bcryptjs` password hashing, ensuring that data isolation is maintained and IDOR vulnerabilities are prevented.
5. **Mobile Polish**: Separated the main dashboard into `/` (Today's UI) and `/history` (Calendar UI) to guarantee a vertical, uncrowded experience on mobile devices.
