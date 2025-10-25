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
       <h1 className="text-2xl font-bold mb-1">
  <span className="text-blue-600">Fin</span>
  <span className="text-red-500">Mate</span>
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

<footer className="py-5 px-6 border-t border-border/50 bg-card/40 backdrop-blur-md text-center">
  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
    By 
    <img
      src="/team_logo.png"
      alt="Team Logo"
      className="h-6 w-auto object-contain mx-1"
    />
    for Pakistani learners • Educational purposes only
  </p>
</footer>



    </div>
  );
};

export default Index;
