import { useState } from 'react';
import { motion } from 'framer-motion';
import { TabNavigation } from '@/components/TabNavigation';
import { AITutor } from '@/components/AITutor';
import { Markets } from '@/components/Markets';
import { Learn } from '@/components/Learn';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'tutor' | 'markets' | 'learn'>('tutor');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'tutor':
        return <AITutor />;
      case 'markets':
        return <Markets />;
      case 'learn':
        return <Learn />;
      default:
        return <AITutor />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md md:max-w-3xl lg:max-w-5xl mx-auto bg-transparent">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 text-center"
      >
        <h1 className="finmate-gradient-text text-2xl font-bold mb-1">
          FinMate
        </h1>
        <p className="text-sm text-muted-foreground">
          AI Stock & Crypto Learning Companion
        </p>
      </motion.header>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <motion.main 
        className="flex-1 overflow-hidden"
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderActiveTab()}
      </motion.main>

      {/* Footer */}
      <footer className="p-4 text-center border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <p className="text-xs text-muted-foreground">
          Made with 💙 for Pakistani learners • Educational purposes only
        </p>
      </footer>
    </div>
  );
};

export default Index;
