import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TutorAvatar } from './TutorAvatar';
import { BookOpen, CheckCircle2, XCircle, Trophy, PlayCircle, Plus, Settings, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const Learn = () => {
  const [selectedTutor, setSelectedTutor] = useState<'abdul' | 'john'>('abdul');
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showCustomLesson, setShowCustomLesson] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Custom lesson form state
  const [customTopic, setCustomTopic] = useState('');
  const [questionCount, setQuestionCount] = useState('5');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'expert'>('beginner');

  // Mock quiz data
  const generateQuiz = (topic: string) => {
    const questions: QuizQuestion[] = [
      {
        id: '1',
        question: selectedTutor === 'abdul' 
          ? 'Stock market mein "bull market" ka matlab kya hai?'
          : 'What does "bull market" mean in the stock market?',
        options: selectedTutor === 'abdul'
          ? ['Prices gir rahe hain', 'Prices badh rahe hain', 'Market band hai', 'Kuch nahi']
          : ['Prices are falling', 'Prices are rising', 'Market is closed', 'Nothing specific'],
        correctAnswer: 1,
        explanation: selectedTutor === 'abdul'
          ? 'Bull market ka matlab hai ke stock prices lagatar badh rahe hain. Jaise bull apne seeengh upar karta hai!'
          : 'A bull market means stock prices are consistently rising. Like a bull thrusting its horns upward!'
      },
      {
        id: '2',
        question: selectedTutor === 'abdul'
          ? 'Bitcoin ko "digital gold" kyun kehte hain?'
          : 'Why is Bitcoin called "digital gold"?',
        options: selectedTutor === 'abdul'
          ? ['Sona jitna mahanga hai', 'Limited supply hai', 'Chamakta hai', 'Bank mein rakha jata hai']
          : ['It\'s as expensive as gold', 'It has limited supply', 'It shines', 'It\'s kept in banks'],
        correctAnswer: 1,
        explanation: selectedTutor === 'abdul'
          ? 'Bitcoin ko digital gold kehte hain kyunke iska supply limited hai - sirf 21 million Bitcoin ho sakte hain!'
          : 'Bitcoin is called digital gold because it has limited supply - only 21 million Bitcoins can ever exist!'
      }
    ];
    return questions;
  };

  const quizTopics = [
    { id: 'basics', title: selectedTutor === 'abdul' ? 'Stock Basics' : 'Stock Market Basics' },
    { id: 'crypto', title: selectedTutor === 'abdul' ? 'Crypto Seekhiye' : 'Crypto Fundamentals' },
    { id: 'trading', title: selectedTutor === 'abdul' ? 'Trading Tips' : 'Trading Strategies' }
  ];

  const startQuiz = (topic: string) => {
    const questions = generateQuiz(topic);
    setCurrentQuiz(questions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
    setQuizStarted(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      if (selectedAnswer === currentQuiz[currentQuestionIndex].correctAnswer) {
        setScore(score + 1);
      }
      setShowExplanation(true);
    }
  };

  const handleContinue = () => {
    if (currentQuestionIndex < currentQuiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuiz([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
    setShowCustomLesson(false);
  };

  const generateCustomLesson = async () => {
    if (!customTopic.trim()) {
      toast.error(selectedTutor === 'abdul' ? 'Topic daalein!' : 'Please enter a topic!');
      return;
    }

    const apiKey = localStorage.getItem('groqApiKey') ||  import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROQ_API_KEY2;
    if (!apiKey) {
      toast.error(selectedTutor === 'abdul' ? 'API key settings mein add karen!' : 'Please add your API key in settings!');
      return;
    }

    setIsGenerating(true);
    try {
      const language = selectedTutor === 'abdul' ? 'Urdu (Roman/English script)' : 'English';
      const difficultyDesc = {
        beginner: selectedTutor === 'abdul' ? 'Bilkul basic, simple examples' : 'Very basic, simple examples',
        intermediate: selectedTutor === 'abdul' ? 'Thoda advanced, real-world examples' : 'Moderately advanced, real-world scenarios',
        expert: selectedTutor === 'abdul' ? 'Expert level, complex concepts' : 'Expert level, complex technical concepts'
      };

      const prompt = `You are ${selectedTutor === 'abdul' ? 'Abdul, a friendly Pakistani tutor' : 'John, an experienced English tutor'} teaching about: ${customTopic}

Generate exactly ${questionCount} multiple-choice questions about this topic in ${language}.
Difficulty level: ${difficulty} - ${difficultyDesc[difficulty]}

Return a JSON array with this exact structure:
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation why this is correct"
  }
]

Requirements:
- Questions should be ${difficulty} level
- Use ${language} language ${selectedTutor === 'abdul' ? '(Roman Urdu/Hinglish)' : ''}
- Make explanations engaging and educational
- correctAnswer should be the index (0-3) of the correct option`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate lesson');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const questions = JSON.parse(jsonMatch[0]);
      const formattedQuestions: QuizQuestion[] = questions.map((q: any, idx: number) => ({
        id: `custom-${idx}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));

      setCurrentQuiz(formattedQuestions);
      setQuizStarted(true);
      setShowCustomLesson(false);
      setCustomTopic('');
      toast.success(selectedTutor === 'abdul' ? 'Lesson tayar hai!' : 'Lesson ready!');
    } catch (error) {
      console.error('Error generating lesson:', error);
      toast.error(selectedTutor === 'abdul' ? 'Error: Lesson nahi bana' : 'Error generating lesson');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!quizStarted) {
    if (showCustomLesson) {
      return (
        <div className="p-4 h-full">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setShowCustomLesson(false)}>
              ← {selectedTutor === 'abdul' ? 'Wapas' : 'Back'}
            </Button>
          </div>

          <Card className="finmate-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Plus className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {selectedTutor === 'abdul' ? 'Naya Lesson Banayein' : 'Create Custom Lesson'}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="topic">
                  {selectedTutor === 'abdul' ? 'Topic' : 'Topic'}
                </Label>
                <Input
                  id="topic"
                  placeholder={selectedTutor === 'abdul' ? 'Jaise: Bitcoin basics, Stock trading, etc.' : 'e.g., Bitcoin basics, Stock trading, etc.'}
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="questions">
                  {selectedTutor === 'abdul' ? 'Kitne Sawal?' : 'Number of Questions'}
                </Label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger id="questions" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 {selectedTutor === 'abdul' ? 'sawal' : 'questions'}</SelectItem>
                    <SelectItem value="5">5 {selectedTutor === 'abdul' ? 'sawal' : 'questions'}</SelectItem>
                    <SelectItem value="10">10 {selectedTutor === 'abdul' ? 'sawal' : 'questions'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">
                  {selectedTutor === 'abdul' ? 'Difficulty Level' : 'Difficulty Level'}
                </Label>
                <Select value={difficulty} onValueChange={(val) => setDifficulty(val as any)}>
                  <SelectTrigger id="difficulty" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">
                      {selectedTutor === 'abdul' ? 'Beginner (Aasaan)' : 'Beginner'}
                    </SelectItem>
                    <SelectItem value="intermediate">
                      {selectedTutor === 'abdul' ? 'Intermediate (Thoda Mushkil)' : 'Intermediate'}
                    </SelectItem>
                    <SelectItem value="expert">
                      {selectedTutor === 'abdul' ? 'Expert (Mushkil)' : 'Expert'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="finmate" 
                className="w-full"
                onClick={generateCustomLesson}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {selectedTutor === 'abdul' ? 'Ban raha hai...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {selectedTutor === 'abdul' ? 'Lesson Banayein' : 'Generate Lesson'}
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="p-4 h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Learn with Quizzes</h2>
          </div>
        </div>

        {/* Tutor Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">Choose Your Tutor</h3>
          <div className="flex gap-3">
            {['abdul', 'john'].map((tutor) => (
              <Button
                key={tutor}
                variant={selectedTutor === tutor ? 'finmate' : 'outline'}
                onClick={() => setSelectedTutor(tutor as 'abdul' | 'john')}
                className="flex items-center gap-2"
              >
                <TutorAvatar tutor={tutor as 'abdul' | 'john'} size="sm" />
                <span className="capitalize">{tutor}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Lesson Button */}
        <div className="mb-4">
          <Card 
            className="finmate-card p-4 cursor-pointer hover:shadow-md transition-all duration-200 border-2 border-primary/20"
            onClick={() => setShowCustomLesson(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {selectedTutor === 'abdul' ? 'Apna Lesson Banayein' : 'Create Custom Lesson'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedTutor === 'abdul' ? 'AI se questions generate karen' : 'AI-powered question generation'}
                </p>
              </div>
              <Settings className="w-5 h-5 text-primary" />
            </div>
          </Card>
        </div>

        {/* Quiz Topics */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Pre-made Topics</h3>
          {quizTopics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="finmate-card p-4 cursor-pointer hover:shadow-md transition-all duration-200"
                onClick={() => startQuiz(topic.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{topic.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedTutor === 'abdul' ? '2 sawal' : '2 questions'} • 
                      {selectedTutor === 'abdul' ? ' 1 minute' : ' 1 minute'}
                    </p>
                  </div>
                  <PlayCircle className="w-5 h-5 text-primary" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / currentQuiz.length) * 100);
    
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Card className="finmate-card p-6 max-w-sm">
            <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {selectedTutor === 'abdul' ? 'Quiz Mukammal!' : 'Quiz Complete!'}
            </h3>
            <p className="text-3xl font-bold text-primary mb-2">{percentage}%</p>
            <p className="text-muted-foreground mb-4">
              {score} out of {currentQuiz.length} correct
            </p>
            <div className="space-y-2">
              <Button variant="finmate" onClick={resetQuiz} className="w-full">
                {selectedTutor === 'abdul' ? 'Naya Quiz' : 'New Quiz'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = currentQuiz[currentQuestionIndex];

  return (
    <div className="p-4 h-full">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {currentQuiz.length}
          </span>
          <div className="flex items-center gap-2">
            <TutorAvatar tutor={selectedTutor} size="sm" />
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showExplanation ? (
          <motion.div
            key="question"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="finmate-card p-6 mb-6">
              <h3 className="text-lg font-medium mb-6 leading-relaxed">
                {currentQuestion.question}
              </h3>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? 'finmate' : 'outline'}
                    className="w-full text-left justify-start p-4 h-auto"
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <span className="mr-3 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </Button>
                ))}
              </div>
            </Card>

            <Button 
              variant="finmate" 
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="w-full"
            >
              {selectedTutor === 'abdul' ? 'Jawab Check Karen' : 'Check Answer'}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="explanation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="finmate-card p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
                <span className="font-medium">
                  {selectedAnswer === currentQuestion.correctAnswer
                    ? (selectedTutor === 'abdul' ? 'Sahi Jawab!' : 'Correct!')
                    : (selectedTutor === 'abdul' ? 'Galat Jawab' : 'Incorrect')
                  }
                </span>
              </div>
              
              <p className="text-muted-foreground mb-4">{currentQuestion.explanation}</p>
              
              <Button variant="ghost" size="sm" className="text-xs">
                <PlayCircle className="w-3 h-3 mr-1" />
                {selectedTutor === 'abdul' ? 'Voice Suniye' : 'Play Voice'}
              </Button>
            </Card>

            <Button variant="finmate" onClick={handleContinue} className="w-full">
              {currentQuestionIndex < currentQuiz.length - 1
                ? (selectedTutor === 'abdul' ? 'Agla Sawal' : 'Next Question')
                : (selectedTutor === 'abdul' ? 'Results Dekhiye' : 'View Results')
              }
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};