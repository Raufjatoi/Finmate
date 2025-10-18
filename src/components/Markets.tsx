import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUp, ArrowDown, TrendingUp, X, Send, Volume2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TutorAvatar } from './TutorAvatar';
import { useToast } from '@/hooks/use-toast';

interface TickerData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
  marketCap?: number;
  volume?: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'tutor';
  timestamp: Date;
}

export const Markets = () => {
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto'>('crypto');
  const [cryptoData, setCryptoData] = useState<TickerData[]>([]);
  const [stocksData, setStocksData] = useState<TickerData[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<TickerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState<'abdul' | 'john'>('john');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Fetch crypto data
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h'
        );
        const data = await response.json();
        
        const formatted: TickerData[] = data.map((coin: any) => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price,
          change: coin.price_change_24h,
          changePercent: coin.price_change_percentage_24h,
          sparkline: coin.sparkline_in_7d?.price?.slice(-20) || [],
          marketCap: coin.market_cap,
          volume: coin.total_volume
        }));
        
        setCryptoData(formatted);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        toast({
          title: 'Failed to load crypto data',
          description: 'Using cached data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch stocks data (popular stocks)
  useEffect(() => {
    const fetchStocksData = async () => {
      const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'WMT'];
      try {
        // Using a simple mock since free stock APIs are limited
        const mockStocks: TickerData[] = symbols.map((symbol, index) => ({
          symbol,
          name: `${symbol} Inc.`,
          price: 150 + Math.random() * 200,
          change: (Math.random() - 0.5) * 10,
          changePercent: (Math.random() - 0.5) * 5,
          sparkline: Array.from({ length: 20 }, () => 150 + Math.random() * 50),
          marketCap: 1000000000 + Math.random() * 2000000000,
          volume: 50000000 + Math.random() * 100000000
        }));
        
        setStocksData(mockStocks);
      } catch (error) {
        console.error('Error fetching stocks data:', error);
      }
    };

    fetchStocksData();
    const interval = setInterval(fetchStocksData, 60000);
    return () => clearInterval(interval);
  }, []);

  const MiniSparkline = ({ data }: { data: number[] }) => (
    <svg width="60" height="20" className="opacity-60">
      {data.map((point, index) => {
        if (index === 0) return null;
        const prevPoint = data[index - 1];
        const x1 = ((index - 1) / (data.length - 1)) * 60;
        const x2 = (index / (data.length - 1)) * 60;
        const y1 = 20 - ((prevPoint - Math.min(...data)) / (Math.max(...data) - Math.min(...data))) * 20;
        const y2 = 20 - ((point - Math.min(...data)) / (Math.max(...data) - Math.min(...data))) * 20;
        
        return (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1.5"
          />
        );
      })}
    </svg>
  );

  // Initialize AI analysis when asset is selected
  useEffect(() => {
    if (selectedAsset) {
      const greeting: Message = {
        id: Date.now().toString(),
        text: selectedTutor === 'abdul'
          ? `Assalam-o-Alaikum! ${selectedAsset.name} ke baare mein kya jaanna chahte hain? Main aapko iski analysis dunga!`
          : `Hello! I'll help you analyze ${selectedAsset.name}. What would you like to know about this ${activeTab === 'crypto' ? 'cryptocurrency' : 'stock'}?`,
        sender: 'tutor',
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  }, [selectedAsset, selectedTutor]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedAsset) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAnalyzing(true);

    try {
      const savedKeys = localStorage.getItem('finmate-api-keys');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
      const groqApiKey = apiKeys.groqApiKey ||import.meta.env.VITE_GROQ_API_KEY;
      
      const assetContext = `Asset: ${selectedAsset.name} (${selectedAsset.symbol})
Price: $${selectedAsset.price.toLocaleString()}
24h Change: ${selectedAsset.changePercent.toFixed(2)}%
Market Cap: $${selectedAsset.marketCap?.toLocaleString() || 'N/A'}
Volume: $${selectedAsset.volume?.toLocaleString() || 'N/A'}`;

      const systemPrompt = selectedTutor === 'abdul'
        ? `You are Abdul, a financial analyst. Speak in Roman Urdu (Urdu using English letters like "ap ka kya haal ha"). You're analyzing ${selectedAsset.name}. Context: ${assetContext}. Keep answers brief (2-3 sentences), use simple analogies.`
        : `You are John, a financial analyst. Use proper English only. You're analyzing ${selectedAsset.name}. Context: ${assetContext}. Keep answers concise (2-3 sentences), provide clear insights.`;

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
          max_tokens: 200
        })
      });

      if (!response.ok) throw new Error('Failed to get analysis');

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
          ? 'Sorry, analysis mein problem ho gayi. Phir se try karein!'
          : 'Sorry, analysis failed. Please try again!',
        sender: 'tutor',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePlayVoice = async (text: string) => {
    try {
      const savedKeys = localStorage.getItem('finmate-api-keys');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
      const elevenApiKey = apiKeys.elevenLabsApiKey || import.meta.env.VITE_ELEVEN_API_KEY;

      const voiceId = selectedTutor === 'abdul'
        ? (apiKeys.elevenVoiceAbdul || 'N2lVS1w4EtoT3dr4eOWO')
        : (apiKeys.elevenVoiceJohn || 'GBv7mTt0atIp3Br8iCZE');

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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

      if (!response.ok) throw new Error('Voice generation failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error('Voice error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const renderTickerList = (data: TickerData[]) => (
    <div className="space-y-3">
      {data.map((ticker, index) => {
        const isPositive = ticker.change >= 0;
        
        return (
          <motion.div
            key={ticker.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className={`finmate-card p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                isPositive ? 'price-up' : 'price-down'
              }`}
              onClick={() => setSelectedAsset(ticker)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {ticker.symbol.substring(0, 2)}
                    </span>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-sm">{ticker.symbol}</div>
                    <div className="text-xs text-muted-foreground">{ticker.name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MiniSparkline data={ticker.sparkline} />
                  
                  <div className="text-right">
                    <div className="font-semibold text-sm">
                      ${ticker.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={`text-xs flex items-center gap-1 ${
                      isPositive ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {isPositive ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )}
                      <span>
                        {Math.abs(ticker.changePercent).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="p-4 h-full overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Live Markets</h2>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'stocks' | 'crypto')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="crypto" className="mt-0">
            {renderTickerList(cryptoData)}
          </TabsContent>
          
          <TabsContent value="stocks" className="mt-0">
            {renderTickerList(stocksData)}
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 finmate-card bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            💡 Tap any asset for AI-powered analysis with John or Abdul
          </p>
        </div>
      </div>

      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {selectedAsset?.symbol.substring(0, 2)}
                </span>
              </div>
              <div>
                <div className="text-lg font-bold">{selectedAsset?.name}</div>
                <div className="text-sm font-normal text-muted-foreground">{selectedAsset?.symbol}</div>
              </div>
            </DialogTitle>
            <DialogDescription>
              Get AI-powered analysis and insights from John or Abdul
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Asset Stats */}
            <Card className="finmate-card p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Current Price</div>
                  <div className="text-2xl font-bold">
                    ${selectedAsset?.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">24h Change</div>
                  <div className={`text-2xl font-bold ${
                    (selectedAsset?.change || 0) >= 0 ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {selectedAsset?.changePercent.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Market Cap</div>
                  <div className="text-sm font-semibold">
                    ${selectedAsset?.marketCap?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Volume (24h)</div>
                  <div className="text-sm font-semibold">
                    ${selectedAsset?.volume?.toLocaleString() || 'N/A'}
                  </div>
                </div>
              </div>
            </Card>

            {/* Tutor Selection */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={selectedTutor === 'abdul' ? 'finmate' : 'outline'}
                size="sm"
                onClick={() => setSelectedTutor('abdul')}
                className="flex items-center gap-2 flex-1"
              >
                <TutorAvatar tutor="abdul" size="sm" />
                <span className="text-xs">Abdul (Roman Urdu)</span>
              </Button>
              <Button
                variant={selectedTutor === 'john' ? 'finmate' : 'outline'}
                size="sm"
                onClick={() => setSelectedTutor('john')}
                className="flex items-center gap-2 flex-1"
              >
                <TutorAvatar tutor="john" size="sm" />
                <span className="text-xs">John (English)</span>
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
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
              
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
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
            <div className="flex gap-2 border-t pt-4">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={selectedTutor === 'abdul' ? 'Analysis ke liye puchein...' : 'Ask for analysis...'}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button 
                variant="finmate" 
                size="icon"
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isAnalyzing}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};