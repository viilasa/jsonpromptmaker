import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Copy, Download, RotateCcw, Sparkles, Brain, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AspectRatioOption {
  value: string;
  label: string;
}

interface ImagePromptConfig {
  subject: string;
  style: string;
  lighting: string;
  composition: string[];
  quality: number;
  aspectRatio: string | AspectRatioOption;
  negativePrompt: string;
  sampler: string;
  seed?: number;
  cfg?: number;
  steps?: number;
  model?: string;
}

interface GeneratedPrompt {
  prompt_id: string;
  version: string;
  title: string;
  description: string;
  reasoning: string;
  _timestamp?: number;
  metadata: {
    creation_date: string;
    author: string;
    tags: string[];
    category: string;
    complexity: string;
  };
  generation_parameters: {
    subject: {
      type: string;
      gender: string;
      age_range: string;
      ethnicity: string;
      physique: string;
      clothing: {
        style: string;
        items: Array<{
          name: string;
          color_palette?: string;
          texture?: string;
          details?: string;
          color?: string;
          material?: string;
        }>;
        accessories: Array<{
          name: string;
          length?: string;
          material?: string;
          color?: string;
        }>;
      };
      expression: {
        intensity: string;
        emotion_primary: string;
        emotion_secondary: string;
        facial_details: string;
      };
      pose: {
        dynamic_level: string;
        action: string;
        body_language: string;
      };
      hair: {
        style: string;
        color: string;
      };
      skin_texture: string;
    };
    environment: {
      setting_type: string;
      location_specific: string;
      time_of_day: string;
      weather_conditions: string;
      architectural_style: string;
      details: Array<{
        object: string;
        colors?: string[];
        text?: string;
        details?: string;
        style?: string;
        light_trails?: string;
        glow?: string;
        visibility?: string;
      }>;
    };
    lighting: {
      primary_source: string;
      direction: string;
      color_temperature: string;
      intensity: string;
      effects: string[];
      mood: string;
    };
    camera: {
      type: string;
      lens: string;
      aperture: string;
      shutter_speed: string;
      ISO: string;
      angle: string;
      composition: string;
      focus: string;
      depth_of_field: string;
      fov: string;
      movement?: string;
    };
    art_style: {
      rendering_style: string;
      aesthetic: string;
      color_grading: string;
      texture_detail: string;
      noise_grain: string;
      artist_inspiration: string[];
      artistic_movement: string;
    };
    mood_and_tone: {
      dominant_emotion: string;
      secondary_emotions: string;
      overall_feeling: string;
      atmosphere: string;
    };
    quality_enhancements: {
      resolution: string;
      fidelity: string;
      detail_level: string;
      post_processing_hints: string[];
      upscaling_method?: string;
    };
    colors: {
      primary: string[];
      secondary: string[];
      accent: string[];
      harmony: string;
    };
  };
  output_requirements: {
    image_format: string;
    aspect_ratio: string;
    target_file_size_mb: string;
    quality_level: string;
  };
  negative_prompt: string;
  width: number;
  height: number;
  num_inference_steps: number;
  guidance_scale: number;
  model?: string;
  sampler: string;
  seed?: number;
  enhanced_input: {
    original_subject: string;
    enhanced_subject: string;
    reasoning: string;
    confidence_score: number;
  };
}

