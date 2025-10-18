import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TutorAvatar } from './TutorAvatar';
import { Settings } from './Settings';
import { Send, Mic, Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'tutor';
  timestamp: Date;
}

export const AITutor = () => {
  const [selectedTutor, setSelectedTutor] = useState<'abdul' | 'john'>('john');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize greeting on mount
  useEffect(() => {
    const greetingMessage: Message = {
      id: '1',
      text: 'Hello! I\'m John, your AI financial tutor. Ready to learn about stocks and crypto? Let\'s start with the basics!',
      sender: 'tutor',
      timestamp: new Date()
    };
    setMessages([greetingMessage]);
  }, []);

  // Update greeting when tutor changes
  const handleTutorChange = (tutor: 'abdul' | 'john') => {
    setSelectedTutor(tutor);
    const greetingMessage: Message = {
      id: Date.now().toString(),
      text: tutor === 'abdul' 
        ? 'Assalam-o-Alaikum! Main Abdul hun, aapka AI tutor. Stock aur crypto ke baare mein kuch jaanna chahte hain? Bilkul simple tarike se explain karunga!'
        : 'Hello! I\'m John, your AI financial tutor. Ready to learn about stocks and crypto? Let\'s start with the basics!',
      sender: 'tutor',
      timestamp: new Date()
    };
    setMessages([greetingMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const savedKeys = localStorage.getItem('finmate-api-keys');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
      const groqApiKey = apiKeys.groqApiKey || import.meta.env.VITE_GROQ_API_KEY;
      
      const systemPrompt = selectedTutor === 'abdul'
        ? 'You are Abdul, a friendly Pakistani AI tutor teaching stocks and crypto. CRITICAL: ONLY speak in Roman Urdu (Urdu written using English alphabets like "ap ka kya haal ha", "main acha hun"). NEVER use Urdu script/alphabets. Be casual and conversational. Match the question style - if someone asks simply, answer simply. Keep it short (1-2 sentences max). No need for step-by-step or examples unless specifically asked.'
        : 'You are John, a casual and friendly AI financial tutor. Speak in simple, clear English. Match the question style - if someone asks a simple question, give a simple direct answer. Keep responses super short (1-2 sentences max). Skip the formalities, step-by-step explanations, or examples unless specifically asked. Just answer what they asked.';

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'compound-beta',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            { role: 'user', content: inputText }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const tutorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.choices[0].message.content,
        sender: 'tutor',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, tutorResponse]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: selectedTutor === 'abdul' 
          ? 'Sorry, kuch problem ho gayi. Phir se try karein!'
          : 'Sorry, something went wrong. Please try again!',
        sender: 'tutor',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVoice = async (text: string) => {
    try {
      const savedKeys = localStorage.getItem('finmate-api-keys');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
      
      // Use default key if user hasn't provided their own
      const elevenApiKey = apiKeys.elevenLabsApiKey || import.meta.env.VITE_ELEVEN_API_KEY;

      const voiceId = selectedTutor === 'abdul'
        ? (apiKeys.elevenVoiceAbdul || 'N2lVS1w4EtoT3dr4eOWO') // Callum (default)
        : (apiKeys.elevenVoiceJohn || 'GBv7mTt0atIp3Br8iCZE');  // Custom voice (default)

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}` ,{
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenApiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        // Try to extract helpful error message
        let detail = 'Failed to generate speech';
        try {
          const err = await response.json();
          detail = err?.detail?.message || err?.error || JSON.stringify(err);
        } catch {}
        toast({
          title: 'Voice generation failed',
          description: detail.includes('missing_permissions')
            ? 'Your ElevenLabs API key is missing the text_to_speech permission. Create a new key with TTS enabled.'
            : detail,
          variant: 'destructive',
        });
        throw new Error(detail);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error('Voice error:', error);
      toast({
        title: 'Voice error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const tutorInfo = {
    abdul: {
      name: 'Abdul',
      description: 'Roman Urdu',
      greeting: 'Assalam-o-Alaikum! Kaise hain aap?'
    },
    john: {
      name: 'John', 
      description: 'English Only',
      greeting: 'Hello! How can I help you today?'
    }
  } as const;

  return (
    <div className="flex flex-col h-full">
      {/* Tutor Selection Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">AI Tutor</h2>
          <Settings />
        </div>
        
        <div className="flex gap-3">
          {Object.entries(tutorInfo).map(([key, info]) => (
            <Button
              key={key}
              variant={selectedTutor === key ? 'finmate' : 'outline'}
              size="sm"
              onClick={() => handleTutorChange(key as 'abdul' | 'john')}
              className="flex items-center gap-2"
            >
              <TutorAvatar tutor={key as 'abdul' | 'john'} size="sm" />
              <div className="text-left">
                <div className="font-medium text-xs">{info.name}</div>
                <div className="text-xs opacity-75">{info.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'tutor' && (
                <TutorAvatar tutor={selectedTutor} size="sm" />
              )}
              
              <Card className={`max-w-[80%] p-3 ${
                message.sender === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'finmate-card'
              }`}>
                <p className="text-sm leading-relaxed">{message.text}</p>
                {message.sender === 'tutor' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 h-6 px-2 text-xs"
                    onClick={() => handlePlayVoice(message.text)}
                  >
                    <Volume2 className="w-3 h-3 mr-1" />
                    Play Voice
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <TutorAvatar tutor={selectedTutor} size="sm" />
            <Card className="finmate-card p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={selectedTutor === 'abdul' ? 'Kuch puchiye...' : 'Ask me anything...'}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button variant="outline" size="icon">
            <Mic className="w-4 h-4" />
          </Button>
          <Button 
            variant="finmate" 
            size="icon"
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};