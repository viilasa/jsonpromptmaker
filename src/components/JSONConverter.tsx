import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, RotateCcw, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface JSONOutput {
  prompt: string;
  task_type: string;
  parameters: {
    tone: string;
    length: string;
    format: string;
  };
  timestamp: string;
}

export const JSONConverter = () => {
  const [prompt, setPrompt] = useState("");
  const [jsonOutput, setJsonOutput] = useState<JSONOutput | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const analyzePrompt = useCallback(async (input: string): Promise<JSONOutput> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        console.error('Error calling generate-json endpoint:', response.statusText);
        // Check for specific error types
        if (response.status === 0) {
          throw new Error('Failed to connect to the server. Please make sure the server is running.');
        }
        if (response.status >= 500) {
          throw new Error('Server error. Please try again later or contact support.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to process the request');
      }

      const data = await response.json();
      
      if (!data) {
        throw new Error('No data received from the server');
      }
      
      return data;
    } catch (error) {
      console.error('Failed to generate JSON with AI:', error);
      
      // Show error toast
      toast({
        title: 'Error',
        description: error.message || 'Failed to analyze prompt',
        variant: 'destructive',
      });
      
      // Fallback to simple analysis
      const prompt = input.trim();
      return {
        prompt,
        task_type: "analysis",
        parameters: {
          tone: "neutral",
          length: "medium",
          format: "text",
        },
        timestamp: new Date().toISOString(),
      };
    }
  }, []);

  const handleConvert = useCallback(async () => {
    if (!prompt.trim()) return;
    
    setIsConverting(true);
    
    try {
      const result = await analyzePrompt(prompt);
      setJsonOutput(result);
    } catch (error) {
      toast({
        title: "Error generating JSON",
        description: "Failed to analyze prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  }, [prompt, analyzePrompt, toast]);

  const handleCopy = useCallback(async () => {
    if (!jsonOutput) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2));
      toast({
        title: "Copied to clipboard!",
        description: "JSON structure has been copied successfully.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  }, [jsonOutput, toast]);

  const handleReset = useCallback(() => {
    setPrompt("");
    setJsonOutput(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold gradient-text flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8" />
            Prompt to JSON
          </h1>
          <p className="text-muted-foreground text-lg">
            Convert natural language prompts into structured JSON format
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="elegant-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Enter Your Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your natural language prompt here... For example: 'Write a formal email to request a meeting about project updates'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    handleConvert();
                  }
                }}
                className="min-h-[200px] resize-none transition-all duration-300 focus:glow-effect"
                disabled={isConverting}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleConvert}
                  disabled={!prompt.trim() || isConverting}
                  className="flex-1"
                  variant="default"
                >
                  {isConverting ? "Converting..." : "Convert to JSON"}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="icon"
                  disabled={!prompt && !jsonOutput}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="elegant-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
                  JSON Output
                </span>
                {jsonOutput && (
                  <Button
                    onClick={handleCopy}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jsonOutput ? (
                <div className="code-block animate-glow">
                  <pre className="font-mono text-sm overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(jsonOutput, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="code-block opacity-50 text-center py-12">
                  <p className="text-muted-foreground">
                    Your JSON output will appear here...
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter a prompt and click "Convert to JSON" to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Tip: Use Ctrl+Enter (Cmd+Enter on Mac) to quickly convert your prompt</p>
        </div>
      </div>
    </div>
  );
};