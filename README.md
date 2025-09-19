# Prompt to JSON Converter

A web application that converts natural language prompts into structured JSON output using AI.

## Features

- Convert natural language prompts to structured JSON
- Real-time preview of the generated JSON
- Copy JSON to clipboard with a single click
- Responsive design that works on all devices

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher) or yarn
- OpenAI API key

## Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_GIT_URL>
cd prompt-to-json-flow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory and add your OpenAI API key:

```env
# Frontend Environment Variables
VITE_API_URL="http://localhost:3001"

# Backend Environment Variables
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=your-openai-api-key-here
```

### 4. Start the development servers

#### Start the frontend (in a new terminal):
```bash
npm run dev
```

#### Start the backend server (in a new terminal):
```bash
npm run server
```

### 5. Open the application

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

## Development

### Available Scripts

- `npm run dev` - Start the frontend development server
- `npm run server` - Start the backend server
- `npm run server:dev` - Start the backend server with nodemon for auto-reloading
- `npm run build` - Build the frontend for production
- `npm run build:server` - Build the backend server
- `npm start` - Start the production server (after building)

## Project Structure

- `/src` - Frontend React application
- `/server` - Backend Express server
  - `index.ts` - Main server file
  - `tsconfig.json` - TypeScript configuration for the server

## Environment Variables

- `VITE_API_URL` - URL of the backend API (default: http://localhost:3001)
- `PORT` - Port for the backend server (default: 3001)
- `NODE_ENV` - Node environment (development/production)
- `OPENAI_API_KEY` - Your OpenAI API key

## License

MIT
