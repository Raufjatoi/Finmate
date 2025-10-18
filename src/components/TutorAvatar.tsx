import { motion } from 'framer-motion';

interface TutorAvatarProps {
  tutor: 'abdul' | 'john';
  size?: 'sm' | 'md' | 'lg';
}

export const TutorAvatar = ({ tutor, size = 'md' }: TutorAvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const colors = tutor === 'abdul' 
    ? 'bg-gradient-to-br from-blue-600 to-blue-800' 
    : 'bg-gradient-to-br from-red-600 to-red-800';

  return (
    <motion.div 
      className={`${sizeClasses[size]} ${colors} rounded-full flex items-center justify-center shadow-md`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-white font-bold text-lg">
        {tutor === 'abdul' ? 'A' : 'J'}
      </span>
    </motion.div>
  );
};