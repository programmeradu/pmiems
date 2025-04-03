import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Paper,
  Slide,
  StepContent,
  useTheme
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';

// Define the transition for the dialog
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export interface TourStep {
  title: string;
  content: string | React.ReactNode;
  image?: string;
}

interface GuidedTourProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  steps: TourStep[];
  tourName: string;
}

const GuidedTour: React.FC<GuidedTourProps> = ({
  open,
  onClose,
  onComplete,
  steps,
  tourName
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setCompleted(false);
    }
  }, [open]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prevStep) => prevStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFinish = () => {
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      maxWidth="sm"
      fullWidth
      onClose={(_, reason) => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
          onClose();
        }
      }}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          overflow: 'visible',
        },
      }}
    >
      <DialogTitle sx={{ px: 3, pt: 3, pb: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <EmojiObjectsIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="span">
              {completed ? t('guidedTour.completed') : t('guidedTour.title', { tourName })}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {completed ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'success.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <CheckCircleIcon fontSize="large" sx={{ color: 'white' }} />
            </Box>
            <Typography variant="h5" gutterBottom>
              {t('guidedTour.congratulations')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('guidedTour.completedDescription', { tourName })}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mt: 1 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={index} completed={index < activeStep}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        color: index <= activeStep ? 'primary.main' : 'gray',
                      },
                    }}
                  >
                    <Typography fontWeight="medium">{step.title}</Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ my: 1 }}>
                      {typeof step.content === 'string' ? (
                        <Typography variant="body2" color="text.secondary">
                          {step.content}
                        </Typography>
                      ) : (
                        step.content
                      )}
                    </Box>
                    {step.image && (
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 1, 
                          mb: 2, 
                          backgroundColor: 'background.default',
                          borderRadius: 1,
                          borderStyle: 'solid',
                          borderWidth: 1,
                          borderColor: 'divider'
                        }}
                      >
                        <Box
                          component="img"
                          src={step.image}
                          alt={step.title}
                          sx={{
                            display: 'block',
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: 1
                          }}
                        />
                      </Paper>
                    )}
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <LightbulbIcon fontSize="small" sx={{ color: 'warning.main', mr: 1 }} />
                      <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                        {t('guidedTour.tip', { index: index + 1 })}
                      </Typography>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {completed ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleFinish}
            disableElevation
            endIcon={<CheckCircleIcon />}
            fullWidth
          >
            {t('guidedTour.finishTour')}
          </Button>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Box>
              <Button
                color="inherit"
                onClick={handleSkip}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
              >
                {t('guidedTour.skipTour')}
              </Button>
            </Box>
            <Box>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
                startIcon={<NavigateBeforeIcon />}
              >
                {t('common.back')}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disableElevation
                endIcon={activeStep === steps.length - 1 ? <CheckCircleIcon /> : <NavigateNextIcon />}
              >
                {activeStep === steps.length - 1
                  ? t('guidedTour.finish')
                  : t('guidedTour.next')}
              </Button>
            </Box>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default GuidedTour;