import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { fileURLToPath } from 'node:url';
import path, { dirname, join } from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'fs';
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
const port = Number(process.env.PORT) || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyB-t16TK4F8lpuCob0wsUwQAm03jrGUiyY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

if (!GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set in environment variables. Using default key.');
}

// Add this new endpoint for AI-powered input enhancement
app.post('/api/enhance-prompt', async (req, res) => {
  try {
    const { prompt, input, fieldType } = req.body;

    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Use the provided prompt or create a default enhancement prompt
    const enhancementPrompt = prompt || `You are a master AI prompt engineer specializing in creating highly detailed, vivid, and creative image generation prompts. Your expertise is in transforming simple concepts into rich, descriptive prompts that capture the essence and imagination of the original idea.

INPUT: "${input}"

TASK: Transform this simple concept into a highly detailed, vivid, and imaginative prompt suitable for AI image generation. Create a surreal, artistic, and visually stunning description that brings the concept to life with rich detail.

1. ENHANCED VERSION: Create a detailed, vivid description that transforms the simple concept into something magical and visually compelling
2. REASONING: Explain how you interpreted the concept and what creative elements you added
3. CONFIDENCE: How confident you are in this enhancement (0-100%)
4. SUGGESTIONS: 3 alternative creative interpretations

CREATIVE FOCUS:
- Transform simple concepts into surreal, artistic visions
- Add rich sensory details (textures, colors, lighting)
- Include imaginative elements that elevate the concept
- Use descriptive language that paints vivid mental pictures
- Add artistic style elements (hyper-realistic, fantasy, surreal)
- Include environmental and atmospheric details
- Use professional art and photography terminology

EXAMPLE TRANSFORMATION:
Input: "a cat wearing a hat"
Enhanced: "A majestic feline adorned with an elaborate Victorian top hat, its fur rendered in hyper-realistic detail with each individual hair catching the golden hour light, surrounded by floating feathers and magical sparkles, in the style of whimsical fantasy art, trending on ArtStation"

RESPONSE FORMAT (JSON):
{
  "enhanced": "your highly detailed and creative enhanced version here",
  "reasoning": "your explanation of the creative transformation here",
  "confidence": 95,
  "suggestions": ["alternative 1", "alternative 2", "alternative 3"]
}`;

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
                text: enhancementPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const enhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!enhancedText) {
      throw new Error('Failed to enhance input');
    }

    // Try to parse the JSON response from Gemini
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(enhancedText);
    } catch (parseError) {
      // If parsing fails, create a fallback response
      parsedResponse = {
        enhanced: input,
        reasoning: "Enhanced with AI assistance",
        confidence: 75,
        suggestions: ["Add more descriptive details", "Include lighting information", "Specify textures and materials"]
      };
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    res.status(500).json({
      error: 'Failed to enhance prompt',
      details: error instanceof Error ? error.message : 'Unknown error',
      enhanced: req.body.input, // Return original input as fallback
      reasoning: "Using original input due to enhancement service error",
      confidence: 50,
      suggestions: ["Add more descriptive details", "Include lighting information", "Specify textures and materials"]
    });
  }
});
app.post('/api/generate-image-prompt', async (req, res) => {
  try {
    const { config } = req.body;

    if (!config || typeof config !== 'object') {
      return res.status(400).json({ error: 'Invalid configuration' });
    }

    // Enhanced prompt template for professional image generation
    const systemPrompt = `You are a professional AI prompt engineer specializing in creating highly detailed, cinematic, and visually stunning image generation prompts. Your task is to create a prompt that would generate professional-quality images similar to those created on Leonardo.AI.

IMAGE GENERATION INSTRUCTIONS:
1. Create a detailed, vivid, and visually rich description based on the following parameters:
   - MAIN SUBJECT: ${config.subject || 'Not specified'}
   - ART STYLE: ${config.style || 'Photorealistic'}
   - LIGHTING: ${config.lighting || 'Dramatic cinematic lighting'}
   - COMPOSITION: ${config.composition?.join(', ') || 'Professional composition'}
   - QUALITY: ${config.quality || '8'}/10 (where 10 is maximum quality)
   - ASPECT RATIO: ${config.aspectRatio || '1:1'}

2. INCLUDE THESE ELEMENTS IN THE PROMPT:
   - Detailed description of the main subject with specific details
   - Vivid descriptions of textures, materials, and surfaces
   - Specific lighting conditions and atmosphere
   - Color palette and mood
   - Camera angle and framing details
   - Professional photography/cinematography terms
   - Any relevant artistic influences or references

3. FORMAT REQUIREMENTS:
   - Use professional, descriptive language
   - Structure the prompt with clear, comma-separated elements
   - Include technical photography/cinematography terms
   - Keep it concise but detailed (2-4 sentences)
   - Focus on visual elements that would help an image generation model
   - Use power words that emphasize quality and detail

4. EXAMPLE STRUCTURE:
   "[Subject description], [detailed physical attributes], [action/pose], [clothing/detailing], [lighting conditions], [color scheme], [art style], [camera details], [mood/atmosphere], [professional photography terms], [quality descriptors]"

PROMPT TO GENERATE:`;

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
          temperature: 0.8,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    let generatedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedPrompt) {
      throw new Error('Failed to generate prompt');
    }

    // Post-process the generated prompt
    generatedPrompt = postProcessPrompt(generatedPrompt);

    // Enhanced negative prompt
    const enhancedNegativePrompt = [
      'low quality', 'blurry', 'distorted', 'extra limbs', 'bad anatomy',
      'poorly drawn', 'cloned face', 'disfigured', 'deformed', 'poor details',
      'ugly', 'duplicate', 'morbid', 'mutilated', 'extra fingers',
      'mutated hands', 'poorly drawn hands', 'mutation', 'deformed',
      'bad proportions', 'extra limbs', 'extra legs', 'extra arms',
      'disfigured', 'bad anatomy', 'gross proportions', 'malformed limbs',
      'missing arms', 'missing legs', 'extra digits', 'fused digits',
      'too many fingers', 'long neck', 'text', 'watermark', 'signature', 'logo'
    ].join(', ');

    res.json({
      prompt: generatedPrompt,
      negative_prompt: config.negativePrompt || enhancedNegativePrompt,
      width: config.width || 1024,
      height: config.height || 1024,
      num_inference_steps: config.steps || 30,
      guidance_scale: config.cfgScale || 7.5,
      model: config.model || 'Stable Diffusion XL',
      sampler: config.sampler || 'k_euler_ancestral',
      seed: config.seed,
      high_noise_frac: 0.8,
      preset: 'photography',
      prompt_magic: true,
      prompt_magic_version: 'v3',
      prompt_magic_strength: 0.8
    });

  } catch (error: unknown) {
    console.error('Error generating image prompt:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({
      error: 'Failed to generate prompt',
      details: errorMessage
    });
  }
});

