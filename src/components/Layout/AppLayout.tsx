import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Card, Grid } from '@nextui-org/react';
import { motion } from 'framer-motion';

import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import Header from './Header';
import Sidebar from './Sidebar';

const AppLayout: React.FC = () => {
  const { theme } = useTheme();
  const { isRTL } = useApp();

  return (
    <div className={`app-container ${theme} ${isRTL ? 'rtl' : 'ltr'}`}>
      <Grid.Container gap={0} className="h-screen">
        {/* Sidebar */}
        <Grid xs={2} sm={2} md={2} lg={2} xl={2} className="sidebar-container">
          <Sidebar />
        </Grid>

        {/* Main Content */}
        <Grid xs={10} sm={10} md={10} lg={10} xl={10} className="content-container">
          <div className="flex flex-col h-full">
            <Header />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="flex-grow overflow-auto p-6"
            >
              <Container fluid>
                <Card
                  variant="bordered"
                  css={{
                    background: theme === 'dark' ? '$gray900' : '$white',
                    padding: '1.5rem',
                    boxShadow: theme === 'dark' 
                      ? '0 4px 14px 0 rgba(0, 0, 0, 0.3)' 
                      : '0 4px 14px 0 rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: 'none'
                  }}
                >
                  <Card.Body>
                    <Outlet />
                  </Card.Body>
                </Card>
              </Container>
            </motion.div>
          </div>
        </Grid>
      </Grid.Container>
    </div>
  );
};

export default AppLayout;
