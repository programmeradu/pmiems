import React from 'react';
import { Card, Text } from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  Users as UsersIcon,
  Briefcase as BriefcaseIcon,
  Award as AwardIcon
} from 'react-feather';

import { useTheme } from '../../context/ThemeContext';

interface StatCardProps {
  title: string;
  value: string;
  icon: 'users' | 'briefcase' | 'award';
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const { theme } = useTheme();

  const renderIcon = () => {
    switch (icon) {
      case 'users':
        return <UsersIcon size={24} />;
      case 'briefcase':
        return <BriefcaseIcon size={24} />;
      case 'award':
        return <AwardIcon size={24} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card
        variant="flat"
        css={{
          background: theme === 'dark' ? '$gray800' : '$gray100',
          padding: '1.5rem',
          height: '100%',
          borderRadius: '12px',
          boxShadow: theme === 'dark' 
            ? '0 4px 14px 0 rgba(0, 0, 0, 0.2)' 
            : '0 4px 14px 0 rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${theme === 'dark' ? '#2D2D2D' : '#E9E9E9'}`
        }}
      >
        <div className="flex items-center">
          <div 
            style={{ 
              backgroundColor: `${color}20`, 
              color: color, 
              borderRadius: '12px',
              padding: '12px'
            }}
          >
            {renderIcon()}
          </div>
          <div className="ml-4">
            <Text css={{ color: theme === 'dark' ? '$gray400' : '$gray600' }}>{title}</Text>
            <Text h3 css={{ marginTop: '0.25rem' }}>{value}</Text>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default StatCard;
