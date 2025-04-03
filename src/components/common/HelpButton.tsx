import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Fab,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Zoom,
  useTheme
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import InfoIcon from '@mui/icons-material/Info';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { useHelp } from '../../context/HelpContext';

interface HelpButtonProps {
  variant?: 'floating' | 'icon' | 'text';
  currentPage?: 'dashboard' | 'employees' | 'departments' | 'positions' | 'reports' | 'settings';
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'inherit';
}

const HelpButton: React.FC<HelpButtonProps> = ({
  variant = 'floating',
  currentPage = 'dashboard',
  size = 'medium',
  showTooltip = true,
  color = 'primary'
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { startTour } = useHelp();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTourStart = () => {
    handleClose();
    
    // Start the appropriate tour based on currentPage
    switch (currentPage) {
      case 'dashboard':
        startTour('dashboardTour');
        break;
      case 'employees':
        startTour('employeesTour');
        break;
      case 'departments':
        startTour('departmentsTour');
        break;
      case 'positions':
        startTour('positionsTour');
        break;
      default:
        startTour('dashboardTour');
    }
  };

  // Component to render based on variant
  const renderButton = () => {
    switch (variant) {
      case 'floating':
        return (
          <Fab
            color={color}
            aria-label="help"
            size={size}
            onClick={handleClick}
            sx={{
              position: 'fixed',
              bottom: theme.spacing(4),
              right: theme.spacing(4),
              zIndex: 1000,
              boxShadow: 3,
            }}
          >
            <HelpOutlineIcon />
          </Fab>
        );
      case 'icon':
        return (
          <IconButton
            color={color}
            aria-label="help"
            size={size}
            onClick={handleClick}
          >
            <HelpOutlineIcon />
          </IconButton>
        );
      case 'text':
        return (
          <Button
            variant="outlined"
            color={color}
            startIcon={<HelpOutlineIcon />}
            onClick={handleClick}
            size={size}
          >
            {t('common.help')}
          </Button>
        );
      default:
        return (
          <IconButton
            color={color}
            aria-label="help"
            size={size}
            onClick={handleClick}
          >
            <HelpOutlineIcon />
          </IconButton>
        );
    }
  };

  const buttonWithTooltip = showTooltip ? (
    <Tooltip
      title={t('help.tooltip')}
      arrow
      placement="left"
      TransitionComponent={Zoom}
    >
      {renderButton()}
    </Tooltip>
  ) : (
    renderButton()
  );

  return (
    <>
      {buttonWithTooltip}
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 220,
            overflow: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              bottom: -10,
              right: 14,
              width: 20,
              height: 20,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {t('help.needHelp')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('help.chooseOption')}
          </Typography>
        </Box>
        
        <MenuItem onClick={handleTourStart} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <SchoolIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={t('help.startTour')}
            secondary={t('help.tourDescription')}
            primaryTypographyProps={{
              variant: 'subtitle2',
            }}
            secondaryTypographyProps={{
              variant: 'caption',
            }}
          />
        </MenuItem>
        
        <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <QuizIcon fontSize="small" color="secondary" />
          </ListItemIcon>
          <ListItemText
            primary={t('help.frequentQuestions')}
            secondary={t('help.faqDescription')}
            primaryTypographyProps={{
              variant: 'subtitle2',
            }}
            secondaryTypographyProps={{
              variant: 'caption',
            }}
          />
        </MenuItem>
        
        <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <InfoIcon fontSize="small" sx={{ color: theme.palette.info.main }} />
          </ListItemIcon>
          <ListItemText
            primary={t('help.documentation')}
            secondary={t('help.documentationDescription')}
            primaryTypographyProps={{
              variant: 'subtitle2',
            }}
            secondaryTypographyProps={{
              variant: 'caption',
            }}
          />
        </MenuItem>
        
        <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <TipsAndUpdatesIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
          </ListItemIcon>
          <ListItemText
            primary={t('help.tips')}
            secondary={t('help.tipsDescription')}
            primaryTypographyProps={{
              variant: 'subtitle2',
            }}
            secondaryTypographyProps={{
              variant: 'caption',
            }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};

export default HelpButton;