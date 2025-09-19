"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
// Load environment variables from .env file
dotenv.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
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
// Generate JSON from prompt
app.post('/api/generate-json', async (req, res) => {
    var _a, _b, _c, _d, _e;
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
        const response = await (0, node_fetch_1.default)(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
        const content = (_e = (_d = (_c = (_b = (_a = data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text;
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
        }
        catch (error) {
            console.error('Error parsing JSON response:', error);
            console.error('Response content:', content);
            throw new Error('Failed to parse AI response');
        }
        // Add timestamp if not present
        if (!result.timestamp) {
            result.timestamp = new Date().toISOString();
        }
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error generating JSON:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({
            error: 'Failed to generate JSON',
            details: errorMessage
        });
    }
});
// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
    app.use(express_1.default.static(path_1.default.join(__dirname, '../dist')));
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../dist', 'index.html'));
    });
}
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
exports.default = app;
