import { Sparkles, Github, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold gradient-text">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              JsonPromptMaker
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Transform your ideas into structured prompts with AI-powered enhancement.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-base">Quick Links</h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <a href="/" className="block text-muted-foreground hover:text-foreground transition-colors">
                Home
              </a>
              <a href="/image-prompt" className="block text-muted-foreground hover:text-foreground transition-colors">
                Image Prompt Builder
              </a>
              <a href="/video-gen" className="block text-muted-foreground hover:text-foreground transition-colors">
                Video Generator
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-base">Features</h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <p className="text-muted-foreground">AI-Powered Enhancement</p>
              <p className="text-muted-foreground">Professional Quality</p>
              <p className="text-muted-foreground">Multiple Output Formats</p>
              <p className="text-muted-foreground">Real-time Preview</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-base">Connect</h3>
            <div className="flex gap-1 sm:gap-2">
              <Button variant="ghost" size="sm" className="p-1 sm:p-2" asChild>
                <a href="https://x.com/lrdsurya" target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-3 h-3 sm:w-4 sm:h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t mt-6 sm:mt-8 pt-4 sm:pt-6 text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; {currentYear} Prompt Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
