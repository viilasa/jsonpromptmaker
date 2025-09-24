import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const ApiRateLimitNotice = () => {
  return (
    <Alert className="mb-4 border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">API Rate Limiting Notice</AlertTitle>
      <AlertDescription className="text-yellow-700">
        <p className="mb-2">
          The Gemini API is currently experiencing rate limiting (429 errors). This means the API key has exceeded its usage quota or is being rate limited.
        </p>
        <p className="mb-3">
          The system will automatically retry requests with exponential backoff, but you may experience delays or fallbacks to local enhancement.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
            className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Get New API Key
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
            className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Check Quota
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ApiRateLimitNotice;
