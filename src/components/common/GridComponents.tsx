import React, { ReactNode } from 'react';
import { Grid as MuiGrid } from '@mui/material';

interface GridProps {
  children: ReactNode;
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
  spacing?: number;
  container?: boolean;
}

/**
 * GridContainer component
 * A wrapper for MuiGrid that automatically sets the container prop
 */
export const GridContainer: React.FC<GridProps> = ({ 
  children, 
  spacing = 2,
  ...props 
}) => {
  return (
    <MuiGrid container spacing={spacing} {...props}>
      {children}
    </MuiGrid>
  );
};

/**
 * GridItem component
 * A wrapper for MuiGrid that handles the 'item' prop correctly for Material UI v5
 */
export const GridItem: React.FC<GridProps> = ({ 
  children, 
  xs = 12,
  md,
  lg,
  xl,
  ...props 
}) => {
  return (
    <MuiGrid item {...props} xs={xs} md={md} lg={lg} xl={xl}>
      {children}
    </MuiGrid>
  );
};