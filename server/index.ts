import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import bodyParser from 'body-parser';
import type { Request, Response, NextFunction } from 'express';

// Get directory name in a way that works with both ESM and CommonJS
let __filename: string, __dirname: string;
try {
  // @ts-ignore - This works in ESM
  __filename = fileURLToPath(import.meta.url);
  __dirname = dirname(__filename);
} catch (e) {
  // Fallback for CommonJS
  // @ts-ignore - This works in CommonJS
  __filename = __filename || '';
  // @ts-ignore - This works in CommonJS
  __dirname = __dirname || '';
}

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyB-t16TK4F8lpuCob0wsUwQAm03jrGUiyY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

if (!GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set in environment variables. Using default key.');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.post('/api/generate-json', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Enhanced prompt for Gemini
    const systemPrompt = `You are an AI assistant that enhances and structures prompts into comprehensive, detailed JSON outputs.
    
    TASK:
    1. ENHANCE the following prompt by adding more detail, context, and specificity
    2. STRUCTURE the enhanced output as a well-formatted JSON object
    3. INCLUDE all relevant details from the original prompt
    
    REQUIREMENTS:
    - The output MUST be valid JSON
    - Include all key elements from the original prompt
    - Add relevant context and details
    - Use proper JSON formatting with escaped characters
    
    ORIGINAL PROMPT: "${prompt}"
    
    ENHANCED OUTPUT (as JSON):`;

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the JSON content from the response
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      console.error('Unexpected Gemini API response:', data);
      throw new Error('No content received from the AI model');
    }

    // Parse the JSON content
    let result;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\n([\s\S]*?)\n```/);
      result = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(content);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      console.error('Response content:', content);
      throw new Error('Failed to parse AI response');
    }
    
    // Add timestamp if not present
    if (!result.timestamp) {
      result.timestamp = new Date().toISOString();
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error generating JSON:', error);
    res.status(500).json({ error: 'Failed to generate JSON' });
  }
});

// Serve static files from the Vite build
const clientDistPath = join(process.cwd(), 'dist/client');
app.use(express.static(clientDistPath));

// Handle SPA routing - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(clientDistPath, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
