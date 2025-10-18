import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings as SettingsIcon, Save, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKeys {
  groqApiKey: string;
  elevenLabsApiKey: string;
  elevenVoiceAbdul: string;
  elevenVoiceJohn: string;
}

export const Settings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    groqApiKey: '',
    elevenLabsApiKey: '',
    elevenVoiceAbdul: '',
    elevenVoiceJohn: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load saved keys from localStorage (only show user's custom keys)
    const savedKeys = localStorage.getItem('finmate-api-keys');
    const DEFAULTS = {
      groq: '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',
      eleven: 'sk_53c4a0a03ea789c776cd51e8fe5b9c94ce397233865aa4d9',
      abdulVoice: 'N2lVS1w4EtoT3dr4eOWO',
      johnVoice: 'GBv7mTt0atIp3Br8iCZE'
    } as const;

    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setApiKeys({
          groqApiKey: parsed.groqApiKey && parsed.groqApiKey !== DEFAULTS.groq ? parsed.groqApiKey : '',
          elevenLabsApiKey: parsed.elevenLabsApiKey && parsed.elevenLabsApiKey !== DEFAULTS.eleven ? parsed.elevenLabsApiKey : '',
          elevenVoiceAbdul: parsed.elevenVoiceAbdul && parsed.elevenVoiceAbdul !== DEFAULTS.abdulVoice ? parsed.elevenVoiceAbdul : '',
          elevenVoiceJohn: parsed.elevenVoiceJohn && parsed.elevenVoiceJohn !== DEFAULTS.johnVoice ? parsed.elevenVoiceJohn : ''
        });
      } catch (error) {
        console.error('Failed to load saved API keys:', error);
      }
    }
  }, []);

  const handleSave = () => {
    try {
      // Only save non-empty values
      const keysToSave = {
        groqApiKey: apiKeys.groqApiKey.trim(),
        elevenLabsApiKey: apiKeys.elevenLabsApiKey.trim(),
        elevenVoiceAbdul: apiKeys.elevenVoiceAbdul.trim(),
        elevenVoiceJohn: apiKeys.elevenVoiceJohn.trim()
      };
      localStorage.setItem('finmate-api-keys', JSON.stringify(keysToSave));
      toast({
        title: "Settings Saved",
        description: "Your custom API keys have been saved successfully.",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save API keys. Please try again.",
        variant: "destructive"
      });
    }
  };

  const maskKey = (key: string) => {
    if (!key || key.length < 8) return key;
    return key.substring(0, 4) + '•'.repeat(Math.max(key.length - 8, 4)) + key.substring(key.length - 4);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md finmate-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">API Settings</DialogTitle>
          <DialogDescription>Default keys are built-in and hidden. Add your own only if you want to override.</DialogDescription>
        </DialogHeader>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Default API keys are built-in and hidden. Only add your own keys here if you want to override the defaults.
            </p>
          </Card>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Show/Hide Keys</Label>
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => setShowKeys(!showKeys)}
            >
              {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="groq-key" className="text-sm font-medium">Groq API Key (Optional)</Label>
              <Input
                id="groq-key"
                type={showKeys ? "text" : "password"}
                value={apiKeys.groqApiKey}
                onChange={(e) => setApiKeys({...apiKeys, groqApiKey: e.target.value})}
                placeholder="Leave empty to use default"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Override default AI tutor key (model: compound-beta)
              </p>
            </div>

            <div>
              <Label htmlFor="eleven-key" className="text-sm font-medium">ElevenLabs API Key (Optional)</Label>
              <Input
                id="eleven-key"
                type={showKeys ? "text" : "password"}
                value={apiKeys.elevenLabsApiKey}
                onChange={(e) => setApiKeys({...apiKeys, elevenLabsApiKey: e.target.value})}
                placeholder="Leave empty to use default"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Override default text-to-speech key
              </p>
            </div>

            <div>
              <Label htmlFor="abdul-voice" className="text-sm font-medium">Abdul Voice ID (Optional)</Label>
              <Input
                id="abdul-voice"
                type={showKeys ? "text" : "password"}
                value={apiKeys.elevenVoiceAbdul}
                onChange={(e) => setApiKeys({...apiKeys, elevenVoiceAbdul: e.target.value})}
                placeholder="Leave empty to use default"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="john-voice" className="text-sm font-medium">John Voice ID (Optional)</Label>
              <Input
                id="john-voice"
                type={showKeys ? "text" : "password"}
                value={apiKeys.elevenVoiceJohn}
                onChange={(e) => setApiKeys({...apiKeys, elevenVoiceJohn: e.target.value})}
                placeholder="Leave empty to use default"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="finmate" onClick={handleSave} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>

          <Card className="p-3 bg-blue-50 border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Default keys are already configured. Only add your own if defaults hit limits or you prefer custom settings.
            </p>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};