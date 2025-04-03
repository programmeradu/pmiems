import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Text, 
  Grid, 
  Spacer, 
  Radio, 
  Button,
  Divider,
  Switch,
  Dropdown
} from '@nextui-org/react';
import { motion } from 'framer-motion';
import { 
  Moon as MoonIcon, 
  Sun as SunIcon,
  Monitor as MonitorIcon,
  Globe as GlobeIcon,
  Info as InfoIcon
} from 'react-feather';

import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, direction } = useApp();
  
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(
    theme === 'light' ? 'light' : 'dark'
  );
  
  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setLanguage(lang);
  };
  
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setSelectedTheme(newTheme);
    
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    } else {
      setTheme(newTheme);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Text h2>{t('settings.title')}</Text>
      <Spacer y={1} />
      
      <Grid.Container gap={2}>
        <Grid xs={12} md={6}>
          <Card
            variant="bordered"
            css={{
              backgroundColor: theme === 'dark' ? '$gray800' : '$gray50',
              height: '100%',
              padding: '1.5rem'
            }}
          >
            <Card.Header>
              <div className="flex items-center">
                <GlobeIcon size={20} className="mr-2" />
                <Text h4>{t('settings.language')}</Text>
              </div>
            </Card.Header>
            <Divider />
            <Card.Body>
              <div className="mt-4">
                <Dropdown>
                  <Dropdown.Button flat>
                    <div className="flex items-center">
                      <GlobeIcon size={16} className="mr-2" />
                      <Text>{t(`settings.languages.${selectedLanguage}`)}</Text>
                    </div>
                  </Dropdown.Button>
                  <Dropdown.Menu
                    aria-label="Language selection"
                    onAction={(key) => handleLanguageChange(key as string)}
                    selectedKeys={[selectedLanguage]}
                    selectionMode="single"
                  >
                    <Dropdown.Item key="en">
                      <div className="flex items-center">
                        <Text>{t('settings.languages.en')}</Text>
                        {selectedLanguage === 'en' && (
                          <div className="ml-2 text-primary">✓</div>
                        )}
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Item key="fr">
                      <div className="flex items-center">
                        <Text>{t('settings.languages.fr')}</Text>
                        {selectedLanguage === 'fr' && (
                          <div className="ml-2 text-primary">✓</div>
                        )}
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Item key="ar">
                      <div className="flex items-center">
                        <Text>{t('settings.languages.ar')}</Text>
                        {selectedLanguage === 'ar' && (
                          <div className="ml-2 text-primary">✓</div>
                        )}
                      </div>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              
              <div className="mt-8">
                <Text>{t('settings.direction')}: {direction.toUpperCase()}</Text>
                <Text small css={{ color: '$accents6', marginTop: '0.5rem' }}>
                  <InfoIcon size={12} className="inline mr-1" />
                  {t('settings.directionNote')}
                </Text>
              </div>
            </Card.Body>
          </Card>
        </Grid>
        
        <Grid xs={12} md={6}>
          <Card
            variant="bordered"
            css={{
              backgroundColor: theme === 'dark' ? '$gray800' : '$gray50',
              height: '100%',
              padding: '1.5rem'
            }}
          >
            <Card.Header>
              <div className="flex items-center">
                {theme === 'dark' ? (
                  <MoonIcon size={20} className="mr-2" />
                ) : (
                  <SunIcon size={20} className="mr-2" />
                )}
                <Text h4>{t('settings.appearance')}</Text>
              </div>
            </Card.Header>
            <Divider />
            <Card.Body>
              <div className="mt-4">
                <Text b css={{ marginBottom: '1rem' }}>{t('settings.theme')}</Text>
                
                <div className="flex flex-col gap-3">
                  <div
                    className={`
                      p-4 rounded-lg cursor-pointer
                      ${selectedTheme === 'light' 
                        ? 'bg-blue-100 border border-blue-400 dark:bg-blue-900 dark:border-blue-800' 
                        : 'bg-gray-100 dark:bg-gray-800'
                      }
                    `}
                    onClick={() => handleThemeChange('light')}
                  >
                    <div className="flex items-center">
                      <SunIcon size={16} className="mr-2" />
                      <Text>{t('settings.lightMode')}</Text>
                    </div>
                  </div>
                  
                  <div
                    className={`
                      p-4 rounded-lg cursor-pointer
                      ${selectedTheme === 'dark' 
                        ? 'bg-blue-100 border border-blue-400 dark:bg-blue-900 dark:border-blue-800' 
                        : 'bg-gray-100 dark:bg-gray-800'
                      }
                    `}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <div className="flex items-center">
                      <MoonIcon size={16} className="mr-2" />
                      <Text>{t('settings.darkMode')}</Text>
                    </div>
                  </div>
                  
                  <div
                    className={`
                      p-4 rounded-lg cursor-pointer
                      ${selectedTheme === 'system' 
                        ? 'bg-blue-100 border border-blue-400 dark:bg-blue-900 dark:border-blue-800' 
                        : 'bg-gray-100 dark:bg-gray-800'
                      }
                    `}
                    onClick={() => handleThemeChange('system')}
                  >
                    <div className="flex items-center">
                      <MonitorIcon size={16} className="mr-2" />
                      <Text>{t('settings.systemPreference')}</Text>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center">
                  <Switch
                    checked={theme === 'dark'}
                    onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    size="lg"
                    icon={theme === 'dark' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
                  />
                  <Text css={{ marginLeft: '0.5rem' }}>
                    {theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}
                  </Text>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Grid>
        
        <Grid xs={12}>
          <Card
            variant="bordered"
            css={{
              backgroundColor: theme === 'dark' ? '$gray800' : '$gray50',
              height: '100%',
              padding: '1.5rem'
            }}
          >
            <Card.Header>
              <div className="flex items-center">
                <InfoIcon size={20} className="mr-2" />
                <Text h4>{t('settings.about')}</Text>
              </div>
            </Card.Header>
            <Divider />
            <Card.Body>
              <div className="mt-4">
                <Text h5>{t('app.title')}</Text>
                <Text css={{ color: '$accents6' }}>Version 1.0.0</Text>
                
                <Spacer y={1} />
                
                <Text>
                  {t('settings.aboutDescription')}
                </Text>
                
                <Spacer y={1} />
                
                <div className="flex flex-col gap-1">
                  <Text small><strong>{t('settings.developed')}:</strong> Your Company Name</Text>
                  <Text small><strong>{t('settings.poweredBy')}:</strong> Electron, React, TypeScript, SQLite</Text>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Grid>
      </Grid.Container>
    </motion.div>
  );
};

export default Settings;