// Helper function to clean and enhance the generated prompt
function postProcessPrompt(prompt: string): string {
  // Remove any line breaks and extra spaces
  prompt = prompt.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

  // Remove any quotes if present
  prompt = prompt.replace(/^["']|["']$/g, '');

  // Ensure the prompt ends with a period
  if (!/[.!?]$/.test(prompt)) {
    prompt = prompt + '.';
  }

  // Add some quality boosters if not already present
  const qualityBoosters = [
    'highly detailed', 'intricate details', 'sharp focus', '8k', '4k',
    'unreal engine 5', 'octane render', 'cinematic lighting', 'professional photography',
    'artstation', 'concept art', 'digital art', 'trending on artstation'
  ];

  // Add quality boosters if they're not already in the prompt
  qualityBoosters.forEach(booster => {
    if (!prompt.toLowerCase().includes(booster.toLowerCase())) {
      prompt += `, ${booster}`;
    }
  });

  return prompt;
}

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
const indexPath = join(clientDistPath, 'index.html');

// Log the paths for debugging
console.log('Current working directory:', process.cwd());
console.log('Client dist path:', clientDistPath);
console.log('Index path:', indexPath);
console.log('Directory exists:', existsSync(clientDistPath));
console.log('Index.html exists:', existsSync(indexPath));

// Log directory contents for debugging
if (existsSync(clientDistPath)) {
  console.log('Client dist directory contents:', readdirSync(clientDistPath));
  if (existsSync(join(clientDistPath, 'assets'))) {
    console.log('Assets directory contents:', readdirSync(join(clientDistPath, 'assets')));
  }
}

// Serve static files with proper caching headers
app.use(express.static(clientDistPath, {
  etag: true,
  lastModified: true,
  maxAge: '1y',
  setHeaders: (res, path) => {
    // Cache static assets for 1 year
    if (path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.svg')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      // No cache for HTML files
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Log the contents of index.html for debugging
if (existsSync(indexPath)) {
  try {
    const indexContent = readFileSync(indexPath, 'utf-8');
    console.log('Index.html content (first 500 chars):', indexContent.substring(0, 500));
  } catch (err) {
    console.error('Error reading index.html:', err);
  }
}

// Handle API routes
app.use('/api', (req, res, next) => {
  next();
});

// Handle client-side routing - must be the last route
app.get(/^(?!\/api).*/, (req, res, next) => {
  // Check if the request is for a file with an extension
  const hasExtension = path.extname(req.path).length > 1;
  
  // If it's a file request with an extension, try to serve it
  if (hasExtension) {
    // Use path.posix for consistent path handling across platforms
    const normalizedPath = req.path.split(path.sep).join(path.posix.sep);
    const filePath = path.join(clientDistPath, normalizedPath);
    
    // Check if the file exists
    if (existsSync(filePath)) {
      return res.sendFile(filePath, (err: NodeJS.ErrnoException | null) => {
        if (err) {
          console.error(`Error serving file ${req.path}:`, err);
          // If there's an error serving the file, fall back to index.html
          serveIndexHtml(res);
        }
      });
    }
  }
  
  // For all other requests, serve index.html
  serveIndexHtml(res);
});

// Helper function to serve index.html
function serveIndexHtml(res: Response) {
  console.log('Serving index.html for SPA routing');
  
  // Check if index.html exists
  if (!existsSync(indexPath)) {
    console.error('Error: index.html not found at', indexPath);
    return res.status(500).send('Application not built properly');
  }
  
  // Set content type explicitly
  res.setHeader('Content-Type', 'text/html');
  
  // Send the file
  res.sendFile(indexPath, (err: NodeJS.ErrnoException | null) => {
    if (err) {
      console.error('Error serving index.html:', err);
      if (!res.headersSent) {
        res.status(500).send('Error loading the application');
      }
    }
  });
}

// Error handling middleware - must be after all other routes
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    headers: req.headers
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' ? { 
      stack: err.stack,
      path: req.path,
      method: req.method
    } : {})
  });
});

// Handle 404 - Must be after all other routes but before error handling
app.use((req, res, next) => {
  console.log(`404 - ${req.method} ${req.path}`);
  
  // If it's an API request, return JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'Not Found',
      message: `The requested resource ${req.path} was not found`
    });
  }
  
  // For all other routes, serve the SPA's index.html for client-side routing
  serveIndexHtml(res);
});

// Start the server with error handling
const host = '0.0.0.0';
const server = app.listen(port, host, () => {
  console.log(`\n=== Server Started ===`);
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Node.js version: ${process.version}`);
  console.log(`Platform: ${process.platform} ${process.arch}`);
  console.log(`Process ID: ${process.pid}`);
  console.log(`Serving static files from: ${clientDistPath}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log('Press Ctrl+C to stop the server\n');
  
  // Log memory usage
  const used = process.memoryUsage();
  for (const [key, value] of Object.entries(used)) {
    console.log(`Memory: ${key} ${Math.round(value / 1024 / 1024 * 100) / 100} MB`);
  }
});

// Handle server errors
export const closeServer = () => {
  return new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) {
        console.error('Error closing server:', err);
        reject(err);
      } else {
        console.log('Server closed');
        resolve();
      }
    });
  });
};

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  closeServer().then(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  closeServer().then(() => process.exit(0));
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  closeServer().then(() => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  closeServer().then(() => process.exit(1));
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

export default app;
