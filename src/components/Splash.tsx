import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';

interface Props {
  onFinish: () => void;
}

export const Splash = ({ onFinish }: Props) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 4000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    /* flexGrow={1} ocupa toda la terminal. 
       Añadimos width="100%" para asegurar el eje horizontal */
    <Box 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        flexGrow={1}
        width="100%"
        borderStyle="round" 
        borderColor="cyan"
        paddingBottom={2}
    >
        <Gradient name="summer"  >
          {/* align="center" aquí centra el ASCII dentro de su propio bloque */}
          <BigText text="Job Tracker" font="chrome" />
        </Gradient>
        
        <Text italic color="cyan">Iniciando motor de scraping...</Text>

    </Box>
  );
};