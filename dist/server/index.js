import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);
import w from"express";import P from"cors";import*as T from"dotenv";import{fileURLToPath as O}from"url";import g,{dirname as C,join as f}from"path";import{existsSync as m,readdirSync as x,readFileSync as b}from"fs";import j from"body-parser";var u,S;try{u=O(import.meta.url),S=C(u)}catch{u=u||"",S=S||""}T.config();var r=w(),h=Number(process.env.PORT)||3001;r.use(P());r.use(j.json());r.get("/health",(e,t)=>{t.status(200).json({status:"ok",timestamp:new Date().toISOString(),uptime:process.uptime(),memory:process.memoryUsage(),env:process.env.NODE_ENV||"development"})});var y=process.env.GEMINI_API_KEY||"AIzaSyB-t16TK4F8lpuCob0wsUwQAm03jrGUiyY",N="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";y||console.warn("Warning: GEMINI_API_KEY is not set in environment variables. Using default key.");r.post("/api/enhance-prompt",async(e,t)=>{try{let{prompt:o,input:s,fieldType:i}=e.body;if(!s||typeof s!="string")return t.status(400).json({error:"Invalid input"});let l=o||`You are a master AI prompt engineer specializing in creating highly detailed, vivid, and creative image generation prompts. Your expertise is in transforming simple concepts into rich, descriptive prompts that capture the essence and imagination of the original idea.

INPUT: "${s}"

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
}`,n=await fetch(`${N}?key=${y}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:l}]}],generationConfig:{temperature:.7,topP:.9,maxOutputTokens:1e3}})});if(!n.ok)throw new Error(`API request failed with status ${n.status}`);let c=(await n.json()).candidates?.[0]?.content?.parts?.[0]?.text?.trim();if(!c)throw new Error("Failed to enhance input");let v;try{v=JSON.parse(c)}catch{v={enhanced:s,reasoning:"Enhanced with AI assistance",confidence:75,suggestions:["Add more descriptive details","Include lighting information","Specify textures and materials"]}}t.json(v)}catch(o){console.error("Error enhancing prompt:",o),t.status(500).json({error:"Failed to enhance prompt",details:o instanceof Error?o.message:"Unknown error",enhanced:e.body.input,reasoning:"Using original input due to enhancement service error",confidence:50,suggestions:["Add more descriptive details","Include lighting information","Specify textures and materials"]})}});r.post("/api/generate-image-prompt",async(e,t)=>{try{let{config:o}=e.body;if(!o||typeof o!="object")return t.status(400).json({error:"Invalid configuration"});let s=`You are a professional AI prompt engineer specializing in creating highly detailed, cinematic, and visually stunning image generation prompts. Your task is to create a prompt that would generate professional-quality images similar to those created on Leonardo.AI.

IMAGE GENERATION INSTRUCTIONS:
1. Create a detailed, vivid, and visually rich description based on the following parameters:
   - MAIN SUBJECT: ${o.subject||"Not specified"}
   - ART STYLE: ${o.style||"Photorealistic"}
   - LIGHTING: ${o.lighting||"Dramatic cinematic lighting"}
   - COMPOSITION: ${o.composition?.join(", ")||"Professional composition"}
   - QUALITY: ${o.quality||"8"}/10 (where 10 is maximum quality)
   - ASPECT RATIO: ${o.aspectRatio||"1:1"}

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

PROMPT TO GENERATE:`,i=await fetch(`${N}?key=${y}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:s}]}],generationConfig:{temperature:.8,topP:.9,topK:40,maxOutputTokens:1024}})});if(!i.ok)throw new Error(`API request failed with status ${i.status}`);let n=(await i.json()).candidates?.[0]?.content?.parts?.[0]?.text?.trim();if(!n)throw new Error("Failed to generate prompt");n=R(n);let d=["low quality","blurry","distorted","extra limbs","bad anatomy","poorly drawn","cloned face","disfigured","deformed","poor details","ugly","duplicate","morbid","mutilated","extra fingers","mutated hands","poorly drawn hands","mutation","deformed","bad proportions","extra limbs","extra legs","extra arms","disfigured","bad anatomy","gross proportions","malformed limbs","missing arms","missing legs","extra digits","fused digits","too many fingers","long neck","text","watermark","signature","logo"].join(", ");t.json({prompt:n,negative_prompt:o.negativePrompt||d,width:o.width||1024,height:o.height||1024,num_inference_steps:o.steps||30,guidance_scale:o.cfgScale||7.5,model:o.model||"Stable Diffusion XL",sampler:o.sampler||"k_euler_ancestral",seed:o.seed,high_noise_frac:.8,preset:"photography",prompt_magic:!0,prompt_magic_version:"v3",prompt_magic_strength:.8})}catch(o){console.error("Error generating image prompt:",o);let s=o instanceof Error?o.message:"An unknown error occurred";t.status(500).json({error:"Failed to generate prompt",details:s})}});function R(e){return e=e.replace(/\n/g," ").replace(/\s+/g," ").trim(),e=e.replace(/^["']|["']$/g,""),/[.!?]$/.test(e)||(e=e+"."),["highly detailed","intricate details","sharp focus","8k","4k","unreal engine 5","octane render","cinematic lighting","professional photography","artstation","concept art","digital art","trending on artstation"].forEach(o=>{e.toLowerCase().includes(o.toLowerCase())||(e+=`, ${o}`)}),e}r.post("/api/generate-json",async(e,t)=>{try{let{prompt:o}=e.body;if(!o)return t.status(400).json({error:"Prompt is required"});let s=`You are an AI assistant that enhances and structures prompts into comprehensive, detailed JSON outputs.
    
    TASK:
    1. ENHANCE the following prompt by adding more detail, context, and specificity
    2. STRUCTURE the enhanced output as a well-formatted JSON object
    3. INCLUDE all relevant details from the original prompt
    
    REQUIREMENTS:
    - The output MUST be valid JSON
    - Include all key elements from the original prompt
    - Add relevant context and details
    - Use proper JSON formatting with escaped characters
    
    ORIGINAL PROMPT: "${o}"
    
    ENHANCED OUTPUT (as JSON):`,i=await fetch(`${N}?key=${y}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:s}]}],generationConfig:{temperature:.7,topP:.8,topK:40,maxOutputTokens:1024,responseMimeType:"application/json"}})});if(!i.ok){let c=await i.text();throw console.error("Gemini API error:",c),new Error(`Gemini API request failed with status ${i.status}`)}let l=await i.json(),n=l.candidates?.[0]?.content?.parts?.[0]?.text;if(!n)throw console.error("Unexpected Gemini API response:",l),new Error("No content received from the AI model");let d;try{let c=n.match(/```(?:json)?\n([\s\S]*?)\n```/);d=JSON.parse(c?c[1]:n)}catch(c){throw console.error("Error parsing JSON response:",c),console.error("Response content:",n),new Error("Failed to parse AI response")}d.timestamp||(d.timestamp=new Date().toISOString()),t.status(200).json(d)}catch(o){console.error("Error generating JSON:",o),t.status(500).json({error:"Failed to generate JSON"})}});var a=f(process.cwd(),"dist/client"),p=f(a,"index.html");console.log("Current working directory:",process.cwd());console.log("Client dist path:",a);console.log("Index path:",p);console.log("Directory exists:",m(a));console.log("Index.html exists:",m(p));m(a)&&(console.log("Client dist directory contents:",x(a)),m(f(a,"assets"))&&console.log("Assets directory contents:",x(f(a,"assets"))));r.use(w.static(a,{etag:!0,lastModified:!0,maxAge:"1y",setHeaders:(e,t)=>{t.endsWith(".js")||t.endsWith(".css")||t.endsWith(".png")||t.endsWith(".jpg")||t.endsWith(".svg")?e.setHeader("Cache-Control","public, max-age=31536000, immutable"):e.setHeader("Cache-Control","no-cache, no-store, must-revalidate")}}));if(m(p))try{let e=b(p,"utf-8");console.log("Index.html content (first 500 chars):",e.substring(0,500))}catch(e){console.error("Error reading index.html:",e)}r.use("/api",(e,t,o)=>{o()});r.get(/^(?!\/api).*/,(e,t,o)=>{if(g.extname(e.path).length>1){let i=e.path.split(g.sep).join(g.posix.sep),l=g.join(a,i);if(m(l))return t.sendFile(l,n=>{n&&(console.error(`Error serving file ${e.path}:`,n),I(t))})}I(t)});function I(e){if(console.log("Serving index.html for SPA routing"),!m(p))return console.error("Error: index.html not found at",p),e.status(500).send("Application not built properly");e.setHeader("Content-Type","text/html"),e.sendFile(p,t=>{t&&(console.error("Error serving index.html:",t),e.headersSent||e.status(500).send("Error loading the application"))})}r.use((e,t,o,s)=>{console.error("Unhandled error:",{message:e.message,stack:e.stack,path:t.path,method:t.method,headers:t.headers}),o.status(500).json({error:"Internal Server Error",message:process.env.NODE_ENV==="production"?"An unexpected error occurred":e.message,...process.env.NODE_ENV==="development"?{stack:e.stack,path:t.path,method:t.method}:{}})});r.use((e,t,o)=>{if(console.log(`404 - ${e.method} ${e.path}`),e.path.startsWith("/api/"))return t.status(404).json({error:"Not Found",message:`The requested resource ${e.path} was not found`});I(t)});var U="0.0.0.0",A=r.listen(h,U,()=>{console.log(`
=== Server Started ===`),console.log(`Server is running on port ${h}`),console.log(`Environment: ${process.env.NODE_ENV||"development"}`),console.log(`Node.js version: ${process.version}`),console.log(`Platform: ${process.platform} ${process.arch}`),console.log(`Process ID: ${process.pid}`),console.log(`Serving static files from: ${a}`),console.log(`Health check: http://localhost:${h}/health`),console.log(`Press Ctrl+C to stop the server
`);let e=process.memoryUsage();for(let[t,o]of Object.entries(e))console.log(`Memory: ${t} ${Math.round(o/1024/1024*100)/100} MB`)}),E=()=>new Promise((e,t)=>{A.close(o=>{o?(console.error("Error closing server:",o),t(o)):(console.log("Server closed"),e())})});process.on("SIGTERM",()=>{console.log("SIGTERM received. Shutting down gracefully..."),E().then(()=>process.exit(0))});process.on("SIGINT",()=>{console.log("SIGINT received. Shutting down gracefully..."),E().then(()=>process.exit(0))});process.on("uncaughtException",e=>{console.error("Uncaught Exception:",e),E().then(()=>process.exit(1))});process.on("unhandledRejection",(e,t)=>{console.error("Unhandled Rejection at:",t,"reason:",e),E().then(()=>process.exit(1))});A.on("error",e=>{if(e.syscall!=="listen")throw e;let t=typeof h=="string"?"Pipe "+h:"Port "+h;switch(e.code){case"EACCES":console.error(t+" requires elevated privileges"),process.exit(1);break;case"EADDRINUSE":console.error(t+" is already in use"),process.exit(1);break;default:throw e}});var J=r;export{E as closeServer,J as default};
//# sourceMappingURL=index.js.map