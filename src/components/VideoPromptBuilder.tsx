import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Video, Sparkles, Brain, RotateCcw, Copy, Download, Eye } from "lucide-react";

// Video-specific types
interface VideoPromptConfig {
  subject: string;
  style: string;
  duration: number;
  resolution: string;
  cameraMovement: string[];
  lighting: string;
  musicStyle: string;
  pacing: string;
  visualEffects: string[];
  targetAudience: string;
  aspectRatio: AspectRatioOption | string;
  negativePrompt: string;
  fps: number;
  quality: number;
  sceneTransitions: string;
}

interface AspectRatioOption {
  value: string;
  label: string;
}

interface GeneratedVideoPrompt {
  prompt_id: string;
  version: string;
  title: string;
  description: string;
  metadata: {
    creation_date: string;
    author: string;
    tags: string[];
    category: string;
    complexity: string;
  };
  video_parameters: {
    subject: {
      main_character: string;
      setting: string;
      action: string;
      mood: string;
      visual_elements: string[];
    };
    production: {
      style: string;
      duration_seconds: number;
      resolution: string;
      frame_rate: number;
      aspect_ratio: string;
      quality_level: string;
    };
    camera: {
      movement_techniques: string[];
      shot_types: string[];
      angles: string[];
      transitions: string;
    };
    lighting: {
      primary_source: string;
      mood: string;
      effects: string[];
    };
    audio: {
      music_style: string;
      sound_design: string;
      voice_over: string;
      ambient_sounds: string[];
    };
    editing: {
      pacing: string;
      rhythm: string;
      cuts_per_minute: number;
      visual_effects: string[];
      color_grading: string;
    };
    narrative: {
      target_audience: string;
      tone: string;
      message: string;
      emotional_impact: string;
    };
  };
  output_requirements: {
    video_format: string;
    target_file_size_mb: string;
    quality_level: string;
    audio_format: string;
  };
  negative_prompt: string;
  width: number;
  height: number;
  total_frames: number;
  estimated_render_time: string;
  seed: number;
}

