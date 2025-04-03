import React, { useState } from 'react';
import {
  Tooltip,
  TooltipProps,
  IconButton,
  Typography,
  Box,
  Paper,
  Fade,
  ClickAwayListener
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from 'react-i18next';
// Define types and components for help content
export interface HelpContentSection {
  title: string;
  content: string;
  tip1?: string;
  tip2?: string;
  step1?: string;
  step2?: string;
  step3?: string;
  step4?: string;
}

export interface HelpContentProps {
  section: HelpContentSection;
}

export const HelpContent: React.FC<HelpContentProps> = ({ section }) => {
  // Extract tips and steps
  const tips = [section.tip1, section.tip2].filter(Boolean);
  const steps = [section.step1, section.step2, section.step3, section.step4].filter(Boolean);
  
  return (
    <Box>
      <Typography variant="body2" sx={{ mb: (tips.length || steps.length) ? 1 : 0 }}>
        {section.content}
      </Typography>
      
      {tips.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
            Tips:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {tips.map((tip, index) => (
              <Typography key={index} component="li" variant="body2" sx={{ mb: 0.5 }}>
                {tip}
              </Typography>
            ))}
          </Box>
        </Box>
      )}
      
      {steps.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
            Steps:
          </Typography>
          <Box component="ol" sx={{ m: 0, pl: 3 }}>
            {steps.map((step, index) => (
              <Typography key={index} component="li" variant="body2" sx={{ mb: 0.5 }}>
                {step}
              </Typography>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Hook to access help content from i18n
export const useHelpContent = () => {
  const { t } = useTranslation();
  return t('help', { returnObjects: true }) as Record<string, Record<string, HelpContentSection>>;
};

// Enhanced tooltip styling
const HelpTooltipContent = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: 350,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  '& .MuiTypography-h6': {
    marginBottom: theme.spacing(1),
    fontSize: '1rem',
    fontWeight: 600,
  },
  '& .MuiTypography-body2': {
    fontSize: '0.85rem',
    color: theme.palette.text.secondary,
  }
}));

interface HelpTooltipProps {
  title?: string;
  content?: string | React.ReactNode;
  placement?: TooltipProps['placement'];
  icon?: 'help' | 'info';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'inherit';
  size?: 'small' | 'medium';
  iconSize?: 'small' | 'medium' | 'large' | 'inherit'; // Added iconSize prop
  contentSection?: HelpContentSection;
  helpKey?: string;
  iconOnly?: boolean;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title = '',
  content = '',
  placement = 'right',
  icon = 'help',
  color = 'primary',
  size = 'small',
  iconSize,  // Added iconSize
  contentSection,
  helpKey,
  iconOnly = true
}) => {
  const [open, setOpen] = useState(false);
  const helpContent = useHelpContent();

  // Find the appropriate section if helpKey is provided
  const findSection = (): HelpContentSection | undefined => {
    if (!helpKey) return undefined;
    
    // Parse the key (e.g., "employees.list" => helpContent.employees.list)
    const parts = helpKey.split('.');
    if (parts.length !== 2) return undefined;
    
    const [category, item] = parts;
    // Use type assertion to help TypeScript understand the structure
    return helpContent && 
      typeof helpContent === 'object' && 
      category in helpContent ? 
      (helpContent as any)[category]?.[item] : undefined;
  };

  // Determine which section to use
  const section = contentSection || findSection();

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const tooltipContent = (
    <Box>
      {section ? (
        <HelpTooltipContent>
          <Typography variant="h6" color={`${color}.main`}>{section.title}</Typography>
          <HelpContent section={section} />
        </HelpTooltipContent>
      ) : (
        <HelpTooltipContent>
          <Typography variant="h6" color={`${color}.main`}>{title}</Typography>
          {typeof content === 'string' ? (
            <Typography variant="body2">{content}</Typography>
          ) : (
            content
          )}
        </HelpTooltipContent>
      )}
    </Box>
  );

  const IconComponent = icon === 'help' ? HelpOutlineIcon : InfoOutlinedIcon;

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <div>
        <Tooltip
          open={open}
          onClose={handleTooltipClose}
          title={tooltipContent}
          placement={placement}
          arrow
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 300 }}
          PopperProps={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 8],
                },
              },
            ],
          }}
        >
          {iconOnly ? (
            <IconButton
              size={size}
              color={color}
              onClick={handleTooltipOpen}
              sx={{
                padding: size === 'small' ? '4px' : '8px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <IconComponent fontSize={iconSize || size} />
            </IconButton>
          ) : (
            <Box
              component="span"
              onClick={handleTooltipOpen}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <Box 
                component={IconComponent}
                fontSize={iconSize || size}
                sx={{ 
                  ml: 0.5, 
                  opacity: 0.7,
                  color: color === 'inherit' ? 'text.primary' : `${color}.main`
                }}
              />
            </Box>
          )}
        </Tooltip>
      </div>
    </ClickAwayListener>
  );
};

export default HelpTooltip;