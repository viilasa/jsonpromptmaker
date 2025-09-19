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
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

if (!GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set in environment variables. Using default key.');
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
