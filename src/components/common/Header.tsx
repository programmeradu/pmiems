import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className={`h-16 flex items-center justify-between px-6 
      ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
      border-b shadow-sm`}
    >
      {title && (
        <h1 className="text-xl font-semibold">{title}</h1>
      )}
      
      <div className="flex items-center">
        <div className={`relative rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('common.search')}
            className={`block w-full pl-10 pr-3 py-2 border-none focus:outline-none focus:ring-0 sm:text-sm ${
              theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
            }`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;