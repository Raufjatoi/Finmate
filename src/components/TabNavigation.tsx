import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageCircle, TrendingUp, BookOpen } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'tutor' | 'markets' | 'learn';
  onTabChange: (tab: 'tutor' | 'markets' | 'learn') => void;
}

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  const tabs = [
    { id: 'tutor' as const, label: 'AI Tutor', icon: MessageCircle },
    { id: 'markets' as const, label: 'Markets', icon: TrendingUp },
    { id: 'learn' as const, label: 'Learn', icon: BookOpen }
  ];

  return (
    <div className="flex justify-center p-4 bg-card/30 backdrop-blur-sm border-b border-border/50">
      <div className="flex gap-2 bg-card/50 p-1 rounded-xl shadow-sm backdrop-blur-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant={isActive ? 'tab-active' : 'tab'}
              size="sm"
              onClick={() => onTabChange(tab.id)}
              className="flex items-center gap-2 min-w-[80px] relative"
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};