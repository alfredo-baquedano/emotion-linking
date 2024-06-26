import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../contexts/ThemeContext';
import { forwardRef } from 'react';

const ToggleColorMode = forwardRef(function ToggleColorMode(
  { showText = false, ...props },
  ref,
) {
  const { theme, toggleColorMode } = useTheme();

  return (
    <Box
      sx={{
        width: showText ? 200 : 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {showText &&
        `Modox ${
          {
            light: 'Claro',
            dark: 'Oscuro',
          }[theme.palette.mode]
        }`}
      <IconButton
        {...props}
        ref={ref}
        aria-label='Switch theme'
        sx={{ ml: 1 }}
        onClick={toggleColorMode}
        color='inherit'
      >
        {theme.palette.mode === 'dark' ? (
          <Brightness7Icon />
        ) : (
          <Brightness4Icon />
        )}
      </IconButton>
    </Box>
  );
});

export default ToggleColorMode;