export const VideoPromptBuilder = ({ onBack }: { onBack: () => void }) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedVideoPrompt | null>(null);

  const [config, setConfig] = useState<VideoPromptConfig>(() => ({
    subject: "",
    style: "cinematic",
    duration: 30,
    resolution: "1080p",
    cameraMovement: ["steady cam"],
    lighting: "cinematic lighting",
    musicStyle: "dramatic orchestral",
    pacing: "moderate",
    visualEffects: ["color grading"],
    targetAudience: "general",
    aspectRatio: { value: "16:9", label: "Widescreen (16:9)" },
    negativePrompt: "blurry, low quality, distorted, static camera, poor lighting, bad audio, amateur production, inconsistent style, choppy editing, watermark, text overlay",
    fps: 30,
    quality: 8,
    sceneTransitions: "smooth cuts"
  }));

  // Video styles
  const videoStyles = [
    "cinematic",
    "documentary",
    "animation",
    "motion graphics",
    "experimental",
    "commercial",
    "music video",
    "vlog",
    "tutorial",
    "news"
  ];

  // Video resolutions
  const resolutions = [
    "720p",
    "1080p",
    "1440p",
    "4K",
    "8K"
  ];

  // Camera movements
  const cameraMovements = [
    "steady cam",
    "tracking shot",
    "zoom in",
    "zoom out",
    "pan left",
    "pan right",
    "tilt up",
    "tilt down",
    "dolly in",
    "dolly out",
    "crane shot",
    "handheld",
    "drone shot",
    "orbit"
  ];

  // Lighting options
  const lightingOptions = [
    "cinematic lighting",
    "natural lighting",
    "studio lighting",
    "dramatic lighting",
    "neon lighting",
    "golden hour",
    "night lighting",
    "practical lighting"
  ];

  // Music styles
  const musicStyles = [
    "dramatic orchestral",
    "electronic",
    "ambient",
    "rock",
    "pop",
    "classical",
    "jazz",
    "hip hop",
    "folk",
    "no music"
  ];

  // Pacing options
  const pacingOptions = [
    "slow and contemplative",
    "moderate",
    "fast-paced",
    "dynamic",
    "rhythmic"
  ];

  // Visual effects
  const visualEffectsList = [
    "color grading",
    "motion blur",
    "depth of field",
    "particle effects",
    "text overlays",
    "transitions",
    "filters",
    "slow motion",
    "time lapse",
    "CGI elements"
  ];

  // Target audience
  const targetAudiences = [
    "general",
    "children",
    "teenagers",
    "young adults",
    "adults",
    "professionals",
    "seniors"
  ];

  // Aspect ratios
  const aspectRatios: AspectRatioOption[] = [
    { value: "16:9", label: "Widescreen (16:9)" },
    { value: "1:1", label: "Square (1:1)" },
    { value: "9:16", label: "Vertical (9:16)" },
    { value: "21:9", label: "Ultra-wide (21:9)" },
    { value: "4:3", label: "Classic (4:3)" },
    { value: "2.35:1", label: "Cinematic (2.35:1)" }
  ];

  // AI-powered video prompt enhancement with retry logic
  const enhanceVideoPromptWithAI = async (input: string, parameters: VideoPromptConfig): Promise<string> => {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        setIsGenerating(true);

        const enhancementPrompt = `Transform this concept into a detailed, professional video generation prompt with the following specifications:

INPUT: "${input}"
STYLE: ${parameters.style}
DURATION: ${parameters.duration} seconds
RESOLUTION: ${parameters.resolution}
CAMERA MOVEMENT: ${parameters.cameraMovement.join(', ')}
LIGHTING: ${parameters.lighting}
MUSIC STYLE: ${parameters.musicStyle}
PACING: ${parameters.pacing}
VISUAL EFFECTS: ${parameters.visualEffects.join(', ')}
TARGET AUDIENCE: ${parameters.targetAudience}

Create a vivid, detailed video description suitable for AI video generation that incorporates all these parameters. Focus on:
- Cinematic storytelling techniques
- Professional camera work and movement
- Appropriate pacing and rhythm for the style
- Visual effects that enhance the narrative
- Audio design that complements the visuals
- Technical specifications for high-quality output
- Clear, descriptive language that leverages all parameters

ENHANCED VIDEO PROMPT:`;

        const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

        const response = await fetch(`${GEMINI_API_URL}?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
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
              temperature: 0.8,
              topP: 0.9,
              maxOutputTokens: 800,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.warn(`Gemini API failed (attempt ${retryCount + 1}):`, response.status, errorData);

          // If it's a rate limit error (429), retry with exponential backoff
          if (response.status === 429 && retryCount < maxRetries - 1) {
            const backoffDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
            console.log(`Rate limited. Retrying in ${backoffDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            retryCount++;
            continue;
          }

          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const enhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!enhancedText) {
          throw new Error('No enhanced text received from API');
        }

        return enhancedText;

      } catch (error) {
        console.warn(`Error enhancing video prompt (attempt ${retryCount + 1}):`, error);

        if (retryCount >= maxRetries - 1) {
          console.warn('Max retries reached, using fallback enhancement');
          return fallbackVideoEnhancement(input, parameters);
        }

        retryCount++;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      } finally {
        setIsGenerating(false);
      }
    }

    // This should never be reached, but just in case
    return fallbackVideoEnhancement(input, parameters);
  };

  // Fallback video enhancement method
  const fallbackVideoEnhancement = (input: string, parameters: VideoPromptConfig): string => {
    const styleEnhancements = {
      'cinematic': 'produced with cinematic storytelling, dramatic camera angles, and professional lighting',
      'documentary': 'captured in documentary style with natural camera movements and authentic lighting',
      'animation': 'created with smooth animation, vibrant colors, and dynamic visual effects',
      'motion graphics': 'designed with sleek motion graphics, text animations, and modern visual effects',
      'experimental': 'exploring artistic video techniques with unconventional camera work and effects',
      'commercial': 'crafted as a professional commercial with polished production and engaging visuals',
      'music video': 'styled as a music video with rhythmic editing, dynamic camera work, and visual effects',
      'vlog': 'produced in casual vlog style with handheld camera movements and natural lighting',
      'tutorial': 'created as an educational tutorial with clear shots, text overlays, and step-by-step visuals',
      'news': 'presented in news broadcast style with steady camera work and professional presentation'
    };

    const cameraEnhancements = {
      'steady cam': 'utilizing smooth steady cam movements for cinematic flow',
      'tracking shot': 'featuring dynamic tracking shots to follow the action',
      'zoom in': 'incorporating dramatic zoom-ins to emphasize key moments',
      'zoom out': 'using zoom-outs to reveal context and environment',
      'pan left': 'employing smooth left pans to show spatial relationships',
      'pan right': 'utilizing right pans to reveal new elements in the scene',
      'tilt up': 'featuring upward tilts to show scale and grandeur',
      'tilt down': 'using downward tilts to focus on details and action',
      'dolly in': 'incorporating dolly-ins for intimate character moments',
      'dolly out': 'using dolly-outs to show character in their environment',
      'crane shot': 'employing dramatic crane shots for epic scale',
      'handheld': 'utilizing handheld camera for raw, immediate feel',
      'drone shot': 'featuring aerial drone shots for breathtaking perspectives',
      'orbit': 'using orbital camera movements for dynamic reveals'
    };

    const styleText = styleEnhancements[parameters.style] || 'produced with professional quality';
    const cameraText = parameters.cameraMovement.map(movement => cameraEnhancements[movement] || movement).join(', ');
    const lightingText = `illuminated with ${parameters.lighting}`;
    const musicText = `accompanied by ${parameters.musicStyle} music`;
    const pacingText = `edited with ${parameters.pacing} pacing`;
    const effectsText = `enhanced with ${parameters.visualEffects.join(', ')}`;

    const durationText = parameters.duration <= 15 ? 'short and impactful' :
                        parameters.duration <= 60 ? 'concise and engaging' :
                        'comprehensive and detailed';

    return `A professional ${parameters.style} video of ${input}, ${styleText}, ${cameraText}, ${lightingText}, ${musicText}, ${pacingText}, ${effectsText}, ${durationText} duration, optimized for ${parameters.targetAudience} audience, rendered in ${parameters.resolution} resolution with ${parameters.quality}/10 quality level.`;
  };

  // Generate comprehensive video prompt with AI enhancement
  const generateEnhancedVideoPrompt = useCallback(async (customConfig = config): Promise<GeneratedVideoPrompt> => {
    const now = new Date();
    const promptId = `video-${Math.random().toString(36).substr(2, 9)}-${Date.now().toString(36)}`;

    // Enhance the subject with all parameters
    const enhancedSubject = await enhanceVideoPromptWithAI(customConfig.subject, customConfig);

    // Enhanced title generation
    const title = `${enhancedSubject.split(' ').slice(0, 6).map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')} | Professional Video`;

    // Enhanced description
    const description = `A professional ${customConfig.style} video featuring ${enhancedSubject}, with ${customConfig.duration} seconds duration, ${customConfig.resolution} resolution, ${customConfig.lighting}, and ${customConfig.cameraMovement.join(', ')} camera movements. High-quality ${customConfig.quality}/10 production.`;

    // Generate comprehensive tags
    const tags = [
      ...enhancedSubject.toLowerCase().split(' '),
      ...customConfig.style.toLowerCase().split(' '),
      ...customConfig.lighting.toLowerCase().split(' '),
      ...customConfig.cameraMovement.flatMap(c => c.toLowerCase().split(' ')),
      ...customConfig.musicStyle.toLowerCase().split(' '),
      ...customConfig.visualEffects.flatMap(e => e.toLowerCase().split(' ')),
      'video',
      'professional',
      'high quality',
      customConfig.resolution.toLowerCase(),
      customConfig.pacing
    ];

    // Calculate dimensions and frame count
    const aspectRatioStr = typeof customConfig.aspectRatio === 'string'
      ? customConfig.aspectRatio
      : customConfig.aspectRatio?.value || '16:9';
    const [width, height] = aspectRatioStr.split(':').map(Number);
    const aspectRatio = width / height;
    const baseWidth = customConfig.resolution === '720p' ? 1280 :
                     customConfig.resolution === '1080p' ? 1920 :
                     customConfig.resolution === '1440p' ? 2560 :
                     customConfig.resolution === '4K' ? 3840 : 7680;
    const baseHeight = Math.round(baseWidth / aspectRatio);
    const totalFrames = customConfig.duration * customConfig.fps;

    return {
      prompt_id: promptId,
      version: '2.0',
      title: title,
      description: description,
      metadata: {
        creation_date: now.toISOString(),
        author: 'AI Video Prompt Generator Pro v2.0',
        tags: [...new Set(tags)].slice(0, 50),
        category: customConfig.style,
        complexity: 'professional'
      },
      video_parameters: {
        subject: {
          main_character: enhancedSubject,
          setting: 'professional production environment',
          action: 'dynamic and engaging',
          mood: 'professional and polished',
          visual_elements: customConfig.visualEffects
        },
        production: {
          style: customConfig.style,
          duration_seconds: customConfig.duration,
          resolution: customConfig.resolution,
          frame_rate: customConfig.fps,
          aspect_ratio: aspectRatioStr,
          quality_level: `${customConfig.quality}/10`
        },
        camera: {
          movement_techniques: customConfig.cameraMovement,
          shot_types: ['medium shot', 'close-up', 'wide shot'],
          angles: ['eye level', 'low angle', 'high angle'],
          transitions: customConfig.sceneTransitions
        },
        lighting: {
          primary_source: customConfig.lighting,
          mood: 'professional',
          effects: ['key light', 'fill light', 'back light', 'practical lights']
        },
        audio: {
          music_style: customConfig.musicStyle,
          sound_design: 'professional audio mixing',
          voice_over: 'clear and professional narration',
          ambient_sounds: ['environmental sounds', 'foley effects', 'background music']
        },
        editing: {
          pacing: customConfig.pacing,
          rhythm: 'dynamic and engaging',
          cuts_per_minute: customConfig.pacing === 'fast-paced' ? 12 :
                          customConfig.pacing === 'moderate' ? 8 : 4,
          visual_effects: customConfig.visualEffects,
          color_grading: 'professional color correction'
        },
        narrative: {
          target_audience: customConfig.targetAudience,
          tone: 'professional and engaging',
          message: 'high-quality video production',
          emotional_impact: 'inspiring and professional'
        }
      },
      output_requirements: {
        video_format: 'MP4',
        target_file_size_mb: `${Math.round(customConfig.duration * 2)}-${Math.round(customConfig.duration * 3)}`,
        quality_level: `${customConfig.quality}/10`,
        audio_format: 'AAC'
      },
      negative_prompt: customConfig.negativePrompt,
      width: baseWidth,
      height: baseHeight,
      total_frames: totalFrames,
      estimated_render_time: `${Math.round(customConfig.duration / 10)}-${Math.round(customConfig.duration / 5)} minutes`,
      seed: Math.floor(Math.random() * 1000000)
    };
  }, [config, enhanceVideoPromptWithAI]);

  // Clear generated prompt when any config changes
  useEffect(() => {
    setGeneratedPrompt(null);
  }, [config.subject, config.style, config.lighting, config.quality, config.aspectRatio, config.duration, config.resolution, config.fps, config.cameraMovement, config.musicStyle, config.pacing, config.visualEffects, config.targetAudience]);

  const handleGenerate = useCallback(async () => {
    // Prevent multiple generations
    if (isGenerating) {
      console.log('Generation already in progress, ignoring duplicate click');
      return;
    }

    try {
      setIsGenerating(true);
      console.log('Starting video prompt generation...');

      // Generate the enhanced video prompt
      const prompt = await generateEnhancedVideoPrompt();
      setGeneratedPrompt(prompt);

      console.log('Video prompt generated successfully:', prompt.prompt_id);
      toast({
        title: "Success!",
        description: "Enhanced video prompt generated successfully!",
      });
    } catch (error: unknown) {
      console.error('Error generating video prompt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate video prompt';
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      console.log('Generation process completed, setting loading to false');
      setIsGenerating(false);
    }
  }, [generateEnhancedVideoPrompt, toast, isGenerating]);

  const handleCopy = useCallback(async () => {
    try {
      // Use the already generated prompt from state instead of generating again
      if (!generatedPrompt) {
        toast({
          title: "No Prompt Generated",
          description: "Please generate a video prompt first before copying.",
          variant: "destructive"
        });
        return;
      }

      const textToCopy = JSON.stringify(generatedPrompt, null, 2);

      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(textToCopy);
          toast({
            title: "Copied to clipboard!",
            description: "The enhanced video prompt has been copied.",
          });
          return;
        } catch (clipboardError) {
          // Fallback if clipboard API fails (document not focused, permissions, etc.)
          console.warn('Clipboard API failed, using fallback:', clipboardError);
        }
      }

      // Fallback method: Create a temporary textarea
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        toast({
          title: "Copied to clipboard!",
          description: "The enhanced video prompt has been copied using fallback method.",
        });
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        toast({
          title: "Copy Failed",
          description: "Unable to copy to clipboard. Please manually select and copy the text.",
          variant: "destructive"
        });
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Error in handleCopy:', error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy prompt to clipboard.",
        variant: "destructive"
      });
    }
  }, [generatedPrompt, toast]);

  const handleDownload = useCallback(async () => {
    try {
      // Use the already generated prompt from state instead of generating again
      if (!generatedPrompt) {
        toast({
          title: "No Prompt Generated",
          description: "Please generate a video prompt first before downloading.",
          variant: "destructive"
        });
        return;
      }

      const blob = new Blob([JSON.stringify(generatedPrompt, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enhanced-video-prompt-${generatedPrompt.prompt_id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "The enhanced video prompt has been downloaded.",
      });
    } catch (error) {
      console.error('Error in handleDownload:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download prompt file.",
        variant: "destructive"
      });
    }
  }, [generatedPrompt, toast]);

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={onBack} className="gap-2">
            ← Back to Text to JSON
          </Button>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !config.subject.trim()}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : generatedPrompt ? (
                <>
                  <Brain className="h-4 w-4" />
                  Regenerate Video Prompt
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Generate Enhanced Video Prompt
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  AI-Enhanced Video Prompt Builder
                </CardTitle>
                <CardDescription>
                  Create professional-quality video prompts with AI enhancement and comprehensive production parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Video Concept/Subject</Label>
                  <Textarea
                    id="subject"
                    placeholder="Describe your video concept, story, or subject in detail..."
                    value={config.subject}
                    onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Video Style</Label>
                    <Select
                      value={config.style}
                      onValueChange={(value) => setConfig({ ...config, style: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select video style" />
                      </SelectTrigger>
                      <SelectContent>
                        {videoStyles.map((style) => (
                          <SelectItem key={style} value={style}>
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration: {config.duration}s</Label>
                    <Slider
                      value={[config.duration]}
                      onValueChange={([value]) => setConfig({ ...config, duration: value })}
                      min={5}
                      max={300}
                      step={5}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Resolution</Label>
                    <Select
                      value={config.resolution}
                      onValueChange={(value) => setConfig({ ...config, resolution: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select resolution" />
                      </SelectTrigger>
                      <SelectContent>
                        {resolutions.map((res) => (
                          <SelectItem key={res} value={res}>
                            {res}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Frame Rate: {config.fps}fps</Label>
                    <Slider
                      value={[config.fps]}
                      onValueChange={([value]) => setConfig({ ...config, fps: value })}
                      min={24}
                      max={60}
                      step={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Camera Movement</Label>
                  <div className="flex flex-wrap gap-2">
                    {cameraMovements.map((movement) => (
                      <Button
                        key={movement}
                        variant={config.cameraMovement.includes(movement) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newMovements = config.cameraMovement.includes(movement)
                            ? config.cameraMovement.filter(m => m !== movement)
                            : [...config.cameraMovement, movement];
                          setConfig({ ...config, cameraMovement: newMovements });
                        }}
                      >
                        {movement}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lighting</Label>
                    <Select
                      value={config.lighting}
                      onValueChange={(value) => setConfig({ ...config, lighting: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lighting" />
                      </SelectTrigger>
                      <SelectContent>
                        {lightingOptions.map((light) => (
                          <SelectItem key={light} value={light}>
                            {light.charAt(0).toUpperCase() + light.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Music Style</Label>
                    <Select
                      value={config.musicStyle}
                      onValueChange={(value) => setConfig({ ...config, musicStyle: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select music style" />
                      </SelectTrigger>
                      <SelectContent>
                        {musicStyles.map((style) => (
                          <SelectItem key={style} value={style}>
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pacing</Label>
                    <Select
                      value={config.pacing}
                      onValueChange={(value) => setConfig({ ...config, pacing: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pacing" />
                      </SelectTrigger>
                      <SelectContent>
                        {pacingOptions.map((pace) => (
                          <SelectItem key={pace} value={pace}>
                            {pace.charAt(0).toUpperCase() + pace.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select
                      value={config.targetAudience}
                      onValueChange={(value) => setConfig({ ...config, targetAudience: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        {targetAudiences.map((audience) => (
                          <SelectItem key={audience} value={audience}>
                            {audience.charAt(0).toUpperCase() + audience.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Visual Effects</Label>
                  <div className="flex flex-wrap gap-2">
                    {visualEffectsList.map((effect) => (
                      <Button
                        key={effect}
                        variant={config.visualEffects.includes(effect) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newEffects = config.visualEffects.includes(effect)
                            ? config.visualEffects.filter(e => e !== effect)
                            : [...config.visualEffects, effect];
                          setConfig({ ...config, visualEffects: newEffects });
                        }}
                      >
                        {effect}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Quality: {config.quality}/10</Label>
                  <Slider
                    value={[config.quality]}
                    onValueChange={([value]) => setConfig({ ...config, quality: value })}
                    min={1}
                    max={10}
                    step={0.5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <div className="flex flex-wrap gap-2">
                    {aspectRatios.map((ratio) => {
                      const isActive = typeof config.aspectRatio === 'string'
                        ? config.aspectRatio === ratio.value
                        : config.aspectRatio?.value === ratio.value;

                      return (
                        <Button
                          key={ratio.value}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => setConfig({ ...config, aspectRatio: ratio })}
                        >
                          {ratio.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Card className="sticky top-4 h-[calc(100vh-2rem)] flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Enhanced Video Prompt Preview
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Live preview of your enhanced video prompt with all production parameters
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!generatedPrompt}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {generatedPrompt ? 'Copy' : 'Generate First'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={!generatedPrompt}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {generatedPrompt ? 'Download' : 'Generate First'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Video Prompt Status</h3>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-background">
                  <div className="space-y-6">
                    <div className="bg-muted/50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Video Concept</h4>
                      <p className="text-sm text-muted-foreground">
                        {config.subject || "Enter a video concept above to see the enhanced version"}
                      </p>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Enhanced Video Prompt Preview</h4>
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm">Enhanced Concept</h5>
                          <pre className="whitespace-pre-wrap break-words text-xs text-foreground font-mono bg-background p-3 rounded mt-2">
                            {config.subject || "Enter a concept above to see the enhanced version"}
                          </pre>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">Generated JSON Structure</h5>
                          <pre className="whitespace-pre-wrap break-words text-xs text-foreground font-mono bg-background p-3 rounded mt-2 max-h-96 overflow-auto">
                            {generatedPrompt
                              ? JSON.stringify(generatedPrompt, null, 2)
                              : "Click 'Generate Enhanced Video Prompt' to create your complete JSON output with all video production parameters"
                            }
                          </pre>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-md">
                      <h5 className="font-medium mb-2">Production Specifications</h5>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Style:</span> {config.style}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span> {config.duration}s
                        </div>
                        <div>
                          <span className="text-muted-foreground">Resolution:</span> {config.resolution}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Frame Rate:</span> {config.fps}fps
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lighting:</span> {config.lighting}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Music:</span> {config.musicStyle}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Camera:</span> {config.cameraMovement.join(', ')}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Quality:</span> {config.quality}/10
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPromptBuilder;
