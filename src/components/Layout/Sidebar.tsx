import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Text, Button, Spacer, Badge } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { 
  Home as HomeIcon,
  Users as UsersIcon,
  Briefcase as BriefcaseIcon,
  Award as AwardIcon,
  FileText as FileTextIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon
} from 'react-feather';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { name: t('nav.dashboard'), path: '/', icon: <HomeIcon size={20} /> },
    { name: t('nav.employees'), path: '/employees', icon: <UsersIcon size={20} /> },
    { name: t('nav.departments'), path: '/departments', icon: <BriefcaseIcon size={20} /> },
    { name: t('nav.positions'), path: '/positions', icon: <AwardIcon size={20} /> },
    { name: t('nav.reports'), path: '/reports', icon: <FileTextIcon size={20} /> },
    { name: t('nav.settings'), path: '/settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className={`sidebar ${theme} h-full flex flex-col`}>
      <div className="logo-container p-6 text-center">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Text h3 css={{ color: theme === 'dark' ? '$white' : '$black' }}>
            {t('app.title')}
          </Text>
        </motion.div>
        <Badge color="success" variant="bordered">
          Admin
        </Badge>
      </div>

      <Spacer y={2} />

      <div className="flex-grow">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            light
            auto
            icon={item.icon}
            css={{
              width: '100%',
              justifyContent: 'flex-start',
              backgroundColor: isActive(item.path) 
                ? theme === 'dark' ? '$gray800' : '$gray100' 
                : 'transparent',
              borderLeft: isActive(item.path) 
                ? '4px solid $primary' 
                : '4px solid transparent',
              borderRadius: '0',
              padding: '0.75rem 1rem',
              color: isActive(item.path) 
                ? '$primary' 
                : theme === 'dark' ? '$gray300' : '$gray700',
              '&:hover': {
                backgroundColor: theme === 'dark' ? '$gray800' : '$gray100'
              }
            }}
            onClick={() => navigate(item.path)}
          >
            <div className="flex items-center">
              {item.icon}
              <Text css={{ marginLeft: '0.5rem' }}>{item.name}</Text>
            </div>
          </Button>
        ))}
      </div>

      <div className="mt-auto p-4">
        <Button
          light
          auto
          icon={<LogOutIcon size={20} />}
          css={{
            width: '100%',
            justifyContent: 'flex-start',
            color: theme === 'dark' ? '$gray300' : '$gray700',
            '&:hover': {
              backgroundColor: theme === 'dark' ? '$gray800' : '$gray100'
            }
          }}
          onClick={handleLogout}
        >
          <Text css={{ marginLeft: '0.5rem' }}>{t('auth.logout')}</Text>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