export const ImagePromptBuilder = ({ onBack }: { onBack: () => void }) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null);

  const [config, setConfig] = useState<ImagePromptConfig>(() => ({
    subject: "",
    style: "photorealistic",
    lighting: "cinematic lighting",
    composition: ["rule of thirds composition"],
    quality: 9,
    aspectRatio: { value: "16:9", label: "Widescreen (16:9)" },
    negativePrompt: "blurry, low quality, distorted, extra limbs, bad anatomy, poorly drawn, cloned face, disfigured, deformed, poor details, ugly, duplicate, morbid, mutilated, lowres, error, cropped, worst quality, low quality, jpeg artifacts, signature, watermark, username, artist name, text, title, frame, border, overexposed, underexposed",
    steps: 50,
    cfgScale: 7.5,
    sampler: "k_euler_ancestral",
    seed: Math.floor(Math.random() * 1000000)
  }));

  const styles = [
    "photorealistic", "cinematic", "digital art", "concept art", "anime",
    "oil painting", "watercolor", "pencil sketch", "3D render", "pixel art",
    "unreal engine 5", "octane render", "blender 3D", "studio ghibli", "cyberpunk",
    "fantasy art", "sci-fi", "minimalist", "surreal", "vintage", "noir"
  ];

  const lightings = [
    "cinematic lighting", "dramatic Rembrandt lighting", "soft studio lighting",
    "golden hour sunlight", "neon cyberpunk lighting", "low key chiaroscuro",
    "high key fashion lighting", "backlit silhouette", "rim light with god rays",
    "volumetric fog lighting", "moody film noir lighting", "ethereal glow",
    "natural window light", "professional portrait lighting", "dramatic side lighting"
  ];

  const compositions = [
    "rule of thirds composition", "centered portrait", "extreme close-up",
    "wide angle landscape", "bird's eye view", "worm's eye view", "macro detail",
    "over the shoulder", "Dutch angle", "cinematic wideshot", "portrait orientation",
    "dynamic perspective", "shallow depth of field", "bokeh background",
    "symmetrical composition", "asymmetrical balance", "leading lines"
  ];

  const moods = [
    "dramatic", "serene", "mysterious", "joyful", "melancholic",
    "energetic", "peaceful", "intense", "dreamy", "powerful"
  ];

  const aspectRatios: AspectRatioOption[] = [
    { value: "1:1", label: "Square (1:1)" },
    { value: "4:3", label: "Standard (4:3)" },
    { value: "16:9", label: "Widescreen (16:9)" },
    { value: "9:16", label: "Portrait (9:16)" },
    { value: "2:3", label: "Classic (2:3)" },
    { value: "3:2", label: "35mm (3:2)" },
    { value: "21:9", label: "Cinematic (21:9)" }
  ];

  // AI-powered prompt enhancement with retry logic
  const enhancePromptWithAI = async (input: string, parameters: any): Promise<string> => {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        setIsGenerating(true);

        const enhancementPrompt = `Transform this concept into a detailed, professional image generation prompt with the following specifications:

INPUT: "${input}"
STYLE: ${parameters.style}
LIGHTING: ${parameters.lighting}
COMPOSITION: ${parameters.composition.join(', ')}
QUALITY: ${parameters.quality}/10

Create a vivid, detailed description suitable for AI image generation that incorporates all these parameters. Focus on:
- Rich visual details specific to the chosen style
- Professional lighting techniques
- Proper composition principles
- High-quality rendering specifications
- Clear, descriptive language that leverages all parameters

ENHANCED PROMPT:`;

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
              maxOutputTokens: 500,
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
        console.warn(`Error enhancing prompt (attempt ${retryCount + 1}):`, error);

        if (retryCount >= maxRetries - 1) {
          console.warn('Max retries reached, using fallback enhancement');
          return fallbackEnhancement(input, parameters);
        }

        retryCount++;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      } finally {
        setIsGenerating(false);
      }
    }

    // This should never be reached, but just in case
    return fallbackEnhancement(input, parameters);
  };

  // Fallback enhancement method
  const fallbackEnhancement = (input: string, parameters: any): string => {
    const styleEnhancements = {
      'photorealistic': 'rendered in hyper-realistic detail with professional photography standards',
      'cinematic': 'captured with cinematic lighting and dramatic atmosphere',
      'anime': 'drawn in anime style with vibrant colors and expressive features',
      'oil painting': 'painted with rich oil colors and artistic brushstrokes',
      'watercolor': 'created with delicate watercolor washes and flowing colors',
      'digital art': 'digitally rendered with crisp lines and vibrant colors',
      'vintage': 'styled with classic vintage aesthetics and nostalgic tones',
      'cyberpunk': 'designed with futuristic cyberpunk elements and neon lighting'
    };

    const compositionEnhancements = {
      'rule of thirds composition': 'carefully composed following the rule of thirds',
      'centered composition': 'perfectly centered for maximum impact',
      'leading lines composition': 'utilizing leading lines to guide the viewer\'s eye',
      'symmetrical composition': 'balanced with perfect symmetry',
      'over the shoulder composition': 'captured from over the shoulder perspective',
      'close-up composition': 'intimate close-up view emphasizing details',
      'wide shot composition': 'expansive wide shot showing the full scene',
      'dutch angle composition': 'dynamic dutch angle for dramatic tension'
    };

    const lightingEnhancements = {
      'cinematic lighting': 'illuminated with professional cinematic lighting setup',
      'natural lighting': 'bathed in beautiful natural light',
      'dramatic lighting': 'lit with high contrast dramatic lighting',
      'soft lighting': 'gently illuminated with soft, diffused light',
      'rim lighting': 'highlighted with rim lighting for definition',
      'golden hour lighting': 'glowing in warm golden hour light',
      'neon lighting': 'illuminated with vibrant neon lighting',
      'studio lighting': 'professionally lit in a controlled studio environment'
    };

    const styleText = styleEnhancements[parameters.style] || 'rendered with professional quality';
    const compositionText = compositionEnhancements[parameters.composition[0]] || 'composed with artistic intention';
    const lightingText = lightingEnhancements[parameters.lighting] || 'lit with professional lighting';

    const qualityText = parameters.quality >= 8 ? 'exceptional detail and quality' :
                       parameters.quality >= 6 ? 'high detail and quality' :
                       'good detail and quality';

    return `A professional ${parameters.style} image of ${input}, ${compositionText}, ${lightingText}, ${styleText}, featuring ${qualityText} with ${parameters.quality}/10 quality level.`;
  };

  // Enhanced field handler
  const handleEnhanceField = async () => {
    if (!config.subject.trim()) return;

    const enhancedSubject = await enhancePromptWithAI(config.subject, config);
    setConfig(prev => ({
      ...prev,
      subject: enhancedSubject
    }));
    toast({
      title: "Enhanced!",
      description: "Your prompt has been enhanced with AI.",
    });
  };

  // Auto-enhance all fields
  const autoEnhanceAll = async () => {
    // Auto-enhance is now handled by the enhance button
  };

  // Generate comprehensive prompt with AI enhancement
  const generateEnhancedPrompt = useCallback(async (customConfig = config): Promise<GeneratedPrompt> => {
    const now = new Date();
    const promptId = `prompt-${Math.random().toString(36).substr(2, 9)}-${Date.now().toString(36)}`;

    // Enhance the subject with all parameters
    const enhancedSubject = await enhancePromptWithAI(customConfig.subject, customConfig);

    // Enhanced title generation
    const title = `${enhancedSubject.split(' ').slice(0, 6).map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')} | Professional Image`;

    // Enhanced description
    const description = `A professional ${customConfig.style} image featuring ${enhancedSubject}, with ${customConfig.lighting} and ${customConfig.composition.join(', ')}. High-quality ${customConfig.quality}/10 quality.`;

    // Generate comprehensive tags
    const tags = [
      ...enhancedSubject.toLowerCase().split(' '),
      ...customConfig.style.toLowerCase().split(' '),
      ...customConfig.lighting.toLowerCase().split(' '),
      ...customConfig.composition.flatMap(c => c.toLowerCase().split(' ')),
      '8k',
      'ultra hd',
      'high quality',
      'detailed',
      'sharp focus',
      'professional'
    ];

    // Calculate dimensions
    const aspectRatioStr = typeof customConfig.aspectRatio === 'string'
      ? customConfig.aspectRatio
      : customConfig.aspectRatio?.value || '16:9';
    const [width, height] = aspectRatioStr.split(':').map(Number);
    const aspectRatio = width / height;
    const baseSize = 2048;

    return {
      prompt_id: promptId,
      version: '4.0',
      title: title,
      description: description,
      reasoning: `Generated professional image prompt with ${customConfig.style} style, ${customConfig.lighting}, and ${customConfig.composition.join(', ')} composition for optimal AI image generation`,
      metadata: {
        creation_date: now.toISOString(),
        author: 'AI Prompt Generator Pro v4.0',
        tags: [...new Set(tags)].slice(0, 40),
        category: customConfig.subject.includes('portrait') ? 'portrait' :
                 customConfig.subject.includes('landscape') ? 'landscape' : 'art',
        complexity: 'advanced'
      },
      generation_parameters: {
        subject: {
          type: 'artistic',
          gender: 'not specified',
          age_range: 'adult',
          ethnicity: 'not specified',
          physique: 'not specified',
          clothing: {
            style: 'appropriate for the scene',
            items: [{
              name: 'outfit',
              material: 'high quality fabric',
              color: 'complementary colors',
              details: 'well-fitted and appropriate'
            }],
            accessories: [{
              name: 'minimal accessories'
            }]
          },
          expression: {
            intensity: 'moderate',
            emotion_primary: 'determined',
            emotion_secondary: 'focused',
            facial_details: 'natural expression'
          },
          pose: {
            dynamic_level: 'moderate',
            action: 'posing naturally',
            body_language: 'confident and relaxed'
          },
          hair: {
            style: 'stylish',
            color: 'natural colors'
          },
          skin_texture: 'flawless'
        },
        environment: {
          setting_type: 'studio',
          location_specific: 'professional studio',
          time_of_day: 'golden hour',
          weather_conditions: 'clear',
          architectural_style: 'natural',
          details: [
            { object: 'background', details: 'carefully composed backdrop' },
            { object: 'lighting', details: 'professional lighting setup' },
            { object: 'atmosphere', details: 'dramatic ambiance' }
          ]
        },
        lighting: {
          primary_source: customConfig.lighting,
          direction: 'professional studio lighting',
          color_temperature: 'daylight balanced (5500K)',
          intensity: 'professional',
          effects: ['soft shadows', 'catchlights', 'rim lighting', 'volumetric light'],
          mood: 'dramatic'
        },
        camera: {
          type: 'full-frame mirrorless',
          lens: '85mm f/1.4',
          aperture: 'f/2.8',
          shutter_speed: '1/250s',
          ISO: '200',
          angle: 'eye level',
          composition: customConfig.composition[0],
          focus: 'tack sharp on subject with smooth bokeh',
          depth_of_field: 'shallow',
          fov: 'normal'
        },
        art_style: {
          rendering_style: customConfig.style,
          aesthetic: customConfig.style.includes('photo') ? 'hyperrealistic' :
                    customConfig.style.includes('paint') ? 'painterly' :
                    customConfig.style.includes('anime') ? 'anime' : 'cinematic',
          color_grading: 'professional color grading',
          texture_detail: 'ultra high',
          noise_grain: 'subtle film grain',
          artist_inspiration: ['Professional Photography', 'Award Winning', 'High Quality'],
          artistic_movement: customConfig.style.includes('vintage') ? 'classical' :
                            customConfig.style.includes('cyberpunk') ? 'contemporary' : 'modern'
        },
        mood_and_tone: {
          dominant_emotion: 'determined',
          secondary_emotions: 'focused, confident, inspired',
          overall_feeling: 'professional and polished',
          atmosphere: `${customConfig.lighting} atmosphere`
        },
        quality_enhancements: {
          resolution: '8K UHD',
          fidelity: 'ultra high',
          detail_level: 'extreme',
          post_processing_hints: [
            'color grading',
            'contrast adjustment',
            'selective sharpening',
            'lens correction',
            'noise reduction',
            'vibrance enhancement'
          ],
          upscaling_method: 'AI upscaling'
        },
        colors: {
          primary: ['vibrant', 'warm'],
          secondary: ['complementary', 'balanced'],
          accent: ['professional', 'tasteful'],
          harmony: 'analogous'
        }
      },
      output_requirements: {
        image_format: 'PNG',
        aspect_ratio: aspectRatioStr,
        target_file_size_mb: '15-25',
        quality_level: `${customConfig.quality}/10`
      },
      negative_prompt: customConfig.negativePrompt,
      width: Math.round(baseSize * Math.sqrt(aspectRatio)),
      height: Math.round(baseSize / Math.sqrt(aspectRatio)),
      num_inference_steps: customConfig.steps || 50,
      guidance_scale: customConfig.cfg || 7.5,
      sampler: customConfig.sampler || 'k_euler_ancestral',
      seed: customConfig.seed || Math.floor(Math.random() * 1000000),
      enhanced_input: {
        original_subject: customConfig.subject,
        enhanced_subject: enhancedSubject,
        reasoning: `Enhanced the original subject "${customConfig.subject}" into a more detailed and professional description suitable for AI image generation, incorporating style, lighting, and composition parameters`,
        confidence_score: 0.95
      }
    };
  }, [config, enhancePromptWithAI]);

  // Auto-enhance when subject changes (with debounce)
  useEffect(() => {
    // Clear generated prompt when subject changes
    setGeneratedPrompt(null);
  }, [config.subject]);

  // Clear generated prompt when any config changes
  useEffect(() => {
    setGeneratedPrompt(null);
  }, [config.style, config.lighting, config.composition, config.quality, config.aspectRatio]);

  const handleGenerate = useCallback(async () => {
    // Prevent multiple generations
    if (isGenerating) {
      console.log('Generation already in progress, ignoring duplicate click');
      return;
    }

    try {
      setIsGenerating(true);
      console.log('Starting image prompt generation...');

      // Generate the enhanced prompt
      const prompt = await generateEnhancedPrompt();
      setGeneratedPrompt(prompt);

      console.log('Image prompt generated successfully:', prompt.prompt_id);
      toast({
        title: "Success!",
        description: "Enhanced image prompt generated successfully!",
      });
    } catch (error: unknown) {
      console.error('Error generating prompt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate prompt';
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      console.log('Generation process completed, setting loading to false');
      setIsGenerating(false);
    }
  }, [generateEnhancedPrompt, toast, isGenerating]);

  const handleCopy = useCallback(async () => {
    try {
      // Use the already generated prompt from state instead of generating again
      if (!generatedPrompt) {
        toast({
          title: "No Prompt Generated",
          description: "Please generate an image prompt first before copying.",
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
            description: "The enhanced image prompt has been copied.",
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
          description: "The enhanced image prompt has been copied using fallback method.",
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
          description: "Please generate an image prompt first before downloading.",
          variant: "destructive"
        });
        return;
      }

      const blob = new Blob([JSON.stringify(generatedPrompt, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enhanced-prompt-${generatedPrompt.prompt_id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "The enhanced image prompt has been downloaded.",
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
    <div className="min-h-screen bg-gradient-background p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <Button variant="outline" onClick={onBack} className="gap-2 w-full sm:w-auto">
            ← Back to Text to JSON
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !config.subject.trim()}
              className="gap-2 w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : generatedPrompt ? (
                <>
                  <Brain className="h-4 w-4" />
                  Regenerate Image Prompt
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Generate Enhanced Prompt
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
          <div className="xl:col-span-3 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Sparkles className="h-5 w-5" />
                  AI-Enhanced Image Prompt Builder
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Configure your image parameters and generate AI-enhanced prompts with all settings included
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <Label htmlFor="subject">Main Subject</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleEnhanceField}
                        disabled={isGenerating || !config.subject.trim()}
                        className="text-xs sm:text-sm"
                      >
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        {isGenerating ? 'Enhancing...' : 'Enhance'}
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    id="subject"
                    placeholder="Describe the main subject of your image in detail..."
                    value={config.subject}
                    onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                    className="min-h-[80px] sm:min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label>Art Style</Label>
                    <Select
                      value={config.style}
                      onValueChange={(value) => setConfig({ ...config, style: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a style" />
                      </SelectTrigger>
                      <SelectContent>
                        {styles.map((style) => (
                          <SelectItem key={style} value={style}>
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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
                        {lightings.map((light) => (
                          <SelectItem key={light} value={light}>
                            {light.charAt(0).toUpperCase() + light.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Composition</Label>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {compositions.map((item) => (
                      <Button
                        key={item}
                        variant={config.composition.includes(item) ? "default" : "outline"}
                        size="sm"
                        className="text-xs sm:text-sm"
                        onClick={() => {
                          const newComposition = config.composition.includes(item)
                            ? config.composition.filter(i => i !== item)
                            : [...config.composition, item];
                          setConfig({ ...config, composition: newComposition });
                        }}
                      >
                        {item}
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
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {aspectRatios.map((ratio) => {
                      const isActive = typeof config.aspectRatio === 'string'
                        ? config.aspectRatio === ratio.value
                        : config.aspectRatio?.value === ratio.value;

                      return (
                        <Button
                          key={ratio.value}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          className="text-xs sm:text-sm"
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

          <div className="xl:col-span-2 space-y-4">
            <Card className="sticky top-4 h-[calc(100vh-8rem)] sm:h-[calc(100vh-2rem)] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      Enhanced Prompt Preview
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs sm:text-sm">
                      Live preview of your enhanced prompt with all parameters included
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!generatedPrompt}
                      className="flex-1 sm:flex-none"
                    >
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">{generatedPrompt ? 'Copy' : 'Generate First'}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={!generatedPrompt}
                      className="flex-1 sm:flex-none"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">{generatedPrompt ? 'Download' : 'Generate First'}</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
                <div className="p-3 sm:p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-sm sm:text-base">Prompt Status</h3>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-3 sm:p-4 bg-background">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-muted/50 p-3 sm:p-4 rounded-md">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Enhanced Subject</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {config.subject || "Enter a subject above to see the enhanced version"}
                      </p>
                    </div>

                    <div className="bg-muted/50 p-3 sm:p-4 rounded-md">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Enhanced Prompt Preview</h4>
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-xs sm:text-sm">Enhanced Subject</h5>
                          <pre className="whitespace-pre-wrap break-words text-xs text-foreground font-mono bg-background p-2 sm:p-3 rounded mt-2">
                            {config.subject || "Enter a subject above to see the enhanced version"}
                          </pre>
                        </div>
                        <div>
                          <h5 className="font-medium text-xs sm:text-sm">Generated JSON Structure</h5>
                          <pre className="whitespace-pre-wrap break-words text-xs text-foreground font-mono bg-background p-2 sm:p-3 rounded mt-2 max-h-48 sm:max-h-96 overflow-auto">
                            {generatedPrompt
                              ? JSON.stringify(generatedPrompt, null, 2)
                              : "Click 'Generate Enhanced Prompt' to create your complete JSON output with all parameters"
                            }
                          </pre>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-3 sm:p-4 rounded-md">
                      <h5 className="font-medium mb-2 text-sm sm:text-base">Technical Specifications</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div>
                          <span className="text-muted-foreground">Style:</span> {config.style}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lighting:</span> {config.lighting}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Quality:</span> {config.quality}/10
                        </div>
                        <div>
                          <span className="text-muted-foreground">Composition:</span> {config.composition.join(', ')}
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
