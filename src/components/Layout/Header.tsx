import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Navbar, 
  Button, 
  Switch, 
  Dropdown, 
  Text, 
  Avatar,
  Input
} from '@nextui-org/react';
import { 
  Moon as MoonIcon, 
  Sun as SunIcon, 
  Search as SearchIcon
} from 'react-feather';

import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { setLanguage } = useApp();
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState('');

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  return (
    <Navbar
      variant="static"
      isBordered={false}
      css={{
        backgroundColor: theme === 'dark' ? '$gray900' : '$white',
        borderBottom: '1px solid',
        borderColor: theme === 'dark' ? '$gray800' : '$gray200',
        backdropFilter: 'blur(10px)',
        zIndex: 100
      }}
    >
      <Navbar.Content>
        <Input
          clearable
          contentLeft={<SearchIcon size={16} />}
          placeholder={t('common.search')}
          css={{ 
            minWidth: '300px',
            backgroundColor: theme === 'dark' ? '$gray800' : '$gray100',
          }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </Navbar.Content>

      <Navbar.Content>
        <Dropdown>
          <Dropdown.Button light>
            <Text>{t(`settings.languages.${i18n.language}`)}</Text>
          </Dropdown.Button>
          <Dropdown.Menu
            aria-label="Language selection"
            onAction={(key) => handleLanguageChange(key as string)}
          >
            <Dropdown.Item key="en">{t('settings.languages.en')}</Dropdown.Item>
            <Dropdown.Item key="fr">{t('settings.languages.fr')}</Dropdown.Item>
            <Dropdown.Item key="ar">{t('settings.languages.ar')}</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Switch
          checked={theme === 'dark'}
          onChange={toggleTheme}
          size="sm"
          icon={theme === 'dark' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
        />

        {user && (
          <Dropdown placement="bottom-right">
            <Dropdown.Trigger>
              <Avatar
                bordered
                size="sm"
                as="button"
                color="primary"
                text={user.name.charAt(0).toUpperCase()}
              />
            </Dropdown.Trigger>
            <Dropdown.Menu aria-label="User menu">
              <Dropdown.Item key="profile">
                <Text b>{user.name}</Text>
                <Text>{user.role}</Text>
              </Dropdown.Item>
              <Dropdown.Item key="settings" withDivider>
                {t('nav.settings')}
              </Dropdown.Item>
              <Dropdown.Item key="logout" withDivider color="error">
                {t('auth.logout')}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </Navbar.Content>
    </Navbar>
  );
};

export default Header;
